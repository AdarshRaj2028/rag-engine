import streamlit as st # type: ignore
import time

# 1. Page Configuration

st.set_page_config(
    page_title="RAG Engine",
    page_icon="🤖",
    layout="wide",
    initial_sidebar_state="expanded"
)

# 2. Session State Management

def init_session_state():
    """Initialize all session state variables with defaults"""
    defaults = {
        'page': 'Home',
        'uploaded_file': None,
        'file_processed': False,
        'messages': [],
        'processing': False,
        'uploader_key': 0  # NEW: For clearing file uploader
    }
    for key, value in defaults.items():
        if key not in st.session_state:
            st.session_state[key] = value

init_session_state()

# 3. Clean and modern CSS

st.markdown("""
<style>
    /* Import Google Fonts */
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
    
    /* Global Styles */
    * {
        font-family: 'Inter', sans-serif;
    }
    
    /* Main Background */
    .stApp {
        background-color: #0f1116;
    }
    
    .main {
        background-color: #1a1d24;
        padding-bottom: 5rem;
    }
    
    /* Sidebar Styling */
    section[data-testid="stSidebar"] {
        background-color: #151922;
        border-right: 1px solid #262a35;
    }
    
    [data-testid="stSidebar"] [data-testid="stMarkdownContainer"] {
        color: white;
    }
    
    /* Button Styling */
    div.row-widget.stButton > button {
        width: 100%;
        background-color: transparent;
        color: #a0aec0;
        border: 1px solid transparent;
        text-align: left;
        padding: 0.6rem 1rem;
        transition: all 0.2s;
        border-radius: 0.5rem;
    }
    
    div.row-widget.stButton > button:hover {
        background-color: #1f2937;
        color: white;
        border-color: #374151;
    }
    
    div.row-widget.stButton > button:focus {
        color: white;
        border-color: #5e5ce6;
        box-shadow: none;
    }
    
    /* Hero Card */
    .hero-card {
        background: linear-gradient(145deg, #1a202c, #171923);
        padding: 3rem;
        border-radius: 1rem;
        border: 1px solid #2d3748;
        text-align: center;
        margin-bottom: 2rem;
        box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.5);
    }
    
    /* Feature Box */
    .feature-box {
        background-color: #1a202c;
        padding: 1.5rem;
        border-radius: 0.8rem;
        border: 1px solid #2d3748;
        height: 100%;
        transition: transform 0.2s;
    }
    
    .feature-box:hover {
        transform: translateY(-5px);
        border-color: #5e5ce6;
    }
    
    /* Gradient Text */
    .gradient-text {
        background: linear-gradient(to right, #5e5ce6, #8b7ae6);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        font-weight: 800;
    }
    
    /* Chat Messages - Clean Design */
    [data-testid="stChatMessage"][data-testid*="user"] {
        background-color: rgba(94, 92, 230, 0.1);
        border-left: 3px solid #5e5ce6;
    }
    
    [data-testid="stChatMessage"][data-testid*="assistant"] {
        background-color: #1a1f2e;
        border: 1px solid #2d3748;
    }
    
    /* Chat Input */
    .stChatInput {
        padding-bottom: 2rem;
    }
    
    .stChatInput textarea {
        background-color: #1e2330 !important;
        color: white !important;
        border: 1px solid #2d3748 !important;
        border-radius: 1rem !important;
    }
    
    .stChatInput textarea:focus {
        border-color: #5e5ce6 !important;
        box-shadow: 0 0 0 1px #5e5ce6 !important;
    }
    
    /* Status Pills */
    .status-pill {
        display: inline-block;
        padding: 0.4rem 0.9rem;
        border-radius: 1rem;
        font-size: 0.8rem;
        font-weight: 600;
        text-transform: uppercase;
        letter-spacing: 0.05em;
    }
    
    /* Remove Branding */
    #MainMenu {visibility: hidden;}
    footer {visibility: hidden;}
    
    /* Tabs Styling */
    .stTabs [data-baseweb="tab-list"] {
        gap: 0.5rem;
    }
    
    .stTabs [data-baseweb="tab"] {
        background-color: #1a202c;
        border: 1px solid #2d3748;
        color: #a0aec0;
        border-radius: 0.5rem;
        padding: 0.5rem 1rem;
    }
    
    .stTabs [aria-selected="true"] {
        background-color: #5e5ce6;
        color: white;
    }
    
    /* Scrollbar */
    ::-webkit-scrollbar {
        width: 8px;
        height: 8px;
    }
    
    ::-webkit-scrollbar-track {
        background: #1a1d24;
    }
    
    ::-webkit-scrollbar-thumb {
        background: #2d3748;
        border-radius: 4px;
    }
    
    ::-webkit-scrollbar-thumb:hover {
        background: #374151;
    }
</style>
""", unsafe_allow_html=True)


