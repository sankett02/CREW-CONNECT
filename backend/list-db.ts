import * as dotenv from 'dotenv';
import * as path from 'path';
import * as fs from 'fs';
dotenv.config({ path: path.join(__dirname, '.env') });

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function listAll() {
    try {
        const users = await prisma.user.findMany({
            select: { id: true, email: true, role: true, createdAt: true },
            orderBy: { createdAt: 'desc' }
        });
        
        const projects = await prisma.project.findMany({
            select: { id: true, title: true, status: true, createdAt: true },
            orderBy: { createdAt: 'desc' }
        });

        const output = [
            `Current Time: ${new Date().toISOString()}`,
            '',
            `=== USERS (${users.length}) ===`,
            ...users.map(u => `${u.createdAt.toISOString()} | [${u.role}] ${u.email}`),
            '',
            `=== PROJECTS (${projects.length}) ===`,
            ...projects.map(p => `${p.createdAt.toISOString()} | [${p.status}] ${p.title}`),
        ].join('\n');

        fs.writeFileSync('db-full-dump.txt', output);
        console.log('Results written to db-full-dump.txt');
    } catch (err) {
        console.error('Error:', err);
    } finally {
        await prisma.$disconnect();
    }
}

listAll();
