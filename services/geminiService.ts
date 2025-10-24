import { GoogleGenAI, Modality } from '@google/genai';
import { IMAGE_GENERATION_MODEL, IMAGE_EDIT_MODEL, SYSTEM_INSTRUCTION, DEFAULT_TEXT_MODEL } from '../constants';
import { MessagePart, ChatMessage, User } from '../types';

let ai: GoogleGenAI;

const getAiInstance = () => {
  if (!ai) {
    if (!process.env.API_KEY) {
        alert("HATA: API anahtarı ayarlanmamış. Lütfen ortam değişkenlerini kontrol edin.");
        throw new Error("API_KEY environment variable not set");
    }
    ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  }
  return ai;
};

const formatHistoryForGemini = (history: ChatMessage[]) => {
    return history.map(msg => ({
        role: msg.role,
        parts: msg.parts.map(p => {
            if (p.text) return { text: p.text };
            if (p.imageUrl) {
                // Convert data URI back to base64 and mimeType
                const [header, data] = p.imageUrl.split(',');
                const mimeTypeMatch = header.match(/:(.*?);/);
                if (data && mimeTypeMatch?.[1]) {
                    return { inlineData: { data, mimeType: mimeTypeMatch[1] } };
                }
            }
            return null;
        }).filter((p): p is { text: string } | { inlineData: { data: string; mimeType: string } } => p !== null)
    })).filter(msg => msg.parts.length > 0);
};


export async function* generateTextStream(
    prompt: string, 
    history: ChatMessage[], 
    user: User | null,
    model: string,
    systemInstruction: string,
    isBookAnalysis: boolean
) {
  const localAi = getAiInstance();

  const userContextInstruction = user 
    ? `\n\n**KULLANICI BİLGİSİ**: Kullanıcı ${user.grade} öğrencisi${user.department && user.department !== 'Yok' ? ` ve ${user.department} bölümünde` : ''}. Cevaplarını bu seviyeye ve alana uygun olarak ayarla.` 
    : '';
  const finalSystemInstruction = `${systemInstruction}${userContextInstruction}`;
  
  const contents = formatHistoryForGemini(history);
  contents.push({ role: 'user', parts: [{ text: prompt }] });

  const config: any = {
      systemInstruction: finalSystemInstruction,
      tools: [{googleSearch: {}}],
  };
  
  if (isBookAnalysis) {
      config.thinkingConfig = { thinkingBudget: 0 };
  }
  
  const responseStream = await localAi.models.generateContentStream({
    model: model || DEFAULT_TEXT_MODEL,
    contents: contents,
    config: config,
    safetySettings: [
        { category: "HARM_CATEGORY_HARASSMENT", threshold: "BLOCK_NONE" },
        { category: "HARM_CATEGORY_HATE_SPEECH", threshold: "BLOCK_NONE" },
        { category: "HARM_CATEGORY_SEXUALLY_EXPLICIT", threshold: "BLOCK_NONE" },
        { category: "HARM_CATEGORY_DANGEROUS_CONTENT", threshold: "BLOCK_NONE" },
    ]
  });

  for await (const chunk of responseStream) {
    yield chunk.text;
  }
}

export async function generateContentWithImageAnnotation(
    prompt: string, 
    image: { base64: string; mimeType: string }, 
    systemInstruction: string, 
    history: ChatMessage[],
    user: User | null
): Promise<MessagePart[]> {
    const localAi = getAiInstance();

    const userContextInstruction = user 
        ? `\n\n**KULLANICI BİLGİSİ**: Kullanıcı ${user.grade} öğrencisi${user.department && user.department !== 'Yok' ? ` ve ${user.department} bölümünde` : ''}. Cevaplarını bu seviyeye ve alana uygun olarak ayarla.` 
        : '';
    const finalSystemInstruction = `${systemInstruction}${userContextInstruction}`;

    const contents = formatHistoryForGemini(history);
    const currentUserParts = [
        { inlineData: { data: image.base64, mimeType: image.mimeType } },
        { text: prompt || 'Bu resimdeki soruyu çöz ve çözümü adımlarıyla birlikte resmin üzerine yazarak göster.' }
    ];
    contents.push({ role: 'user', parts: currentUserParts });

    const response = await localAi.models.generateContent({
        model: IMAGE_EDIT_MODEL,
        contents: contents,
        config: {
            responseModalities: [Modality.IMAGE, Modality.TEXT],
            systemInstruction: finalSystemInstruction,
        },
    });

    const responseParts: MessagePart[] = [];

    if (response.candidates && response.candidates.length > 0) {
        for (const part of response.candidates[0].content.parts) {
            if (part.text) {
                responseParts.push({ text: part.text });
            } else if (part.inlineData) {
                const base64ImageBytes: string = part.inlineData.data;
                const mimeType = part.inlineData.mimeType;
                responseParts.push({ imageUrl: `data:${mimeType};base64,${base64ImageBytes}` });
            }
        }
    }

    if (responseParts.length === 0) {
        return [{ text: "Üzgünüm, resmi işlerken bir sorun oluştu." }];
    }

    return responseParts;
}


export async function generateImage(prompt: string, aspectRatio: string = '1:1'): Promise<string> {
    const localAi = getAiInstance();
    const response = await localAi.models.generateImages({
        model: IMAGE_GENERATION_MODEL,
        prompt: prompt,
        config: {
            numberOfImages: 1,
            outputMimeType: 'image/png',
            aspectRatio: aspectRatio,
        },
    });
    
    if (response.generatedImages && response.generatedImages.length > 0) {
        const base64ImageBytes = response.generatedImages[0].image.imageBytes;
        return `data:image/png;base64,${base64ImageBytes}`;
    } else {
        throw new Error('Image generation failed.');
    }
}