
# TP3 — Cassandra : SmartGrid DZ

## 1. Why I chose these partition keys

### Table: mesures_par_capteur (measurements by sensor)

PRIMARY KEY ((capteur_id, date_jour), timestamp)

- `capteur_id` spreads data across different nodes (no single node gets overloaded).
- `date_jour` groups measurements into daily buckets.
- This prevents hot partitions (one sensor filling up one node too fast).
- All measurements of one sensor stay together, which makes time-based queries fast.

### Table: alertes_par_wilaya (alerts by region)

PRIMARY KEY ((wilaya, date_jour), timestamp, capteur_id)

- Alerts are often queried by region (wilaya) and by day.
- The data is well distributed across nodes.
- Recent alerts are automatically sorted by timestamp (newest first).

### Table: agregats_horaires (hourly aggregates)

PRIMARY KEY ((wilaya), date_heure)

- The dashboard shows data by region (wilaya).
- This table is small compared to raw measurements.
- Reading hourly statistics is very fast.

## 2. Why ALLOW FILTERING is dangerous

`ALLOW FILTERING` forces Cassandra to read many partitions (like scanning the whole table).


Bad example:

```sql
SELECT * FROM mesures_par_capteur
WHERE tension_v > 240
ALLOW FILTERING;
