import { HfInference } from '@huggingface/inference';

// Initialize Hugging Face client
const hf = new HfInference(process.env.HUGGINGFACE_API_KEY);

// Available YTF typefaces for validation
const YTF_TYPEFACES = [
  'YTF Gióng', 'YTF Xanh', 'YTF Oldman', 'YTF Eon', 'YTF Garamông'
];

// Business size tiers
const BUSINESS_SIZES = ['individual', 'xs', 's', 'm', 'l', 'xl'];

// License types
const LICENSE_TYPES = ['desktop', 'web', 'logo', 'packaging', 'app', 'broadcast', 'merchandising', 'publishing'];

// Usage tiers
const USAGE_TIERS = ['non-commercial', 'under-5k', 'under-50k', 'under-500k'];

interface AIResponse {
  typefaces: Array<{
    family: string;
    style: string;
    confidence: number;
  }>;
  businessSize: string;
  licenseTypes: string[];
  usage: string;
  suggestions: string[];
  confidence: number;
  pricing?: {
    basePrices: number[];
    totalBeforeDiscount: number;
    discount: number;
    totalAfterDiscount: number;
    discountBreakdown: string;
  };
  bundleSuggestions?: Array<{
    type: 'style' | 'license' | 'typeface';
    description: string;
    potentialSavings: number;
  }>;
}

// System prompt for the AI with full licensing model understanding
const SYSTEM_PROMPT = `You are a typeface licensing expert for Yellow Type Foundry. Parse user requests and return a JSON object with the following structure:

{
  "typefaces": [
    {
      "family": "YTF Gióng",
      "style": "Italic", 
      "confidence": 0.95
    }
  ],
  "businessSize": "s",
  "licenseTypes": ["desktop", "web", "packaging"],
  "usage": "under-5k",
  "suggestions": ["Please confirm if you need Logo licenses for brand identity"],
  "confidence": 0.9,
  "pricing": {
    "basePrices": [270, 300],
    "totalBeforeDiscount": 870,
    "discount": 131,
    "totalAfterDiscount": 739,
    "discountBreakdown": "15% style discount + 5% license type discount"
  },
  "bundleSuggestions": [
    {
      "type": "style",
      "description": "Add YTF Oldman for 20% style discount",
      "potentialSavings": 174
    }
  ]
}

LICENSING MODEL RULES:

1. BASE PRICING:
   - Individual: $90 (Sans) / $100 (Serif) - non-commercial only
   - XS (<20): 2× base price
   - S (<50): 3× base price  
   - M (<150): 5× base price
   - L (<250): 8× base price
   - XL (<500): 10× base price

2. LICENSE TYPE MULTIPLIERS:
   - Desktop/Web: Base License price
   - Logo: XS=2×, S/M=4×, L=5×, XL=8× Base License
   - App: 1.5×-8× based on downloads (5K-1M)
   - Broadcast: 1.5×-8× based on budget ($50K-$2M)
   - Packaging/Merch/Publishing: 2×-8× based on units (5K-500K)

3. DISCOUNT LOGIC:
   - Style count: 2=10%, 3=15%, 4+=20%
   - License types: 2=+5%, 3+=+10%
   - Max discount caps: XS/S=30%, M/L=20%, XL=10%

4. BUNDLE OPTIMIZATION:
   - Suggest additional typefaces for style discounts
   - Recommend license combinations for type discounts
   - Calculate potential savings

5. CONTEXT MAPPING:
   - Website → Web license
   - Packaging → Desktop + Packaging licenses
   - Logo/branding → Logo license
   - App/software → App license
   - TV/video → Broadcast license
   - Merchandise → Merchandising license
   - Books/publishing → Publishing license

6. ALWAYS INCLUDE:
   - Desktop license for any commercial use
   - Appropriate usage tiers based on context
   - Bundle suggestions for cost optimization

Return only valid JSON, no other text.`;

