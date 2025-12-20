// src/context/FileContext.js
import React, { createContext, useState, useContext } from 'react';

const FileContext = createContext();

export const useFileContext = () => {
  const context = useContext(FileContext);
  if (!context) {
    throw new Error('useFileContext must be used within a FileProvider');
  }
  return context;
};

export const FileProvider = ({ children }) => {
  const [uploadedFile, setUploadedFile] = useState(null);
  const [fileProcessed, setFileProcessed] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [uploaderKey, setUploaderKey] = useState(0);
  const [newlyProcessed, setNewlyProcessed] = useState(false);

  const handleFileUpload = (file) => {
    setUploadedFile(file.name);
    setIsProcessing(true);
    setNewlyProcessed(false);
    
    // Simulate processing
    setTimeout(() => {
      setFileProcessed(true);
      setIsProcessing(false);
      setNewlyProcessed(true); // Flag to trigger welcome message
    }, 4500);
  };

  const removeDocument = () => {
    setUploadedFile(null);
    setFileProcessed(false);
    setNewlyProcessed(false);
    setUploaderKey(prev => prev + 1);
  };

  const clearNewlyProcessedFlag = () => {
    setNewlyProcessed(false);
  };

  const value = {
    uploadedFile,
    fileProcessed,
    isProcessing,
    uploaderKey,
    newlyProcessed,
    handleFileUpload,
    removeDocument,
    clearNewlyProcessedFlag
  };

  return (
    <FileContext.Provider value={value}>
      {children}
    </FileContext.Provider>
  );
};