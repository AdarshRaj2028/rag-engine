// src/components/Sidebar.js
import { useNavigate, useLocation } from "react-router-dom";
import { useRef, useState } from "react";

export default function Sidebar({
    docs,
    setDocs,
    activeDocId,
    setActiveDocId,
}) {
    const navigate = useNavigate();
    const location = useLocation();
    const fileInputRef = useRef(null);
    const [docsOpen, setDocsOpen] = useState(true);

    const handleNav = (path) => {
        navigate(path);
    };

    const handleAddDocClick = () => {
        if (fileInputRef.current) fileInputRef.current.click();
    };

    const handleFileChange = (e) => {
        const files = Array.from(e.target.files || []);
        if (!files.length) return;

        const now = new Date().toLocaleTimeString();
        const newDocs = files.map((f) => ({
            id: `${f.name}-${Date.now()}-${Math.random()}`,
            name: f.name,
            kind: "uploaded",
            addedAt: now,
        }));

        setDocs((prev) => [...prev, ...newDocs]);
        if (!activeDocId && newDocs.length > 0) {
            setActiveDocId(newDocs[0].id);
        }
    };

    const removeDoc = (id) => {
        setDocs((prev) => prev.filter((d) => d.id !== id));
        if (activeDocId === id) {
            setActiveDocId(null);
        }
    };

    const isActive = (path) =>
        location.pathname === path
            ? "text-white bg-purple-900/50"
            : "text-slate-100/90 hover:bg-purple-900/40";

    return (
        <aside className="w-60 hidden md:flex flex-col bg-[#14004b] border-r border-purple-900/80">
            {/* Logo */}
            <div className="h-14 flex items-center px-4 border-b border-purple-900/80">
                <div className="bg-indigo-900 px-3 py-1 rounded-lg text-xs font-semibold tracking-[0.16em] uppercase">
                    Logo
                </div>
            </div>

            {/* Nav */}
            <nav className="flex-1 px-3 py-4 space-y-1 text-sm">
                <button
                    className={`w-full text-left px-3 py-2 rounded-lg ${isActive("/")}`}
                    onClick={() => handleNav("/")}
                >
                    Chat
                </button>

                {/* Add Doc */}
                <button
                    className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-slate-100/90 hover:bg-purple-900/40 transition text-sm"
                    onClick={handleAddDocClick}
                >
                    <span>Add Doc</span>
                    <span className="text-lg leading-none">+</span>
                </button>
                <input
                    type="file"
                    accept=".pdf"
                    multiple
                    ref={fileInputRef}
                    className="hidden"
                    onChange={handleFileChange}
                />

                {/* My Docs */}
                <div className="mt-1">
                    <button
                        className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-slate-100/90 hover:bg-purple-900/40 transition text-sm"
                        onClick={() => setDocsOpen((v) => !v)}
                    >
                        <span>My docs</span>
                        <span className="text-xs">{docsOpen ? "▾" : "▸"}</span>
                    </button>

                    {docsOpen && (
                        <div className="mt-2 ml-2 rounded-xl bg-purple-900/40 px-2 py-2 space-y-1 max-h-60 overflow-y-auto">
                            {docs.length === 0 && (
                                <p className="text-[11px] text-slate-300">
                                    No documents yet. Add PDFs using “Add Doc”.
                                </p>
                            )}
                            {docs.map((doc) => (
                                <div
                                    key={doc.id}
                                    className={`flex items-center justify-between gap-1 px-2 py-1 rounded-lg text-xs cursor-pointer ${activeDocId === doc.id
                                            ? "bg-purple-700/80 text-white"
                                            : "bg-purple-950/70 text-slate-100/90 hover:bg-purple-800/80"
                                        }`}
                                    onClick={() => setActiveDocId(doc.id)}
                                >
                                    <span className="truncate">
                                        {doc.kind === "builtin" ? "★ " : ""}
                                        {doc.name}
                                    </span>
                                    {doc.kind === "uploaded" && (
                                        <button
                                            className="ml-1 text-[10px] px-1 rounded bg-black/40 hover:bg-black/70"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                removeDoc(doc.id);
                                            }}
                                        >
                                            X
                                        </button>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Other pages */}
                <button
                    className={`w-full text-left px-3 py-2 rounded-lg mt-1 ${isActive(
                        "/features"
                    )}`}
                    onClick={() => handleNav("/features")}
                >
                    Features
                </button>
                <button
                    className={`w-full text-left px-3 py-2 rounded-lg ${isActive(
                        "/help"
                    )}`}
                    onClick={() => handleNav("/help")}
                >
                    Help & FAQ
                </button>
                <button
                    className={`w-full text-left px-3 py-2 rounded-lg ${isActive(
                        "/about"
                    )}`}
                    onClick={() => handleNav("/about")}
                >
                    About
                </button>
            </nav>

            <div className="px-4 py-3 border-t border-purple-900/80 text-[11px] text-purple-100/80">
                <p>Docs with ★ are built-in domains (AI, biotech, climate, etc.).</p>
            </div>
        </aside>
    );
}



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
