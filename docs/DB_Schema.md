# DB Schema (v2)

## Users & Profiles
- `User`: `id`, `email`, `passwordHash`, `role` (Enum), `isVerified`, `isFlagged`
- `Profile`: `userId`, `displayName`, `bio`, `nicheTags` (String[]), `skills` (String[]), `portfolioLinks`, `socialLinks`, `ratingAvg`

## Projects & Applications
- `Project`: `id`, `brandId`, `title`, `description`, `niche`, `budget`, `deadline`, `status` (DRAFT, ACTIVE, COMPLETED, CANCELLED)
- `Application`: `id`, `projectId`, `creatorId`, `status` (PENDING, ACCEPTED, REJECTED), `message`

## Team Formation
- `TeamMember`: `id`, `projectId`, `userId`, `role` (CREATOR_LEAD, WRITER, EDITOR)

## Workspace
- `Message`: `id`, `projectId`, `senderId`, `content`, `createdAt`
- `Milestone`: `id`, `projectId`, `title` (SCRIPT, EDIT, FINAL), `status` (PENDING, SUBMITTED, APPROVED, CHANGES_REQUESTED), `comments` (Text)

## Trust & Admin
- `Rating`: `id`, `projectId`, `reviewerId`, `revieweeId`, `score`, `review`
- `Dispute`: `id`, `projectId`, `parties` (JSON), `notes`, `status` (OPEN, RESOLVED)

## Payments (Manual Record)
- `PaymentRecord`: `id`, `projectId`, `amount`, `payerId`, `milestoneId`, `payoutSplit` (JSON), `status` (PENDING, PAID)
