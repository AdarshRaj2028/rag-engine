// src/App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './components/Home';
import Chat from './components/Chat';
import Features from './components/Features';
import FAQ from './components/FAQ';
import Sidebar from './components/Sidebar';
import { FileProvider } from './context/FileContext';
import './App.css';

function App() {
  return (
    <FileProvider>
      <Router>
        <div className="flex h-screen bg-purple-950 text-white">
          <Sidebar />
          <MainContent />
        </div>
      </Router>
    </FileProvider>
  );
}

function MainContent() {
  return (
    <div className="flex-1 overflow-y-auto">
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/chat" element={<Chat />} />
        <Route path="/features" element={<Features />} />
        <Route path="/faq" element={<FAQ />} />
      </Routes>
    </div>
  );
}

export default App;

// // src/App.js
// import React, { useState, useEffect, useRef } from 'react';
// import { BrowserRouter as Router, Routes, Route, Link, useNavigate } from 'react-router-dom';
// import Home from './components/Home';
// import Chat from './components/Chat';
// import Features from './components/Features';
// import FAQ from './components/FAQ';
// import './App.css';

// function App() {
//   return (
//     <Router>
//       <div className="flex h-screen bg-gray-900 text-white">
//         <Sidebar />
//         <MainContent />
//       </div>
//     </Router>
//   );
// }

// function Sidebar() {
//   const navigate = useNavigate();
//   const [uploadedFile, setUploadedFile] = useState(null);
//   const [fileProcessed, setFileProcessed] = useState(false);
//   const [uploaderKey, setUploaderKey] = useState(0);
//   const [isProcessing, setIsProcessing] = useState(false);
//   const fileInputRef = useRef(null);

//   const handleFileUpload = (e) => {
//     const file = e.target.files[0];
//     if (file) {
//       setUploadedFile(file.name);
//       setIsProcessing(true);
      
//       // Simulate processing
//       setTimeout(() => {
//         setFileProcessed(true);
//         setIsProcessing(false);
//       }, 4500);
//     }
//   };

//   const removeDocument = () => {
//     setUploadedFile(null);
//     setFileProcessed(false);
//     setUploaderKey(prev => prev + 1); // Reset the file input
//   };

//   return (
//     <div className="w-64 bg-gray-800 border-r border-gray-700 p-4 overflow-y-auto">
//       <div className="mb-6">
//         <h2 className="text-xl font-bold mb-2">🤖 RAG Engine</h2>
//         <p className="text-xs text-gray-400">v2.0 • Clean Edition</p>
//         <hr className="border-gray-700 my-4" />
//       </div>

//       <div className="mb-6">
//         <h3 className="text-sm font-semibold mb-3">Menu</h3>
//         <ul className="space-y-2">
//           <li>
//             <Link to="/" className="block w-full text-left px-3 py-2 rounded hover:bg-gray-700 transition-colors">
//               🏠 Home
//             </Link>
//           </li>
//           <li>
//             <Link to="/chat" className="block w-full text-left px-3 py-2 rounded hover:bg-gray-700 transition-colors">
//               💬 Chat Assistant
//             </Link>
//           </li>
//           <li>
//             <Link to="/features" className="block w-full text-left px-3 py-2 rounded hover:bg-gray-700 transition-colors">
//               ⚡ Features
//             </Link>
//           </li>
//           <li>
//             <Link to="/faq" className="block w-full text-left px-3 py-2 rounded hover:bg-gray-700 transition-colors">
//               ❓ Help & FAQ
//             </Link>
//           </li>
//         </ul>
//       </div>

//       <hr className="border-gray-700 my-4" />

//       <div className="mb-6">
//         <h3 className="text-sm font-semibold mb-3">📁 Document Context</h3>
        
//         <input
//           ref={fileInputRef}
//           key={uploaderKey}
//           type="file"
//           accept=".pdf"
//           onChange={handleFileUpload}
//           className="hidden"
//         />
        
//         <button
//           onClick={() => fileInputRef.current.click()}
//           className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-2 px-4 rounded transition-colors"
//         >
//           Upload PDF
//         </button>

//         {isProcessing && (
//           <div className="mt-4 p-3 bg-gray-700 rounded">
//             <div className="flex items-center">
//               <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
//               <span className="text-sm">Indexing Document...</span>
//             </div>
//             <div className="mt-2 text-xs text-gray-400">
//               <p>📄 Parsing PDF...</p>
//               <p>🧠 Generating Embeddings...</p>
//               <p>💾 Storing in Vector DB...</p>
//             </div>
//           </div>
//         )}

