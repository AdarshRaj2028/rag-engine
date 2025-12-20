// src/components/Sidebar.js
import React, { useState, useRef, useCallback } from 'react';
import { Link, useLocation } from 'react-router-dom'; // Import useLocation
import { useFileContext } from '../context/FileContext';

const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB in bytes

function Sidebar() {
  const location = useLocation(); // Get current location
  const {
    uploadedFile,
    fileProcessed,
    isProcessing,
    uploaderKey,
    handleFileUpload,
    removeDocument
  } = useFileContext();

  const [isDragging, setIsDragging] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const fileInputRef = useRef(null);
  const dragCounter = useRef(0);

  // Function to check if a menu item is active
  const isActive = (path) => {
    return location.pathname === path;
  };

  const validateFile = (file) => {
    if (!file) return false;
    
    // Check file type
    if (file.type !== 'application/pdf') {
      setUploadError('Please upload a PDF file only.');
      return false;
    }
    
    // Check file size
    if (file.size > MAX_FILE_SIZE) {
      setUploadError(`File size must be less than 50MB. Current size: ${(file.size / (1024 * 1024)).toFixed(2)}MB`);
      return false;
    }
    
    setUploadError('');
    return true;
  };

  const processFileUpload = (file) => {
    if (!validateFile(file)) return;
    handleFileUpload(file);
  };

  const handleFileInputChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      processFileUpload(file);
    }
  };

  const handleDragEnter = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounter.current++;
    if (e.dataTransfer.items && e.dataTransfer.items.length > 0) {
      setIsDragging(true);
    }
  }, []);

  const handleDragLeave = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounter.current--;
    if (dragCounter.current === 0) {
      setIsDragging(false);
    }
  }, []);

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    dragCounter.current = 0;

    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      processFileUpload(files[0]);
    }
  }, []);

  return (
    <div className="w-64 bg-purple-900 border-r border-purple-800 p-4 overflow-y-auto">
      <div className="mb-6">
        <h2 className="text-xl font-bold mb-2 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">🤖 RAG Engine</h2>
        <p className="text-xs text-purple-300">v2.0 • Deep Purple Edition</p>
        <hr className="border-purple-700 my-4" />
      </div>

      <div className="mb-6">
        <h3 className="text-sm font-semibold mb-3 text-purple-200">Menu</h3>
        <ul className="space-y-2">
          <li>
            <Link 
              to="/" 
              className={`block w-full text-left px-3 py-2 rounded transition-colors ${
                isActive('/') 
                  ? 'bg-purple-700 text-white border-l-4 border-purple-400' 
                  : 'text-purple-100 hover:bg-purple-800'
              }`}
            >
              🏠 Home
            </Link>
          </li>
          <li>
            <Link 
              to="/chat" 
              className={`block w-full text-left px-3 py-2 rounded transition-colors ${
                isActive('/chat') 
                  ? 'bg-purple-700 text-white border-l-4 border-purple-400' 
                  : 'text-purple-100 hover:bg-purple-800'
              }`}
            >
              💬 Chat Assistant
            </Link>
          </li>
          <li>
            <Link 
              to="/features" 
              className={`block w-full text-left px-3 py-2 rounded transition-colors ${
                isActive('/features') 
                  ? 'bg-purple-700 text-white border-l-4 border-purple-400' 
                  : 'text-purple-100 hover:bg-purple-800'
              }`}
            >
              ⚡ Features
            </Link>
          </li>
          <li>
            <Link 
              to="/faq" 
              className={`block w-full text-left px-3 py-2 rounded transition-colors ${
                isActive('/faq') 
                  ? 'bg-purple-700 text-white border-l-4 border-purple-400' 
                  : 'text-purple-100 hover:bg-purple-800'
              }`}
            >
              ❓ Help & FAQ
            </Link>
          </li>
        </ul>
      </div>

      <hr className="border-purple-700 my-4" />

      <div className="mb-6">
        <h3 className="text-sm font-semibold mb-3 text-purple-200">📁 Document Context</h3>
        
        <input
          ref={fileInputRef}
          key={uploaderKey}
          type="file"
          accept=".pdf"
          onChange={handleFileInputChange}
          className="hidden"
        />
        
        {/* Drag and Drop Area */}
        <div
          className={`relative border-2 border-dashed rounded-lg p-6 text-center transition-all cursor-pointer
            ${isDragging 
              ? 'border-purple-500 bg-purple-500 bg-opacity-20' 
              : 'border-purple-600 hover:border-purple-500 hover:bg-purple-800 hover:bg-opacity-30'
            }
            ${uploadError ? 'border-red-500 bg-red-500 bg-opacity-10' : ''}
          `}
          onClick={() => fileInputRef.current.click()}
          onDragEnter={handleDragEnter}
          onDragLeave={handleDragLeave}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
        >
          {isDragging ? (
            <div>
              <div className="text-3xl mb-2">📥</div>
              <p className="text-sm font-medium text-purple-300">Drop your PDF here</p>
            </div>
          ) : (
            <div>
              <div className="text-3xl mb-2">📄</div>
              <p className="text-sm font-medium text-purple-100">
                {uploadedFile ? 'Click to replace PDF' : 'Click or drag PDF here'}
              </p>
              <p className="text-xs text-purple-400 mt-1">Max size: 50MB</p>
            </div>
          )}
        </div>

        {/* Upload Error Message */}
        {uploadError && (
          <div className="mt-3 p-3 bg-red-900 bg-opacity-30 border border-red-700 rounded text-sm text-red-300">
            <span className="font-medium">Error:</span> {uploadError}
          </div>
        )}

        {/* Processing Status */}
        {isProcessing && (
          <div className="mt-4 p-3 bg-purple-800 rounded">
            <div className="flex items-center">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-purple-300 mr-2"></div>
              <span className="text-sm text-purple-100">Indexing Document...</span>
            </div>
            <div className="mt-2 text-xs text-purple-300 space-y-1">
              <p className="flex items-center">
                <span className="mr-2">📄</span> Parsing PDF...
              </p>
              <p className="flex items-center">
                <span className="mr-2">🧠</span> Generating Embeddings...
              </p>
              <p className="flex items-center">
                <span className="mr-2">💾</span> Storing in Vector DB...
              </p>
            </div>
          </div>
        )}

        {/* Active Document Display */}
        {uploadedFile && fileProcessed && (
          <div className="mt-4 p-3 bg-purple-800 bg-opacity-50 rounded border border-purple-600">
            <p className="text-xs text-purple-300 font-semibold mb-1">ACTIVE DOCUMENT</p>
            <p className="text-sm text-white truncate mb-2">{uploadedFile}</p>
            <button
              onClick={(e) => {
                e.stopPropagation();
                removeDocument();
              }}
              className="w-full text-xs bg-red-600 hover:bg-red-700 text-white py-2 px-3 rounded transition-colors"
            >
              ❌ Remove Document
            </button>
          </div>
        )}

        {/* No Document State */}
        {!uploadedFile && !isProcessing && !uploadError && (
          <div className="mt-4 p-3 bg-purple-800 bg-opacity-30 rounded text-sm text-purple-300">
            Upload a PDF to enable RAG Chat
          </div>
        )}
      </div>

      {/* File Size Info */}
      <div className="mt-4 p-3 bg-purple-800 bg-opacity-30 rounded text-xs text-purple-300">
        <p className="font-medium mb-1">📋 Upload Requirements:</p>
        <ul className="space-y-1">
          <li>• Format: PDF only</li>
          <li>• Max size: 50MB</li>
          <li>• Processing: Local & Secure</li>
        </ul>
      </div>
    </div>
  );
}

