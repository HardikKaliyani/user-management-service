import { PrismaClient, Role } from '@prisma/client';
import { hashPassword } from '../src/utils/password.util';

const prisma = new PrismaClient();

async function main() {
  console.log('Starting database seed...');

  // Create admin user
  const adminEmail = 'admin@example.com';
  const existingAdmin = await prisma.user.findUnique({
    where: { email: adminEmail },
  });

  if (!existingAdmin) {
    const hashedPassword = await hashPassword('Admin@123');
    const admin = await prisma.user.create({
      data: {
        email: adminEmail,
        name: 'Admin User',
        password: hashedPassword,
        role: Role.ADMIN,
      },
    });
    console.log(`Created admin user: ${admin.email}`);
  } else {
    console.log(`Admin user already exists: ${adminEmail}`);
  }

  // Create regular user
  const userEmail = 'user@example.com';
  const existingUser = await prisma.user.findUnique({
    where: { email: userEmail },
  });

  if (!existingUser) {
    const hashedPassword = await hashPassword('User@123');
    const user = await prisma.user.create({
      data: {
        email: userEmail,
        name: 'Regular User',
        password: hashedPassword,
        role: Role.USER,
      },
    });
    console.log(`Created regular user: ${user.email}`);
  } else {
    console.log(`Regular user already exists: ${userEmail}`);
  }

  console.log('Database seed completed.');
}

main()
  .catch((e) => {
    console.error('Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });