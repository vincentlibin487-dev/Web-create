# Firestore Security Specification (Phase 0 TDD)

## 1. Data Invariants
1. **Master Source of Truth & Ownership**: Every `/users/{userId}/projects/{projectId}` document belongs strictly to `userId` and its `ownerId` field MUST equal `request.auth.uid` and `{userId}`.
2. **Verified Google Identity**: Standard reads and writes require `request.auth != null` and `request.auth.token.email_verified == true`.
3. **PII Isolation**: `/users/{userId}` contains `email` and profile PII. Only the owning user (`request.auth.uid == userId`) or a verified Admin (`isAdmin()`) may read it. `/published_sites/{siteId}` and `/daily_stats/{dateKey}` contain ZERO PII.
4. **Permanent Live Link Integrity**: Every `/published_sites/{siteId}` document can only be created by an authenticated owner whose referenced `/users/{uid}/projects/{projectId}` document exists. Updates/Republishes MUST preserve `siteId`, `projectId`, `ownerId`, and `createdAt`, increment `version` by 1, and use `request.time`. Public access is strictly single-document `get` (never `list`).
5. **Daily Stats Integrity & Atomicity**: Every `/daily_stats/{dateKey}/visitors/{visitorId}` write is atomically tied to `/daily_stats/{dateKey}` via `existsAfter` / `exists` and restricted to `isOwner(visitorId)`. Daily counters increment monotonically by +1.
6. **Immortal & Server-Enforced Fields**: `uid`, `id`, `siteId`, `projectId`, `ownerId`, and `createdAt` are immutable once written. `createdAt`, `lastLoginAt`, `updatedAt`, `publishedAt`, and `visitedAt` MUST equal `request.time`.
7. **Bounded Arrays & Strings**: `files` is bounded to `1 <= data.files.size() <= 15` and index 0 verified as a map with string `path` and `content`. Every string and document ID has strict `.size()` and regex bounds (`^[a-zA-Z0-9_\-]+$` or `^[0-9]{4}-[0-9]{2}-[0-9]{2}$`).

## 2. The "Dirty Dozen" Attack Payloads (All Must Return `PERMISSION_DENIED`)
1. **Unauthenticated Write**: Creating `/users/u1/projects/p1` or `/published_sites/site1` with `request.auth == null`.
2. **Unverified Email Spoof**: Creating/reading as admin email `amalj7767@gmail.com` when `request.auth.token.email_verified == false`.
3. **Cross-User Project Read/Write**: User `u2` attempting `get` or `create` on `/users/u1/projects/p1`.
4. **Cross-User PII Scraping**: User `u2` attempting `get` or `list` on `/users/u1` (or `/users`), or `list` on `/published_sites`.
5. **Identity Spoofing in Payload**: User `u1` creating `/published_sites/site1` with `ownerId: "u2"` or a nonexistent `projectId`.
6. **Shadow Ghost Field Injection**: Creating/updating a project, user, or published site with extra undocumented keys (e.g., `isAdmin: true`, `email: "leak"`).
7. **ID Poisoning Attack**: Creating `/published_sites/bad$id` or `/daily_stats/not-a-date`.
8. **Immutable Field Mutation**: Updating `ownerId`, `siteId`, `projectId`, or `createdAt` on `/published_sites/{siteId}` during Republish.
9. **Client Timestamp Forgery**: Creating/updating with `updatedAt` or `publishedAt` set to a forged past/future timestamp instead of `request.time`.
10. **Array Exhaustion / Invalid Element Type**: Creating a project with `files: []`, `files` > 15 items, or `files: ["not-a-map"]`.
11. **Oversized String Denial-of-Wallet**: Creating a published site with `title.size() > 150` or `fullCode.size() > 350000`.
12. **Privilege Escalation**: Non-admin user attempting to write to `/admins/{uid}`, list `/users`, list `/daily_stats`, or overwrite another user's `/daily_stats/{dateKey}/visitors/{uid}`.
