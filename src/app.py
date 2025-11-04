import os
from typing import List
from dotenv import load_dotenv
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import StrOutputParser
from vectordb import VectorDB
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

    # Your implementation here
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
        # TODO: Implement your RAG prompt template
        # HINT: Use ChatPromptTemplate.from_template() with a template string
        # HINT: Your template should include placeholders for {context} and {question}
        # HINT: Design your prompt to effectively use retrieved context to answer questions
        self.prompt_template = None  # Your implementation here

        # Create the chain
        self.chain = self.prompt_template | self.llm | StrOutputParser()

        print("RAG Assistant initialized successfully")

    def _initialize_llm(self):
        """
        Initialize the LLM by checking for available API keys.
        Tries OpenAI, Groq, and Google Gemini in that order.
        """
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

    def invoke(self, input: str, n_results: int = 3) -> str:
        """
        Query the RAG assistant.

        Args:
            input: User's input
            n_results: Number of relevant chunks to retrieve

        Returns:
            Dictionary containing the answer and retrieved context
        """
        llm_answer = ""
        # TODO: Implement the RAG query pipeline
        # HINT: Use self.vector_db.search() to retrieve relevant context chunks
        # HINT: Combine the retrieved document chunks into a single context string
        # HINT: Use self.chain.invoke() with context and question to generate the response
        # HINT: Return a string answer from the LLM

        # Your implementation here
        return llm_answer


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
