# FSL Academy

FSL Academy is a video-first, self-paced learning platform for graduate students and researchers learning fMRI analysis with FSL. It combines short conceptual videos, real Neurodesk/FEAT walkthroughs, written explanations, practical tasks, expected output, and contextual troubleshooting.

The application is deliberately focused: it is not a full LMS, does not execute FSL in the browser, and does not include automated grading, payments, certificates, discussion, or AI tutoring.

## What is included

- Six-course curriculum with fully populated Foundations and First-Level FEAT courses
- Typed, block-based lesson renderer
- Course catalog, course detail, lesson player, and student dashboard
- Manual enrollment and lesson completion
- Demo mode with browser-local progress
- Supabase authentication clients, callback route, schema, and row-level security
- Search across courses, lessons, glossary, and troubleshooting
- Searchable glossary and categorized troubleshooting center
- Replaceable video-provider metadata with transcript and caption fields
- Responsive desktop/mobile UI and reduced-motion support
- Source attribution, production metadata scaffold, tests, and future extension notes

## Technology

- Next.js 16 App Router
- React 19 and TypeScript
- Tailwind CSS 4 (the visual system is authored as semantic CSS in `app/globals.css`)
- Supabase Auth and Postgres scaffolding
- Vitest for domain tests
- Vercel-compatible runtime

## Architecture

```text
app/                         routes and route-level composition
components/
  course/                    catalog and curriculum UI
  lesson/                    lesson workspace and block renderer
  auth/                      demo/Supabase authentication form
  search/                    glossary and troubleshooting browsers
lib/
  content/                   typed course, glossary, help, and search data
  progress/                  demo enrollment/completion domain logic
  supabase/                  browser and server clients
production/                  future video-production workflow
supabase/migrations/         database schema and RLS policies
public/curriculum/           attributed source-curriculum screenshots
```

Course and video data are independent. A lesson route is generated from `Course → Module → Lesson`, while `LessonBlock` determines presentation. Replacing a planned Mux video with Vimeo or YouTube does not change the course model or route.

## Local setup

Requirements: Node.js 20.9 or newer and npm.

```bash
git clone https://github.com/dwamenad/Voxelwise-Lab.git
cd Voxelwise-Lab
cp .env.example .env.local
npm install
npm run dev
```

Open <http://localhost:3000>. Demo mode is enabled in `.env.example`, so no paid service or Supabase project is required.

## Environment variables

```env
NEXT_PUBLIC_DEMO_MODE=true
NEXT_PUBLIC_SITE_URL=http://localhost:3000
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
```

The app automatically uses demo mode when Supabase credentials are absent, even if `NEXT_PUBLIC_DEMO_MODE` is not explicitly set. Demo state is stored under `fsl-academy-demo-progress-v1` in browser local storage.

## Connected Supabase mode

1. Create a Supabase project.
2. Run `supabase/migrations/202608090001_initial_learning_schema.sql` with the Supabase CLI or SQL editor.
3. Add the project URL and publishable/anon key to `.env.local`.
4. Set `NEXT_PUBLIC_DEMO_MODE=false`.
5. Add `http://localhost:3000/auth/callback` and the deployed callback URL to Supabase Auth redirect URLs.
6. Enable email/password and, optionally, GitHub under Authentication → Providers.

The migration creates `profiles`, `courses`, `enrollments`, and `lesson_progress`. Row Level Security allows students to read and modify only their own profile, enrollments, and progress. Published course metadata is publicly readable; lesson content remains file-backed.

Demo progress is intentionally local. The UI-to-database adapter is the seam for syncing connected enrollments and progress in the next production phase.

## Content schema

The domain types live in `lib/types.ts`. A course contains modules and lessons:

```ts
const course: Course = {
  id: "course-example",
  slug: "example-course",
  catalogNumber: "FSL 500",
  title: "Example Course",
  shortTitle: "Example",
  description: "A concise course description.",
  difficulty: "Intermediate",
  status: "available",
  duration: "4 weeks · 6 hours",
  prerequisites: ["FSL Foundations"],
  objectives: ["Explain the workflow"],
  requirements: ["Neurodesk with FSL"],
  neurodeskRequired: true,
  accent: "mint",
  sourceLabs: ["Lab-X.md"],
  modules: [],
  resources: [],
};
```

### Add a module and lesson

1. Add the course file under `lib/content/` or extend an existing course.
2. Add a `CourseModule` with a stable `id`, numeric order, title, and lessons.
3. Add a lesson with a unique `id` and route-safe `slug`.
4. Add the blocks in reading order.
5. Add source and production metadata.
6. Run tests and build; `generateStaticParams` picks up routes automatically.

```ts
const lesson: Lesson = {
  id: "example-contrast",
  slug: "understanding-a-contrast",
  number: "2.3",
  title: "Understanding a contrast",
  description: "Turn model estimates into a focused hypothesis.",
  durationMinutes: 24,
  objectives: ["Write and interpret contrast weights"],
  blocks: [
    {
      type: "concept",
      title: "What is a contrast?",
      body: "A contrast specifies a hypothesis using weights on parameter estimates.",
      terms: ["contrast", "cope"],
    },
  ],
  production: {
    sourceLab: "Lab-3_FSL_Level1.md",
    sourceSection: "Contrasts",
    scientificReviewStatus: "pending",
    videoStatus: "planned",
  },
};
```

Supported block types are text, heading, video, image, command, callout, concept, Neurodesk task, expected output, troubleshooting, download, self-check, and summary.

### Add a video

Every video includes a provider, type, duration, status, transcript, and optional caption path:

```ts
{
  type: "video",
  videoType: "walkthrough",
  title: "Building your first FEAT model",
  provider: "mux",
  videoId: null,
  durationMinutes: 14,
  status: "planned",
  captionsPath: "/production/captions/building-feat.vtt",
  transcript: "Reviewed transcript text…",
}
```

To publish, set the appropriate provider and URL/playback data, change `status` to `published`, and add reviewed captions and transcript content. The current renderer accepts a configured embed URL without coupling course data to one host.

### Add a download

Use a `download` lesson block for an in-context resource, or add a `CourseResource` to the course overview. Keep large neuroimaging datasets on an appropriate external repository; do not commit them to this application.

## Progress behavior

- Enrollment is explicit.
- Opening a lesson records the last viewed route.
- A student manually marks a lesson complete.
- “Next lesson” also marks the current lesson complete.
- Video playback alone never implies completion.
- Course completion is the rounded percentage of completed lessons.

## Quality checks

```bash
npm run lint
npm run typecheck
npm test
npm run build
```

The tests cover content loading, dynamic lesson lookup, route data integrity, enrollment, manual progress, completion percentage, protected-route logic, and glossary/global search.

## Deployment to Vercel

1. Import the repository into Vercel.
2. Keep `NEXT_PUBLIC_DEMO_MODE=true` for a review deployment, or add Supabase environment variables for connected mode.
3. Set `NEXT_PUBLIC_SITE_URL` to the production URL.
4. Add the production auth callback URL in Supabase if connected mode is enabled.
5. Deploy with the standard Next.js build command: `npm run build`.

No paid video or data API is required for the current MVP.

## Attribution

The curriculum is adapted from [tubric/2026s-fmri-class](https://github.com/tubric/2026s-fmri-class) by the Temple University Brain Research and Imaging Center under the MIT License. See `ATTRIBUTION.md` and `LICENSES/TUBRIC-2026s-fmri-class-MIT.txt`.

FSL Academy is not an official Temple University, TUBRIC, FSL, or Neurodesk product. The application is educational; project-specific and institutional analysis protocols remain authoritative.

