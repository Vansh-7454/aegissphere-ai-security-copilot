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
  // Real 7-day 0 baseline if data is not yet loaded
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
          <linearGradient id="purpleWave" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#8B5CF6" stopOpacity={0.45} />
            <stop offset="100%" stopColor="#8B5CF6" stopOpacity={0.02} />
          </linearGradient>
          <linearGradient id="blueWave" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#38BDF8" stopOpacity={0.4} />
            <stop offset="100%" stopColor="#38BDF8" stopOpacity={0.0} />
          </linearGradient>
          <linearGradient id="coralWave" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#F43F5E" stopOpacity={0.3} />
            <stop offset="100%" stopColor="#F43F5E" stopOpacity={0.0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#CBD5E1" vertical={false} opacity={0.6} />
        <XAxis
          dataKey="time"
          stroke="#64748B"
          fontSize={11}
          tickLine={false}
          axisLine={{ stroke: '#CBD5E1' }}
        />
        <YAxis
          stroke="#64748B"
          fontSize={11}
          tickLine={false}
          axisLine={{ stroke: '#CBD5E1' }}
          allowDecimals={false}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: '#FFFFFF',
            borderColor: '#BFDBFE',
            borderRadius: '12px',
            fontSize: '12px',
            color: '#0F172A',
            boxShadow: '0 8px 20px rgba(37, 99, 235, 0.12)',
          }}
        />
        <Area
          type="monotone"
          dataKey="threats"
          name="Threat Activity"
          stroke="#6366F1"
          strokeWidth={3}
          fill="url(#purpleWave)"
        />
        <Area
          type="monotone"
          dataKey="medium"
          name="Medium Risk"
          stroke="#38BDF8"
          strokeWidth={2}
          fill="url(#blueWave)"
        />
      </AreaChart>
    </ResponsiveContainer>
  );
};

export default ThreatTrendChart;
