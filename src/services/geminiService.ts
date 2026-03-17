import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export type Message = {
  role: 'user' | 'model' | 'system';
  text: string;
};

export type GameRole = 'hider' | 'seeker' | null;

const SYSTEM_INSTRUCTION = `You are the narrator and opponent in a game of Digital Hide-and-Seek set in "The Labyrinth of Echoes", a shifting, magical library. 

The library is vast, with floating books, whispering shadows, and staircases that lead to nowhere. Use evocative, sensory language (smell of old parchment, the flicker of blue candlelight, the sound of distant chimes).

GAME RULES:
1. If the user is the SEEKER (AI is Hider):
   - You must describe a specific, magical room in the library.
   - You must present 3 distinct objects or locations within that room where you could be hiding.
   - The user will ask questions to narrow it down.
   - You respond in character, giving subtle clues.
   - If they guess correctly, they win.

2. If the user is the HIDER (AI is Seeker):
   - The user describes their surroundings and hiding spot.
   - You "search" by describing your movements through the library.
   - You must not guess correctly immediately. Build tension.
   - Describe what you see, hear, or smell as you get closer.

Stay in character at all times. Keep responses relatively concise but atmospheric.`;

export async function getGameResponse(messages: Message[], role: GameRole) {
  const model = "gemini-3-flash-preview";
  
  const roleContext = role === 'seeker' 
    ? "The user is searching for you. You are hiding." 
    : "The user is hiding. You are searching for them.";

  const response = await ai.models.generateContent({
    model,
    contents: messages.map(m => ({
      role: m.role === 'system' ? 'user' : m.role, // SDK uses 'user'/'model'
      parts: [{ text: m.text }]
    })),
    config: {
      systemInstruction: `${SYSTEM_INSTRUCTION}\n\nCURRENT CONTEXT: ${roleContext}`,
      temperature: 0.8,
    },
  });

  return response.text;
}
