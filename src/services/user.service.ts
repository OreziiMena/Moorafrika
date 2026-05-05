import { findUserById, updateUser } from '@/repositories/user.repository';
import AuthService from './auth.service';
import { NotFoundError } from '@/lib/errors';
import { UserContract } from '@/contracts/user';
import z from 'zod';
import { updateUserSchema } from '@/validationSchemas/user';

class UserService {
  static async getProfile() {
    return await AuthService.authorizeUser();
  }

  static async updateProfile(
    payload: z.infer<typeof updateUserSchema>,
  ): Promise<UserContract> {
    const user = await AuthService.authorizeUser();

    const data = updateUserSchema.parse(payload);

    const updatedUser = await updateUser(user.id, data);

    return {
      id: updatedUser.id,
      email: updatedUser.email,
      name: updatedUser.name,
      role: updatedUser.role,
      address: updatedUser.address,
      phone: updatedUser.phone,
    };
  }

  static async getUserProfile(id: string): Promise<UserContract> {
    await AuthService.authorizeUser(['ADMIN']);

    const user = await findUserById(id);

    if (!user) {
      throw new NotFoundError('User not found');
    }

    return {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      address: user.address,
      phone: user.phone,
    };
  }
}

export default UserService;
