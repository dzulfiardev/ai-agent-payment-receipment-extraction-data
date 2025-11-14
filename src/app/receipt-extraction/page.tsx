"use client";

import { useState, useRef, useCallback } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { ImagePreviewDialog, ExtractionHistory } from "@/components/ReceiptExtraction";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { extractReceiptData, clearCurrentExtraction } from "@/store/receiptSlice";
import { formatCurrency as formatCurrencyHelper } from "@/common/helpers";
import SelectAutoCompleteCustom from "@/components/ReceiptExtraction/SelectAutoCompleteCustom";
import { countries } from "@/services/optionsData";
import { exportToExcel, exportToCSV, exportToCSVComplete } from "@/services/exportServices"

export default function ReceiptExtractionPage() {
  const dispatch = useAppDispatch();
  const { isLoading, error, currentExtraction, history } = useAppSelector((state) => state.receipt);

  const [isDragging, setIsDragging] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<string | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);
  const [isImageDialogOpen, setIsImageDialogOpen] = useState(false);
  const [country, setCountry] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Supported file types
  const supportedTypes = ["image/jpeg", "image/jpg", "image/png", "application/pdf"];
  const maxFileSize = 10 * 1024 * 1024; // 10MB

  // Format price using detected currency
  const formatPrice = (amount: number | string): string => {
    const currency = currentExtraction?.currency || "USD";
    return formatCurrencyHelper(amount, currency);
  };

  const validateFile = (file: File): boolean => {
    setFileError(null);

    if (!supportedTypes.includes(file.type)) {
      setFileError("Please upload a JPG, PNG, or PDF file");
      return false;
    }

    if (file.size > maxFileSize) {
      setFileError("File size must be less than 10MB");
      return false;
    }

    return true;
  };

  const handleFileSelect = (file: File) => {
    if (validateFile(file)) {
      setSelectedFile(file);
      dispatch(clearCurrentExtraction());

      // Create preview for images
      if (file.type.startsWith("image/")) {
        const reader = new FileReader();
        reader.onload = (e) => {
          setFilePreview(e.target?.result as string);
        };
        reader.readAsDataURL(file);
      } else {
        setFilePreview(null);
      }
    }
  };

  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  }, []);

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const handleBrowseClick = () => {
    fileInputRef.current?.click();
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
    setFilePreview(null);
    setFileError(null);
    setIsImageDialogOpen(false); // Close dialog when file is removed
    dispatch(clearCurrentExtraction());
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleExtractData = async () => {
    if (!selectedFile) return;

    // For now, use a test API key or prompt user
    const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY || prompt("Please enter your Gemini API key:");

    if (!apiKey) {
      alert("API key is required for data extraction");
      return;
    }

    if (!country || country.trim() === "") {
      alert("Please select your country before proceeding");
      return;
    }

    try {
      await dispatch(extractReceiptData({ file: selectedFile, apiKey, country: country })).unwrap();
    } catch (error) {
      console.error("Extraction failed:", error);
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-900">
      <Header />
      <main className="flex-grow bg-gradient-to-br from-gray-900 via-gray-800 to-blue-900">
        <div className="py-16 sm:py-24 lg:pb-24 lg:pt-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Page Header */}
            <div className="text-center mb-8">
              <div className="inline-flex items-center px-4 py-2 bg-blue-500/10 border border-blue-500/20 rounded-full text-blue-400 text-sm font-medium mb-6 backdrop-blur-sm">
                <span className="w-2.5 h-2.5 bg-blue-400 rounded-full mr-3 animate-pulse"></span>
                AI Receipt Processing
              </div>
              <h1 className="text-3xl sm:text-4xl lg:text-4xl mt-2 font-bold text-white mb-3 tracking-tight">Receipt Data Extraction</h1>
              <p className="text-lg sm:text-xl text-gray-300 max-w-2xl mx-auto">Upload your receipt and let AI extract structured data in seconds</p>
            </div>

            {/* Main Upload Area */}
            <div className="max-w-4xl mx-auto">
              <div className="relative z-50 bg-gray-900/50 backdrop-blur-sm rounded-3xl border border-gray-700/50 shadow-2xl">
                <div className="p-4 md:p-7">
                  {/* Hidden File Input */}
                  <input ref={fileInputRef} type="file" accept=".jpg,.jpeg,.png,.pdf" onChange={handleFileInputChange} className="hidden" />

                  {!selectedFile ? (
                    /* Upload Zone */
                    <div
                      className={`border-2 border-dashed rounded-2xl p-12 text-center transition-all duration-300 cursor-pointer ${isDragging ? "border-blue-400 bg-blue-500/10" : "border-gray-600 hover:border-blue-500 hover:bg-blue-500/5"
                        } group`}
                      onDragEnter={handleDragEnter}
                      onDragLeave={handleDragLeave}
                      onDragOver={handleDragOver}
                      onDrop={handleDrop}
                      onClick={handleBrowseClick}>
                      <div className="mb-6">
                        <div
                          className={`w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-4 transition-all duration-300 ${isDragging ? "bg-blue-500/30" : "bg-gray-800 group-hover:bg-blue-500/20"
                            }`}>
                          <svg
                            className={`w-10 h-10 transition-colors duration-300 ${isDragging ? "text-blue-400" : "text-gray-400 group-hover:text-blue-400"}`}
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                          </svg>
                        </div>
                      </div>
                      <h3 className="text-white text-xl font-semibold mb-3">{isDragging ? "Drop your file here" : "Upload Receipt Image"}</h3>
                      <p className="text-gray-400 mb-8 text-lg">{isDragging ? "Release to upload" : "Drag and drop your receipt image here, or click to browse"}</p>
                      <button className="bg-blue-500 hover:bg-blue-600 text-white cursor-pointer px-8 py-4 rounded-2xl font-semibold text-lg transition-all duration-300 transform hover:-translate-y-0.5 hover:shadow-lg hover:shadow-blue-500/25 inline-flex items-center gap-3">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                        </svg>
                        Browse File
                      </button>
                    </div>
                  ) : (
                    /* File Preview */
                    <div className="space-y-6">
                      <div className="bg-gray-800/50 rounded-2xl p-6 border border-gray-700/50">
                        <div className="flex items-start justify-between mb-4">
                          <h3 className="text-white text-lg font-semibold">Selected File</h3>
                          <button onClick={handleRemoveFile} className="text-gray-400 hover:text-red-400 transition-colors" disabled={isLoading}>
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </div>

                        <div className="flex items-center space-x-4">
                          {filePreview ? (
                            <img
                              src={filePreview}
                              alt="File preview"
                              className="w-16 h-16 cursor-zoom-in object-cover rounded-lg border border-gray-600 hover:border-blue-400 transition-all duration-200 hover:scale-105"
                              onClick={() => setIsImageDialogOpen(true)}
                              title="Click to view full size"
                            />
                          ) : (
                            <div className="w-16 h-16 bg-red-500/20 rounded-lg flex items-center justify-center">
                              <svg className="w-8 h-8 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                                />
                              </svg>
                            </div>
                          )}

                          <div className="flex-1 min-w-0">
                            <p className="text-white font-medium truncate">{selectedFile.name}</p>
                            <p className="text-gray-400 text-sm">{formatFileSize(selectedFile.size)}</p>
                            <p className="text-gray-400 text-sm">{selectedFile.type}</p>
                          </div>
                        </div>
                      </div>

                      {filePreview && (
                        <div className="w-full px-10">
                          <SelectAutoCompleteCustom
                            label="Select Your Country"
                            labelSearch="Choose Country"
                            options={countries}
                            value={country}
                            onChange={setCountry}
                          />
                          <small className="text-gray-400 text-xs">
                            Country may help to define the currency.
                          </small>
                        </div>
                      )}

                      {/* Process Button */}
                      <div className="text-center">
                        <button
                          onClick={handleExtractData}
                          disabled={isLoading}
                          className={`px-12 py-4 rounded-2xl cursor-pointer font-semibold text-lg transition-all duration-300 transform inline-flex items-center gap-3 ${isLoading
                            ? "bg-gray-600 cursor-not-allowed"
                            : "bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 hover:scale-105 hover:shadow-lg hover:shadow-green-500/25"
                            } text-white`}>
                          {isLoading ? (
                            <>
                              <svg className="w-5 h-5 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                                />
                              </svg>
                              Processing...
                            </>
                          ) : (
                            <>
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                              </svg>
                              Extract Data
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Error Messages */}
                  {(fileError || error) && (
                    <div className="mt-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl">
                      <div className="flex items-center">
                        <svg className="w-5 h-5 text-red-400 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <p className="text-red-400 text-sm">{fileError || error}</p>
                      </div>
                    </div>
                  )}

                  {/* Extraction Results */}
                  {currentExtraction && (
                    <div className="mt-8 bg-gray-800/50 rounded-2xl p-6 border border-gray-700/50">
                      <div className="flex items-center justify-between mb-8">

                        <h3 className="text-white text-xl font-semibold flex items-center">
                          <svg className="w-6 h-6 text-green-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          Extraction Complete
                        </h3>

                        <div className="flex gap-2">
                          <button
                            onClick={() => exportToExcel(currentExtraction)}
                            className="px-4 py-2 cursor-pointer bg-green-600 hover:bg-green-700 cursor pointer text-white rounded-lg transition-colors font-medium flex items-center gap-2 text-sm"
                          >
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z" />
                            </svg>
                            Download Excel
                          </button>
                          {/* <button
                          onClick={() => exportToCSVComplete(currentExtraction)}
                          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-medium flex items-center gap-2 text-sm"
                        >
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z" />
                          </svg>
                          CSV
                        </button> */}
                        </div>
                      </div>

                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Basic Info */}
                        <div className="space-y-4">
                          <h4 className="text-white font-medium text-lg">Receipt Information</h4>
                          <div className="space-y-3">
                            <div className="flex justify-between">
                              <span className="text-gray-400">Store Name:</span>
                              <span className="text-white font-medium">{currentExtraction.storeName || "N/A"}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-400">Date:</span>
                              <span className="text-white font-medium">{currentExtraction.date ? new Date(currentExtraction.date).toLocaleDateString() : "N/A"}</span>
                            </div>
                            {currentExtraction.totalDiscount && (
                              <div className="flex justify-between">
                                <span className="text-gray-400">Total Discount:</span>
                                <span className="text-white font-medium">{currentExtraction.totalDiscount ? formatPrice(currentExtraction.totalDiscount) : "N/A"}</span>
                              </div>
                            )}
                            <div className="flex justify-between">
                              <span className="text-gray-400">Total Amount:</span>
                              <span className="text-white font-medium text-lg">
                                {/* {currentExtraction.total ? (typeof currentExtraction.total === 'string' ? currentExtraction.total : formatPrice(currentExtraction.total)) : 'N/A'} */}
                                {currentExtraction.total ? formatPrice(currentExtraction.total) : "N/A"}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-400">Tax:</span>
                              <span className="text-white font-medium">{currentExtraction.tax ? formatPrice(currentExtraction.tax) : "N/A"}</span>
                            </div>
                          </div>
                        </div>

                        {/* Items */}
                        <div className="space-y-4">
                          <h4 className="text-white font-medium text-lg">Items ({currentExtraction.totalItems || 0})</h4>
                          <div className="max-h-64 overflow-y-auto space-y-2 pr-2 custom-scrollbar">
                            {currentExtraction.items && currentExtraction.items.length > 0 ? (
                              currentExtraction.items.map((item: any, index: number) => (
                                <div key={index} className="bg-gray-700/30 rounded-lg p-3">
                                  <div className="flex justify-between items-start">
                                    <div className="flex-1 min-w-0">
                                      <p className="text-white font-medium truncate">{item.name}</p>
                                      <p className="text-gray-400 text-sm">Qty: {item.quantity}</p>
                                    </div>
                                    <div className="text-right ml-2">
                                      <p className="text-white font-medium">{item.price ? formatPrice(item.price) : "N/A"}</p>
                                      {item.unitPrice && <p className="text-gray-400 text-sm">{item.unitPrice ? formatPrice(item.unitPrice) : "N/A"} each</p>}
                                    </div>
                                  </div>
                                </div>
                              ))
                            ) : (
                              <p className="text-gray-400 text-center py-4">No items found</p>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Additional Info */}
                      {(currentExtraction.address || currentExtraction.phone) && (
                        <div className="mt-6 pt-6 border-t border-gray-700">
                          <h4 className="text-white font-medium text-lg mb-3">Store Details</h4>
                          <div className="space-y-2">
                            {currentExtraction.address && (
                              <p className="text-gray-400">
                                <span className="text-white">Address:</span> {currentExtraction.address}
                              </p>
                            )}
                            {currentExtraction.phone && (
                              <p className="text-gray-400">
                                <span className="text-white">Phone:</span> {currentExtraction.phone}
                              </p>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* File Info */}
                  {!selectedFile && (
                    <div className="mt-8 text-center">
                      <div className="flex flex-wrap justify-center items-center gap-6 text-gray-400 text-sm">
                        <div className="flex items-center">
                          <svg className="w-4 h-4 mr-2 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                          JPG, PNG, PDF
                        </div>
                        <div className="flex items-center">
                          <svg className="w-4 h-4 mr-2 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                          Max 10MB
                        </div>
                        <div className="flex items-center">
                          <svg className="w-4 h-4 mr-2 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                          Secure & Private
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Extraction History */}
              <ExtractionHistory history={history} itemsPerPage={5} />

              {/* How it Works */}
              <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="text-center p-6">
                  <div className="w-16 h-16 bg-blue-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <span className="text-2xl">📤</span>
                  </div>
                  <h3 className="text-white font-semibold text-lg mb-2">1. Upload</h3>
                  <p className="text-gray-400">Upload your receipt image in any supported format</p>
                </div>
                <div className="text-center p-6">
                  <div className="w-16 h-16 bg-purple-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <span className="text-2xl">🤖</span>
                  </div>
                  <h3 className="text-white font-semibold text-lg mb-2">2. Process</h3>
                  <p className="text-gray-400">AI analyzes and extracts data from your receipt</p>
                </div>
                <div className="text-center p-6">
                  <div className="w-16 h-16 bg-green-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <span className="text-2xl">📊</span>
                  </div>
                  <h3 className="text-white font-semibold text-lg mb-2">3. Extract</h3>
                  <p className="text-gray-400">Get structured data ready for use</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Image Preview Dialog */}
        <ImagePreviewDialog
          isOpen={isImageDialogOpen}
          imageUrl={filePreview}
          fileName={selectedFile?.name}
          fileSize={selectedFile?.size}
          fileType={selectedFile?.type}
          onClose={() => setIsImageDialogOpen(false)}
        />
      </main>
      <Footer />
    </div>
  );
}
