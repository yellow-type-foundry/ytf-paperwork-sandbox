import axios from 'axios';

export async function callVietnameseLlama(prompt: string): Promise<string> {
  // LM Studio/Ollama-compatible endpoint
  const response = await axios.post('http://localhost:11434/api/generate', {
    model: 'vietnamese-llama',
    prompt,
    stream: false
  });
  // LM Studio returns { response: "..." }
  return response.data.response;
} 