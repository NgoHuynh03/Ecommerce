import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { getUserFromRequest } from '@/lib/auth'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '12')
    const category = searchParams.get('category')
    const search = searchParams.get('search')
    const sort = searchParams.get('sort') || 'newest'
    const featured = searchParams.get('featured')
    const minPrice = searchParams.get('minPrice')
    const maxPrice = searchParams.get('maxPrice')

    const where: Record<string, unknown> = { isActive: true }

    if (category) where.category = { slug: category }
    if (search) where.name = { contains: search }
    if (featured === 'true') where.isFeatured = true
    if (minPrice) where.price = { ...(where.price as object || {}), gte: parseFloat(minPrice) }
    if (maxPrice) where.price = { ...(where.price as object || {}), lte: parseFloat(maxPrice) }

    const orderBy: Record<string, string> = {}
    switch (sort) {
      case 'price-asc': orderBy.price = 'asc'; break
      case 'price-desc': orderBy.price = 'desc'; break
      case 'name': orderBy.name = 'asc'; break
      case 'rating': orderBy.rating = 'desc'; break
      case 'bestselling': orderBy.reviewCount = 'desc'; break
      default: orderBy.createdAt = 'desc'
    }

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        include: { images: { orderBy: { sortOrder: 'asc' } }, category: true },
        orderBy,
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.product.count({ where }),
    ])

    return NextResponse.json({
      success: true,
      data: products,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    })
  } catch (error) {
    console.error('Get products error:', error)
    return NextResponse.json({ success: false, error: 'Đã xảy ra lỗi' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const user = await getUserFromRequest(request)
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 403 })
    }
    const body = await request.json()
    const product = await prisma.product.create({
      data: {
        name: body.name,
        slug: body.slug,
        description: body.description,
        price: body.price,
        salePrice: body.salePrice || null,
        sku: body.sku,
        stock: body.stock || 0,
        categoryId: body.categoryId,
        brand: body.brand || null,
        isFeatured: body.isFeatured || false,
        images: body.images?.length ? {
          create: body.images.map((img: { url: string; alt?: string; isPrimary?: boolean }, i: number) => ({
            url: img.url,
            alt: img.alt || '',
            isPrimary: img.isPrimary || i === 0,
            sortOrder: i,
          })),
        } : undefined,
      },
      include: { images: true, category: true },
    })
    return NextResponse.json({ success: true, data: product }, { status: 201 })
  } catch (error) {
    console.error('Create product error:', error)
    return NextResponse.json({ success: false, error: 'Đã xảy ra lỗi' }, { status: 500 })
  }
}
