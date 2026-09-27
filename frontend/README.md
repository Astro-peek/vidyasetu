# Vidya Setu — React frontend prototype

A responsive frontend for exploring scholarship schemes, completing a student profile, trying a multi-step application, and tracking demo status. The public landing page and student dashboard follow the provided black/orange mockups. The existing admin, officer and committee prototype routes are retained.

## Run locally

1. Install a recent Node.js release.
2. Open this `vidyasetu` folder in VS Code.
3. In the terminal run:

```bash
npm install
npm run dev
```

Open the URL printed by Vite (normally `http://localhost:5173/vidyasetu/`). The app is configured for the `/vidyasetu/` base path. To build, run `npm run build`.

## Demo flows

- Landing: explore scholarships, see the journey, open a scheme, or choose a student/staff demo login from the navbar (mobile menu on small screens).
- Student: complete profile, search/filter schemes, review details, fill a multi-step form, select sample documents, submit a demo application, track status, open help, and switch light/dark modes.
- Staff demo login is in the landing navbar: scheme admin, scrutiny officer, committee and ministry viewer. New student demo submissions appear in the officer's queue in the same browser; officer status changes are reflected in the student's application tracker.
- The floating SetuAI button appears on every page. Chat answers demo navigation questions, Eligibility compares sample category and income rules for NFST/NOS/Top Class, and AI Scanner offers clear/deficient certificate simulations and a basic local file type/size check. Open it from the student dashboard card as well.
- Profile, drafts, selected role, theme and demo applications are saved to this browser's `localStorage`.

## Prototype boundaries

This is a **frontend demo**. Role selection is not authentication. It has no live ministry integration, secure document storage, real AI model/OCR, official submission, or live application statuses. The assistant's answers are local rules; its eligibility result is preliminary and its document samples are simulated. The scanner's optional local file check reads only type and size, and does not upload or inspect document contents. Application file inputs show selected filenames only. Catalog content, closing dates and sample staff records are illustrative; confirm scheme rules and dates against current official notifications. Do not enter real personal data or documents in the demo. For production, connect authenticated backend APIs, server-side validation, secure file handling, official scheme data, and accessibility/security review.
