import NextAuth from "next-auth"
import Credentials from "next-auth/providers/credentials"
import { userPrisma } from "@/lib/db"
import { compare } from "bcryptjs"
import type { JWT } from "next-auth/jwt"
import type { Session } from "next-auth"

// Extend NextAuth types
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

// Define a custom user type interface
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

        // Use Prisma to find the user
        const user = await userPrisma.user.findFirst({
          where: {
            OR: [
              { email: emailOrPhone },
              { phone: emailOrPhone }
            ]
          }
        });

        if (!user) {
          throw new Error("Invalid email or password");
        }

        // Handle OTP-based authentication
        if (otpToken) {
          // Verify OTP token
          const otpRecord = await userPrisma.otpVerification.findUnique({
            where: {
              token: otpToken,
            },
          });

          if (!otpRecord || !otpRecord.email || otpRecord.email !== user.email) {
            throw new Error("Invalid or expired OTP");
          }

          // Check if OTP is expired
          if (new Date() > otpRecord.expiresAt) {
            await userPrisma.otpVerification.delete({
              where: {
                token: otpToken,
              },
            });
            throw new Error("OTP has expired");
          }

          // Delete OTP after successful verification
          await userPrisma.otpVerification.delete({
            where: {
              token: otpToken,
            },
          });

          // Check if user is suspended or terminated
          if (user.suspended || user.terminated) {
            throw new Error("Account suspended or terminated");
          }

          // Return user for OTP-based auth
          const userResponse: CustomUser = {
            name: user.name,
            phone: user.phone,
            email: user.email,
            id: user.id,
          };

          return userResponse;
        }

        // Handle password-based authentication (backward compatibility)
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

        // Check if user is suspended or terminated
        if (user.suspended || user.terminated) {
          throw new Error("Account suspended or terminated");
        }

        // Ensure the returned object matches the CustomUser type
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