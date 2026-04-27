# Matching System Cost Comparison

Date: April 24, 2026

## Purpose

This document compares the likely infrastructure cost of building a daily-question matching system for a matrimonial product across:

- Supabase
- AWS
- GCP

It covers three technical approaches:

- Structured matching in Postgres
- Semantic matching with `pgvector` in Postgres
- Dedicated vector database / vector serving infrastructure

It also includes:

- Monthly cost estimates
- Annual cost estimates
- Upgrade triggers
- Recommended stack by scale

This version has been updated for **India deployment assumptions**:

- AWS: **Mumbai (`ap-south-1`)**
- GCP: **Mumbai (`asia-south1`)**
- Supabase: **Mumbai region available**, but pricing is still **global plan pricing**, not India-region list pricing

Unless noted otherwise, these estimates:

- use provider list prices
- exclude GST and invoicing/FX adjustments
- are meant for architecture planning, not billing reconciliation

## Executive Summary

For this product shape, the cheapest and most practical option is:

- Start with `Supabase + Postgres`
- Use structured scoring first
- Add `pgvector` only if free-text semantic matching becomes necessary

At low scale, dedicated vector infrastructure is usually unnecessary and often more expensive than the rest of the stack combined.

Recommended path:

1. MVP to early production: `Supabase + structured matching`
2. If free-text answers are introduced: `Supabase + pgvector`
3. At larger scale or under custom infra pressure: move to `AWS Aurora PostgreSQL + pgvector` or evaluate `GCP Vertex AI Vector Search`

## Workload Assumptions

These estimates use a single consistent model:

- 10 new questions per day are created by admin
- Questions are used to improve profile compatibility / matching
- Users answer daily questions over time
- Matching is recomputed in batches or incrementally
- Traffic is moderate, not media-heavy, not chat-heavy

Scale assumptions:

- 1,000 MAU
- 10,000 MAU
- 100,000 MAU

Working assumptions behind the estimates:

- 300,000 total answers per month at 1,000 MAU is a generous upper-bound scenario
- Answer text is short if embeddings are used
- Embedding dimension assumed: 256
- Request volume assumed: roughly 1M to 2M requests/month at 1,000 MAU
- Storage footprint is small relative to normal managed database minimums

Important implication:

- For this workload, raw vector storage is tiny
- The real cost driver is not storage, but the minimum compute footprint of the chosen managed service

## Matching Approaches

## 1. Structured Matching

Use this when answers are:

- yes/no
- multiple choice
- ranked preferences
- numeric scales
- admin-defined fixed options

Typical implementation:

- `questions`
- `question_options`
- `user_answers`
- `match_weights`
- `match_scores`

Matching logic:

- weighted SQL queries
- periodic recompute jobs
- incremental score updates after answer changes

This is the cheapest and simplest approach.

## 2. Semantic Matching with `pgvector`

Use this when answers are:

- free-text
- descriptive
- open-ended

Typical implementation:

- answers stored in Postgres
- embeddings generated on insert/update
- embeddings stored in `pgvector`
- filtered similarity search used for candidate generation or semantic scoring

This is the best next step when you want AI-style matching without introducing a separate vector platform.

## 3. Dedicated Vector Infrastructure

Use this only when:

- semantic retrieval is core to the product
- you need ANN performance beyond what Postgres handles comfortably
- QPS is materially high
- semantic candidate generation becomes a bottleneck
- you need stronger separation between transactional DB and retrieval infra

At small scale, this is usually overkill.

## Pricing Sources Used

Supabase:

- Billing and quotas: https://supabase.com/docs/guides/platform/billing-on-supabase
- Compute pricing: https://supabase.com/docs/guides/platform/manage-your-usage/compute
- Compute sizes: https://supabase.com/docs/guides/platform/compute-and-disk
- Disk pricing: https://supabase.com/docs/guides/platform/manage-your-usage/disk-size
- Functions pricing: https://supabase.com/docs/guides/functions/pricing
- `pgvector`: https://supabase.com/docs/guides/database/extensions/pgvector
- Regions: https://supabase.com/docs/guides/platform/regions

AWS:

- Aurora pricing: https://aws.amazon.com/rds/aurora/pricing/
- OpenSearch pricing: https://aws.amazon.com/opensearch-service/pricing/
- OpenSearch Serverless overview: https://docs.aws.amazon.com/opensearch-service/latest/developerguide/serverless-overview.html
- Lambda pricing: https://aws.amazon.com/lambda/pricing/
- Mumbai Aurora price feed: https://pricing.us-east-1.amazonaws.com/offers/v1.0/aws/AmazonRDS/current/ap-south-1/index.json
- Mumbai OpenSearch price feed: https://pricing.us-east-1.amazonaws.com/offers/v1.0/aws/AmazonES/current/ap-south-1/index.json

