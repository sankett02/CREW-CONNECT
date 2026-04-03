import { Router } from 'express';
import { createProject, getProjects, getProjectById, updateProject } from '../controllers/projects';
import { applyToProject, handleApplication, inviteToProject, getMyApplications } from '../controllers/applications';
import { addTeamMember, removeTeamMember } from '../controllers/teams';
import { getMessages, sendMessage } from '../controllers/messages';
import { getMilestones, createMilestone, updateMilestoneStatus } from '../controllers/milestones';
import { createRating, getProjectRatings } from '../controllers/ratings';
import { getPayments, createPayment } from '../controllers/payments';
import { getProjectActivity } from '../controllers/activity';
import { authenticate } from '../middleware/auth';

const router = Router();

// Project discovery & info
router.get('/', getProjects);
router.get('/:id', getProjectById);

// Brand actions
router.post('/', authenticate, createProject);
router.put('/applications/:applicationId', authenticate, handleApplication);
router.post('/:projectId/invite', authenticate, inviteToProject);
router.patch('/:id', authenticate, updateProject);

// Creator actions
router.get('/applications/me', authenticate, getMyApplications);
router.post('/:projectId/apply', authenticate, applyToProject);

// Team management (Creator Lead)
router.post('/:projectId/team', authenticate, addTeamMember);
router.delete('/:projectId/team/:memberId', authenticate, removeTeamMember);

// ── Sprint 3: Workspace ─────────────────────────────────
// Chat
router.get('/:projectId/messages', authenticate, getMessages);
router.post('/:projectId/messages', authenticate, sendMessage);

// Milestones
router.get('/:projectId/milestones', authenticate, getMilestones);
router.post('/:projectId/milestones', authenticate, createMilestone);
router.patch('/:projectId/milestones/:milestoneId', authenticate, updateMilestoneStatus);

// Ratings (only after completion)
router.get('/:projectId/ratings', authenticate, getProjectRatings);
router.post('/:projectId/ratings', authenticate, createRating);

// Payments
router.get('/:projectId/payments', authenticate, getPayments);
router.post('/:projectId/payments', authenticate, createPayment);

// Activity
router.get('/:projectId/activity', authenticate, getProjectActivity);

export default router;
