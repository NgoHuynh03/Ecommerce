import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { getUserFromRequest } from '@/lib/auth'
import { generateOrderNumber } from '@/lib/utils'

export async function GET(request: Request) {
  try {
    const user = await getUserFromRequest(request)
    if (!user) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const status = searchParams.get('status')

    const where: Record<string, unknown> = user.role === 'admin' ? {} : { userId: user.userId }
    if (status) where.status = status

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where,
        include: { items: true, user: { select: { id: true, name: true, email: true } } },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.order.count({ where }),
    ])
    return NextResponse.json({
      success: true,
      data: orders,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    })
  } catch (error) {
    console.error('Get orders error:', error)
    return NextResponse.json({ success: false, error: 'Đã xảy ra lỗi' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const user = await getUserFromRequest(request)
    if (!user) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    const body = await request.json()

    // Get cart items
    const cartItems = await prisma.cartItem.findMany({
      where: { userId: user.userId },
      include: { product: { include: { images: { where: { isPrimary: true } } } } },
    })
    if (cartItems.length === 0) {
      return NextResponse.json({ success: false, error: 'Giỏ hàng trống' }, { status: 400 })
    }

    const totalAmount = cartItems.reduce((acc, item) => {
      const price = item.product.salePrice || item.product.price
      return acc + price * item.quantity
    }, 0)

    const order = await prisma.order.create({
      data: {
        orderNumber: generateOrderNumber(),
        userId: user.userId,
        totalAmount,
        shippingFee: body.shippingFee || 0,
        discount: body.discount || 0,
        paymentMethod: body.paymentMethod || 'cod',
        shippingName: body.shippingName,
        shippingPhone: body.shippingPhone,
        shippingAddress: body.shippingAddress,
        shippingCity: body.shippingCity,
        shippingDistrict: body.shippingDistrict || '',
        note: body.note || '',
        items: {
          create: cartItems.map((item) => ({
            productId: item.productId,
            quantity: item.quantity,
            price: item.product.salePrice || item.product.price,
            name: item.product.name,
            image: item.product.images[0]?.url || '',
          })),
        },
      },
      include: { items: true },
    })

    // Update stock
    for (const item of cartItems) {
      await prisma.product.update({
        where: { id: item.productId },
        data: { stock: { decrement: item.quantity } },
      })
    }

    // Clear cart
    await prisma.cartItem.deleteMany({ where: { userId: user.userId } })

    return NextResponse.json({ success: true, data: order }, { status: 201 })
  } catch (error) {
    console.error('Create order error:', error)
    return NextResponse.json({ success: false, error: 'Đã xảy ra lỗi' }, { status: 500 })
  }
}
