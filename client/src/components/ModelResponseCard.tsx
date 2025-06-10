import React from 'react';
import { Save, MessageSquare } from 'lucide-react';
import ScoreBadge from './ScoreBadge';
import StarRating from './StarRating';

interface ModelResponseCardProps {
  model: string;
  response: string;
  toxicityScore: number;
  hallucinationScore: number;
  correctnessScore: number;
  rating: number;
  comment: string;
  onRatingChange: (rating: number) => void;
  onCommentChange: (comment: string) => void;
  onSaveFeedback: () => void;
}

export default function ModelResponseCard({
  model,
  response,
  toxicityScore,
  hallucinationScore,
  correctnessScore,
  rating,
  comment,
  onRatingChange,
  onCommentChange,
  onSaveFeedback
}: ModelResponseCardProps) {
  // Clean up the response text by removing the original prompt if it's repeated
  const cleanResponse = (text: string) => {
    // If the response starts with the original prompt, try to extract just the new content
    const lines = text.split('\n');
    // Look for common patterns that indicate where the actual response starts
    const responseStart = lines.findIndex(line => 
      line.trim().length > 0 && 
      !line.includes('Human:') && 
      !line.includes('User:') &&
      !line.includes('Question:')
    );
    
    if (responseStart > 0) {
      return lines.slice(responseStart).join('\n').trim();
    }
    
    return text.trim();
  };

  const displayResponse = cleanResponse(response);

  return (
    <div className="min-w-[380px] max-w-[420px] flex-shrink-0 bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 overflow-hidden">
      <div className="p-6">
        {/* Model Header */}
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <div className="w-3 h-3 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"></div>
            {model}
          </h3>
          <div className="px-3 py-1 bg-gray-100 rounded-full text-xs font-medium text-gray-600">
            AI Model
          </div>
        </div>

        {/* Response Text */}
        <div className="mb-6">
          <div className="bg-gray-50/50 rounded-xl p-4 border border-gray-200/50">
            <div className="flex items-center gap-2 mb-2">
              <MessageSquare className="w-4 h-4 text-gray-500" />
              <span className="text-sm font-medium text-gray-700">Response</span>
            </div>
            <pre className="whitespace-pre-wrap text-sm leading-relaxed text-gray-800 max-h-40 overflow-y-auto custom-scrollbar">
              {displayResponse || "No response generated"}
            </pre>
          </div>
        </div>

        {/* Score Badges */}
        <div className="space-y-3 mb-6">
          <ScoreBadge type="safety" score={toxicityScore} label="Safety" />
          <ScoreBadge type="readability" score={correctnessScore} label="Readability" />
          {hallucinationScore > 0 && (
            <ScoreBadge type="hallucination" score={hallucinationScore} label="Hallucination" />
          )}
        </div>

        {/* Rating Section */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Rate this response
          </label>
          <StarRating
            rating={rating}
            onRatingChange={onRatingChange}
            modelName={model}
          />
        </div>

        {/* Comment Section */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Additional feedback (optional)
          </label>
          <textarea
            className="w-full p-3 border border-gray-300 rounded-xl resize-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 bg-white/50 backdrop-blur-sm"
            rows={3}
            placeholder="Share your thoughts about this response..."
            value={comment}
            onChange={(e) => onCommentChange(e.target.value)}
            aria-label={`Comments for model ${model}`}
          />
        </div>

        {/* Save Button */}
        <button
          onClick={onSaveFeedback}
          className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-500 to-green-600 text-white font-semibold py-3 px-4 rounded-xl hover:from-emerald-600 hover:to-green-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-[1.02]"
          aria-label={`Save feedback for model ${model}`}
        >
          <Save className="w-4 h-4" />
          Save Feedback
        </button>
      </div>
    </div>
  );
}