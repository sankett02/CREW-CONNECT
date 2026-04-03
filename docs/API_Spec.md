# API Specification (v2)

## Auth
- `POST /api/auth/register` (email, password, role)
- `POST /api/auth/login` (email, password)

## Profiles
- `GET /api/profiles/:userId`
- `PUT /api/profiles/:userId` (Protected: Owner)
- `GET /api/profiles/search` (Query: role, niche, skill)

## Projects & Applications (Sprint 2)
- `POST /api/projects` (Protected: Brand)
- `GET /api/projects` (Filter by status, niche)
- `POST /api/projects/:id/apply` (Protected: Creator)
- `POST /api/projects/:id/invite` (Protected: Brand)
- `PUT /api/applications/:id` (Accept/Reject)

## Team Formation (Sprint 2)
- `POST /api/projects/:id/team` (Protected: Lead Creator) - Add writer/editor
- `DELETE /api/projects/:id/team/:userId` (Protected: Lead Creator)

## Workspace & Milestones (Sprint 3)
- `GET /api/projects/:id/messages`
- `POST /api/projects/:id/messages`
- `GET /api/projects/:id/milestones`
- `PUT /api/milestones/:id/submit` (Protected: Team)
- `PUT /api/milestones/:id/approve` (Protected: Brand)
- `PUT /api/milestones/:id/request-changes` (Protected: Brand)

## Trust & Admin
- `POST /api/ratings` (Protected: Requires completed project)
- `PUT /api/admin/verify/:userId` (Protected: Admin)
- `POST /api/admin/flag` (Protected: Admin)
- `GET /api/admin/disputes`

## Payments (Phase 1)
- `POST /api/payments/mark-paid` (Protected: Brand)
- `GET /api/projects/:id/payments`
