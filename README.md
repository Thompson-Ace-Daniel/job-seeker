# JobRec AI

JobRec AI is a responsive job discovery app that ranks job openings against a job seeker's skills, role, industry, experience, location, and employment preferences. Accounts, profile data, resume file names, application tracking, and dark mode are stored in the browser's LocalStorage.

## Run locally

```bash
npm install
npm run dev
```

Vercel deployments use `vercel.json` for direct-link and refresh support on React Router routes. The `/api/jobicy` serverless function forwards supported search filters to Jobicy, so live keyword searches work in production as well as during local development.

Use **Explore the demo** on the sign-in page to open the sample workspace. You can also sign in with `demo@jobrec.ai` and password `findyourfit`.

## Job feeds

The app loads free public job listings from Remotive, Arbeitnow, and Jobicy, then combines them with its curated catalog so discovery remains useful if a feed is unavailable. Jobicy searches pass role keywords, supported industry categories, and supported region filters through a same-origin Vite proxy. Its public feed contains remote jobs posted during the last seven days, so local petroleum and gas roles remain available in the catalog when no matching remote listing exists. These feeds need no API keys. Listings link to their source or employer application page in a new tab. Jobicy listings retain Jobicy attribution and their canonical listing URL.

The catalog uses LinkedIn job-search links for external application discovery. Live feed links go directly to their source application page.

## Included flows

- Local account registration and sign-in with persistent sessions and sign-out
- Responsive dashboard, editable profile, resume filename tracking, and profile completeness
- Content-based cosine-similarity recommendations with an explanation of matching signals
- Job search by keyword, location, industry, employment type, remote status, and experience
- External application links and a status tracker with editable mock statuses
- Persistent light and dark themes

## Privacy note

This MVP keeps account information in browser LocalStorage. Passwords are stored locally for this single-device demo experience; this is not a replacement for server-side authentication. Resume files are not uploaded: only the selected file name is stored.
