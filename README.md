# 退休计划 Retirement Planner

Canada retirement planning MVP for people considering retirement in Canada or China.

## Run

Standard React + TypeScript development:

```bash
npm install
npm run dev
```

When package installation is not available, use the standalone MVP preview:

```bash
node scripts/serve-preview.mjs
```

Then open `http://localhost:4173`.

## Architecture

- `src/config/assumptions.ts`: editable policy and planning assumptions
- `src/engine/calculator.ts`: CPP, OAS, GIS, RRIF, TFSA, tax, and projection logic
- `src/App.tsx`: React dashboard, input forms, result page, comparison, and charts
- `preview/`: zero-install interactive preview

## Important

Default policy values are illustrative and editable. This app is for educational planning only and is not legal, tax, immigration, investment, or financial advice.
