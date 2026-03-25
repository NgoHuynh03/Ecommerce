import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { getUserFromRequest } from '@/lib/auth'

export async function GET(request: Request) {
  try {
    const user = await getUserFromRequest(request)
    if (!user) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    const items = await prisma.cartItem.findMany({
      where: { userId: user.userId },
      include: { product: { include: { images: { where: { isPrimary: true } }, category: true } } },
      orderBy: { createdAt: 'desc' },
    })
    return NextResponse.json({ success: true, data: items })
  } catch (error) {
    console.error('Get cart error:', error)
    return NextResponse.json({ success: false, error: 'Đã xảy ra lỗi' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const user = await getUserFromRequest(request)
    if (!user) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    const { productId, quantity = 1 } = await request.json()
    const existing = await prisma.cartItem.findUnique({
      where: { userId_productId: { userId: user.userId, productId } },
    })
    if (existing) {
      const item = await prisma.cartItem.update({
        where: { id: existing.id },
        data: { quantity: existing.quantity + quantity },
        include: { product: { include: { images: true } } },
      })
      return NextResponse.json({ success: true, data: item })
    }
    const item = await prisma.cartItem.create({
      data: { userId: user.userId, productId, quantity },
      include: { product: { include: { images: true } } },
    })
    return NextResponse.json({ success: true, data: item }, { status: 201 })
  } catch (error) {
    console.error('Add to cart error:', error)
    return NextResponse.json({ success: false, error: 'Đã xảy ra lỗi' }, { status: 500 })
  }
}

export async function PUT(request: Request) {
  try {
    const user = await getUserFromRequest(request)
    if (!user) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    const { productId, quantity } = await request.json()
    if (quantity <= 0) {
      await prisma.cartItem.delete({
        where: { userId_productId: { userId: user.userId, productId } },
      })
      return NextResponse.json({ success: true, message: 'Đã xóa khỏi giỏ hàng' })
    }
    const item = await prisma.cartItem.update({
      where: { userId_productId: { userId: user.userId, productId } },
      data: { quantity },
      include: { product: { include: { images: true } } },
    })
    return NextResponse.json({ success: true, data: item })
  } catch (error) {
    console.error('Update cart error:', error)
    return NextResponse.json({ success: false, error: 'Đã xảy ra lỗi' }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  try {
    const user = await getUserFromRequest(request)
    if (!user) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    const { searchParams } = new URL(request.url)
    const productId = searchParams.get('productId')
    const all = searchParams.get('all')
    if (all === 'true') {
      await prisma.cartItem.deleteMany({ where: { userId: user.userId } })
      return NextResponse.json({ success: true, message: 'Đã xóa toàn bộ giỏ hàng' })
    }
    if (productId) {
      await prisma.cartItem.delete({
        where: { userId_productId: { userId: user.userId, productId } },
      })
    }
    return NextResponse.json({ success: true, message: 'Đã xóa khỏi giỏ hàng' })
  } catch (error) {
    console.error('Delete cart error:', error)
    return NextResponse.json({ success: false, error: 'Đã xảy ra lỗi' }, { status: 500 })
  }
}
