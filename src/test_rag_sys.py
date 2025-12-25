"""
Comprehensive testing script for RAG Engine
Tests all critical paths and edge cases
"""
import os
import sys
from pathlib import Path

# Color codes for terminal output
GREEN = '\033[92m'
RED = '\033[91m'
YELLOW = '\033[93m'
BLUE = '\033[94m'
RESET = '\033[0m'

def print_test(test_name, passed, details=""):
    """Print formatted test result"""
    status = f"{GREEN}✓ PASS{RESET}" if passed else f"{RED}✗ FAIL{RESET}"
    print(f"{status} | {test_name}")
    if details:
        print(f"     └─ {details}")

def print_section(title):
    """Print section header"""
    print(f"\n{BLUE}{'='*60}{RESET}")
    print(f"{BLUE}{title}{RESET}")
    print(f"{BLUE}{'='*60}{RESET}\n")


def test_imports():
    """Test 1: Verify all imports work"""
    print_section("TEST 1: Import Validation")
    
    try:
        from app import RAGAssistant
        print_test("Import app.RAGAssistant", True)
    except Exception as e:
        print_test("Import app.RAGAssistant", False, str(e))
        return False
    
    try:
        from database import RAGDatabase
        print_test("Import database.RAGDatabase", True)
    except Exception as e:
        print_test("Import database.RAGDatabase", False, str(e))
        return False
    
    try:
        from vectordb import VectorDB
        print_test("Import vectordb.VectorDB", True)
    except Exception as e:
        print_test("Import vectordb.VectorDB", False, str(e))
        return False
    
    try:
        from utils import validate_txt_or_pdf
        print_test("Import utils.validate_txt_or_pdf", True)
    except Exception as e:
        print_test("Import utils.validate_txt_or_pdf", False, str(e))
        return False
    
    return True


def test_data_directory():
    """Test 2: Check data directory setup"""
    print_section("TEST 2: Data Directory Setup")
    
    data_dir = Path("data")
    
    # Check if data directory exists
    if not data_dir.exists():
        data_dir.mkdir()
        print_test("Create data directory", True)
    else:
        print_test("Data directory exists", True)
    
    # Check for files in data directory
    files = list(data_dir.glob("*"))
    pdf_files = list(data_dir.glob("*.pdf"))
    txt_files = list(data_dir.glob("*.txt"))
    
    print_test(
        "Files in data directory", 
        len(files) > 0, 
        f"Found {len(files)} files ({len(pdf_files)} PDF, {len(txt_files)} TXT)"
    )
    
    return len(files) > 0


def test_database_initialization():
    """Test 3: Database initialization"""
    print_section("TEST 3: Database Initialization")
    
    try:
        from database import RAGDatabase
        
        db = RAGDatabase("test_rag.db")
        db.connect()
        print_test("Database connection", True)
        
        db.create_tables()
        print_test("Create tables", True)
        
        # Test session creation
        session_id = db.generate_session_id()
        db.create_session(session_id)
        print_test("Create session", True, f"Session ID: {session_id[:8]}...")
        
        # Test session retrieval
        session_info = db.get_session_info(session_id)
        print_test(
            "Retrieve session info", 
            session_info is not None,
            f"Messages: {session_info.get('message_count', 0)}"
        )
        
        db.close()
        
        # Clean up test database
        if os.path.exists("test_rag.db"):
            os.remove("test_rag.db")
        
        return True
    except Exception as e:
        print_test("Database initialization", False, str(e))
        return False


def test_utils_validation():
    """Test 4: Utils validation functions"""
    print_section("TEST 4: Utils Validation")
    
    try:
        from utils import validate_txt_or_pdf, is_valid_file_type
        
        # Test file type validation
        print_test("Validate PDF extension", is_valid_file_type("test.pdf"))
        print_test("Validate TXT extension", is_valid_file_type("test.txt"))
        print_test("Reject invalid extension", not is_valid_file_type("test.docx"))
        
        # Test with actual file if exists
        data_dir = Path("data")
        pdf_files = list(data_dir.glob("*.pdf"))
        txt_files = list(data_dir.glob("*.txt"))
        
        if pdf_files:
            try:
                text = validate_txt_or_pdf(pdf_files[0].name, str(pdf_files[0]))
                print_test(
                    "Read PDF file", 
                    len(text) > 0, 
                    f"Extracted {len(text)} characters"
                )
            except Exception as e:
                print_test("Read PDF file", False, str(e))
        
        if txt_files:
            try:
                text = validate_txt_or_pdf(txt_files[0].name, str(txt_files[0]))
                print_test(
                    "Read TXT file", 
                    len(text) > 0, 
                    f"Extracted {len(text)} characters"
                )
            except Exception as e:
                print_test("Read TXT file", False, str(e))
        
        return True
    except Exception as e:
        print_test("Utils validation", False, str(e))
        return False


def test_vectordb():
    """Test 5: VectorDB operations"""
    print_section("TEST 5: VectorDB Operations")
    
    try:
        from vectordb import VectorDB
        
        # Initialize VectorDB
        vdb = VectorDB(collection_name="test_collection")
        print_test("VectorDB initialization", True)
        
        # Test chunking
        sample_text = "This is a test document. " * 100
        chunks = vdb.chunk_text(sample_text)
        print_test("Text chunking", len(chunks) > 0, f"Generated {len(chunks)} chunks")
        
        # Test adding document
        chunk_count = vdb.add_document(sample_text, "test_doc_123")
        print_test("Add document", chunk_count > 0, f"Added {chunk_count} chunks")
        
        # Test search
        results = vdb.search("test document", n_results=3)
        print_test(
            "Search documents", 
            len(results.get("documents", [])) > 0,
            f"Found {len(results.get('documents', []))} results"
        )
        
        # Test collection count
        count = vdb.get_collection_count()
        print_test("Get collection count", count > 0, f"Count: {count}")
        
        # Clean up
        vdb.delete_collection()
        print_test("Delete collection", True)
        
        return True
    except Exception as e:
        print_test("VectorDB operations", False, str(e))
        return False