# 4. Helper Functions

def stream_text(text):
    """Generator to simulate typing effect for responses"""
    for word in text.split(" "):
        yield word + " "
        time.sleep(0.04)

def change_page(page_name):
    """Navigate to different pages"""
    st.session_state.page = page_name
    st.rerun()

# 5. Sidebar Navigation and File Upload

with st.sidebar:
    # Header
    st.markdown("### 🤖 RAG Engine")
    st.caption("v2.0 • Clean Edition")
    st.markdown("---")
    
    # Navigation Menu
    st.markdown("#### Menu")
    
    if st.button("🏠 Home", use_container_width=True):
        change_page('Home')
    
    if st.button("💬 Chat Assistant", use_container_width=True):
        change_page('Chat')
    
    if st.button("⚡ Features", use_container_width=True):
        change_page('Features')
    
    if st.button("❓ Help & FAQ", use_container_width=True):
        change_page('FAQ')
    
    st.markdown("---")
    
    # File Upload Section
    st.markdown("#### 📁 Document Context")
    
    # UPDATED: Use dynamic key to clear uploader
    uploaded_file = st.file_uploader(
        "Upload PDF",
        type=['pdf'],
        label_visibility="collapsed",
        key=f"file_uploader_{st.session_state.uploader_key}"  # Dynamic key
    )
    
    # Handle file upload with status indicator
    if uploaded_file:
        if st.session_state.uploaded_file != uploaded_file.name:
            st.session_state.uploaded_file = uploaded_file.name
            st.session_state.messages = []  # Reset chat
            st.session_state.file_processed = False
            
            # Enhanced progress tracking
            with st.status("🔄 Indexing Document...", expanded=True) as status:
                st.write("📄 Parsing PDF...")
                time.sleep(1.5)
                st.write("🧠 Generating Embeddings...")
                time.sleep(1.5)
                st.write("💾 Storing in Vector DB...")
                time.sleep(1.5)
                st.session_state.file_processed = True
                status.update(label="✅ Ready to Chat!", state="complete", expanded=False)
            
            st.rerun()
    
    # Display active document
    if st.session_state.uploaded_file:
        st.markdown(f"""
            <div style='background: #064e3b; padding: 10px; border-radius: 8px; 
                        border: 1px solid #059669; margin-top: 10px; margin-bottom: 12px;'>
                <p style='color: #34d399; margin: 0; font-size: 0.8rem; font-weight: 600;'>
                    ACTIVE DOCUMENT
                </p>
                <p style='color: white; margin: 5px 0 0 0; font-size: 0.9rem; 
                          white-space: nowrap; overflow: hidden; text-overflow: ellipsis;'>
                    {st.session_state.uploaded_file}
                </p>
            </div>
        """, unsafe_allow_html=True)
        
        # UPDATED: Clear uploader by incrementing key
        if st.button("❌ Remove Document", type="secondary"):
            st.session_state.uploaded_file = None
            st.session_state.file_processed = False
            st.session_state.messages = []
            st.session_state.uploader_key += 1  # Increment to reset uploader
            st.rerun()
    else:
        st.info("Upload a PDF to enable RAG Chat")

# 6. Page rendering functions

def render_home():
    """Home page with hero section"""
    # Hero Section(Main section)
    st.markdown("""
        <div class='hero-card'>
            <h1 style='font-size: 3.5rem; margin-bottom: 0;'>
                RAG <span class='gradient-text'>Engine</span>
            </h1>
            <p style='color: #a0aec0; font-size: 1.2rem; margin-top: 1rem;'>
                The Intelligent Document Assistant. Upload. Analyze. Chat.
            </p>
        </div>
    """, unsafe_allow_html=True)
    
    # CTA Button
    c1, c2, c3 = st.columns([1, 2, 1])
    with c2:
        if st.button("🚀 Start New Session", type="primary", use_container_width=True):
            change_page('Chat')
    
    st.markdown("<br><br>", unsafe_allow_html=True)
    
    # Feature Highlights
    col1, col2, col3 = st.columns(3)
    
    with col1:
        st.markdown("""
            <div class='feature-box'>
                <h3 style='color:white;'>🔍 Semantic Search</h3>
                <p style='color:#a0aec0;'>
                    Understand the meaning behind your queries, not just keyword matching.
                </p>
            </div>
        """, unsafe_allow_html=True)
    
    with col2:
        st.markdown("""
            <div class='feature-box'>
                <h3 style='color:white;'>⚡ Real-time RAG</h3>
                <p style='color:#a0aec0;'>
                    Instant context retrieval from your uploaded PDF documents.
                </p>
            </div>
        """, unsafe_allow_html=True)
    
    with col3:
        st.markdown("""
            <div class='feature-box'>
                <h3 style='color:white;'>🔐 Secure Core</h3>
                <p style='color:#a0aec0;'>
                    Local-first processing, ensures your data stays private and secure.
                </p>
            </div>
        """, unsafe_allow_html=True)

