// counselorService.js

// Prefer an env var in production; falls back to your Space endpoint.
// Example: REACT_APP_COUNSEL_API_URL=https://<your-space>.hf.space/counsel
const DEFAULT_API_URL =
  process.env.REACT_APP_COUNSEL_API_URL ||
  'https://sachin21112004-dreamflow-ai.hf.space/counsel';

/**
 * Stream a response from the FastAPI /counsel endpoint.
 *
 * @param {string} userInput - The user's message.
 * @param {string} sessionId - Unique chat session id.
 * @param {(chunk: string) => void} onChunkReceived - Called for each incoming chunk.
 * @param {(error: Error) => void} onError - Called on failure.
 * @param {() => void} onStreamEnd - Called when the stream ends (success or fail).
 * @param {object} opts - Optional settings.
 * @param {string} [opts.apiUrl] - Override endpoint URL.
 * @param {number} [opts.timeoutMs] - Abort after this many ms (default 60s).
 * @param {Record<string,string>} [opts.headers] - Extra headers to send.
 */
export async function streamBotResponse(
  userInput,
  sessionId,
  onChunkReceived,
  onError,
  onStreamEnd,
  opts = {}
) {
  const apiUrl = opts.apiUrl || DEFAULT_API_URL;
  const timeoutMs = Number.isFinite(opts.timeoutMs) ? opts.timeoutMs : 60_000;
  const extraHeaders = opts.headers || {};

  try {
    if (!userInput || !userInput.trim()) {
      throw new Error('Missing userInput');
    }
    if (!sessionId) {
      throw new Error('Missing sessionId');
    }

    // Abort on timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => {
      controller.abort(new Error('Request timed out'));
    }, timeoutMs);

    // Perform fetch with explicit CORS and streaming-friendly headers
    const response = await fetch(apiUrl, {
      method: 'POST',
      mode: 'cors',            // important for browser CORS
      cache: 'no-store',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'text/plain',
        ...extraHeaders,
      },
      body: JSON.stringify({ query: userInput, session_id: sessionId }),
      signal: controller.signal,
    });

    // Clear timeout once headers arrive
    clearTimeout(timeoutId);

    if (!response.ok) {
      // Try to read response body for error details (non-streaming)
      let detail = '';
      try { detail = await response.text(); } catch {}
      throw new Error(`HTTP ${response.status} ${response.statusText}${detail ? ` - ${detail}` : ''}`);
    }

    // Some environments may not expose a streaming body; handle both paths.
    if (!response.body) {
      const text = await response.text();
      if (text) onChunkReceived(text);
      if (onStreamEnd) onStreamEnd();
      return;
    }

    // Stream chunks using ReadableStream reader
    const reader = response.body.getReader();
    const decoder = new TextDecoder();

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      const chunk = decoder.decode(value, { stream: true });
      if (chunk) onChunkReceived(chunk);
    }

    if (onStreamEnd) onStreamEnd();
  } catch (err) {
    try { onError?.(err); } finally { onStreamEnd?.(); }
  }
}

// Optional: expose the default URL for debugging/health checks
export const API_URL = DEFAULT_API_URL;
