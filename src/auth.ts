import NextAuth from "next-auth"
import Credentials from "next-auth/providers/credentials"
import { dbUser, otpVerifications, users } from "@/lib/db"
import { compare } from "bcryptjs"
import type { JWT } from "next-auth/jwt"
import type { Session } from "next-auth"
import { eq, or } from "drizzle-orm"

declare module "next-auth" {
  interface User {
    phone?: string
  }
  interface Session {
    user: {
      id: string
      name?: string | null
      email?: string | null
      image?: string | null
      phone?: string
    }
  }
}

interface CustomUser {
  name: string;
  phone: string;
  email: string;
  id: string;
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  secret: process.env.AUTH_SECRET,
  providers: [
    Credentials({
      name: "Credentials",
      credentials: {
        emailOrPhone: { label: "Email or Phone", type: "text" },
        password: { label: "Password", type: "password" },
        otpToken: { label: "OTP Token", type: "text" },
      },
      authorize: async (credentials) => {
        const emailOrPhone = credentials.emailOrPhone as string | undefined;
        const password = credentials.password as string | undefined;
        const otpToken = credentials.otpToken as string | undefined;

        if (!emailOrPhone) {
          throw new Error("Please provide email or phone");
        }

        const normalizedEmail = emailOrPhone.toLowerCase();
        const [user] = await dbUser
          .select()
          .from(users)
          .where(
            or(eq(users.email, normalizedEmail), eq(users.phone, emailOrPhone))
          )
          .limit(1);

        if (!user) {
          throw new Error("Invalid email or password");
        }

        if (otpToken) {
          const [otpRecord] = await dbUser
            .select()
            .from(otpVerifications)
            .where(eq(otpVerifications.token, otpToken))
            .limit(1);

          if (!otpRecord || !otpRecord.email || otpRecord.email !== user.email) {
            throw new Error("Invalid or expired OTP");
          }

          if (new Date() > otpRecord.expiresAt) {
            await dbUser
              .delete(otpVerifications)
              .where(eq(otpVerifications.token, otpToken));
            throw new Error("OTP has expired");
          }

          await dbUser
            .delete(otpVerifications)
            .where(eq(otpVerifications.token, otpToken));

          if (user.suspended || user.terminated) {
            throw new Error("Account suspended or terminated");
          }

          const userResponse: CustomUser = {
            name: user.name,
            phone: user.phone,
            email: user.email,
            id: user.id,
          };

          return userResponse;
        }

        if (!password) {
          throw new Error("Please provide password or OTP");
        }

        if (!user.password) {
          throw new Error("Password not set for this account. Please use OTP login.");
        }

        const isMatched = await compare(password, user.password);

        if (!isMatched) {
          throw new Error("Password did not match");
        }

        if (user.suspended || user.terminated) {
          throw new Error("Account suspended or terminated");
        }

        const userResponse: CustomUser = {
          name: user.name,
          phone: user.phone,
          email: user.email,
          id: user.id,
        };

        return userResponse;
      },
    }),
  ],
  pages: {
    signIn: "/auth/login",
  },
  callbacks: {
    async session({ session, token }: { session: Session, token: JWT }) {
      if (token?.sub && token?.phone) {
        session.user = session.user || {};
        session.user.id = token.sub;
        session.user.phone = token.phone as string;
      }
      return session;
    },
    async jwt({ token, user }) {
      if (user) {
        const customUser = user as CustomUser;
        token.phone = customUser.phone;
      }
      return token;
    },
  },

})
