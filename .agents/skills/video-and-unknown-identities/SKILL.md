---
name: video-and-unknown-identities
description: >-
  Guide for implementing and managing facial recognition review, unknown identities assignment/trashing/restoring, video playback, and S3 presigned asset resolution in Pythia 2.0.
---

# Video & Unknown Identities Guide

This guide covers managing facial recognition reviews, resolving unknown face detections, assign/trash/restore workflows, and secure S3 asset presigning.

## Core Features & Routes

1. **Unknown Identities** (`/manager/unknown-identities` & `/super-admin/manager/unknown-identities`)
   - Unresolved face detections captured by store cameras.
   - Manager reviews face crops and assigns them to an existing employee or trashes low-quality / non-employee detections.
2. **Video Identities** (`/manager/video-identities` & `/super-admin/manager/video-identities`)
   - Complete video logs of pipeline recognitions.
   - Shows matched employees, confidence score, timestamps, and video playback with bounding boxes.

---

## Unknown Identities Workflow

### Queries ([`src/queries/unknown-identities.ts`](file:///home/vikalp/workspaces/inx/pythia/Pythia2.0-frontend1/src/queries/unknown-identities.ts))
- `fetchUnknownIdentities({ token, skip, limit })`: Lists unresolved face crops.
- `assignUnknownIdentity({ token, identityId, employeeId })`: Links face to employee.
- `trashUnknownIdentity({ token, identityId })`: Soft-deletes face crop into trash tab.
- `fetchTrashedIdentities({ token, skip, limit })`: Lists trashed detections.
- `restoreUnknownIdentity({ token, identityId })`: Restores crop from trash back to active review.

### UI Carousel & Infinite Paging
In `UnknownIdentitiesPanel.tsx`:
- Hydrates initial list from SSR props (`initialData`).
- When the active index reaches within 5 items of the loaded array end, triggers `fetchUnknownIdentities` with `skip: identities.length` to seamlessly load the next batch.

---

## Video Identities & S3 Presigned Asset Resolution

### Queries ([`src/queries/video-identities.ts`](file:///home/vikalp/workspaces/inx/pythia/Pythia2.0-frontend1/src/queries/video-identities.ts))
- `fetchVideoIdentities({ token, skip, limit, status, search, startDate, endDate })`: Paginated video recognition events.
- `fetchVideoIdentityStats({ token })`: Overall metrics (total videos, match rate, unmatched count).
- `presignVideoIdentityKeys({ token, keys })`: On-demand S3 URL resolution for video playback and thumbnails.

### Secure S3 Asset Handling
To prevent leaking video and image assets:
- Videos and face crops are stored in private S3 buckets.
- Keys are never converted into public URLs client-side.
- The UI calls `presignVideoIdentityKeys` **on demand** only when a manager clicks to inspect or play a specific video.
- S3 asset base URL helper for static images: `getS3AssetUrl(key)` in `src/utils/common.ts`.

