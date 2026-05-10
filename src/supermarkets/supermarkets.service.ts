import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateSupermarketDto } from './dto/create-supermarket.dto';
import { UpdateSupermarketDto } from './dto/update-supermarket.dto';

@Injectable()
export class SupermarketsService {
  constructor(private prisma: PrismaService) {}

  async create(createSupermarketDto: CreateSupermarketDto) {
    return this.prisma.supermarket.create({
      data: createSupermarketDto,
    });
  }

  async findAll() {
    return this.prisma.supermarket.findMany({
      include: {
        products: {
          include: {
            category: true,
            brand: true,
          },
        },
        purchases: {
          take: 10,
          orderBy: { date: 'desc' },
        },
      },
    });
  }

  async findOne(id: number) {
    const supermarket = await this.prisma.supermarket.findUnique({
      where: { id },
      include: {
        products: {
          include: {
            category: true,
            brand: true,
            prices: true,
          },
        },
        purchases: {
          take: 10,
          orderBy: { date: 'desc' },
        },
      },
    });

    if (!supermarket) {
      throw new NotFoundException(`Supermarket with ID ${id} not found`);
    }

    return supermarket;
  }

  async getProducts(id: number) {
    await this.findOne(id); // Verificar existencia
    
    return this.prisma.product.findMany({
      where: { supermarketId: id },
      include: {
        category: true,
        brand: true,
        prices: true,
      },
    });
  }

  async update(id: number, updateSupermarketDto: UpdateSupermarketDto) {
    await this.findOne(id);
    
    return this.prisma.supermarket.update({
      where: { id },
      data: updateSupermarketDto,
    });
  }

  async remove(id: number) {
    await this.findOne(id);
    
    // Verificar si tiene productos asociados
    const productCount = await this.prisma.product.count({
      where: { supermarketId: id },
    });
    
    if (productCount > 0) {
      throw new Error('Cannot delete supermarket with associated products');
    }
    
    return this.prisma.supermarket.delete({
      where: { id },
    });
  }
}