// prisma/seed.ts
import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  // Crear roles
  const adminRole = await prisma.role.upsert({
    where: { name: 'ADMIN' },
    update: {},
    create: {
      name: 'ADMIN',
      description: 'Administrator with full access',
    },
  });

  const userRole = await prisma.role.upsert({
    where: { name: 'USER' },
    update: {},
    create: {
      name: 'USER',
      description: 'Regular user',
    },
  });

  const memberRole = await prisma.role.upsert({
    where: { name: 'MEMBER' },
    update: {},
    create: {
      name: 'MEMBER',
      description: 'Premium member with special prices',
    },
  });

  // Crear permisos
  const permissions = [
    // User permissions
    'user:create',
    'user:read',
    'user:update',
    'user:delete',
    // Product permissions
    'product:create',
    'product:read',
    'product:update',
    'product:delete',
    // Purchase permissions
    'purchase:create',
    'purchase:read',
    'purchase:update',
    'purchase:delete',
    // Supermarket permissions
    'supermarket:create',
    'supermarket:read',
    'supermarket:update',
    'supermarket:delete',
    // Category permissions
    'category:create',
    'category:read',
    'category:update',
    'category:delete',
    // Brand permissions
    'brand:create',
    'brand:read',
    'brand:update',
    'brand:delete',
  ];

  for (const permName of permissions) {
    await prisma.permission.upsert({
      where: { name: permName },
      update: {},
      create: { name: permName },
    });
  }

  // Asignar todos los permisos al rol ADMIN
  const allPermissions = await prisma.permission.findMany();
  for (const permission of allPermissions) {
    await prisma.rolePermission.upsert({
      where: {
        roleId_permissionId: {
          roleId: adminRole.id,
          permissionId: permission.id,
        },
      },
      update: {},
      create: {
        roleId: adminRole.id,
        permissionId: permission.id,
      },
    });
  }

  // Asignar permisos básicos al rol USER
  const userPermissions = ['product:read', 'purchase:create', 'purchase:read'];
  for (const permName of userPermissions) {
    const permission = await prisma.permission.findUnique({
      where: { name: permName },
    });
    if (permission) {
      await prisma.rolePermission.upsert({
        where: {
          roleId_permissionId: {
            roleId: userRole.id,
            permissionId: permission.id,
          },
        },
        update: {},
        create: {
          roleId: userRole.id,
          permissionId: permission.id,
        },
      });
    }
  }

  // Crear usuario admin por defecto
  const adminPassword = await bcrypt.hash('admin123', 10);
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@example.com' },
    update: {},
    create: {
      email: 'admin@example.com',
      password: adminPassword,
      name: 'Admin User',
    },
  });

  // Asignar rol ADMIN al admin user
  await prisma.userRole.upsert({
    where: {
      userId_roleId: {
        userId: adminUser.id,
        roleId: adminRole.id,
      },
    },
    update: {},
    create: {
      userId: adminUser.id,
      roleId: adminRole.id,
    },
  });

  console.log('Seed completed!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
