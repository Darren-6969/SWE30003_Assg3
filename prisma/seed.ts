import { Prisma, PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const parks = [
  { 
    parkId: BigInt(1), 
    name: "Santubong National Park", 
    dailyCapacity: 100, 
    location: "Kuching", 
    status: "OPEN" 
  },
  { 
    parkId: BigInt(2), 
    name: "Bako National Park", 
    dailyCapacity: 150, 
    location: "Kuching", 
    status: "OPEN" 
  },
  { 
    parkId: BigInt(3), 
    name: "Gunung Mulu National Park", 
    dailyCapacity: 50, 
    location: "Miri", 
    status: "CLOSED" 
  },
  { parkId: BigInt(4), name: "Kinabalu Park", dailyCapacity: 300, location: "Sabah", status: "OPEN" },
  { parkId: BigInt(5), name: "Tunku Abdul Rahman Park", dailyCapacity: 220, location: "Sabah", status: "OPEN" },
  { parkId: BigInt(6), name: "Endau-Rompin National Park", dailyCapacity: 180, location: "Johor", status: "OPEN" },
  { parkId: BigInt(7), name: "Kuching Wetlands", dailyCapacity: 90, location: "Kuching", status: "OPEN" },
  { parkId: BigInt(8), name: "Miri-Sibuti Coral Reefs", dailyCapacity: 160, location: "Miri", status: "OPEN" },
  { parkId: BigInt(9), name: "Niah National Park", dailyCapacity: 140, location: "Miri", status: "OPEN" },
  { parkId: BigInt(10), name: "Similajau National Park", dailyCapacity: 110, location: "Bintulu", status: "OPEN" },
  { parkId: BigInt(11), name: "Bako Rainforest Reserve", dailyCapacity: 130, location: "Kuching", status: "OPEN" },
  { parkId: BigInt(12), name: "Danum Valley", dailyCapacity: 80, location: "Sabah", status: "OPEN" },
  { parkId: BigInt(13), name: "Tabin Wildlife Reserve", dailyCapacity: 95, location: "Sabah", status: "OPEN" },
  { parkId: BigInt(14), name: "Gunung Gading National Park", dailyCapacity: 75, location: "Lundu", status: "OPEN" },
  { parkId: BigInt(15), name: "Matang Wildlife Centre", dailyCapacity: 85, location: "Kuching", status: "OPEN" },
  { parkId: BigInt(16), name: "Lambir Hills National Park", dailyCapacity: 120, location: "Miri", status: "OPEN" },
  { parkId: BigInt(17), name: "Loagan Bunut National Park", dailyCapacity: 70, location: "Miri", status: "OPEN" },
  { parkId: BigInt(18), name: "Mulu Pinnacles Reserve", dailyCapacity: 60, location: "Miri", status: "OPEN" },
  { parkId: BigInt(19), name: "Tasek Merimbun", dailyCapacity: 90, location: "Tutong", status: "OPEN" },
  { parkId: BigInt(20), name: "Ulu Temburong", dailyCapacity: 100, location: "Temburong", status: "OPEN" },
  { parkId: BigInt(21), name: "Royal Belum State Park", dailyCapacity: 150, location: "Perak", status: "OPEN" },
  { parkId: BigInt(22), name: "Taman Negara", dailyCapacity: 250, location: "Pahang", status: "OPEN" },
  { parkId: BigInt(23), name: "Kuala Selangor Nature Park", dailyCapacity: 120, location: "Selangor", status: "OPEN" }
];

const products = [
  { 
    productId: BigInt(1), 
    productName: "Santubong Adult Ticket", 
    unitPrice: new Prisma.Decimal(25.00), 
    type: "TICKET", 
    parkId: BigInt(1) 
  },
  { 
    productId: BigInt(2), 
    productName: "Bako Adult Ticket", 
    unitPrice: new Prisma.Decimal(30.00), 
    type: "TICKET", 
    parkId: BigInt(2) 
  },
  { 
    productId: BigInt(3), 
    productName: "Mulu Cave Pass", 
    unitPrice: new Prisma.Decimal(50.00), 
    type: "TICKET", 
    parkId: BigInt(3) 
  },
  { 
    productId: BigInt(4), 
    productName: "Rainforest T-Shirt", 
    unitPrice: new Prisma.Decimal(55.00), 
    type: "MERCH", 
    parkId: null 
  },
  { 
    productId: BigInt(5), 
    productName: "Wildlife Sticker Pack", 
    unitPrice: new Prisma.Decimal(8.00), 
    type: "MERCH", 
    parkId: null 
  },
];

const users = [
  {
    userId: BigInt(1),
    email: "user1@example.com",
    passwordHash: "hashed_password_123", 
    fullName: "Test Visitor",
  }
];

async function main() {
  await prisma.ticket.deleteMany({});
  await prisma.orderItem.deleteMany({});
  await prisma.order.deleteMany({});
  await prisma.product.deleteMany({});
  await prisma.park.deleteMany({});
  await prisma.user.deleteMany({});

  await prisma.user.createMany({ data: users });
  await prisma.park.createMany({ data: parks });
  await prisma.product.createMany({ data: products });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
