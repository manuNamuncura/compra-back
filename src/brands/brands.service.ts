import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateBrandDto } from './dto/create-brand.dto';
import { UpdateBrandDto } from './dto/update-brand.dto';

@Injectable()
export class BrandsService {
  constructor(private prisma: PrismaService) {}

  async create(createBrandDto: CreateBrandDto) {
    return this.prisma.brand.create({
      data: createBrandDto,
    });
  }

  async findAll() {
    return this.prisma.brand.findMany({
      include: {
        products: {
          include: {
            supermarket: true,
            category: true,
          },
        },
      },
    });
  }

  async findOne(id: number) {
    const brand = await this.prisma.brand.findUnique({
      where: { id },
      include: {
        products: {
          include: {
            supermarket: true,
            category: true,
            prices: true,
          },
        },
      },
    });

    if (!brand) {
      throw new NotFoundException(`Brand with ID ${id} not found`);
    }

    return brand;
  }

  async getProducts(id: number) {
    await this.findOne(id);

    return this.prisma.product.findMany({
      where: { brandId: id },
      include: {
        supermarket: true,
        category: true,
        prices: true,
      },
    });
  }

  async update(id: number, updateBrandDto: UpdateBrandDto) {
    await this.findOne(id);

    return this.prisma.brand.update({
      where: { id },
      data: updateBrandDto,
    });
  }

  async remove(id: number) {
    await this.findOne(id);

    const productCount = await this.prisma.product.count({
      where: { brandId: id },
    });

    if (productCount > 0) {
      throw new Error('Cannot delete brand with associated products');
    }

    return this.prisma.brand.delete({
      where: { id },
    });
  }
}
