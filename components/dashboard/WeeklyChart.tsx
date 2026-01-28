'use client';

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import { WeeklyChartData } from '@/types';

interface WeeklyChartProps {
  data: WeeklyChartData[];
}

export function WeeklyChart({ data }: WeeklyChartProps) {
  const maxMinutes = Math.max(...data.map(d => d.minutes), 1);

  // 今日の曜日を取得して今日をハイライト
  const today = new Date().toLocaleDateString('ja-JP', { weekday: 'short' });

  return (
    <div className="w-full h-64">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
          <XAxis
            dataKey="day"
            tick={{ fontSize: 12, fill: '#6B7280' }}
            axisLine={{ stroke: '#E5E7EB' }}
          />
          <YAxis
            tick={{ fontSize: 12, fill: '#6B7280' }}
            axisLine={{ stroke: '#E5E7EB' }}
            label={{
              value: '分',
              angle: -90,
              position: 'insideLeft',
              style: { fontSize: 12, fill: '#6B7280' },
            }}
          />
          <Tooltip
            content={({ active, payload }) => {
              if (active && payload && payload.length) {
                const data = payload[0].payload as WeeklyChartData;
                return (
                  <div className="bg-white p-3 shadow-lg rounded-lg border border-gray-100">
                    <p className="font-medium text-gray-800">{data.day}</p>
                    <p className="text-primary text-lg font-bold">
                      {data.minutes}分
                    </p>
                    <p className="text-sm text-gray-500">
                      {data.videos}本の動画
                    </p>
                  </div>
                );
              }
              return null;
            }}
          />
          <Bar
            dataKey="minutes"
            radius={[4, 4, 0, 0]}
            maxBarSize={50}
          >
            {data.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={entry.day === today ? '#059669' : '#10B981'}
                opacity={entry.day === today ? 1 : 0.7}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>

      {/* 凡例 */}
      <div className="flex justify-center mt-4 space-x-6 text-sm">
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 rounded bg-primary opacity-70" />
          <span className="text-gray-600">過去の日</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 rounded bg-primary-600" />
          <span className="text-gray-600">今日</span>
        </div>
      </div>
    </div>
  );
}
