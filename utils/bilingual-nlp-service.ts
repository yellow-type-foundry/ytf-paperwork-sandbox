import { HfInference } from '@huggingface/inference';

// Initialize Hugging Face client
const hf = new HfInference(process.env.HUGGINGFACE_API_KEY);

// Available YTF typefaces for validation
const YTF_TYPEFACES = [
  'YTF Gióng', 'YTF Xanh', 'YTF Oldman', 'YTF Eon A', 'YTF Eon B', 'YTF Eon C',
  'YTF Xanh Mono', 'YTF Cafuné Sans', 'YTF Cafuné', 'YTF Millie', 'YTF Millie Mono'
];

// Business size tiers
const BUSINESS_SIZES = ['individual', 'xs', 's', 'm', 'l', 'xl'];

// License types
const LICENSE_TYPES = ['desktop', 'web', 'logo', 'packaging', 'app', 'broadcast', 'merchandising', 'publishing'];

// Usage tiers
const USAGE_TIERS = ['non-commercial', 'under-5k', 'under-50k', 'under-500k'];

export interface BilingualIntent {
  detectedLanguage: 'vi' | 'en' | 'mixed';
  confidence: number;
  intent: 'purchase' | 'inquiry' | 'clarification';
  slots: {
    typefaces: Array<{
      family: string;
      style: string;
      confidence: number;
      originalText: string;
    }>;
    businessSize: {
      value: string;
      confidence: number;
      originalText: string;
    };
    licenseTypes: Array<{
      value: string;
      confidence: number;
      originalText: string;
    }>;
    usage: {
      value: string;
      confidence: number;
      originalText: string;
    };
    employeeCount?: {
      value: number;
      confidence: number;
      originalText: string;
    };
  };
  missingFields: string[];
  suggestions: string[];
  clarificationQuestions: string[];
}

// Language detection patterns
const VIETNAMESE_PATTERNS = [
  /\b(mình|tôi|chúng tôi|công ty|doanh nghiệp)\b/i,
  /\b(muốn|cần|đang tìm|tìm kiếm|mua|sử dụng)\b/i,
  /\b(font|phông|chữ|typeface)\b/i,
  /\b(cho|để|trên|trong|với)\b/i,
  /\b(website|trang web|web|ứng dụng|app|logo|nhãn hiệu)\b/i,
  /\b(người|nhân viên|team|nhóm|công ty)\b/i,
  /\b(giá|chi phí|phí|tiền)\b/i
];

const ENGLISH_PATTERNS = [
  /\b(i|we|our|company|business|team)\b/i,
  /\b(want|need|looking|searching|buy|use|license)\b/i,
  /\b(font|typeface|fontface)\b/i,
  /\b(for|on|in|with|to)\b/i,
  /\b(website|web|app|application|logo|branding)\b/i,
  /\b(people|employees|staff|team|company)\b/i,
  /\b(price|cost|fee|amount)\b/i
];

// Vietnamese to English mappings
const VIETNAMESE_MAPPINGS = {
  // Typeface families
  'gióng': 'YTF Gióng',
  'xanh': 'YTF Xanh',
  'oldman': 'YTF Oldman',
  'eon': 'YTF Eon A',
  'cafuné': 'YTF Cafuné',
  'millie': 'YTF Millie',
  
  // Styles
  'thường': 'Regular',
  'đậm': 'Bold',
  'mỏng': 'Thin',
  'nghiêng': 'Italic',
  'roman': 'Roman',
  
  // License types
  'website': 'web',
  'trang web': 'web',
  'web': 'web',
  'ứng dụng': 'app',
  'app': 'app',
  'logo': 'logo',
  'nhãn hiệu': 'logo',
  'bao bì': 'packaging',
  'packaging': 'packaging',
  'truyền hình': 'broadcast',
  'video': 'broadcast',
  'broadcast': 'broadcast',
  'quần áo': 'merchandising',
  'áo thun': 'merchandising',
  'merchandise': 'merchandising',
  'sách': 'publishing',
  'xuất bản': 'publishing',
  'publishing': 'publishing',
  
  // Business sizes
  'cá nhân': 'individual',
  'nhỏ': 'xs',
  'trung bình': 'm',
  'lớn': 'l',
  'rất lớn': 'xl',
  
  // Usage
  'dưới 5k': 'under-5k',
  'dưới 50k': 'under-50k',
  'dưới 500k': 'under-500k',
  'không thương mại': 'non-commercial'
};

