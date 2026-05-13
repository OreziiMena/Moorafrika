import { OrderStatus } from '@prisma/client';
import { ProductContract } from './product';
import { UserContract } from './user';

export interface OrderItemContract {
  id: string;
  orderId: string;
  productId: string;
  quantity: number;
  priceAtPurchase: number;
  size: string | null;

  product: ProductContract;

  createdAt: Date;
  updatedAt: Date;
}

export interface UserOrderContract {
  id: string;
  userId: string;
  totalAmount: number;
  deliveryAddress: string;
  contactName: string;
  contactPhone: string;
  contactEmail: string;
  paymentReference: string | null;
  note: string | null;
  adminNote: string | null;
  status: OrderStatus;
  orderItems: OrderItemContract[];

  shippedAt: Date | null;
  deliveredAt: Date | null;
  cancelledAt: Date | null;

  createdAt: Date;
  updatedAt: Date;
}

export interface AdminOrderContract extends UserOrderContract {
  user: UserContract;
}
