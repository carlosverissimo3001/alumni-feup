"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { MessageSquarePlus } from "lucide-react"

export default function ReviewButton() {
  const router = useRouter()
  const [isVisible, setIsVisible] = useState(false)
  
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true)
    }, 500)

    return () => clearTimeout(timer)
  }, [])

  const navigateToReviewPage = () => {
    router.push("/reviews/create-review")
  }

  if (!isVisible) return null

  return (
    <button
      onClick={navigateToReviewPage}
      className="fixed right-10 bottom-10 z-50 flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-white px-4 py-3 rounded-full shadow-lg transition-all duration-300 hover:scale-105 group"
      aria-label="Write a review"
    >
      <MessageSquarePlus className="h-5 w-5" />
      <span className="max-w-0 overflow-hidden group-hover:max-w-xs transition-all duration-500 ease-in-out whitespace-nowrap">
        Write a Review
      </span>
    </button>
  )
}
