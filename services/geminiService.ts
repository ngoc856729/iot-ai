import { GoogleGenAI, Type, Content } from "@google/genai";
import type { Device, GeminiAnalysis, AISettings, ChatMessage } from '../types';

// --- Predictive Analysis Service ---

const getAnalysisPrompt = (device: Device): string => {
  const { name, protocol, currentData } = device;
  const { temperature, pressure, vibration } = currentData;
  const normalRanges = `Normal operating ranges are: Temperature < 70°C, Pressure < 160 PSI, Vibration < 3.0 G.`;

  return `
    You are a factory maintenance expert AI. Analyze the following real-time data for a piece of factory equipment.
    
    Equipment Name: ${name}
    Communication Protocol: ${protocol}
    
    Current Sensor Readings:
    - Temperature: ${temperature.toFixed(1)}°C
    - Pressure: ${pressure.toFixed(0)} PSI
    - Vibration: ${vibration.toFixed(2)} G
    
    ${normalRanges}
    
    Based on this data, provide a predictive maintenance analysis. Identify the risk level, summarize the potential issue, and suggest specific, actionable recommendations.
    Return your analysis ONLY as a valid JSON object with the following schema:
    { "riskLevel": "Low" | "Medium" | "High", "prediction": string, "recommendations": string[] }
  `;
};

const analysisSchema = {
  type: Type.OBJECT,
  properties: {
    riskLevel: { type: Type.STRING },
    prediction: { type: Type.STRING },
    recommendations: { type: Type.ARRAY, items: { type: Type.STRING } },
  },
  required: ["riskLevel", "prediction", "recommendations"],
};

async function getGeminiAnalysis(device: Device, settings: AISettings): Promise<GeminiAnalysis | null> {
    if (!settings.gemini.apiKey) throw new Error("Gemini API key is not set.");
    const ai = new GoogleGenAI({ apiKey: settings.gemini.apiKey });
    const response = await ai.models.generateContent({
        model: settings.gemini.model,
        contents: getAnalysisPrompt(device),
        config: {
            responseMimeType: "application/json",
            responseSchema: analysisSchema,
        },
    });
    const parsedJson = JSON.parse(response.text);
    return parsedJson as GeminiAnalysis;
}

async function getOpenAICompatibleAnalysis(device: Device, settings: AISettings): Promise<GeminiAnalysis | null> {
    const provider = settings.provider;
    const providerSettings = settings[provider];
    if (!providerSettings.apiKey) throw new Error(`${provider} API key is not set.`);

    const url = provider === 'anthropic'
        ? 'https://api.anthropic.com/v1/messages'
        : `${providerSettings.baseURL}/chat/completions`;

    const headers: Record<string, string> = {
        'Content-Type': 'application/json',
    };

    if (provider === 'anthropic') {
        headers['x-api-key'] = providerSettings.apiKey;
        headers['anthropic-version'] = '2023-06-01';
    } else {
        headers['Authorization'] = `Bearer ${providerSettings.apiKey}`;
    }

    const body = provider === 'anthropic' ? {
        model: providerSettings.model,
        max_tokens: 1024,
        messages: [{ role: 'user', content: getAnalysisPrompt(device) }],
    } : {
        model: providerSettings.model,
        messages: [{ role: 'user', content: getAnalysisPrompt(device) }],
        response_format: { type: 'json_object' },
    };

    const response = await fetch(url, {
        method: 'POST',
        headers: headers,
        body: JSON.stringify(body),
    });

    if (!response.ok) {
        const errorBody = await response.text();
        console.error(`Error from ${provider} API:`, errorBody);
        throw new Error(`Failed to fetch analysis from ${provider}. Status: ${response.status}`);
    }

    const json = await response.json();
    const content = provider === 'anthropic' ? json.content[0].text : json.choices[0].message.content;
    return JSON.parse(content) as GeminiAnalysis;
}

export const getPredictiveAnalysis = async (device: Device, settings: AISettings): Promise<GeminiAnalysis | null> => {
    try {
        switch (settings.provider) {
            case 'gemini':
                return await getGeminiAnalysis(device, settings);
            case 'openai':
            case 'iotteam':
            case 'anthropic':
                return await getOpenAICompatibleAnalysis(device, settings);
            default:
                console.error(`Unsupported AI provider: ${settings.provider}`);
                return null;
        }
    } catch (error) {
        console.error("Error getting predictive analysis:", error);
        return null;
    }
};


