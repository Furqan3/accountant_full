"use client"

import { useEffect, useRef } from "react"
import { useSocket } from "@/context/socket-context"
import { toast } from "react-toastify"
import "react-toastify/dist/ReactToastify.css"

export function MessageNotificationListener() {
  const { socket } = useSocket()
  const audioRef = useRef<HTMLAudioElement | null>(null)

  useEffect(() => {
    // Create audio element for notification sound
    if (typeof window !== "undefined") {
      audioRef.current = new Audio("/notification.mp3")
      audioRef.current.volume = 0.5
    }
  }, [])

  useEffect(() => {
    if (!socket) return

    const handleNewMessage = (data: any) => {
      const message = data.message

      // Only show notification for admin messages (is_admin = true means from admin)
      if (message.is_admin) {
        // Play notification sound
        if (audioRef.current) {
          audioRef.current.play().catch(() => {
            // Ignore audio play errors (user hasn't interacted with page yet)
          })
        }

        // Show toast notification
        toast.info(
          <div>
            <strong>New message from FilingHub Support</strong>
            <p className="text-sm mt-1 text-gray-600">
              {message.message_text?.substring(0, 100) || "You have a new message"}
              {message.message_text?.length > 100 ? "..." : ""}
            </p>
          </div>,
          {
            position: "bottom-right",
            autoClose: 5000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            onClick: () => {
              // Navigate to messages page when clicked
              window.location.href = `/orders?orderId=${data.orderId}`
            },
          }
        )
      }
    }

    socket.on("new-message", handleNewMessage)

    return () => {
      socket.off("new-message", handleNewMessage)
    }
  }, [socket])

  return null
}
