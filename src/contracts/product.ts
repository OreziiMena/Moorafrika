export interface ProductContract {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  imageUrl: string;
  thumbnails: string[];
  sizes: string[];

  category: string;

  createdAt: Date;
  updatedAt: Date;
}