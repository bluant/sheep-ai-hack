// API service for handling requests to the backend
// This file serves as an abstraction for all API calls

const API_BASE_URL = 'http://127.0.0.1:8000';

/**
 * Sends a chat request to the backend and returns a readable stream of the response
 * @param question The question to send to the chat API
 * @returns A ReadableStream of the response
 */
export const getChatStream = async (question: string): Promise<ReadableStream<Uint8Array>> => {
  const response = await fetch(`${API_BASE_URL}/chat?q=${encodeURIComponent(question)}`, {
    method: 'GET',
    headers: {
      'Accept': 'text/plain',
    },
  });

  if (!response.ok) {
    throw new Error(`API error: ${response.status} ${response.statusText}`);
  }

  // Return the readable stream from the response
  return response.body as ReadableStream<Uint8Array>;
};

/**
 * Sends an ask request to the backend and returns a readable stream of the response
 * @param question The question to send to the ask API
 * @returns A ReadableStream of the response
 */
export const getAskStream = async (question: string): Promise<ReadableStream<Uint8Array>> => {
  const response = await fetch(`${API_BASE_URL}/ask?q=${encodeURIComponent(question)}`, {
    method: 'GET',
    headers: {
      'Accept': 'text/plain',
    },
  });
  if (!response.ok) {
    throw new Error(`API error: ${response.status} ${response.statusText}`);
  }
  return response.body as ReadableStream<Uint8Array>;
};

/**
 * Utility function to read a stream chunk by chunk and process each chunk
 * @param stream The ReadableStream to read from
 * @param onChunk Callback function to process each chunk
 * @param onDone Callback function called when the stream is done
 */
export const readStream = async (
    stream: ReadableStream<Uint8Array>,
    onChunk: (text: string) => void,
    onDone: () => void
) => {
  const reader = stream.getReader();
  const decoder = new TextDecoder();
  let buffer = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });

    // Podijeli po newlineovima jer Ollama šalje jedan JSON po liniji
    const lines = buffer.split('\n');
    buffer = lines.pop() || ''; // zadrži zadnji "nepotpuni" dio za sljedeći chunk

    for (const line of lines) {
      if (!line.trim()) continue;
      try {
        const json = JSON.parse(line);
        const content = json?.message?.content || '';
        if (content) onChunk(content);
        if (json?.done) {
          onDone();
          return;
        }
      } catch (err) {
        console.warn('Failed to parse stream chunk:', err, line);
      }
    }
  }
};