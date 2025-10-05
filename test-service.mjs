// Test script to verify the Gemini service works with @google/genai
import { geminiService } from '../src/services/geminiService.js';

// Test API key validation (replace with actual key to test)
const testApiKey = 'your-test-api-key-here';

async function testService() {
  console.log('Testing Gemini service with @google/genai...');
  
  try {
    // Test API key validation
    console.log('Testing API key validation...');
    const isValid = await geminiService.testApiKey(testApiKey);
    console.log('API key valid:', isValid);
    
    console.log('Service appears to be working correctly!');
  } catch (error) {
    console.error('Error testing service:', error);
  }
}

// Only run if this file is executed directly
if (process.argv[1] === new URL(import.meta.url).pathname) {
  testService();
}