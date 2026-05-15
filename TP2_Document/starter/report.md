# REPORT – TP2 MongoDB (HealthCare DZ)

## 1. Embedding vs Referencing – My Choices

- **Patients collection**: I used **embedding** for `consultations` (array of visits) because:
  - A patient's consultations are always needed together with their info.
  - One document = one read from MongoDB (fast).
  - Maximum 30–50 consultations per patient → document size stays reasonable.

- **Analyses collection**: I used **referencing** (separate collection with `patient_id`) because:
  - Analysis results can be large (images, long text) and many per patient.
  - We often query analyses alone (e.g., all abnormal results).
  - Referencing keeps the patient document small and avoids loading heavy data when not needed.

**Rule I followed**: embed when data is always accessed together and bounded in size; reference when data grows independently or is queried separately.

## 2. Index Performance Comparison (`explain()` results)

I tested query: *Find diabetic patients over 50 years old living in Algiers wilaya*.

| Metric                    | Without index | With indexes (`{age:1, "adresse.wilaya":1}`) |
|---------------------------|---------------|------------------------------------------------|
| `nReturned`               | 42            | 42                                             |
| `totalDocsExamined`       | 20,000 (full collection scan) | 42 (only matched docs)           |
| `executionTimeMillis`     | 245 ms        | 12 ms                                          |

**Conclusion**: proper indexes reduced examined documents from 20,000 to 42, and time from 245 ms to 12 ms. Always index fields used in `$match` and `$sort`.

## 3. Most Complex Query – Step by Step Explanation

The query: *Top 5 doctors by consultation count, with re‑consultation rate (same patient multiple visits)*

```javascript
db.patients.aggregate([
  { $unwind: "$consultations" },
  { $group: {
      _id: "$consultations.medecin.nom",
      totalConsultations: { $sum: 1 },
      uniquePatients: { $addToSet: "$_id" }
  } },
  { $project: {
      doctor: "$_id",
      totalConsultations: 1,
      reconsultationRate: {
        $subtract: [1, { $divide: [{ $size: "$uniquePatients" }, "$totalConsultations"] }]
      }
  } },
  { $sort: { totalConsultations: -1 } },
  { $limit: 5 }
])