export default Sidebar;


// // src/components/Sidebar.js
// import { useNavigate, useLocation } from "react-router-dom";
// import { useRef, useState } from "react";

// export default function Sidebar({
//     docs,
//     setDocs,
//     activeDocId,
//     setActiveDocId,
// }) {
//     const navigate = useNavigate();
//     const location = useLocation();
//     const fileInputRef = useRef(null);
//     const [docsOpen, setDocsOpen] = useState(true);

//     const handleNav = (path) => {
//         navigate(path);
//     };

//     const handleAddDocClick = () => {
//         if (fileInputRef.current) fileInputRef.current.click();
//     };

//     const handleFileChange = (e) => {
//         const files = Array.from(e.target.files || []);
//         if (!files.length) return;

//         const now = new Date().toLocaleTimeString();
//         const newDocs = files.map((f) => ({
//             id: `${f.name}-${Date.now()}-${Math.random()}`,
//             name: f.name,
//             kind: "uploaded",
//             addedAt: now,
//         }));

//         setDocs((prev) => [...prev, ...newDocs]);
//         if (!activeDocId && newDocs.length > 0) {
//             setActiveDocId(newDocs[0].id);
//         }
//     };

//     const removeDoc = (id) => {
//         setDocs((prev) => prev.filter((d) => d.id !== id));
//         if (activeDocId === id) {
//             setActiveDocId(null);
//         }
//     };

//     const isActive = (path) =>
//         location.pathname === path
//             ? "text-white bg-purple-900/50"
//             : "text-slate-100/90 hover:bg-purple-900/40";

//     return (
//         <aside className="w-60 hidden md:flex flex-col bg-[#14004b] border-r border-purple-900/80">
//             {/* Logo */}
//             <div className="h-14 flex items-center px-4 border-b border-purple-900/80">
//                 <div className="bg-indigo-900 px-3 py-1 rounded-lg text-xs font-semibold tracking-[0.16em] uppercase">
//                     Logo
//                 </div>
//             </div>

//             {/* Nav */}
//             <nav className="flex-1 px-3 py-4 space-y-1 text-sm">
//                 <button
//                     className={`w-full text-left px-3 py-2 rounded-lg ${isActive("/")}`}
//                     onClick={() => handleNav("/")}
//                 >
//                     Chat
//                 </button>

