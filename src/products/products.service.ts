// products/products.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';

@Injectable()
export class ProductsService {
  constructor(private prisma: PrismaService) {}

  async create(createProductDto: CreateProductDto) {
    const { prices, ...productData } = createProductDto;

    // Verificar que existan las relaciones
    await this.verifyRelations(productData);

    return this.prisma.product.create({
      data: {
        ...productData,
        prices: {
          create: prices,
        },
      },
      include: {
        supermarket: true,
        category: true,
        brand: true,
        prices: true,
      },
    });
  }

  async findAll() {
    return this.prisma.product.findMany({
      include: {
        supermarket: true,
        category: true,
        brand: true,
        prices: true,
      },
    });
  }

  async findOne(id: number) {
    const product = await this.prisma.product.findUnique({
      where: { id },
      include: {
        supermarket: true,
        category: true,
        brand: true,
        prices: true,
      },
    });

    if (!product) {
      throw new NotFoundException(`Product with ID ${id} not found`);
    }

    return product;
  }

  async update(id: number, updateProductDto: UpdateProductDto) {
    await this.findOne(id); // Verificar existencia

    const { prices, ...productData } = updateProductDto;

    // Actualizar en transacción
    return this.prisma.$transaction(async (prisma) => {
      // Actualizar datos del producto
      const updatedProduct = await prisma.product.update({
        where: { id },
        data: productData,
      });

      // Si se envían nuevos precios, actualizarlos
      if (prices) {
        // Eliminar precios existentes
        await prisma.productPrice.deleteMany({
          where: { productId: id },
        });

        // Crear nuevos precios
        await prisma.productPrice.createMany({
          data: prices.map((price) => ({
            ...price,
            productId: id,
          })),
        });
      }

      return this.findOne(id);
    });
  }

  async remove(id: number) {
    await this.findOne(id);

    return this.prisma.product.delete({
      where: { id },
    });
  }

  async getProductPrice(
    productId: number,
    quantity: number,
    userRoles: string[],
  ) {
    const product = await this.prisma.product.findUnique({
      where: { id: productId },
      include: {
        prices: true,
      },
    });

    if (!product) {
      throw new NotFoundException(`Product with ID ${productId} not found`);
    }

    const isMember = userRoles.includes('MEMBER');

    // Buscar precio según rol y cantidad
    let applicablePrice = product.prices.find((p) => p.type === 'NORMAL');

    if (isMember) {
      const memberPrice = product.prices.find(
        (p) =>
          p.type === 'MEMBER' && (!p.minQuantity || quantity >= p.minQuantity),
      );
      if (memberPrice) applicablePrice = memberPrice;
    }

    const wholesalePrice = product.prices.find(
      (p) =>
        p.type === 'WHOLESALE' && (!p.minQuantity || quantity >= p.minQuantity),
    );
    if (wholesalePrice) applicablePrice = wholesalePrice;

    return {
      price: applicablePrice?.price,
      type: applicablePrice?.type,
      unitType: product.unitType,
    };
  }

  private async verifyRelations(productData: any) {
    const [supermarket, category, brand] = await Promise.all([
      this.prisma.supermarket.findUnique({
        where: { id: productData.supermarketId },
      }),
      this.prisma.category.findUnique({
        where: { id: productData.categoryId },
      }),
      this.prisma.brand.findUnique({ where: { id: productData.brandId } }),
    ]);

    if (!supermarket)
      throw new NotFoundException(
        `Supermarket with ID ${productData.supermarketId} not found`,
      );
    if (!category)
      throw new NotFoundException(
        `Category with ID ${productData.categoryId} not found`,
      );
    if (!brand)
      throw new NotFoundException(
        `Brand with ID ${productData.brandId} not found`,
      );
  }
}
