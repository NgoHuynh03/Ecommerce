'use client'

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { CartItem } from '@/types'

interface CartContextType {
  items: CartItem[]
  itemCount: number
  totalAmount: number
  loading: boolean
  addToCart: (productId: string, quantity?: number) => Promise<void>
  updateQuantity: (productId: string, quantity: number) => Promise<void>
  removeFromCart: (productId: string) => Promise<void>
  clearCart: () => Promise<void>
  refreshCart: () => Promise<void>
}

const CartContext = createContext<CartContextType | undefined>(undefined)

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([])
  const [loading, setLoading] = useState(false)

  const itemCount = items.reduce((acc, item) => acc + item.quantity, 0)
  const totalAmount = items.reduce((acc, item) => {
    const price = item.product.salePrice || item.product.price
    return acc + price * item.quantity
  }, 0)

  const refreshCart = useCallback(async () => {
    try {
      const res = await fetch('/api/cart')
      const data = await res.json()
      if (data.success) {
        setItems(data.data || [])
      }
    } catch (error) {
      console.error('Failed to fetch cart:', error)
    }
  }, [])

  useEffect(() => {
    refreshCart()
  }, [refreshCart])

  const addToCart = async (productId: string, quantity = 1) => {
    setLoading(true)
    try {
      const res = await fetch('/api/cart', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId, quantity }),
      })
      const data = await res.json()
      if (data.success) {
        await refreshCart()
      }
    } catch (error) {
      console.error('Failed to add to cart:', error)
    } finally {
      setLoading(false)
    }
  }

  const updateQuantity = async (productId: string, quantity: number) => {
    setLoading(true)
    try {
      const res = await fetch('/api/cart', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId, quantity }),
      })
      const data = await res.json()
      if (data.success) {
        await refreshCart()
      }
    } catch (error) {
      console.error('Failed to update cart:', error)
    } finally {
      setLoading(false)
    }
  }

  const removeFromCart = async (productId: string) => {
    setLoading(true)
    try {
      const res = await fetch(`/api/cart?productId=${productId}`, {
        method: 'DELETE',
      })
      const data = await res.json()
      if (data.success) {
        await refreshCart()
      }
    } catch (error) {
      console.error('Failed to remove from cart:', error)
    } finally {
      setLoading(false)
    }
  }

  const clearCart = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/cart?all=true', { method: 'DELETE' })
      const data = await res.json()
      if (data.success) {
        setItems([])
      }
    } catch (error) {
      console.error('Failed to clear cart:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <CartContext.Provider value={{ items, itemCount, totalAmount, loading, addToCart, updateQuantity, removeFromCart, clearCart, refreshCart }}>
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const context = useContext(CartContext)
  if (!context) throw new Error('useCart must be used within CartProvider')
  return context
}
