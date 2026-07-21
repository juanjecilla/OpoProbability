# OpoProbability

A calculator for the question every competitive-exam candidate actually asks:

> If I skip 20 of the 60 topics, what are the odds the draw leaves me with something I can write about?

**[Try it live →](https://juanjecilla.github.io/OpoProbability/)**

Available in Spanish and English, with light and dark themes.

---

## The problem

In many Spanish public-sector exams (_oposiciones_) the board draws `k` balls at random from a
syllabus of `N` topics. The candidate discards some of them and must develop the rest. Almost
nobody prepares the whole syllabus — there is never enough time — so the real question is how much
risk each skipped topic buys.

Intuition answers this badly, because the returns are **not linear**: with 40 topics out of 60 you
already cover 89.7% of possible draws, and each further topic adds less than the one before.

## The maths

The draw is **without replacement** from a finite population, so the number of prepared topics among
those drawn follows a **hypergeometric** distribution — not a binomial one. Without replacement the
draws are not independent, and a binomial model would overestimate the tails.

Let `X` be the number of your prepared topics among the `k` drawn:

```
             C(P, i) · C(N−P, k−i)
P(X = i) = ─────────────────────────
                   C(N, k)
```

You succeed when you can develop the `d = k − discards` topics required, i.e. when at least `d` of
the drawn topics are yours:

```
                       min(k,P)
P(success) = P(X ≥ d) =   Σ   C(P,i) · C(N−P,k−i) / C(N,k)
                         i=d
```

### Worked example — 60 topics, 4 drawn, 2 discarded, 40 prepared

With `d = 2` it is shorter to count the draws that sink you and subtract:

| Step             | Computation                | Value       |
| ---------------- | -------------------------- | ----------- |
| Possible draws   | `C(60,4)`                  | 487,635     |
| Failure, `X = 0` | `C(20,4)` = 4,845          | 0.994%      |
| Failure, `X = 1` | `C(40,1)·C(20,3)` = 45,600 | 9.351%      |
| **Success**      | `1 − 0.994% − 9.351%`      | **89.655%** |

### Diminishing returns

| Topics prepared | P(success) |
| --------------- | ---------- |
| 20              | 40.7%      |
| 30              | 69.4%      |
| 40              | **89.7%**  |
| 45              | 95.5%      |
| 50              | 98.7%      |
| 55              | 99.9%      |

Reaching 95% needs 45 topics; 99% needs 51. The 41st topic is worth 1.40 pp against the 3.04 pp the
21st was worth — less than half.

The full write-up, including the inverse problem and the numerical details, is in
[`docs/maths.md`](docs/maths.md).

## Parameters

| Field                    | Symbol | Meaning                                               |
| ------------------------ | ------ | ----------------------------------------------------- |
| Topics in the syllabus   | `N`    | How many balls are in the drum                        |
| Topics drawn             | `k`    | How many balls the board pulls out                    |
| Topics you discard       | —      | How many of the drawn ones you may reject (`0 … k−1`) |
| Topics you have prepared | `P`    | The ones you genuinely know                           |

Everything is free-form, so the calculator works for any exam with this shape, not just the 60/4/2
case that motivated it.

## Exactness

Binomial coefficients are computed in **BigInt** and converted to a floating-point number only at
the final division. `C(N,k)` exceeds `Number.MAX_SAFE_INTEGER` on large syllabi — `C(1000,10)` is
about 2.6·10²³ — and summing already-rounded probabilities is enough to break the monotonicity of
the result. Working in exact integers also lets the app show the real numbers in its explanation
rather than approximations.

## Adding a preset

Presets only prefill the fields; they claim nothing about any particular exam. Add one entry to
[`src/data/presets.json`](src/data/presets.json):

```json
{ "id": "80-5-2", "N": 80, "k": 5, "discards": 2 }
```

The visible label is generated from the numbers, so it needs no translation.

## Development

```bash
npm install
npm run dev              # http://localhost:5173/OpoProbability/
```

| Script                  | Purpose                         |
| ----------------------- | ------------------------------- |
| `npm run dev`           | Dev server with HMR             |
| `npm run build`         | Type-check and build to `dist/` |
| `npm run preview`       | Serve the production build      |
| `npm test`              | Run the engine tests            |
| `npm run test:coverage` | Tests with coverage thresholds  |
| `npm run lint`          | oxlint                          |
| `npm run typecheck`     | `tsc --noEmit`                  |
| `npm run format`        | Prettier                        |

### Layout

```
src/
├─ lib/hypergeometric.ts   the whole probability engine, framework-free
├─ lib/format.ts           locale-aware number formatting
├─ i18n/                   translation dictionaries and provider
├─ theme/useTheme.ts       light/dark with system-preference fallback
├─ components/             UI, no maths
└─ data/presets.json       common exam shapes
```

The engine is pure TypeScript with no React dependency and is the only part under test — the UI is
verified by hand.

## Stack

Vite · React · TypeScript · Vitest · oxlint · Prettier · GitHub Actions

## Licence

[MIT](LICENSE)
