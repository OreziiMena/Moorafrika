import {
  countOrders,
  createOrder,
  createOrderItems,
  deleteOrder,
  findOrders,
  findUniqueOrder,
  updateOrderStatus,
} from '@/repositories/order.repository';
import AuthService from './auth.service';
import { PagedResponse } from '@/contracts/response';
import { AdminOrderContract, UserOrderContract } from '@/contracts/order';
import {
  adminOrderMapper,
  AdminOrderWithUserAndItems,
  userOrderMapper,
} from '@/mapper/order';
import { OrderStatus, Prisma } from '@prisma/client';
import { pageResponseMapper } from '@/mapper/pagedResponse';
import z from 'zod';
import { createOrderSchema } from '@/validationSchemas/order';
import CartService from './cart.service';
import { NotFoundError } from '@/lib/errors';
import ProductService from './product.service';
import { paystackCheckout } from '@/services/paystack/checkout';

interface GetOrdersParams {
  page?: number;
  limit?: number;
  status?: string;
}

class OrderService {
  static async getCurrentUserOrders(
    payload: GetOrdersParams,
  ): Promise<PagedResponse<UserOrderContract>> {
    const { page = 1, limit = 10, status } = payload;
    const skip = (page - 1) * limit;
    const statusFilter = status ? { status: status as OrderStatus } : {};

    const user = await AuthService.authorizeUser();
    const [orders, count] = await Promise.all([
      findOrders(false, { userId: user.id, ...statusFilter }, skip, limit),
      countOrders({ userId: user.id, ...statusFilter }),
    ]);

    return pageResponseMapper({
      data: orders.map(userOrderMapper),
      page,
      limit,
      total: count,
    });
  }

  static async getUserOrderById(orderId: string): Promise<UserOrderContract> {
    const user = await AuthService.authorizeUser();
    const order = await findOrders(
      false,
      { id: orderId, userId: user.id },
      0,
      1,
    );

    if (order.length < 1) {
      throw new NotFoundError('Order not found');
    }

    return userOrderMapper(order[0]);
  }

  static async getAllOrders(payload: GetOrdersParams) {
    const { page = 1, limit = 10, status } = payload;
    const skip = (page - 1) * limit;
    const statusFilter = status ? { status: status as OrderStatus } : {};

    await AuthService.authorizeUser(['ADMIN']);
    const [orders, count] = await Promise.all([
      findOrders(true, { ...statusFilter }, skip, limit),
      countOrders({ ...statusFilter }),
    ]);

    return pageResponseMapper({
      data: orders.map((order) =>
        adminOrderMapper(order as AdminOrderWithUserAndItems),
      ),
      page,
      limit,
      total: count,
    });
  }

  static async getOrderById(orderId: string): Promise<AdminOrderContract> {
    const user = await AuthService.authorizeUser();
    const order = await findOrders(
      true,
      { id: orderId, userId: user.id },
      0,
      1,
    );

    if (order.length < 1) {
      throw new NotFoundError('Order not found');
    }
    return adminOrderMapper(order[0] as AdminOrderWithUserAndItems);
  }

  static async createNewOrder(payload: z.infer<typeof createOrderSchema>) {
    const { deliveryAddress, contactEmail, contactName, contactPhone, note } =
      createOrderSchema.parse(payload);

    const user = await AuthService.authorizeUser();
    const cart = await CartService.getUserCart();
    if (cart.items.length === 0) {
      throw new Error('Cart is empty');
    }
    const totalAmount = cart.items.reduce(
      (sum, item) => sum + item.quantity * item.product.price,
      0,
    );

    const orderPayload = {
      delivery_address: deliveryAddress,
      contact_email: contactEmail,
      contact_name: contactName,
      contact_phone: contactPhone,
      note,
      totalAmount,

      user: { connect: { id: user.id } },
    } as Prisma.OrderCreateInput;

    const order = await createOrder(orderPayload);

    const orderItems = cart.items.map(
      (item) =>
        ({
          quantity: item.quantity,
          size: item.size,
          price_at_purchase: item.product.price,
          orderId: order.id,
          productId: item.productId,
        }) as Prisma.OrderItemCreateManyInput,
    );

    await createOrderItems(orderItems);
    const url = await paystackCheckout({
      orderId: order.id,
      email: contactEmail,
      totalAmount,
    });
    if (!url) {
      await deleteOrder(order.id);
      throw new Error('Failed to initialize payment');
    }

    await CartService.clearCartItems(cart.items);

    return url;
  }

  static async processPaidOrder(orderId: string) {
    const order = await findUniqueOrder({ id: orderId }, false);
    if (!order) {
      throw new NotFoundError('Order not found');
    }

    await updateOrderStatus(order.id, 'PROCESSING');
    for (const item of order.orderItems) {
      await ProductService.updateProductStock(
        item.product.slug,
        -item.quantity,
      );
    }
  }

  static async initializePaymentForOrder(orderId: string) {
    const user = await AuthService.authorizeUser();
    const order = await findUniqueOrder(
      {
        id: orderId,
      },
      false,
    );

    if (!order || order.userId !== user.id) {
      throw new NotFoundError('Order not found');
    }

    if (order.status !== 'PENDING') {
      throw new Error('Payment can only be initialized for pending orders');
    }

    const totalAmount = order.orderItems.reduce(
      (sum, item) => sum + item.quantity * item.price_at_purchase,
      0,
    );
    const url = await paystackCheckout({
      orderId: order.id,
      email: order.contact_email,
      totalAmount,
    });
    if (!url) {
      throw new Error('Failed to initialize payment');
    }

    return url;
  }
}

export default OrderService;
