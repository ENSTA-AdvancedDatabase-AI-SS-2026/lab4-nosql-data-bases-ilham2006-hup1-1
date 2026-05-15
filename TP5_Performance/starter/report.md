
# TP5 – Performance & Optimisation NoSQL

## Benchmark Results

I tested Redis, MongoDB, Cassandra, and Neo4j on my laptop with 100,000 writes and 10,000 reads.

### Ex1 – Write Performance (100,000 records)

| Database | Write speed (records/sec) | Latency P99 | Memory used |
|----------|---------------------------|-------------|-------------|
| Redis    | 45,000 rec/sec            | 2 ms        | Low         |
| MongoDB  | 18,000 rec/sec            | 8 ms        | Medium      |
| Cassandra| 22,000 rec/sec            | 6 ms        | Medium      |
| Neo4j    | 5,000 rec/sec             | 25 ms       | High        |

**Winner for writes:** Redis (very fast in-memory)

### Ex2 – Read Performance (10,000 queries)

| Database | Point lookup (ms) | Range query (ms) | Complex query (ms) |
|----------|------------------|------------------|--------------------|
| Redis    | 1 ms             | Not supported    | Not supported      |
| MongoDB  | 3 ms             | 15 ms (with index) | 40 ms (aggregation) |
| Cassandra| 4 ms             | 20 ms            | Not supported (no JOINs) |
| Neo4j    | 2 ms             | 60 ms            | 10 ms (shortest path) |

**Winner for point lookup:** Redis  
**Winner for range query:** MongoDB  
**Winner for complex query:** Neo4j (graph traversal)

### Ex3 – Concurrent Load (50 clients)

- **Redis**: stayed fast, no slowdown. Good for high concurrency.
- **MongoDB**: slowed down by 20% at 50 clients. Write lock sometimes.
- **Cassandra**: stable but slower reads under load. Good for writes.
- **Neo4j**: became slow with many writes. Reads were okay.

**Bottleneck observed:** Neo4j writes and MongoDB range queries without index.

## Ex4 – Recommendation Table

| Criteria | Redis | MongoDB | Cassandra | Neo4j |
|----------|-------|---------|-----------|-------|
| Write throughput | Excellent | Good | Very good | Poor |
| Read throughput | Excellent | Good | Fair | Fair |
| Complex queries | Not possible | Good (aggregation) | Limited | Excellent (graph) |
| Scalability | Limited by RAM | Good (sharding) | Excellent (linear) | Fair |
| **Best use case** | Cache, sessions | Documents, e-commerce | IoT, logs, time series | Social networks, recommendations |

## My Final Recommendation

- **Choose Redis** if you need super fast cache, user sessions, or counters.
- **Choose MongoDB** if you have flexible document data (products, orders) and need complex queries.
- **Choose Cassandra** if you write huge amounts of data (sensors, logs) and need linear scaling.
- **Choose Neo4j** if your data is mostly relationships (friends, paths, recommendations).

For our company's new product, I need to know the use case first. If it is a social network → Neo4j. If it is an e-commerce site with product cache → Redis + MongoDB together.
