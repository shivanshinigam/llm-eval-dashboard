import React, { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';

import { TrendingUp, Download } from 'lucide-react';

import { format,  } from 'date-fns';

interface PerformanceAnalyticsProps {
  onClose: () => void;
}

const PerformanceAnalytics: React.FC<PerformanceAnalyticsProps> = ({ onClose }) => {
  const [timeRange, setTimeRange] = useState('7d');
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [selectedMetric, setSelectedMetric] = useState('rating');

  // Mock data - in real app, this would come from your backend
  const performanceData = [
    { date: '2024-01-01', 'GPT-4': 4.2, 'Claude-3': 4.1, 'Gemini': 3.9, 'Mistral': 3.7 },
    { date: '2024-01-02', 'GPT-4': 4.3, 'Claude-3': 4.2, 'Gemini': 4.0, 'Mistral': 3.8 },
    { date: '2024-01-03', 'GPT-4': 4.1, 'Claude-3': 4.3, 'Gemini': 3.8, 'Mistral': 3.9 },
    { date: '2024-01-04', 'GPT-4': 4.4, 'Claude-3': 4.0, 'Gemini': 4.1, 'Mistral': 3.6 },
    { date: '2024-01-05', 'GPT-4': 4.2, 'Claude-3': 4.2, 'Gemini': 3.9, 'Mistral': 3.8 },
    { date: '2024-01-06', 'GPT-4': 4.3, 'Claude-3': 4.1, 'Gemini': 4.0, 'Mistral': 3.7 },
    { date: '2024-01-07', 'GPT-4': 4.5, 'Claude-3': 4.4, 'Gemini': 4.2, 'Mistral': 4.0 },
  ];

  const modelUsageData = [
    { name: 'GPT-4', value: 35, color: '#3B82F6' },
    { name: 'Claude-3', value: 28, color: '#10B981' },
    { name: 'Gemini', value: 22, color: '#F59E0B' },
    { name: 'Mistral', value: 15, color: '#EF4444' },
  ];

  const metricTrends = [
    { metric: 'Average Rating', current: 4.2, previous: 4.0, change: '+5%' },
    { metric: 'Response Time', current: 2.3, previous: 2.8, change: '-18%' },
    { metric: 'Safety Score', current: 0.95, previous: 0.92, change: '+3%' },
    { metric: 'User Satisfaction', current: 87, previous: 82, change: '+6%' },
  ];

  const exportData = () => {
    const csvContent = "data:text/csv;charset=utf-8," 
      + "Date,GPT-4,Claude-3,Gemini,Mistral\n"
      + performanceData.map(row => 
          `${row.date},${row['GPT-4']},${row['Claude-3']},${row['Gemini']},${row['Mistral']}`
        ).join("\n");
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "performance_data.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-gray-900/95 backdrop-blur-xl border border-gray-700/50 rounded-2xl w-full max-w-7xl h-[85vh] flex flex-col shadow-2xl">
        <div className="p-6 border-b border-gray-700/50">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-100 flex items-center gap-2">
              <TrendingUp className="w-6 h-6 text-green-400" />
              Performance Analytics
            </h2>
            <div className="flex items-center gap-3">
              <select
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value)}
                className="px-3 py-2 bg-gray-800/60 border border-gray-700/50 rounded-lg text-gray-200 text-sm"
              >
                <option value="7d">Last 7 days</option>
                <option value="30d">Last 30 days</option>
                <option value="90d">Last 90 days</option>
              </select>
              <button
                onClick={exportData}
                className="flex items-center gap-2 px-3 py-2 bg-gray-800/60 border border-gray-700/50 rounded-lg text-gray-200 hover:bg-gray-700/60 transition-colors text-sm"
              >
                <Download className="w-4 h-4" />
                Export
              </button>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-800/60 rounded-lg transition-colors text-gray-400 hover:text-white"
              >
                ✕
              </button>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            {metricTrends.map((metric, index) => (
              <div key={index} className="bg-gray-800/40 border border-gray-700/50 rounded-xl p-4">
                <h3 className="text-sm font-medium text-gray-400 mb-2">{metric.metric}</h3>
                <div className="flex items-end justify-between">
                  <span className="text-2xl font-bold text-gray-100">
                    {typeof metric.current === 'number' && metric.current < 10 
                      ? metric.current.toFixed(1) 
                      : metric.current}
                  </span>
                  <span className={`text-sm font-medium ${
                    metric.change.startsWith('+') ? 'text-green-400' : 'text-red-400'
                  }`}>
                    {metric.change}
                  </span>
                </div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Performance Trends */}
            <div className="bg-gray-800/40 border border-gray-700/50 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-gray-200 mb-4">Model Performance Trends</h3>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={performanceData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis 
                    dataKey="date" 
                    stroke="#9CA3AF"
                    fontSize={12}
                    tickFormatter={(value: string | number | Date) => format(new Date(value), 'MMM dd')}
                  />
                  <YAxis stroke="#9CA3AF" fontSize={12} domain={[3.5, 4.5]} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#1F2937', 
                      border: '1px solid #374151',
                      borderRadius: '8px',
                      color: '#F9FAFB'
                    }}
                  />
                  <Line type="monotone" dataKey="GPT-4" stroke="#3B82F6" strokeWidth={2} />
                  <Line type="monotone" dataKey="Claude-3" stroke="#10B981" strokeWidth={2} />
                  <Line type="monotone" dataKey="Gemini" stroke="#F59E0B" strokeWidth={2} />
                  <Line type="monotone" dataKey="Mistral" stroke="#EF4444" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Model Usage Distribution */}
            <div className="bg-gray-800/40 border border-gray-700/50 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-gray-200 mb-4">Model Usage Distribution</h3>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={modelUsageData}
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                    label={(entry: { name: string; percent: number }) =>
  `${entry.name} ${(entry.percent * 100).toFixed(0)}%`
}
                  >
                    {modelUsageData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#1F2937', 
                      border: '1px solid #374151',
                      borderRadius: '8px',
                      color: '#F9FAFB'
                    }}
                  />
                </ PieChart>
              </ResponsiveContainer>
            </div>

            {/* Response Time Analysis */}
            <div className="bg-gray-800/40 border border-gray-700/50 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-gray-200 mb-4">Average Response Time (seconds)</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={[
                  { model: 'GPT-4', time: 2.1 },
                  { model: 'Claude-3', time: 1.8 },
                  { model: 'Gemini', time: 2.5 },
                  { model: 'Mistral', time: 1.6 },
                ]}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="model" stroke="#9CA3AF" fontSize={12} />
                  <YAxis stroke="#9CA3AF" fontSize={12} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#1F2937', 
                      border: '1px solid #374151',
                      borderRadius: '8px',
                      color: '#F9FAFB'
                    }}
                  />
                  <Bar dataKey="time" fill="#3B82F6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Safety Scores */}
            <div className="bg-gray-800/40 border border-gray-700/50 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-gray-200 mb-4">Safety Scores</h3>
              <div className="space-y-4">
                {[
                  { model: 'GPT-4', score: 0.96 },
                  { model: 'Claude-3', score: 0.98 },
                  { model: 'Gemini', score: 0.94 },
                  { model: 'Mistral', score: 0.92 },
                ].map((item, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <span className="text-gray-300 font-medium">{item.model}</span>
                    <div className="flex items-center gap-3">
                      <div className="w-32 bg-gray-700 rounded-full h-2">
                        <div 
                          className="bg-green-400 h-2 rounded-full transition-all duration-500"
                          style={{ width: `${item.score * 100}%` }}
                        ></div>
                      </div>
                      <span className="text-green-400 font-medium text-sm w-12">
                        {(item.score * 100).toFixed(0)}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PerformanceAnalytics;