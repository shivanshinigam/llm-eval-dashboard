import { PromptTemplate } from '../types';

export const promptTemplates: PromptTemplate[] = [
  {
    id: 'explain-concept',
    name: 'Concept Explanation',
    category: 'Educational',
    template: 'Explain {concept} in simple terms that a {audience} would understand. Include {examples} real-world examples and explain why it matters.',
    description: 'Template for explaining complex concepts to different audiences',
    variables: ['concept', 'audience', 'examples'],
    tags: ['education', 'explanation', 'teaching'],
    createdAt: Date.now() - 86400000,
    usageCount: 45,
    averageRating: 4.2
  },
  {
    id: 'creative-writing',
    name: 'Creative Story Generator',
    category: 'Creative',
    template: 'Write a {genre} story about {character} who {situation}. The story should be {length} and have a {tone} tone. Include dialogue and vivid descriptions.',
    description: 'Generate creative stories with specific parameters',
    variables: ['genre', 'character', 'situation', 'length', 'tone'],
    tags: ['creative', 'story', 'writing', 'fiction'],
    createdAt: Date.now() - 172800000,
    usageCount: 32,
    averageRating: 4.5
  },
  {
    id: 'technical-analysis',
    name: 'Technical Analysis',
    category: 'Technical',
    template: 'Analyze the {technology} and explain its {aspects}. Compare it with {alternatives} and discuss the pros and cons. Provide recommendations for {use_case}.',
    description: 'Deep dive into technical topics with comparative analysis',
    variables: ['technology', 'aspects', 'alternatives', 'use_case'],
    tags: ['technical', 'analysis', 'comparison', 'recommendation'],
    createdAt: Date.now() - 259200000,
    usageCount: 28,
    averageRating: 4.1
  },
  {
    id: 'problem-solving',
    name: 'Problem Solving Framework',
    category: 'Business',
    template: 'I have a problem: {problem_description}. Help me break this down using a structured approach. Identify the root causes, potential solutions, and create an action plan with {timeline}.',
    description: 'Structured approach to problem-solving with actionable outcomes',
    variables: ['problem_description', 'timeline'],
    tags: ['problem-solving', 'business', 'strategy', 'planning'],
    createdAt: Date.now() - 345600000,
    usageCount: 67,
    averageRating: 4.7
  },
  {
    id: 'code-review',
    name: 'Code Review Assistant',
    category: 'Development',
    template: 'Review this {language} code and provide feedback on: {review_aspects}. Suggest improvements for performance, readability, and best practices. Code: {code_snippet}',
    description: 'Comprehensive code review with improvement suggestions',
    variables: ['language', 'review_aspects', 'code_snippet'],
    tags: ['development', 'code-review', 'programming', 'best-practices'],
    createdAt: Date.now() - 432000000,
    usageCount: 89,
    averageRating: 4.3
  },
  {
    id: 'market-research',
    name: 'Market Research Query',
    category: 'Business',
    template: 'Conduct market research for {product_service} in the {industry} industry. Focus on {research_areas}. Provide insights on target audience, competition, and market opportunities.',
    description: 'Comprehensive market research template for business analysis',
    variables: ['product_service', 'industry', 'research_areas'],
    tags: ['market-research', 'business', 'analysis', 'strategy'],
    createdAt: Date.now() - 518400000,
    usageCount: 23,
    averageRating: 4.0
  }
];