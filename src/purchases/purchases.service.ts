// purchases/purchases.service.ts
import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePurchaseDto } from './dto/create-purchase.dto';
import { ProductsService } from '../products/products.service';

@Injectable()
export class PurchasesService {
  constructor(
    private prisma: PrismaService,
    private productsService: ProductsService,
  ) {}

  async create(
    userId: string,
    userRoles: string[],
    createPurchaseDto: CreatePurchaseDto,
  ) {
    const { supermarketId, items } = createPurchaseDto;

    // Verificar que el supermercado existe
    const supermarket = await this.prisma.supermarket.findUnique({
      where: { id: supermarketId },
    });
    if (!supermarket) {
      throw new NotFoundException(
        `Supermarket with ID ${supermarketId} not found`,
      );
    }

    // Calcular total y preparar items con precios
    let total = 0;
    const purchaseItems: Prisma.PurchaseItemCreateWithoutPurchaseInput[] = [];

    for (const item of items) {
      const { price, unitType } = await this.productsService.getProductPrice(
        item.productId,
        item.quantity,
        userRoles,
      );

      if (price === undefined) {
        throw new BadRequestException(
          `No hay precio aplicable para el producto ${item.productId}`,
        );
      }

      const itemTotal = price * item.quantity;
      total += itemTotal;

      purchaseItems.push({
        product: { connect: { id: item.productId } },
        quantity: item.quantity,
        unitType,
        priceAtBuy: price,
        expiration: item.expiration,
      });
    }

    // Crear la compra
    return this.prisma.purchase.create({
      data: {
        userId,
        supermarketId,
        total,
        items: {
          create: purchaseItems,
        },
      },
      include: {
        items: {
          include: {
            product: true,
          },
        },
        supermarket: true,
      },
    });
  }

  async findAll(userId: string, userRoles: string[]) {
    // Admins pueden ver todas las compras
    const isAdmin = userRoles.includes('ADMIN');

    return this.prisma.purchase.findMany({
      where: isAdmin ? {} : { userId },
      include: {
        items: {
          include: {
            product: true,
          },
        },
        supermarket: true,
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: {
        date: 'desc',
      },
    });
  }

  async findOne(id: number, userId: string, userRoles: string[]) {
    const purchase = await this.prisma.purchase.findUnique({
      where: { id },
      include: {
        items: {
          include: {
            product: true,
          },
        },
        supermarket: true,
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    if (!purchase) {
      throw new NotFoundException(`Purchase with ID ${id} not found`);
    }

    // Verificar permisos
    const isAdmin = userRoles.includes('ADMIN');
    if (purchase.userId !== userId && !isAdmin) {
      throw new ForbiddenException('You can only view your own purchases');
    }

    return purchase;
  }

  async getUserStats(userId: string) {
    const purchases = await this.prisma.purchase.findMany({
      where: { userId },
      include: {
        items: true,
      },
    });

    const totalSpent = purchases.reduce((sum, p) => sum + p.total, 0);
    const averagePerPurchase =
      purchases.length > 0 ? totalSpent / purchases.length : 0;

    // Top productos comprados
    const productCount = new Map();
    purchases.forEach((purchase) => {
      purchase.items.forEach((item) => {
        const count = productCount.get(item.productId) || 0;
        productCount.set(item.productId, count + item.quantity);
      });
    });

    const topProducts = Array.from(productCount.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([productId, quantity]) => ({ productId, quantity }));

    return {
      totalPurchases: purchases.length,
      totalSpent,
      averagePerPurchase,
      topProducts,
    };
  }
}
