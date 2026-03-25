import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { getUserFromRequest } from '@/lib/auth'

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await getUserFromRequest(request)
    if (!user) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    const { id } = await params
    const where: Record<string, unknown> = { OR: [{ id }, { orderNumber: id }] }
    if (user.role !== 'admin') where.userId = user.userId
    const order = await prisma.order.findFirst({
      where,
      include: { items: { include: { product: { include: { images: { where: { isPrimary: true } } } } } }, user: { select: { id: true, name: true, email: true, phone: true } } },
    })
    if (!order) return NextResponse.json({ success: false, error: 'Đơn hàng không tồn tại' }, { status: 404 })
    return NextResponse.json({ success: true, data: order })
  } catch (error) {
    console.error('Get order error:', error)
    return NextResponse.json({ success: false, error: 'Đã xảy ra lỗi' }, { status: 500 })
  }
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await getUserFromRequest(request)
    if (!user || user.role !== 'admin') return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 403 })
    const { id } = await params
    const body = await request.json()
    const order = await prisma.order.update({
      where: { id },
      data: { status: body.status, paymentStatus: body.paymentStatus },
      include: { items: true },
    })
    return NextResponse.json({ success: true, data: order })
  } catch (error) {
    console.error('Update order error:', error)
    return NextResponse.json({ success: false, error: 'Đã xảy ra lỗi' }, { status: 500 })
  }
}
