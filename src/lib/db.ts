import { PrismaClient as UserPrismaClient } from "../../prisma/generated/user";
import { PrismaClient as ProductPrismaClient } from "../../prisma/generated/product";

const userPrismaClientSingleton = () => {
  return new UserPrismaClient();
};

const productPrismaClientSingleton = () => {
  return new ProductPrismaClient();
};

// Declare global types to avoid multiple instances during development
declare global {
  // eslint-disable-next-line no-var -- required for global augmentation
  var userPrisma: undefined | ReturnType<typeof userPrismaClientSingleton>;
  // eslint-disable-next-line no-var -- required for global augmentation
  var productPrisma: undefined | ReturnType<typeof productPrismaClientSingleton>;
}

export const userPrisma =
  globalThis.userPrisma ?? userPrismaClientSingleton();
export const productPrisma =
  globalThis.productPrisma ?? productPrismaClientSingleton();

if (process.env.NODE_ENV !== "production") {
  globalThis.userPrisma = userPrisma;
  globalThis.productPrisma = productPrisma;
}
