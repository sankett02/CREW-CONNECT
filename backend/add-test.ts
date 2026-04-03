import * as dotenv from 'dotenv';
import * as path from 'path';
dotenv.config({ path: path.join(__dirname, '.env') });

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function addTestUser() {
    try {
        const user = await prisma.user.create({
            data: {
                email: `test-${Date.now()}@example.com`,
                passwordHash: 'hashed',
                role: 'CREATOR',
                profile: {
                    create: {
                        displayName: 'Test User'
                    }
                }
            }
        });
        console.log(`Created user: ${user.email}`);
    } catch (err) {
        console.error('Error:', err);
    } finally {
        await prisma.$disconnect();
    }
}

addTestUser();
