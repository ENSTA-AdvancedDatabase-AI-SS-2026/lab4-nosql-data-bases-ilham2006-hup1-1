/**
 * TP2 - Exercice 3 : Pipelines d'Agrégation
 * Use Case : Statistiques médicales HealthCare DZ
 */
use("medical_db");

// ─── 3.1 : Distribution des diagnostics par wilaya ────────────────────────────
print("=== 3.1 : Top diagnostics par wilaya ===");

const diagParWilaya = db.patients.aggregate([
  // Étape 1 : Dérouler le tableau consultations (1 doc par consultation)
  { $unwind: "$consultations" },

  // Étape 2 : Grouper par wilaya + diagnostic et compter
  {
    $group: {
      _id: {
        wilaya:     "$adresse.wilaya",
        diagnostic: "$consultations.diagnostic"
      },
      count: { $sum: 1 }
    }
  },

  // Étape 3 : Trier par wilaya puis par count décroissant
  { $sort: { "_id.wilaya": 1, count: -1 } },

  // Étape 4 : Limiter pour la lisibilité
  { $limit: 20 },

  // Étape 5 : Reformater la sortie
  {
    $project: {
      _id: 0,
      wilaya:     "$_id.wilaya",
      diagnostic: "$_id.diagnostic",
      count: 1
    }
  }
]).toArray();

printjson(diagParWilaya);


// ─── 3.2 : Médicament le plus prescrit par spécialité ─────────────────────────
print("\n=== 3.2 : Top médicaments par spécialité ===");

const medsParSpecialite = db.patients.aggregate([
  // Dérouler consultations puis médicaments (double unwind)
  { $unwind: "$consultations" },
  { $unwind: "$consultations.medicaments" },

  // Compter chaque (spécialité, médicament)
  {
    $group: {
      _id: {
        specialite:  "$consultations.medecin.specialite",
        medicament:  "$consultations.medicaments.nom"
      },
      prescriptions: { $sum: 1 }
    }
  },

  // Trier pour que le max soit en tête dans chaque groupe
  { $sort: { prescriptions: -1 } },

  // Regrouper par spécialité et garder le 1er (= le plus prescrit)
  {
    $group: {
      _id: "$_id.specialite",
      top_medicament: { $first: "$_id.medicament" },
      prescriptions:  { $first: "$prescriptions" }
    }
  },

  { $sort: { prescriptions: -1 } },

  {
    $project: {
      _id: 0,
      specialite:     "$_id",
      top_medicament: 1,
      prescriptions:  1
    }
  }
]).toArray();

printjson(medsParSpecialite);


// ─── 3.3 : Évolution mensuelle des consultations ──────────────────────────────
print("\n=== 3.3 : Consultations par mois (12 derniers mois) ===");

const evolutionMensuelle = db.patients.aggregate([
  { $unwind: "$consultations" },

  // Garder uniquement les 12 derniers mois
  {
    $match: {
      "consultations.date": {
        $gte: new Date(new Date().setFullYear(new Date().getFullYear() - 1))
      }
    }
  },

  // Grouper par année + mois
  {
    $group: {
      _id: {
        annee: { $year:  "$consultations.date" },
        mois:  { $month: "$consultations.date" }
      },
      nb_consultations: { $sum: 1 },
      diagnostics_uniques: { $addToSet: "$consultations.diagnostic" }
    }
  },

  // Trier chronologiquement
  { $sort: { "_id.annee": 1, "_id.mois": 1 } },

  // Formater la date en "YYYY-MM"
  {
    $project: {
      _id: 0,
      periode: {
        $concat: [
          { $toString: "$_id.annee" },
          "-",
          {
            $cond: [
              { $lt: ["$_id.mois", 10] },
              { $concat: ["0", { $toString: "$_id.mois" }] },
              { $toString: "$_id.mois" }
            ]
          }
        ]
      },
      nb_consultations: 1,
      nb_diagnostics_distincts: { $size: "$diagnostics_uniques" }
    }
  }
]).toArray();

printjson(evolutionMensuelle);


// ─── 3.4 : Patients à risque multiple ────────────────────────────────────────
print("\n=== 3.4 : Profil patients à risque élevé (Diabète + HTA + âge > 60) ===");

const aujourd_hui = new Date();

const patientsRisque = db.patients.aggregate([
  // Filtrer : diabétiques + hypertendus
  {
    $match: {
      antecedents: { $all: ["Diabète type 2", "HTA"] }
    }
  },

  // Calculer l'âge et le nombre de consultations
  {
    $addFields: {
      age: {
        $floor: {
          $divide: [
            { $subtract: [aujourd_hui, "$dateNaissance"] },
            1000 * 60 * 60 * 24 * 365.25
          ]
        }
      },
      nb_consultations: { $size: "$consultations" }
    }
  },

  // Garder seulement les > 60 ans
  { $match: { age: { $gt: 60 } } },

  // Statistiques globales du groupe
  {
    $group: {
      _id: null,
      nb_patients:           { $sum: 1 },
      age_moyen:             { $avg: "$age" },
      consultations_moyennes: { $avg: "$nb_consultations" },
      patients_details: {
        $push: {
          nom:              { $concat: ["$prenom", " ", "$nom"] },
          age:              "$age",
          wilaya:           "$adresse.wilaya",
          nb_consultations: "$nb_consultations"
        }
      }
    }
  },

  {
    $project: {
      _id: 0,
      nb_patients:           1,
      age_moyen:             { $round: ["$age_moyen", 1] },
      consultations_moyennes: { $round: ["$consultations_moyennes", 1] },
      patients_details:      1
    }
  }
]).toArray();

printjson(patientsRisque);


// ─── 3.5 : Rapport médecins ───────────────────────────────────────────────────
print("\n=== 3.5 : Top 5 médecins & taux de ré-consultation ===");

const rapportMedecins = db.patients.aggregate([
  { $unwind: "$consultations" },

  // Grouper par médecin :
  //  - compter le total de consultations
  //  - collecter les _id patients distincts
  {
    $group: {
      _id: {
        nom_medecin: "$consultations.medecin.nom",
        specialite:  "$consultations.medecin.specialite"
      },
      total_consultations: { $sum: 1 },
      patients_uniques:    { $addToSet: "$_id" }
    }
  },

  // Calculer le taux de ré-consultation
  // = (total - patients_uniques) / patients_uniques * 100
  {
    $addFields: {
      nb_patients_uniques: { $size: "$patients_uniques" },
      taux_reconsultation: {
        $multiply: [
          {
            $divide: [
              { $subtract: ["$total_consultations", { $size: "$patients_uniques" }] },
              { $size: "$patients_uniques" }
            ]
          },
          100
        ]
      }
    }
  },

  // Top 5 par nombre de consultations
  { $sort: { total_consultations: -1 } },
  { $limit: 5 },

  {
    $project: {
      _id: 0,
      medecin:              "$_id.nom_medecin",
      specialite:           "$_id.specialite",
      total_consultations:  1,
      nb_patients_uniques:  1,
      taux_reconsultation:  { $round: ["$taux_reconsultation", 1] }
    }
  }
]).toArray();

printjson(rapportMedecins);













