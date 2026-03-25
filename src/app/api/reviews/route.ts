import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { getUserFromRequest } from '@/lib/auth'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const productId = searchParams.get('productId')
    if (!productId) return NextResponse.json({ success: false, error: 'productId required' }, { status: 400 })
    const reviews = await prisma.review.findMany({
      where: { productId, isApproved: true },
      include: { user: { select: { id: true, name: true, avatar: true } } },
      orderBy: { createdAt: 'desc' },
    })
    return NextResponse.json({ success: true, data: reviews })
  } catch (error) {
    console.error('Get reviews error:', error)
    return NextResponse.json({ success: false, error: 'Đã xảy ra lỗi' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const user = await getUserFromRequest(request)
    if (!user) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    const { productId, rating, comment } = await request.json()
    const review = await prisma.review.create({
      data: { userId: user.userId, productId, rating, comment, isApproved: true },
      include: { user: { select: { id: true, name: true, avatar: true } } },
    })
    // Update product rating
    const reviews = await prisma.review.findMany({ where: { productId, isApproved: true } })
    const avgRating = reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length
    await prisma.product.update({
      where: { id: productId },
      data: { rating: Math.round(avgRating * 10) / 10, reviewCount: reviews.length },
    })
    return NextResponse.json({ success: true, data: review }, { status: 201 })
  } catch (error) {
    console.error('Create review error:', error)
    return NextResponse.json({ success: false, error: 'Đã xảy ra lỗi' }, { status: 500 })
  }
}
