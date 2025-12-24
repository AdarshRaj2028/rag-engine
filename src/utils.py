from pypdf import PdfReader
from fastapi import HTTPException, UploadFile
from langchain_community.document_loaders import PyMuPDFLoader, PDFPlumberLoader
import os
import logging

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

MAX_PAGES = 100


def validate_txt_or_pdf(filename: str, filepath: str) -> str:
    """
    Enhanced validate and load content from PDF or TXT files.
    Uses multiple PDF processing methods to handle different PDF types.
    
    Args:
        filename: Name of the file with extension
        filepath: Full path to the file
    
    Returns:
        str: Raw text content from the file
    
    Raises:
        FileNotFoundError: If file doesn't exist
        TypeError: If file is not PDF or TXT
        Exception: If PDF is too large or contains no extractable text
    """
    # Check if file exists
    if not os.path.exists(filepath):
        raise FileNotFoundError(f"File not found: {filepath}")
    
    # Case-insensitive extension check
    file_lower = filename.lower()
    
    if file_lower.endswith(".pdf"):
        return _process_pdf_file(filepath, filename)
    
    elif file_lower.endswith(".txt"):
        return _process_txt_file(filepath)
    
    else:
        raise TypeError(
            f"Unsupported file type: {filename}. "
            "Only .pdf and .txt files are supported."
        )


def _process_pdf_file(filepath: str, filename: str) -> str:
    """
    Process PDF file using multiple methods for better compatibility.
    
    Args:
        filepath: Full path to the PDF file
        filename: Name of the file
    
    Returns:
        str: Extracted text content
    
    Raises:
        Exception: If PDF processing fails
    """
    # Try multiple PDF processing methods
    methods = [
        ("PyMuPDFLoader", _try_pymupdf_loader),
        ("PDFPlumberLoader", _try_pdfplumber_loader),
        ("Direct PyPDF", _try_direct_pypdf),
    ]
    
    errors = []
    
    for method_name, method_func in methods:
        try:
            logger.info(f"Trying {method_name} for PDF processing...")
            result = method_func(filepath)
            
            if result and result.strip():
                logger.info(f"Successfully extracted text using {method_name}")
                return result
            else:
                logger.warning(f"{method_name} returned empty content")
                errors.append(f"{method_name}: No content extracted")
                
        except Exception as e:
            logger.warning(f"{method_name} failed: {str(e)}")
            errors.append(f"{method_name}: {str(e)}")
            continue
    
    # If all methods failed, provide detailed error information
    error_details = "; ".join(errors)
    
    # Try to get basic PDF info for debugging
    try:
        reader = PdfReader(filepath)
        page_count = len(reader.pages)
        metadata = reader.metadata
        
        debug_info = f"PDF has {page_count} pages"
        if metadata:
            if metadata.get('/Title'):
                debug_info += f", Title: {metadata['/Title']}"
            if metadata.get('/Producer'):
                debug_info += f", Producer: {metadata['/Producer']}"
        
        raise Exception(
            f"Failed to extract text from PDF using all methods. "
            f"{debug_info}. "
            f"Errors: {error_details}. "
            f"This PDF may be image-based or corrupted. "
            f"Consider using OCR processing for scanned documents."
        )
    except Exception as pdf_info_error:
        raise Exception(
            f"Failed to extract text from PDF and couldn't get PDF info. "
            f"Processing errors: {error_details}. "
            f"PDF info error: {str(pdf_info_error)}"
        )


def _try_pymupdf_loader(filepath: str) -> str:
    """Try PyMuPDFLoader method."""
    loader = PyMuPDFLoader(filepath)
    docs = loader.load()
    
    if not docs:
        raise Exception("PyMuPDFLoader returned no documents")
    
    page_count = docs[0].metadata.get("total_pages", 0)
    
    if page_count > MAX_PAGES:
        raise Exception(f"Document too large: {page_count} pages (limit: {MAX_PAGES})")
    
    raw_text = docs[0].page_content
    
    if not raw_text or not raw_text.strip():
        raise Exception("PyMuPDFLoader returned empty text content")
    
    return raw_text


