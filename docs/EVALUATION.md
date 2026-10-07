# Finance Tracker — Evaluation guide

Start with the smallest path that exercises the project. Distinguish source inspection,
syntax/build checks, functional behavior and domain validation when recording a result.

## Guided reading and demonstration

1. **Authenticate.** Use the authentication UI against your own Firebase project. Protected client
routes are UI behavior; server rules must enforce data authorization.

2. **Record activity.** Create and inspect transactions and categories. The Firebase service owns
collection operations used by the interface.

3. **Compare plans and reports.** Open dashboard, budget, goal and report views. Check how the
same entered data flows into each display.

4. **Inspect optional inputs.** Receipt analysis returns mock data in the current service. Treat
that path as a demonstration and verify voice/sharing behavior separately.

## Declared checks

These commands/checks describe the intended verification path. Their presence in this
guide does not claim that they passed. See the dated evidence below and the README for setup.

```text
npm run lint
npm run build
```

## Evidence levels

| Level | What it establishes | What it does not establish |
| --- | --- | --- |
| Source review | A path exists in tracked code | Successful runtime behavior |
| Syntax/build | Parser/compiler accepts that path | End-to-end correctness |
| Behavioral check | A specific input/output case passed | Generalization beyond cases |
| Domain evaluation | Performance on a stated target setting | Other users/data/environments |

## What to record

- Commit, environment, dependency versions and date.
- Input provenance and whether data is synthetic, public or privately supplied.
- Absolute pass/fail/skip counts; keep failed cases and their root causes.
- Whether external services, hardware or a production deployment were actually exercised.
- Expected output and an artifact showing the observation.

## Review scenarios

- **Vite is the current build:** Commands and environment names follow the actual manifest, not
old CRA boilerplate.

- **Firebase services are explicit:** Authentication, data and storage depend on a separately
configured project.

- **Mock AI is labeled:** Returned sample receipt data does not prove model extraction works.

## Documentation inspection — 7 October 2026

The documentation was traced to committed source and checked for local links, balanced
code fences and supported implementation claims. Historical notebook outputs remain labeled
as historical. Live provider access, private databases and hardware behavior are not inferred
from configuration or dependency files. Any fresh run is recorded separately in the README.

## Next evidence to collect

- Verify data authorization with separate test users.
- Reconcile legacy AI environment handling with Vite.
- Test reports against known synthetic transaction totals.
