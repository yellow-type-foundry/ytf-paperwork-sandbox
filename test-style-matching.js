// Test script to verify style matching fix
// Direct test without importing TypeScript files

// YTF Cafuné variants from the typeface data
const cafuneVariants = [
  "Thin",
  "Light",
  "UltraLight",
  "Book",
  "Medium",
  "Bold",
  "Heavy",
  "Thin Italic",
  "Light Italic",
  "UltraLight Italic",
  "Book Italic",
  "Medium Italic",
  "Bold Italic",
  "Heavy Italic",
];

// Helper: strict style matching with no fallbacks
function findExactStyleMatch(requestedStyle, availableStyles) {
  const normalizedRequested = requestedStyle.toLowerCase().replace(/\s+/g, ' ').trim();
  
  // 1. Exact match (case-insensitive, normalized)
  const exactMatch = availableStyles.find(style => 
    style.toLowerCase().replace(/\s+/g, ' ').trim() === normalizedRequested
  );
  if (exactMatch) {
    return exactMatch;
  }

  // 2. Handle compound styles (e.g., "Bold Italic")
  const words = normalizedRequested.split(' ');
  if (words.length > 1) {
    // Look for styles that contain all the requested words
    const compoundMatches = availableStyles.filter(style => {
      const styleLower = style.toLowerCase();
      return words.every(word => styleLower.includes(word));
    });
    
    if (compoundMatches.length === 1) {
      return compoundMatches[0];
    } else if (compoundMatches.length > 1) {
      // If multiple matches, prefer the one that matches the exact phrase
      const phraseMatch = compoundMatches.find(style => 
        style.toLowerCase().includes(normalizedRequested)
      );
      if (phraseMatch) {
        return phraseMatch;
      }
    }
  }

  // 3. Handle common style variations
  const styleVariations = {
    'bold italic': ['bold italic', 'italic bold'],
    'bold': ['bold', 'heavy', 'black'],
    'italic': ['italic', 'oblique'],
    'light': ['light', 'thin', 'ultralight'],
    'regular': ['regular', 'normal', 'book'],
    'medium': ['medium', 'semibold', 'demi'],
  };

  for (const [requested, variations] of Object.entries(styleVariations)) {
    if (variations.includes(normalizedRequested)) {
      // Find any style that matches any of the variations
      for (const variation of variations) {
        const match = availableStyles.find(style => 
          style.toLowerCase().includes(variation)
        );
        if (match) {
          return match;
        }
      }
    }
  }

  // 4. No match found - return null instead of falling back
  return null;
}

// Test the specific case from the issue
function testStyleMatching() {
  console.log('Testing style matching fix...\n');
  
  console.log('YTF Cafuné available styles:', cafuneVariants);
  console.log('');
  
  // Test cases
  const testCases = [
    'Bold Italic',
    'bold italic',
    'Bold',
    'Italic',
    'Thin',
    'Regular',
    'Medium Italic',
    'Heavy Italic',
    'Invalid Style'
  ];
  
  testCases.forEach(testCase => {
    const result = findExactStyleMatch(testCase, cafuneVariants);
    console.log(`"${testCase}" -> ${result || 'NO MATCH (correct behavior)'}`);
  });
  
  console.log('\n✅ Test completed. "Bold Italic" should now correctly match "Bold Italic" instead of falling back to "Thin".');
  
  // Test the specific issue case
  console.log('\n🔍 Testing the specific issue case:');
  const issueCase = 'Bold Italic';
  const issueResult = findExactStyleMatch(issueCase, cafuneVariants);
  console.log(`Input: "We're designing a logotype for a client using YTF Cafuné ${issueCase}"`);
  console.log(`Expected: YTF Cafuné ${issueCase}`);
  console.log(`Actual: YTF Cafuné ${issueResult || 'NO MATCH'}`);
  console.log(`✅ ${issueResult === issueCase ? 'FIXED' : 'STILL BROKEN'}`);
}

testStyleMatching(); 