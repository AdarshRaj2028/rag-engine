// src/components/FAQ.js
import React, { useState } from 'react';

const FAQ = () => {
  const [expandedItems, setExpandedItems] = useState({});

  const toggleExpanded = (key) => {
    setExpandedItems(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const faqs = [
    {
      question: "🔒 Is my data secure?",
      answer: "Yes, all processing happens in ephemeral memory. We do not store your documents permanently."
    },
    {
      question: "📄 What formats are supported?",
      answer: "Currently PDF. We are working on DOCX and TXT support."
    },
    {
      question: "🎯 How accurate is the RAG?",
      answer: "It depends on the source quality. The engine uses a Top-K retrieval of 5 chunks for maximum context."
    }
  ];

  return (
    <div className="p-8 bg-purple-950 bg-opacity-50">
      <h1 className="text-2xl font-bold mb-6 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">❓ Frequently Asked Questions</h1>
      
      <div className="space-y-4">
        {faqs.map((faq, index) => (
          <div key={index} className="bg-purple-900 bg-opacity-50 rounded-lg overflow-hidden border border-purple-700">
            <button
              onClick={() => toggleExpanded(index)}
              className="w-full px-6 py-4 text-left flex justify-between items-center hover:bg-purple-800 hover:bg-opacity-30 transition-colors"
            >
              <span className="font-medium text-purple-100">{faq.question}</span>
              <span className="text-purple-400 text-xl">
                {expandedItems[index] ? '−' : '+'}
              </span>
            </button>
            
            {expandedItems[index] && (
              <div className="px-6 py-4 border-t border-purple-700 text-purple-300 bg-purple-800 bg-opacity-20">
                {faq.answer}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default FAQ;