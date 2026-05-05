import { ProductContract } from "@/contracts/product";
import { generateImageUrl } from "@/lib/mediaManager";
import { Prisma } from "@prisma/client";

export const productMapper = (product: Prisma.ProductGetPayload<{
  include: { category: true }
}>): ProductContract => ({
  id: product.id,
  name: product.name,
  slug: product.slug,
  description: product.description,
  price: product.price,
  imageUrl: generateImageUrl(product.imageKey),
  thumbnails: product.thumbnailKeys.map(generateImageUrl),
  sizes: product.sizes,
  category: product.category.name,
  createdAt: product.created_at,
  updatedAt: product.updated_at,
});