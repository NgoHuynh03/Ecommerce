import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { getUserFromRequest } from '@/lib/auth'

export async function GET(request: Request) {
  try {
    const user = await getUserFromRequest(request)
    if (!user) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    const items = await prisma.wishlist.findMany({
      where: { userId: user.userId },
      include: { product: { include: { images: { where: { isPrimary: true } }, category: true } } },
      orderBy: { createdAt: 'desc' },
    })
    return NextResponse.json({ success: true, data: items })
  } catch (error) {
    console.error('Get wishlist error:', error)
    return NextResponse.json({ success: false, error: 'Đã xảy ra lỗi' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const user = await getUserFromRequest(request)
    if (!user) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    const { productId } = await request.json()
    const existing = await prisma.wishlist.findUnique({
      where: { userId_productId: { userId: user.userId, productId } },
    })
    if (existing) {
      await prisma.wishlist.delete({ where: { id: existing.id } })
      return NextResponse.json({ success: true, data: { wishlisted: false } })
    }
    await prisma.wishlist.create({ data: { userId: user.userId, productId } })
    return NextResponse.json({ success: true, data: { wishlisted: true } }, { status: 201 })
  } catch (error) {
    console.error('Toggle wishlist error:', error)
    return NextResponse.json({ success: false, error: 'Đã xảy ra lỗi' }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  try {
    const user = await getUserFromRequest(request)
    if (!user) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    const { searchParams } = new URL(request.url)
    const productId = searchParams.get('productId')
    if (productId) {
      await prisma.wishlist.delete({
        where: { userId_productId: { userId: user.userId, productId } },
      })
    }
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Delete wishlist error:', error)
    return NextResponse.json({ success: false, error: 'Đã xảy ra lỗi' }, { status: 500 })
  }
}
