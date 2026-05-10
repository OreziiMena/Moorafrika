import { DiscountContract } from '@/contracts/discounts';
import CloudflareStorageServer from '@/services/cloudflare/storage';
import { Prisma } from '@prisma/client';
import { productMapper } from './product';

export const discountMapper = (
  discount: Prisma.DiscountGetPayload<{
    include: { product: { include: { category: true } } };
  }>,
): DiscountContract => ({
  id: discount.id,
  description: discount.description,
  percentage: discount.percentage,
  productId: discount.productId,
  imageUrl: discount.imageKey
    ? CloudflareStorageServer.generatePublicUrl(discount.imageKey)
    : null,
  product: productMapper(discount.product),
  expiresAt: discount.expiresAt,
  createdAt: discount.created_at,
  updatedAt: discount.updated_at,
});