// English to standard mappings
const ENGLISH_MAPPINGS = {
  // License types
  'website': 'web',
  'web': 'web',
  'application': 'app',
  'app': 'app',
  'logo': 'logo',
  'branding': 'logo',
  'wordmark': 'logo',
  'packaging': 'packaging',
  'labels': 'packaging',
  'television': 'broadcast',
  'tv': 'broadcast',
  'video': 'broadcast',
  'broadcast': 'broadcast',
  'clothing': 'merchandising',
  'tshirts': 'merchandising',
  'merchandise': 'merchandising',
  'books': 'publishing',
  'publishing': 'publishing',
  
  // Business sizes
  'individual': 'individual',
  'personal': 'individual',
  'small': 'xs',
  'medium': 'm',
  'large': 'l',
  'extra large': 'xl',
  
  // Usage
  'under 5k': 'under-5k',
  'under 50k': 'under-50k',
  'under 500k': 'under-500k',
  'non commercial': 'non-commercial',
  'non-commercial': 'non-commercial'
};

// System prompt for bilingual understanding
const BILINGUAL_SYSTEM_PROMPT = `You are a bilingual typeface licensing expert for Yellow Type Foundry. Parse user requests in Vietnamese, English, or mixed language and return a JSON object with the following structure:

{
  "detectedLanguage": "vi|en|mixed",
  "confidence": 0.95,
  "intent": "purchase|inquiry|clarification",
  "slots": {
    "typefaces": [
      {
        "family": "YTF Gióng",
        "style": "Regular",
        "confidence": 0.95,
        "originalText": "Gióng thường"
      }
    ],
    "businessSize": {
      "value": "s",
      "confidence": 0.9,
      "originalText": "20 người"
    },
    "licenseTypes": [
      {
        "value": "web",
        "confidence": 0.95,
        "originalText": "website"
      }
    ],
    "usage": {
      "value": "under-5k",
      "confidence": 0.8,
      "originalText": "dưới 5k"
    },
    "employeeCount": {
      "value": 20,
      "confidence": 0.9,
      "originalText": "20 người"
    }
  },
  "missingFields": ["typeface", "businessSize"],
  "suggestions": ["Consider adding Logo license for brand identity"],
  "clarificationQuestions": ["Which specific YTF typeface do you need?"]
}

UNDERSTANDING RULES:

1. LANGUAGE DETECTION:
   - Vietnamese: Contains Vietnamese words, particles, or context
   - English: Contains English words and structure
   - Mixed: Contains both languages (common in Vietnam)

2. INTENT DETECTION:
   - purchase: User wants to buy/license fonts
   - inquiry: User is asking about pricing/options
   - clarification: User is responding to questions

3. SLOT FILLING:
   - Extract typeface names (YTF Gióng, YTF Xanh, etc.)
   - Extract styles (Regular, Bold, Italic, etc.)
   - Extract business size from employee count
   - Extract license types from usage context
   - Extract usage tiers from quantity mentions

4. VIETNAMESE PATTERNS:
   - "muốn mua" = want to buy
   - "cho website" = for website
   - "20 người" = 20 people
   - "dưới 5k" = under 5k
   - "font Gióng" = Gióng font

5. ENGLISH PATTERNS:
   - "want to use" = purchase intent
   - "for website" = web license
   - "team of 20" = 20 employees
   - "under 5k" = under-5k usage

6. MIXED LANGUAGE:
   - "Muốn mua Gióng for website" = mixed language
   - "Team 20 người" = mixed language
   - Handle code-switching naturally

7. TOLERANCE:
   - Spelling errors: "ytf giong" → "YTF Gióng"
   - Abbreviations: "reg" → "Regular"
   - Number formats: "5k", "5000", "năm ngàn" → 5000

Return only valid JSON, no other text.`;

