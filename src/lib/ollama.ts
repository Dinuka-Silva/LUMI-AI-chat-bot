interface Message {
  role: 'user' | 'ai';
  content: string;
}

const OLLAMA_URL = import.meta.env.VITE_OLLAMA_BASE_URL || 'http://localhost:11434';
const DEFAULT_MODEL = import.meta.env.VITE_OLLAMA_MODEL || 'deepseek-r1:1.5b';

export const getOllamaStream = async (
  history: Message[],
  message: string,
  onChunk: (chunk: string) => void,
  modelName: string = DEFAULT_MODEL
) => {
  const response = await fetch(`${OLLAMA_URL}/api/chat`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: modelName,
      messages: [
        ...history.map(m => ({
          role: m.role === 'ai' ? 'assistant' : 'user',
          content: m.content
        })),
        { role: 'user', content: message }
      ],
      stream: true,
    }),
  });

  if (!response.ok) {
    throw new Error(`Ollama connection failed (Status: ${response.status}). Is the server running?`);
  }

  const reader = response.body?.getReader();
  if (!reader) return "";

  let fullText = "";
  const decoder = new TextDecoder();

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    const chunk = decoder.decode(value, { stream: true });
    // Ollama often sends multiple JSON objects in one chunk or breaks them
    const lines = chunk.split('\n');

    for (const line of lines) {
      if (!line.trim()) continue;
      try {
        const json = JSON.parse(line);
        if (json.message?.content) {
          const content = json.message.content;
          fullText += content;
          onChunk(content);
        }
        if (json.done) {
          // Streaming finished
        }
      } catch (e) {
        // Sometimes the chunk cuts off in the middle of a JSON line, we'll wait for the next part
        console.error('Error parsing Ollama chunk', e, line);
      }
    }
  }

  return fullText;
};
