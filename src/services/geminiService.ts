import { GoogleGenAI } from '@google/genai';
import { ReceiptData, ApiResponse } from '@/types/receipt';

class GeminiReceiptService {
  private genAI: GoogleGenAI | null = null;

  constructor() {
    // Initialize will be called with API key
  }

  initialize(apiKey: string) {
    if (!apiKey) {
      throw new Error('Gemini API key is required');
    }

    this.genAI = new GoogleGenAI({ apiKey });
  }

  private async fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        // Remove data URL prefix to get just the base64 string
        const base64 = result.split(',')[1];
        resolve(base64);
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  private getPrompt(): string {
    return `Please analyze this receipt image and extract the following information in a structured JSON format:

    Extract these fields:
    - Store name (if visible)
    - Store address (if visible)  
    - Store phone number (if visible)
    - Purchase date (if visible)
    - List of items with name, quantity, unit price, and total price
    - Subtotal (if different from total)
    - Tax amount (if visible)
    - Total amount

    Return the data in this exact JSON structure:
    {
      "storeName": "Store Name Here",
      "address": "Store Address Here",
      "phone": "Phone Number Here", 
      "date": "YYYY-MM-DD",
      "items": [
        {
          "name": "Item Name",
          "quantity": "1",
          "unitPrice": "0",
          "price": "0"
        }
      ],
      "tax": "0",
      "total": "0"
    }

    Important notes:
    - Use null for any field that cannot be clearly identified
    - Ensure all prices are numbers (not strings)
    - Date should be in YYYY-MM-DD format
    - For items, "price" is the total price for that line item (quantity × unit price)
    - If unit price is not visible, you can calculate it or set it to the same as price for quantity 1
    - Be precise and only extract data that is clearly visible in the receipt

    Return only the JSON object, no additional text or formatting.`;
  }

  async extractReceiptData(file: File): Promise<ApiResponse> {
    try {
      if (!this.genAI) {
        throw new Error('Gemini service not initialized. Please provide API key.');
      }

      // Convert file to base64
      const base64Data = await this.fileToBase64(file);

      // Prepare the image data for Gemini
      const imagePart = {
        inlineData: {
          data: base64Data,
          mimeType: file.type
        }
      };

      // Get the prompt
      const prompt = this.getPrompt();

      // Generate content using the models API
      const result = await this.genAI.models.generateContent({
        model: 'gemini-2.0-flash-exp',
        contents: [{
          parts: [
            { text: prompt },
            imagePart
          ]
        }]
      });

      let text = result.candidates?.[0]?.content?.parts?.[0]?.text;

      if (!text) {
        throw new Error('No text content received from AI response');
      }

      // Clean up the response text
      text = text.trim();

      // Remove any markdown code blocks if present
      if (text.startsWith('```json')) {
        text = text.replace(/```json\n?/, '').replace(/\n?```$/, '');
      } else if (text.startsWith('```')) {
        text = text.replace(/```\n?/, '').replace(/\n?```$/, '');
      }

      console.log('Raw AI response text:', text);
      // Parse JSON response
      let extractedData: ReceiptData;
      try {
        extractedData = JSON.parse(text);
      } catch (parseError) {
        console.error('JSON parsing error:', parseError);
        console.error('Raw response:', text);
        throw new Error('Failed to parse AI response as JSON');
      }

      console.log('Raw AI JSON parse:', extractedData);

      // Validate the extracted data structure
      if (!extractedData.items || !Array.isArray(extractedData.items)) {
        throw new Error('Invalid response format: missing items array');
      }

      // Validate each item
      for (const item of extractedData.items) {
        if (typeof item.name !== 'string' ||
          typeof item.price !== 'string' ||
          typeof item.quantity !== 'string') {
          throw new Error('Invalid item format in response');
        }
      }

      // Generate unique ID and timestamp
      const id: string = `receipt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const timestamp: string = new Date().toISOString();

      // Create the final receipt data with both new and legacy fields
      const receiptData = {
        // New format fields
        id,
        storeName: extractedData.storeName || null,
        address: extractedData.address || null,
        phone: extractedData.phone || null,
        date: extractedData.date || null,
        items: extractedData.items,
        total: extractedData.total || null,
        tax: extractedData.tax || null,
        timestamp,
        fileName: file.name,

        // Legacy fields for backward compatibility
        products: extractedData.items.map((item: any) => ({
          name: item.name,
          price: item.price,
          quantity: item.quantity,
          total: item.price, // For legacy compatibility
        })),
        total_spending: extractedData.total || 0,
        extraction_date: timestamp,
        file_name: file.name
      };

      return {
        success: true,
        data: receiptData as ReceiptData
      };

    } catch (error) {
      console.error('Receipt extraction error:', error);

      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred during extraction'
      };
    }
  }

  // Method to test API key validity
  async testApiKey(apiKey: string): Promise<boolean> {
    try {
      this.initialize(apiKey);

      // Create a simple test request
      const result = await this.genAI!.models.generateContent({
        model: 'gemini-2.0-flash-exp',
        contents: [{
          parts: [{ text: 'Test connection. Respond with "OK"' }]
        }]
      });

      const text = result.candidates?.[0]?.content?.parts?.[0]?.text;

      if (!text) {
        return false;
      }

      return text.includes('OK') || text.length > 0;
    } catch (error) {
      console.error('API key test failed:', error);
      return false;
    }
  }
}

// Export singleton instance
export const geminiService = new GeminiReceiptService();
export default geminiService;