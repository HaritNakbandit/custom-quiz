"use client"

import { useState } from "react"

export interface GeneratedQuestion {
  question: string
  options: string[]
  correctIndex: number
  explanation: string
}

export interface GeneratedResult {
  questions: GeneratedQuestion[]
  suggestedTitle?: string
  suggestedCategory?: string
}

interface Message {
  role: "user" | "model"
  content: string
}

export function useAIQuizGeneration() {
  const [messages, setMessages] = useState<Message[]>([])
  const [streaming, setStreaming] = useState(false)
  const [streamBuffer, setStreamBuffer] = useState("")
  const [parsed, setParsed] = useState<GeneratedResult | null>(null)
  const [error, setError] = useState("")

  async function send(text: string) {
    if (!text.trim() || streaming) return

    const newMessages: Message[] = [...messages, { role: "user", content: text }]
    setMessages(newMessages)
    setStreaming(true)
    setStreamBuffer("")
    setParsed(null)
    setError("")

    try {
      const res = await fetch("/api/generate-quiz", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: newMessages }),
      })

      if (!res.ok) throw new Error("API error")

      const reader = res.body!.getReader()
      const decoder = new TextDecoder()
      let full = ""

      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        full += decoder.decode(value, { stream: true })
        setStreamBuffer(full)
      }

      const cleaned = full.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim()
      const result: GeneratedResult = JSON.parse(cleaned)
      setParsed(result)
      setMessages((prev) => [...prev, { role: "model", content: full }])
      setStreamBuffer("")
    } catch {
      setError("เกิดข้อผิดพลาด ลองใหม่อีกครั้ง")
    } finally {
      setStreaming(false)
    }
  }

  function reset() {
    setMessages([])
    setStreamBuffer("")
    setParsed(null)
    setError("")
  }

  return { messages, streaming, streamBuffer, parsed, error, send, reset }
}
