import { findOrders } from '@/repositories/order.repository';
import AuthService from './auth.service';
import { PagedResponse } from '@/contracts/response';
import { UserOrderContract } from '@/contracts/order';

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

    const user = await AuthService.authorizeUser();
    const orders = await findOrders(false, { userId: user.id, status }, skip, limit);

    return;
  }

  static async getAllOrders() {
    await AuthService.authorizeUser(['ADMIN']);
    return findOrders(true, {});
  }
}

export default OrderService;
