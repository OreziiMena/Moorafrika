import { countOrders, findOrders } from '@/repositories/order.repository';
import AuthService from './auth.service';
import { PagedResponse } from '@/contracts/response';
import { UserOrderContract } from '@/contracts/order';
import { userOrderMapper } from '@/mapper/order';
import { OrderStatus } from '@prisma/client';
import { pageResponseMapper } from '@/mapper/pagedResponse';

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

  static async getAllOrders(
    payload: GetOrdersParams,
  ) {
    const { page = 1, limit = 10, status } = payload;
    const skip = (page - 1) * limit;
    const statusFilter = status ? { status: status as OrderStatus } : {};

    await AuthService.authorizeUser(['ADMIN']);
    const [orders, count] = await Promise.all([
      findOrders(true, { ...statusFilter }, skip, limit),
      countOrders({ ...statusFilter }),
    ]);

    return pageResponseMapper({
      data: orders.map(userOrderMapper),
      page,
      limit,
      total: count,
    });
  }

  static async createOrder() {}

}

export default OrderService;
