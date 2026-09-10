/**
 * createAdmin.js
 * Secure server-side CLI script to provision an AegisSphere Administrator account.
 *
 * Usage:
 *   node scripts/createAdmin.js --email="admin@aegissphere.io" --name="SOC Administrator" --password="YourSecurePassword"
 *   OR
 *   ADMIN_EMAIL="admin@aegissphere.io" ADMIN_PASSWORD="YourSecurePassword" npm run create-admin
 */

const path = require("path");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const readline = require("readline");
const dotenv = require("dotenv");

dotenv.config({ path: path.join(__dirname, "../.env") });

const User = require("../src/models/User");
const AdminAuditLog = require("../src/models/AdminAuditLog");

// Helper to parse CLI arguments
const parseArgs = () => {
  const args = {};
  const argv = process.argv.slice(2);
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (arg.startsWith("--")) {
      if (arg.includes("=")) {
        const [key, ...rest] = arg.slice(2).split("=");
        const value = rest.join("=");
        args[key] = value ? value.replace(/^["']|["']$/g, "") : true;
      } else {
        const key = arg.slice(2);
        const nextArg = argv[i + 1];
        if (nextArg && !nextArg.startsWith("--")) {
          args[key] = nextArg.replace(/^["']|["']$/g, "");
          i++;
        } else {
          args[key] = true;
        }
      }
    }
  }
  return args;
};

// Helper for interactive prompt
const promptInput = (question, isPassword = false) => {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      rl.close();
      resolve(answer.trim());
    });
  });
};

async function main() {
  const args = parseArgs();

  let name = args.name || process.env.ADMIN_NAME;
  let email = args.email || process.env.ADMIN_EMAIL;
  let password = args.password || process.env.ADMIN_PASSWORD;

  if (typeof email !== "string" || typeof password !== "string") {
    console.log("\n🔐 AegisSphere Admin Account Provisioning CLI\n");
    if (!name || typeof name !== "string") name = (await promptInput("Enter Admin Full Name (default: Platform Admin): ")) || "Platform Admin";
    if (!email || typeof email !== "string") email = await promptInput("Enter Admin Email: ");
    if (!password || typeof password !== "string") password = await promptInput("Enter Admin Password (min 6 chars): ", true);
  }

  if (!email || !password) {
    console.error("❌ Error: Both email and password are required.");
    process.exit(1);
  }

  const passwordStr = String(password);
  if (passwordStr.length < 6) {
    console.error("❌ Error: Password must be at least 6 characters long.");
    process.exit(1);
  }

  const normalizedEmail = String(email).toLowerCase().trim();
  const mongoUri = process.env.MONGO_URI || process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/aegissphere";

  console.log(`\nConnecting to MongoDB...`);
  await mongoose.connect(mongoUri);

  try {
    let user = await User.findOne({ email: normalizedEmail });
    const hashedPassword = await bcrypt.hash(password, 10);

    if (user) {
      console.log(`\nUser '${normalizedEmail}' already exists. Elevating to Admin role...`);
      user.role = "Admin";
      user.status = "active";
      user.password = hashedPassword;
      if (name) user.name = name.trim();
      await user.save();
      console.log(`✅ Success: User '${normalizedEmail}' elevated to Administrator.`);
    } else {
      console.log(`\nCreating new Administrator account for '${normalizedEmail}'...`);
      user = await User.create({
        name: (name || "Platform Admin").trim(),
        email: normalizedEmail,
        password: hashedPassword,
        role: "Admin",
        status: "active",
      });
      console.log(`✅ Success: New Administrator '${normalizedEmail}' created (ID: ${user._id}).`);
    }

    // Record server-side audit log
    await AdminAuditLog.create({
      actor: user._id,
      actorEmail: user.email,
      actorRole: "Admin",
      action: "ADMIN_PROVISIONED_VIA_CLI",
      targetType: "User",
      targetId: user._id.toString(),
      ipAddress: "127.0.0.1 (CLI)",
      result: "SUCCESS",
      metadata: { method: "CLI_SCRIPT", email: normalizedEmail },
    });

    console.log(`\n🎉 Admin account is ready to use!`);
    console.log(`- Email: ${user.email}`);
    console.log(`- Role: ${user.role}`);
    console.log(`- Status: ${user.status}\n`);
  } catch (err) {
    console.error("❌ Fatal Error during admin provisioning:", err.message);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
  }
}

main().catch((err) => {
  console.error("Fatal Script Error:", err);
  process.exit(1);
});
