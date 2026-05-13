import { Module } from '@nestjs/common';
import { ThrottlerModule } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerGuard } from '@nestjs/throttler';
import { ConfigModule } from './config/config.module';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { RoleModule } from './roles/role.module';
import { PermissionModule } from './permission/permission.module';
import { ProductsModule } from './products/products.module';
import { PurchasesModule } from './purchases/purchases.module';
import { SupermarketsModule } from './supermarkets/supermarkets.module';
import { CategoriesModule } from './categories/categories.module';
import { BrandsModule } from './brands/brands.module';
import { PasswordChangeGuard } from './auth/guards/password-change.guard';
import { cp } from 'fs';
import { CompositeGuard } from './auth/guards/composite.guard';

@Module({
  imports: [
    ConfigModule,
    PrismaModule,
    AuthModule,
    UserModule,
    RoleModule,
    PermissionModule,
    ThrottlerModule.forRootAsync({
      useFactory: () => ({
        throttlers: [
          {
            ttl: parseInt(process.env.THROTTLE_TTL || '60'),
            limit: parseInt(process.env.THROTTLE_LIMIT || '10'),
          },
        ],
      }),
    }),
    ProductsModule,
    PurchasesModule,
    SupermarketsModule,
    CategoriesModule,
    BrandsModule,
  ],
  providers: [
    ThrottlerGuard,
    PasswordChangeGuard,
    {
      provide: APP_GUARD,
      useClass: CompositeGuard,
    }
  ],
})
export class AppModule {}
