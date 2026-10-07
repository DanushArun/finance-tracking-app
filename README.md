# Finance Tracking App

A React / TypeScript personal-finance interface with Firebase-backed authentication and
collections for transactions, categories, budgets and goals.
The current build uses Vite; the previous Create React App starter README did not match it.

## Product flow

Authenticate, record transactions, inspect dashboard summaries, set budgets and goals,
and review reports. Additional UI includes recurring transactions, receipt scanning,
voice input, settings and couple-sharing services.

Receipt analysis and category suggestions in `geminiService.ts` currently return mock data.
They do not constitute a completed Gemini receipt extraction integration.

## Local setup

```bash
git clone https://github.com/DanushArun/finance-tracking-app.git
cd finance-tracking-app
npm ci
npm run dev
```

Configure your own Firebase project through these Vite environment variables:

```text
VITE_FIREBASE_API_KEY
VITE_FIREBASE_AUTH_DOMAIN
VITE_FIREBASE_PROJECT_ID
VITE_FIREBASE_STORAGE_BUCKET
VITE_FIREBASE_MESSAGING_SENDER_ID
VITE_FIREBASE_APP_ID
```

Enable the Firebase services required by the app and configure authorization rules in your
own project. No backend access policy is proven merely by hiding a route in the React UI.
The mock AI service still references `process.env.REACT_APP_GEMINI_API_KEY`, a legacy convention
that needs reconciliation with Vite before claiming that integration works.

## Source map

- [App.tsx](src/App.tsx): authenticated routing.
- [firebaseService.ts](src/services/firebaseService.ts): auth and data services.
- [geminiService.ts](src/services/geminiService.ts): mocked receipt/category behavior.
- [components](src/components): dashboard, transaction, budget, goal and report UI.

## Verification

```bash
npm run lint
npm run build
npm run preview
```

Source, route structure and package scripts were inspected. The manifest has no test script.
No Firebase write, receipt-provider call or end-to-end finance workflow was executed for this
README update. Financial summaries depend on entered data and implemented calculations;
this repository does not demonstrate bank synchronization or audited accounting results.
