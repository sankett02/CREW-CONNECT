import { PrismaClient } from '@prisma/client';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.join(__dirname, '.env') });

const prisma = new PrismaClient();

async function checkPayments() {
    try {
        const payments = await prisma.paymentRecord.findMany();
        console.log(`Total PaymentRecords: ${payments.length}`);
        payments.forEach(p => {
            console.log(`ID: ${p.id} | Amount: ${p.amount} | Status: ${p.status} | PlatformFee: ${p.platformFee}`);
        });
        
        const paidPayments = payments.filter(p => p.status === 'PAID');
        console.log(`\nTotal PAID payments: ${paidPayments.length}`);
    } catch (err) {
        console.error('Error:', err);
    } finally {
        await prisma.$disconnect();
    }
}

checkPayments();
