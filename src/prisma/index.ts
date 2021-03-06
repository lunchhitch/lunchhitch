/* eslint-disable no-unused-vars */
/* eslint-disable no-var */
/* eslint-disable vars-on-top */
import { PrismaClient } from '@prisma/client';

// import { KeysOfType } from './common';

declare global {
  var prisma: PrismaClient | undefined;
}

const prisma = global.prisma || new PrismaClient();

export default prisma;

if (process.env.NODE_ENV !== 'production') global.prisma = prisma;

// type PrismaFuncs = KeysOfType<PrismaClient, Function>;
// type Collection = KeysOfType<Omit<PrismaClient, PrismaFuncs>>;
// type Method = KeysOfType<PrismaClient[Collection]>
