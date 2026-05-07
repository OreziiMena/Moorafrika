export interface Product {
  id: string;
  name: string;
  price: number;
  image: string;
}

export interface Review {
  id: string;
  name: string;
  rating: number;
  text: string;
  avatar?: string;
}
