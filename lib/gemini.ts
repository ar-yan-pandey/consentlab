import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GEMINI_API_KEY!);

export const geminiModel = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });

export async function extractTextFromImage(imageData: string): Promise<string> {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });
    
    const prompt = "Extract all text from this medical consent form image. Provide the complete text content.";
    
    const result = await model.generateContent([
      prompt,
      {
        inlineData: {
          data: imageData.split(',')[1],
          mimeType: 'image/jpeg'
        }
      }
    ]);
    
    return result.response.text();
  } catch (error) {
    console.error('Error extracting text:', error);
    throw error;
  }
}

export async function summarizeConsent(consentText: string): Promise<{
  summary: string;
  riskLevel: 'low' | 'medium' | 'high';
  riskFactors: string[];
}> {
  try {
    const prompt = `Analyze this medical consent form and provide:
1. A simplified summary in plain language (3-5 sentences)
2. Risk level (low/medium/high)
3. Key risk factors (list 3-5 main risks)

Consent Form:
${consentText}

Respond in JSON format:
{
  "summary": "...",
  "riskLevel": "low|medium|high",
  "riskFactors": ["risk1", "risk2", ...]
}`;

    const result = await geminiModel.generateContent(prompt);
    const responseText = result.response.text();
    
    // Extract JSON from response
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    
    throw new Error('Failed to parse AI response');
  } catch (error) {
    console.error('Error summarizing consent:', error);
    throw error;
  }
}

export async function translateText(text: string, targetLanguage: string): Promise<string> {
  try {
    const prompt = `Translate the following medical consent text to ${targetLanguage}. Maintain medical accuracy and clarity:

${text}`;

    const result = await geminiModel.generateContent(prompt);
    return result.response.text();
  } catch (error) {
    console.error('Error translating text:', error);
    throw error;
  }
}

export async function answerConsentQuestion(
  question: string,
  consentContext: string,
  language: string = 'English'
): Promise<string> {
  try {
    const prompt = `You are a friendly medical assistant helping patients understand their consent forms. Answer in ${language}.

IMPORTANT RULES:
- Keep answers SHORT (2-3 sentences maximum)
- Use SIMPLE, everyday language
- Be warm and conversational like talking to a friend
- Avoid medical jargon
- If you don't know, say "I'm not sure about that specific detail"

Consent Form:
${consentContext}

Patient asks: ${question}

Give a brief, simple, friendly answer:`;

    const result = await geminiModel.generateContent(prompt);
    return result.response.text();
  } catch (error) {
    console.error('Error answering question:', error);
    throw error;
  }
}
