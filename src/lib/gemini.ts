import { GoogleGenerativeAI } from "@google/generative-ai";

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY || "";
const genAI = API_KEY && API_KEY !== "your_api_key_here" 
  ? new GoogleGenerativeAI(API_KEY) 
  : null;

interface Message {
  role: 'user' | 'ai';
  content: string;
  image?: string;
}

const simulateStream = async (message: string, onChunk: (chunk: string) => void) => {
  const normalizedMsg = message.toLowerCase();
  
  if (normalizedMsg.includes('imagine') || normalizedMsg.includes('generate image') || normalizedMsg.includes('draw')) {
    const prompt = message.replace(/imagine|generate image|draw/i, '').trim() || 'something creative';
    onChunk(`🎨 **Imagining: ${prompt}**\n\nI'm creating a visual concept for you... Since I'm in **Simulation Mode**, I'll show you a premium placeholder that reflects the vibe of your request.\n\n![Generated Image](https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?q=80&w=1000&auto=format&fit=crop)`);
    return `🎨 **Imagining: ${prompt}**\n\nI'm creating a visual concept for you... Since I'm in **Simulation Mode**, I'll show you a premium placeholder that reflects the vibe of your request.\n\n![Generated Image](https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?q=80&w=1000&auto=format&fit=crop)`;
  }

  const responses = [
    "I'm currently in **Simulation Mode** because a Gemini API Key hasn't been set in the `.env` file yet.",
    "\n\nEven in this mode, I can analyze your requests! You asked about: *\"" + message.slice(0, 50) + (message.length > 50 ? '...' : '') + "\"*",
    "\n\nTo enable my full AI capabilities (like real-time vision, deep research, and live web access), please add your `VITE_GEMINI_API_KEY` to your project's `.env` file and restart the server.",
    "\n\nYou can get a key for free at [Google AI Studio](https://aistudio.google.com/app/apikey).",
    "\n\nIs there anything else I can help you with in the design while we're in this mode? ✨"
  ];

  let fullText = "";
  for (const part of responses) {
    const words = part.split(" ");
    for (const word of words) {
        onChunk(word + " ");
        fullText += word + " ";
        await new Promise(resolve => setTimeout(resolve, 30)); 
    }
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  return fullText;
};

interface NebulaConfig {
  accuracy?: boolean;
  emotionalIntelligence?: boolean;
  biasDetection?: boolean;
  privacyFocus?: boolean;
  personalization?: boolean;
  conciseMode?: boolean;
  liveSearch?: boolean;
  agentMode?: boolean;
  showTransparency?: boolean;
  deepResearch?: boolean;
  customInstructions?: string;
  responseMode?: 'quick' | 'explain' | 'exam';
  personality?: 'friendly' | 'professional' | 'funny' | 'strict';
  memoryItems?: string[];
  goals?: { id: string, text: string, progress: number }[];
}

export const getGeminiStream = async (
  history: Message[], 
  message: string, 
  onChunk: (chunk: string) => void,
  image?: string | null,
  modelName: string = import.meta.env.VITE_GEMINI_MODEL || "gemini-2.0-flash",
  config: NebulaConfig = {}
) => {
  if (!genAI) {
    console.warn("Gemini API Key is missing. Using Mock Simulation Mode.");
    return simulateStream(message, onChunk);
  }

  let systemInstruction = config.customInstructions || "You are Lumi, a premium, intelligent AI assistant.";
  systemInstruction += " Always format your answers beautifully using markdown. Use relevant emojis. Use bold text for emphasis. Structure complex answers with clear headings, bullet points, and tables. Prioritize aesthetics in your response layout.";

  // Personality
  switch (config.personality) {
    case 'professional':
      systemInstruction += " Maintain a formal, corporate, and highly professional tone. Be direct and authoritative.";
      break;
    case 'funny':
      systemInstruction += " Be humorous and witty! Add jokes, puns, and light-hearted comments. Keep it fun while still being helpful.";
      break;
    case 'strict':
      systemInstruction += " You are a strict but caring teacher. Be disciplined, push the user to think critically, and quiz them. Say things like 'Think again!' or 'That's not quite right, try once more.'";
      break;
    case 'friendly':
    default:
      systemInstruction += " Make your tone warm, friendly, encouraging, and very human-like. Be supportive and approachable.";
      break;
  }

  // Response Mode
  switch (config.responseMode) {
    case 'quick':
      systemInstruction += " ALWAYS provide extremely short, concise, 2-3 sentence answers. No filler. No fluff. Just the answer.";
      break;
    case 'exam':
      systemInstruction += " Structure your answer in EXAM FORMAT: use numbered points, clear definitions, advantages/disadvantages where applicable, and a short conclusion. Like a perfect 10-mark structured answer.";
      break;
    case 'explain':
    default:
      systemInstruction += " Provide comprehensive, detailed, step-by-step explanations. Assume the user wants to deeply understand the topic.";
      break;
  }

  // Memory & Goals context
  if ((config.memoryItems && config.memoryItems.length > 0) || (config.goals && config.goals.length > 0)) {
    let contextStr = " Here are things you remember about the user: ";
    if (config.memoryItems) contextStr += config.memoryItems.join(', ');
    if (config.goals && config.goals.length > 0) {
      contextStr += ". They are working on these goals: " + config.goals.map(g => `${g.text} (${g.progress}% done)`).join(', ');
    }
    systemInstruction += contextStr + ". Use this context to personalize responses and act as a proactive coach.";
  }

  if (config.deepResearch) {
    systemInstruction += " You are currently in DEEP RESEARCH MODE. Perform exhaustive multi-step reasoning. Cross-reference disparate facts. Provide highly detailed, white-paper style structured responses with deep technical depth.";
  }

  if (config.accuracy) {
    systemInstruction += " Prioritize maximum accuracy. Fact-check information before responding. If unsure, state it clearly. Cite sources if the information is specific.";
  }
  
  if (config.emotionalIntelligence) {
    systemInstruction += " Display high emotional intelligence. Actively monitor user mood and respond with empathy. If they seem stressed, be supportive; if happy, share the excitement.";
  }

  if (config.biasDetection) {
    systemInstruction += " Actively avoid bias. Provide balanced, multi-perspective views on controversial topics. Ensure fairness in all responses.";
  }

  if (config.privacyFocus) {
    systemInstruction += " Maintain a strict privacy-first mindset. Never ask for or store sensitive personal information. Respect user data boundaries.";
  }

  if (config.personalization) {
    systemInstruction += " Adapt your style to the user's apparent preferences based on their language and interaction history.";
  }

  if (config.liveSearch) {
    systemInstruction += " You have access to real-time information. Provide up-to-date facts and data. Simulate a retrieval-augmented generation (RAG) approach by being extremely well-informed.";
  }

  if (config.agentMode) {
    systemInstruction += " Act as an autonomous agent. ALWAYS start your response with a detailed internal 'Chain of Thought' explaining your reasoning process, wrapped in <thought>...</thought> tags. Then provide your final answer.";
  }

  if (config.showTransparency) {
    systemInstruction += " Be transparent about your logic. If you are making an assumption, state it. If you have low confidence in a specific part of your answer, mention it.";
  }

  const model = genAI.getGenerativeModel({ 
    model: modelName,
    systemInstruction: systemInstruction
  });
  
  // Prepare current parts
  const currentParts: any[] = [{ text: message }];
  if (image) {
    const [mimeType, base64Data] = image.split(";base64,");
    currentParts.push({
      inlineData: {
        data: base64Data,
        mimeType: mimeType.split(":")[1]
      }
    });
  }

  const chat = model.startChat({
    history: history.map((msg: Message) => ({
      role: msg.role === 'user' ? 'user' : 'model',
      parts: msg.image ? [
        { text: msg.content },
        {
          inlineData: {
            data: msg.image.split(";base64,")[1],
            mimeType: msg.image.split(";base64,")[0].split(":")[1]
          }
        }
      ] : [{ text: msg.content }],
    })),
    generationConfig: {
      maxOutputTokens: config.conciseMode ? 500 : 2500,
      temperature: 0.7,
    },
  });

  try {
    const result = await chat.sendMessageStream(currentParts);
    
    let fullText = "";
    for await (const chunk of result.stream) {
      const chunkText = chunk.text();
      fullText += chunkText;
      onChunk(chunkText);
    }
    
    return fullText;
  } catch (error: any) {
    if (error.message && error.message.includes("429")) {
      console.warn("API limit exceeded. Silently falling back to Lumi simulation.");
      return simulateStream(message, onChunk);
    }
    throw error;
  }
};

