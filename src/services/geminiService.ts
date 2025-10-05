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

  private getReceiptValidationPrompt(): string {
    return `Analyze this image and determine if it is a payment receipt or invoice.

    A valid receipt/invoice should contain:
    - Store/business name
    - Purchase items or services
    - Prices or amounts
    - Total amount
    - Date (optional but preferred)

    Respond with ONLY one of these exact responses:
    - "VALID_RECEIPT" if this is clearly a payment receipt, invoice, or bill
    - "NOT_RECEIPT" if this is not a receipt (photo, document, menu, etc.)
    - "UNCLEAR_IMAGE" if the image is too blurry/unclear to determine

    Be strict in your validation. Only respond with "VALID_RECEIPT" if you can clearly see it's a commercial transaction document.`;
  }

  private getPrompt(): string {
    return `Please analyze this receipt image and extract the following information in a structured JSON format:

    Extract these fields:
    - Store name (if visible)
    - Store address (if visible)  
    - Store phone number (if visible)
    - Purchase date (if visible)
    - Currency used in the receipt
    - Total number of items purchased (excluding discounts)
    - List of items with name, quantity, unit price, and total price (including discounts as separate items)
    - Subtotal (if different from total)
    - Tax amount (if visible)
    - Total amount

    Return the data in this exact JSON structure:
    {
      "storeName": "Store Name Here",
      "address": "Store Address Here",
      "phone": "Phone Number Here", 
      "date": "YYYY-MM-DD",
      "currency": "USD",
      "totalItems": 0,
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

    ITEM EXTRACTION RULES:
    1. Extract all purchased products/services as positive-priced items
    2. Extract all discounts, coupons, or promotional reductions as separate items with NEGATIVE prices
    3. For discounts, use descriptive names like:
       - "Store Discount (10%)" 
       - "Coupon: SAVE20"
       - "Member Discount"
       - "Promotional Discount"
       - "Senior Discount"
       - etc.
    4. Discount items should have:
       - quantity: "1" (unless specified otherwise)
       - unitPrice: negative amount (e.g., "-5.00")
       - price: negative amount (e.g., "-5.00")
    5. Include the discount percentage or amount if visible on the receipt

    TOTAL ITEMS COUNTING RULES:
    1. First, look for "Total Items", "Item Count", "Qty", or similar text on the receipt
    2. If explicitly shown on receipt, use that number for totalItems
    3. If NOT shown on receipt, manually count by:
       - Count ONLY purchased products/services (positive-priced items)
       - Sum up the quantities of all non-discount items
       - DO NOT count discount items in the total
       - DO NOT count tax as an item
    4. Examples:
       - 2x Coffee + 1x Sandwich = totalItems: 3
       - 1x Pizza + 1x Drink + Discount = totalItems: 2 (discount not counted)
       - 3x Apples + 2x Bananas + Store Discount = totalItems: 5

    CURRENCY DETECTION RULES:
    1. First, look for explicit currency symbols or codes on the receipt (like $, €, £, ¥, USD, EUR, GBP, etc.)
    2. If no currency is directly visible, analyze the store address and context to determine the likely currency:
       - United States addresses → USD
       - Canada addresses → CAD  
       - European Union countries → EUR
       - United Kingdom addresses → GBP
       - Japan addresses → JPY
       - Australia addresses → AUD
       - And so on for other countries
    3. Consider the language and format of the receipt text as additional clues
    4. Use the ISO 4217 three-letter currency code format (e.g., USD, EUR, GBP, JPY)
    5. If currency cannot be determined, default to "USD"

    Important notes:
    - Use null for any field that cannot be clearly identified (except currency, use "USD" as fallback)
    - Ensure all prices are numbers (not strings), including negative numbers for discounts
    - totalItems should be a number representing count of purchased items (not discounts)
    - Date should be in YYYY-MM-DD format
    - For regular items, "price" is the total price for that line item (quantity × unit price)
    - For discount items, "price" should be negative to represent the reduction
    - If unit price is not visible, you can calculate it or set it to the same as price for quantity 1
    - Be precise and only extract data that is clearly visible in the receipt
    - Pay special attention to currency detection as it will be used for price formatting
    - Discounts help provide a complete picture of the transaction
    - totalItems helps with inventory and sales analytics

    DISCOUNT EXAMPLES:
    - If receipt shows "Item: $10.00" and "Discount: -$2.00", create two items:
      1. {"name": "Item", "quantity": "1", "unitPrice": "10.00", "price": "10.00"}
      2. {"name": "Discount", "quantity": "1", "unitPrice": "-2.00", "price": "-2.00"}
    - If receipt shows "20% off entire purchase: -$5.50", create item:
      {"name": "Store Discount (20%)", "quantity": "1", "unitPrice": "-5.50", "price": "-5.50"}

    Return only the JSON object, no additional text or formatting.`;
  }

  private async validateReceiptImage(file: File): Promise<{ isValid: boolean; reason?: string }> {
    try {
      if (!this.genAI) {
        throw new Error('Gemini service not initialized');
      }

      // Convert file to base64
      const base64Data = await this.fileToBase64(file);

      // Prepare the image data
      const imagePart = {
        inlineData: {
          data: base64Data,
          mimeType: file.type
        }
      };

      // Validate the image first
      const validationResult = await this.genAI.models.generateContent({
        model: 'gemini-2.0-flash-exp',
        contents: [{
          parts: [
            { text: this.getReceiptValidationPrompt() },
            imagePart
          ]
        }]
      });

      const validationText = validationResult.candidates?.[0]?.content?.parts?.[0]?.text?.trim();

      if (!validationText) {
        return {
          isValid: false,
          reason: 'Unable to analyze image. Please try with a clearer image.'
        };
      }

      console.log('🔍 Receipt validation response:', validationText);

      // Check validation result
      if (validationText.includes('VALID_RECEIPT')) {
        return { isValid: true };
      } else if (validationText.includes('NOT_RECEIPT')) {
        return {
          isValid: false,
          reason: 'This image does not appear to be a payment receipt. Please upload a receipt, invoice, or bill.'
        };
      } else if (validationText.includes('UNCLEAR_IMAGE')) {
        return {
          isValid: false,
          reason: 'The image is too unclear to process. Please upload a clearer image of your receipt.'
        };
      } else {
        return {
          isValid: false,
          reason: 'Unable to determine if this is a valid receipt. Please try with a clearer receipt image.'
        };
      }

    } catch (error) {
      console.error('Receipt validation error:', error);
      return {
        isValid: false,
        reason: 'Failed to validate image. Please try again.'
      };
    }
  }

  async extractReceiptData(file: File): Promise<ApiResponse> {
    try {
      if (!this.genAI) {
        throw new Error('Gemini service not initialized. Please provide API key.');
      }

      // Step 1: Validate that this is actually a receipt
      console.log('🔍 Validating receipt image...');
      const validation = await this.validateReceiptImage(file);

      if (!validation.isValid) {
        return {
          success: false,
          error: validation.reason || 'Invalid receipt image'
        };
      }

      console.log('✅ Receipt validation passed. Proceeding with extraction...');

      // Step 2: Extract receipt data
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
        totalItems: extractedData.totalItems || null,
        currency: extractedData.currency || 'USD',

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