# Bilingual NLP Implementation for YTF Paperwork

## Overview

This implementation provides comprehensive bilingual natural language processing (NLP) support for understanding quotation requests in both Vietnamese and English, with support for code-mixed input common in Vietnam.

## Key Features

### 1. Intent Detection & Slot Filling
- **Language Detection**: Automatically detects Vietnamese, English, or mixed language input
- **Intent Recognition**: Identifies purchase, inquiry, or clarification intents
- **Slot Extraction**: Extracts typeface names, styles, business sizes, license types, and usage information

### 2. Language-Agnostic Mapping
- **Vietnamese to English**: Maps Vietnamese expressions to standard schema
  - "trên website" → "web"
  - "logo" → "logo"
  - "20 người" → XS Business
- **English to Standard**: Normalizes English expressions
  - "website" → "web"
  - "branding" → "logo"
  - "team of 20" → XS Business

### 3. Clarification Loop
- **Missing Field Detection**: Identifies required information not provided
- **Language-Matched Questions**: Generates clarification questions in the detected language
- **Progressive Refinement**: Builds complete quotation requests through conversation

### 4. Code-Mixed Support
- **Mixed Language Handling**: Supports natural code-switching between Vietnamese and English
- **Examples**:
  - "Muốn mua Gióng để xài cho app, under 5k users"
  - "Team 20 người cần font YTF Xanh for website"

## Implementation Details

### Core Files

1. **`utils/bilingual-nlp-service.ts`**
   - Main bilingual NLP service
   - Language detection patterns
   - Vietnamese and English mappings
   - Fallback rule-based parsing

2. **`utils/ai-service.ts`**
   - Enhanced with bilingual support
   - Integration with Hugging Face models
   - Fallback mechanisms

3. **`app/quotation/page.tsx`**
   - Updated to use bilingual AI parsing
   - Enhanced AI input processing

### Language Detection Patterns

#### Vietnamese Patterns
```typescript
const VIETNAMESE_PATTERNS = [
  /\b(mình|tôi|chúng tôi|công ty|doanh nghiệp)\b/i,
  /\b(muốn|cần|đang tìm|tìm kiếm|mua|sử dụng)\b/i,
  /\b(font|phông|chữ|typeface)\b/i,
  /\b(cho|để|trên|trong|với)\b/i,
  /\b(website|trang web|web|ứng dụng|app|logo|nhãn hiệu)\b/i,
  /\b(người|nhân viên|team|nhóm|công ty)\b/i,
  /\b(giá|chi phí|phí|tiền)\b/i
];
```

#### English Patterns
```typescript
const ENGLISH_PATTERNS = [
  /\b(i|we|our|company|business|team)\b/i,
  /\b(want|need|looking|searching|buy|use|license)\b/i,
  /\b(font|typeface|fontface)\b/i,
  /\b(for|on|in|with|to)\b/i,
  /\b(website|web|app|application|logo|branding)\b/i,
  /\b(people|employees|staff|team|company)\b/i,
  /\b(price|cost|fee|amount)\b/i
];
```

### Vietnamese to English Mappings

#### Typeface Families
```typescript
const VIETNAMESE_MAPPINGS = {
  'gióng': 'YTF Gióng',
  'xanh': 'YTF Xanh',
  'oldman': 'YTF Oldman',
  'eon': 'YTF Eon A',
  'cafuné': 'YTF Cafuné',
  'millie': 'YTF Millie',
  // ...
};
```

#### License Types
```typescript
'website': 'web',
'trang web': 'web',
'ứng dụng': 'app',
'logo': 'logo',
'nhãn hiệu': 'logo',
'bao bì': 'packaging',
'truyền hình': 'broadcast',
'quần áo': 'merchandising',
'sách': 'publishing',
```

#### Business Sizes
```typescript
'cá nhân': 'individual',
'nhỏ': 'xs',
'trung bình': 'm',
'lớn': 'l',
'rất lớn': 'xl',
```

### Usage Examples

#### Vietnamese Input
```
"Mình muốn mua font YTF Gióng cho website và dùng cả trên mạng xã hội."
```
**Parsed Result**:
- Language: Vietnamese
- Typeface: YTF Gióng
- License Types: Web, Social Media
- Business Size: Individual (default)
- Usage: Non-commercial

#### English Input
```
"Our team of 18 wants to use Xanh Thin for a packaging project."
```
**Parsed Result**:
- Language: English
- Typeface: YTF Xanh Thin
- License Types: Desktop, Packaging
- Business Size: XS (18 employees)
- Usage: Under-5k

#### Mixed Language Input
```
"Muốn mua Gióng để xài cho app, under 5k users."
```
**Parsed Result**:
- Language: Mixed
- Typeface: YTF Gióng
- License Types: Desktop, App
- Business Size: Individual (default)
- Usage: Under-5k

### Clarification Examples

#### Missing Typeface
**Vietnamese**: "Bạn muốn sử dụng font nào của YTF?"
**English**: "Which YTF typeface would you like to use?"

#### Missing Business Size
**Vietnamese**: "Công ty của bạn có bao nhiêu nhân viên?"
**English**: "How many employees does your company have?"

#### Missing License Type
**Vietnamese**: "Bạn sẽ sử dụng font cho mục đích gì? (website, app, logo, etc.)"
**English**: "What will you use the font for? (website, app, logo, etc.)"

## Error Tolerance

### Spelling Errors
- "ytf giong reg" → "YTF Gióng Regular"
- "xanh thin" → "YTF Xanh Thin"

### Abbreviations
- "reg" → "Regular"
- "bold" → "Bold"
- "italic" → "Italic"

### Number Formats
- "5k" → 5000
- "5000" → 5000
- "năm ngàn" → 5000

## Integration with AI Models

The system uses multiple AI models in order of preference:
1. `microsoft/DialoGPT-small`
2. `gpt2`
3. `distilgpt2`

If AI models fail, it falls back to rule-based parsing with comprehensive pattern matching.

## Benefits

1. **Natural Language Understanding**: Users can express requests in their preferred language
2. **Code-Mixed Support**: Handles natural language mixing common in Vietnam
3. **Progressive Refinement**: Builds complete quotations through conversation
4. **Error Tolerance**: Handles spelling errors, abbreviations, and various number formats
5. **Fallback Mechanisms**: Ensures reliability even when AI services are unavailable

## Future Enhancements

1. **More Language Support**: Extend to other languages as needed
2. **Context Awareness**: Remember previous interactions in conversation
3. **Advanced Intent Recognition**: Distinguish between different types of inquiries
4. **Custom Training**: Train models on YTF-specific terminology and patterns
5. **Voice Input**: Add speech-to-text support for voice interactions

## Testing

The bilingual NLP service can be tested through the web interface at `/quotation` by:
1. Switching to AI mode
2. Entering Vietnamese, English, or mixed language requests
3. Observing the parsed results and clarification questions
4. Verifying that the form is populated correctly with extracted information 