export async function parseWithAI(input: string): Promise<AIResponse | null> {
  try {
    // Check if API key is available
    if (!process.env.HUGGINGFACE_API_KEY) {
      console.log('No Hugging Face API key found, falling back to rule-based parsing');
      return null;
    }

    // Try multiple models in order of preference
    const models = [
      'microsoft/DialoGPT-small',
      'gpt2',
      'distilgpt2'
    ];

    let lastError: any = null;
    
    for (const model of models) {
      try {
        console.log(`Trying AI model: ${model}`);
        const response = await hf.textGeneration({
          model,
          inputs: `${SYSTEM_PROMPT}\n\nUser request: ${input}\n\nJSON response:`,
          parameters: {
            max_new_tokens: 500,
            temperature: 0.1,
            do_sample: true,
            return_full_text: false
          }
        });

        // Extract JSON from response
        const jsonMatch = response.generated_text.match(/\{[\s\S]*\}/);
        if (!jsonMatch) {
          console.log(`No JSON found in AI response from ${model}:`, response.generated_text);
          continue;
        }

        const parsed = JSON.parse(jsonMatch[0]);
        
        // Validate and clean the response
        const result = validateAndCleanResponse(parsed, input);
        if (result && result.confidence > 0.3) {
          console.log(`Successfully parsed with AI model: ${model}`);
          return result;
        }
        
              } catch (error) {
          console.log(`Model ${model} failed:`, error instanceof Error ? error.message : String(error));
          lastError = error;
          continue;
        }
    }

    console.log('All AI models failed, falling back to rule-based parsing');
    return null;
    
  } catch (error) {
    console.error('AI parsing failed:', error);
    return null;
  }
}

function validateAndCleanResponse(parsed: any, originalInput: string): AIResponse {
  const cleaned: AIResponse = {
    typefaces: [],
    businessSize: 'individual',
    licenseTypes: ['desktop'],
    usage: 'non-commercial',
    suggestions: [],
    confidence: 0.5
  };

  // Validate typefaces
  if (parsed.typefaces && Array.isArray(parsed.typefaces)) {
    cleaned.typefaces = parsed.typefaces
      .filter((tf: any) => 
        tf.family && 
        YTF_TYPEFACES.includes(tf.family) &&
        tf.style &&
        typeof tf.confidence === 'number'
      )
      .map((tf: any) => ({
        family: tf.family,
        style: tf.style,
        confidence: Math.max(0, Math.min(1, tf.confidence))
      }));
  }

  // Validate business size
  if (parsed.businessSize && BUSINESS_SIZES.includes(parsed.businessSize)) {
    cleaned.businessSize = parsed.businessSize;
  }

  // Validate license types
  if (parsed.licenseTypes && Array.isArray(parsed.licenseTypes)) {
    cleaned.licenseTypes = parsed.licenseTypes
      .filter((lt: string) => LICENSE_TYPES.includes(lt));
    
    // Always include desktop for commercial use
    if (cleaned.businessSize !== 'individual' && !cleaned.licenseTypes.includes('desktop')) {
      cleaned.licenseTypes.unshift('desktop');
    }
  }

  // Validate usage
  if (parsed.usage && USAGE_TIERS.includes(parsed.usage)) {
    cleaned.usage = parsed.usage;
  }

  // Validate suggestions
  if (parsed.suggestions && Array.isArray(parsed.suggestions)) {
    cleaned.suggestions = parsed.suggestions.filter((s: string) => typeof s === 'string');
  }

  // Validate confidence
  if (typeof parsed.confidence === 'number') {
    cleaned.confidence = Math.max(0, Math.min(1, parsed.confidence));
  }

  // Add fallback suggestions if no typefaces found
  if (cleaned.typefaces.length === 0) {
    cleaned.suggestions.push('Please specify which YTF typefaces you would like to license');
  }

  // Validate pricing if provided
  if (parsed.pricing && typeof parsed.pricing === 'object') {
    cleaned.pricing = {
      basePrices: Array.isArray(parsed.pricing.basePrices) ? parsed.pricing.basePrices.filter((p: any) => typeof p === 'number') : [],
      totalBeforeDiscount: typeof parsed.pricing.totalBeforeDiscount === 'number' ? parsed.pricing.totalBeforeDiscount : 0,
      discount: typeof parsed.pricing.discount === 'number' ? parsed.pricing.discount : 0,
      totalAfterDiscount: typeof parsed.pricing.totalAfterDiscount === 'number' ? parsed.pricing.totalAfterDiscount : 0,
      discountBreakdown: typeof parsed.pricing.discountBreakdown === 'string' ? parsed.pricing.discountBreakdown : ''
    };
  }

  // Validate bundle suggestions if provided
  if (parsed.bundleSuggestions && Array.isArray(parsed.bundleSuggestions)) {
    cleaned.bundleSuggestions = parsed.bundleSuggestions
      .filter((bundle: any) => 
        bundle.type && ['style', 'license', 'typeface'].includes(bundle.type) &&
        bundle.description && typeof bundle.description === 'string' &&
        bundle.potentialSavings && typeof bundle.potentialSavings === 'number'
      )
      .map((bundle: any) => ({
        type: bundle.type,
        description: bundle.description,
        potentialSavings: bundle.potentialSavings
      }));
  }

  return cleaned;
}

// Fallback to rule-based parsing if AI fails
export function fallbackToRules(input: string) {
  // This will use the existing parseAiInput function
  // We'll import and use it here
  return null; // Placeholder - will be implemented
} 