import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { getUserFromRequest } from '@/lib/auth'

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await getUserFromRequest(request)
    if (!user || user.role !== 'admin') return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 403 })
    const { id } = await params
    const targetUser = await prisma.user.findUnique({
      where: { id },
      select: { id: true, name: true, email: true, phone: true, avatar: true, role: true, isActive: true, createdAt: true, orders: { take: 5, orderBy: { createdAt: 'desc' }, include: { items: true } }, _count: { select: { orders: true, reviews: true } } },
    })
    if (!targetUser) return NextResponse.json({ success: false, error: 'User not found' }, { status: 404 })
    return NextResponse.json({ success: true, data: targetUser })
  } catch (error) {
    console.error('Get user error:', error)
    return NextResponse.json({ success: false, error: 'Đã xảy ra lỗi' }, { status: 500 })
  }
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await getUserFromRequest(request)
    if (!user || user.role !== 'admin') return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 403 })
    const { id } = await params
    const body = await request.json()
    const updated = await prisma.user.update({
      where: { id },
      data: { isActive: body.isActive, role: body.role },
      select: { id: true, name: true, email: true, role: true, isActive: true },
    })
    return NextResponse.json({ success: true, data: updated })
  } catch (error) {
    console.error('Update user error:', error)
    return NextResponse.json({ success: false, error: 'Đã xảy ra lỗi' }, { status: 500 })
  }
}
