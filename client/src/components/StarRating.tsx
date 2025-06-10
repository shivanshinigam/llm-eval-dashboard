import React from 'react';
import { Star } from 'lucide-react';

interface StarRatingProps {
  rating: number;
  onRatingChange: (rating: number) => void;
  modelName: string;
}

export default function StarRating({ rating, onRatingChange, modelName }: StarRatingProps) {
  return (
    <div className="flex items-center gap-1" role="radiogroup" aria-label={`Rating for model ${modelName}`}>
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          onClick={() => onRatingChange(star)}
          className={`p-1 rounded-full transition-all duration-200 hover:scale-110 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 ${
            rating >= star ? 'text-amber-400 hover:text-amber-500' : 'text-gray-300 hover:text-gray-400'
          }`}
          aria-pressed={rating === star}
          aria-label={`Rate ${star} star${star > 1 ? 's' : ''} for ${modelName}`}
        >
          <Star 
            className={`w-5 h-5 ${rating >= star ? 'fill-current' : ''}`}
          />
        </button>
      ))}
      {rating > 0 && (
        <span className="ml-2 text-sm font-medium text-gray-600">
          {rating}/5
        </span>
      )}
    </div>
  );
}