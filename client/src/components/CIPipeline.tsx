import React, { useState } from 'react';
import { Play, Pause, CheckCircle, XCircle, Clock, GitBranch, Settings } from 'lucide-react';

interface CIPipelineProps {
  onClose: () => void;
}

interface PipelineRun {
  id: string;
  name: string;
  status: 'running' | 'success' | 'failed' | 'pending';
  startTime: number;
  duration?: number;
  tests: {
    name: string;
    status: 'running' | 'success' | 'failed' | 'pending';
    duration?: number;
    details?: string;
  }[];
}

const CIPipeline: React.FC<CIPipelineProps> = ({ onClose }) => {
  const [runs, setRuns] = useState<PipelineRun[]>([
    {
      id: '1',
      name: 'Model Performance Test Suite',
      status: 'success',
      startTime: Date.now() - 300000,
      duration: 245,
      tests: [
        { name: 'Safety Evaluation', status: 'success', duration: 45, details: 'All models passed toxicity thresholds' },
        { name: 'Response Quality', status: 'success', duration: 89, details: 'Average rating above 4.0' },
        { name: 'Performance Benchmarks', status: 'success', duration: 67, details: 'Response times within limits' },
        { name: 'Consistency Check', status: 'success', duration: 44, details: 'Variance within acceptable range' }
      ]
    },
    {
      id: '2',
      name: 'Prompt Template Validation',
      status: 'running',
      startTime: Date.now() - 120000,
      tests: [
        { name: 'Template Syntax', status: 'success', duration: 12, details: 'All templates valid' },
        { name: 'Variable Substitution', status: 'success', duration: 23, details: 'Variables properly replaced' },
        { name: 'Output Validation', status: 'running', details: 'Testing response formats...' },
        { name: 'Performance Impact', status: 'pending' }
      ]
    },
    {
      id: '3',
      name: 'A/B Test Analysis',
      status: 'failed',
      startTime: Date.now() - 600000,
      duration: 156,
      tests: [
        { name: 'Statistical Significance', status: 'success', duration: 34, details: 'Sample size sufficient' },
        { name: 'Bias Detection', status: 'failed', duration: 67, details: 'Potential bias detected in variant B' },
        { name: 'Performance Comparison', status: 'success', duration: 45, details: 'Clear winner identified' },
        { name: 'Report Generation', status: 'success', duration: 10, details: 'Report generated successfully' }
      ]
    }
  ]);

  const [showConfig, setShowConfig] = useState(false);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-400" />;
      case 'failed':
        return <XCircle className="w-5 h-5 text-red-400" />;
      case 'running':
        return <div className="w-5 h-5 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />;
      default:
        return <Clock className="w-5 h-5 text-gray-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success':
        return 'text-green-400 bg-green-500/20';
      case 'failed':
        return 'text-red-400 bg-red-500/20';
      case 'running':
        return 'text-blue-400 bg-blue-500/20';
      default:
        return 'text-gray-400 bg-gray-500/20';
    }
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return mins > 0 ? `${mins}m ${secs}s` : `${secs}s`;
  };

  const triggerPipeline = () => {
    const newRun: PipelineRun = {
      id: Date.now().toString(),
      name: 'Manual Trigger - Full Test Suite',
      status: 'running',
      startTime: Date.now(),
      tests: [
        { name: 'Safety Evaluation', status: 'running' },
        { name: 'Response Quality', status: 'pending' },
        { name: 'Performance Benchmarks', status: 'pending' },
        { name: 'Consistency Check', status: 'pending' }
      ]
    };
    
    setRuns([newRun, ...runs]);
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-gray-900/95 backdrop-blur-xl border border-gray-700/50 rounded-2xl w-full max-w-6xl h-[80vh] flex flex-col shadow-2xl">
        <div className="p-6 border-b border-gray-700/50">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-100 flex items-center gap-2">
              <GitBranch className="w-6 h-6 text-blue-400" />
              CI/CD Pipeline
            </h2>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowConfig(!showConfig)}
                className="flex items-center gap-2 px-4 py-2 bg-gray-800/60 border border-gray-700/50 rounded-lg text-gray-200 hover:bg-gray-700/60 transition-colors"
              >
                <Settings className="w-4 h-4" />
                Configure
              </button>
              <button
                onClick={triggerPipeline}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
              >
                <Play className="w-4 h-4" />
                Run Pipeline
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
          {showConfig && (
            <div className="bg-gray-800/40 border border-gray-700/50 rounded-xl p-6 mb-6">
              <h3 className="text-lg font-semibold text-gray-200 mb-4">Pipeline Configuration</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Trigger Events</label>
                  <div className="space-y-2">
                    {['New prompt created', 'Model response generated', 'Template updated', 'Manual trigger'].map((event) => (
                      <label key={event} className="flex items-center gap-2">
                        <input type="checkbox" defaultChecked className="rounded bg-gray-700 border-gray-600" />
                        <span className="text-gray-300 text-sm">{event}</span>
                      </label>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Test Thresholds</label>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="text-gray-400 text-sm w-24">Safety:</span>
                      <input type="number" defaultValue="0.95" step="0.01" className="px-2 py-1 bg-gray-700 border border-gray-600 rounded text-gray-200 text-sm w-20" />
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-gray-400 text-sm w-24">Quality:</span>
                      <input type="number" defaultValue="4.0" step="0.1" className="px-2 py-1 bg-gray-700 border border-gray-600 rounded text-gray-200 text-sm w-20" />
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-gray-400 text-sm w-24">Speed (ms):</span>
                      <input type="number" defaultValue="3000" className="px-2 py-1 bg-gray-700 border border-gray-600 rounded text-gray-200 text-sm w-20" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="space-y-4">
            {runs.map((run) => (
              <div key={run.id} className="bg-gray-800/40 border border-gray-700/50 rounded-xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    {getStatusIcon(run.status)}
                    <h3 className="text-lg font-semibold text-gray-200">{run.name}</h3>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(run.status)}`}>
                      {run.status.charAt(0).toUpperCase() + run.status.slice(1)}
                    </span>
                  </div>
                  <div className="text-sm text-gray-400">
                    {run.duration ? (
                      `Completed in ${formatDuration(run.duration)}`
                    ) : (
                      `Running for ${formatDuration(Math.floor((Date.now() - run.startTime) / 1000))}`
                    )}
                  </div>
                </div>

                <div className="space-y-3">
                  {run.tests.map((test, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-900/40 rounded-lg">
                      <div className="flex items-center gap-3">
                        {getStatusIcon(test.status)}
                        <span className="text-gray-200 font-medium">{test.name}</span>
                        {test.duration && (
                          <span className="text-xs text-gray-400">({formatDuration(test.duration)})</span>
                        )}
                      </div>
                      {test.details && (
                        <span className="text-sm text-gray-400 max-w-md truncate">{test.details}</span>
                      )}
                    </div>
                  ))}
                </div>

                {run.status === 'running' && (
                  <div className="mt-4">
                    <div className="w-full bg-gray-700 rounded-full h-2">
                      <div 
                        className="bg-blue-400 h-2 rounded-full transition-all duration-500"
                        style={{ 
                          width: `${(run.tests.filter(t => t.status === 'success').length / run.tests.length) * 100}%` 
                        }}
                      ></div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CIPipeline;