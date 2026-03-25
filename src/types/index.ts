export interface User {
  id: string
  email: string
  name: string
  phone?: string
  avatar?: string
  role: string
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface Category {
  id: string
  name: string
  slug: string
  description?: string
  image?: string
  parentId?: string
  parent?: Category
  children?: Category[]
  isActive: boolean
  sortOrder: number
  _count?: { products: number }
}

export interface ProductImage {
  id: string
  url: string
  alt?: string
  isPrimary: boolean
  sortOrder: number
}

export interface Product {
  id: string
  name: string
  slug: string
  description: string
  price: number
  salePrice?: number
  sku: string
  stock: number
  categoryId: string
  category?: Category
  brand?: string
  isFeatured: boolean
  isActive: boolean
  rating: number
  reviewCount: number
  images: ProductImage[]
  createdAt: string
  updatedAt: string
}

export interface CartItem {
  id: string
  userId: string
  productId: string
  product: Product
  quantity: number
}

export interface OrderItem {
  id: string
  productId: string
  product?: Product
  quantity: number
  price: number
  name: string
  image?: string
}

export interface Order {
  id: string
  orderNumber: string
  userId: string
  user?: User
  status: string
  totalAmount: number
  shippingFee: number
  discount: number
  paymentMethod: string
  paymentStatus: string
  note?: string
  shippingName: string
  shippingPhone: string
  shippingAddress: string
  shippingCity: string
  shippingDistrict?: string
  items: OrderItem[]
  createdAt: string
  updatedAt: string
}

export interface Review {
  id: string
  userId: string
  user?: User
  productId: string
  product?: Product
  rating: number
  comment: string
  isApproved: boolean
  createdAt: string
}

export interface Address {
  id: string
  name: string
  phone: string
  address: string
  city: string
  district?: string
  ward?: string
  isDefault: boolean
}

export interface DashboardStats {
  totalOrders: number
  totalRevenue: number
  totalProducts: number
  totalUsers: number
  recentOrders: Order[]
  monthlyRevenue: { month: string; revenue: number }[]
  ordersByStatus: { status: string; count: number }[]
}

export interface ApiResponse<T = unknown> {
  success: boolean
  data?: T
  error?: string
  message?: string
  pagination?: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}
