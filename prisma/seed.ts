const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function main() {
  console.log('Seeding database...')

  // 1. Admin User
  const hashedPassword = await bcrypt.hash('admin123', 10)
  const admin = await prisma.user.upsert({
    where: { email: 'admin@shop.com' },
    update: {},
    create: {
      email: 'admin@shop.com',
      password: hashedPassword,
      name: 'Admin ShopVN',
      role: 'admin',
    },
  })
  console.log('Admin created:', admin.email)

  // 2. Categories
  const categoriesData = [
    { name: 'Điện thoại - Máy tính bảng', slug: 'dien-thoai-may-tinh-bang', icon: '📱' },
    { name: 'Điện tử - Điện lạnh', slug: 'dien-tu-dien-lanh', icon: '📺' },
    { name: 'Thời trang', slug: 'thoi-trang', icon: '👕' },
    { name: 'Nhà cửa - Đời sống', slug: 'nha-cua-doi-song', icon: '🏠' },
    { name: 'Sách', slug: 'sach', icon: '📚' },
  ]

  const createdCategories = []
  for (const cat of categoriesData) {
    const created = await prisma.category.upsert({
      where: { slug: cat.slug },
      update: {},
      create: { name: cat.name, slug: cat.slug, image: cat.icon },
    })
    createdCategories.push(created)
  }
  console.log('Categories created:', createdCategories.length)

  // 3. Products
  const phonesCategory = createdCategories.find(c => c.slug === 'dien-thoai-may-tinh-bang')
  const fashionCategory = createdCategories.find(c => c.slug === 'thoi-trang')
  const houseCategory = createdCategories.find(c => c.slug === 'nha-cua-doi-song')

  if (!phonesCategory || !fashionCategory || !houseCategory) {
    throw new Error('Categories not found')
  }

  const productsData = [
    // Phones
    {
      name: 'iPhone 15 Pro Max 256GB',
      slug: 'iphone-15-pro-max-256gb',
      description: 'iPhone 15 Pro Max. Màn hình Super Retina XDR 6.7 inch. Thiết kế titan bền bỉ và nhẹ với các cạnh thuôn tròn. Phím Tác Vụ mới. Camera Chính 48MP siêu phân giải. Chip A17 Pro cực bốc.',
      price: 34990000,
      salePrice: 32990000,
      sku: 'IP15PM256',
      stock: 50,
      brand: 'Apple',
      categoryId: phonesCategory.id,
      images: ['https://cdn.tgdd.vn/Products/Images/42/305658/iphone-15-pro-max-blue-thumbnew-600x600.jpg'],
      rating: 4.8,
      reviewCount: 124,
      isFeatured: true
    },
    {
      name: 'Samsung Galaxy S24 Ultra 5G',
      slug: 'samsung-galaxy-s24-ultra-5g',
      description: 'Samsung Galaxy S24 Ultra với AI thế hệ mới, khung viền Titan cao cấp. Camera 200MP siêu zoom.',
      price: 33990000,
      salePrice: null,
      sku: 'SAMS24U',
      stock: 30,
      brand: 'Samsung',
      categoryId: phonesCategory.id,
      images: ['https://cdn.tgdd.vn/Products/Images/42/307174/samsung-galaxy-s24-ultra-grey-thumb-600x600.jpg'],
      rating: 4.5,
      reviewCount: 56,
      isFeatured: true
    },
    {
      name: 'MacBook Air M3 2024 8GB/256GB',
      slug: 'macbook-air-m3-2024',
      description: 'MacBook Air M3 mỏng nhẹ, thiết kế xịn sò, sức mạnh từ chip M3 mới nhất của Apple.',
      price: 27990000,
      salePrice: 26500000,
      sku: 'MBAM3256',
      stock: 45,
      brand: 'Apple',
      categoryId: phonesCategory.id,
      images: ['https://cdn.tgdd.vn/Products/Images/44/322617/macbook-air-m3-2024-15-inch-bac-thumb-600x600.jpg'],
      rating: 4.9,
      reviewCount: 89,
      isFeatured: true
    },
    
    // Fashion
    {
      name: 'Áo Thun Nam Cotton Form Rộng Trơn',
      slug: 'ao-thun-nam-cotton-form-rong-tron',
      description: 'Áo thun nam định lượng 250gsm, chất liệu 100% cotton thoáng mát, form dáng loose fit trẻ trung.',
      price: 250000,
      salePrice: 149000,
      sku: 'ATN001',
      stock: 200,
      brand: 'Coolmate',
      categoryId: fashionCategory.id,
      images: ['https://media.coolmate.me/cdn-cgi/image/width=672,height=990,quality=85/uploads/February2024/7.10a_60.jpg'],
      rating: 4.6,
      reviewCount: 342,
      isFeatured: false
    },
    {
      name: 'Giày Thể Thao Sneaker Nam Nữ',
      slug: 'giay-the-thao-sneaker-nam-nu',
      description: 'Giày sneaker phong cách Hàn Quốc, thiết kế năng động, đế chống trơn trượt.',
      price: 550000,
      salePrice: 299000,
      sku: 'SNEAK01',
      stock: 150,
      brand: 'ZAVAS',
      categoryId: fashionCategory.id,
      images: ['https://down-vn.img.susercontent.com/file/vn-11134207-7qukw-ligb1a511ksze4'],
      rating: 4.2,
      reviewCount: 88,
      isFeatured: false
    },

    // House
    {
      name: 'Nồi chiên không dầu Philips HD9252/90 4.1L',
      slug: 'noi-chien-khong-dau-philips-hd9252-90',
      description: 'Nồi chiên không dầu Philips công nghệ Rapid Air giúp giảm lượng chất béo đến 90%.',
      price: 2590000,
      salePrice: 1790000,
      sku: 'PHHD9252',
      stock: 80,
      brand: 'Philips',
      categoryId: houseCategory.id,
      images: ['https://cdn.tgdd.vn/Products/Images/7366/242250/noi-chien-khong-dau-philips-hd9252-90-41-lit-1-org.jpg'],
      rating: 4.7,
      reviewCount: 215,
      isFeatured: true
    },
    {
      name: 'Máy hút bụi không dây Dreame',
      slug: 'may-hut-bui-khong-day-dreame',
      description: 'Máy hút bụi không dây cầm tay lực hút mạnh, pin trâu, đa dạng đầu hút.',
      price: 4990000,
      salePrice: 3890000,
      sku: 'DREAMEV12',
      stock: 25,
      brand: 'Dreame',
      categoryId: houseCategory.id,
      images: ['https://cdn.tgdd.vn/Products/Images/7533/305561/may-hut-bui-khong-day-dreame-v12-pro-1-1.jpg'],
      rating: 4.4,
      reviewCount: 67,
      isFeatured: false
    }
  ]

  let count = 0
  for (const productData of productsData) {
    const images = productData.images
    delete productData.images
    
    // Check if product exists
    const existing = await prisma.product.findUnique({
      where: { slug: productData.slug }
    })

    if (!existing) {
      const created = await prisma.product.create({
        data: productData
      })

      // Add images
      for (let i = 0; i < images.length; i++) {
        await prisma.productImage.create({
          data: {
            url: images[i],
            productId: created.id,
            isPrimary: i === 0,
            sortOrder: i
          }
        })
      }
      count++
    }
  }
  
  console.log(`Products created: ${count}`)
  console.log('Seed completed successfully.')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
