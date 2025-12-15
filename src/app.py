import os
from typing import List
from dotenv import load_dotenv
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import StrOutputParser



from src.vectordb import VectorDB
from langchain_openai import ChatOpenAI
from langchain_groq import ChatGroq
from langchain_google_genai import ChatGoogleGenerativeAI

# Load environment variables
load_dotenv()


def load_documents() -> List[str]:
    """
    Load documents for demonstration.

    Returns:
        List of sample documents
    """
    results = []
    # TODO: Implement document loading
    # HINT: Read the documents from the data directory
    # HINT: Return a list of documents
    # HINT: Your implementation depends on the type of documents you are using (.txt, .pdf, etc.)
    DATA_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), "data")
    file_paths = [os.path.join(DATA_DIR, filename)for filename in os.listdir(DATA_DIR)]   
    for path in file_paths:
        with open(path, "r", encoding="utf-8") as f:
            results.append(f.read())

    return results


class RAGAssistant:
    """
    A simple RAG-based AI assistant using ChromaDB and multiple LLM providers.
    Supports OpenAI, Groq, and Google Gemini APIs.
    """

    def __init__(self):
        """Initialize the RAG assistant."""
        # Initialize LLM - check for available API keys in order of preference
        self.llm = self._initialize_llm()
        if not self.llm:
            raise ValueError(
                "No valid API key found. Please set one of: "
                "OPENAI_API_KEY, GROQ_API_KEY, or GOOGLE_API_KEY in your .env file"
            )

        # Initialize vector database
        self.vector_db = VectorDB()

        # Create RAG prompt template
        self.prompt_template = ChatPromptTemplate.from_template(
            "You are a helpful assistant. Use the following context to answer the question.\n\nContext: {context}\n\nQuestion: {question}"
        )

        # Create the chain
        self.chain = self.prompt_template | self.llm | StrOutputParser()

        print("RAG Assistant initialized successfully")


    def _initialize_llm(self):
        """
        Initialize the LLM by checking for available API keys.
        Tries OpenAI, Groq, and Google Gemini in that order.
        """
        # Debug: Print available environment variables
        print("Debug: Checking environment variables...")
        print(f"OPENAI_API_KEY exists: {'OPENAI_API_KEY' in os.environ}")
        print(f"GROQ_API_KEY exists: {'GROQ_API_KEY' in os.environ}")
        print(f"GOOGLE_API_KEY exists: {'GOOGLE_API_KEY' in os.environ}")
        
        # Check for OpenAI API key
        if os.getenv("OPENAI_API_KEY"):
            model_name = os.getenv("OPENAI_MODEL", "gpt-4o-mini")
            print(f"Using OpenAI model: {model_name}")
            return ChatOpenAI(
                api_key=os.getenv("OPENAI_API_KEY"), model=model_name, temperature=0.0
            )

        elif os.getenv("GROQ_API_KEY"):
            model_name = os.getenv("GROQ_MODEL", "llama-3.1-8b-instant")
            print(f"Using Groq model: {model_name}")
            return ChatGroq(
                api_key=os.getenv("GROQ_API_KEY"), model=model_name, temperature=0.0
            )

        elif os.getenv("GOOGLE_API_KEY"):
            model_name = os.getenv("GOOGLE_MODEL", "gemini-2.0-flash")
            print(f"Using Google Gemini model: {model_name}")
            return ChatGoogleGenerativeAI(
                google_api_key=os.getenv("GOOGLE_API_KEY"),
                model=model_name,
                temperature=0.0,
            )

        else:
            print("❌ No API keys found in environment variables")
            print("Current .env file contents:")
            try:
                with open('.env', 'r') as f:
                    print(f.read())
            except:
                print("Could not read .env file")
            raise ValueError(
                "No valid API key found. Please set one of: OPENAI_API_KEY, GROQ_API_KEY, or GOOGLE_API_KEY in your .env file"
            )

    def add_documents(self, documents: List) -> None:
        """
        Add documents to the knowledge base.

        Args:
            documents: List of documents
        """
        self.vector_db.add_documents(documents)



    def query(self, question: str, n_results: int = 3) -> str:
        """
        Query the RAG assistant.

        Args:
            question: User's question
            n_results: Number of relevant chunks to retrieve

        Returns:
            String containing the answer from the LLM
        """
        try:
            print(f"Debug: Processing query: {question}")
            print(f"Debug: Using {n_results} results")
            

            # Retrieve relevant context chunks from vector database
            print("Debug: Searching vector database...")
            search_results = self.vector_db.search(question, n_results=n_results)
            print(f"Debug: Search results type: {type(search_results)}")
            
            # Extract the documents from search results
            # search_results is a dict when using single query (our case)
            if search_results:
                documents = search_results['documents']
                print(f"Debug: Retrieved {len(documents)} documents")
                # Combine retrieved document chunks into a single context string
                context = "\n\n".join(documents)
            else:
                print("Debug: No documents found")
                context = "No relevant documents found."
            
            print("Debug: Generating response with LLM...")
            # Use the chain to generate response with context and question
            response = self.chain.invoke({
                "context": context,
                "question": question
            })
            
            print(f"Debug: Response generated successfully: {len(response)} characters")
            return response
            
        except Exception as e:
            print(f"Debug: Exception in query method: {type(e).__name__}: {e}")
            import traceback
            traceback.print_exc()
            return f"Error processing query: {str(e)}"
    

def main():
    """Main function to demonstrate the RAG assistant."""
    try:
        # Initialize the RAG assistant
        print("Initializing RAG Assistant...")
        assistant = RAGAssistant()

        # Load sample documents
        print("\nLoading documents...")
        sample_docs = load_documents()
        print(f"Loaded {len(sample_docs)} sample documents")

        assistant.add_documents(sample_docs)

        done = False

        while not done:
            question = input("Enter a question or 'quit' to exit: ")
            if question.lower() == "quit":
                done = True
            else:
                result = assistant.query(question)
                print(result)

    except Exception as e:
        print(f"Error running RAG assistant: {e}")
        print("Make sure you have set up your .env file with at least one API key:")
        print("- OPENAI_API_KEY (OpenAI GPT models)")
        print("- GROQ_API_KEY (Groq Llama models)")
        print("- GOOGLE_API_KEY (Google Gemini models)")


if __name__ == "__main__":
    main()
