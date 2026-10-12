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

**Topic map**:
The candidate's saved marking of each Syllabus topic as Studied or Unstudied. Outlives Sessions and changes of Syllabus size.
_Avoid_: checklist, prepared list, temario (that is the Syllabus)

**Studied source**:
Where a Session's Studied topics come from: _Random_ (P topics picked at random per Session) or _Topic map_ (the marked topics; P is their count).

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
- A **Session** snapshots its **Studied topics** from its **Studied source** at start; editing the **Topic map** or switching **Studied source** starts a new Session.
- A **Round** is a **Draw**; it is a **Success**, or a **Failure** which may also be a **Wipeout**.
- The share of **Success** Rounds in a long Session converges to the calculator's probability.
