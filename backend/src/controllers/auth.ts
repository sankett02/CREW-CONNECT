import { Request, Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { OAuth2Client } from 'google-auth-library';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import prisma from '../lib/prisma';
import crypto from 'crypto';
import { sendEmail } from '../utils/sendEmail';


const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret';

export const register = async (req: Request, res: Response) => {
    try {
        const {
            email, password, role, adminSecret,
            companyName, websiteUrl, bio,
            category, contactNumber, socialLinks,
            portfolioLinks, profileImage, displayName, skills, nicheTags
        } = req.body;

        if (!email || !password || !role) {
            return res.status(400).json({ message: 'Missing required fields' });
        }

        // Admin Security Check
        if (role === 'ADMIN') {
            const secret = process.env.ADMIN_REGISTRATION_SECRET || 'crewconnect_admin_secret_2026';
            if (adminSecret !== secret) {
                return res.status(403).json({ message: 'Invalid Admin Registration Secret' });
            }
        }

        const existingUser = await prisma.user.findUnique({ where: { email } });
        if (existingUser) {
            return res.status(400).json({ message: 'User already exists' });
        }

        const passwordHash = await bcrypt.hash(password, 10);

        const isRootAdmin = email === process.env.ROOT_ADMIN_EMAIL;

        // Generate OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

        const user = await prisma.user.create({
            data: {
                email,
                passwordHash,
                role,
                isVerified: role === 'ADMIN' ? isRootAdmin : false,
                otp,
                otpExpires,
                profile: {
                    create: {
                        displayName: displayName || (role === 'BRAND' ? companyName : email.split('@')[0]) || email.split('@')[0],
                        companyName,
                        websiteUrl,
                        bio,
                        category,
                        contactNumber,
                        socialLinks: socialLinks ? JSON.stringify(socialLinks) : null,
                        portfolioLinks: portfolioLinks ? JSON.stringify(portfolioLinks) : null,
                        profileImage,
                        skills,
                        nicheTags,
                    },
                },
            },
            include: {
                profile: true,
            },
        });

        // Send OTP Email
        if (!user.isVerified) {
            await sendEmail({
                to: email,
                subject: 'Verify Your CrewConnect Account',
                html: `
                    <h2>Welcome to CrewConnect!</h2>
                    <p>Please use the following OTP to verify your email address. This code is valid for 10 minutes.</p>
                    <h1 style="font-size: 32px; letter-spacing: 5px; color: #6366f1;">${otp}</h1>
                    <p>If you didn't request this, please ignore this email.</p>
                `
            });
        }

        res.status(201).json({ 
            message: user.isVerified ? 'Registration successful' : 'Verification required',
            userId: user.id,
            requireVerification: !user.isVerified
        });
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

export const login = async (req: Request, res: Response) => {
    try {
        const { email, password, expectedRole } = req.body;

        const user = await prisma.user.findUnique({
            where: { email },
            include: { profile: true },
        });

        if (!user) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
        if (!isPasswordValid) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        // 🔒 Role enforcement: reject if the user is trying to log in from the wrong portal
        if (expectedRole) {
            const isCreatorPortal = expectedRole === 'CREATOR';
            const isCreatorType = ['CREATOR', 'WRITER', 'EDITOR'].includes(user.role);
            
            if (isCreatorPortal && !isCreatorType) {
                return res.status(403).json({
                    message: `This account is registered as a Brand. Please log in from the Brand portal.`,
                });
            }
            
            if (!isCreatorPortal && user.role !== expectedRole) {
                const roleNames: Record<string, string> = {
                    BRAND: 'Brand',
                    CREATOR: 'Creator',
                    WRITER: 'Writer',
                    EDITOR: 'Editor',
                    ADMIN: 'Admin',
                };
                const correctPortal = roleNames[user.role] || user.role;
                return res.status(403).json({
                    message: `This account is registered as a ${correctPortal}. Please log in from the ${correctPortal} portal.`,
                });
            }
        }

        const token = jwt.sign({ userId: user.id, role: user.role }, JWT_SECRET, { expiresIn: '7d' });

        res.json({ user, token });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};


export const forgotPassword = async (req: Request, res: Response) => {
    try {
        const { email } = req.body;
        if (!email) {
            return res.status(400).json({ message: 'Email is required' });
        }

        const user = await prisma.user.findUnique({ where: { email } });
        if (!user) {
            // Return 200 even if user doesn't exist to prevent email enumeration
            return res.status(200).json({ message: 'If that email exists, a reset link has been sent.' });
        }

        // Generate a random token
        const resetToken = crypto.randomBytes(20).toString('hex');
        const resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');
        
        // Token expires in 1 hour
        const resetPasswordExpires = new Date(Date.now() + 3600000);

        await prisma.user.update({
            where: { email },
            data: { resetPasswordToken, resetPasswordExpires },
        });

        const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
        const resetUrl = `${frontendUrl}/reset-password/${resetToken}`;

        const message = `
            <h2>Password Reset Request</h2>
            <p>You requested a password reset for your CrewConnect account.</p>
            <p>Please click the link below to set a new password. This link is valid for 1 hour.</p>
            <a href="${resetUrl}">${resetUrl}</a>
            <p>If you did not request this, please ignore this email.</p>
        `;

        try {
            await sendEmail({
                to: user.email,
                subject: 'CrewConnect Password Reset',
                html: message,
            });
            res.status(200).json({ message: 'If that email exists, a reset link has been sent.' });
        } catch (error) {
            await prisma.user.update({
                where: { email },
                data: { resetPasswordToken: null, resetPasswordExpires: null },
            });
            console.error('Email send error:', error);
            res.status(500).json({ message: 'Email could not be sent' });
        }
    } catch (error) {
        console.error('Forgot password error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

export const resetPassword = async (req: Request, res: Response) => {
    try {
        const { token } = req.params;
        const { password } = req.body;

        if (!password) {
            return res.status(400).json({ message: 'New password is required' });
        }

        const resetPasswordToken = crypto.createHash('sha256').update(token).digest('hex');

        const user = await prisma.user.findFirst({
            where: {
                resetPasswordToken,
                resetPasswordExpires: { gt: new Date() },
            },
        });

        if (!user) {
            return res.status(400).json({ message: 'Invalid or expired password reset token' });
        }

        const passwordHash = await bcrypt.hash(password, 10);

        await prisma.user.update({
            where: { id: user.id },
            data: {
                passwordHash,
                resetPasswordToken: null,
                resetPasswordExpires: null,
            },
        });

        res.status(200).json({ message: 'Password has been successfully updated' });
    } catch (error) {
        console.error('Reset password error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID as string);

export const googleAuth = async (req: Request, res: Response) => {
    try {
        const { credential, role } = req.body;

        if (!credential) {
            return res.status(400).json({ message: 'Google credential missing' });
        }

        // Verify the token
        const ticket = await googleClient.verifyIdToken({
            idToken: credential,
            audience: process.env.GOOGLE_CLIENT_ID as string,
        });

        const payload = ticket.getPayload();
        if (!payload || !payload.email) {
            return res.status(400).json({ message: 'Invalid Google token payload' });
        }

        const { email, name, picture } = payload;

        let user = await prisma.user.findUnique({
            where: { email },
            include: { profile: true },
        });

        // 1. User doesn't exist?
        if (!user) {
            // If it's a login attempt (no isSignup flag), reject!
            if (!req.body.isSignup) {
                return res.status(404).json({ message: 'User not found. Please register first!' });
            }

            // Fallback to auto-verification if role is missing (should be provided via getPayload)
            if (!role) {
                return res.status(400).json({ message: 'Role is required for new Google signups' });
            }

            const { 
                companyName, websiteUrl, bio, 
                category, contactNumber, socialLinks, 
                portfolioLinks, profileImage, displayName, skills, nicheTags 
            } = req.body;

            // Generate a random secure password hash since they use Google
            const randomPassword = crypto.randomBytes(32).toString('hex');
            const passwordHash = await bcrypt.hash(randomPassword, 10);

            user = await prisma.user.create({
                data: {
                    email,
                    passwordHash,
                    role,
                    isVerified: true, // Google accounts are auto-verified
                    profile: {
                        create: {
                            displayName: displayName || (role === 'BRAND' ? companyName : name) || email.split('@')[0],
                            companyName,
                            websiteUrl,
                            bio,
                            category,
                            contactNumber,
                            socialLinks: socialLinks ? JSON.stringify(socialLinks) : null,
                            portfolioLinks: portfolioLinks ? JSON.stringify(portfolioLinks) : null,
                            profileImage: profileImage || picture,
                            skills,
                            nicheTags,
                        },
                    },
                },
                include: {
                    profile: true,
                },
            });
        }

        // 2. User exists (or was just created) -> Log them in!
        const token = jwt.sign({ userId: user.id, role: user.role }, JWT_SECRET, { expiresIn: '7d' });

        res.json({ user, token });

    } catch (error) {
        console.error('Google auth error:', error);
        res.status(500).json({ message: 'Failed to authenticate with Google' });
    }
};
export const verifyOTP = async (req: Request, res: Response) => {
    try {
        const { userId, otp } = req.body;
        if (!userId || !otp) {
            return res.status(400).json({ message: 'Missing userId or OTP' });
        }

        const user = await prisma.user.findUnique({
            where: { id: userId },
            include: { profile: true }
        });

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        if (user.isVerified) {
            return res.status(400).json({ message: 'User is already verified' });
        }

        if (user.otp !== otp) {
            return res.status(400).json({ message: 'Invalid OTP' });
        }

        if (user.otpExpires && user.otpExpires < new Date()) {
            return res.status(400).json({ message: 'OTP has expired' });
        }

        const updatedUser = await prisma.user.update({
            where: { id: userId },
            data: {
                isVerified: true,
                otp: null,
                otpExpires: null
            },
            include: { profile: true }
        });

        const token = jwt.sign({ userId: updatedUser.id, role: updatedUser.role }, JWT_SECRET, { expiresIn: '7d' });

        res.json({ user: updatedUser, token });
    } catch (error) {
        console.error('Verify OTP error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

export const resendOTP = async (req: Request, res: Response) => {
    try {
        const { userId } = req.body;
        if (!userId) {
            return res.status(400).json({ message: 'Missing userId' });
        }

        const user = await prisma.user.findUnique({ where: { id: userId } });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        if (user.isVerified) {
            return res.status(400).json({ message: 'User is already verified' });
        }

        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const otpExpires = new Date(Date.now() + 10 * 60 * 1000);

        await prisma.user.update({
            where: { id: userId },
            data: { otp, otpExpires }
        });

        await sendEmail({
            to: user.email,
            subject: 'Your New CrewConnect OTP',
            html: `
                <h2>Email Verification</h2>
                <p>Use the following code to verify your account. It expires in 10 minutes.</p>
                <h1 style="font-size: 32px; letter-spacing: 5px; color: #6366f1;">${otp}</h1>
            `
        });

        res.json({ message: 'OTP resent successfully' });
    } catch (error) {
        console.error('Resend OTP error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

export const getMe = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user?.userId;
        if (!userId) {
            return res.status(401).json({ message: 'Unauthorized' });
        }

        const user = await prisma.user.findUnique({
            where: { id: userId },
            include: { profile: true },
        });

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.json({ user });
    } catch (error) {
        console.error('Get Me error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

