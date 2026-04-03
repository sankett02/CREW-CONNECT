import { PrismaClient } from '@prisma/client';
import * as dotenv from 'dotenv';
import path from 'path';

// Explicitly load .env from the backend root
dotenv.config({ path: path.join(__dirname, '../../.env') });

const prisma = new PrismaClient({
    log: ['query', 'info', 'warn', 'error'],
});

export { prisma };
export default prisma;
