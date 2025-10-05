# Receipt Extraction App

An AI-powered Next.js application that extracts structured data from receipt images using Google's Gemini AI.

## Features

- 🤖 **AI-Powered Extraction**: Uses Google Gemini AI to extract receipt data
- 📱 **Responsive Design**: Dark theme with modern UI/UX
- 📤 **Drag & Drop Upload**: Easy file upload with validation
- 💾 **Redux State Management**: Robust state management with persistence
- 📊 **Structured Output**: Extracts items, prices, store info, and more
- 🔒 **Privacy-First**: Local processing with secure API calls
- 📱 **Mobile Friendly**: Responsive design for all devices

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **State Management**: Redux Toolkit
- **AI**: Google Gemini AI (@google/genai)
- **File Processing**: Native File API

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Google Gemini API key

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd receipt-extraction
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   ```
   
   Add your Gemini API key to `.env.local`:
   ```env
   NEXT_PUBLIC_GEMINI_API_KEY=your_gemini_api_key_here
   ```

4. **Run the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

### Getting a Gemini API Key

1. Visit [Google AI Studio](https://aistudio.google.com/app/apikey)
2. Sign in with your Google account
3. Create a new API key
4. Copy the key to your `.env.local` file

## Usage

1. **Upload Receipt**: Drag and drop or click to upload JPG, PNG, or PDF files (max 10MB)
2. **Extract Data**: Click "Extract Data" to process the receipt with AI
3. **View Results**: See structured data including:
   - Store information (name, address, phone)
   - Purchase date
   - Itemized list with prices and quantities
   - Tax and total amounts
4. **History**: View previous extractions in the history section

## Project Structure

```
src/
├── app/                    # Next.js App Router
│   ├── layout.tsx         # Root layout with Redux Provider
│   ├── page.tsx           # Home page
│   ├── providers.tsx      # Redux Provider component
│   └── receipt-extraction/ # Receipt extraction page
├── components/            # Reusable UI components
│   ├── Header.tsx
│   ├── Hero.tsx
│   └── Footer.tsx
├── services/             # API services
│   └── geminiService.ts  # Gemini AI integration
├── store/               # Redux store
│   ├── index.ts         # Store configuration
│   ├── hooks.ts         # Typed Redux hooks
│   └── receiptSlice.ts  # Receipt state management
└── types/               # TypeScript definitions
    └── receipt.ts       # Receipt data types
```

## API Integration

The app uses Google's Gemini AI API for receipt processing:

- **Model**: gemini-1.5-flash (optimized for speed and accuracy)
- **Input**: Base64-encoded images (JPG, PNG, PDF)
- **Output**: Structured JSON with receipt data
- **Features**: Vision-language understanding for text extraction

## State Management

Redux Toolkit is used for state management with:

- **Async Thunks**: For API calls and file processing
- **Local Storage**: Automatic history persistence
- **Type Safety**: Full TypeScript integration
- **Middleware**: Custom serialization for file handling

## Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Connect your repository to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy automatically

### Other Platforms

The app can be deployed to any platform that supports Next.js:

- Netlify
- Railway
- DigitalOcean
- AWS Amplify

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `NEXT_PUBLIC_GEMINI_API_KEY` | Google Gemini API key | Yes |

## Browser Support

- Chrome 88+
- Firefox 85+
- Safari 14+
- Edge 88+

## License

This project is open source and available under the [MIT License](LICENSE).

## Support

For questions or issues:

1. Check the [Issues](../../issues) page
2. Create a new issue with detailed information
3. Provide screenshots and error messages if applicable

---

**Note**: This app requires a Google Gemini API key for AI functionality. The key is used client-side, so ensure you understand Google's usage policies and rate limits.