// --- Chat Service ---

const systemInstruction = {
  role: 'system',
  parts: [{ text: 'You are an expert AI assistant for factory maintenance and industrial operations. You are speaking with a factory floor engineer. Provide concise and helpful information.' }]
};

export async function* streamChatResponse(history: ChatMessage[], message: string, settings: AISettings): AsyncGenerator<string> {
    const userMessage: ChatMessage = { role: 'user', parts: [{ text: message }] };
    const fullHistory = [...history, userMessage];

    try {
         switch (settings.provider) {
            case 'gemini':
                yield* streamGeminiChat(fullHistory, settings);
                break;
            case 'openai':
            case 'iotteam':
            case 'anthropic':
                 yield* streamOpenAICompatibleChat(fullHistory, settings);
                break;
            default:
                yield "Error: Unsupported provider.";
        }
    } catch (error) {
        console.error("Error streaming chat response:", error);
        yield `Sorry, I encountered an error with the ${settings.provider} provider. Please check the settings and console for details.`;
    }
}

async function* streamGeminiChat(history: ChatMessage[], settings: AISettings): AsyncGenerator<string> {
    if (!settings.gemini.apiKey) throw new Error("Gemini API key is not set.");
    const ai = new GoogleGenAI({ apiKey: settings.gemini.apiKey });

    const contents = history.map(msg => ({
        role: msg.role,
        parts: msg.parts,
    }));

    const stream = await ai.models.generateContentStream({
        model: settings.gemini.model,
        contents: contents as Content[],
        config: {
            systemInstruction: systemInstruction as any,
        },
    });

    for await (const chunk of stream) {
        yield chunk.text;
    }
}

async function* streamOpenAICompatibleChat(history: ChatMessage[], settings: AISettings): AsyncGenerator<string> {
     const provider = settings.provider;
    const providerSettings = settings[provider];
    if (!providerSettings.apiKey) throw new Error(`${provider} API key is not set.`);

    const url = provider === 'anthropic'
        ? 'https://api.anthropic.com/v1/messages'
        : `${providerSettings.baseURL}/chat/completions`;

    const headers: Record<string, string> = {
        'Content-Type': 'application/json',
    };

    if (provider === 'anthropic') {
        headers['x-api-key'] = providerSettings.apiKey;
        headers['anthropic-version'] = '2023-06-01';
    } else {
        headers['Authorization'] = `Bearer ${providerSettings.apiKey}`;
    }

    const messages = history.map(msg => ({
        role: msg.role,
        content: msg.parts.map(p => p.text).join(' '),
    }));

    const body = provider === 'anthropic' ? {
        model: providerSettings.model,
        max_tokens: 1024,
        messages: messages,
        system: systemInstruction.parts[0].text,
        stream: true,
    } : {
        model: providerSettings.model,
        messages: [{ role: 'system', content: systemInstruction.parts[0].text }, ...messages],
        stream: true,
    };
    
    const response = await fetch(url, {
        method: 'POST',
        headers: headers,
        body: JSON.stringify(body),
    });
    
    if (!response.body) return;

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';

    while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        
        buffer += decoder.decode(value, { stream: true });
        
        const lines = buffer.split('\n');
        buffer = lines.pop() || ''; // Keep the last, possibly incomplete line

        for (const line of lines) {
            if (!line.startsWith('data: ')) continue;
            const data = line.substring(6);
            if (data === '[DONE]') return;
            try {
                const json = JSON.parse(data);
                let textChunk: string | undefined;

                if (provider === 'anthropic') {
                    if (json.type === 'content_block_delta') {
                        textChunk = json.delta?.text;
                    }
                } else { // OpenAI compatible
                    textChunk = json.choices?.[0]?.delta?.content;
                }

                if (textChunk) {
                    yield textChunk;
                }
            } catch (e) {
                // Ignore parsing errors for incomplete JSON
            }
        }
    }
}
