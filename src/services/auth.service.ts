import {
  createAuthMethod,
  createUser,
  findUserByEmail,
} from '@/repositories/user.repository';
import { createUserSchema, loginUserSchema } from '@/validationSchemas/auth';
import z from 'zod';
import bcrypt from 'bcrypt';
import { AuthProvider, User } from '@prisma/client';
import { auth, signIn } from '@/auth';
import { UserContract } from '@/contracts/user';
import { CredentialsSignin } from 'next-auth';
import { ForbiddenError, UnAuthorizedError } from '@/lib/errors';

class AuthService {
  private static async createLocalAuthMethod(
    userId: User['id'],
    passwordHash: string,
  ) {
    await createAuthMethod({
      userId,
      provider: AuthProvider.LOCAL,
      passwordHash,
    });
  }

  static async localSignup(
    payload: z.infer<typeof createUserSchema>,
  ): Promise<UserContract> {
    const { email, name, password } = createUserSchema.parse(payload);

    const existingUser = await findUserByEmail(email);
    if (existingUser) {
      throw {
        error: 'UserAlreadyExists',
        message: 'User with this email already exists',
        status: 400,
      };
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const user = await createUser({ email, name });
    await this.createLocalAuthMethod(user.id, passwordHash);

    await signIn('credentials', { email, name, password, redirect: false });

    return {
      id: user.id,
      email,
      name,
      role: user.role,
      address: user.address,
      phone: user.phone,
    };
  }

  static async localLogin(
    credentials: z.infer<typeof loginUserSchema>,
  ): Promise<UserContract> {
    const { email, password } = loginUserSchema.parse(credentials);

    const user = await findUserByEmail(email);
    if (!user) {
      throw new CredentialsSignin('Invalid email or password');
    }

    const localAuthMethod = user.authMethods.find(
      (method) => method.provider === AuthProvider.LOCAL,
    );

    if (!localAuthMethod || !localAuthMethod.passwordHash) {
      throw new CredentialsSignin('Invalid email or password');
    }

    const isPasswordValid = await bcrypt.compare(
      password,
      localAuthMethod.passwordHash,
    );

    if (!isPasswordValid) {
      throw new CredentialsSignin('Invalid email or password');
    }

    return {
      id: user.id,
      email,
      name: user.name,
      role: user.role,
      address: user.address,
      phone: user.phone,
    };
  }

  static async authorizeUser(roles: User['role'][]): Promise<UserContract> {
  const session = await auth();
  if (!session) {
    throw new UnAuthorizedError('Unauthorized');
  }
  if (!roles.includes(session.user.role)) {
    throw new ForbiddenError('Forbidden');
  }

  return session.user;
};
}

export default AuthService;