def test_rag_assistant():
    """Test 6: RAGAssistant end-to-end"""
    print_section("TEST 6: RAGAssistant End-to-End")
    
    try:
        from app import RAGAssistant
        
        # Check for API key
        has_api_key = (
            os.getenv("OPENAI_API_KEY") or 
            os.getenv("GROQ_API_KEY") or 
            os.getenv("GOOGLE_API_KEY")
        )
        
        if not has_api_key:
            print_test(
                "API key check", 
                False, 
                "No API key found in .env file"
            )
            return False
        
        print_test("API key check", True)
        
        # Initialize assistant
        assistant = RAGAssistant()
        print_test("RAGAssistant initialization", True)
        
        # Find a test file
        data_dir = Path("data")
        test_files = list(data_dir.glob("*.pdf")) + list(data_dir.glob("*.txt"))
        
        if not test_files:
            print_test("Test file available", False, "No files in data/ directory")
            return False
        
        test_file = test_files[0]
        print_test("Test file available", True, f"Using {test_file.name}")
        
        # Upload document
        result = assistant.upload_document(str(test_file))
        
        if result.get("status") == "error":
            print_test("Upload document", False, result.get("error"))
            return False
        
        print_test(
            "Upload document", 
            True, 
            f"Chunks: {result.get('chunk_count')}, Was processed: {result.get('was_processed')}"
        )
        
        session_id = result.get("session_id")
        
        # Query the document
        query_result = assistant.query(
            "What is this document about?", 
            session_id=session_id
        )
        
        if query_result.get("status") == "error":
            print_test("Query document", False, query_result.get("error"))
            return False
        
        print_test(
            "Query document", 
            True, 
            f"Answer length: {len(query_result.get('answer', ''))} chars"
        )
        
        # Clean up
        if os.path.exists("rag_engine.db"):
            os.remove("rag_engine.db")
        
        return True
    except Exception as e:
        print_test("RAGAssistant", False, str(e))
        import traceback
        traceback.print_exc()
        return False


def test_edge_cases():
    """Test 7: Edge cases and error handling"""
    print_section("TEST 7: Edge Cases & Error Handling")
    
    try:
        from app import RAGAssistant
        from database import RAGDatabase
        
        assistant = RAGAssistant()
        
        # Test 1: Query without uploading document
        result = assistant.query("test query")
        print_test(
            "Query without document", 
            "error" in result or result.get("status") == "error",
            "Correctly returns error"
        )
        
        # Test 2: Upload non-existent file
        result = assistant.upload_document("/nonexistent/file.pdf")
        print_test(
            "Upload non-existent file",
            "error" in result or result.get("status") == "error",
            "Correctly returns error"
        )
        
        # Test 3: Database operations with invalid session
        db = RAGDatabase("test_edge.db")
        db.connect()
        doc_info = db.get_document_by_session("invalid_session_id")
        print_test("Invalid session query", doc_info is None, "Returns None")
        db.close()
        
        if os.path.exists("test_edge.db"):
            os.remove("test_edge.db")
        
        return True
    except Exception as e:
        print_test("Edge cases", False, str(e))
        return False


def main():
    """Run all tests"""
    print(f"\n{YELLOW}{'='*60}{RESET}")
    print(f"{YELLOW}RAG ENGINE COMPREHENSIVE TEST SUITE{RESET}")
    print(f"{YELLOW}{'='*60}{RESET}\n")
    
    tests = [
        ("Import Validation", test_imports),
        ("Data Directory", test_data_directory),
        ("Database", test_database_initialization),
        ("Utils Validation", test_utils_validation),
        ("VectorDB", test_vectordb),
        ("RAGAssistant", test_rag_assistant),
        ("Edge Cases", test_edge_cases),
    ]
    
    results = []
    
    for test_name, test_func in tests:
        try:
            passed = test_func()
            results.append((test_name, passed))
        except Exception as e:
            print(f"\n{RED}CRITICAL ERROR in {test_name}:{RESET}")
            print(f"{RED}{str(e)}{RESET}\n")
            results.append((test_name, False))
    
    # Print summary
    print_section("TEST SUMMARY")
    
    passed_count = sum(1 for _, passed in results if passed)
    total_count = len(results)
    
    for test_name, passed in results:
        status = f"{GREEN}✓{RESET}" if passed else f"{RED}✗{RESET}"
        print(f"{status} {test_name}")
    
    print(f"\n{YELLOW}{'='*60}{RESET}")
    percentage = (passed_count / total_count) * 100
    color = GREEN if percentage == 100 else YELLOW if percentage >= 70 else RED
    print(f"{color}PASSED: {passed_count}/{total_count} ({percentage:.1f}%){RESET}")
    print(f"{YELLOW}{'='*60}{RESET}\n")
    
    if passed_count == total_count:
        print(f"{GREEN}🎉 ALL TESTS PASSED! Your RAG Engine is ready to deploy.{RESET}\n")
    elif passed_count >= total_count * 0.7:
        print(f"{YELLOW}⚠️  Most tests passed. Review failures before deploying.{RESET}\n")
    else:
        print(f"{RED}❌ Multiple test failures. Fix critical issues before deploying.{RESET}\n")


if __name__ == "__main__":
    main()