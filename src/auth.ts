import Credentials from 'next-auth/providers/credentials';
import NextAuth from 'next-auth';
import type { NextAuthConfig } from 'next-auth';
import UserService from '@/services/auth.service';
import z from 'zod';
import { loginUserSchema } from '@/validationSchemas/auth';

const config: NextAuthConfig = {
  pages: {
    signIn: '/login',
  },

  providers: [
    Credentials({
      credentials: {},

      authorize: async (credentials) => {
        const user = await UserService.localLogin(credentials as z.infer<typeof loginUserSchema>);
        return user;
      },
    }),
  ],

  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.id = user.id!;
        token.email = user.email;
        token.name = user.name;
        token.role = user.role;
        token.address = user.address;
        token.phone = user.phone;
      }
      return token;
    },

    async session({ session, token }) {
      if (session?.user) {
        session.user.id = token.id as never;
        session.user.email = token.email!;
        session.user.name = token.name!;
        session.user.role = token.role;
        session.user.address = token.address;
        session.user.phone = token.phone;
      }

      return session;
    },
  },
};

export const { handlers, signIn, signOut, auth } = NextAuth(config);
