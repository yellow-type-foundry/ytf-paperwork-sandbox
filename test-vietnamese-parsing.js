// Test Vietnamese parsing
const testInput = "Mình muốn mua bản quyền font YTF Millie Regular để sử dụng cho website và in ấn. Công ty mình có dưới 20 nhân viên.";

console.log('Testing Vietnamese Input:');
console.log(`"${testInput}"`);
console.log('');

// Test the patterns manually
const lowerInput = testInput.toLowerCase();

// Test company context detection
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

console.log('Company Context Detection:');
const hasCompanyContext = companyContextPatterns.some(pattern => {
  const match = pattern.test(lowerInput);
  if (match) {
    console.log(`  ✓ Found: ${pattern.source}`);
  }
  return match;
});
console.log(`  Has Company Context: ${hasCompanyContext}`);
console.log('');

// Test employee count patterns
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

console.log('Employee Count Detection:');
let employeeCount = null;
for (const pattern of employeePatterns) {
  const match = lowerInput.match(pattern);
  if (match) {
    const count = parseInt(match[1]);
    employeeCount = count;
    console.log(`  ✓ Found: "${match[0]}" → ${count} employees`);
    break;
  }
}
console.log(`  Employee Count: ${employeeCount}`);
console.log('');

// Test business size mapping
let businessSize = 'individual';
if (employeeCount) {
  if (employeeCount === 1) {
    businessSize = 'individual';
  } else if (employeeCount < 20) {
    businessSize = 'xs';
  } else if (employeeCount < 50) {
    businessSize = 's';
  } else if (employeeCount < 150) {
    businessSize = 'm';
  } else if (employeeCount < 250) {
    businessSize = 'l';
  } else {
    businessSize = 'xl';
  }
} else if (hasCompanyContext) {
  businessSize = 'xs';
}

console.log('Business Size Mapping:');
console.log(`  Business Size: ${businessSize}`);
console.log('');

// Test license type detection
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

console.log('License Type Detection:');
const detectedLicenseTypes = [];
for (const [licenseType, patterns] of Object.entries(licensePatterns)) {
  for (const pattern of patterns) {
    if (pattern.test(lowerInput)) {
      detectedLicenseTypes.push(licenseType);
      console.log(`  ✓ Found: ${licenseType} (${pattern.source})`);
      break;
    }
  }
}

// Ensure desktop license for commercial use
if (businessSize !== 'individual' && !detectedLicenseTypes.includes('desktop')) {
  detectedLicenseTypes.unshift('desktop');
  console.log(`  ✓ Added: desktop (commercial use)`);
}

console.log(`  License Types: ${detectedLicenseTypes.join(', ')}`);
console.log('');

// Test typeface detection
const typefacePatterns = [
  /ytf\s+([a-zàáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđ]+)/gi,
  /font\s+ytf\s+([a-zàáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđ]+)/gi,
  /bản\s+quyền\s+font\s+ytf\s+([a-zàáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđ]+)/gi
];

console.log('Typeface Detection:');
for (const pattern of typefacePatterns) {
  const matches = lowerInput.match(pattern);
  if (matches) {
    for (const match of matches) {
      const typefaceName = match.replace(/ytf\s+|font\s+|\s+font/gi, '').trim();
      console.log(`  ✓ Found: "${match}" → "${typefaceName}"`);
    }
  }
}
console.log('');

// Expected result summary
console.log('EXPECTED RESULT:');
console.log(`  Typeface: YTF Millie Regular`);
console.log(`  Business Size: ${businessSize} (${businessSize === 'xs' ? '2× base price' : 'individual'})`);
console.log(`  License Types: ${detectedLicenseTypes.join(', ')}`);
console.log(`  Usage: under-5k (commercial)`);
console.log(`  Base Price: ${businessSize === 'xs' ? '$180' : '$90'} per style`);
console.log(`  Total: ${businessSize === 'xs' ? '$360' : '$180'} (2 styles)`); 