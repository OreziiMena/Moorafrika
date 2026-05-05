import { findUserById, updateUser } from '@/repositories/user.repository';
import AuthService from './auth.service';
import { NotFoundError } from '@/lib/errors';
import { UserContract } from '@/contracts/user';
import z from 'zod';
import { updateUserSchema } from '@/validationSchemas/user';
import { userMapper } from '@/mapper/user';

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

    return userMapper(updatedUser);
  }

  static async getUserProfile(id: string): Promise<UserContract> {
    await AuthService.authorizeUser(['ADMIN']);

    const user = await findUserById(id);

    if (!user) {
      throw new NotFoundError('User not found');
    }

    return userMapper(user);
  }
}

export default UserService;
