import React, { useState } from 'react';
import { Search, Filter, Star, Copy, Edit, Plus, Tag, TrendingUp } from 'lucide-react';
import { PromptTemplate } from '../types';
import { promptTemplates } from '../data/promptTemplates';
import toast from 'react-hot-toast';

interface PromptTemplateLibraryProps {
  onSelectTemplate: (template: PromptTemplate) => void;
  onClose: () => void;
}

const PromptTemplateLibrary: React.FC<PromptTemplateLibraryProps> = ({
  onSelectTemplate,
  onClose,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [sortBy, setSortBy] = useState<'name' | 'usage' | 'rating'>('usage');

  const categories = ['All', ...Array.from(new Set(promptTemplates.map(t => t.category)))];

  const filteredTemplates = promptTemplates
    .filter(template => {
      const matchesSearch = template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           template.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           template.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
      const matchesCategory = selectedCategory === 'All' || template.category === selectedCategory;
      return matchesSearch && matchesCategory;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'usage':
          return b.usageCount - a.usageCount;
        case 'rating':
          return b.averageRating - a.averageRating;
        default:
          return 0;
      }
    });

  const handleUseTemplate = (template: PromptTemplate) => {
    onSelectTemplate(template);
    toast.success(`Template "${template.name}" applied!`);
    onClose();
  };

  const handleCopyTemplate = (template: PromptTemplate) => {
    navigator.clipboard.writeText(template.template);
    toast.success('Template copied to clipboard!');
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-gray-900/95 backdrop-blur-xl border border-gray-700/50 rounded-2xl w-full max-w-6xl h-[80vh] flex flex-col shadow-2xl">
        {/* Header */}
        <div className="p-6 border-b border-gray-700/50">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-gray-100 flex items-center gap-2">
              <Edit className="w-6 h-6 text-gray-400" />
              Prompt Template Library
            </h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-800/60 rounded-lg transition-colors text-gray-400 hover:text-white"
            >
              ✕
            </button>
          </div>

          {/* Search and Filters */}
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search templates, descriptions, or tags..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-gray-800/60 border border-gray-700/50 rounded-lg text-gray-200 placeholder-gray-500 focus:ring-2 focus:ring-gray-500 focus:border-gray-500"
              />
            </div>
            
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-4 py-2 bg-gray-800/60 border border-gray-700/50 rounded-lg text-gray-200 focus:ring-2 focus:ring-gray-500"
            >
              {categories.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as 'name' | 'usage' | 'rating')}
              className="px-4 py-2 bg-gray-800/60 border border-gray-700/50 rounded-lg text-gray-200 focus:ring-2 focus:ring-gray-500"
            >
              <option value="usage">Most Used</option>
              <option value="rating">Highest Rated</option>
              <option value="name">Name</option>
            </select>
          </div>
        </div>

        {/* Templates Grid */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredTemplates.map(template => (
              <div
                key={template.id}
                className="bg-gray-800/40 border border-gray-700/50 rounded-xl p-4 hover:border-gray-600/60 transition-all duration-200 group"
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-semibold text-gray-100 mb-1">{template.name}</h3>
                    <span className="text-xs px-2 py-1 bg-gray-700/50 text-gray-300 rounded-full">
                      {template.category}
                    </span>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-gray-400">
                    <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                    {template.averageRating.toFixed(1)}
                  </div>
                </div>

                <p className="text-sm text-gray-400 mb-3 line-clamp-2">
                  {template.description}
                </p>

                <div className="mb-3">
                  <div className="flex flex-wrap gap-1 mb-2">
                    {template.tags.slice(0, 3).map(tag => (
                      <span
                        key={tag}
                        className="text-xs px-2 py-1 bg-gray-700/30 text-gray-400 rounded-full flex items-center gap-1"
                      >
                        <Tag className="w-2 h-2" />
                        {tag}
                      </span>
                    ))}
                  </div>
                  <div className="flex items-center gap-3 text-xs text-gray-500">
                    <span className="flex items-center gap-1">
                      <TrendingUp className="w-3 h-3" />
                      {template.usageCount} uses
                    </span>
                  </div>
                </div>

                <div className="bg-gray-900/40 rounded-lg p-3 mb-3">
                  <code className="text-xs text-gray-300 line-clamp-3">
                    {template.template}
                  </code>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => handleUseTemplate(template)}
                    className="flex-1 flex items-center justify-center gap-2 py-2 bg-gray-700/60 hover:bg-gray-600/60 text-gray-200 text-sm font-medium rounded-lg transition-all duration-200"
                  >
                    <Plus className="w-4 h-4" />
                    Use Template
                  </button>
                  <button
                    onClick={() => handleCopyTemplate(template)}
                    className="p-2 bg-gray-700/60 hover:bg-gray-600/60 text-gray-200 rounded-lg transition-all duration-200"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {filteredTemplates.length === 0 && (
            <div className="text-center py-12">
              <Filter className="w-12 h-12 text-gray-600 mx-auto mb-4" />
              <p className="text-gray-400">No templates found matching your criteria.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PromptTemplateLibrary;