const DEFAULT_API_BASE = import.meta.env.VITE_API_BASE ?? "http://localhost:3002";
const DEFAULT_DECODE_WS = import.meta.env.VITE_DECODE_WS ?? "http://localhost:8010";

export function apiBase() {
  return DEFAULT_API_BASE;
}

export function decodeWsBase() {
  return DEFAULT_DECODE_WS;
}

export async function fetchJson<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${apiBase()}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
    ...init,
  });

  if (!response.ok) {
    const message = await response.text();
    throw new Error(message || response.statusText);
  }

  return response.json() as Promise<T>;
}

export type UserProfile = {
  id: string;
  name?: string;
  avatar?: string;
  language?: string;
  fontSize?: number;
  theme?: string;
  preferences?: {
    language?: string;
    emotionalTone?: boolean;
    speakingRate?: number;
  };
};

export type Phrase = {
  id: string;
  userId: string;
  title: string;
  text: string;
  category?: string;
};

export type DecodeHistoryItem = {
  id: string;
  userId: string;
  summary?: string;
  score?: number;
  createdAt?: string;
};
