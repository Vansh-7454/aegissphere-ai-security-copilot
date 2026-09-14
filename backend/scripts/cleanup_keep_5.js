/**
 * cleanup_keep_5.js
 * Retains exactly 5 clean, high-quality, interconnected documents in each collection:
 * - 5 Users (including vansh74@gmail.com, user1@gmail.com, user2@gmail.com)
 * - 5 Logs (SSH Brute Force, SQL Injection, Command Injection, Port Sweep, Clean Baseline)
 * - 5 Threats (linked to the 5 logs)
 * - 5 Reports (linked to the 5 logs)
 * - 5 Incidents (diverse statuses: Open, Investigating, Mitigated, Resolved, Closed)
 * - 5 AdminAuditLogs
 * Purges all excess test artifacts from MongoDB Atlas and backend/uploads/.
 */

const path = require("path");
const fs = require("fs");
const mongoose = require("mongoose");
const dotenv = require("dotenv");

dotenv.config({ path: path.join(__dirname, "../.env") });

const MONGO_URI = process.env.MONGO_URI || process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/aegissphere";

const User = require("../src/models/User");
const Log = require("../src/models/Log");
const Threat = require("../src/models/Threat");
const Incident = require("../src/models/Incident");
const Report = require("../src/models/Report");
const AdminAuditLog = require("../src/models/AdminAuditLog");

const uploadsDir = path.resolve(__dirname, "../uploads");

