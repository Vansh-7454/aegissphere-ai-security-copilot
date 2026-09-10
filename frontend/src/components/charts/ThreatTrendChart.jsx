import React from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts';

export const ThreatTrendChart = ({ data = [] }) => {
  // Real 7-day baseline
  const chartData = data && data.length > 0 ? data : [
    { time: 'Day 1', low: 0, medium: 0, high: 0, critical: 0, threats: 0 },
    { time: 'Day 2', low: 0, medium: 0, high: 0, critical: 0, threats: 0 },
    { time: 'Day 3', low: 0, medium: 0, high: 0, critical: 0, threats: 0 },
    { time: 'Day 4', low: 0, medium: 0, high: 0, critical: 0, threats: 0 },
    { time: 'Day 5', low: 0, medium: 0, high: 0, critical: 0, threats: 0 },
    { time: 'Day 6', low: 0, medium: 0, high: 0, critical: 0, threats: 0 },
    { time: 'Today', low: 0, medium: 0, high: 0, critical: 0, threats: 0 },
  ];

  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
        <defs>
          <linearGradient id="tealWave" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#0D9488" stopOpacity={0.4} />
            <stop offset="100%" stopColor="#0D9488" stopOpacity={0.0} />
          </linearGradient>
          <linearGradient id="cyanWave" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#06B6D4" stopOpacity={0.3} />
            <stop offset="100%" stopColor="#06B6D4" stopOpacity={0.0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" vertical={false} />
        <XAxis
          dataKey="time"
          stroke="#64748B"
          fontSize={11}
          tickLine={false}
          axisLine={{ stroke: '#E2E8F0' }}
        />
        <YAxis
          stroke="#64748B"
          fontSize={11}
          tickLine={false}
          axisLine={{ stroke: '#E2E8F0' }}
          allowDecimals={false}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: '#FFFFFF',
            border: '1px solid rgba(20, 184, 166, 0.25)',
            borderRadius: '12px',
            fontSize: '12px',
            color: '#0F172A',
            boxShadow: '0 8px 24px rgba(13, 148, 136, 0.12)',
          }}
        />
        <Area
          type="monotone"
          dataKey="threats"
          name="Threat Activity"
          stroke="#0D9488"
          strokeWidth={3}
          fill="url(#tealWave)"
        />
        <Area
          type="monotone"
          dataKey="medium"
          name="Medium Risk"
          stroke="#06B6D4"
          strokeWidth={2}
          fill="url(#cyanWave)"
        />
      </AreaChart>
    </ResponsiveContainer>
  );
};

export default ThreatTrendChart;
