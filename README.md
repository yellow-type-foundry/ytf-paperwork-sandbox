# YTF Paperwork

A Next.js application for managing Yellow Type Foundry's paperwork, including EULA generation, invoices, and quotations with AI-powered natural language processing.

## Features

- **AI-Powered Parsing**: Uses Hugging Face Inference API to understand natural language requests
- **Intelligent Fallback**: Falls back to rule-based parsing if AI confidence is low
- **Enhanced Style Matching**: Handles ambiguous, misspelled, and invalid style names
- **Comprehensive Licensing**: Supports all YTF license types and business tiers

## AI Integration Setup

### 1. Get Hugging Face API Key
1. Go to [Hugging Face Settings](https://huggingface.co/settings/tokens)
2. Create a new token (free tier includes 30,000 requests/month)
3. Copy your API key

### 2. Configure Environment
Create a `.env.local` file in the root directory:
```bash
HUGGINGFACE_API_KEY=your_api_key_here
```

### 3. How It Works
- **AI First**: Attempts to parse requests using Hugging Face's DialoGPT model
- **Confidence Check**: Only uses AI results if confidence > 70%
- **Rule Fallback**: Falls back to enhanced rule-based parsing if AI fails
- **Error Handling**: Graceful degradation with user feedback

## Usage Examples

**Input**: "I need YTF Gióng Italic and YTF Xanh Bold for my website. We have 35 employees."

**AI Output**:
- Typefaces: YTF Gióng Italic, YTF Xanh Bold
- Business Size: S (under 50 employees)
- Licenses: Desktop, Web
- Usage: Under 5K units
- Suggestions: "Consider Logo license for brand identity"

## Development

```bash
npm install
npm run dev
```

The AI integration is completely optional - the app works without it using rule-based parsing.

## Features

- EULA Editor with real-time preview
- PDF generation
- Form validation
- Responsive design
- Dark/Light mode support

## Tech Stack

- Next.js 14
- React
- TypeScript
- Tailwind CSS
- Shadcn UI
- React Hook Form
- Zod
- Vercel (Deployment)

## Getting Started

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   # or
   yarn install
   # or
   pnpm install
   ```
3. Run the development server:
   ```bash
   npm run dev
   # or
   yarn dev
   # or
   pnpm dev
   ```
4. Open [http://localhost:3000](http://localhost:3000) in your browser

## Deployment

This project is automatically deployed to Vercel. Any changes pushed to the main branch will trigger a new deployment.

## License

© 2024 Yellow Type Foundry. All rights reserved.
