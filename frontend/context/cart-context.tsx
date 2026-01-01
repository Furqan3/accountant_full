"use client"

import React, { createContext, useContext, useState, useEffect, useRef } from "react"
import { toast, ToastContainer } from "react-toastify"
import "react-toastify/dist/ReactToastify.css"

export interface CartItem {
  id: string
  title: string
  description?: string
  price: number
  quantity: number
  companyName?: string
  companyNumber?: string
}

interface CartContextType {
  items: CartItem[]
  addToCart: (item: Omit<CartItem, "quantity">) => void
  removeFromCart: (id: string) => void
  updateQuantity: (id: string, quantity: number) => void
  clearCart: () => void
  totalItems: number
  totalPrice: number
}

const CartContext = createContext<CartContextType | undefined>(undefined)

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([])
  const toastRef = useRef<{ message: string; type: "success" | "error" | "info" } | null>(null)

  // Load cart from localStorage on mount
  useEffect(() => {
    const savedCart = localStorage.getItem("cart")
    if (savedCart) {
      try {
        setItems(JSON.parse(savedCart))
      } catch (error) {
        console.error("Failed to parse cart from localStorage:", error)
      }
    }
  }, [])

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem("cart", JSON.stringify(items))
  }, [items])

  // Handle toast notifications after state updates or when toast is queued
  useEffect(() => {
    if (toastRef.current) {
      const { message, type } = toastRef.current
      toast[type](message, { autoClose: 3000 })
      toastRef.current = null
    }
  }, [items])

  // Flush pending toast on demand (for cases where items don't change)
  const flushToast = () => {
    if (toastRef.current) {
      const { message, type } = toastRef.current
      toast[type](message, { autoClose: 3000 })
      toastRef.current = null
    }
  }

  const addToCart = (item: Omit<CartItem, "quantity">) => {
    setItems((prevItems) => {
      if (prevItems.length >= 3) {
        toastRef.current = {
          message: "You can only add a maximum of 3 items to your cart.",
          type: "error",
        }
        return prevItems
      }

      const existingItem = prevItems.find((i) => i.id === item.id)
      if (existingItem) {
        toastRef.current = {
          message: `${item.title} is already in the cart`,
          type: "info",
        }
        return prevItems
      }

      toastRef.current = {
        message: `${item.title} added to cart!`,
        type: "success",
      }
      return [...prevItems, { ...item, quantity: 1 }]
    })
    // Flush toast immediately for cases where items didn't change
    setTimeout(() => flushToast(), 0)
  }

  const removeFromCart = (id: string) => {
    setItems((prevItems) => {
      const item = prevItems.find((i) => i.id === id)
      if (item) {
        toastRef.current = {
          message: `${item.title} removed from cart`,
          type: "info",
        }
      }
      return prevItems.filter((item) => item.id !== id)
    })
  }

  const updateQuantity = (id: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(id)
      return
    }
    setItems((prevItems) =>
      prevItems.map((item) => (item.id === id ? { ...item, quantity } : item))
    )
  }

  const clearCart = () => {
    setItems([])
    toastRef.current = {
      message: "Cart cleared",
      type: "info",
    }
  }

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0)
  const totalPrice = items.reduce((sum, item) => sum + item.price * item.quantity, 0)

  return (
    <CartContext.Provider
      value={{
        items,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        totalItems,
        totalPrice,
      }}
    >
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const context = useContext(CartContext)
  if (!context) {
    throw new Error("useCart must be used within a CartProvider")
  }
  return context
}