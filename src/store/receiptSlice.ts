import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { ExtractionState, ReceiptData, ExtractDataPayload } from '@/types/receipt';
import { geminiService } from '@/services/geminiService';

// Load history from localStorage
const loadHistoryFromStorage = (): ReceiptData[] => {
  if (typeof window !== 'undefined') {
    try {
      const stored = localStorage.getItem('receipt-extraction-history');
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Error loading history from localStorage:', error);
      return [];
    }
  }
  return [];
};

// Save history to localStorage
const saveHistoryToStorage = (history: ReceiptData[]) => {
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem('receipt-extraction-history', JSON.stringify(history));
    } catch (error) {
      console.error('Error saving history to localStorage:', error);
    }
  }
};

// Initial state
const initialState: ExtractionState = {
  isLoading: false,
  isProcessing: false,
  data: null,
  currentExtraction: null,
  error: null,
  progress: 0,
  history: loadHistoryFromStorage(),
};

// Async thunk for extracting receipt data
export const extractReceiptData = createAsyncThunk(
  'receipt/extractData',
  async (payload: ExtractDataPayload, { rejectWithValue, dispatch }) => {
    try {
      const { file, apiKey } = payload;
      
      // Initialize the Gemini service
      geminiService.initialize(apiKey);
      
      // Update progress
      dispatch(updateProgress(25));
      
      // Extract data using Gemini API
      const result = await geminiService.extractReceiptData(file);
      
      dispatch(updateProgress(75));
      
      if (!result.success || !result.data) {
        throw new Error(result.error || 'Failed to extract receipt data');
      }
      
      dispatch(updateProgress(100));
      
      return result.data;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      return rejectWithValue(errorMessage);
    }
  }
);

// Async thunk for testing API key
export const testApiKey = createAsyncThunk(
  'receipt/testApiKey',
  async (apiKey: string, { rejectWithValue }) => {
    try {
      const isValid = await geminiService.testApiKey(apiKey);
      if (!isValid) {
        throw new Error('Invalid API key or connection failed');
      }
      return true;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'API key validation failed';
      return rejectWithValue(errorMessage);
    }
  }
);

const receiptSlice = createSlice({
  name: 'receipt',
  initialState,
  reducers: {
    // Reset state
    resetState: (state) => {
      state.isLoading = false;
      state.isProcessing = false;
      state.data = null;
      state.currentExtraction = null;
      state.error = null;
      state.progress = 0;
    },
    
    // Clear current extraction
    clearCurrentExtraction: (state) => {
      state.currentExtraction = null;
      state.error = null;
      state.progress = 0;
    },
    
    // Clear error
    clearError: (state) => {
      state.error = null;
    },
    
    // Update progress
    updateProgress: (state, action: PayloadAction<number>) => {
      state.progress = action.payload;
    },
    
    // Save current data to history
    saveToHistory: (state) => {
      if (state.data) {
        const newHistory = [state.data, ...state.history.slice(0, 9)]; // Keep last 10 items
        state.history = newHistory;
        saveHistoryToStorage(newHistory);
      }
    },
    
    // Clear history
    clearHistory: (state) => {
      state.history = [];
      saveHistoryToStorage([]);
    },
    
    // Remove item from history
    removeFromHistory: (state, action: PayloadAction<string>) => {
      const fileNameToRemove = action.payload;
      state.history = state.history.filter(item => item.file_name !== fileNameToRemove);
      saveHistoryToStorage(state.history);
    },
    
    // Load data from history
    loadFromHistory: (state, action: PayloadAction<string>) => {
      const fileName = action.payload;
      const historyItem = state.history.find(item => item.file_name === fileName);
      if (historyItem) {
        state.data = historyItem;
        state.error = null;
      }
    },
  },
  extraReducers: (builder) => {
    // Extract receipt data
    builder
      .addCase(extractReceiptData.pending, (state) => {
        state.isLoading = true;
        state.isProcessing = true;
        state.error = null;
        state.progress = 0;
      })
      .addCase(extractReceiptData.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isProcessing = false;
        state.data = action.payload;
        state.currentExtraction = action.payload;
        state.error = null;
        state.progress = 100;
        
        // Auto-save to history
        const newHistory = [action.payload, ...state.history.slice(0, 9)];
        state.history = newHistory;
        saveHistoryToStorage(newHistory);
      })
      .addCase(extractReceiptData.rejected, (state, action) => {
        state.isLoading = false;
        state.isProcessing = false;
        state.error = action.payload as string;
        state.progress = 0;
      });

    // Test API key
    builder
      .addCase(testApiKey.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(testApiKey.fulfilled, (state) => {
        state.isLoading = false;
        state.error = null;
      })
      .addCase(testApiKey.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const {
  resetState,
  clearError,
  clearCurrentExtraction,
  updateProgress,
  saveToHistory,
  clearHistory,
  removeFromHistory,
  loadFromHistory,
} = receiptSlice.actions;

export default receiptSlice.reducer;