import React from 'react';
import { History, Clock, MessageSquare, X } from 'lucide-react';

interface Evaluation {
  prompt: string;
  imageUrl: string;
  responses: { [modelName: string]: string };
  ratings: { [modelName: string]: number };
  comments: { [modelName: string]: string };
  timestamp: number;
}

interface HistoryPanelProps {
  history: Evaluation[];
  selectedIndex: number | null;
  onSelectHistory: (index: number) => void;
  onClose: () => void;
}

export default function HistoryPanel({ history, selectedIndex, onSelectHistory, onClose }: HistoryPanelProps) {
  return (
    <div className="fixed left-0 top-0 bottom-0 w-96 bg-white/95 backdrop-blur-xl border-r border-gray-200/50 shadow-2xl z-30 transform transition-transform duration-300">
      <div className="flex items-center justify-between p-6 border-b border-gray-200/50">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-br from-purple-500 to-blue-600 rounded-lg">
            <History className="w-5 h-5 text-white" />
          </div>
          <h2 className="text-xl font-bold text-gray-900">Evaluation History</h2>
        </div>
        <button
          onClick={onClose}
          className="p-2 rounded-lg hover:bg-gray-100 transition-colors duration-200"
          aria-label="Close history panel"
        >
          <X className="w-5 h-5 text-gray-500" />
        </button>
      </div>
      
      <div className="p-4 h-full overflow-auto">
        {history.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-gray-500">
            <MessageSquare className="w-12 h-12 mb-4 opacity-50" />
            <p className="text-lg font-medium">No evaluations yet</p>
            <p className="text-sm text-center">Start by generating your first LLM comparison</p>
          </div>
        ) : (
          <div className="space-y-3">
            {history.map((evalItem, index) => (
              <div
                key={evalItem.timestamp}
                onClick={() => onSelectHistory(index)}
                className={`cursor-pointer p-4 rounded-xl transition-all duration-200 hover:shadow-lg border ${
                  selectedIndex === index
                    ? 'bg-gradient-to-r from-purple-50 to-blue-50 border-purple-200 shadow-md'
                    : 'bg-white hover:bg-gray-50 border-gray-200'
                }`}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-medium line-clamp-2 ${
                      selectedIndex === index ? 'text-purple-900' : 'text-gray-900'
                    }`}>
                      {evalItem.prompt}
                    </p>
                  </div>
                  {selectedIndex === index && (
                    <div className="ml-2 w-2 h-2 bg-purple-500 rounded-full flex-shrink-0"></div>
                  )}
                </div>
                
                <div className="flex items-center gap-4 text-xs text-gray-500">
                  <div className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    <span>{new Date(evalItem.timestamp).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <MessageSquare className="w-3 h-3" />
                    <span>{Object.keys(evalItem.responses).length} models</span>
                  </div>
                </div>
                
                {evalItem.imageUrl && (
                  <div className="mt-2">
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800">
                      📸 Image included
                    </span>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}