//                 {/* Add Doc */}
//                 <button
//                     className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-slate-100/90 hover:bg-purple-900/40 transition text-sm"
//                     onClick={handleAddDocClick}
//                 >
//                     <span>Add Doc</span>
//                     <span className="text-lg leading-none">+</span>
//                 </button>
//                 <input
//                     type="file"
//                     accept=".pdf"
//                     multiple
//                     ref={fileInputRef}
//                     className="hidden"
//                     onChange={handleFileChange}
//                 />

//                 {/* My Docs */}
//                 <div className="mt-1">
//                     <button
//                         className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-slate-100/90 hover:bg-purple-900/40 transition text-sm"
//                         onClick={() => setDocsOpen((v) => !v)}
//                     >
//                         <span>My docs</span>
//                         <span className="text-xs">{docsOpen ? "▾" : "▸"}</span>
//                     </button>

//                     {docsOpen && (
//                         <div className="mt-2 ml-2 rounded-xl bg-purple-900/40 px-2 py-2 space-y-1 max-h-60 overflow-y-auto">
//                             {docs.length === 0 && (
//                                 <p className="text-[11px] text-slate-300">
//                                     No documents yet. Add PDFs using “Add Doc”.
//                                 </p>
//                             )}
//                             {docs.map((doc) => (
//                                 <div
//                                     key={doc.id}
//                                     className={`flex items-center justify-between gap-1 px-2 py-1 rounded-lg text-xs cursor-pointer ${activeDocId === doc.id
//                                             ? "bg-purple-700/80 text-white"
//                                             : "bg-purple-950/70 text-slate-100/90 hover:bg-purple-800/80"
//                                         }`}
//                                     onClick={() => setActiveDocId(doc.id)}
//                                 >
//                                     <span className="truncate">
//                                         {doc.kind === "builtin" ? "★ " : ""}
//                                         {doc.name}
//                                     </span>
//                                     {doc.kind === "uploaded" && (
//                                         <button
//                                             className="ml-1 text-[10px] px-1 rounded bg-black/40 hover:bg-black/70"
//                                             onClick={(e) => {
//                                                 e.stopPropagation();
//                                                 removeDoc(doc.id);
//                                             }}
//                                         >
//                                             X
//                                         </button>
//                                     )}
//                                 </div>
//                             ))}
//                         </div>
//                     )}
//                 </div>

//                 {/* Other pages */}
//                 <button
//                     className={`w-full text-left px-3 py-2 rounded-lg mt-1 ${isActive(
//                         "/features"
//                     )}`}
//                     onClick={() => handleNav("/features")}
//                 >
//                     Features
//                 </button>
//                 <button
//                     className={`w-full text-left px-3 py-2 rounded-lg ${isActive(
//                         "/help"
//                     )}`}
//                     onClick={() => handleNav("/help")}
//                 >
//                     Help & FAQ
//                 </button>
//                 <button
//                     className={`w-full text-left px-3 py-2 rounded-lg ${isActive(
//                         "/about"
//                     )}`}
//                     onClick={() => handleNav("/about")}
//                 >
//                     About
//                 </button>
//             </nav>

//             <div className="px-4 py-3 border-t border-purple-900/80 text-[11px] text-purple-100/80">
//                 <p>Docs with ★ are built-in domains (AI, biotech, climate, etc.).</p>
//             </div>
//         </aside>
//     );
// }



// import { NavLink } from "react-router-dom";

// const navLinkBase =
//     "px-3 py-2 rounded-xl text-sm flex items-center gap-2 transition hover:bg-indigo-500/20 hover:text-white";
// const navLinkActive =
//     "bg-indigo-500/30 text-white shadow-[0_0_18px_rgba(129,140,248,0.5)]";

// export default function Sidebar() {
//     return (
//         <aside
//             className="
//         hidden md:flex md:flex-col
//         w-64 border-r border-indigo-500/30 bg-black/30 
//         backdrop-blur-xl
//     "
//         >
//             <div className="p-4 border-b border-indigo-500/20">
//                 <h1 className="text-lg font-semibold text-indigo-200 tracking-wide">
//                     RAG Assistant
//                 </h1>
//                 <p className="text-xs text-slate-400 mt-1">
//                     Deep-search AI for your docs.
//                 </p>
//             </div>

//             <nav className="flex-1 p-3 space-y-2">
//                 <NavLink
//                     to="/"
//                     end
//                     className={({ isActive }) =>
//                         `${navLinkBase} ${isActive ? navLinkActive : "text-slate-300"}`
//                     }
//                 >
//                     🧠 <span>Chat</span>
//                 </NavLink>

//                 <NavLink
//                     to="/features"
//                     className={({ isActive }) =>
//                         `${navLinkBase} ${isActive ? navLinkActive : "text-slate-300"}`
//                     }
//                 >
//                     ✨ <span>Features</span>
//                 </NavLink>

//                 <NavLink
//                     to="/about"
//                     className={({ isActive }) =>
//                         `${navLinkBase} ${isActive ? navLinkActive : "text-slate-300"}`
//                     }
//                 >
//                     👩‍💻 <span>About</span>
//                 </NavLink>
//             </nav>

//             <div className="p-3 border-t border-indigo-500/20 text-xs text-slate-500">
//                 <p>v0.1 • RAG Assistant AI</p>
//             </div>
//         </aside>
//     );
// }
