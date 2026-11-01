# Job classification eval harness (CAR-466)

A small, offline, role-level harness for measuring whether a change to
retrieval, the validation prompt, or the model helps or regresses ESCO job
classification. It exists because two real misclassifications were found
today by manual inspection, not measurement - this harness is the first
version the team will refine, not a finished ML eval platform.

It never calls `app.agents.job_classification._process_roles_batch`. That
function writes to the `role`/`job_classification` tables and schedules a
seniority task as a side effect of being invoked - this harness only ever
does read-only `SELECT`s against `esco_classification` and calls the OpenAI
embedding/chat APIs directly, with its own cost guards on top.

## Fixtures

`fixtures/roles.jsonl` has 80 hand-labeled roles, one JSON object per line:

- 40 `"group": "normal"` roles sampled in spirit from normal workload (common
  EN/PT titles across engineering, business, research, services).
- 40 `"group": "challenge"` roles targeting Portuguese titles, vague titles,
  missing descriptions, cross-domain QA, research roles, seniority ambiguity,
  and deliberately insufficient evidence - including the two known
  regressions (`r041` "Investigadora" at INEB/i3S, which must not be
  "Criminal Investigator"; `r042` "Quality Assurance Responsible" at CEiiA,
  which must not be "Ict Quality Assurance Manager").
- `"set": "dev" | "holdout"` - 60 dev / 20 locked holdout. Treat holdout as
  read-only: iterate against dev, check holdout only to confirm a change
  generalizes. Near-duplicate employer/title combos (e.g. `r042`/`r062`, both
  CEiiA) are kept in the same split so a change can't be scored as "fixed" on
  one half of a duplicate while still broken on the other.
- Fixtures are labeled with ESCO `code`s (e.g. `2512.4`), not database `id`s -
  codes are stable across re-seeds of `esco_classification`, UUIDs aren't.
- `automatic_ok: false` roles are the ones a human should see regardless of
  model confidence (ambiguous, vague, or genuinely insufficient evidence).
  Several fixtures note their own uncertainty inline in `rationale` - this is
  a first pass at labeling, not a settled ground truth.
- The normal-workload group is not a representative accuracy estimate on its
  own, and the challenge group is enriched for failure modes on purpose - see
  the report's `recall_at_8_normal` vs. `recall_at_8_challenge` split; don't
  average the two into one "accuracy" number without noting which is which.

## The three modes

```
uv run python -m evals.cli --mode <retrieval|judgment|end_to_end|build_packets> [options]
```

Options: `--dataset {dev,holdout,all}` (default `dev`), `--n <int>` (default
`10`), `--full` (process the whole dataset instead of `--n`), `--live`
(required for any real API call), `--fixtures/--packets-dir/--cache-path` to
point at alternate files.

**retrieval** - recall@8 / recall@20 against the real `esco_classification`
table (the local dev copy, via `DATABASE_URL`). Calls `generate_embedding`
once per role; embeddings are cached on disk keyed by query text, so re-runs
of roles you've already embedded are free regardless of `--live`.

**build_packets** - runs the actual production retrieval path
(`search_esco_classifications`: embed -> vector search -> cross-encoder
rerank) for each role and saves its top-5 candidates to
`evals/.packets/<role_id>.json`. This is a prerequisite for judgment mode,
not an eval mode itself - it reuses the embedding cache, so it's free for any
role already embedded by a prior retrieval run.

**judgment** - loads saved candidate packets (no embedding or DB calls at
all) and calls the validation LLM once per role, using the same
`VALIDATE_ESCO_CORE_PROMPT` / tool-calling contract as production, against an
independent `ChatOpenAI` client. This is what a prompt or model change
(CAR-467/468-style) should be measured against: change the prompt, re-run
`judgment`, compare reports - no retrieval cost either way. Every run that
reaches the model is billed; there is no cache here, because re-running is
the point.

**end_to_end** - real retrieval (via `build_packet`, cache-backed) chained
into real validation, with no saved packet reused between runs. Closest to
what production actually does for a role, minus the DB write.

Every mode writes its report as both a console table and a timestamped JSON
file under `evals/.reports/`.

## Report format

`retrieval` reports: `recall_at_8`, `recall_at_20` (overall, and split by
`normal`/`challenge` group), the two known regressions' individual hits,
`avg_latency_s`, and embedding cost.

`judgment` / `end_to_end` reports: `accuracy_given_acceptable_candidate_present`
(judge accuracy, conditioned on the correct answer actually being in the
candidate list - isolates judgment quality from retrieval quality),
`precision_among_auto_accepted` + `auto_coverage_pct` (using a
confidence >= 0.6 auto-accept rule, matching the confidence bands already
documented in `search_esco_classifications`), whether either known
regression is still wrong, `invalid_output_rate` (model didn't call the tool,
or returned something unparseable), and cost/latency per role.

## Cost discipline

- **Default N is 10**, not the full 80 - every mode needs `--full` to opt
  into the whole `--dataset`.
- **`--live` is required** for any call that isn't already cached/packeted.
  Without it, a cache/packet miss is a hard `RuntimeError`, not a silent
  charge - this is deliberate after an accidental production run cost real
  money today.
- **Embeddings are cached on disk** (`evals/.cache/embeddings.json`, gitignored)
  keyed by exact query text, so re-running `retrieval` or `build_packets`
  against roles you've already touched costs nothing.
- **Candidate packets are cached on disk** (`evals/.packets/`, gitignored) so
  `judgment` mode never touches the embedding API or the DB - the LLM call it
  makes is the only thing being billed, which is also the only thing it's
  testing.
- **No writes, ever.** `retrieval` and `build_packets` issue `SELECT`s against
  `esco_classification` only. `judgment` and `end_to_end` never call
  `_process_roles_batch`, `batch_update_classifications`, or the seniority
  service - there is no code path in this harness that can reach the
  `role`, `alumni`, or `job_classification` tables.

### Verified

A 10-role `retrieval` run (the two known regressions pinned in, plus 8 normal
roles) was run with `--live` against the local dev Postgres copy of
`esco_classification` (3,039 leaf rows, already embedded) - see "Verification"
in the PR description for the real numbers it produced, including the
finding that `r041` ("Investigadora") fails recall@20 entirely (the root
cause is retrieval never surfacing a biomedical/research candidate, not just
the LLM picking wrong), while `r042` (CEiiA QA) passes recall@8, pointing at
the validation step instead. `judgment` and `end_to_end` were verified to
gate correctly on a missing `--live`/missing packet, but were not run against
the real LLM, per CAR-466's instruction to avoid that spend here.

### Estimated cost of a full 80-role run

Rough, from `evals/harness/costs.py`'s pricing snapshot (`text-embedding-3-large`
$0.13/1M tokens, `gpt-4o-mini` $0.15/1M input + $0.60/1M output tokens) and
the token counts this harness actually measured on the 10-role sample:

| Mode | What it costs | 80-role estimate |
|---|---|---|
| `retrieval` (first run, cold cache) | 1 embedding call/role | ~$0.001 total |
| `retrieval` (re-run, warm cache) | $0 | $0 |
| `build_packets` | 1 embedding call/role (cached if `retrieval` already ran) | ~$0.001 total, then $0 |
| `judgment` (per run) | 1 `gpt-4o-mini` call/role, ~1-1.5K input + ~150-250 output tokens | roughly $0.02-0.05 per full run |
| `end_to_end` (per run) | retrieval (cached after first) + judgment | roughly $0.02-0.05 per full run |

All of these are a few cents, not the kind of number that needs a second
sign-off - but `--full --live` still has to be passed explicitly, on purpose.
