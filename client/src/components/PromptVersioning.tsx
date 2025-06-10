import React, { useState } from 'react';
import { GitBranch, Clock,  Plus, Eye, Edit, Archive } from 'lucide-react';
import { PromptVersion } from '../types';
import { format } from 'date-fns';

interface PromptVersioningProps {
  promptId: string;
  onClose: () => void;
}

const PromptVersioning: React.FC<PromptVersioningProps> = ({ promptId, onClose }) => {
  const [versions, setVersions] = useState<PromptVersion[]>([
    {
      id: '1',
      promptId,
      version: 'v1.0.0',
      content: 'Explain quantum computing in simple terms.',
      changelog: 'Initial version',
      createdAt: Date.now() - 604800000,
      performance: {
        averageRating: 3.8,
        totalEvaluations: 45,
        successRate: 0.82
      }
    },
    {
      id: '2',
      promptId,
      version: 'v1.1.0',
      content: 'Explain quantum computing in simple terms with real-world applications and examples.',
      changelog: 'Added request for real-world applications and examples',
      createdAt: Date.now() - 432000000,
      performance: {
        averageRating: 4.2,
        totalEvaluations: 67,
        successRate: 0.89
      }
    },
    {
      id: '3',
      promptId,
      version: 'v1.2.0',
      content: 'Explain quantum computing in simple terms with real-world applications and examples. Structure your response with clear headings and bullet points.',
      changelog: 'Added structure requirements for better readability',
      createdAt: Date.now() - 86400000,
      performance: {
        averageRating: 4.5,
        totalEvaluations: 23,
        successRate: 0.95
      }
    }
  ]);

  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newVersion, setNewVersion] = useState({
    content: '',
    changelog: '',
    version: ''
  });

  const handleCreateVersion = () => {
    const version: PromptVersion = {
      id: Date.now().toString(),
      promptId,
      version: newVersion.version,
      content: newVersion.content,
      changelog: newVersion.changelog,
      createdAt: Date.now()
    };
    
    setVersions([version, ...versions]);
    setShowCreateForm(false);
    setNewVersion({ content: '', changelog: '', version: '' });
  };

  const getPerformanceColor = (rating: number) => {
    if (rating >= 4.0) return 'text-green-400';
    if (rating >= 3.5) return 'text-yellow-400';
    return 'text-red-400';
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-gray-900/95 backdrop-blur-xl border border-gray-700/50 rounded-2xl w-full max-w-5xl h-[80vh] flex flex-col shadow-2xl">
        <div className="p-6 border-b border-gray-700/50">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-100 flex items-center gap-2">
              <GitBranch className="w-6 h-6 text-purple-400" />
              Prompt Version History
            </h2>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowCreateForm(true)}
                className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
              >
                <Plus className="w-4 h-4" />
                New Version
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
          {showCreateForm ? (
            <div className="bg-gray-800/40 border border-gray-700/50 rounded-xl p-6 mb-6">
              <h3 className="text-lg font-semibold text-gray-200 mb-4">Create New Version</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Version Number</label>
                  <input
                    type="text"
                    value={newVersion.version}
                    onChange={(e) => setNewVersion({...newVersion, version: e.target.value})}
                    className="w-full p-3 bg-gray-900/40 border border-gray-700/50 rounded-lg text-gray-200"
                    placeholder="e.g., v1.3.0"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Prompt Content</label>
                  <textarea
                    value={newVersion.content}
                    onChange={(e) => setNewVersion({...newVersion, content: e.target.value})}
                    className="w-full p-3 bg-gray-900/40 border border-gray-700/50 rounded-lg text-gray-200 resize-none"
                    rows={4}
                    placeholder="Enter the updated prompt..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Changelog</label>
                  <textarea
                    value={newVersion.changelog}
                    onChange={(e) => setNewVersion({...newVersion, changelog: e.target.value})}
                    className="w-full p-3 bg-gray-900/40 border border-gray-700/50 rounded-lg text-gray-200 resize-none"
                    rows={3}
                    placeholder="Describe what changed in this version..."
                  />
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={handleCreateVersion}
                    disabled={!newVersion.version || !newVersion.content || !newVersion.changelog}
                    className="px-6 py-2 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white rounded-lg transition-colors"
                  >
                    Create Version
                  </button>
                  <button
                    onClick={() => setShowCreateForm(false)}
                    className="px-6 py-2 bg-gray-700 hover:bg-gray-600 text-gray-200 rounded-lg transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          ) : null}

          <div className="space-y-4">
            {versions.map((version, index) => (
              <div key={version.id} className="bg-gray-800/40 border border-gray-700/50 rounded-xl p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <span className="px-3 py-1 bg-purple-500/20 text-purple-300 rounded-full text-sm font-medium">
                      {version.version}
                    </span>
                    {index === 0 && (
                      <span className="px-2 py-1 bg-green-500/20 text-green-300 rounded-full text-xs">
                        Latest
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-400">
                    <Clock className="w-4 h-4" />
                    {format(new Date(version.createdAt), 'MMM dd, yyyy')}
                  </div>
                </div>

                <div className="mb-4">
                  <h4 className="font-medium text-gray-200 mb-2">Changes</h4>
                  <p className="text-gray-400 text-sm">{version.changelog}</p>
                </div>

                <div className="bg-gray-900/40 rounded-lg p-4 mb-4">
                  <h4 className="font-medium text-gray-200 mb-2">Prompt Content</h4>
                  <p className="text-gray-300 text-sm whitespace-pre-wrap">{version.content}</p>
                </div>

                {version.performance && (
                  <div className="grid grid-cols-3 gap-4 mb-4">
                    <div className="text-center">
                      <div className={`text-lg font-bold ${getPerformanceColor(version.performance.averageRating)}`}>
                        {version.performance.averageRating.toFixed(1)}
                      </div>
                      <div className="text-xs text-gray-400">Avg Rating</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-bold text-blue-400">
                        {version.performance.totalEvaluations}
                      </div>
                      <div className="text-xs text-gray-400">Evaluations</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-bold text-green-400">
                        {(version.performance.successRate * 100).toFixed(0)}%
                      </div>
                      <div className="text-xs text-gray-400">Success Rate</div>
                    </div>
                  </div>
                )}

                <div className="flex items-center gap-2">
                  <button className="flex items-center gap-2 px-3 py-1 bg-gray-700/60 hover:bg-gray-600/60 text-gray-200 text-sm rounded-lg transition-colors">
                    <Eye className="w-4 h-4" />
                    View Details
                  </button>
                  <button className="flex items-center gap-2 px-3 py-1 bg-gray-700/60 hover:bg-gray-600/60 text-gray-200 text-sm rounded-lg transition-colors">
                    <Edit className="w-4 h-4" />
                    Edit
                  </button>
                  {index !== 0 && (
                    <button className="flex items-center gap-2 px-3 py-1 bg-gray-700/60 hover:bg-gray-600/60 text-gray-200 text-sm rounded-lg transition-colors">
                      <Archive className="w-4 h-4" />
                      Archive
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PromptVersioning;