export async function parseBilingualRequest(input: string): Promise<BilingualIntent | null> {
  try {
    // Check if API key is available
    if (!process.env.HUGGINGFACE_API_KEY) {
      console.log('No Hugging Face API key found, falling back to rule-based parsing');
      return fallbackBilingualParsing(input);
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
        console.log(`Trying bilingual AI model: ${model}`);
        const response = await hf.textGeneration({
          model,
          inputs: `${BILINGUAL_SYSTEM_PROMPT}\n\nUser request: ${input}\n\nJSON response:`,
          parameters: {
            max_new_tokens: 800,
            temperature: 0.1,
            do_sample: true,
            return_full_text: false
          }
        });

        // Extract JSON from response
        const jsonMatch = response.generated_text.match(/\{[\s\S]*\}/);
        if (!jsonMatch) {
          console.log(`No JSON found in bilingual AI response from ${model}:`, response.generated_text);
          continue;
        }

        const parsed = JSON.parse(jsonMatch[0]);
        
        // Validate and clean the response
        const result = validateAndCleanBilingualResponse(parsed, input);
        if (result && result.confidence > 0.3) {
          console.log(`Successfully parsed bilingual request with AI model: ${model}`);
          return result;
        }
        
      } catch (error) {
        console.log(`Bilingual model ${model} failed:`, error instanceof Error ? error.message : String(error));
        lastError = error;
        continue;
      }
    }

    console.log('All bilingual AI models failed, falling back to rule-based parsing');
    return fallbackBilingualParsing(input);
    
  } catch (error) {
    console.error('Bilingual parsing failed:', error);
    return fallbackBilingualParsing(input);
  }
}

