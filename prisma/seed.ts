import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Create admin user
  const adminPassword = 'admin123';
  const admin = await prisma.user.upsert({
    where: { email: 'admin@pearlscollection.com' },
    update: {},
    create: {
      name: 'Admin User',
      email: 'admin@pearlscollection.com',
      password: adminPassword,
      role: "ADMIN",
    },
  });

  // Create demo user
  const userPassword = 'user123';
  const demoUser = await prisma.user.upsert({
    where: { email: 'demo@pearlscollection.com' },
    update: {},
    create: {
      name: 'Maria Santos',
      email: 'demo@pearlscollection.com',
      password: userPassword,
      role: "USER",
    },
  });

  // Pickup location
  await prisma.pickupLocation.upsert({
    where: { id: 'main-location' },
    update: {},
    create: {
      id: 'main-location',
      name: "Pearl's Clothing Collection Main Store",
      address: '123 Ayala Avenue, Makati City, Metro Manila, Philippines',
      latitude: 14.5547,
      longitude: 121.0244,
      notes: 'Located at the ground floor of Ayala Tower One. Look for the red signage near the main entrance. Parking available at the basement.',
      openingHours: JSON.stringify({
        monday: '9:00 AM - 8:00 PM',
        tuesday: '9:00 AM - 8:00 PM',
        wednesday: '9:00 AM - 8:00 PM',
        thursday: '9:00 AM - 8:00 PM',
        friday: '9:00 AM - 9:00 PM',
        saturday: '10:00 AM - 9:00 PM',
        sunday: '10:00 AM - 6:00 PM',
      }),
    },
  });

  // Products
  const products: any[] = [
    {
      name: 'Ivory Silk Evening Gown',
      slug: 'ivory-silk-evening-gown',
      description: 'A breathtaking floor-length gown crafted from pure mulberry silk. Features a sweetheart neckline, delicate ruching at the waist, and an elegant train. Perfect for galas, black-tie events, and formal weddings.',
      category: 'Gowns',
      size: 'M',
      color: 'Ivory',
      fabric: 'Pure Mulberry Silk',
      occasion: 'Black Tie, Gala, Wedding',
      images: JSON.stringify([
        'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=800',
        'https://images.unsplash.com/photo-1566174053879-31528523f8ae?w=800',
        'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=800',
      ]),
      pricePerDay: 2500,
      status: "AVAILABLE",
      tags: JSON.stringify(['gown', 'silk', 'evening', 'formal', 'wedding', 'ivory']),
    },
    {
      name: 'Midnight Navy Suit',
      slug: 'midnight-navy-suit',
      description: 'A perfectly tailored three-piece suit in rich midnight navy. The jacket features slim lapels, double-button closure, and a subtle herringbone weave. Includes matching vest and flat-front trousers.',
      category: 'Suits',
      size: 'L',
      color: 'Midnight Navy',
      fabric: 'Italian Wool Blend',
      occasion: 'Business, Wedding, Formal Events',
      images: JSON.stringify([
        'https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=800',
        'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=800',
        'https://images.unsplash.com/photo-1490144142486-4f8773ce58f3?w=800',
      ]),
      pricePerDay: 1800,
      status: "AVAILABLE",
      tags: JSON.stringify(['suit', 'wool', 'formal', 'navy', 'business', 'wedding']),
    },
    {
      name: 'Blush Chiffon Cocktail Dress',
      slug: 'blush-chiffon-cocktail-dress',
      description: 'An effortlessly elegant cocktail dress in soft blush chiffon. Features a V-neckline, flutter sleeves, and a midi-length silhouette with subtle floral embroidery at the hem.',
      category: 'Dresses',
      size: 'S',
      color: 'Blush Pink',
      fabric: 'Chiffon with Lace Detail',
      occasion: 'Cocktail, Semi-Formal, Garden Party',
      images: JSON.stringify([
        'https://images.unsplash.com/photo-1539008835657-9e8e9680c956?w=800',
        'https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=800',
        'https://images.unsplash.com/photo-1612336307429-8a898d10e223?w=800',
      ]),
      pricePerDay: 1200,
      status: "AVAILABLE",
      tags: JSON.stringify(['dress', 'chiffon', 'cocktail', 'blush', 'semiformal']),
    },
    {
      name: 'Emerald Velvet Blazer',
      slug: 'emerald-velvet-blazer',
      description: 'A statement-making blazer in rich emerald velvet. Features peak lapels, gold-toned buttons, and a tailored fit. Can be styled for both formal and smart-casual occasions.',
      category: 'Blazers',
      size: 'M',
      color: 'Emerald Green',
      fabric: 'Premium Velvet',
      occasion: 'Smart Casual, Party, Dinner',
      images: JSON.stringify([
        'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=800',
        'https://images.unsplash.com/photo-1520367745676-56196632073f?w=800',
        'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800',
      ]),
      pricePerDay: 900,
      status: "AVAILABLE",
      tags: JSON.stringify(['blazer', 'velvet', 'emerald', 'party', 'dinner']),
    },
    {
      name: 'Champagne Sequin Mini Dress',
      slug: 'champagne-sequin-mini-dress',
      description: 'Shimmer and shine in this stunning champagne sequin mini dress. All-over sequin embellishment, fitted silhouette, and a playful fringe hem make this the ultimate party piece.',
      category: 'Dresses',
      size: 'XS',
      color: 'Champagne Gold',
      fabric: 'Sequin Mesh',
      occasion: 'New Year, Party, Club',
      images: JSON.stringify([
        'https://images.unsplash.com/photo-1600950207944-0d63e8edbc3f?w=800',
        'https://images.unsplash.com/photo-1576995853123-5a10305d93c0?w=800',
        'https://images.unsplash.com/photo-1567401893414-76b7b1e5a7a5?w=800',
      ]),
      pricePerDay: 1500,
      status: "RESERVED",
      tags: JSON.stringify(['dress', 'sequin', 'party', 'mini', 'gold', 'club']),
    },
    {
      name: 'Classic Black Tuxedo',
      slug: 'classic-black-tuxedo',
      description: 'The quintessential formal look. This classic black tuxedo features a satin peak lapel, single-button closure, and matching satin-trimmed trousers. Includes bow tie and pocket square.',
      category: 'Suits',
      size: 'XL',
      color: 'Jet Black',
      fabric: 'Wool with Satin Accents',
      occasion: 'Black Tie, Gala, Prom',
      images: JSON.stringify([
        'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=800',
        'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=800',
        'https://images.unsplash.com/photo-1548142813-c348350df52b?w=800',
      ]),
      pricePerDay: 2000,
      status: "AVAILABLE",
      tags: JSON.stringify(['tuxedo', 'black', 'formal', 'blacktie', 'prom', 'gala']),
    },
    {
      name: 'Powder Blue Barong Tagalog',
      slug: 'powder-blue-barong-tagalog',
      description: 'An exquisitely embroidered Barong Tagalog in delicate powder blue piña fabric. Features intricate floral embroidery on the front panel, Mandarin collar, and traditional placket buttons.',
      category: 'Traditional',
      size: 'L',
      color: 'Powder Blue',
      fabric: 'Piña (Pineapple Fiber)',
      occasion: 'Filipino Formal, Wedding, Cultural Events',
      images: JSON.stringify([
        'https://images.unsplash.com/photo-1622290291468-a28f7a7dc6a8?w=800',
        'https://images.unsplash.com/photo-1588117305388-c2631a279f82?w=800',
        'https://images.unsplash.com/photo-1603217192634-61068e4d4bf9?w=800',
      ]),
      pricePerDay: 1600,
      status: "AVAILABLE",
      tags: JSON.stringify(['barong', 'tagalog', 'filipino', 'traditional', 'pina', 'wedding']),
    },
    {
      name: 'Crimson Satin Wrap Dress',
      slug: 'crimson-satin-wrap-dress',
      description: 'A sophisticated wrap dress in lustrous crimson satin. The adjustable wrap creates a universally flattering silhouette with a plunging neckline, midi length, and subtle high-low hem.',
      category: 'Dresses',
      size: 'L',
      color: 'Crimson Red',
      fabric: 'Satin',
      occasion: 'Date Night, Cocktail, Semi-Formal',
      images: JSON.stringify([
        'https://images.unsplash.com/photo-1585487000160-6ebcfceb0d03?w=800',
        'https://images.unsplash.com/photo-1529139574466-a303027c1d8b?w=800',
        'https://images.unsplash.com/photo-1496747611176-843222e1e57c?w=800',
      ]),
      pricePerDay: 1100,
      status: "AVAILABLE",
      tags: JSON.stringify(['dress', 'satin', 'red', 'wrap', 'cocktail', 'dinner']),
    },
  ];

  for (const product of products) {
    await prisma.product.upsert({
      where: { slug: product.slug },
      update: {},
      create: product,
    });
  }

  console.log('✅ Seeding complete!');
  console.log('');
  console.log('👤 Admin: admin@pearlscollection.com / admin123');
  console.log('👤 Demo User: demo@pearlscollection.com / user123');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
