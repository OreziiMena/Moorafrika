import {
  findUserByEmail,
  findUserById,
  updateLocalAuthMethod,
  updateUser,
} from '@/repositories/user.repository';
import AuthService from './auth.service';
import { BadRequestError, NotFoundError } from '@/lib/errors';
import { UserContract } from '@/contracts/user';
import z from 'zod';
import bcrypt from 'bcrypt';
import {
  updatePasswordSchema,
  updateUserSchema,
} from '@/validationSchemas/user';
import { userMapper } from '@/mapper/user';
import { AuthProvider } from '@prisma/client';

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

  static async updatePassword(
    payload: z.infer<typeof updatePasswordSchema>,
  ): Promise<{ message: string }> {
    const user = await AuthService.authorizeUser();

    const data = updatePasswordSchema.parse(payload);
    const existingUser = await findUserByEmail(user.email);

    if (!existingUser) {
      throw new NotFoundError('User not found');
    }

    const localAuthMethod = existingUser.authMethods.find(
      (method) => method.provider === AuthProvider.LOCAL,
    );

    const newPasswordHash = await bcrypt.hash(data.newPassword, 10);

    if (!localAuthMethod) {
      await AuthService.createLocalAuthMethod(
        existingUser.id,
        newPasswordHash,
      );
      return { message: 'Password set successfully' };
    }

    const isPasswordValid = await bcrypt.compare(
      data.oldPassword,
      localAuthMethod.passwordHash!,
    );
    if (!isPasswordValid) {
      throw new BadRequestError('Old password is incorrect');
    }

    await updateLocalAuthMethod(localAuthMethod.id, newPasswordHash);

    return { message: 'Password updated successfully' };
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