function validateAndCleanBilingualResponse(parsed: any, originalInput: string): BilingualIntent {
  const cleaned: BilingualIntent = {
    detectedLanguage: 'en',
    confidence: 0.5,
    intent: 'purchase',
    slots: {
      typefaces: [],
      businessSize: {
        value: 'individual',
        confidence: 0.5,
        originalText: ''
      },
      licenseTypes: [],
      usage: {
        value: 'non-commercial',
        confidence: 0.5,
        originalText: ''
      }
    },
    missingFields: [],
    suggestions: [],
    clarificationQuestions: []
  };

  // Detect language
  if (parsed.detectedLanguage && ['vi', 'en', 'mixed'].includes(parsed.detectedLanguage)) {
    cleaned.detectedLanguage = parsed.detectedLanguage;
  } else {
    cleaned.detectedLanguage = detectLanguage(originalInput);
  }

  // Set confidence
  if (typeof parsed.confidence === 'number') {
    cleaned.confidence = Math.max(0, Math.min(1, parsed.confidence));
  }

  // Set intent
  if (parsed.intent && ['purchase', 'inquiry', 'clarification'].includes(parsed.intent)) {
    cleaned.intent = parsed.intent;
  }

  // Validate typefaces
  if (parsed.slots?.typefaces && Array.isArray(parsed.slots.typefaces)) {
    cleaned.slots.typefaces = parsed.slots.typefaces
      .filter((tf: any) => 
        tf.family && 
        YTF_TYPEFACES.includes(tf.family) &&
        tf.style &&
        typeof tf.confidence === 'number'
      )
      .map((tf: any) => ({
        family: tf.family,
        style: tf.style,
        confidence: Math.max(0, Math.min(1, tf.confidence)),
        originalText: tf.originalText || `${tf.family} ${tf.style}`
      }));
  }

  // Validate business size
  if (parsed.slots?.businessSize) {
    const bs = parsed.slots.businessSize;
    if (bs.value && BUSINESS_SIZES.includes(bs.value)) {
      cleaned.slots.businessSize = {
        value: bs.value,
        confidence: Math.max(0, Math.min(1, bs.confidence || 0.5)),
        originalText: bs.originalText || bs.value
      };
    }
  }

  // Validate license types
  if (parsed.slots?.licenseTypes && Array.isArray(parsed.slots.licenseTypes)) {
    cleaned.slots.licenseTypes = parsed.slots.licenseTypes
      .filter((lt: any) => 
        lt.value && 
        LICENSE_TYPES.includes(lt.value) &&
        typeof lt.confidence === 'number'
      )
      .map((lt: any) => ({
        value: lt.value,
        confidence: Math.max(0, Math.min(1, lt.confidence)),
        originalText: lt.originalText || lt.value
      }));
  }

  // Validate usage
  if (parsed.slots?.usage) {
    const usage = parsed.slots.usage;
    if (usage.value && USAGE_TIERS.includes(usage.value)) {
      cleaned.slots.usage = {
        value: usage.value,
        confidence: Math.max(0, Math.min(1, usage.confidence || 0.5)),
        originalText: usage.originalText || usage.value
      };
    }
  }

  // Validate employee count
  if (parsed.slots?.employeeCount) {
    const ec = parsed.slots.employeeCount;
    if (typeof ec.value === 'number' && ec.value > 0) {
      cleaned.slots.employeeCount = {
        value: ec.value,
        confidence: Math.max(0, Math.min(1, ec.confidence || 0.5)),
        originalText: ec.originalText || ec.value.toString()
      };
    }
  }

  // Set missing fields
  if (parsed.missingFields && Array.isArray(parsed.missingFields)) {
    cleaned.missingFields = parsed.missingFields;
  }

  // Set suggestions
  if (parsed.suggestions && Array.isArray(parsed.suggestions)) {
    cleaned.suggestions = parsed.suggestions;
  }

  // Set clarification questions
  if (parsed.clarificationQuestions && Array.isArray(parsed.clarificationQuestions)) {
    cleaned.clarificationQuestions = parsed.clarificationQuestions;
  }

  return cleaned;
}

function detectLanguage(input: string): 'vi' | 'en' | 'mixed' {
  const lowerInput = input.toLowerCase();
  
  const vietnameseMatches = VIETNAMESE_PATTERNS.reduce((count, pattern) => 
    count + (pattern.test(lowerInput) ? 1 : 0), 0
  );
  
  const englishMatches = ENGLISH_PATTERNS.reduce((count, pattern) => 
    count + (pattern.test(lowerInput) ? 1 : 0), 0
  );
  
  if (vietnameseMatches > 0 && englishMatches > 0) {
    return 'mixed';
  } else if (vietnameseMatches > englishMatches) {
    return 'vi';
  } else {
    return 'en';
  }
}