GCP:

- Cloud SQL pricing: https://cloud.google.com/sql/pricing/
- Cloud Run pricing: https://cloud.google.com/run/pricing
- Vertex AI pricing: https://cloud.google.com/vertex-ai/pricing
- Vertex AI generative/embedding pricing: https://cloud.google.com/vertex-ai/generative-ai/pricing

## Provider Cost Model Notes

## Supabase

Relevant current pricing signals:

- Pro plan: $25/month
- Includes $10 compute credit
- Micro compute: about $10/month
- Small compute: about $15/month
- Medium compute: about $60/month
- 100,000 MAU included on Pro
- 8 GB DB disk included per project
- Additional DB disk: $0.125/GB-month
- 2M Edge Function invocations included
- `pgvector` available in Postgres
- Mumbai region (`ap-south-1`) is available, but pricing is not published as a separate India-region rate card

Interpretation:

- A single small project can often stay near the Pro base price
- 1,000 MAU is far below the included MAU quota
- For this product shape, Supabase is unusually cost-efficient
- Supabase should be treated as **global USD pricing deployed in Mumbai**, not as India-specific list pricing

## AWS

Relevant current pricing signals:

- Aurora Serverless v2, Mumbai: $0.18 per ACU-hour
- Aurora Standard storage, Mumbai: $0.11/GB-month
- Aurora Standard I/O, Mumbai: $0.22 per 1 million I/O requests
- Lambda has a large free tier
- OpenSearch Serverless search OCU, Mumbai: $0.2472 per OCU-hour
- OpenSearch Serverless indexing OCU, Mumbai: $0.2472 per OCU-hour
- OpenSearch Serverless ingestion OCU, Mumbai: $0.296 per OCU-hour
- OpenSearch semantic encoding OCU, Mumbai: $0.29 per OCU-hour
- OpenSearch managed storage, Mumbai: $0.026/GB-month
- OpenSearch vector timed storage, Mumbai: $0.066/GB-month

Interpretation:

- Aurora PostgreSQL can be reasonable, but Mumbai pricing is materially higher than the earlier US estimate
- Lambda app layer cost can be negligible at low scale
- OpenSearch Serverless is usually too expensive for this workload until much later

## GCP

Relevant current pricing signals:

- Cloud SQL PostgreSQL Enterprise in Mumbai (`asia-south1`)
- vCPU: about $0.0413/hour
- Memory: about $0.007/GiB-hour
- SSD: about $0.000232877/GiB-hour
- Cloud Run has a useful free tier
- Vertex AI Vector Search, Mumbai `e2-standard-2`: about $0.0938084/hour
- Vector Search build/update: $3.00/GiB processed
- Vector Search streaming inserts: $0.45/GiB ingested

Interpretation:

- Cloud SQL is solid but has a relatively high low-end baseline
- Cloud Run is inexpensive
- Vertex AI Vector Search is the cheapest dedicated vector option in this comparison

## Monthly Cost Comparison

Estimated monthly range by scale and approach, using India-region deployment assumptions and excluding GST:

| Scale | Approach | Supabase | AWS | GCP |
|---|---|---:|---:|---:|
| 1k MAU | Structured matching | $25-$30 | $68-$135 | $104-$110 |
| 1k MAU | `pgvector` in Postgres | $25-$31 | $68-$136 | $104-$111 |
| 1k MAU | Dedicated vector DB | Not recommended | $181-$722+ | $68-$90+ |
| 10k MAU | Structured matching | $25-$45 | $135-$270 | $180-$260 |
| 10k MAU | `pgvector` in Postgres | $26-$50 | $140-$285 | $185-$270 |
| 10k MAU | Dedicated vector DB | Not recommended | $181-$850+ | $70-$150+ |
| 100k MAU | Structured matching | $30-$85 | $275-$835+ | $400-$900+ |
| 100k MAU | `pgvector` in Postgres | $35-$110 | $300-$920+ | $430-$1,000+ |
| 100k MAU | Dedicated vector DB | Possible, but usually later | $722-$1,800+ | $547-$1,642+ |

## Annual Cost Comparison

Annualized using the monthly ranges above:

| Scale | Approach | Supabase | AWS | GCP |
|---|---|---:|---:|---:|
| 1k MAU | Structured matching | $300-$360 | $816-$1,620 | $1,248-$1,320 |
| 1k MAU | `pgvector` in Postgres | $300-$372 | $816-$1,632 | $1,248-$1,332 |
| 1k MAU | Dedicated vector DB | Not recommended | $2,172-$8,664+ | $816-$1,080+ |
| 10k MAU | Structured matching | $300-$540 | $1,620-$3,240 | $2,160-$3,120 |
| 10k MAU | `pgvector` in Postgres | $312-$600 | $1,680-$3,420 | $2,220-$3,240 |
| 10k MAU | Dedicated vector DB | Not recommended | $2,172-$10,200+ | $840-$1,800+ |
| 100k MAU | Structured matching | $360-$1,020 | $3,300-$10,020+ | $4,800-$10,800+ |
| 100k MAU | `pgvector` in Postgres | $420-$1,320 | $3,600-$11,040+ | $5,160-$12,000+ |
| 100k MAU | Dedicated vector DB | Possible, but usually later | $8,664-$21,600+ | $6,564-$19,704+ |

## Recommended Stack By Stage

| Stage | Recommended stack | Why |
|---|---|---|
| MVP to 1k MAU | Supabase + structured matching | Lowest cost, fastest implementation, simplest operational model |
| 1k to 10k MAU | Supabase + structured matching or `pgvector` | Still cheap, still fast, enough for most product learning |
| 10k to 25k MAU | Supabase unless infra constraints appear | Likely still the best value unless custom worker architecture becomes important |
| 25k to 100k MAU | Re-evaluate AWS Aurora PostgreSQL + custom workers | Better control over jobs, queues, scaling topology |
| 100k+ MAU with serious semantic retrieval | AWS Aurora + `pgvector`, or GCP Vertex AI Vector Search | Candidate generation and ANN tuning start to matter |

## Founder-Friendly Recommendation

If the goal is to ship fast and control burn:

## Best current choice

- `Supabase Pro + Postgres`

Use:

- structured answers first
- SQL-based weighted compatibility
- scheduled recompute jobs

Expected spend:

- about $25/month to $30/month initially
- Mumbai deployment is available on Supabase, but the plan itself is still globally priced

## Best AI-enabled low-cost choice

- `Supabase Pro + pgvector`

Use:

- free-text answers where needed
- embeddings per answer/profile update
- vector similarity inside Postgres

Expected spend:

- about $25/month to $31/month initially

## Best later-stage infra choice

- `AWS Aurora PostgreSQL + pgvector`

Use when:

- you need more infra control
- you want custom worker topology
- you need queues, pipelines, separate services, or stricter scaling control

## Best dedicated vector choice later

- `GCP Vertex AI Vector Search`

Use when:

- Postgres vector search is no longer enough
- dedicated semantic candidate generation becomes central

## Provider-by-Provider Detailed Comparison

## Supabase

### Strengths

- Lowest cost at low scale
- Fastest setup time
- Includes auth, DB, functions, storage, realtime
- `pgvector` already available
- Very favorable economics up to 100k MAU on Pro

### Weaknesses

- Less infrastructure flexibility
- Scaling model is more opinionated
- Heavier custom background processing may eventually push you toward a more decomposed stack

### Best use case

- MVP
- early production
- small team
- Postgres-first product

### Risk point

The main reason to outgrow Supabase here is not vector storage. It is usually:

- heavier compute needs
- more sophisticated workers
- read/write separation
- custom infra policy requirements

## AWS

### Strengths

- Excellent long-term flexibility
- Aurora PostgreSQL is strong
- Lambda is cheap at low scale
- Easy path into broader infra later

### Weaknesses

- More moving parts than Supabase
- Auth is not bundled the same way
- OpenSearch Serverless is expensive for this specific use case at low scale

### Best use case

- You already use AWS
- You expect custom infra to matter
- You want more control over workers and background processing

### Risk point

Teams often over-adopt OpenSearch too early. For this workload, it is rarely justified at 1k or 10k MAU, and Mumbai-region serverless pricing makes that even more obvious.

## GCP

### Strengths

- Good managed Postgres
- Strong path to Vertex ecosystem
- Best dedicated vector option in this comparison

### Weaknesses

- Higher low-end baseline than Supabase
- Cloud SQL often costs more than expected for small apps
- Requires more service assembly than Supabase

### Best use case

- You already run on GCP
- You expect AI/vector infrastructure to become more central
- You may later adopt Vertex-native capabilities

### Risk point

At low scale, Cloud SQL is usually paying for idle managed capacity rather than real workload.

## Upgrade Triggers

These are the practical points at which you should consider changing architecture.

## Trigger 1: Stay structured, no vector yet

Keep structured matching if:

