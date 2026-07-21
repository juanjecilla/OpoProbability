# Contributing

## Getting set up

```bash
npm install     # also installs the Husky pre-commit hook
npm run dev
```

## Before you push

```bash
npm run lint
npm run typecheck
npm test
```

The pre-commit hook runs Prettier and oxlint on staged files, so formatting nits should never reach
CI. CI additionally runs the type-check, the coverage thresholds and a production build.

## Where things go

The probability engine lives in `src/lib/hypergeometric.ts` and knows nothing about React. **All
maths belongs there** — components should only format and lay out values the engine produced. That
split is what makes the engine testable and the tests meaningful.

`src/lib/` is the only directory under test, with a 90% coverage threshold. If you touch it, add or
adjust tests in the matching `*.test.ts`.

## Conventions

- **Code, comments and commit messages are in English.** The user-facing copy is not: it lives in
  `src/i18n/translations.ts` and must be provided in both Spanish and English. The Spanish
  dictionary defines the shape, so a key missing from the English one is a compile error.
- Comments explain **why**, not what. If a line needs a comment to say what it does, rename
  something instead.
- Commit messages follow [Conventional Commits](https://www.conventionalcommits.org/):
  `feat:`, `fix:`, `docs:`, `refactor:`, `test:`, `chore:`.
- Branch off `main`, one topic per branch, and open a pull request.

## Adding an exam preset

Presets are pure data in `src/data/presets.json`:

```json
{ "id": "80-5-2", "N": 80, "k": 5, "discards": 2 }
```

They carry no label — the visible text is generated from the numbers, so it translates for free.
Presets are deliberately generic and describe only their own numbers; please do not label them with
the name of a specific exam, since official rules change and the project cannot vouch for them.

## Changing the maths

Any change to the engine must keep these properties, all covered by tests:

- the distribution sums to 1
- `P(success)` never decreases as `prepared` grows
- `P = N` gives exactly 1, and `prepared < d` gives exactly 0
- combinatorics stay exact well past `Number.MAX_SAFE_INTEGER`

If a change alters a documented figure, update [`docs/maths.md`](docs/maths.md) and the README
tables to match — and verify the new numbers by running the code, not by hand.