function fallbackBilingualParsing(input: string): BilingualIntent {
  const lowerInput = input.toLowerCase();
  const detectedLanguage = detectLanguage(input);
  
  const result: BilingualIntent = {
    detectedLanguage,
    confidence: 0.6,
    intent: 'purchase',
    slots: {
      typefaces: [],
      businessSize: {
        value: 'individual',
        confidence: 0.5,
        originalText: ''
      },
      licenseTypes: [],
      usage: {
        value: 'non-commercial',
        confidence: 0.5,
        originalText: ''
      }
    },
    missingFields: [],
    suggestions: [],
    clarificationQuestions: []
  };

  // Detect company context first
  const companyContextPatterns = [
    /công\s*ty/gi,
    /doanh\s*nghiệp/gi,
    /company/gi,
    /business/gi,
    /enterprise/gi,
    /organization/gi,
    /team/gi,
    /nhân\s*viên/gi,
    /employees/gi,
    /staff/gi
  ];

  const hasCompanyContext = companyContextPatterns.some(pattern => pattern.test(lowerInput));

  // Extract typefaces
  const typefacePatterns = [
    /ytf\s+([a-zàáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđ]+)/gi,
    /font\s+ytf\s+([a-zàáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđ]+)/gi,
    /bản\s+quyền\s+font\s+ytf\s+([a-zàáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđ]+)/gi
  ];

  for (const pattern of typefacePatterns) {
    const matches = lowerInput.match(pattern);
    if (matches) {
      for (const match of matches) {
        const typefaceName = match.replace(/ytf\s+|font\s+|\s+font/gi, '').trim();
        const mappedName = mapVietnameseToEnglish(typefaceName);
        
        if (YTF_TYPEFACES.includes(mappedName)) {
          result.slots.typefaces.push({
            family: mappedName,
            style: 'Regular',
            confidence: 0.8,
            originalText: match
          });
        }
      }
    }
  }

  // Extract employee count and business size
  const employeePatterns = [
    /dưới\s*(\d+)\s*nhân\s*viên/gi,
    /ít\s*hơn\s*(\d+)\s*người/gi,
    /under\s*(\d+)\s*employees/gi,
    /less\s*than\s*(\d+)\s*people/gi,
    /(\d+)\s*nhân\s*viên\s*trở\s*xuống/gi,
    /(\d+)\s*employees\s*or\s*less/gi,
    /(\d+)\s*(người|people|employees|staff|team)/gi,
    /team\s+of\s+(\d+)/gi,
    /(\d+)\s*nhân\s*viên/gi
  ];

  for (const pattern of employeePatterns) {
    const match = lowerInput.match(pattern);
    if (match) {
      const count = parseInt(match[1]);
      result.slots.employeeCount = {
        value: count,
        confidence: 0.9,
        originalText: match[0]
      };
      
      // Map to business size
      if (count === 1) {
        result.slots.businessSize.value = 'individual';
      } else if (count < 20) {
        result.slots.businessSize.value = 'xs';
      } else if (count < 50) {
        result.slots.businessSize.value = 's';
      } else if (count < 150) {
        result.slots.businessSize.value = 'm';
      } else if (count < 250) {
        result.slots.businessSize.value = 'l';
      } else {
        result.slots.businessSize.value = 'xl';
      }
      break;
    }
  }

  // If company context is detected but no employee count, default to XS business size
  if (hasCompanyContext && !result.slots.employeeCount) {
    result.slots.businessSize.value = 'xs';
    result.slots.businessSize.confidence = 0.7;
    result.slots.businessSize.originalText = 'company context detected';
  }

  // Extract license types
  const licensePatterns = {
    desktop: [/desktop|in\s*ấn|printing|print/gi],
    web: [/website|web|trang\s*web/gi],
    app: [/app|application|ứng\s*dụng/gi],
    logo: [/logo|branding|nhãn\s*hiệu/gi],
    packaging: [/packaging|bao\s*bì/gi],
    broadcast: [/broadcast|tv|video|truyền\s*hình/gi],
    merchandising: [/merchandise|clothing|áo|quần/gi],
    publishing: [/publishing|books|sách/gi]
  };

  for (const [licenseType, patterns] of Object.entries(licensePatterns)) {
    for (const pattern of patterns) {
      if (pattern.test(lowerInput)) {
        result.slots.licenseTypes.push({
          value: licenseType,
          confidence: 0.8,
          originalText: lowerInput.match(pattern)?.[0] || licenseType
        });
        break;
      }
    }
  }

  // Extract usage
  const usagePatterns = {
    'under-5k': [/dưới\s*5k|under\s*5k|dưới\s*5000|under\s*5000/gi],
    'under-50k': [/dưới\s*50k|under\s*50k|dưới\s*50000|under\s*50000/gi],
    'under-500k': [/dưới\s*500k|under\s*500k|dưới\s*500000|under\s*500000/gi],
    'non-commercial': [/không\s+thương\s+mại|non\s+commercial|personal\s+use|personal/gi]
  };

  for (const [usage, patterns] of Object.entries(usagePatterns)) {
    for (const pattern of patterns) {
      if (pattern.test(lowerInput)) {
        result.slots.usage.value = usage;
        result.slots.usage.originalText = lowerInput.match(pattern)?.[0] || usage;
        break;
      }
    }
  }

  // If company context is detected and no specific usage mentioned, default to commercial usage
  if (hasCompanyContext && result.slots.usage.value === 'non-commercial') {
    result.slots.usage.value = 'under-5k';
    result.slots.usage.confidence = 0.8;
    result.slots.usage.originalText = 'commercial use (company context)';
  }

  // Determine missing fields
  if (result.slots.typefaces.length === 0) {
    result.missingFields.push('typeface');
  }
  
  // Only ask for business size if no company context or employee count detected
  if (result.slots.businessSize.value === 'individual' && !result.slots.employeeCount && !hasCompanyContext) {
    result.missingFields.push('businessSize');
  }
  
  if (result.slots.licenseTypes.length === 0) {
    result.missingFields.push('licenseType');
  }

  // Generate clarification questions
  if (result.missingFields.includes('typeface')) {
    result.clarificationQuestions.push(
      detectedLanguage === 'vi' 
        ? 'Bạn muốn sử dụng font nào của YTF?' 
        : 'Which YTF typeface would you like to use?'
    );
  }

  if (result.missingFields.includes('businessSize')) {
    result.clarificationQuestions.push(
      detectedLanguage === 'vi'
        ? 'Công ty của bạn có bao nhiêu nhân viên?'
        : 'How many employees does your company have?'
    );
  }

  if (result.missingFields.includes('licenseType')) {
    result.clarificationQuestions.push(
      detectedLanguage === 'vi'
        ? 'Bạn sẽ sử dụng font cho mục đích gì? (website, app, logo, etc.)'
        : 'What will you use the font for? (website, app, logo, etc.)'
    );
  }

  return result;
}