- answers are mostly fixed-choice
- explainability matters
- you want simple compatibility scoring
- product is still learning which questions matter

Do not add vectors yet.

## Trigger 2: Add `pgvector`

Add `pgvector` when:

- users write meaningful free-text answers
- you want semantic similarity
- keyword/option matching starts missing useful matches
- candidate generation needs semantic retrieval

This is the first AI step that usually makes sense.

## Trigger 3: Move off Supabase

Re-evaluate Supabase when:

- background recompute jobs become heavy
- you need more worker isolation
- project compute tier increases repeatedly
- you need custom queueing or more service separation
- read replicas / custom infra topology become important

## Trigger 4: Introduce dedicated vector infra

Re-evaluate dedicated vector infrastructure when:

- Postgres vector queries become latency bottlenecks
- filtered similarity over large corpora becomes expensive
- ANN recall/latency tuning matters
- semantic candidate generation becomes core, not optional

Until then, stay on Postgres.

## Decision Tree

Use this simplified decision sequence:

1. Are answers mostly fixed-choice?
   - Yes: use structured Postgres matching
   - No: continue

2. Are free-text answers important to match semantically?
   - Yes: use `pgvector`
   - No: stay structured

3. Is semantic retrieval performance becoming a bottleneck?
   - No: stay in Postgres
   - Yes: evaluate dedicated vector search

4. Is the team optimizing for speed or infra flexibility?
   - Speed: Supabase
   - Flexibility: AWS
   - Dedicated vector-first path: GCP

## India-Specific Notes

### AWS Mumbai (`ap-south-1`)

The estimates in this document use the Mumbai regional feed, not `us-east-1`.

Important numbers used:

- Aurora PostgreSQL Serverless v2: **$0.18 per ACU-hour**
- Aurora storage: **$0.11 per GB-month**
- Aurora I/O: **$0.22 per 1M I/O requests**
- OpenSearch Search OCU: **$0.2472 per OCU-hour**
- OpenSearch Indexing OCU: **$0.2472 per OCU-hour**
- OpenSearch Ingestion OCU: **$0.296 per OCU-hour**
- OpenSearch Semantic Encoding OCU: **$0.29 per OCU-hour**
- OpenSearch managed storage: **$0.026 per GB-month**

Practical effect:

- AWS Mumbai is more expensive than the earlier US-biased estimate for Aurora
- OpenSearch Serverless remains a poor low-scale fit

### GCP Mumbai (`asia-south1`)

The estimates in this document use the Mumbai pricing shown on Google’s pricing pages.

Important numbers used:

- Cloud SQL vCPU: **$0.0413/hour**
- Cloud SQL memory: **$0.007/GiB-hour**
- Cloud SQL SSD: **$0.000232877/GiB-hour**
- Vertex AI Vector Search `e2-standard-2`: **$0.0938084/hour**

Practical effect:

- GCP’s low-end managed SQL baseline remains higher than Supabase
- GCP is still the strongest dedicated-vector option in this comparison

### Supabase Mumbai

Supabase supports **South Asia (Mumbai) `ap-south-1`** as a project region.

However:

- Supabase pricing is still published as global plan pricing
- there is no separate India-region plan tariff comparable to AWS/GCP regional price tables
- in other words, this is **India deployment**, but not India-region list pricing in the same sense as AWS/GCP

## Practical Build Recommendation

For this matrimonial product, the recommended build order is:

### Phase 1

- Supabase Pro
- Postgres tables for:
  - questions
  - options
  - user_answers
  - match_scores
- weighted score engine
- cron or scheduled recompute

Expected cost:

- about $25 to $30/month

### Phase 2

- add open-ended answer fields only where necessary
- generate embeddings
- store them with `pgvector`
- use semantic scoring only where it materially improves matches

Expected cost:

- about $25 to $31/month initially

### Phase 3

- if scale and job complexity justify it, move the heavy matching workers to AWS or another more customizable stack

### Phase 4

- only introduce dedicated vector infrastructure when real performance data says Postgres is no longer enough

## Final Recommendation

For this use case:

- **Best MVP / earliest production choice:** Supabase + structured Postgres matching
- **Best low-cost AI version:** Supabase + `pgvector`
- **Best longer-term customizable stack:** AWS Aurora PostgreSQL + `pgvector`
- **Best future dedicated vector option:** GCP Vertex AI Vector Search
- **Least attractive at low scale:** AWS OpenSearch Serverless

If the team wants the most financially efficient path, the answer is:

- do not start with a dedicated vector database
- do not start with OpenSearch Serverless
- start with Supabase
