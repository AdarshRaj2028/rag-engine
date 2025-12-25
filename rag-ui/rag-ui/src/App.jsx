// src/App.js
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { useState } from "react";
import Sidebar from "./components/Sidebar";
import HomeChat from "./pages/HomeChat";
import Features from "./pages/Features";
import HelpFaq from "./pages/HelpFaq";
import About from "./pages/About";

const PRELOADED_DOCS = [
  { id: "ai", name: "AI – Research Overview" },
  { id: "biotech", name: "Biotech – Genomics & Health" },
  { id: "climate", name: "Climate Science – IPCC Summary" },
  { id: "quantum", name: "Quantum Computing – Basics" },
  { id: "sample", name: "Sample Docs – ReadyTensor" },
  { id: "space", name: "Space Exploration – Missions" },
  { id: "sustainable", name: "Sustainable Energy – Case Studies" },
];

function App() {
  const [docs, setDocs] = useState(
    PRELOADED_DOCS.map((d) => ({
      ...d,
      kind: "builtin",
    }))
  );
  const [activeDocId, setActiveDocId] = useState(null);
  const [selectedModel, setSelectedModel] = useState("groq");

  const activeDoc = docs.find((d) => d.id === activeDocId) || null;

  return (
    <Router>
      <div className="min-h-screen flex bg-[#050013] text-slate-100">
        {/* Sidebar */}
        <Sidebar
          docs={docs}
          setDocs={setDocs}
          activeDocId={activeDocId}
          setActiveDocId={setActiveDocId}
        />

        {/* Main content area */}
        <div className="flex-1 flex flex-col">
          <header className="h-14 border-b border-purple-900/70 bg-[#08001d]/90 backdrop-blur flex items-center justify-between px-4 md:px-6">
            <div>
              <h1 className="text-sm md:text-base font-semibold tracking-wide">
                <span className="bg-gradient-to-r from-purple-300 via-indigo-400 to-cyan-300 bg-clip-text text-transparent">
                  RAG Assistant Console
                </span>
              </h1>
              <p className="text-[11px] text-slate-400">
                Multi-domain knowledge • Deep-purple UI
              </p>
            </div>
            <div className="flex items-center gap-2 text-[11px]">
              <span className="hidden sm:inline text-slate-400">Model:</span>
              <select
                className="bg-[#050013] border border-purple-800/70 text-[11px] rounded-lg px-2 py-1 outline-none focus:border-purple-400"
                value={selectedModel}
                onChange={(e) => setSelectedModel(e.target.value)}
              >
                <option value="groq">Groq</option>
                <option value="openai">OpenAI</option>
                <option value="gemini">Gemini</option>
              </select>
              <span className="flex items-center gap-1 text-emerald-300">
                <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="hidden sm:inline">API planned</span>
              </span>
            </div>
          </header>

          <main className="flex-1 overflow-y-auto bg-gradient-to-br from-[#050013] via-[#080024] to-[#020617] p-3 md:p-4">
            <Routes>
              <Route
                path="/"
                element={
                  <HomeChat
                    docs={docs}
                    activeDoc={activeDoc}
                    selectedModel={selectedModel}
                    onClearActiveDoc={()=>setActiveDocId(null)}
                  />
                }
              />
              <Route path="/features" element={<Features />} />
              <Route path="/help" element={<HelpFaq />} />
              <Route path="/about" element={<About />} />
            </Routes>
          </main>
        </div>
      </div>
    </Router>
  );
}

export default App;



// import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
// import Sidebar from "./components/Sidebar";
// import HomeChat from "./pages/HomeChat";
// import Features from "./pages/Features";
// import About from "./pages/About";

// function App() {
//   return (
//     <Router>
//       <div className="min-h-screen flex bg-black text-slate-100">
//         {/* Sidebar for desktop */}
//         <Sidebar />

//         {/* Main area */}
//         <div className="flex-1 flex flex-col">
//           {/* simple top bar for mobile */}
//           <header className="md:hidden px-4 py-3 border-b border-indigo-500/30 bg-black/60 backdrop-blur-xl">
//             <h1 className="text-sm font-semibold text-indigo-100">
//               RAG Assistant
//             </h1>
//             <p className="text-[11px] text-slate-400">
//               Swipe from left / use browser back for navigation.
//             </p>
//           </header>

//           <main className="flex-1 overflow-hidden">
//             <Routes>
//               <Route path="/" element={<HomeChat />} />
//               <Route path="/features" element={<Features />} />
//               <Route path="/about" element={<About />} />
//             </Routes>
//           </main>
//         </div>
//       </div>
//     </Router>
//   );
// }

// export default App;
