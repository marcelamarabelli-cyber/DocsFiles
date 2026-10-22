# DocsFiles Progress Checkpoint — 2026-10-22

## Goal
Finish secure TaxesDeal DocsFiles client portal and admin dashboard, then invite real clients. Do not merge review branch or invite clients until security and regression checks pass. After launch, focus on growing TaxesDeal revenue and finishing Marcela's memoir/book.

## Repository / deployment
- GitHub: marcelamarabelli-cyber/DocsFiles
- Review branch: docsfiles-cloud-documents-review-20261022
- Draft PR #1; base main. Keep live docsfiles.com unchanged until approved.
- Vercel preview confirmed: https://docsfiles-48mubzsut-docs-files.vercel.app/
- Supabase project: fdtudiwqlbwjhjlzdbnf
- Supabase private Storage bucket: client-documents
- Metadata table: public.client_documents

## Confirmed breakthrough
- Two client-uploaded PDF records exist in Supabase for Marcela (client code TD-0003), folder_id bookkeeping:
  - f8879 (1).pdf
  - f8821.pdf
- Screenshot from 2026-10-22 12:40 PM showed the Vercel PREVIEW admin Bookkeeping folder displaying TOTAL FILES 2, REVIEWED 0, PENDING 2, and an uploaded file listed. This confirms the admin document list can see the cloud metadata. Actual PDF preview/download and cross-device access remain to be verified.
- Prior screenshot confirmed deployment at commit f2952c5 was Ready and Preview, not live.
- User reported outer folder/client-card count appeared as 0/empty until opening folder; folder detail showed 2. Added count directly to each admin client card in commit 10f0696cf5bb38190e8cb1f1245bfef1a90f13e1. NOT YET TESTED; check next Vercel Ready preview.

## Key changes on review branch
- Cloud upload/list/update support via app/lib/cloudDocuments.ts, app/components/UploadZone.tsx and portal.
- Admin app/page.tsx maps client IDs to client_code for document matching (earlier commit 2ed9d5e); watch for regression because other code may expect UUID.
- Admin polls listCloudDocuments() approximately every 5 seconds and merges cloud metadata with local documents; polling is not true realtime.
- Diagnostic Admin cloud sync status added in commit f2952c5.
- Admin client-card file count added in commit 10f0696. User still needs to test that count.

## Important security issue — MUST FIX BEFORE INVITES
Supabase public.client_documents SELECT and INSERT policies were inspected. Existing client_access predicate contained `ca.client_id = ca.client_id` (tautology), which can allow a signed-in client associated with ANY client_access row to access documents belonging to other clients. Replace with a proper per-document association (for example ca.client_id = client_documents.client_id, using correct code/UUID representation) while preserving verified admin access. Test RLS as distinct client identities; do not expose sensitive PDFs or use service_role in browser. Review storage.objects policies too.
- Confirm SELECT and INSERT authorization, RLS enabled, appropriate grants, and that client users cannot read other clients' metadata or files.
- Test admin and client logins separately.

## Launch checklist (not yet completed)
1. Test new admin client-card file counter; folder tiles should show correct counts without opening.
2. Verify admin can securely preview/download the two PDFs, across browsers/devices; no reupload or deletion of existing data.
3. Correct RLS cross-client exposure; verify storage policies and user-scoped access.
4. Review client/admin identity mapping: client_code TD-0003 vs UUID; fix potential regressions in client photo/status/delete/update/invitation routes.
5. Verify admin-only Accountant Notes and preparer tools stay hidden from clients.
6. Finish client_messages RLS and two-way messaging, persistent after refresh.
7. Test forgot-password/invite flow with authorized test client (Silvina); confirm each client only sees own files.
8. Verify PayPal payment capture, receipts, and success redirect; prevent owner self-payment.
9. Verify Reviewed checkbox, upload metadata, statuses, folder counts, and Completed status; merge John & Lisa Cunat records carefully.
10. Remove internal TD IDs from client-facing UI; preserve admin identification.
11. Full regression and security test before PR merge to main, production deployment, and inviting real clients.
12. PixelAssistant and future multi-business clone are later; finish and freeze stable TaxesDeal version first.

## Next session
User went to Shipt work. When she returns: wait for Vercel preview Ready for commit 10f0696, check Marcela client card count (should show 2). If still zero, inspect card filtering/state instead of re-uploading. Prioritize fixing RLS security before onboarding. Keep instructions short, one step at a time.

## Other priorities after launch
- Grow TaxesDeal income and invite clients to the secure portal.
- Finish Marcela's memoir/book (manuscript, illustrations, cover, PDF/KDP and audiobook planning) with target before 2027.
