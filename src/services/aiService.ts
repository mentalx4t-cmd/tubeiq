import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function generateContentIdeas(phrase: string) {
  const prompt = `You are a YouTube viral content expert. Based on the phrase "${phrase}", suggest:
  1. A compelling, viral-potential YouTube video title.
  2. 5 relevant, highly-searchable hashtags.
  3. 10 high-value keywords to use for SEO.
  Return as a valid JSON object with keys: title, hashtags, keywords.`;
  
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: { parts: [{ text: prompt }] },
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          title: { type: Type.STRING },
          hashtags: { type: Type.ARRAY, items: { type: Type.STRING } },
          keywords: { type: Type.ARRAY, items: { type: Type.STRING } }
        }
      }
    }
  });

  return JSON.parse(response.text);
}

export async function getTopicIdeas(niche: string) {
  const prompt = `Suggest 5 trending and unique YouTube video topic ideas for the niche: "${niche}", based on the latest trends for today, ${new Date().toISOString().split('T')[0]}. Use Google Search to ensure these ideas are relevant and trending. Include target audience and why it might trend. Return as JSON.`;
  
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: { parts: [{ text: prompt }] },
    tools: [{ googleSearch: {} }],
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            description: { type: Type.STRING },
            reason: { type: Type.STRING }
          }
        }
      }
    }
  } as any);

  return JSON.parse(response.text);
}

export async function optimizeVideo(videoData: { title: string; description: string; niche: string; videoBase64?: string; mimeType?: string }) {
  const parts: any[] = [];

  if (videoData.videoBase64 && videoData.mimeType) {
    parts.push({
      inlineData: {
        mimeType: videoData.mimeType,
        data: videoData.videoBase64
      }
    });
  }

  parts.push({
    text: `You are a Multimodal YouTube SEO Expert. 
    Analyze the attached video with EXTREME precision. 
    
    INSTRUCTIONS:
    1. Identify every visual detail: what objects are present, the setting, the lighting, and any movement.
    2. Transcribe or summarize key spoken segments if audio is present.
    3. Analyze the "vibe" (e.g., cinematic, tutorial, vlog, fast-paced, calming).
    4. Ignore the initial title/description if they conflict with what you see.
    
    Context:
    - Target Niche: ${videoData.niche}
    - User Context: ${videoData.description}
    - Filename: ${videoData.title}
    
    Provide a JSON response with:
    1. contentSummary: A detailed 2-sentence visual summary.
    2. optimizedTitle: A high-CTR title (max 70 chars) based on VISUAL hooks.
    3. optimizedDescription: A semantic description (500+ chars) that includes key moments you saw.
    4. tags: 15 relevant tags.
    5. hashtags: 5 hashtags.
    6. thumbnailIdeas: 3 visual concepts based on the video's best frames.
    `
  });

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: { parts },
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          contentSummary: { type: Type.STRING },
          optimizedTitle: { type: Type.STRING },
          optimizedDescription: { type: Type.STRING },
          tags: { type: Type.ARRAY, items: { type: Type.STRING } },
          hashtags: { type: Type.ARRAY, items: { type: Type.STRING } },
          thumbnailIdeas: { type: Type.ARRAY, items: { type: Type.STRING } }
        }
      }
    }
  });

  return JSON.parse(response.text);
}

export async function getNicheInsights(query: string) {
  const prompt = `Analyze the current landscape for the YouTube query: "${query}" for today, ${new Date().toISOString().split('T')[0]}. Use Google Search to get the latest real-time market data.
  Provide:
  1. Sentiment score (0-100, where 100 is highly positive interest).
  2. Sentiment label (Positive, Neutral, Rising, Controversial).
  3. Predicted trend for the next 30 days (Growth percentage).
  4. Competitive gaps: 3 things viewers are asking for that aren't being well-covered by top creators.
  Return as JSON.`;

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: { parts: [{ text: prompt }] },
    tools: [{ googleSearch: {} }],
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          sentimentScore: { type: Type.NUMBER },
          sentimentLabel: { type: Type.STRING },
          predictedGrowth: { type: Type.NUMBER },
          gaps: {
            type: Type.ARRAY,
            items: { type: Type.STRING }
          }
        }
      }
    }
  } as any);

  return JSON.parse(response.text);
}
