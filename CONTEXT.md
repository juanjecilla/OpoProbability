# OpoProbability

Language of competitive-exam topic draws (_oposiciones_).

## Language

**Syllabus**:
The full set of topics an exam can draw from. Its size is `N`.

**Draw**:
The board's random pick of `k` distinct topics from the Syllabus, without replacement.

**Studied topic** / **Unstudied topic**:
A Syllabus topic the candidate can (or cannot) develop. There are `P` studied topics.
_Avoid_: prepared (engine-internal name only)

**Minimum**:
How many of the drawn topics the candidate must be able to develop (`d`). The rest may be discarded.

**Round**:
One simulated Draw with its outcome.

**Success**:
A Round where at least Minimum drawn topics are Studied topics.

**Failure**:
A Round where fewer than Minimum drawn topics are Studied topics.

**Wipeout**:
A Failure where every drawn topic is Unstudied. A subset of Failure, never a separate tier of Success.

**Session**:
All Rounds simulated under one exam configuration and one fixed set of Studied topics. Changing the configuration starts a new Session.

**Simulacro de sorteo** (EN: Draw simulator):
The page where a candidate runs Rounds and reviews Sessions.
_Avoid_: contest, concurso

## Relationships

- A **Session** has one configuration, one set of **Studied topics** and many **Rounds**.
- A **Round** is a **Draw**; it is a **Success**, or a **Failure** which may also be a **Wipeout**.
- The share of **Success** Rounds in a long Session converges to the calculator's probability.
