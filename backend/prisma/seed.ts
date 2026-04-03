import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
    // Check if we already have users to avoid duplicate seeding
    const userCount = await prisma.user.count();
    if (userCount > 0) {
        console.log('Database already contains data. Skipping destructive seed.');
        return;
    }

    console.log('Seeding demo data...');

    const passwordHash = await bcrypt.hash('password123', 10);

    // Users
    const admin = await prisma.user.create({
        data: {
            email: 'admin@crewconnect.com',
            passwordHash,
            role: 'ADMIN',
            profile: {
                create: {
                    displayName: 'System Admin',
                    bio: 'CrewConnect platform administrator.',
                    nicheTags: 'Admin,System',
                }
            }
        }
    });

    const brand = await prisma.user.create({
        data: {
            email: 'brand@startup.com',
            passwordHash,
            role: 'BRAND',
            profile: {
                create: {
                    displayName: 'TechNext Innovations',
                    bio: 'Building the next generation of SaaS tools.',
                    nicheTags: 'Tech,SaaS,B2B',
                }
            }
        }
    });

    const creator = await prisma.user.create({
        data: {
            email: 'creator@talent.com',
            passwordHash,
            role: 'CREATOR',
            profile: {
                create: {
                    displayName: 'Alex Vision',
                    bio: 'Expert video editor and visual storyteller.',
                    nicheTags: 'Video Production,YouTube,Vlogs',
                    skills: 'After Effects,Premiere Pro,DaVinci',
                }
            }
        }
    });

    // Project
    const project = await prisma.project.create({
        data: {
            brandId: brand.id,
            title: 'Modern Tech Vlog Series',
            description: 'We need a high-energy editor for our weekly tech vlogs. Visual excellence is key.',
            niche: 'Video Editing',
            budget: 5000,
            deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
            status: 'ACTIVE',
        }
    });

    // Team Member
    await prisma.teamMember.create({
        data: {
            projectId: project.id,
            userId: creator.id,
            role: 'CREATOR_LEAD'
        }
    });

    console.log('Seeding completed successfully!');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
