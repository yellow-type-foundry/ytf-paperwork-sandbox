import { callVietnameseLlama } from './vietnamese-llm';

export interface VietnameseQuotationInfo {
  typefaces: string[];
  licenseTypes: string[];
  businessSize: string | number;
  usage: string;
}

export async function extractVietnameseQuotationInfo(input: string): Promise<VietnameseQuotationInfo> {
  const prompt = `Hãy đọc nội dung sau và trích xuất các thông tin dưới dạng JSON gồm:

1. "tên typeface": mảng các tên font (ví dụ: ["YTF Gióng", "YTF Xanh"])
2. "loại license cần thiết": mảng các loại license (ví dụ: ["desktop", "web", "logo"])
3. "quy mô doanh nghiệp": số lượng nhân viên (ví dụ: 35)
4. "mục đích sử dụng": mô tả cách sử dụng (ví dụ: "logo và website")

Lưu ý:
- Nếu có nhiều font, trả về mảng
- Nếu có web hoặc logo, luôn bao gồm desktop
- Nếu có nhân viên, trả về số cụ thể

Nội dung: "${input}"

Chỉ trả về JSON, không giải thích thêm.`;

  const raw = await callVietnameseLlama(prompt);
  
  // Try to extract JSON from the model's output
  const match = raw.match(/\{[\s\S]*\}/);
  if (!match) throw new Error('No JSON found in model output');
  const parsed = JSON.parse(match[0]);

  // Normalize output
  const typefaces = Array.isArray(parsed["tên typeface"]) ? parsed["tên typeface"] : [parsed["tên typeface"]].filter(Boolean);
  let licenseTypes = Array.isArray(parsed["loại license cần thiết"]) ? parsed["loại license cần thiết"] : [parsed["loại license cần thiết"]].filter(Boolean);
  
  // Auto-add desktop license if web, logo, or other commercial licenses are present
  if (licenseTypes.some(lt => ['web', 'logo', 'app', 'packaging', 'broadcast', 'merchandising', 'publishing'].includes(lt.toLowerCase())) && 
      !licenseTypes.includes('desktop')) {
    licenseTypes.unshift('desktop');
  }

  return {
    typefaces,
    licenseTypes,
    businessSize: parsed["quy mô doanh nghiệp"],
    usage: parsed["mục đích sử dụng"] || '',
  };
} 