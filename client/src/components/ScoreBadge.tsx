import React from 'react';
import { CheckCircle, AlertTriangle, XCircle, BookOpen } from 'lucide-react';

interface ScoreBadgeProps {
  type: 'safety' | 'hallucination' | 'correctness' | 'readability';
  score: number;
  label: string;
}

export default function ScoreBadge({ type, score, label }: ScoreBadgeProps) {
  const getScoreConfig = () => {
    switch (type) {
      case 'safety':
        const isSafe = score <= 0.3;
        return {
          color: isSafe ? 'text-emerald-700' : 'text-red-700',
          bgColor: isSafe ? 'bg-emerald-50' : 'bg-red-50',
          borderColor: isSafe ? 'border-emerald-200' : 'border-red-200',
          icon: isSafe ? CheckCircle : AlertTriangle,
          status: isSafe ? 'Safe' : 'Potentially Toxic'
        };
      case 'hallucination':
        const isLowHalluc = score <= 0.5;
        return {
          color: isLowHalluc ? 'text-emerald-700' : 'text-orange-700',
          bgColor: isLowHalluc ? 'bg-emerald-50' : 'bg-orange-50',
          borderColor: isLowHalluc ? 'border-emerald-200' : 'border-orange-200',
          icon: isLowHalluc ? CheckCircle : AlertTriangle,
          status: isLowHalluc ? 'Low Risk' : 'Possible Hallucination'
        };
      case 'correctness':
        const isCorrect = score >= 0.5;
        return {
          color: isCorrect ? 'text-emerald-700' : 'text-red-700',
          bgColor: isCorrect ? 'bg-emerald-50' : 'bg-red-50',
          borderColor: isCorrect ? 'border-emerald-200' : 'border-red-200',
          icon: isCorrect ? CheckCircle : XCircle,
          status: isCorrect ? 'Accurate' : 'Needs Review'
        };
      case 'readability':
        const isReadable = score >= 0.5;
        return {
          color: isReadable ? 'text-emerald-700' : 'text-orange-700',
          bgColor: isReadable ? 'bg-emerald-50' : 'bg-orange-50',
          borderColor: isReadable ? 'border-emerald-200' : 'border-orange-200',
          icon: isReadable ? BookOpen : AlertTriangle,
          status: isReadable ? 'Easy to Read' : 'Complex'
        };
    }
  };

  const config = getScoreConfig();
  const Icon = config.icon;

  return (
    <div className={`flex items-center gap-2 px-3 py-2 rounded-lg border ${config.bgColor} ${config.borderColor} transition-all duration-200 hover:shadow-md`}>
      <Icon className={`w-4 h-4 ${config.color}`} />
      <div className="flex flex-col">
        <span className="text-xs font-medium text-gray-600 uppercase tracking-wide">{label}</span>
        <div className="flex items-center gap-2">
          <span className={`text-sm font-bold ${config.color}`}>{score.toFixed(2)}</span>
          <span className={`text-xs ${config.color}`}>• {config.status}</span>
        </div>
      </div>
    </div>
  );
}