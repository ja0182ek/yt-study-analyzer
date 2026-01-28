'use client';

import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { VocabDistribution } from '@/types';

interface VocabPieChartProps {
  data: VocabDistribution[];
}

// 語彙レベルごとの色
const LEVEL_COLORS: Record<string, string> = {
  'Pre-K': '#10B981', // primary
  'K': '#34D399',     // primary-400
  '1st': '#6EE7B7',   // primary-300
  '2nd': '#A7F3D0',   // primary-200
  '3rd': '#D1FAE5',   // primary-100
  'Noun': '#3B82F6',  // blue
  'Other': '#9CA3AF', // gray
};

export function VocabPieChart({ data }: VocabPieChartProps) {
  // 0件のデータを除外し、パーセンテージでソート
  const filteredData = data
    .filter(d => d.count > 0)
    .sort((a, b) => b.percentage - a.percentage);

  if (filteredData.length === 0) {
    return (
      <div className="w-full h-64 flex items-center justify-center text-gray-500">
        データがありません
      </div>
    );
  }

  const chartData = filteredData.map(d => ({
    name: d.level,
    value: d.count,
    percentage: d.percentage,
    color: LEVEL_COLORS[d.level] || '#9CA3AF',
  }));

  return (
    <div className="w-full h-72">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            innerRadius={40}
            outerRadius={80}
            paddingAngle={2}
            dataKey="value"
            label={({ name, percent }) =>
              (percent ?? 0) * 100 > 5 ? `${name}` : ''
            }
            labelLine={false}
          >
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip
            content={({ active, payload }) => {
              if (active && payload && payload.length) {
                const data = payload[0].payload;
                return (
                  <div className="bg-white p-3 shadow-lg rounded-lg border border-gray-100">
                    <p className="font-medium text-gray-800">{data.name}</p>
                    <p className="text-lg font-bold" style={{ color: data.color }}>
                      {data.percentage.toFixed(1)}%
                    </p>
                    <p className="text-sm text-gray-500">
                      {data.value.toLocaleString()}語
                    </p>
                  </div>
                );
              }
              return null;
            }}
          />
          <Legend
            layout="vertical"
            align="right"
            verticalAlign="middle"
            formatter={(value, entry) => {
              const item = chartData.find(d => d.name === value);
              return (
                <span className="text-sm text-gray-600">
                  {value} ({item?.percentage.toFixed(1)}%)
                </span>
              );
            }}
          />
        </PieChart>
      </ResponsiveContainer>

      {/* 語彙レベルの説明 */}
      <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
        <div className="flex items-center space-x-1">
          <div className="w-3 h-3 rounded" style={{ backgroundColor: LEVEL_COLORS['Pre-K'] }} />
          <span className="text-gray-600">Pre-K: 幼稚園前</span>
        </div>
        <div className="flex items-center space-x-1">
          <div className="w-3 h-3 rounded" style={{ backgroundColor: LEVEL_COLORS['K'] }} />
          <span className="text-gray-600">K: 幼稚園</span>
        </div>
        <div className="flex items-center space-x-1">
          <div className="w-3 h-3 rounded" style={{ backgroundColor: LEVEL_COLORS['1st'] }} />
          <span className="text-gray-600">1st: 小学1年</span>
        </div>
        <div className="flex items-center space-x-1">
          <div className="w-3 h-3 rounded" style={{ backgroundColor: LEVEL_COLORS['2nd'] }} />
          <span className="text-gray-600">2nd: 小学2年</span>
        </div>
        <div className="flex items-center space-x-1">
          <div className="w-3 h-3 rounded" style={{ backgroundColor: LEVEL_COLORS['3rd'] }} />
          <span className="text-gray-600">3rd: 小学3年</span>
        </div>
        <div className="flex items-center space-x-1">
          <div className="w-3 h-3 rounded" style={{ backgroundColor: LEVEL_COLORS['Noun'] }} />
          <span className="text-gray-600">Noun: 名詞</span>
        </div>
      </div>
    </div>
  );
}
