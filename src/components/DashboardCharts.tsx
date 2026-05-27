/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';

interface RevenueChartProps {
  data: { date: string; value: number }[];
}

export const RevenueAreaChart: React.FC<RevenueChartProps> = ({ data }) => {
  const values = data.map(d => d.value);
  const maxVal = Math.max(...values, 1000);
  const height = 180;
  const width = 500;
  const padding = 35;

  // Map data to SVG points
  const points = data.map((d, index) => {
    const x = padding + (index * (width - padding * 2)) / (data.length - 1 || 1);
    const y = height - padding - (d.value * (height - padding * 2)) / maxVal;
    return { x, y, value: d.value, label: d.date };
  });

  const pathD = points.length > 0 
    ? `M ${points[0].x} ${points[0].y} ` + points.slice(1).map(p => `L ${p.x} ${p.y}`).join(' ')
    : '';

  const areaD = points.length > 0
    ? `${pathD} L ${points[points.length - 1].x} ${height - padding} L ${points[0].x} ${height - padding} Z`
    : '';

  return (
    <div className="w-full h-full relative" id="rev_area_chart_container">
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full overflow-visible">
        <defs>
          <linearGradient id="goldAreaGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#B08D57" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#B08D57" stopOpacity="0.0" />
          </linearGradient>
          <linearGradient id="goldLineGrad" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#8A6A3D" />
            <stop offset="50%" stopColor="#D6C29A" />
            <stop offset="100%" stopColor="#B08D57" />
          </linearGradient>
        </defs>

        {/* Horizontal grid lines */}
        {[0, 0.25, 0.5, 0.75, 1].map((ratio, i) => {
          const y = padding + ratio * (height - padding * 2);
          const value = Math.round(maxVal * (1 - ratio));
          return (
            <g key={i} className="opacity-20">
              <line 
                x1={padding} 
                y1={y} 
                x2={width - padding} 
                y2={y} 
                stroke="#6E8B8E" 
                strokeWidth="0.5" 
                strokeDasharray="4 4"
              />
              <text 
                x={padding - 8} 
                y={y + 4} 
                fill="#C5A46D" 
                fontSize="9" 
                fontFamily="monospace"
                textAnchor="end"
              >
                R$ {value}
              </text>
            </g>
          );
        })}

        {/* Area fill */}
        {areaD && (
          <path d={areaD} fill="url(#goldAreaGrad)" />
        )}

        {/* Path line */}
        {pathD && (
          <path 
            d={pathD} 
            fill="none" 
            stroke="url(#goldLineGrad)" 
            strokeWidth="2.5" 
            strokeLinecap="round" 
            strokeLinejoin="round"
          />
        )}

        {/* Interactive points */}
        {points.map((p, i) => (
          <g key={i} className="group cursor-pointer">
            <circle 
              cx={p.x} 
              cy={p.y} 
              r="4" 
              fill="#070708" 
              stroke="#D6C29A" 
              strokeWidth="2"
              className="transition-all duration-300 hover:r-6"
            />
            {/* Tooltip on hover */}
            <g className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <rect 
                x={p.x - 45} 
                y={p.y - 28} 
                width="90" 
                height="20" 
                rx="4" 
                fill="#111214" 
                stroke="#B08D57" 
                strokeWidth="1"
              />
              <text 
                x={p.x} 
                y={p.y - 15} 
                fill="#FFFFFF" 
                fontSize="9" 
                textAnchor="middle" 
                fontWeight="bold"
              >
                R$ {p.value.toFixed(2)}
              </text>
            </g>
            {/* X Axis Label */}
            <text 
              x={p.x} 
              y={height - 10} 
              fill="#D6C29A" 
              opacity="0.6" 
              fontSize="9" 
              textAnchor="middle"
            >
              {p.label}
            </text>
          </g>
        ))}
      </svg>
    </div>
  );
};


interface CircularProgressProps {
  percentage: number;
  label: string;
}

export const CircularOccupancyGauge: React.FC<CircularProgressProps> = ({ percentage, label }) => {
  const radius = 50;
  const strokeWidth = 10;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percentage / 100) * circumference;

  return (
    <div className="flex flex-col items-center justify-center p-3" id="occupancy_gauge">
      <div className="relative w-32 h-32 flex items-center justify-center">
        <svg className="w-full h-full transform -rotate-90">
          <circle
            cx="64"
            cy="64"
            r={radius}
            fill="transparent"
            stroke="#111214"
            strokeWidth={strokeWidth}
          />
          <circle
            cx="64"
            cy="64"
            r={radius}
            fill="transparent"
            stroke="#B08D57"
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            className="transition-all duration-1000 ease-out"
          />
        </svg>
        <div className="absolute text-center flex flex-col justify-center items-center">
          <span className="text-2xl font-bold font-mono text-white">{percentage}%</span>
          <span className="text-[10px] uppercase tracking-wider text-[#6E8B8E] mt-0.5">{label}</span>
        </div>
      </div>
    </div>
  );
};


interface BranchBarChartProps {
  branches: { name: string; value: number }[];
}

export const BranchBarChart: React.FC<BranchBarChartProps> = ({ branches }) => {
  const maxVal = Math.max(...branches.map(b => b.value), 100);
  
  return (
    <div className="flex flex-col gap-3 w-full" id="branch_performance_chart">
      {branches.map((b, i) => {
        const percent = (b.value / maxVal) * 100;
        return (
          <div key={i} className="flex flex-col gap-1 w-full">
            <div className="flex justify-between items-center text-xs">
              <span className="text-gray-300 font-medium">{b.name}</span>
              <span className="text-[#D6C29A] font-mono font-bold">R$ {b.value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
            </div>
            <div className="w-full h-3 bg-[#070708] rounded-full overflow-hidden border border-gray-800">
              <div 
                className="h-full bg-gradient-to-r from-[#8A6A3D] to-[#D6C29A] rounded-full transition-all duration-1000"
                style={{ width: `${percent}%` }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
};
