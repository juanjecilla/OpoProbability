# The maths behind OpoProbability

This is the long version of the summary in the [README](../README.md). It covers why the
hypergeometric distribution is the right model, how the two solving directions work, and the
numerical decisions the implementation rests on.

## 1. The setup

| Symbol     | Meaning                                       |
| ---------- | --------------------------------------------- |
| `N`        | Topics in the syllabus                        |
| `P`        | Topics the candidate has prepared             |
| `k`        | Balls the board draws                         |
| `discards` | Drawn balls the candidate may reject          |
| `d`        | Topics that must be developed, `k − discards` |
| `X`        | Prepared topics among the `k` drawn           |

The drum holds `N` balls. `P` of them are "mine" and `N − P` are not. The board draws `k` balls at
once, which is equivalent to drawing them one by one **without putting any back**.

## 2. Why hypergeometric and not binomial

The binomial distribution models `k` **independent** trials each with a fixed success probability
`p`. Neither condition holds here.

Once a ball leaves the drum it cannot come out again, so the composition of the drum changes with
every draw. If the first ball drawn is one of mine, the chance the second one is mine drops from
`P/N` to `(P−1)/(N−1)`. The trials are negatively correlated.

The distribution that describes "how many successes in `k` draws without replacement from a finite
population" is the **hypergeometric**:

```
             C(P, i) · C(N−P, k−i)
P(X = i) = ─────────────────────────
                   C(N, k)
```

The reasoning is pure counting:

- `C(N, k)` — every equally likely draw of `k` topics out of `N`. This is the denominator.
- `C(P, i)` — ways to pick which `i` of my prepared topics come up.
- `C(N−P, k−i)` — ways to fill the remaining `k − i` slots from the topics I skipped.

Multiplying the last two counts every draw containing exactly `i` of mine, because each choice of
prepared topics can pair with each choice of unprepared ones.

**How wrong is the binomial?** For `N=60, P=40, k=4` a binomial with `p = 2/3` gives
`P(X ≥ 2) = 88.9%` against the correct `89.7%`. Close in the middle, worse in the tails — and the
tails are exactly where the interesting decisions live. The finite-population correction matters
more as `k/N` grows.

## 3. The success criterion

The candidate discards `discards` of the `k` drawn balls and develops the rest, so they need at
least `d = k − discards` of the drawn topics to be ones they prepared:

```
                       min(k,P)
P(success) = P(X ≥ d) =   Σ   C(P,i) · C(N−P,k−i) / C(N,k)
                         i=d
```

Note what the discards do: they do **not** let you re-draw, they lower the bar. With `k = 4` and
2 discards you need 2 hits out of 4. With no discards you need all 4, which is a completely
different exam — for 40 prepared topics out of 60 the probability falls from 89.7% to 18.7%.

### Solving via the complement

When `d` is small the failure path has fewer terms. Failing means fewer than `d` of your topics came
up:

```
P(success) = 1 − Σ_{i=0}^{d−1} P(X = i)
```

For the 60/4/2 case that is 2 terms instead of 3, and it reads better: the only draws that sink you
are those bringing 0 or 1 of your topics. The app picks whichever path is shorter and shows that
one.

Worked out for `N=60, P=40, k=4, d=2`:

| `i`    | Count                          | Value       | Probability |
| ------ | ------------------------------ | ----------- | ----------- |
| Total  | `C(60,4)`                      | 487,635     | 100%        |
| 0      | `C(40,0)·C(20,4)` = 1 · 4,845  | 4,845       | 0.994%      |
| 1      | `C(40,1)·C(20,3)` = 40 · 1,140 | 45,600      | 9.351%      |
| **≥2** | `487,635 − 50,445`             | **437,190** | **89.655%** |

The full distribution, for reference:

| `X` | 0      | 1      | 2       | 3       | 4       |
| --- | ------ | ------ | ------- | ------- | ------- |
| P   | 0.994% | 9.351% | 30.392% | 40.522% | 18.741% |

## 4. The inverse problem

The forward question is "given `P`, how likely am I to pass?". The one candidates actually plan
around is the inverse: "how many topics must I prepare to be 95% safe?".

`P(success)` is monotonically increasing in `P` — preparing one more topic can never reduce the
number of favourable draws — so the smallest `P` meeting a target is found by walking `P = 0, 1, 2, …`
and stopping at the first crossing. No closed form is needed, and with `N` in the hundreds the cost
is irrelevant.

For 60/4/2:

| Target | Topics needed | Topics you may skip |
| ------ | ------------- | ------------------- |
| 80%    | 35            | 25                  |
| 90%    | 41            | 19                  |
| 95%    | 45            | 15                  |
| 99%    | 51            | 9                   |

## 5. Diminishing returns

The marginal value of the next topic is `P(success | P+1) − P(success | P)`. It rises, peaks, and
then collapses — the classic S-curve:

| The topic you add | Gain    |
| ----------------- | ------- |
| 21st              | 3.04 pp |
| 41st              | 1.40 pp |
| 51st              | 0.37 pp |
| 56th              | 0.07 pp |

This is the practical takeaway of the whole tool. Past roughly 45 topics out of 60, extra syllabus
coverage buys very little, and the same hours are almost certainly worth more spent on how well the
prepared topics are written than on adding new ones.

## 6. Numerical implementation

Two decisions keep the results exact.

**Binomial coefficients in BigInt.** `C(N,k)` grows past `Number.MAX_SAFE_INTEGER` (2⁵³ ≈ 9·10¹⁵)
quickly: `C(1000,10)` is 263,409,560,461,970,212,832,400. Coefficients are computed multiplicatively
—`C(n,i+1) = C(n,i)·(n−i)/(i+1)`— so intermediates never exceed the result, using the symmetry
`C(n,k) = C(n,n−k)` to halve the iterations, and memoised.

**Divide once, at the end.** The favourable cases are summed as exact integers and only the final
quotient becomes a floating-point number. The first implementation summed the per-term probabilities
instead, and the accumulated rounding was enough to make `P(59)` come out fractionally **above**
`P(60) = 1`, breaking monotonicity. A test for that property caught it, and it is still in the
suite.

The final division scales the numerator by 10²⁰ before converting, so roughly 20 significant digits
of the quotient survive even when both operands are far beyond double range.

## 7. Assumptions and limits

- **Preparation is binary.** A topic is either prepared or not. Real candidates have half-known
  topics; modelling those needs a multivariate hypergeometric with three classes and a rule for what
  a half-known topic is worth, which was deliberately left out.
- **The draw is uniform.** Every ball is equally likely, and no topic is more likely than another.
- **Success is purely about coverage.** Drawing a topic you prepared is assumed to mean you can
  develop it. Nerves, timing and marking are outside the model.
- **All discards are free.** The model assumes you may reject any of the drawn balls without
  penalty, which matches how these draws normally work.
