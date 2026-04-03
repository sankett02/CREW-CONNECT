import { Request, Response } from 'express';
import prisma from '../lib/prisma';
import { AuthRequest } from '../middleware/auth';

export const getProfile = async (req: Request, res: Response) => {
    try {
        const { userId } = req.params;
        const profile = await prisma.profile.findUnique({
            where: { userId },
            include: {
                user: {
                    select: {
                        email: true,
                        role: true,
                        isVerified: true,
                        stripeAccountId: true,
                        ratingsReceived: {
                            include: {
                                reviewer: {
                                    select: {
                                        profile: {
                                            select: {
                                                displayName: true,
                                            }
                                        }
                                    }
                                }
                            },
                            orderBy: { id: 'desc' }
                        },
                        teamMemberAt: {
                            where: {
                                project: { status: 'COMPLETED' }
                            },
                            include: {
                                project: true
                            }
                        }
                    }
                }
            },
        });

        if (!profile) {
            return res.status(404).json({ message: 'Profile not found' });
        }

        res.json(profile);
    } catch (error) {
        console.error('Get profile error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

export const updateProfile = async (req: AuthRequest, res: Response) => {
    try {
        const { userId } = req.params;
        const loggedInUserId = req.user?.userId;

        if (userId !== loggedInUserId) {
            return res.status(403).json({ message: 'Unauthorized to update this profile' });
        }

        const { 
            displayName, bio, nicheTags, skills, 
            portfolioLinks, socialLinks, websiteUrl, 
            portfolioUrl, companyName, brandType, hourlyRate,
            profileImage
        } = req.body;

        const profile = await prisma.profile.update({
            where: { userId },
            data: {
                displayName,
                bio,
                nicheTags,
                skills,
                socialLinks: typeof socialLinks === 'object' ? JSON.stringify(socialLinks) : socialLinks,
                portfolioLinks: typeof portfolioLinks === 'object' ? JSON.stringify(portfolioLinks) : portfolioLinks,
                websiteUrl,
                portfolioUrl,
                companyName,
                brandType,
                hourlyRate: hourlyRate !== undefined ? Number(hourlyRate) : undefined,
                profileImage
            },
        });

        res.json(profile);
    } catch (error) {
        console.error('Update profile error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

export const searchTalent = async (req: Request, res: Response) => {
    try {
        const { role, niche, skill } = req.query;

        const where: Record<string, unknown> = {
            user: {} as Record<string, unknown>,
        };

        if (role) {
            (where.user as Record<string, unknown>).role = role;
        } else {
            (where.user as Record<string, unknown>).role = { not: 'BRAND' };
        }

        if (niche) {
            where.nicheTags = { contains: niche as string };
        }

        if (skill) {
            where.skills = { contains: skill as string };
        }

        const profiles = await prisma.profile.findMany({
            where,
            include: {
                user: { select: { email: true, role: true, isVerified: true } },
            },
        });

        res.json(profiles);
    } catch (error) {
        console.error('Search talent error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};