async function cleanup() {
  console.log("Connecting to MongoDB Atlas...");
  await mongoose.connect(MONGO_URI);
  console.log("Connected to MongoDB Atlas.\n");

  // 1. SELECT 5 USERS TO KEEP
  const priorityEmails = ["vansh74@gmail.com", "user1@gmail.com", "user2@gmail.com"];
  const priorityUsers = await User.find({ email: { $in: priorityEmails } });
  const remainingNeeded = 5 - priorityUsers.length;
  const extraUsers = await User.find({ email: { $nin: priorityEmails } })
    .sort({ createdAt: -1 })
    .limit(remainingNeeded);

  const keptUsers = [...priorityUsers, ...extraUsers];
  const keptUserIds = keptUsers.map((u) => u._id);

  console.log("Retaining 5 Users:");
  keptUsers.forEach((u) => console.log(`  - [${u.role}] ${u.name} (${u.email})`));

  // Delete other users
  const delUsersResult = await User.deleteMany({ _id: { $nin: keptUserIds } });
  console.log(`Deleted ${delUsersResult.deletedCount} excess users.\n`);

  // Primary user for ownership
  const primaryAdmin = keptUsers.find((u) => u.email === "vansh74@gmail.com") || keptUsers[0];
  const primaryAnalyst = keptUsers.find((u) => u.email === "user1@gmail.com") || keptUsers[1] || keptUsers[0];

  // 2. IDENTIFY / SELECT 5 HIGH-VALUE LOGS WITH LINKED THREATS
  // We want: 1 SSH Brute Force, 1 SQLi, 1 RCE, 1 Port Sweep, 1 Clean Baseline
  const threatCategories = [
    { type: "SSH Brute Force", keyword: "brute" },
    { type: "SQL Injection", keyword: "sql" },
    { type: "Command Injection", keyword: "rce" },
    { type: "Network Port Sweep", keyword: "port" },
  ];

  const keptThreatIds = [];
  const keptLogIds = [];

  for (const cat of threatCategories) {
    const foundThreat = await Threat.findOne({
      _id: { $nin: keptThreatIds },
      threatType: { $regex: new RegExp(cat.keyword, "i") },
      logId: { $ne: null },
    }).sort({ createdAt: -1 });

    if (foundThreat && foundThreat.logId) {
      keptThreatIds.push(foundThreat._id);
      keptLogIds.push(foundThreat.logId);
    }
  }

  // Find 1 Clean Baseline log (threatCount === 0 or analysis === null)
  const cleanLog = await Log.findOne({
    _id: { $nin: keptLogIds },
    $or: [{ threatCount: 0 }, { analysis: null }],
  }).sort({ createdAt: -1 });

  if (cleanLog) {
    keptLogIds.push(cleanLog._id);
  }

  // Ensure we have exactly 5 logs; if not, backfill from latest
  if (keptLogIds.length < 5) {
    const backfillLogs = await Log.find({ _id: { $nin: keptLogIds } })
      .sort({ createdAt: -1 })
      .limit(5 - keptLogIds.length);
    backfillLogs.forEach((l) => keptLogIds.push(l._id));
  }

  // Ensure we have exactly 5 threats; if not, backfill from latest
  if (keptThreatIds.length < 5) {
    const backfillThreats = await Threat.find({ _id: { $nin: keptThreatIds } })
      .sort({ createdAt: -1 })
      .limit(5 - keptThreatIds.length);
    backfillThreats.forEach((t) => keptThreatIds.push(t._id));
  }

  // Trim to exact 5 if exceeded
  const finalLogIds = keptLogIds.slice(0, 5);
  const finalThreatIds = keptThreatIds.slice(0, 5);

  // Link preserved logs to valid kept users
  await Log.updateMany(
    { _id: { $in: finalLogIds }, uploadedBy: { $nin: keptUserIds } },
    { $set: { uploadedBy: primaryAnalyst._id } }
  );

  console.log("Retaining 5 Logs:");
  const keptLogs = await Log.find({ _id: { $in: finalLogIds } });
  keptLogs.forEach((l) => console.log(`  - ${l.originalName} (${l.fileFormat})`));

  console.log("\nRetaining 5 Threats:");
  const keptThreats = await Threat.find({ _id: { $in: finalThreatIds } });
  keptThreats.forEach((t) => console.log(`  - [${t.severity}] ${t.threatType}`));

  // 3. SELECT 5 REPORTS TO KEEP
  // Match to kept logs where possible, else latest
  const matchedReports = await Report.find({ logId: { $in: finalLogIds } })
    .sort({ createdAt: -1 })
    .limit(5);
  const keptReportIds = matchedReports.map((r) => r._id);

  if (keptReportIds.length < 5) {
    const extraReports = await Report.find({ _id: { $nin: keptReportIds } })
      .sort({ createdAt: -1 })
      .limit(5 - keptReportIds.length);
    extraReports.forEach((r) => keptReportIds.push(r._id));
  }
  const finalReportIds = keptReportIds.slice(0, 5);

  // Link reports to kept users
  await Report.updateMany(
    { _id: { $in: finalReportIds }, generatedBy: { $nin: keptUserIds } },
    { $set: { generatedBy: primaryAnalyst._id } }
  );

  console.log("\nRetaining 5 Reports:");
  const keptReportsDocs = await Report.find({ _id: { $in: finalReportIds } });
  keptReportsDocs.forEach((r) => console.log(`  - ${r.title}`));

  // 4. SELECT 5 INCIDENTS TO KEEP (Ensure diverse statuses)
  const candidateIncidents = await Incident.find({})
    .populate("threatId")
    .sort({ createdAt: -1 });

  const desiredStatuses = ["Open", "Investigating", "Mitigated", "Resolved", "Closed"];
  const finalIncidentIds = [];

  for (const status of desiredStatuses) {
    const match = candidateIncidents.find(
      (inc) => inc.status === status && !finalIncidentIds.includes(inc._id)
    );
    if (match) {
      finalIncidentIds.push(match._id);
    }
  }

  // If some statuses weren't found, backfill to 5
  if (finalIncidentIds.length < 5) {
    for (const inc of candidateIncidents) {
      if (!finalIncidentIds.includes(inc._id)) {
        finalIncidentIds.push(inc._id);
        if (finalIncidentIds.length === 5) break;
      }
    }
  }

  // Ensure kept incidents are assigned to valid kept users and linked to valid kept logs/threats
  for (let i = 0; i < finalIncidentIds.length; i++) {
    const incId = finalIncidentIds[i];
    const updateObj = {
      assignedTo: primaryAdmin._id,
      status: desiredStatuses[i % desiredStatuses.length], // Ensure clean status diversity
    };
    if (finalLogIds[i % finalLogIds.length]) {
      updateObj.logId = finalLogIds[i % finalLogIds.length];
    }
    if (finalThreatIds[i % finalThreatIds.length]) {
      updateObj.threatId = finalThreatIds[i % finalThreatIds.length];
    }
    await Incident.findByIdAndUpdate(incId, { $set: updateObj });
  }

  console.log("\nRetaining 5 Incidents:");
  const keptIncidentsDocs = await Incident.find({ _id: { $in: finalIncidentIds } });
  keptIncidentsDocs.forEach((i) => console.log(`  - [${i.status}] ${i.title}`));

  // 5. SELECT 5 ADMIN AUDIT LOGS
  const auditLogs = await AdminAuditLog.find({}).sort({ timestamp: -1 }).limit(5);
  const finalAuditLogIds = auditLogs.map((a) => a._id);
  console.log(`\nRetaining ${finalAuditLogIds.length} AdminAuditLogs.`);

  // 6. EXECUTE PURGE OF EXCESS RECORDS
  console.log("\n--- EXECUTING PURGE OF EXCESS RECORDS ---");
  const delLogs = await Log.deleteMany({ _id: { $nin: finalLogIds } });
  const delThreats = await Threat.deleteMany({ _id: { $nin: finalThreatIds } });
  const delReports = await Report.deleteMany({ _id: { $nin: finalReportIds } });
  const delIncidents = await Incident.deleteMany({ _id: { $nin: finalIncidentIds } });
  const delAuditLogs = await AdminAuditLog.deleteMany({ _id: { $nin: finalAuditLogIds } });

  console.log(`✓ Deleted ${delLogs.deletedCount} excess logs`);
  console.log(`✓ Deleted ${delThreats.deletedCount} excess threats`);
  console.log(`✓ Deleted ${delReports.deletedCount} excess reports`);
  console.log(`✓ Deleted ${delIncidents.deletedCount} excess incidents`);
  console.log(`✓ Deleted ${delAuditLogs.deletedCount} excess audit logs`);

  // 7. CLEANUP EXCESS UPLOADED FILES FROM DISK
  const preservedFilenames = new Set(keptLogs.map((l) => l.filename));
  if (fs.existsSync(uploadsDir)) {
    const filesOnDisk = fs.readdirSync(uploadsDir);
    let deletedFiles = 0;
    for (const f of filesOnDisk) {
      if (!preservedFilenames.has(f)) {
        try {
          fs.unlinkSync(path.join(uploadsDir, f));
          deletedFiles++;
        } catch (e) {}
      }
    }
    console.log(`✓ Cleaned ${deletedFiles} excess uploaded files from backend/uploads/`);
  }

  // 8. FINAL COUNT VERIFICATION
  console.log("\n================================================================================");
  console.log("CLEANUP VERIFICATION - EXACT 5 RECORDS PER COLLECTION:");
  console.log("Users:          ", await User.countDocuments());
  console.log("Logs:           ", await Log.countDocuments());
  console.log("Threats:        ", await Threat.countDocuments());
  console.log("Incidents:      ", await Incident.countDocuments());
  console.log("Reports:        ", await Report.countDocuments());
  console.log("AdminAuditLogs: ", await AdminAuditLog.countDocuments());
  console.log("================================================================================");

  await mongoose.disconnect();
}

cleanup().catch((err) => {
  console.error("Cleanup Error:", err);
  process.exit(1);
});
