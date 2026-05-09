import { PriceType, UnitType } from "@prisma/client";

export class CreateProductDto {
    name: string;
    description?: string;
    imageUrl?: string;
    unitType: UnitType;
    supermarketId: number;
    categoryId: number;
    brandId: number;
    prices: CreateProductPriceDto[];
}

export class CreateProductPriceDto {
    type: PriceType;
    minQuantity?: number;
    prices: number;
}