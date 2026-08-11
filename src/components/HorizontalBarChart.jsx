import React from 'react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, LabelList } from 'recharts';

const CustomYAxisTick = ({ x, y, payload }) => {
  const maxLength = 25;
  const displayText = payload.value.length > maxLength 
    ? payload.value.substring(0, maxLength) + '...' 
    : payload.value;
  
  return (
    <g transform={`translate(${x},${y})`}>
      <text x={0} y={0} dy={4} textAnchor="end" fill="var(--text-main)" fontSize={11} fontWeight={500}>
        <title>{payload.value}</title>
        {displayText}
      </text>
    </g>
  );
};

export function HorizontalBarChart({ data, color, yAxisWidth = 140, margin = { top: 0, right: 80, left: 10, bottom: 0 }, totalRespondents, unit }) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data} layout="vertical" margin={margin}>
        <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="var(--border-color)" />
        <XAxis type="number" tick={{ fill: 'var(--text-muted)', fontSize: 12 }} axisLine={false} tickLine={false} />
        <YAxis type="category" dataKey="name" width={yAxisWidth} tick={<CustomYAxisTick />} axisLine={false} tickLine={false} />
        <Tooltip cursor={{ fill: 'var(--bg-color)' }} formatter={val => `${val} ${unit}`} />
        <Bar maxBarSize={45} dataKey="value" fill={color} radius={[0, 4, 4, 0]}>
          <LabelList 
            dataKey="value" 
            position="right" 
            formatter={(val) => {
              if (!totalRespondents) return val;
              return `${val} (${((val / totalRespondents) * 100).toFixed(1)}%)`;
            }} 
            style={{ fill: 'var(--text-muted)', fontSize: 11 }} 
          />
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
