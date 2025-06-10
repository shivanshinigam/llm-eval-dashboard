import React, { useState } from 'react';
import { TestTube, Play, Pause, BarChart3, Plus,  Trash2 } from 'lucide-react';
import { ABTest } from '../types';

interface ABTestManagerProps {
  onClose: () => void;
}

const ABTestManager: React.FC<ABTestManagerProps> = ({ onClose }) => {
  const [tests, setTests] = useState<ABTest[]>([
    {
      id: '1',
      name: 'Creative Writing Prompts',
      description: 'Testing different approaches to creative writing prompts',
      variants: [
        { id: 'a', name: 'Direct Approach', prompt: 'Write a short story about...', weight: 50 },
        { id: 'b', name: 'Structured Approach', prompt: 'Create a narrative with the following elements...', weight: 50 }
      ],
      status: 'running',
      createdAt: Date.now() - 86400000,
      results: {
        'a': { evaluations: 45, averageRating: 4.2, metrics: {} },
        'b': { evaluations: 38, averageRating: 4.5, metrics: {} }
      }
    },
    {
      id: '2',
      name: 'Technical Explanation Styles',
      description: 'Comparing formal vs casual explanation styles',
      variants: [
        { id: 'a', name: 'Formal Style', prompt: 'Provide a comprehensive technical analysis of...', weight: 50 },
        { id: 'b', name: 'Casual Style', prompt: 'Explain in simple terms how...', weight: 50 }
      ],
      status: 'completed',
      createdAt: Date.now() - 172800000,
      results: {
        'a': { evaluations: 67, averageRating: 3.8, metrics: {} },
        'b': { evaluations: 72, averageRating: 4.3, metrics: {} }
      }
    }
  ]);

  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newTest, setNewTest] = useState({
    name: '',
    description: '',
    variants: [
      { name: 'Variant A', prompt: '', weight: 50 },
      { name: 'Variant B', prompt: '', weight: 50 }
    ]
  });

  const handleCreateTest = () => {
    const test: ABTest = {
      id: Date.now().toString(),
      name: newTest.name,
      description: newTest.description,
      variants: newTest.variants.map((v, i) => ({
        id: String.fromCharCode(97 + i),
        name: v.name,
        prompt: v.prompt,
        weight: v.weight
      })),
      status: 'draft',
      createdAt: Date.now()
    };
    
    setTests([test, ...tests]);
    setShowCreateForm(false);
    setNewTest({
      name: '',
      description: '',
      variants: [
        { name: 'Variant A', prompt: '', weight: 50 },
        { name: 'Variant B', prompt: '', weight: 50 }
      ]
    });
  };

  const toggleTestStatus = (testId: string) => {
    setTests(tests.map(test => 
      test.id === testId 
        ? { ...test, status: test.status === 'running' ? 'paused' : 'running' as any }
        : test
    ));
  };

  const deleteTest = (testId: string) => {
    setTests(tests.filter(test => test.id !== testId));
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'running': return 'text-green-400 bg-green-500/20';
      case 'paused': return 'text-yellow-400 bg-yellow-500/20';
      case 'completed': return 'text-blue-400 bg-blue-500/20';
      default: return 'text-gray-400 bg-gray-500/20';
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-gray-900/95 backdrop-blur-xl border border-gray-700/50 rounded-2xl w-full max-w-6xl h-[80vh] flex flex-col shadow-2xl">
        <div className="p-6 border-b border-gray-700/50">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-100 flex items-center gap-2">
              <TestTube className="w-6 h-6 text-blue-400" />
              A/B Test Manager
            </h2>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowCreateForm(true)}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
              >
                <Plus className="w-4 h-4" />
                New Test
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
            <div className="bg-gray-800/40 border border-gray-700/50 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-gray-200 mb-4">Create New A/B Test</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Test Name</label>
                  <input
                    type="text"
                    value={newTest.name}
                    onChange={(e) => setNewTest({...newTest, name: e.target.value})}
                    className="w-full p-3 bg-gray-900/40 border border-gray-700/50 rounded-lg text-gray-200"
                    placeholder="Enter test name..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Description</label>
                  <textarea
                    value={newTest.description}
                    onChange={(e) => setNewTest({...newTest, description: e.target.value})}
                    className="w-full p-3 bg-gray-900/40 border border-gray-700/50 rounded-lg text-gray-200 resize-none"
                    rows={3}
                    placeholder="Describe what you're testing..."
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {newTest.variants.map((variant, index) => (
                    <div key={index} className="bg-gray-900/40 border border-gray-700/50 rounded-lg p-4">
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        {variant.name}
                      </label>
                      <textarea
                        value={variant.prompt}
                        onChange={(e) => {
                          const updatedVariants = [...newTest.variants];
                          updatedVariants[index].prompt = e.target.value;
                          setNewTest({...newTest, variants: updatedVariants});
                        }}
                        className="w-full p-3 bg-gray-800/40 border border-gray-600/50 rounded-lg text-gray-200 resize-none"
                        rows={4}
                        placeholder="Enter prompt variant..."
                      />
                    </div>
                  ))}
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={handleCreateTest}
                    disabled={!newTest.name || !newTest.variants.every(v => v.prompt)}
                    className="px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-lg transition-colors"
                  >
                    Create Test
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
          ) : (
            <div className="space-y-4">
              {tests.map(test => (
                <div key={test.id} className="bg-gray-800/40 border border-gray-700/50 rounded-xl p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-200 mb-1">{test.name}</h3>
                      <p className="text-gray-400 text-sm">{test.description}</p>
                      <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium mt-2 ${getStatusColor(test.status)}`}>
                        {test.status.charAt(0).toUpperCase() + test.status.slice(1)}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => toggleTestStatus(test.id)}
                        className="p-2 hover:bg-gray-700/60 rounded-lg transition-colors text-gray-400 hover:text-white"
                      >
                        {test.status === 'running' ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                      </button>
                      <button
                        onClick={() => deleteTest(test.id)}
                        className="p-2 hover:bg-gray-700/60 rounded-lg transition-colors text-gray-400 hover:text-red-400"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {test.variants.map(variant => (
                      <div key={variant.id} className="bg-gray-900/40 border border-gray-700/50 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-medium text-gray-200">{variant.name}</h4>
                          {test.results && (
                            <div className="flex items-center gap-2 text-sm text-gray-400">
                              <BarChart3 className="w-4 h-4" />
                              {test.results[variant.id]?.evaluations || 0} evals
                            </div>
                          )}
                        </div>
                        <p className="text-sm text-gray-400 mb-3 line-clamp-2">{variant.prompt}</p>
                        {test.results && test.results[variant.id] && (
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-400">Avg Rating:</span>
                            <span className="text-yellow-400 font-medium">
                              {test.results[variant.id].averageRating.toFixed(1)}/5
                            </span>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))}

              {tests.length === 0 && (
                <div className="text-center py-12">
                  <TestTube className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                  <p className="text-gray-400">No A/B tests created yet.</p>
                  <button
                    onClick={() => setShowCreateForm(true)}
                    className="mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                  >
                    Create Your First Test
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ABTestManager;