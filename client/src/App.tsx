import React, { useState, useEffect, useRef } from "react";
import toast, { Toaster } from "react-hot-toast";
import { 
  ChevronLeft, ChevronRight, Menu, Sparkles, Image, Send, AlertCircle,
  BookOpen, Zap, TestTube, TrendingUp, GitBranch, Settings
} from 'lucide-react';
import LoadingSpinner from './components/LoadingSpinner';
import HistoryPanel from './components/HistoryPanel';
import ModelResponseCard from './components/ModelResponseCard';
import PromptTemplateLibrary from './components/PromptTemplateLibrary';
import PromptOptimizer from './components/PromptOptimizer';
import ABTestManager from './components/ABTestManager';
import PerformanceAnalytics from './components/PerformanceAnalytics';
import PromptVersioning from './components/PromptVersioning';
import CIPipeline from './components/CIPipeline';
import { Evaluation, PromptTemplate } from './types';

const STORAGE_KEY = "llmEvaluations";
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;


const examplePrompts = [
  "Explain quantum computing in simple terms with real-world applications",
  "What are the psychological and physical benefits of daily meditation practice?",
  "Create a funny story about a cat who thinks it's a dog",
  "How does blockchain technology work and what are its practical uses?",
  "Describe the process of photosynthesis and its importance to life on Earth",
  "What are the key differences between machine learning and artificial intelligence?",
  "Explain the concept of renewable energy and its environmental impact",
  "Write a creative poem about the changing seasons"
];

