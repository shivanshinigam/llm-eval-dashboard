import React, { useState } from 'react';
import { Lightbulb, Zap, Target, CheckCircle, AlertTriangle } from 'lucide-react';

interface PromptOptimizerProps {
  prompt: string;
  onOptimizedPrompt: (optimizedPrompt: string) => void;
  onClose: () => void;
}

const PromptOptimizer: React.FC<PromptOptimizerProps> = ({
  prompt,
  onOptimizedPrompt,
  onClose,
}) => {
  const [analyzing, setAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<any>(null);

  const analyzePrompt = () => {
    setAnalyzing(true);
    
    // Simulate analysis
    setTimeout(() => {
      const suggestions = generateSuggestions(prompt);
      setAnalysis(suggestions);
      setAnalyzing(false);
    }, 2000);
  };

  const generateSuggestions = (text: string) => {
    const issues = [];
    const improvements = [];
    let score = 85;

    // Check for clarity
    if (text.length < 20) {
      issues.push({
        type: 'warning',
        title: 'Too Brief',
        description: 'Your prompt might be too short to get detailed responses.',
        impact: 'Medium'
      });
      score -= 10;
    }

    if (!text.includes('?') && !text.toLowerCase().includes('explain') && !text.toLowerCase().includes('describe')) {
      issues.push({
        type: 'warning',
        title: 'Unclear Intent',
        description: 'Consider adding clear questions or instructions.',
        impact: 'High'
      });
      score -= 15;
    }

    // Check for specificity
    if (!text.toLowerCase().includes('example') && !text.toLowerCase().includes('specific')) {
      improvements.push({
        title: 'Add Examples Request',
        description: 'Ask for specific examples to get more concrete responses.',
        optimized: text + ' Please provide specific examples to illustrate your points.'
      });
    }

    // Check for context
    if (text.split(' ').length > 50) {
      improvements.push({
        title: 'Simplify Structure',
        description: 'Break down complex prompts into clearer sections.',
        optimized: text.split('.').map((sentence, i) => 
          i === 0 ? sentence + '.' : `\n${i}. ${sentence.trim()}`
        ).join('')
      });
    }

    // Add structure improvements
    improvements.push({
      title: 'Enhanced Structure',
      description: 'Add clear formatting and expectations.',
      optimized: `${text}\n\nPlease structure your response with:\n1. Key points\n2. Detailed explanations\n3. Practical examples\n4. Summary or conclusion`
    });

    return {
      score,
      issues,
      improvements,
      optimizedVersions: improvements.map(imp => imp.optimized)
    };
  };

  const applyOptimization = (optimizedPrompt: string) => {
    onOptimizedPrompt(optimizedPrompt);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-gray-900/95 backdrop-blur-xl border border-gray-700/50 rounded-2xl w-full max-w-4xl max-h-[80vh] overflow-y-auto shadow-2xl">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-100 flex items-center gap-2">
              <Zap className="w-6 h-6 text-yellow-400" />
              Prompt Optimizer
            </h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-800/60 rounded-lg transition-colors text-gray-400 hover:text-white"
            >
              ✕
            </button>
          </div>

          {/* Original Prompt */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-200 mb-3">Original Prompt</h3>
            <div className="bg-gray-800/40 border border-gray-700/50 rounded-lg p-4">
              <p className="text-gray-300">{prompt}</p>
            </div>
          </div>

          {!analysis ? (
            <div className="text-center py-8">
              <button
                onClick={analyzePrompt}
                disabled={analyzing}
                className="flex items-center justify-center gap-3 px-6 py-3 bg-gradient-to-r from-yellow-600 to-orange-600 text-white font-semibold rounded-xl hover:from-yellow-700 hover:to-orange-700 disabled:opacity-60 transition-all duration-200"
              >
                {analyzing ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                    Analyzing Prompt...
                  </>
                ) : (
                  <>
                    <Target className="w-5 h-5" />
                    Analyze & Optimize
                  </>
                )}
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Score */}
              <div className="bg-gray-800/40 border border-gray-700/50 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-lg font-semibold text-gray-200">Prompt Quality Score</h3>
                  <span className={`text-2xl font-bold ${
                    analysis.score >= 80 ? 'text-green-400' : 
                    analysis.score >= 60 ? 'text-yellow-400' : 'text-red-400'
                  }`}>
                    {analysis.score}/100
                  </span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full transition-all duration-500 ${
                      analysis.score >= 80 ? 'bg-green-400' : 
                      analysis.score >= 60 ? 'bg-yellow-400' : 'bg-red-400'
                    }`}
                    style={{ width: `${analysis.score}%` }}
                  ></div>
                </div>
              </div>

              {/* Issues */}
              {analysis.issues.length > 0 && (
                <div className="bg-gray-800/40 border border-gray-700/50 rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-gray-200 mb-3 flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5 text-yellow-400" />
                    Issues Found
                  </h3>
                  <div className="space-y-3">
                    {analysis.issues.map((issue: any, index: number) => (
                      <div key={index} className="flex items-start gap-3 p-3 bg-gray-900/40 rounded-lg">
                        <AlertTriangle className="w-4 h-4 text-yellow-400 mt-0.5 flex-shrink-0" />
                        <div>
                          <h4 className="font-medium text-gray-200">{issue.title}</h4>
                          <p className="text-sm text-gray-400 mt-1">{issue.description}</p>
                          <span className={`text-xs px-2 py-1 rounded-full mt-2 inline-block ${
                            issue.impact === 'High' ? 'bg-red-500/20 text-red-300' :
                            issue.impact === 'Medium' ? 'bg-yellow-500/20 text-yellow-300' :
                            'bg-blue-500/20 text-blue-300'
                          }`}>
                            {issue.impact} Impact
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Improvements */}
              <div className="bg-gray-800/40 border border-gray-700/50 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-gray-200 mb-3 flex items-center gap-2">
                  <Lightbulb className="w-5 h-5 text-blue-400" />
                  Optimization Suggestions
                </h3>
                <div className="space-y-4">
                  {analysis.improvements.map((improvement: any, index: number) => (
                    <div key={index} className="border border-gray-700/50 rounded-lg p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h4 className="font-medium text-gray-200">{improvement.title}</h4>
                          <p className="text-sm text-gray-400 mt-1">{improvement.description}</p>
                        </div>
                        <button
                          onClick={() => applyOptimization(improvement.optimized)}
                          className="flex items-center gap-2 px-3 py-1 bg-blue-600/20 text-blue-300 text-sm rounded-lg hover:bg-blue-600/30 transition-colors"
                        >
                          <CheckCircle className="w-4 h-4" />
                          Apply
                        </button>
                      </div>
                      <div className="bg-gray-900/40 rounded-lg p-3">
                        <p className="text-sm text-gray-300 whitespace-pre-wrap">{improvement.optimized}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PromptOptimizer;