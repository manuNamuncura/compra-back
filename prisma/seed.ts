// prisma/seed.ts
import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting seed...');

  // ============================================
  // 1. CREAR ROLES
  // ============================================
  console.log('📝 Creating roles...');

  const adminRole = await prisma.role.upsert({
    where: { name: 'ADMIN' },
    update: {},
    create: {
      name: 'ADMIN',
      description: 'Administrator with full access to all resources',
    },
  });

  const userRole = await prisma.role.upsert({
    where: { name: 'USER' },
    update: {},
    create: {
      name: 'USER',
      description: 'Regular user with basic permissions',
    },
  });

  const memberRole = await prisma.role.upsert({
    where: { name: 'MEMBER' },
    update: {},
    create: {
      name: 'MEMBER',
      description: 'Premium member with special prices and additional features',
    },
  });

  console.log('✅ Roles created:', { adminRole, userRole, memberRole });

  // ============================================
  // 2. CREAR PERMISOS
  // ============================================
  console.log('📝 Creating permissions...');

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

  console.log('✅ Permissions created:', permissions.length);

  // ============================================
  // 3. ASIGNAR PERMISOS A ROLES
  // ============================================

  // ADMIN: Todos los permisos
  console.log('📝 Assigning all permissions to ADMIN role...');

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
  console.log(`✅ ${allPermissions.length} permissions assigned to ADMIN`);

  // USER: Permisos básicos
  console.log('📝 Assigning basic permissions to USER role...');

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
  console.log(`✅ ${userPermissions.length} permissions assigned to USER`);

  // MEMBER: Permisos básicos + extras
  console.log('📝 Assigning member permissions to MEMBER role...');

  const memberPermissions = [
    'product:read',
    'purchase:create',
    'purchase:read',
    // MEMBER puede ver precios especiales
    'product:member-price',
  ];

  for (const permName of memberPermissions) {
    const permission = await prisma.permission.findUnique({
      where: { name: permName },
    });
    if (permission) {
      await prisma.rolePermission.upsert({
        where: {
          roleId_permissionId: {
            roleId: memberRole.id,
            permissionId: permission.id,
          },
        },
        update: {},
        create: {
          roleId: memberRole.id,
          permissionId: permission.id,
        },
      });
    }
  }
  console.log(`✅ ${memberPermissions.length} permissions assigned to MEMBER`);

  // ============================================
  // 4. CREAR USUARIOS
  // ============================================

  // Admin con contraseña temporal (obligatorio cambiar)
  console.log('📝 Creating admin user with temporary password...');

  const tempPassword = await bcrypt.hash('CHANGE_ME_123', 10);
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@sistema.com' },
    update: {},
    create: {
      email: 'admin@sistema.com',
      password: tempPassword,
      name: 'Administrador del Sistema',
      mustChangePassword: true, // Debe cambiar contraseña en primer login
    },
  });

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
  console.log('✅ Admin user created: admin@sistema.com / CHANGE_ME_123');

  // Usuario admin estándar (para pruebas)
  console.log('📝 Creating standard admin user...');

  const standardAdminPassword = await bcrypt.hash('admin123', 10);
  const standardAdmin = await prisma.user.upsert({
    where: { email: 'admin@example.com' },
    update: {},
    create: {
      email: 'admin@example.com',
      password: standardAdminPassword,
      name: 'Admin User',
      mustChangePassword: false,
    },
  });

  await prisma.userRole.upsert({
    where: {
      userId_roleId: {
        userId: standardAdmin.id,
        roleId: adminRole.id,
      },
    },
    update: {},
    create: {
      userId: standardAdmin.id,
      roleId: adminRole.id,
    },
  });
  console.log('✅ Standard admin user: admin@example.com / admin123');

  // Usuario normal
  console.log('📝 Creating normal user...');

  const userPassword = await bcrypt.hash('user123', 10);
  const normalUser = await prisma.user.upsert({
    where: { email: 'user@example.com' },
    update: {},
    create: {
      email: 'user@example.com',
      password: userPassword,
      name: 'Normal User',
      mustChangePassword: false,
    },
  });

  await prisma.userRole.upsert({
    where: {
      userId_roleId: {
        userId: normalUser.id,
        roleId: userRole.id,
      },
    },
    update: {},
    create: {
      userId: normalUser.id,
      roleId: userRole.id,
    },
  });
  console.log('✅ Normal user: user@example.com / user123');

  // Usuario member (premium)
  console.log('📝 Creating member user...');

  const memberPassword = await bcrypt.hash('member123', 10);
  const memberUser = await prisma.user.upsert({
    where: { email: 'member@example.com' },
    update: {},
    create: {
      email: 'member@example.com',
      password: memberPassword,
      name: 'Member User',
      mustChangePassword: false,
    },
  });

  await prisma.userRole.upsert({
    where: {
      userId_roleId: {
        userId: memberUser.id,
        roleId: memberRole.id,
      },
    },
    update: {},
    create: {
      userId: memberUser.id,
      roleId: memberRole.id,
    },
  });
  console.log('✅ Member user: member@example.com / member123');

  // Usuario demo (para demostración, debe cambiar contraseña)
  console.log('📝 Creating demo user...');

  const demoPassword = await bcrypt.hash('demo123', 10);
  const demoUser = await prisma.user.upsert({
    where: { email: 'demo@sistema.com' },
    update: {},
    create: {
      email: 'demo@sistema.com',
      password: demoPassword,
      name: 'Usuario Demo',
      mustChangePassword: true,
    },
  });

  await prisma.userRole.upsert({
    where: {
      userId_roleId: {
        userId: demoUser.id,
        roleId: userRole.id,
      },
    },
    update: {},
    create: {
      userId: demoUser.id,
      roleId: userRole.id,
    },
  });
  console.log(
    '✅ Demo user: demo@sistema.com / demo123 (must change password)',
  );

  // ============================================
  // 5. CREAR DATOS DE EJEMPLO (OPCIONAL)
  // ============================================
  console.log('📝 Creating sample data...');

  // Crear un supermercado de ejemplo
  const supermarket = await prisma.supermarket.upsert({
    where: { id: 1 },
    update: {},
    create: {
      name: 'Supermercado Central',
      address: 'Av. Principal 123, Ciudad',
      logoUrl: 'https://ejemplo.com/logo.png',
    },
  });
  console.log('✅ Sample supermarket created');

  // Crear categoría de ejemplo
  const category = await prisma.category.upsert({
    where: { id: 1 },
    update: {},
    create: {
      name: 'Lácteos',
      description: 'Productos lácteos y derivados',
    },
  });
  console.log('✅ Sample category created');

  // Crear marca de ejemplo
  const brand = await prisma.brand.upsert({
    where: { id: 1 },
    update: {},
    create: {
      name: 'La Serenísima',
      description: 'Productos lácteos de alta calidad',
    },
  });
  console.log('✅ Sample brand created');

  // Crear producto de ejemplo
  const product = await prisma.product.upsert({
    where: { id: 1 },
    update: {},
    create: {
      name: 'Leche Entera',
      description: 'Leche entera pasteurizada',
      unitType: 'LT',
      supermarketId: supermarket.id,
      categoryId: category.id,
      brandId: brand.id,
      prices: {
        create: [
          { type: 'NORMAL', price: 1.5 },
          { type: 'WHOLESALE', minQuantity: 6, price: 1.3 },
          { type: 'MEMBER', minQuantity: 12, price: 1.2 },
        ],
      },
    },
  });
  console.log('✅ Sample product created');

  // ============================================
  // 6. RESUMEN FINAL
  // ============================================
  console.log('\n🎉 ========== SEED COMPLETED SUCCESSFULLY ========== 🎉');
  console.log('\n📊 Database Statistics:');
  console.log(`   - Users: ${await prisma.user.count()}`);
  console.log(`   - Roles: ${await prisma.role.count()}`);
  console.log(`   - Permissions: ${await prisma.permission.count()}`);
  console.log(`   - Products: ${await prisma.product.count()}`);
  console.log(`   - Supermarkets: ${await prisma.supermarket.count()}`);
  console.log(`   - Categories: ${await prisma.category.count()}`);
  console.log(`   - Brands: ${await prisma.brand.count()}`);

  console.log('\n🔐 Test Users:');
  console.log('   ┌─────────────────────────────────────────────────────────┐');
  console.log('   │ ADMIN (must change password):                           │');
  console.log('   │   Email: admin@sistema.com                              │');
  console.log('   │   Password: CHANGE_ME_123                               │');
  console.log('   ├─────────────────────────────────────────────────────────┤');
  console.log('   │ ADMIN (standard):                                       │');
  console.log('   │   Email: admin@example.com                              │');
  console.log('   │   Password: admin123                                    │');
  console.log('   ├─────────────────────────────────────────────────────────┤');
  console.log('   │ MEMBER:                                                 │');
  console.log('   │   Email: member@example.com                             │');
  console.log('   │   Password: member123                                   │');
  console.log('   ├─────────────────────────────────────────────────────────┤');
  console.log('   │ USER:                                                   │');
  console.log('   │   Email: user@example.com                               │');
  console.log('   │   Password: user123                                     │');
  console.log('   ├─────────────────────────────────────────────────────────┤');
  console.log('   │ DEMO (must change password):                            │');
  console.log('   │   Email: demo@sistema.com                               │');
  console.log('   │   Password: demo123                                     │');
  console.log('   └─────────────────────────────────────────────────────────┘');

  console.log('\n💡 Next Steps:');
  console.log('   1. Run: npx prisma studio to explore the data');
  console.log('   2. Test login with different user types');
  console.log('   3. Configure your first product prices');
  console.log('   4. Start making purchases!\n');
}

main()
  .catch((e) => {
    console.error('\n❌ Seed failed with error:');
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
