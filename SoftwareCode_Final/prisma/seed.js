const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const parks = [
  { parkId: 1n, name: 'Santubong National Park', dailyCapacity: 100, location: 'Kuching', status: 'OPEN' },
  { parkId: 2n, name: 'Bako National Park', dailyCapacity: 150, location: 'Kuching', status: 'OPEN' },
  { parkId: 3n, name: 'Gunung Mulu National Park', dailyCapacity: 50, location: 'Miri', status: 'CLOSED' },
  { parkId: 4n, name: 'Kinabalu Park', dailyCapacity: 300, location: 'Sabah', status: 'OPEN' },
  { parkId: 5n, name: 'Tunku Abdul Rahman Park', dailyCapacity: 220, location: 'Sabah', status: 'OPEN' },
  { parkId: 6n, name: 'Endau-Rompin National Park', dailyCapacity: 180, location: 'Johor', status: 'OPEN' },
  { parkId: 7n, name: 'Kuching Wetlands', dailyCapacity: 90, location: 'Kuching', status: 'OPEN' },
  { parkId: 8n, name: 'Miri-Sibuti Coral Reefs', dailyCapacity: 160, location: 'Miri', status: 'OPEN' },
  { parkId: 9n, name: 'Niah National Park', dailyCapacity: 140, location: 'Miri', status: 'OPEN' },
  { parkId: 10n, name: 'Similajau National Park', dailyCapacity: 110, location: 'Bintulu', status: 'OPEN' },
  { parkId: 11n, name: 'Bako Rainforest Reserve', dailyCapacity: 130, location: 'Kuching', status: 'OPEN' },
  { parkId: 12n, name: 'Danum Valley', dailyCapacity: 80, location: 'Sabah', status: 'OPEN' },
  { parkId: 13n, name: 'Tabin Wildlife Reserve', dailyCapacity: 95, location: 'Sabah', status: 'OPEN' },
  { parkId: 14n, name: 'Gunung Gading National Park', dailyCapacity: 75, location: 'Lundu', status: 'OPEN' },
  { parkId: 15n, name: 'Matang Wildlife Centre', dailyCapacity: 85, location: 'Kuching', status: 'OPEN' },
  { parkId: 16n, name: 'Lambir Hills National Park', dailyCapacity: 120, location: 'Miri', status: 'OPEN' },
  { parkId: 17n, name: 'Loagan Bunut National Park', dailyCapacity: 70, location: 'Miri', status: 'OPEN' },
  { parkId: 18n, name: 'Mulu Pinnacles Reserve', dailyCapacity: 60, location: 'Miri', status: 'OPEN' },
  { parkId: 19n, name: 'Tasek Merimbun', dailyCapacity: 90, location: 'Tutong', status: 'OPEN' },
  { parkId: 20n, name: 'Ulu Temburong', dailyCapacity: 100, location: 'Temburong', status: 'OPEN' },
  { parkId: 21n, name: 'Royal Belum State Park', dailyCapacity: 150, location: 'Perak', status: 'OPEN' },
  { parkId: 22n, name: 'Taman Negara', dailyCapacity: 250, location: 'Pahang', status: 'OPEN' },
  { parkId: 23n, name: 'Kuala Selangor Nature Park', dailyCapacity: 120, location: 'Selangor', status: 'OPEN' }
];

const products = [
  { productId: 1n, productName: 'Santubong Adult Ticket', unitPrice: '25.00', type: 'TICKET', parkId: 1n },
  { productId: 2n, productName: 'Bako Adult Ticket', unitPrice: '30.00', type: 'TICKET', parkId: 2n },
  { productId: 3n, productName: 'Mulu Cave Pass', unitPrice: '50.00', type: 'TICKET', parkId: 3n },
  { productId: 4n, productName: 'Rainforest T-Shirt', unitPrice: '55.00', type: 'MERCH', parkId: null },
  { productId: 5n, productName: 'Wildlife Sticker Pack', unitPrice: '8.00', type: 'MERCH', parkId: null }
];

const users = [
  { userId: 1n, email: 'user1@example.com', passwordHash: 'hashed_password_123', fullName: 'Test Visitor' }
];

async function main() {
  await prisma.ticket.deleteMany();
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.product.deleteMany();
  await prisma.park.deleteMany();
  await prisma.user.deleteMany();

  await prisma.user.createMany({ data: users });
  await prisma.park.createMany({ data: parks });
  await prisma.product.createMany({ data: products });

  console.log('Seeding completed.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