export default function LLMComparison() {
  const [prompt, setPrompt] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [responses, setResponses] = useState<{ [modelName: string]: string } | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [ratings, setRatings] = useState<{ [modelName: string]: number }>({});
  const [comments, setComments] = useState<{ [modelName: string]: string }>({});
  const [history, setHistory] = useState<Evaluation[]>([]);
  const [selectedEvalIndex, setSelectedEvalIndex] = useState<number | null>(null);
  const [toxicityScores, setToxicityScores] = useState<{ [model: string]: number }>({});
  const [hallucinationScores, setHallucinationScores] = useState<{ [model: string]: number }>({});
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [correctnessScores, setCorrectnessScores] = useState<{ [model: string]: number }>({});
  const [readabilityScores, setReadabilityScores] = useState<{ [model: string]: number }>({});
  const [lengthScores, setLengthScores] = useState<{ [model: string]: number }>({});
  const [showHistory, setShowHistory] = useState(false);
  const [showTemplateLibrary, setShowTemplateLibrary] = useState(false);
  const [showOptimizer, setShowOptimizer] = useState(false);
  const [showABTest, setShowABTest] = useState(false);
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [showVersioning, setShowVersioning] = useState(false);
  const [showCIPipeline, setShowCIPipeline] = useState(false);

  const carouselRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) setHistory(JSON.parse(saved));
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
  }, [history]);

  async function handleSubmit() {
    if (!prompt.trim()) {
      toast.error("Please enter a prompt first");
      return;
    }
    
    setLoading(true);
    setResponses(null);
    setToxicityScores({});
    setHallucinationScores({});
    setCorrectnessScores({});
    setReadabilityScores({});
    setLengthScores({});
    setError(null);

    try {
      // Generate responses from models
      const generateResponse = await fetch(`${API_BASE_URL}/generate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt }),
      });

      if (!generateResponse.ok) {
        throw new Error(`Failed to generate responses: ${generateResponse.status}`);
      }

      const responseData: { [modelName: string]: string } = await generateResponse.json();
      setResponses(responseData);

      // Evaluate safety (toxicity)
      try {
        const safetyResponse = await fetch(`${API_BASE_URL}/evaluate_safety`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ responses: responseData }),
        });

        if (safetyResponse.ok) {
          const toxicityData: { [model: string]: number } = await safetyResponse.json();
          setToxicityScores(toxicityData);
        }
      } catch (err) {
        console.warn("Failed to evaluate safety:", err);
        toast.error("Safety evaluation failed, but responses were generated");
      }

      // Evaluate readability
      try {
        const readabilityResponse = await fetch(`${API_BASE_URL}/evaluate_readability`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ responses: responseData }),
        });

        if (readabilityResponse.ok) {
          const readabilityData: { [model: string]: number } = await readabilityResponse.json();
          setReadabilityScores(readabilityData);
        }
      } catch (err) {
        console.warn("Failed to evaluate readability:", err);
      }

      // Evaluate length
      try {
        const lengthResponse = await fetch(`${API_BASE_URL}/evaluate_length`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ responses: responseData }),
        });

        if (lengthResponse.ok) {
          const lengthData: { [model: string]: number } = await lengthResponse.json();
          setLengthScores(lengthData);
        }
      } catch (err) {
        console.warn("Failed to evaluate length:", err);
      }

      // Reset feedback
      setRatings({});
      setComments({});

      // Save evaluation in history
      const newEval: Evaluation = {
        id: Date.now().toString(),
        prompt,
        imageUrl,
        responses: responseData,
        ratings: {},
        comments: {},
        timestamp: Date.now(),
        metrics: {
          toxicity: toxicityScores,
          readability: readabilityScores,
          length: lengthScores,
          responseTime: {}
        }
      };
      setHistory((prev) => [newEval, ...prev]);
      setSelectedEvalIndex(0);

      // Scroll carousel to start when new responses generated
      if (carouselRef.current) {
        carouselRef.current.scrollTo({ left: 0, behavior: "smooth" });
      }
      
      toast.success("Responses generated successfully!");
    } catch (err: any) {
      setError(err.message || "Something went wrong.");
      toast.error("Failed to generate responses. Make sure your FastAPI server is running on http://localhost:8000");
    } finally {
      setLoading(false);
    }
  }

  const handleRatingChange = (model: string, rating: number) => {
    setRatings((prev) => ({ ...prev, [model]: rating }));
  };

  const handleCommentChange = (model: string, text: string) => {
    setComments((prev) => ({ ...prev, [model]: text }));
  };

  const saveFeedback = (model: string) => {
    if (selectedEvalIndex === null) return;
    setHistory((prev) => {
      const updated = [...prev];
      const curr = updated[selectedEvalIndex];
      updated[selectedEvalIndex] = {
        ...curr,
        ratings: { ...curr.ratings, [model]: ratings[model] },
        comments: { ...curr.comments, [model]: comments[model] },
      };
      return updated;
    });
    toast.success(`Feedback for ${model} saved!`, {
      icon: '✅',
      style: {
        borderRadius: '12px',
        background: '#1f2937',
        color: '#f9fafb',
        border: '1px solid #374151',
      },
    });
  };

  const handleSelectHistory = (index: number) => {
    const evalData = history[index];
    setPrompt(evalData.prompt);
    setImageUrl(evalData.imageUrl);
    setResponses(evalData.responses);
    setRatings(evalData.ratings);
    setComments(evalData.comments);
    setSelectedEvalIndex(index);
    setToxicityScores({});
    setHallucinationScores({});
    setCorrectnessScores({});
    setReadabilityScores({});
    setLengthScores({});

    if (carouselRef.current) {
      carouselRef.current.scrollTo({ left: 0, behavior: "smooth" });
    }
    setShowHistory(false);
  };

  const handleSelectTemplate = (template: PromptTemplate) => {
    setPrompt(template.template);
  };

  const handleOptimizedPrompt = (optimizedPrompt: string) => {
    setPrompt(optimizedPrompt);
  };

  const scrollLeft = () => {
    if (carouselRef.current) {
      carouselRef.current.scrollBy({ left: -400, behavior: "smooth" });
    }
  };

  const scrollRight = () => {
    if (carouselRef.current) {
      carouselRef.current.scrollBy({ left: 400, behavior: "smooth" });
    }
  };

  // Sophisticated grid pattern
  const gridPattern = "data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cdefs%3E%3Cpattern id='grid' width='60' height='60' patternUnits='userSpaceOnUse'%3E%3Cpath d='M 60 0 L 0 0 0 60' fill='none' stroke='%23374151' stroke-width='1' opacity='0.1'/%3E%3C/pattern%3E%3C/defs%3E%3Crect width='100%25' height='100%25' fill='url(%23grid)'/%3E%3C/svg%3E";

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-slate-900 to-black relative overflow-x-hidden">
      {/* Sophisticated Background Effects */}
      <div 
        className="absolute inset-0 opacity-20"
        style={{ backgroundImage: `url("${gridPattern}")` }}
      />
      
      {/* Subtle animated gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-gray-800/5 to-transparent animate-pulse" 
           style={{ animationDuration: '4s' }} />
      
      {/* Toast Container */}
      <Toaster 
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: {
            background: 'rgba(31, 41, 55, 0.95)',
            backdropFilter: 'blur(16px)',
            border: '1px solid rgba(75, 85, 99, 0.3)',
            borderRadius: '12px',
            color: '#f9fafb',
          },
        }}
      />

      {/* Modals */}
      {showHistory && (
        <>
          <div 
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-20 transition-opacity duration-300"
            onClick={() => setShowHistory(false)}
          />
          <HistoryPanel
            history={history}
            selectedIndex={selectedEvalIndex}
            onSelectHistory={handleSelectHistory}
            onClose={() => setShowHistory(false)}
          />
        </>
      )}

      {showTemplateLibrary && (
        <PromptTemplateLibrary
          onSelectTemplate={handleSelectTemplate}
          onClose={() => setShowTemplateLibrary(false)}
        />
      )}

      {showOptimizer && (
        <PromptOptimizer
          prompt={prompt}
          onOptimizedPrompt={handleOptimizedPrompt}
          onClose={() => setShowOptimizer(false)}
        />
      )}

      {showABTest && (
        <ABTestManager onClose={() => setShowABTest(false)} />
      )}

      {showAnalytics && (
        <PerformanceAnalytics onClose={() => setShowAnalytics(false)} />
      )}

      {showVersioning && (
        <PromptVersioning
          promptId="current-prompt"
          onClose={() => setShowVersioning(false)}
        />
      )}

      {showCIPipeline && (
        <CIPipeline onClose={() => setShowCIPipeline(false)} />
      )}

      {/* Header */}
      <header className="relative z-10 pt-8 pb-4">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center justify-between mb-8">
            <button
              onClick={() => setShowHistory(true)}
              className="flex items-center gap-3 px-4 py-2 bg-gray-800/60 backdrop-blur-sm border border-gray-700/50 rounded-xl text-gray-200 hover:bg-gray-700/60 hover:border-gray-600/50 transition-all duration-200 shadow-lg hover:shadow-xl group"
              aria-label="Show history panel"
            >
              <Menu className="w-5 h-5 group-hover:text-white transition-colors" />
              <span className="font-medium group-hover:text-white transition-colors">History</span>
            </button>
            
            <div className="text-center">
              <h1 className="text-4xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-gray-100 via-gray-300 to-gray-500 mb-2 tracking-tight">
                AI Evaluation Suite
              </h1>
              <p className="text-gray-400 font-medium tracking-wide">Model Comparison Platform</p>
            </div>
            
            <div className="w-24"></div>
          </div>

          {/* Advanced Tools Bar */}
          <div className="flex flex-wrap items-center justify-center gap-3 mb-8">
            <button
              onClick={() => setShowTemplateLibrary(true)}
              className="flex items-center gap-2 px-4 py-2 bg-gray-800/40 backdrop-blur-sm border border-gray-700/50 rounded-lg text-gray-300 hover:bg-gray-700/50 hover:text-white transition-all duration-200 text-sm"
            >
              <BookOpen className="w-4 h-4" />
              Template Library
            </button>
            <button
              onClick={() => setShowOptimizer(true)}
              disabled={!prompt.trim()}
              className="flex items-center gap-2 px-4 py-2 bg-gray-800/40 backdrop-blur-sm border border-gray-700/50 rounded-lg text-gray-300 hover:bg-gray-700/50 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 text-sm"
            >
              <Zap className="w-4 h-4" />
              Optimize Prompt
            </button>
            <button
              onClick={() => setShowABTest(true)}
              className="flex items-center gap-2 px-4 py-2 bg-gray-800/40 backdrop-blur-sm border border-gray-700/50 rounded-lg text-gray-300 hover:bg-gray-700/50 hover:text-white transition-all duration-200 text-sm"
            >
              <TestTube className="w-4 h-4" />
              A/B Testing
            </button>
            <button
              onClick={() => setShowAnalytics(true)}
              className="flex items-center gap-2 px-4 py-2 bg-gray-800/40 backdrop-blur-sm border border-gray-700/50 rounded-lg text-gray-300 hover:bg-gray-700/50 hover:text-white transition-all duration-200 text-sm"
            >
              <TrendingUp className="w-4 h-4" />
              Analytics
            </button>
            <button
              onClick={() => setShowVersioning(true)}
              className="flex items-center gap-2 px-4 py-2 bg-gray-800/40 backdrop-blur-sm border border-gray-700/50 rounded-lg text-gray-300 hover:bg-gray-700/50 hover:text-white transition-all duration-200 text-sm"
            >
              <GitBranch className="w-4 h-4" />
              Versioning
            </button>
            <button
              onClick={() => setShowCIPipeline(true)}
              className="flex items-center gap-2 px-4 py-2 bg-gray-800/40 backdrop-blur-sm border border-gray-700/50 rounded-lg text-gray-300 hover:bg-gray-700/50 hover:text-white transition-all duration-200 text-sm"
            >
              <Settings className="w-4 h-4" />
              CI/CD Pipeline
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 pb-12">
        {/* Input Section */}
        <div className="bg-gray-800/30 backdrop-blur-xl border border-gray-700/50 rounded-2xl p-8 mb-8 shadow-2xl">
          {/* Example Prompts */}
          <div className="mb-6">
            <label htmlFor="prompt-examples" className="block text-sm font-semibold text-gray-300 mb-3 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-gray-400" />
              Quick Start Examples
            </label>
            <select
              id="prompt-examples"
              className="w-full p-4 bg-gray-900/60 backdrop-blur-sm border border-gray-600/50 rounded-xl text-gray-100 focus:ring-2 focus:ring-gray-500 focus:border-gray-500 transition-all duration-200 hover:border-gray-500/70"
              value=""
              onChange={(e) => setPrompt(e.target.value)}
              disabled={loading}
            >
              <option value="" className="text-gray-800 bg-gray-100">Select an example prompt to get started...</option>
              {examplePrompts.map((p) => (
                <option key={p} value={p} className="text-gray-800 bg-gray-100">
                  {p}
                </option>
              ))}
            </select>
          </div>

          {/* Prompt Input */}
          <div className="mb-6">
            <label className="block text-sm font-semibold text-gray-300 mb-3">
              Your Prompt
            </label>
            <textarea
              className="w-full p-4 bg-gray-900/60 backdrop-blur-sm border border-gray-600/50 rounded-xl text-gray-100 placeholder-gray-500 focus:ring-2 focus:ring-gray-500 focus:border-gray-500 transition-all duration-200 resize-none hover:border-gray-500/70"
              rows={4}
              placeholder="Enter your prompt here... Ask questions, request explanations, or give creative tasks."
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              disabled={loading}
            />
          </div>

          {/* Image URL Input */}
          <div className="mb-8">
            <label className="block text-sm font-semibold text-gray-300 mb-3 flex items-center gap-2">
              <Image className="w-4 h-4 text-gray-400" />
              Image URL (Optional)
            </label>
            <input
              type="url"
              className="w-full p-4 bg-gray-900/60 backdrop-blur-sm border border-gray-600/50 rounded-xl text-gray-100 placeholder-gray-500 focus:ring-2 focus:ring-gray-500 focus:border-gray-500 transition-all duration-200 hover:border-gray-500/70"
              placeholder="https://example.com/image.jpg"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              disabled={loading}
            />
          </div>

          {/* Submit Button */}
          <button
            className="w-full flex items-center justify-center gap-3 py-4 bg-gradient-to-r from-gray-700 to-gray-800 text-white font-bold rounded-xl shadow-xl hover:from-gray-600 hover:to-gray-700 disabled:opacity-60 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-[1.02] border border-gray-600/50 hover:border-gray-500/70"
            onClick={handleSubmit}
            disabled={loading || !prompt.trim()}
          >
            {loading ? (
              <>
                <LoadingSpinner />
                <span>Generating Responses...</span>
              </>
            ) : (
              <>
                <Send className="w-5 h-5" />
                <span>Generate & Compare Responses</span>
              </>
            )}
          </button>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-900/30 backdrop-blur-sm border border-red-800/50 text-red-200 p-4 rounded-xl mb-8 flex items-center gap-3">
            <AlertCircle className="w-5 h-5 flex-shrink-0 text-red-400" />
            <div>
              <p className="font-semibold">{error}</p>
              <p className="text-sm mt-1 opacity-80">
                Make sure your FastAPI server is running on http://localhost:8000
              </p>
            </div>
          </div>
        )}

        {/* Response Carousel */}
        {responses && (
          <div className="bg-gray-800/20 backdrop-blur-xl border border-gray-700/40 rounded-2xl p-8 shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-100">Model Performance Analysis</h2>
              <div className="flex items-center gap-2">
                <button
                  onClick={scrollLeft}
                  className="p-3 bg-gray-800/60 backdrop-blur-sm border border-gray-700/50 rounded-xl text-gray-300 hover:bg-gray-700/60 hover:text-white hover:border-gray-600/50 transition-all duration-200 shadow-lg hover:shadow-xl"
                  aria-label="Scroll left"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button
                  onClick={scrollRight}
                  className="p-3 bg-gray-800/60 backdrop-blur-sm border border-gray-700/50 rounded-xl text-gray-300 hover:bg-gray-700/60 hover:text-white hover:border-gray-600/50 transition-all duration-200 shadow-lg hover:shadow-xl"
                  aria-label="Scroll right"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div
              ref={carouselRef}
              className="flex overflow-x-auto gap-6 pb-4 scrollbar-hide"
              style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
              {Object.entries(responses).map(([model, text]) => (
                <ModelResponseCard
                  key={model}
                  model={model}
                  response={text}
                  toxicityScore={toxicityScores[model] ?? 0}
                  hallucinationScore={hallucinationScores[model] ?? 0}
                  correctnessScore={readabilityScores[model] ?? 1}
                  rating={ratings[model] ?? 0}
                  comment={comments[model] ?? ""}
                  onRatingChange={(rating: number) => handleRatingChange(model, rating)}
                  onCommentChange={(comment: string) => handleCommentChange(model, comment)}
                  onSaveFeedback={() => saveFeedback(model)}
                />
              ))}
            </div>
          </div>
        )}
      </main>

      <style>{`
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(0, 0, 0, 0.1);
          border-radius: 2px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(0, 0, 0, 0.3);
          border-radius: 2px;
        }
        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
      `}</style>
    </div>
  );
}