//         {uploadedFile && fileProcessed && (
//           <div className="mt-4 p-3 bg-green-900 rounded border border-green-700">
//             <p className="text-xs text-green-400 font-semibold">ACTIVE DOCUMENT</p>
//             <p className="text-sm text-white truncate">{uploadedFile}</p>
//             <button
//               onClick={removeDocument}
//               className="mt-2 text-xs bg-red-600 hover:bg-red-700 text-white py-1 px-2 rounded transition-colors"
//             >
//               ❌ Remove Document
//             </button>
//           </div>
//         )}

//         {!uploadedFile && !isProcessing && (
//           <div className="mt-4 p-3 bg-gray-700 rounded text-sm text-gray-400">
//             Upload a PDF to enable RAG Chat
//           </div>
//         )}
//       </div>
//     </div>
//   );
// }

// function MainContent() {
//   return (
//     <div className="flex-1 overflow-y-auto">
//       <Routes>
//         <Route path="/" element={<Home />} />
//         <Route path="/chat" element={<Chat />} />
//         <Route path="/features" element={<Features />} />
//         <Route path="/faq" element={<FAQ />} />
//       </Routes>
//     </div>
//   );
// }

// export default App;

// // // src/App.js
// // import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
// // import { useState } from "react";
// // import Sidebar from "./components/Sidebar";
// // import HomeChat from "./pages/HomeChat";
// // import Features from "./pages/Features";
// // import HelpFaq from "./pages/HelpFaq";
// // import About from "./pages/About";

// // const PRELOADED_DOCS = [
// //   { id: "ai", name: "AI – Research Overview" },
// //   { id: "biotech", name: "Biotech – Genomics & Health" },
// //   { id: "climate", name: "Climate Science – IPCC Summary" },
// //   { id: "quantum", name: "Quantum Computing – Basics" },
// //   { id: "sample", name: "Sample Docs – ReadyTensor" },
// //   { id: "space", name: "Space Exploration – Missions" },
// //   { id: "sustainable", name: "Sustainable Energy – Case Studies" },
// // ];

// // function App() {
// //   const [docs, setDocs] = useState(
// //     PRELOADED_DOCS.map((d) => ({
// //       ...d,
// //       kind: "builtin",
// //     }))
// //   );
// //   const [activeDocId, setActiveDocId] = useState(null);
// //   const [selectedModel, setSelectedModel] = useState("groq");

// //   const activeDoc = docs.find((d) => d.id === activeDocId) || null;

// //   return (
// //     <Router>
// //       <div className="min-h-screen flex bg-[#050013] text-slate-100">
// //         {/* Sidebar */}
// //         <Sidebar
// //           docs={docs}
// //           setDocs={setDocs}
// //           activeDocId={activeDocId}
// //           setActiveDocId={setActiveDocId}
// //         />

// //         {/* Main content area */}
// //         <div className="flex-1 flex flex-col">
// //           <header className="h-14 border-b border-purple-900/70 bg-[#08001d]/90 backdrop-blur flex items-center justify-between px-4 md:px-6">
// //             <div>
// //               <h1 className="text-sm md:text-base font-semibold tracking-wide">
// //                 <span className="bg-gradient-to-r from-purple-300 via-indigo-400 to-cyan-300 bg-clip-text text-transparent">
// //                   RAG Assistant Console
// //                 </span>
// //               </h1>
// //               <p className="text-[11px] text-slate-400">
// //                 Multi-domain knowledge • Deep-purple UI
// //               </p>
// //             </div>
// //             <div className="flex items-center gap-2 text-[11px]">
// //               <span className="hidden sm:inline text-slate-400">Model:</span>
// //               <select
// //                 className="bg-[#050013] border border-purple-800/70 text-[11px] rounded-lg px-2 py-1 outline-none focus:border-purple-400"
// //                 value={selectedModel}
// //                 onChange={(e) => setSelectedModel(e.target.value)}
// //               >
// //                 <option value="groq">Groq</option>
// //                 <option value="openai">OpenAI</option>
// //                 <option value="gemini">Gemini</option>
// //               </select>
// //               <span className="flex items-center gap-1 text-emerald-300">
// //                 <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
// //                 <span className="hidden sm:inline">API planned</span>
// //               </span>
// //             </div>
// //           </header>

// //           <main className="flex-1 overflow-y-auto bg-gradient-to-br from-[#050013] via-[#080024] to-[#020617] p-3 md:p-4">
// //             <Routes>
// //               <Route
// //                 path="/"
// //                 element={
// //                   <HomeChat
// //                     docs={docs}
// //                     activeDoc={activeDoc}
// //                     selectedModel={selectedModel}
// //                     onClearActiveDoc={()=>setActiveDocId(null)}
// //                   />
// //                 }
// //               />
// //               <Route path="/features" element={<Features />} />
// //               <Route path="/help" element={<HelpFaq />} />
// //               <Route path="/about" element={<About />} />
// //             </Routes>
// //           </main>
// //         </div>
// //       </div>
// //     </Router>
// //   );
// // }

// // export default App;