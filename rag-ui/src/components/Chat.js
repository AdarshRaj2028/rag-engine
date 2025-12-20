// src/components/Chat.js
import React, { useState, useRef, useEffect } from 'react';
import { useFileContext } from '../context/FileContext';

const Chat = () => {
  const { uploadedFile, fileProcessed, newlyProcessed, clearNewlyProcessedFlag } = useFileContext();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const [streamingText, setStreamingText] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);

  // Welcome message with suggested questions
  const welcomeMessage = {
    role: 'assistant',
    content: `🎉 **Document successfully processed!** I've analyzed **${uploadedFile}** and I'm ready to help you explore its contents.

Here are some ways you can get started:

📋 "Summarize the main points of this document"
🔍 "What are the key findings or conclusions?"
💡 "Extract the most important data or statistics"
📖 "Explain the core concepts in simple terms"

Feel free to ask me anything about your document!`
  };

  // Show welcome message when a new file is processed
  useEffect(() => {
    if (newlyProcessed && uploadedFile) {
      setMessages([welcomeMessage]);
      clearNewlyProcessedFlag();
    }
  }, [newlyProcessed, uploadedFile, clearNewlyProcessedFlag]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, streamingText]);

  const handleSendMessage = async () => {
    if (!input.trim()) return;

    const userMessage = { role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    // Simulate API call
    setTimeout(() => {
      const responseText = `Based on **${uploadedFile || 'your document'}**, here is the answer to: '${input}'...

This is a simulation of the Retrieval Augmented Generation process. In a production environment, I would have queried the vector database, retrieved the top-k chunks, and synthesized this answer using an LLM.`;
      
      // Simulate streaming
      setIsStreaming(true);
      let currentText = '';
      const words = responseText.split(' ');
      
      words.forEach((word, index) => {
        setTimeout(() => {
          currentText += (index > 0 ? ' ' : '') + word;
          setStreamingText(currentText);
          
          if (index === words.length - 1) {
            setMessages(prev => [...prev, { role: 'assistant', content: responseText }]);
            setStreamingText('');
            setIsStreaming(false);
            setIsLoading(false);
          }
        }, index * 40);
      });
    }, 1200);
  };

  if (!fileProcessed) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-8">
        <div className="border-2 border-dashed border-purple-600 rounded-lg p-16 text-center max-w-md">
          <div className="text-6xl mb-4">📄</div>
          <h2 className="text-2xl font-bold mb-4 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">⏳ Waiting for Document</h2>
          <p className="text-purple-300 mb-6">
            Please upload a PDF file in the sidebar to initialize the RAG engine.
          </p>
          <div className="bg-purple-900 bg-opacity-50 rounded-lg p-4 text-sm text-purple-200">
            <p className="font-medium mb-2">📋 Upload Requirements:</p>
            <ul className="space-y-1 text-xs">
              <li>• Format: PDF only</li>
              <li>• Max size: 50MB</li>
              <li>• Drag & drop supported</li>
            </ul>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <div className="p-6 border-b border-purple-800 bg-purple-900 bg-opacity-30">
        <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">💬 Chat Interface</h1>
        {uploadedFile && (
          <p className="text-sm text-purple-300 mt-1">
            Chatting with: <span className="text-purple-400 font-medium">{uploadedFile}</span>
          </p>
        )}
      </div>
      
      <div className="flex-1 overflow-y-auto p-6 bg-purple-950 bg-opacity-50">
        {messages.map((message, index) => (
          <div key={index} className={`mb-4 flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-3xl px-4 py-3 rounded-lg ${
              message.role === 'user' 
                ? 'bg-purple-600 bg-opacity-30 border-l-4 border-purple-400' 
                : 'bg-purple-900 bg-opacity-50 border border-purple-700'
            }`}>
              <div className="flex items-start">
                <span className="mr-2 text-xl">{message.role === 'user' ? '👤' : '🤖'}</span>
                <div className="whitespace-pre-wrap text-purple-100">{message.content}</div>
              </div>
            </div>
          </div>
        ))}
        
        {isStreaming && (
          <div className="mb-4 flex justify-start">
            <div className="max-w-3xl px-4 py-3 rounded-lg bg-purple-900 bg-opacity-50 border border-purple-700">
              <div className="flex items-start">
                <span className="mr-2 text-xl">🤖</span>
                <div className="whitespace-pre-wrap text-purple-100">{streamingText}</div>
              </div>
            </div>
          </div>
        )}
        
        {isLoading && !isStreaming && (
          <div className="mb-4 flex justify-start">
            <div className="px-4 py-3 rounded-lg bg-purple-900 bg-opacity-50 border border-purple-700">
              <div className="flex items-center">
                <span className="mr-2 text-xl">🤖</span>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-purple-300 mr-2"></div>
                <span className="text-purple-200">🔍 Analyzing document nodes...</span>
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>
      
      <div className="p-4 border-t border-purple-800 bg-purple-900 bg-opacity-30">
        <div className="flex items-center">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
            placeholder="Ask a question about your document..."
            className="flex-1 bg-purple-900 bg-opacity-50 border border-purple-700 rounded-l-lg px-4 py-3 focus:outline-none focus:border-purple-500 text-purple-100 placeholder-purple-400"
          />
          <button
            onClick={handleSendMessage}
            disabled={!input.trim() || isLoading}
            className="bg-purple-600 hover:bg-purple-700 disabled:bg-purple-800 text-white px-6 py-3 rounded-r-lg transition-colors"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
};

export default Chat;

// // src/components/Chat.js
// import React, { useState, useRef, useEffect } from 'react';
// import { useParams } from 'react-router-dom';

// const Chat = () => {
//   const [messages, setMessages] = useState([]);
//   const [input, setInput] = useState('');
//   const [isLoading, setIsLoading] = useState(false);
//   const [fileProcessed, setFileProcessed] = useState(false);
//   const [uploadedFile, setUploadedFile] = useState(null);
//   const messagesEndRef = useRef(null);
//   const [streamingText, setStreamingText] = useState('');
//   const [isStreaming, setIsStreaming] = useState(false);

//   useEffect(() => {
//     // Simulate checking if file is processed
//     setFileProcessed(Math.random() > 0.5);
//     setUploadedFile('example-document.pdf');
//   }, []);

//   const scrollToBottom = () => {
//     messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
//   };

//   useEffect(() => {
//     scrollToBottom();
//   }, [messages, streamingText]);

//   const handleSendMessage = async () => {
//     if (!input.trim()) return;

//     const userMessage = { role: 'user', content: input };
//     setMessages(prev => [...prev, userMessage]);
//     setInput('');
//     setIsLoading(true);

//     // Simulate API call
//     setTimeout(() => {
//       const responseText = `Based on **${uploadedFile}**, here is the answer to: '${input}'...

// This is a simulation of the Retrieval Augmented Generation process. In a production environment, I would have queried the vector database, retrieved the top-k chunks, and synthesized this answer using an LLM.`;
      
//       // Simulate streaming
//       setIsStreaming(true);
//       let currentText = '';
//       const words = responseText.split(' ');
      
//       words.forEach((word, index) => {
//         setTimeout(() => {
//           currentText += (index > 0 ? ' ' : '') + word;
//           setStreamingText(currentText);
          
//           if (index === words.length - 1) {
//             setMessages(prev => [...prev, { role: 'assistant', content: responseText }]);
//             setStreamingText('');
//             setIsStreaming(false);
//             setIsLoading(false);
//           }
//         }, index * 40);
//       });
//     }, 1200);
//   };

//   if (!fileProcessed) {
//     return (
//       <div className="flex flex-col items-center justify-center h-full p-8">
//         <div className="border-2 border-dashed border-gray-600 rounded-lg p-16 text-center">
//           <h2 className="text-2xl font-bold mb-4">⏳ Waiting for Document</h2>
//           <p className="text-gray-400">
//             Please upload a PDF file in the sidebar to initialize the RAG engine.
//           </p>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="flex flex-col h-full">
//       <div className="p-6 border-b border-gray-700">
//         <h1 className="text-2xl font-bold">💬 Chat Interface</h1>
//       </div>
      
//       <div className="flex-1 overflow-y-auto p-6">
//         {messages.map((message, index) => (
//           <div key={index} className={`mb-4 flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
//             <div className={`max-w-3xl px-4 py-3 rounded-lg ${
//               message.role === 'user' 
//                 ? 'bg-indigo-600 bg-opacity-20 border-l-4 border-indigo-500' 
//                 : 'bg-gray-800 border border-gray-700'
//             }`}>
//               <div className="flex items-start">
//                 <span className="mr-2 text-xl">{message.role === 'user' ? '👤' : '🤖'}</span>
//                 <div className="whitespace-pre-wrap">{message.content}</div>
//               </div>
//             </div>
//           </div>
//         ))}
        
//         {isStreaming && (
//           <div className="mb-4 flex justify-start">
//             <div className="max-w-3xl px-4 py-3 rounded-lg bg-gray-800 border border-gray-700">
//               <div className="flex items-start">
//                 <span className="mr-2 text-xl">🤖</span>
//                 <div className="whitespace-pre-wrap">{streamingText}</div>
//               </div>
//             </div>
//           </div>
//         )}
        
//         {isLoading && !isStreaming && (
//           <div className="mb-4 flex justify-start">
//             <div className="px-4 py-3 rounded-lg bg-gray-800 border border-gray-700">
//               <div className="flex items-center">
//                 <span className="mr-2 text-xl">🤖</span>
//                 <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
//                 <span>🔍 Analyzing document nodes...</span>
//               </div>
//             </div>
//           </div>
//         )}
        
//         <div ref={messagesEndRef} />
//       </div>
      
//       <div className="p-4 border-t border-gray-700">
//         <div className="flex items-center">
//           <input
//             type="text"
//             value={input}
//             onChange={(e) => setInput(e.target.value)}
//             onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
//             placeholder="Ask a question about your document..."
//             className="flex-1 bg-gray-800 border border-gray-700 rounded-l-lg px-4 py-3 focus:outline-none focus:border-indigo-500"
//           />
//           <button
//             onClick={handleSendMessage}
//             disabled={!input.trim() || isLoading}
//             className="bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-700 text-white px-6 py-3 rounded-r-lg transition-colors"
//           >
//             Send
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default Chat;