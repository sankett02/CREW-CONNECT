# PRD: Creative Collaboration Marketplace MVP (v2)

## 1. Executive Summary
A platform connecting Brands, Creators, Writers, and Editors to form teams around creative projects. Key features include team formation, milestone-based workflows, and integrated trust/payment records.

## 2. Sprint Breakdown

### Sprint 1: Foundation & Auth & Profiles (Active)
- **Roles:** Brand, Creator, Writer, Editor.
- **Auth:** JWT-based signup/login.
- **Profiles:** Bio, niche tags, skills, portfolio, social links.
- **Talent Discovery:** Filter users by role, niche, and skills.

### Sprint 2: Projects & Team Formation
- **Project Posting:** Brands post project briefs (niche, budget, deadline).
- **Application/Invite:** Creators apply; Brands can invite creators.
- **Team Workflow:** Team slots per project (Creator, Writer, Editor). Add/Remove support.
- **Permissions:** Creators manage their teams; Brands manage the project.

### Sprint 3: Project Workspace (Collaboration)
- **Chat:** Lightweight messaging for the project team.
- **Milestones:** Board with Script, Edit, Final stages.
- **Approvals:** Approve/Request changes with comments.
- **Ratings:** 1-5 star ratings + reviews unlocked only after project completion.

### Admin & Trust
- **Verification:** Toggleable manual badge.
- **Moderation:** Flag users and projects.
- **Disputes:** Log for projects with notes and status.

### Payments (Phase 1: Manual Escrow Record)
- **PaymentRecord:** Track project_id, amount, payer, status, payout_split.
- **Workflow:** Brands mark milestones as "Paid". Team views status.

### Beta Deployment
- Production builds, migrations, logging, security checklists, and deployment guides.
