import "dotenv/config";
import { PrismaClient, Role } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcryptjs";

const adapter = new PrismaPg({
  connectionString: process.env.DIRECT_URL!,
});

const prisma = new PrismaClient({
  adapter,
});

async function main() {
  const email = "admin@example.com";
  const password = "Admin@123";

  const hashedPassword = await bcrypt.hash(password, 10);

  const existingAdmin = await prisma.user.findUnique({
    where: {
      email,
    },
  });

  if (existingAdmin) {
    console.log("Admin user already exists");
    return;
  }

  await prisma.user.create({
    data: {
      name: "Admin User",
      email,
      password: hashedPassword,
      role: Role.ADMIN,
      isActive: true,
    },
  });

  console.log("Admin user created successfully");
  console.log(`Email: ${email}`);
  console.log(`Password: ${password}`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });