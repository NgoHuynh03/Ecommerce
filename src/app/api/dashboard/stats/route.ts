import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { getUserFromRequest } from '@/lib/auth'

export async function GET(request: Request) {
  try {
    const user = await getUserFromRequest(request)
    if (!user || user.role !== 'admin') return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 403 })

    const [totalOrders, totalProducts, totalUsers, totalRevenue, recentOrders, ordersByStatus] = await Promise.all([
      prisma.order.count(),
      prisma.product.count({ where: { isActive: true } }),
      prisma.user.count(),
      prisma.order.aggregate({ _sum: { totalAmount: true }, where: { paymentStatus: 'paid' } }),
      prisma.order.findMany({
        take: 8,
        orderBy: { createdAt: 'desc' },
        include: { items: true, user: { select: { id: true, name: true, email: true } } },
      }),
      prisma.order.groupBy({
        by: ['status'],
        _count: { status: true },
      }),
    ])

    // Monthly revenue (last 6 months)
    const now = new Date()
    const monthlyRevenue = []
    for (let i = 5; i >= 0; i--) {
      const start = new Date(now.getFullYear(), now.getMonth() - i, 1)
      const end = new Date(now.getFullYear(), now.getMonth() - i + 1, 0)
      const result = await prisma.order.aggregate({
        _sum: { totalAmount: true },
        where: { createdAt: { gte: start, lte: end }, paymentStatus: 'paid' },
      })
      monthlyRevenue.push({
        month: start.toLocaleDateString('vi-VN', { month: 'short', year: 'numeric' }),
        revenue: result._sum.totalAmount || 0,
      })
    }

    return NextResponse.json({
      success: true,
      data: {
        totalOrders,
        totalRevenue: totalRevenue._sum.totalAmount || 0,
        totalProducts,
        totalUsers,
        recentOrders,
        monthlyRevenue,
        ordersByStatus: ordersByStatus.map((o) => ({ status: o.status, count: o._count.status })),
      },
    })
  } catch (error) {
    console.error('Get dashboard stats error:', error)
    return NextResponse.json({ success: false, error: 'Đã xảy ra lỗi' }, { status: 500 })
  }
}
