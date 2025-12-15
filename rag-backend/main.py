
import sys
import os
sys.path.append(os.path.join(os.path.dirname(__file__), '..'))
from contextlib import asynccontextmanager

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional



# Import the actual RAG assistant
from src.app import RAGAssistant, load_documents

# ---------------- FastAPI app ----------------

app = FastAPI(
    title="RAG Assistant Backend",
    description="FastAPI layer for the RAG UI (chat + docs).",
    version="0.1.0",
)

# ---------------- Global RAG Assistant ----------------

assistant = None

@asynccontextmanager
async def lifespan(app: FastAPI):
    global assistant
    try:
        # Initialize the RAG assistant
        assistant = RAGAssistant()
        # Load and add documents to the knowledge base
        sample_docs = load_documents()
        assistant.add_documents(sample_docs)
        print("✅ RAG Assistant initialized successfully with documents")
    except Exception as e:
        print(f"❌ Failed to initialize RAG Assistant: {e}")
        assistant = None

    # Yield control to the app (app is running)
    yield

    # Optional: shutdown code can go here
    # e.g., closing database connections, cleaning resources
    print("App is shutting down...")

# Create FastAPI app with lifespan
app = FastAPI(lifespan=lifespan)

# ---------------- CORS (for React) ----------------

origins = [
    "http://localhost:3000",  # CRA dev server
    # later: add your deployed frontend URL here
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ---------------- Schemas ----------------


class ChatRequest(BaseModel):
    query: str
    model: str = "groq"  # "groq" | "openai" | "gemini"
    active_doc_id: Optional[str] = None


class ChatResponse(BaseModel):
    reply: str


# If you want to plug in the real RAGAssistant later:
#
# from rag_assistant import RAGAssistant
# assistant = RAGAssistant()


# ---------------- Routes ----------------


@app.get("/health")
def health():
    return {"status": "ok"}



@app.post("/chat", response_model=ChatResponse)
async def chat(body: ChatRequest):
    """
    Main chat endpoint used by the React UI.
    
    Uses the actual RAG assistant to process queries.
    """
    if assistant is None:
        raise HTTPException(
            status_code=503, 
            detail="RAG Assistant not initialized. Check server logs for errors."
        )
    
    try:
        # Use the RAG assistant to process the query
        answer = assistant.query(body.query, n_results=3)
        
        # Return the RAG response
        return ChatResponse(reply=answer)
        
    except Exception as e:
        # Handle any errors from the RAG pipeline
        raise HTTPException(
            status_code=500,
            detail=f"Error processing query: {str(e)}"
        )


#---------------------------------------------------------------------------------------------------------------------------------------------


# from fastapi import FastAPI, Depends, HTTPException
# from fastapi.middleware.cors import CORSMiddleware
# from sqlalchemy.orm import Session

# from database import Base, engine, SessionLocal
# import models
# import schemas

# # create tables
# Base.metadata.create_all(bind=engine)

# app = FastAPI(
#     title="RAG Assistant Backend",
#     description="FastAPI + SQLite backend for your RAG Assistant UI.",
#     version="0.1.0",
# )

# # CORS so your React app can talk to this API
# origins = [
#     "http://localhost:3000",  # CRA dev server
#     # add deployed frontend origin later (e.g. https://your-app.vercel.app)
# ]

# app.add_middleware(
#     CORSMiddleware,
#     allow_origins=origins,
#     allow_credentials=True,
#     allow_methods=["*"],
#     allow_headers=["*"],
# )


# # DB dependency
# def get_db():
#     db = SessionLocal()
#     try:
#         yield db
#     finally:
#         db.close()


# # Health check
# @app.get("/health")
# def health():
#     return {"status": "ok"}


# # ---------- DOCUMENT ENDPOINTS ----------

# @app.post("/documents", response_model=schemas.DocumentOut)
# def create_document(doc: schemas.DocumentCreate, db: Session = Depends(get_db)):
#     db_doc = models.Document(title=doc.title, source=doc.source)
#     db.add(db_doc)
#     db.commit()
#     db.refresh(db_doc)

#     # create chunks
#     for ch in doc.chunks:
#         db_chunk = models.Chunk(document_id=db_doc.id, text=ch.text)
#         db.add(db_chunk)

#     db.commit()
#     db.refresh(db_doc)
#     return db_doc


# @app.get("/documents", response_model=list[schemas.DocumentOut])
# def list_documents(db: Session = Depends(get_db)):
#     docs = db.query(models.Document).all()
#     return docs


# # ---------- SIMPLE "FAKE RAG" CHAT ENDPOINT ----------

# @app.post("/chat", response_model=schemas.ChatResponse)
# def chat(body: schemas.ChatRequest, db: Session = Depends(get_db)):
#     query = body.query.strip()
#     if not query:
#         raise HTTPException(status_code=400, detail="Query cannot be empty")

#     # 1) super naive 'retrieval':
#     # find any chunk containing a keyword from the query
#     keywords = [w.lower() for w in query.split() if len(w) > 3]
#     chunks = db.query(models.Chunk).all()

#     matched_chunks = []
#     for ch in chunks:
#         text_lower = ch.text.lower()
#         if any(kw in text_lower for kw in keywords):
#             matched_chunks.append(ch.text)

#     # 2) build a fake 'RAG' answer
#     if matched_chunks:
#         context_preview = "\n---\n".join(matched_chunks[:2])
#         reply = (
#             "Here is an answer based on the closest matching parts of your documents:\n\n"
#             f"{context_preview}\n\n"
#             "This is a simple keyword-based retrieval. In the final version, "
#             "this will be replaced with proper embeddings + an LLM."
#         )
#     else:
#         reply = (
#             "I couldn't find anything closely related in the stored documents yet.\n"
#             "Try adding documents first or asking in a different way."
#         )

#     return schemas.ChatResponse(reply=reply)
