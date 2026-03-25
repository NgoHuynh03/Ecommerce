import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { getUserFromRequest } from '@/lib/auth'

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const category = await prisma.category.findFirst({
      where: { OR: [{ id }, { slug: id }] },
      include: { children: true, _count: { select: { products: true } } },
    })
    if (!category) {
      return NextResponse.json({ success: false, error: 'Danh mục không tồn tại' }, { status: 404 })
    }
    return NextResponse.json({ success: true, data: category })
  } catch (error) {
    console.error('Get category error:', error)
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
    const category = await prisma.category.update({
      where: { id },
      data: { name: body.name, slug: body.slug, description: body.description, image: body.image, parentId: body.parentId, isActive: body.isActive, sortOrder: body.sortOrder },
    })
    return NextResponse.json({ success: true, data: category })
  } catch (error) {
    console.error('Update category error:', error)
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
    await prisma.category.delete({ where: { id } })
    return NextResponse.json({ success: true, message: 'Đã xóa danh mục' })
  } catch (error) {
    console.error('Delete category error:', error)
    return NextResponse.json({ success: false, error: 'Đã xảy ra lỗi' }, { status: 500 })
  }
}
