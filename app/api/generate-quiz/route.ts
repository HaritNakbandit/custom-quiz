import { GoogleGenAI } from "@google/genai"
import { NextRequest } from "next/server"
import { AI_MODEL } from "@/lib/config"

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! })

const SYSTEM_PROMPT = `You are a quiz question generator. Generate quiz questions based on the user's request.

Always respond with ONLY a valid JSON object in this exact format, no markdown, no extra text:
{
  "questions": [
    {
      "question": "question text",
      "options": ["option A", "option B", "option C", "option D"],
      "correctIndex": 0,
      "explanation": "brief explanation"
    }
  ],
  "suggestedTitle": "Quiz Title",
  "suggestedCategory": "Category"
}

Rules:
- Generate exactly the number of questions requested (default 5 if not specified)
- Always 4 options per question
- correctIndex is 0–3
- If user writes in Thai, respond in Thai. If English, respond in English.`

export async function POST(req: NextRequest) {
  const { messages } = await req.json()

  const history = messages.slice(0, -1).map((m: { role: string; content: string }) => ({
    role: m.role as "user" | "model",
    parts: [{ text: m.content }],
  }))
  const lastMessage = messages[messages.length - 1]

  const chat = ai.chats.create({
    model: AI_MODEL,
    history,
    config: { systemInstruction: SYSTEM_PROMPT },
  })

  const stream = await chat.sendMessageStream({ message: lastMessage.content })

  const encoder = new TextEncoder()
  const readable = new ReadableStream({
    async start(controller) {
      for await (const chunk of stream) {
        const text = chunk.text
        if (text) controller.enqueue(encoder.encode(text))
      }
      controller.close()
    },
  })

  return new Response(readable, {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  })
}
