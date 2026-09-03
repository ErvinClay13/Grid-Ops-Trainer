# Grid Ops Trainer

A scenario-based training tool for utility engineering fundamentals — built as a companion project to [Grid Toolkit](https://github.com/ErvinClay13/Grid-ToolKit).

**Live demo:** _(coming soon — link will go here once deployed)_

> Not affiliated with or endorsed by ComEd. Built as an independent portfolio project to demonstrate full-stack engineering applied to utility-industry problems.

## What this is

New utility engineers have to build intuition for real on-the-job math: prioritizing storm restoration, checking whether new load will overload a transformer, calculating voltage drop on a conductor run, and assessing solar interconnection impact. Grid Ops Trainer turns each of those into an interactive scenario — enter realistic inputs, get a computed result, then have it explained by an AI mentor and broken down step-by-step.

## Features

- **Storm Restoration Prioritization** — rank multiple damaged sites by customer impact and repair time, with critical facilities (hospitals, etc.) always prioritized first
- **Feeder/Transformer Load Check** — determine whether adding new load (like EV chargers) overloads existing equipment, accounting for load diversity
- **Voltage Drop Calculation** — check whether a conductor run stays within acceptable voltage drop limits for a given wire gauge and length
- **DER/Solar Interconnection Impact** — assess reverse power flow risk and fast-track screening eligibility for a proposed solar interconnection
- **AI Coaching** — every result can be explained in plain language by Claude, acting as a senior engineer mentoring a new hire
- **Show the Math** — a step-by-step breakdown of the exact calculation behind every result, using the real numbers submitted

## Tech stack

- **Frontend:** React, Vite
- **Backend:** Node.js, Express
- **AI integration:** Anthropic Claude API (`@anthropic-ai/sdk`)
- **Deployment:** Render (backend), Vercel (frontend)

## Project structure

```
Grid Ops Trainer/
├── backend/
│   ├── server.js          # Express entry point
│   ├── logic/              # Pure math — no Express, fully reusable
│   ├── api/                 # Route handlers (thin — delegate to logic/)
│   └── lib/                 # Shared Anthropic API client
└── frontend/
    └── src/
        ├── scenarios/       # One component per scenario
        └── components/      # Shared UI (tooltips, readouts, math breakdown)
```

## Running locally

**Backend:**
```bash
cd backend
npm install
# create a .env file with: ANTHROPIC_API_KEY=your-key-here
node server.js
```

**Frontend** (in a separate terminal):
```bash
cd frontend
npm install
npm run dev
```

The frontend expects the backend URL in `frontend/src/config.js` — defaults to `http://localhost:3002` for local development.

## Disclaimer

The engineering formulas used here (voltage drop limits, load planning margins, DER screening thresholds, etc.) are simplified for training and demonstration purposes. They are not a substitute for certified engineering calculations or official utility standards.