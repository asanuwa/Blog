# TODO

## Comment Deletion + Counter Sync

- [x] Inspect frontend comment UI: deletion flow was missing for comments; only add-comment existed.
- [x] Add backend endpoint to delete a comment by `commentId` under a `blogId`.
- [x] Ensure deletion returns updated `commentCount`.
- [x] Add frontend hook `useDeleteComment` and wire it into the comment list.
- [x] Update comment count state and invalidate/refetch comments plus blog list/detail caches.

## Bliss Naming

- [x] Update `blog-frontend/src/app/about/about-client.tsx` strings and any alt/heading text.
- [x] Update `blog-frontend/src/components/layout/navbar.tsx` strings and alt text.
- [x] Rename image asset to `/blissPng.jpeg`.