function mapVietnameseToEnglish(text: string): string {
  const lowerText = text.toLowerCase();
  
  // Direct mappings
  for (const [vietnamese, english] of Object.entries(VIETNAMESE_MAPPINGS)) {
    if (lowerText.includes(vietnamese)) {
      return english;
    }
  }
  
  // Handle common variations
  if (lowerText.includes('gióng')) return 'YTF Gióng';
  if (lowerText.includes('xanh')) return 'YTF Xanh';
  if (lowerText.includes('oldman')) return 'YTF Oldman';
  if (lowerText.includes('eon')) return 'YTF Eon A';
  if (lowerText.includes('cafuné') || lowerText.includes('cafune')) return 'YTF Cafuné';
  if (lowerText.includes('millie')) return 'YTF Millie';
  
  return text;
}

export function generateClarificationResponse(intent: BilingualIntent): string {
  const { detectedLanguage, clarificationQuestions, missingFields } = intent;
  
  if (clarificationQuestions.length === 0) {
    return detectedLanguage === 'vi' 
      ? 'Cảm ơn! Tôi đã hiểu yêu cầu của bạn.'
      : 'Thank you! I understand your request.';
  }
  
  const questions = clarificationQuestions.join('\n• ');
  
  if (detectedLanguage === 'vi') {
    return `Để tôi có thể giúp bạn tốt hơn, vui lòng cung cấp thêm thông tin:\n\n• ${questions}`;
  } else if (detectedLanguage === 'mixed') {
    return `To help you better, please provide more information:\n\n• ${questions}`;
  } else {
    return `To help you better, please provide more information:\n\n• ${questions}`;
  }
} 