def render_chat():
    """Optimized chat interface with streaming"""
    st.header("💬 Chat Interface")
    
    # Validation - Check if document uploaded
    if not st.session_state.file_processed:
        st.markdown("""
            <div style='text-align: center; padding: 50px; border: 2px dashed #4a5568; 
                        border-radius: 10px; margin-top: 20px;'>
                <h2>⏳ Waiting for Document</h2>
                <p style='color: #a0aec0;'>
                    Please upload a PDF file in the sidebar to initialize the RAG engine.
                </p>
            </div>
        """, unsafe_allow_html=True)
        return
    
    # Display chat history
    for msg in st.session_state.messages:
        avatar = "👤" if msg["role"] == "user" else "🤖"
        with st.chat_message(msg["role"], avatar=avatar):
            st.markdown(msg["content"])
    
    # Chat input
    if prompt := st.chat_input("Ask a question about your document..."):
        # Add user message
        st.session_state.messages.append({"role": "user", "content": prompt})
        
        with st.chat_message("user", avatar="👤"):
            st.markdown(prompt)
        
        # Generate assistant response with streaming
        with st.chat_message("assistant", avatar="🤖"):
            with st.spinner("🔍 Analyzing document nodes..."):
                time.sleep(1.2)  # Simulate retrieval
                
                # Generate response text
                response_text = f"""Based on **{st.session_state.uploaded_file}**, here is the answer to: '{prompt}'...

This is a simulation of the Retrieval Augmented Generation process. In a production environment, I would have queried the vector database, retrieved the top-k chunks, and synthesized this answer using an LLM."""
                
                # Stream the response
                response_container = st.empty()
                response_container.write_stream(stream_text(response_text))
        
        # Add to chat history
        st.session_state.messages.append({"role": "assistant", "content": response_text})

def render_features():
    """Features page with tabs"""
    st.header("⚡ System Capabilities")
    st.info("This module demonstrates the technical architecture.", icon="ℹ️")
    
    tabs = st.tabs(["📥 Ingestion", "🔍 Retrieval", "✨ Generation"])
    
    with tabs[0]:
        st.markdown("### Document Ingestion Pipeline")
        st.code("""
1. Load PDF
2. Clean & Normalize Text
3. Recursive Character Split
4. Generate Embeddings (OpenAI/HuggingFace)
5. Upsert to Vector Store (Pinecone/Chroma)
        """, language="python")
    
    with tabs[1]:
        st.markdown("### Retrieval Strategy")
        st.markdown("- **Hybrid Search**: Keyword + Semantic")
        st.markdown("- **Re-ranking**: Cross-Encoder implementation")
        st.markdown("- **Context Window**: 4096 tokens")
    
    with tabs[2]:
        st.markdown("### LLM Generation")
        st.success("**Model**: GPT-4o / Claude 3.5 Sonnet")
        st.warning("**Temperature**: 0.3 (Strict Factual)")

def render_faq():
    """FAQ page with expandable sections"""
    st.header("❓ Frequently Asked Questions")
    
    faqs = {
        "🔒 Is my data secure?": "Yes, all processing happens in ephemeral memory. We do not store your documents permanently.",
        "📄 What formats are supported?": "Currently PDF. We are working on DOCX and TXT support.",
        "🎯 How accurate is the RAG?": "It depends on the source quality. The engine uses a Top-K retrieval of 5 chunks for maximum context."
    }
    
    for q, a in faqs.items():
        with st.expander(q):
            st.write(a)

# 7. Page Router

def main():
    if st.session_state.page == 'Home':
        render_home()
    elif st.session_state.page == 'Chat':
        render_chat()
    elif st.session_state.page == 'Features':
        render_features()
    elif st.session_state.page == 'FAQ':
        render_faq()

# 8. Main Function

if __name__ == "__main__": 
    main()