def _try_pdfplumber_loader(filepath: str) -> str:
    """Try PDFPlumberLoader method."""
    loader = PDFPlumberLoader(filepath)
    docs = loader.load()
    
    if not docs:
        raise Exception("PDFPlumberLoader returned no documents")
    
    raw_text = docs[0].page_content
    
    if not raw_text or not raw_text.strip():
        raise Exception("PDFPlumberLoader returned empty text content")
    
    return raw_text


def _try_direct_pypdf(filepath: str) -> str:
    """Try direct PyPDF method."""
    reader = PdfReader(filepath)
    
    if len(reader.pages) > MAX_PAGES:
        raise Exception(f"Document too large: {len(reader.pages)} pages (limit: {MAX_PAGES})")
    
    text_content = []
    
    for page in reader.pages:
        page_text = page.extract_text()
        if page_text:
            text_content.append(page_text)
    
    if not text_content:
        raise Exception("Direct PyPDF extraction returned no text")
    
    full_text = "\n".join(text_content)
    
    if not full_text.strip():
        raise Exception("Direct PyPDF extraction returned empty text")
    
    return full_text


def _process_txt_file(filepath: str) -> str:
    """
    Process TXT file with encoding detection.
    
    Args:
        filepath: Full path to the TXT file
    
    Returns:
        str: File content
    
    Raises:
        Exception: If file processing fails
    """
    encodings = ['utf-8', 'latin-1', 'cp1252', 'iso-8859-1']
    
    for encoding in encodings:
        try:
            with open(filepath, 'r', encoding=encoding) as txt_file:
                raw_text = txt_file.read()
            
            if raw_text and raw_text.strip():
                return raw_text
            else:
                raise Exception(f"TXT file is empty (encoding: {encoding})")
                
        except UnicodeDecodeError:
            continue
        except Exception as e:
            if encoding == encodings[-1]:  # Last encoding attempt
                raise Exception(f"Error reading TXT file with all encodings: {str(e)}")
            continue
    
    raise Exception("Could not read TXT file with any supported encoding")


def validate_pdf_upload(file: UploadFile) -> int:
    """
    Enhanced validate an uploaded PDF file (for FastAPI).
    
    Args:
        file: UploadFile object from FastAPI
    
    Returns:
        int: Number of pages in the PDF
    
    Raises:
        HTTPException: If PDF is invalid or too large
    """
    try:
        # Read the file content
        reader = PdfReader(file.file)
        num_pages = len(reader.pages)
        
        if num_pages > MAX_PAGES:
            raise HTTPException(
                status_code=400,
                detail=f"PDF too large: {num_pages} pages (limit is {MAX_PAGES})."
            )
        
        # Rewind the file pointer for later processing
        file.file.seek(0)
        return num_pages
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=400,
            detail=f"Error validating PDF: {str(e)}"
        )


def get_file_size_mb(filepath: str) -> float:
    """
    Get file size in megabytes.
    
    Args:
        filepath: Path to the file
    
    Returns:
        float: File size in MB
    """
    if not os.path.exists(filepath):
        return 0.0
    
    size_bytes = os.path.getsize(filepath)
    size_mb = size_bytes / (1024 * 1024)
    return round(size_mb, 2)


def is_valid_file_type(filename: str) -> bool:
    """
    Check if filename has a valid extension.
    
    Args:
        filename: Name of the file
    
    Returns:
        bool: True if file type is supported
    """
    return filename.lower().endswith(('.pdf', '.txt'))


def get_pdf_info(filepath: str) -> dict:
    """
    Get detailed information about a PDF file for debugging.
    
    Args:
        filepath: Path to the PDF file
    
    Returns:
        dict: PDF information including page count, metadata, etc.
    """
    try:
        reader = PdfReader(filepath)
        info = {
            "page_count": len(reader.pages),
            "metadata": dict(reader.metadata) if reader.metadata else {},
            "file_size_mb": get_file_size_mb(filepath)
        }
        
        # Check if text can be extracted from first few pages
        text_pages = 0
        for i, page in enumerate(reader.pages[:3]):  # Check first 3 pages
            try:
                text = page.extract_text()
                if text and text.strip():
                    text_pages += 1
            except:
                pass
        
        info["extractable_text_pages"] = text_pages
        
        return info
        
    except Exception as e:
        return {"error": str(e)}
