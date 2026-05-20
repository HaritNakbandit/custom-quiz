"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { createClient } from "@/lib/supabase/client"
import { Quiz } from "@/types/quizzes"

const supabase = createClient()
const PAGE_SIZE = 9

export function usePaginatedQuizzes() {
  const [quizzes, setQuizzes] = useState<Quiz[]>([])
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [hasMore, setHasMore] = useState(false)
  const [userId, setUserId] = useState<string | null>(null)
  const pageRef = useRef(0)

  async function fetchPage(page: number, replace: boolean) {
    const from = page * PAGE_SIZE
    const to = from + PAGE_SIZE - 1
    const { data } = await supabase
      .from("quizzes")
      .select("*")
      .order("created_at", { ascending: false })
      .range(from, to)

    if (data) {
      setQuizzes((prev) => replace ? data as Quiz[] : [...prev, ...data as Quiz[]])
      setHasMore(data.length === PAGE_SIZE)
    }
    pageRef.current = page
  }

  useEffect(() => {
    async function init() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { setLoading(false); return }
      setUserId(user.id)
      await fetchPage(0, true)
      setLoading(false)
    }
    init()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const loadMore = useCallback(async () => {
    setLoadingMore(true)
    await fetchPage(pageRef.current + 1, false)
    setLoadingMore(false)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const deleteQuiz = useCallback(async (id: string) => {
    await supabase.from("quizzes").delete().eq("id", id)
    setQuizzes((prev) => prev.filter((q) => q.id !== id))
  }, [])

  return { quizzes, loading, loadingMore, hasMore, userId, deleteQuiz, loadMore }
}
