import React from 'react';
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';

const SEVERITY_COLORS = {
  Critical: '#DC2626',
  High: '#EA580C',
  Medium: '#D97706',
  Low: '#2563EB',
};

export const ThreatSeverityChart = ({ data = [] }) => {
  const hasData = data && data.some((item) => item.value > 0);

  if (!hasData) {
    return (
      <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', fontSize: '13px' }}>
        No severity distribution data
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height="100%">
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="45%"
          innerRadius={55}
          outerRadius={80}
          paddingAngle={4}
          dataKey="value"
        >
          {data.map((entry, index) => (
            <Cell
              key={`cell-${index}`}
              fill={SEVERITY_COLORS[entry.name] || '#94A3B8'}
              stroke="#FFFFFF"
              strokeWidth={2}
            />
          ))}
        </Pie>
        <Tooltip
          contentStyle={{
            backgroundColor: '#FFFFFF',
            borderColor: '#E2E8F0',
            borderRadius: '8px',
            fontSize: '12px',
            color: '#111827',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)',
          }}
        />
        <Legend
          verticalAlign="bottom"
          height={36}
          iconType="circle"
          iconSize={8}
          wrapperStyle={{ fontSize: '12px', color: '#4B5563' }}
        />
      </PieChart>
    </ResponsiveContainer>
  );
};

export default ThreatSeverityChart;
