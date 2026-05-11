import { errorHandler } from '@/lib/apiErrorHandler';
import CartService from '@/services/cart.service';
import { NextResponse } from 'next/server';

export const PUT = errorHandler(async (request, { params }) => {
  const { id } = await params;
  const body = await request.json();
  const updatedCartItem = await CartService.updateCartItemQuantity({ ...body, productId: id });

  return NextResponse.json(updatedCartItem);
});

export const DELETE = errorHandler(async (_, { params }) => {
  const { id } = await params;
  await CartService.removeItemFromCart(id);

  return NextResponse.json({ message: 'Cart item removed successfully' });
});
