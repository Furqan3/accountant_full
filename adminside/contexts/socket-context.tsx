"use client"

import React, { createContext, useContext, useEffect, useState, useRef } from "react"
import { io, Socket } from "socket.io-client"
import { useAuth } from "./auth-context"
import { supabase } from "@/lib/supabase"
import type { ServerToClientEvents, ClientToServerEvents } from "@/types/socket"

type SocketContextType = {
  socket: Socket<ServerToClientEvents, ClientToServerEvents> | null
  isConnected: boolean
  connectionState: "connected" | "disconnected" | "error"
}

const SocketContext = createContext<SocketContextType>({
  socket: null,
  isConnected: false,
  connectionState: "disconnected",
})

export const useSocket = () => {
  const context = useContext(SocketContext)
  if (!context) {
    throw new Error("useSocket must be used within SocketProvider")
  }
  return context
}

export function SocketProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth()
  const [socket, setSocket] = useState<Socket<ServerToClientEvents, ClientToServerEvents> | null>(null)
  const [isConnected, setIsConnected] = useState(false)
  const [connectionState, setConnectionState] = useState<"connected" | "disconnected" | "error">("disconnected")
  const joinedRoomsRef = useRef<Set<string>>(new Set())

  useEffect(() => {
    if (!user) {
      // Disconnect socket if user logs out
      if (socket) {
        socket.disconnect()
        setSocket(null)
        setIsConnected(false)
        setConnectionState("disconnected")
        joinedRoomsRef.current.clear()
      }
      return
    }

    const initializeSocket = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession()

        if (error || !session) {
          console.error("Failed to get session:", error)
          setConnectionState("error")
          return
        }

        const SOCKET_SERVER_URL = process.env.NEXT_PUBLIC_SOCKET_SERVER_URL || "http://localhost:4000"

        const newSocket: Socket<ServerToClientEvents, ClientToServerEvents> = io(SOCKET_SERVER_URL, {
          auth: {
            token: session.access_token,
          },
          transports: ["websocket", "polling"],
        })

        newSocket.on("connect", () => {
          console.log("✅ Admin Socket connected")
          setIsConnected(true)
          setConnectionState("connected")

          // Rejoin rooms after reconnection
          joinedRoomsRef.current.forEach((orderId) => {
            console.log(`Rejoining room: order:${orderId}`)
            newSocket.emit("join-order-room", orderId)
          })
        })

        newSocket.on("disconnect", () => {
          console.log("❌ Admin Socket disconnected")
          setIsConnected(false)
          setConnectionState("disconnected")
        })

        newSocket.on("connect_error", (error) => {
          console.error("Admin Socket connection error:", error.message)
          setConnectionState("error")
        })

        newSocket.on("error", (data) => {
          console.error("Admin Socket error:", data.message)
        })

        setSocket(newSocket)
      } catch (error) {
        console.error("Error initializing admin socket:", error)
        setConnectionState("error")
      }
    }

    initializeSocket()

    return () => {
      if (socket) {
        socket.disconnect()
        joinedRoomsRef.current.clear()
      }
    }
  }, [user])

  // Helper to track joined rooms
  useEffect(() => {
    if (!socket) return

    const originalEmit = socket.emit.bind(socket)

    // @ts-ignore - Override emit to track room joins/leaves
    socket.emit = function (event: string, ...args: any[]) {
      if (event === "join-order-room" && typeof args[0] === "string") {
        joinedRoomsRef.current.add(args[0])
      } else if (event === "leave-order-room" && typeof args[0] === "string") {
        joinedRoomsRef.current.delete(args[0])
      }
      return originalEmit(event, ...args)
    }
  }, [socket])

  return (
    <SocketContext.Provider value={{ socket, isConnected, connectionState }}>
      {children}
    </SocketContext.Provider>
  )
}
