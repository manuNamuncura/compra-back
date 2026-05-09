export class CreatePurchaseDto {
    supermarketId: number;
    items: CreatePurchaseItemDto[];
}

export class CreatePurchaseItemDto {
    productId: number;
    quantity: number;
    expiration?: Date;
}