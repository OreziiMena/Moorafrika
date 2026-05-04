import { prisma } from "@/lib/prisma";
import { AuthProvider, User } from "@prisma/client";

interface CreateAuthMethodPayload {
  userId: User["id"];
  provider: AuthProvider;
  providerId?: string;
  passwordHash?: string;
}

export const findUserByEmail = async (email: string) => {
  return await prisma.user.findUnique({
    where: {
      email,
    },
    include: {
      authMethods: true,
    },
  });
};

export const createUser = async (data: {
  email: string;
  name: string;
}) => {
  const { email, name } = data;

  return await prisma.user.create({
    data: {
      email,
      name,
    },
  });
};

export const createAuthMethod = async (data: CreateAuthMethodPayload) => {
  return await prisma.authMethod.create({
    data: {
      userId: data.userId,
      provider: data.provider,
      providerId: data.providerId,
      passwordHash: data.passwordHash,
    },
  });
};
