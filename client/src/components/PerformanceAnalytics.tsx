import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import { TrendingUp, Download, RefreshCw } from 'lucide-react';
import { format } from 'date-fns';

interface PerformanceAnalyticsProps {
  onClose: () => void;
}

interface AnalyticsData {
  performanceData: any[];
  modelUsageData: any[];
  metricTrends: any[];
  responseTimeData: any[];
  safetyScores: any[];
}

const PerformanceAnalytics: React.FC<PerformanceAnalyticsProps> = ({ onClose }) => {
  const [timeRange, setTimeRange] = useState('7d');
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [selectedMetric, setSelectedMetric] = useState('rating');
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

 const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;


  // Fetch analytics data from backend
  const fetchAnalyticsData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`${API_BASE_URL}/analytics?timeRange=${timeRange}`);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch analytics: ${response.status}`);
      }
      
      const data = await response.json();
      setAnalyticsData(data);
    } catch (err: any) {
      console.error('Analytics fetch error:', err);
      setError(err.message);
      // Fallback to mock data if backend is not available
      setAnalyticsData(getMockData());
    } finally {
      setLoading(false);
    }
  };

  // Mock data as fallback
  const getMockData = (): AnalyticsData => {
    return {
      performanceData: [
        { date: '2024-01-01', 'Mistral 7B Instruct v0.3': 4.2, 'Mistral NeMo Instruct': 4.1, 'Mistral Small 3.1 24B Instruct': 4.4 },
        { date: '2024-01-02', 'Mistral 7B Instruct v0.3': 4.3, 'Mistral NeMo Instruct': 4.2, 'Mistral Small 3.1 24B Instruct': 4.5 },
        { date: '2024-01-03', 'Mistral 7B Instruct v0.3': 4.1, 'Mistral NeMo Instruct': 4.3, 'Mistral Small 3.1 24B Instruct': 4.3 },
        { date: '2024-01-04', 'Mistral 7B Instruct v0.3': 4.4, 'Mistral NeMo Instruct': 4.0, 'Mistral Small 3.1 24B Instruct': 4.6 },
        { date: '2024-01-05', 'Mistral 7B Instruct v0.3': 4.2, 'Mistral NeMo Instruct': 4.2, 'Mistral Small 3.1 24B Instruct': 4.4 },
        { date: '2024-01-06', 'Mistral 7B Instruct v0.3': 4.3, 'Mistral NeMo Instruct': 4.1, 'Mistral Small 3.1 24B Instruct': 4.5 },
        { date: '2024-01-07', 'Mistral 7B Instruct v0.3': 4.5, 'Mistral NeMo Instruct': 4.4, 'Mistral Small 3.1 24B Instruct': 4.7 },
      ],
      modelUsageData: [
        { name: 'Mistral 7B Instruct v0.3', value: 35, color: '#3B82F6' },
        { name: 'Mistral NeMo Instruct', value: 32, color: '#10B981' },
        { name: 'Mistral Small 3.1 24B Instruct', value: 33, color: '#F59E0B' },
      ],
      metricTrends: [
        { metric: 'Average Rating', current: 4.3, previous: 4.1, change: '+5%' },
        { metric: 'Response Time', current: 2.1, previous: 2.5, change: '-16%' },
        { metric: 'Safety Score', current: 0.96, previous: 0.93, change: '+3%' },
        { metric: 'User Satisfaction', current: 89, previous: 85, change: '+5%' },
      ],
      responseTimeData: [
        { model: 'Mistral 7B Instruct v0.3', time: 2.3 },
        { model: 'Mistral NeMo Instruct', time: 1.9 },
        { model: 'Mistral Small 3.1 24B Instruct', time: 2.1 },
      ],
      safetyScores: [
        { model: 'Mistral 7B Instruct v0.3', score: 0.95 },
        { model: 'Mistral NeMo Instruct', score: 0.97 },
        { model: 'Mistral Small 3.1 24B Instruct', score: 0.96 },
      ]
    };
  };

  useEffect(() => {
    fetchAnalyticsData();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timeRange]);

  const exportData = () => {
    if (!analyticsData) return;
    
    const csvContent = "data:text/csv;charset=utf-8," 
      + "Date,Mistral 7B Instruct v0.3,Mistral NeMo Instruct,Mistral Small 3.1 24B Instruct\n"
      + analyticsData.performanceData.map(row => 
          `${row.date},${row['Mistral 7B Instruct v0.3']},${row['Mistral NeMo Instruct']},${row['Mistral Small 3.1 24B Instruct']}`
        ).join("\n");
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "mistral_performance_data.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center">
        <div className="bg-gray-900/95 backdrop-blur-xl border border-gray-700/50 rounded-2xl p-8">
          <div className="flex items-center gap-3">
            <div className="animate-spin rounded-full h-6 w-6 border-2 border-blue-400 border-t-transparent"></div>
            <span className="text-gray-200">Loading analytics data...</span>
          </div>
        </div>
      </div>
    );
  }

  if (!analyticsData) {
    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center">
        <div className="bg-gray-900/95 backdrop-blur-xl border border-gray-700/50 rounded-2xl p-8">
          <div className="text-center">
            <p className="text-red-400 mb-4">Failed to load analytics data</p>
            <button
              onClick={fetchAnalyticsData}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-gray-900/95 backdrop-blur-xl border border-gray-700/50 rounded-2xl w-full max-w-7xl h-[85vh] flex flex-col shadow-2xl">
        <div className="p-6 border-b border-gray-700/50">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-100 flex items-center gap-2">
              <TrendingUp className="w-6 h-6 text-green-400" />
              Mistral Models Performance Analytics
            </h2>
            <div className="flex items-center gap-3">
              <button
                onClick={fetchAnalyticsData}
                className="flex items-center gap-2 px-3 py-2 bg-gray-800/60 border border-gray-700/50 rounded-lg text-gray-200 hover:bg-gray-700/60 transition-colors text-sm"
              >
                <RefreshCw className="w-4 h-4" />
                Refresh
              </button>
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
          {error && (
            <div className="mt-3 p-3 bg-yellow-500/20 border border-yellow-500/30 rounded-lg">
              <p className="text-yellow-300 text-sm">
                ⚠️ Using mock data - Backend not available: {error}
              </p>
            </div>
          )}
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            {analyticsData?.metricTrends && (
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                {analyticsData.metricTrends.map((metric, index) => (
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
            )}

          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Performance Trends */}
            <div className="bg-gray-800/40 border border-gray-700/50 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-gray-200 mb-4">Mistral Models Performance Trends</h3>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={analyticsData.performanceData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis 
                    dataKey="date" 
                    stroke="#9CA3AF"
                    fontSize={12}
                    tickFormatter={(value) => format(new Date(value), 'MMM dd')}
                  />
                  <YAxis stroke="#9CA3AF" fontSize={12} domain={[3.5, 5.0]} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#1F2937', 
                      border: '1px solid #374151',
                      borderRadius: '8px',
                      color: '#F9FAFB'
                    }}
                  />
                  <Line type="monotone" dataKey="Mistral 7B Instruct v0.3" stroke="#3B82F6" strokeWidth={2} />
                  <Line type="monotone" dataKey="Mistral NeMo Instruct" stroke="#10B981" strokeWidth={2} />
                  <Line type="monotone" dataKey="Mistral Small 3.1 24B Instruct" stroke="#F59E0B" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Model Usage Distribution */}
            <div className="bg-gray-800/40 border border-gray-700/50 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-gray-200 mb-4">Model Usage Distribution</h3>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={analyticsData.modelUsageData}
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, percent }: { name: string; percent: number }) =>`${name.split(' ')[1]} ${(percent * 100).toFixed(0)}%`}
                  >
                    {analyticsData.modelUsageData.map((entry, index) => (
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
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* Response Time Analysis */}
            <div className="bg-gray-800/40 border border-gray-700/50 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-gray-200 mb-4">Average Response Time (seconds)</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={analyticsData.responseTimeData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis 
                    dataKey="model" 
                    stroke="#9CA3AF" 
                    fontSize={12}
                    tickFormatter={(value) => value.split(' ')[1]} // Show only model variant
                  />
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
                {analyticsData.safetyScores.map((item, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <span className="text-gray-300 font-medium">
                      {item.model.split(' ')[1]} {/* Show only model variant */}
                    </span>
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
