import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts';

export const AttackTypesChart = ({ data = [] }) => {
  if (!data || data.length === 0) {
    return (
      <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', fontSize: '13px' }}>
        No attack classification data
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data} layout="vertical" margin={{ top: 5, right: 20, left: 30, bottom: 5 }}>
        <defs>
          <linearGradient id="barGradient" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#6C4DF6" />
            <stop offset="100%" stopColor="#3B82F6" />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" horizontal={false} />
        <XAxis
          type="number"
          stroke="#94A3B8"
          fontSize={11}
          tickLine={false}
          axisLine={{ stroke: '#E2E8F0' }}
          allowDecimals={false}
        />
        <YAxis
          dataKey="name"
          type="category"
          stroke="#4B5563"
          fontSize={11}
          tickLine={false}
          axisLine={{ stroke: '#E2E8F0' }}
          width={105}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: '#FFFFFF',
            borderColor: '#E2E8F0',
            borderRadius: '8px',
            fontSize: '12px',
            color: '#111827',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)',
          }}
          cursor={{ fill: '#F8FAFC' }}
        />
        <Bar
          dataKey="count"
          name="Incidents"
          fill="url(#barGradient)"
          radius={[0, 4, 4, 0]}
        />
      </BarChart>
    </ResponsiveContainer>
  );
};

export default AttackTypesChart;
