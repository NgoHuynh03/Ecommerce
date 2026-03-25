import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { getUserFromRequest } from '@/lib/auth'

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const product = await prisma.product.findFirst({
      where: { OR: [{ id }, { slug: id }] },
      include: {
        images: { orderBy: { sortOrder: 'asc' } },
        category: true,
        reviews: {
          include: { user: { select: { id: true, name: true, avatar: true } } },
          where: { isApproved: true },
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
      },
    })
    if (!product) {
      return NextResponse.json({ success: false, error: 'Sản phẩm không tồn tại' }, { status: 404 })
    }
    // Get related products
    const related = await prisma.product.findMany({
      where: { categoryId: product.categoryId, id: { not: product.id }, isActive: true },
      include: { images: { where: { isPrimary: true } }, category: true },
      take: 8,
    })
    return NextResponse.json({ success: true, data: { ...product, relatedProducts: related } })
  } catch (error) {
    console.error('Get product error:', error)
    return NextResponse.json({ success: false, error: 'Đã xảy ra lỗi' }, { status: 500 })
  }
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await getUserFromRequest(request)
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 403 })
    }
    const { id } = await params
    const body = await request.json()
    // Delete old images if new ones provided
    if (body.images) {
      await prisma.productImage.deleteMany({ where: { productId: id } })
    }
    const product = await prisma.product.update({
      where: { id },
      data: {
        name: body.name,
        slug: body.slug,
        description: body.description,
        price: body.price,
        salePrice: body.salePrice || null,
        sku: body.sku,
        stock: body.stock,
        categoryId: body.categoryId,
        brand: body.brand,
        isFeatured: body.isFeatured,
        isActive: body.isActive,
        images: body.images ? {
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
    return NextResponse.json({ success: true, data: product })
  } catch (error) {
    console.error('Update product error:', error)
    return NextResponse.json({ success: false, error: 'Đã xảy ra lỗi' }, { status: 500 })
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await getUserFromRequest(request)
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 403 })
    }
    const { id } = await params
    await prisma.product.delete({ where: { id } })
    return NextResponse.json({ success: true, message: 'Đã xóa sản phẩm' })
  } catch (error) {
    console.error('Delete product error:', error)
    return NextResponse.json({ success: false, error: 'Đã xảy ra lỗi' }, { status: 500 })
  }
}
