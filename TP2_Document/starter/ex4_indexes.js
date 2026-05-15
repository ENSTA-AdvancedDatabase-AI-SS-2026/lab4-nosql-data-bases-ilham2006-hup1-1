




























/**
 * TP2 - Exercice 4 : Index et Optimisation
 */
use("medical_db");

// ─── 4.1 : Créer les index appropriés ────────────────────────────────────────

// Index 1 : Recherche fréquente par wilaya + antécédents
// → Composé car les deux champs apparaissent ensemble dans la plupart des $match
// → wilaya en 1er (cardinalité plus forte : ~50 wilayas) pour réduire rapidement
db.patients.createIndex(
  { "adresse.wilaya": 1, antecedents: 1 },
  { name: "idx_wilaya_antecedents" }
);

// Index 2 : Recherche par date de consultation (embedded array)
// → Permet à MongoDB d'utiliser un index sur le champ d'un tableau
// → Utile pour les requêtes de type "consultations dans les 12 derniers mois"
db.patients.createIndex(
  { "consultations.date": 1 },
  { name: "idx_consultation_date" }
);

// Index 3 : Texte sur diagnostics pour recherche full-text
// → Permet $text / $search sur les diagnostics sans scanner toute la collection
// → On indexe aussi les notes pour élargir la recherche
db.patients.createIndex(
  {
    "consultations.diagnostic": "text",
    "consultations.notes":      "text"
  },
  {
    name:     "idx_text_diagnostic_notes",
    weights:  { "consultations.diagnostic": 10, "consultations.notes": 1 },
    default_language: "french"
  }
);

// Index 4 : Analyses par patient_id (pour les $lookup et recherches directes)
// → Indispensable sinon chaque lookup fait un COLLSCAN sur analyses
db.analyses.createIndex(
  { patient_id: 1 },
  { name: "idx_analyses_patient_id" }
);

// Index 5 : Analyses par patient_id + type (recherche croisée fréquente)
// → Accélère "toutes les glycémies d'un patient"
db.analyses.createIndex(
  { patient_id: 1, type: 1 },
  { name: "idx_analyses_patient_type" }
);

// Index 6 : CIN unique (contrainte d'intégrité + recherche par numéro national)
db.patients.createIndex(
  { cin: 1 },
  { unique: true, name: "idx_cin_unique" }
);

print("✅ Tous les index créés.");
print("Index patients :", db.patients.getIndexes().map(i => i.name));
print("Index analyses :", db.analyses.getIndexes().map(i => i.name));


// ─── 4.2 : Comparer avec explain() ────────────────────────────────────────────

const requeteTest = {
  "adresse.wilaya": "Alger",
  antecedents: "Diabète type 2"
};

// ── AVANT index (on supprime temporairement pour la démo)
db.patients.dropIndex("idx_wilaya_antecedents");

print("\n=== AVANT index (COLLSCAN attendu) ===");
const explainAvant = db.patients.find(requeteTest).explain("executionStats");
const statsAvant   = explainAvant.executionStats;
print("  nReturned          :", statsAvant.nReturned);
print("  totalDocsExamined  :", statsAvant.totalDocsExamined);
print("  executionTimeMillis:", statsAvant.executionTimeMillis);
print("  winningPlan stage  :", explainAvant.queryPlanner.winningPlan.stage);

// Recréer l'index
db.patients.createIndex(
  { "adresse.wilaya": 1, antecedents: 1 },
  { name: "idx_wilaya_antecedents" }
);

print("\n=== APRÈS index (IXSCAN attendu) ===");
const explainApres = db.patients.find(requeteTest).explain("executionStats");
const statsApres   = explainApres.executionStats;
print("  nReturned          :", statsApres.nReturned);
print("  totalDocsExamined  :", statsApres.totalDocsExamined);
print("  executionTimeMillis:", statsApres.executionTimeMillis);
print("  winningPlan stage  :", explainApres.queryPlanner.winningPlan.stage);

print("\n── Tableau comparatif ──────────────────────────────────");
print("  Métrique              | SANS index | AVEC index");
print("  ----------------------|------------|------------");
print(`  nReturned             | ${String(statsAvant.nReturned).padStart(10)} | ${statsApres.nReturned}`);
print(`  totalDocsExamined     | ${String(statsAvant.totalDocsExamined).padStart(10)} | ${statsApres.totalDocsExamined}`);
print(`  executionTimeMillis   | ${String(statsAvant.executionTimeMillis).padStart(10)} | ${statsApres.executionTimeMillis}`);


// ─── 4.3 : Index composé — ordre des champs ───────────────────────────────────
/*
  Requête la plus complexe : patients diabétiques + HTA + wilaya + date consultation

  db.patients.find({
    "adresse.wilaya": "Alger",
    antecedents: { $all: ["Diabète type 2", "HTA"] },
    "consultations.date": { $gte: ISODate("2024-01-01") }
  })

  Ordre choisi : { "adresse.wilaya": 1, antecedents: 1, "consultations.date": 1 }

  Justification (règle ESR — Equality > Sort > Range) :
    1. "adresse.wilaya"    → Égalité exacte  → filtre le plus sélectif en 1er
    2. antecedents         → Égalité ($all)  → réduit encore le résultat
    3. "consultations.date"→ Range ($gte)    → range en dernier car MongoDB
                                               ne peut utiliser qu'un préfixe
                                               d'index pour les ranges

  Si on mettait le range en 1er, MongoDB lirait beaucoup plus d'entrées
  d'index avant de filtrer par wilaya/antécédents.
*/
db.patients.createIndex(
  {
    "adresse.wilaya":    1,
    antecedents:         1,
    "consultations.date": 1
  },
  { name: "idx_wilaya_antecedents_date" }
);


// ─── 4.4 : Index TTL pour archivage automatique ───────────────────────────────
/*
  Les analyses de plus de 5 ans sont automatiquement supprimées par MongoDB.
  expireAfterSeconds = 5 ans × 365.25 jours × 24h × 3600s ≈ 157 766 400 secondes

  ATTENTION : TTL ne fonctionne que sur des champs de type Date à la racine
  du document (pas dans un tableau ni un sous-document).
  MongoDB vérifie les TTL toutes les 60 secondes.
*/
db.analyses.createIndex(
  { date: 1 },
  {
    expireAfterSeconds: 157_766_400,   // 5 ans
    name: "idx_ttl_analyses_5ans"
  }
);

print("\n✅ Index TTL créé : analyses expirées après 5 ans.");
print("   (expireAfterSeconds =", 157_766_400, "≈ 5 × 365.25 jours)");


















