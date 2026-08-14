# Future extension points

The MVP keeps the following seams explicit without implementing the features yet.

## Video delivery

`VideoProvider`, `videoId`, `url`, captions, transcript, and production status live in content data rather than the player. A provider adapter can add Mux signed playback, Vimeo, or institutional hosting without changing lesson routes.

## Content authoring and CMS

The typed file-backed content API is the boundary for a future instructor CMS. A CMS should emit the same `Course`, `Module`, `Lesson`, and `LessonBlock` structures so the renderer remains stable. MDX may be introduced as an authoring layer, provided it compiles into validated blocks.

## Connected progress and analytics

The progress context currently persists anonymous, local-only state in the visitor's browser. If accounts are added later, a Supabase repository implementation can expose the same enroll, mark-complete, and record-view operations. Course analytics should aggregate privacy-preserving events on the server and must never weaken RLS.

## Quizzes and certificates

Add reviewed assessment block types and a versioned attempt model. Completion should remain distinct from correctness. Certificates should depend on explicit course requirements, not raw video playback.

## AI tutor and semantic search

A future tutor must cite approved lesson and source material, distinguish educational guidance from project-specific protocol, and avoid fabricating FSL output. Embeddings can replace local search behind the existing `SearchResult` interface.

## Institutional accounts and paid courses

Supabase Auth can be replaced or extended with institutional SSO. Entitlements should be server-validated and kept separate from lesson content. No payment or access-control assumptions are embedded in the current content schema.

## Neurodesk validation

Automated validation would require an authorized execution environment and an explicit, sandboxed handoff. The browser application must not begin executing FSL or uploading research data merely by adding a lesson block.

## Student notes and instructor workflows

Notes can reference stable lesson IDs and optional block anchors. Production manifests under `production/metadata/` provide the starting point for narration, storyboards, captions, scientific review, and publication automation.
