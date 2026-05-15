/**
 * TP2 - Exercice 1 : Modélisation MongoDB
 * Use Case : HealthCare DZ - Dossiers Médicaux
 */
use("medical_db");

// ─── 1.1 : Créer la collection avec validation ────────────────────────────────
db.createCollection("patients", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["cin", "nom", "prenom", "dateNaissance", "sexe", "adresse", "groupeSanguin"],
      properties: {
        cin: {
          bsonType: "string",
          minLength: 12,
          maxLength: 18,
          description: "Numéro national CIN — obligatoire"
        },
        nom: {
          bsonType: "string",
          minLength: 2,
          description: "Nom de famille — obligatoire"
        },
        prenom: {
          bsonType: "string",
          minLength: 2,
          description: "Prénom — obligatoire"
        },
        dateNaissance: {
          bsonType: "date",
          description: "Date de naissance ISO — obligatoire"
        },
        sexe: {
          bsonType: "string",
          enum: ["M", "F"],
          description: "Sexe : M ou F — obligatoire"
        },
        adresse: {
          bsonType: "object",
          required: ["wilaya"],
          properties: {
            wilaya:   { bsonType: "string" },
            commune:  { bsonType: "string" }
          }
        },
        groupeSanguin: {
          bsonType: "string",
          enum: ["A+","A-","B+","B-","AB+","AB-","O+","O-"],
          description: "Groupe sanguin ABO/Rhésus"
        },
        antecedents: {
          bsonType: "array",
          items: { bsonType: "string" }
        },
        allergies: {
          bsonType: "array",
          items: { bsonType: "string" }
        },
        consultations: {
          bsonType: "array",
          items: {
            bsonType: "object",
            required: ["date", "medecin", "diagnostic"],
            properties: {
              date:       { bsonType: "date" },
              diagnostic: { bsonType: "string" },
              medecin: {
                bsonType: "object",
                required: ["nom", "specialite"],
                properties: {
                  nom:        { bsonType: "string" },
                  specialite: { bsonType: "string" }
                }
              },
              tension: {
                bsonType: "object",
                properties: {
                  systolique:  { bsonType: "int" },
                  diastolique: { bsonType: "int" }
                }
              },
              medicaments: {
                bsonType: "array",
                items: {
                  bsonType: "object",
                  properties: {
                    nom:    { bsonType: "string" },
                    dosage: { bsonType: "string" },
                    duree:  { bsonType: "string" }
                  }
                }
              },
              notes: { bsonType: "string" }
            }
          }
        }
      }
    }
  },
  validationAction: "warn"   // "warn" pour ne pas bloquer les insertions en dev
});

db.createCollection("analyses");

// ─── 1.2 : 20 patients avec données algériennes réalistes ────────────────────
const patients = [
  {
    cin: "198001012300",
    nom: "Bensalem", prenom: "Ahmed",
    dateNaissance: new Date("1980-01-01"), sexe: "M",
    adresse: { wilaya: "Alger", commune: "Bab Ezzouar" },
    groupeSanguin: "O+",
    antecedents: ["Diabète type 2", "HTA"],
    allergies: ["Pénicilline"],
    consultations: [
      {
        id: UUID(), date: new Date("2024-01-15"),
        medecin: { nom: "Dr. Mansouri", specialite: "Cardiologie" },
        diagnostic: "Hypertension artérielle",
        tension: { systolique: 145, diastolique: NumberInt(92) },
        medicaments: [{ nom: "Amlodipine", dosage: "5mg", duree: "30 jours" }],
        notes: "Surveillance tensionnelle recommandée"
      },
      {
        id: UUID(), date: new Date("2024-06-10"),
        medecin: { nom: "Dr. Mansouri", specialite: "Cardiologie" },
        diagnostic: "Hypertension artérielle contrôlée",
        tension: { systolique: NumberInt(132), diastolique: NumberInt(84) },
        medicaments: [{ nom: "Amlodipine", dosage: "5mg", duree: "60 jours" }],
        notes: "Amélioration notable"
      },
      {
        id: UUID(), date: new Date("2024-11-20"),
        medecin: { nom: "Dr. Khelifi", specialite: "Endocrinologie" },
        diagnostic: "Diabète type 2 déséquilibré",
        tension: { systolique: NumberInt(138), diastolique: NumberInt(88) },
        medicaments: [
          { nom: "Metformine", dosage: "850mg", duree: "90 jours" },
          { nom: "Glibenclamide", dosage: "5mg", duree: "90 jours" }
        ],
        notes: "Régime alimentaire strict conseillé"
      }
    ]
  },
  {
    cin: "199503154422",
    nom: "Boudiaf", prenom: "Fatima",
    dateNaissance: new Date("1995-03-15"), sexe: "F",
    adresse: { wilaya: "Oran", commune: "Es Sénia" },
    groupeSanguin: "A+",
    antecedents: ["Asthme"],
    allergies: ["Aspirine", "AINS"],
    consultations: [
      {
        id: UUID(), date: new Date("2024-02-08"),
        medecin: { nom: "Dr. Benali", specialite: "Pneumologie" },
        diagnostic: "Crise d'asthme modérée",
        tension: { systolique: NumberInt(118), diastolique: NumberInt(75) },
        medicaments: [
          { nom: "Salbutamol", dosage: "100mcg", duree: "À la demande" },
          { nom: "Béclométasone", dosage: "200mcg", duree: "60 jours" }
        ],
        notes: "Éviter les allergènes, utiliser l'aérosol correctement"
      },
      {
        id: UUID(), date: new Date("2024-09-14"),
        medecin: { nom: "Dr. Benali", specialite: "Pneumologie" },
        diagnostic: "Asthme stable sous traitement",
        tension: { systolique: NumberInt(115), diastolique: NumberInt(72) },
        medicaments: [{ nom: "Béclométasone", dosage: "200mcg", duree: "90 jours" }],
        notes: "Bonne observance thérapeutique"
      }
    ]
  },
  {
    cin: "196807289911",
    nom: "Hadj Aissa", prenom: "Mohamed",
    dateNaissance: new Date("1968-07-28"), sexe: "M",
    adresse: { wilaya: "Constantine", commune: "El Khroub" },
    groupeSanguin: "B+",
    antecedents: ["Diabète type 2", "HTA", "Insuffisance rénale chronique"],
    allergies: [],
    consultations: [
      {
        id: UUID(), date: new Date("2023-12-05"),
        medecin: { nom: "Dr. Zitouni", specialite: "Néphrologie" },
        diagnostic: "IRC stade 3",
        tension: { systolique: NumberInt(158), diastolique: NumberInt(98) },
        medicaments: [
          { nom: "Losartan", dosage: "50mg", duree: "90 jours" },
          { nom: "Furosémide", dosage: "40mg", duree: "30 jours" }
        ],
        notes: "Régime hyposodé strict, contrôle créatinine mensuel"
      },
      {
        id: UUID(), date: new Date("2024-03-18"),
        medecin: { nom: "Dr. Zitouni", specialite: "Néphrologie" },
        diagnostic: "IRC stade 3 — stabilisée",
        tension: { systolique: NumberInt(145), diastolique: NumberInt(90) },
        medicaments: [{ nom: "Losartan", dosage: "100mg", duree: "90 jours" }],
        notes: "Créatinine stable à 2.1 mg/dL"
      },
      {
        id: UUID(), date: new Date("2024-08-22"),
        medecin: { nom: "Dr. Khelifi", specialite: "Endocrinologie" },
        diagnostic: "Diabète type 2 — équilibré",
        tension: { systolique: NumberInt(142), diastolique: NumberInt(88) },
        medicaments: [{ nom: "Insuline Glargine", dosage: "20UI", duree: "90 jours" }],
        notes: "HbA1c à 7.2%"
      }
    ]
  },
  {
    cin: "200110056677",
    nom: "Meziane", prenom: "Amira",
    dateNaissance: new Date("2001-10-05"), sexe: "F",
    adresse: { wilaya: "Alger", commune: "Hydra" },
    groupeSanguin: "AB-",
    antecedents: [],
    allergies: [],
    consultations: [
      {
        id: UUID(), date: new Date("2024-04-12"),
        medecin: { nom: "Dr. Ferhat", specialite: "Médecine générale" },
        diagnostic: "Grippe saisonnière",
        tension: { systolique: NumberInt(112), diastolique: NumberInt(70) },
        medicaments: [
          { nom: "Paracétamol", dosage: "1g", duree: "5 jours" },
          { nom: "Ibuprofène", dosage: "400mg", duree: "3 jours" }
        ],
        notes: "Repos et hydratation recommandés"
      },
      {
        id: UUID(), date: new Date("2024-10-30"),
        medecin: { nom: "Dr. Ferhat", specialite: "Médecine générale" },
        diagnostic: "Rhinite allergique",
        tension: { systolique: NumberInt(110), diastolique: NumberInt(68) },
        medicaments: [{ nom: "Cétirizine", dosage: "10mg", duree: "30 jours" }],
        notes: "Bilan allergologique conseillé"
      }
    ]
  },
  {
    cin: "197205143388",
    nom: "Bouchama", prenom: "Karim",
    dateNaissance: new Date("1972-05-14"), sexe: "M",
    adresse: { wilaya: "Annaba", commune: "Sidi Amar" },
    groupeSanguin: "O-",
    antecedents: ["HTA", "Dyslipidémie"],
    allergies: ["Sulfamides"],
    consultations: [
      {
        id: UUID(), date: new Date("2024-01-28"),
        medecin: { nom: "Dr. Mansouri", specialite: "Cardiologie" },
        diagnostic: "Dyslipidémie mixte",
        tension: { systolique: NumberInt(140), diastolique: NumberInt(88) },
        medicaments: [
          { nom: "Atorvastatine", dosage: "40mg", duree: "90 jours" },
          { nom: "Ramipril", dosage: "5mg", duree: "90 jours" }
        ],
        notes: "Contrôle lipidique dans 3 mois"
      },
      {
        id: UUID(), date: new Date("2024-07-15"),
        medecin: { nom: "Dr. Mansouri", specialite: "Cardiologie" },
        diagnostic: "HTA contrôlée, dyslipidémie améliorée",
        tension: { systolique: NumberInt(128), diastolique: NumberInt(80) },
        medicaments: [{ nom: "Atorvastatine", dosage: "20mg", duree: "90 jours" }],
        notes: "LDL à 1.1 g/L — objectif atteint"
      },
      {
        id: UUID(), date: new Date("2024-12-03"),
        medecin: { nom: "Dr. Mansouri", specialite: "Cardiologie" },
        diagnostic: "Suivi cardiologique annuel — stable",
        tension: { systolique: NumberInt(125), diastolique: NumberInt(78) },
        medicaments: [{ nom: "Atorvastatine", dosage: "20mg", duree: "90 jours" }],
        notes: "ECG normal"
      }
    ]
  },
  {
    cin: "198511220099",
    nom: "Cherif", prenom: "Nadia",
    dateNaissance: new Date("1985-11-22"), sexe: "F",
    adresse: { wilaya: "Blida", commune: "Boufarik" },
    groupeSanguin: "A-",
    antecedents: ["Hypothyroïdie"],
    allergies: ["Latex"],
    consultations: [
      {
        id: UUID(), date: new Date("2024-02-20"),
        medecin: { nom: "Dr. Khelifi", specialite: "Endocrinologie" },
        diagnostic: "Hypothyroïdie sous traitement",
        tension: { systolique: NumberInt(120), diastolique: NumberInt(78) },
        medicaments: [{ nom: "Lévothyroxine", dosage: "75mcg", duree: "365 jours" }],
        notes: "TSH à 3.2 mUI/L — dans la norme"
      },
      {
        id: UUID(), date: new Date("2024-08-05"),
        medecin: { nom: "Dr. Khelifi", specialite: "Endocrinologie" },
        diagnostic: "Hypothyroïdie équilibrée",
        tension: { systolique: NumberInt(118), diastolique: NumberInt(76) },
        medicaments: [{ nom: "Lévothyroxine", dosage: "75mcg", duree: "365 jours" }],
        notes: "TSH à 2.8 mUI/L — stable"
      }
    ]
  },
  {
    cin: "196204301155",
    nom: "Belaidi", prenom: "Abdelkader",
    dateNaissance: new Date("1962-04-30"), sexe: "M",
    adresse: { wilaya: "Tlemcen", commune: "Mansourah" },
    groupeSanguin: "B-",
    antecedents: ["Diabète type 2", "HTA", "Cardiopathie ischémique"],
    allergies: ["Pénicilline", "Iode"],
    consultations: [
      {
        id: UUID(), date: new Date("2024-01-10"),
        medecin: { nom: "Dr. Mansouri", specialite: "Cardiologie" },
        diagnostic: "Angine de poitrine stable",
        tension: { systolique: NumberInt(152), diastolique: NumberInt(96) },
        medicaments: [
          { nom: "Bisoprolol", dosage: "5mg", duree: "90 jours" },
          { nom: "Aspirine", dosage: "100mg", duree: "À vie" },
          { nom: "Nitroglycérine", dosage: "0.5mg", duree: "À la demande" }
        ],
        notes: "ECG de stress conseillé"
      },
      {
        id: UUID(), date: new Date("2024-05-22"),
        medecin: { nom: "Dr. Khelifi", specialite: "Endocrinologie" },
        diagnostic: "Diabète type 2 — déséquilibré",
        tension: { systolique: NumberInt(148), diastolique: NumberInt(94) },
        medicaments: [{ nom: "Insuline NPH", dosage: "30UI", duree: "90 jours" }],
        notes: "HbA1c à 9.1% — adaptation insulinique"
      },
      {
        id: UUID(), date: new Date("2024-10-08"),
        medecin: { nom: "Dr. Mansouri", specialite: "Cardiologie" },
        diagnostic: "Cardiopathie ischémique — stabilisée",
        tension: { systolique: NumberInt(138), diastolique: NumberInt(86) },
        medicaments: [
          { nom: "Bisoprolol", dosage: "5mg", duree: "90 jours" },
          { nom: "Aspirine", dosage: "100mg", duree: "À vie" }
        ],
        notes: "Fraction d'éjection 52% — acceptable"
      }
    ]
  },
  {
    cin: "199008124433",
    nom: "Bouzidi", prenom: "Yasmine",
    dateNaissance: new Date("1990-08-12"), sexe: "F",
    adresse: { wilaya: "Sétif", commune: "El Eulma" },
    groupeSanguin: "O+",
    antecedents: ["Migraine"],
    allergies: [],
    consultations: [
      {
        id: UUID(), date: new Date("2024-03-07"),
        medecin: { nom: "Dr. Hamidi", specialite: "Neurologie" },
        diagnostic: "Migraine sans aura",
        tension: { systolique: NumberInt(116), diastolique: NumberInt(74) },
        medicaments: [
          { nom: "Sumatriptan", dosage: "50mg", duree: "À la demande" },
          { nom: "Propranolol", dosage: "40mg", duree: "60 jours" }
        ],
        notes: "Journal des crises recommandé"
      },
      {
        id: UUID(), date: new Date("2024-09-19"),
        medecin: { nom: "Dr. Hamidi", specialite: "Neurologie" },
        diagnostic: "Migraine — fréquence réduite",
        tension: { systolique: NumberInt(114), diastolique: NumberInt(72) },
        medicaments: [{ nom: "Propranolol", dosage: "40mg", duree: "90 jours" }],
        notes: "Crises mensuelles réduites de 8 à 3"
      }
    ]
  },
  {
    cin: "197703185566",
    nom: "Benkhaled", prenom: "Rachid",
    dateNaissance: new Date("1977-03-18"), sexe: "M",
    adresse: { wilaya: "Alger", commune: "Kouba" },
    groupeSanguin: "AB+",
    antecedents: ["Ulcère gastrique", "HTA"],
    allergies: ["AINS"],
    consultations: [
      {
        id: UUID(), date: new Date("2024-02-14"),
        medecin: { nom: "Dr. Ferhat", specialite: "Gastro-entérologie" },
        diagnostic: "Ulcère gastrique — récidive",
        tension: { systolique: NumberInt(135), diastolique: NumberInt(86) },
        medicaments: [
          { nom: "Oméprazole", dosage: "20mg", duree: "30 jours" },
          { nom: "Amoxicilline", dosage: "1g", duree: "7 jours" },
          { nom: "Clarithromycine", dosage: "500mg", duree: "7 jours" }
        ],
        notes: "Triple thérapie anti-Helicobacter pylori"
      },
      {
        id: UUID(), date: new Date("2024-06-28"),
        medecin: { nom: "Dr. Ferhat", specialite: "Gastro-entérologie" },
        diagnostic: "Ulcère cicatrisé",
        tension: { systolique: NumberInt(130), diastolique: NumberInt(82) },
        medicaments: [{ nom: "Oméprazole", dosage: "20mg", duree: "À la demande" }],
        notes: "Fibroscopie de contrôle dans 6 mois"
      },
      {
        id: UUID(), date: new Date("2024-12-10"),
        medecin: { nom: "Dr. Mansouri", specialite: "Cardiologie" },
        diagnostic: "HTA légère",
        tension: { systolique: NumberInt(136), diastolique: NumberInt(85) },
        medicaments: [{ nom: "Ramipril", dosage: "5mg", duree: "90 jours" }],
        notes: "Éviter le sel et le stress"
      }
    ]
  },
  {
    cin: "196112251877",
    nom: "Sahnoune", prenom: "Fatima Zohra",
    dateNaissance: new Date("1961-12-25"), sexe: "F",
    adresse: { wilaya: "Oran", commune: "Bir El Djir" },
    groupeSanguin: "A+",
    antecedents: ["Diabète type 2", "HTA", "Arthrose"],
    allergies: [],
    consultations: [
      {
        id: UUID(), date: new Date("2024-01-05"),
        medecin: { nom: "Dr. Khelifi", specialite: "Endocrinologie" },
        diagnostic: "Diabète type 2 — suivi trimestriel",
        tension: { systolique: NumberInt(144), diastolique: NumberInt(90) },
        medicaments: [
          { nom: "Metformine", dosage: "1g", duree: "90 jours" },
          { nom: "Sitagliptine", dosage: "100mg", duree: "90 jours" }
        ],
        notes: "HbA1c à 7.8%"
      },
      {
        id: UUID(), date: new Date("2024-04-18"),
        medecin: { nom: "Dr. Benali", specialite: "Rhumatologie" },
        diagnostic: "Gonarthrose bilatérale",
        tension: { systolique: NumberInt(140), diastolique: NumberInt(88) },
        medicaments: [
          { nom: "Chondroïtine sulfate", dosage: "400mg", duree: "90 jours" },
          { nom: "Paracétamol", dosage: "1g", duree: "À la demande" }
        ],
        notes: "Kinésithérapie recommandée — 15 séances"
      },
      {
        id: UUID(), date: new Date("2024-09-02"),
        medecin: { nom: "Dr. Khelifi", specialite: "Endocrinologie" },
        diagnostic: "Diabète type 2 — partiellement équilibré",
        tension: { systolique: NumberInt(142), diastolique: NumberInt(89) },
        medicaments: [{ nom: "Metformine", dosage: "1g", duree: "90 jours" }],
        notes: "HbA1c à 8.1% — à améliorer"
      }
    ]
  },
  {
    cin: "198806097744",
    nom: "Mekki", prenom: "Sofiane",
    dateNaissance: new Date("1988-06-09"), sexe: "M",
    adresse: { wilaya: "Constantine", commune: "Hamma Bouziane" },
    groupeSanguin: "O+",
    antecedents: [],
    allergies: [],
    consultations: [
      {
        id: UUID(), date: new Date("2024-03-25"),
        medecin: { nom: "Dr. Ferhat", specialite: "Médecine générale" },
        diagnostic: "Lombalgie aiguë",
        tension: { systolique: NumberInt(122), diastolique: NumberInt(79) },
        medicaments: [
          { nom: "Ibuprofène", dosage: "400mg", duree: "7 jours" },
          { nom: "Thiocolchicoside", dosage: "4mg", duree: "5 jours" }
        ],
        notes: "Repos relatif, pas de soulèvement de charges"
      },
      {
        id: UUID(), date: new Date("2024-11-13"),
        medecin: { nom: "Dr. Benali", specialite: "Rhumatologie" },
        diagnostic: "Lombalgie chronique — discopathie L4-L5",
        tension: { systolique: NumberInt(120), diastolique: NumberInt(77) },
        medicaments: [
          { nom: "Prégabaline", dosage: "75mg", duree: "30 jours" },
          { nom: "Paracétamol", dosage: "1g", duree: "À la demande" }
        ],
        notes: "IRM lombaire réalisée — ostéophytes L4-L5"
      }
    ]
  },
  {
    cin: "197409210044",
    nom: "Larbi", prenom: "Houria",
    dateNaissance: new Date("1974-09-21"), sexe: "F",
    adresse: { wilaya: "Blida", commune: "Bougara" },
    groupeSanguin: "B+",
    antecedents: ["Dépression", "Hypothyroïdie"],
    allergies: ["Pénicilline"],
    consultations: [
      {
        id: UUID(), date: new Date("2024-02-03"),
        medecin: { nom: "Dr. Hamidi", specialite: "Psychiatrie" },
        diagnostic: "Épisode dépressif modéré",
        tension: { systolique: NumberInt(118), diastolique: NumberInt(75) },
        medicaments: [
          { nom: "Sertraline", dosage: "50mg", duree: "90 jours" },
          { nom: "Alprazolam", dosage: "0.25mg", duree: "30 jours" }
        ],
        notes: "Psychothérapie cognitive-comportementale recommandée"
      },
      {
        id: UUID(), date: new Date("2024-07-16"),
        medecin: { nom: "Dr. Hamidi", specialite: "Psychiatrie" },
        diagnostic: "Dépression en rémission partielle",
        tension: { systolique: NumberInt(116), diastolique: NumberInt(74) },
        medicaments: [{ nom: "Sertraline", dosage: "100mg", duree: "90 jours" }],
        notes: "Amélioration du sommeil et de l'humeur"
      }
    ]
  },
  {
    cin: "196609142255",
    nom: "Moulay", prenom: "Ali",
    dateNaissance: new Date("1966-09-14"), sexe: "M",
    adresse: { wilaya: "Alger", commune: "Dar El Beïda" },
    groupeSanguin: "A-",
    antecedents: ["BPCO", "Tabagisme actif"],
    allergies: [],
    consultations: [
      {
        id: UUID(), date: new Date("2024-01-22"),
        medecin: { nom: "Dr. Benali", specialite: "Pneumologie" },
        diagnostic: "BPCO stade 2 — exacerbation",
        tension: { systolique: NumberInt(130), diastolique: NumberInt(82) },
        medicaments: [
          { nom: "Tiotropium", dosage: "18mcg", duree: "365 jours" },
          { nom: "Formotérol", dosage: "12mcg", duree: "90 jours" },
          { nom: "Prednisone", dosage: "40mg", duree: "5 jours" }
        ],
        notes: "Sevrage tabagique fortement conseillé"
      },
      {
        id: UUID(), date: new Date("2024-06-30"),
        medecin: { nom: "Dr. Benali", specialite: "Pneumologie" },
        diagnostic: "BPCO stabilisée — spirométrie améliorée",
        tension: { systolique: NumberInt(128), diastolique: NumberInt(80) },
        medicaments: [{ nom: "Tiotropium", dosage: "18mcg", duree: "365 jours" }],
        notes: "VEMS à 62% — amélioration de 8 points"
      },
      {
        id: UUID(), date: new Date("2024-11-05"),
        medecin: { nom: "Dr. Benali", specialite: "Pneumologie" },
        diagnostic: "BPCO — suivi annuel",
        tension: { systolique: NumberInt(126), diastolique: NumberInt(79) },
        medicaments: [{ nom: "Tiotropium", dosage: "18mcg", duree: "365 jours" }],
        notes: "Patient toujours fumeur — 10 cigarettes/jour"
      }
    ]
  },
  {
    cin: "199212306688",
    nom: "Guendouz", prenom: "Sarah",
    dateNaissance: new Date("1992-12-30"), sexe: "F",
    adresse: { wilaya: "Tizi Ouzou", commune: "Azazga" },
    groupeSanguin: "O-",
    antecedents: ["Anémie ferriprive"],
    allergies: [],
    consultations: [
      {
        id: UUID(), date: new Date("2024-04-08"),
        medecin: { nom: "Dr. Ferhat", specialite: "Médecine générale" },
        diagnostic: "Anémie ferriprive modérée",
        tension: { systolique: NumberInt(108), diastolique: NumberInt(66) },
        medicaments: [
          { nom: "Fer ferreux", dosage: "80mg", duree: "60 jours" },
          { nom: "Vitamine C", dosage: "500mg", duree: "60 jours" }
        ],
        notes: "Alimentation riche en fer conseillée"
      },
      {
        id: UUID(), date: new Date("2024-08-20"),
        medecin: { nom: "Dr. Ferhat", specialite: "Médecine générale" },
        diagnostic: "Anémie corrigée",
        tension: { systolique: NumberInt(112), diastolique: NumberInt(70) },
        medicaments: [],
        notes: "Hémoglobine à 12.4 g/dL — normale"
      }
    ]
  },
  {
    cin: "197106255577",
    nom: "Haddar", prenom: "Mustapha",
    dateNaissance: new Date("1971-06-25"), sexe: "M",
    adresse: { wilaya: "Béjaïa", commune: "Tichy" },
    groupeSanguin: "B+",
    antecedents: ["HTA", "Goutte"],
    allergies: ["Sulfamides"],
    consultations: [
      {
        id: UUID(), date: new Date("2024-03-14"),
        medecin: { nom: "Dr. Benali", specialite: "Rhumatologie" },
        diagnostic: "Crise de goutte aiguë",
        tension: { systolique: NumberInt(148), diastolique: NumberInt(94) },
        medicaments: [
          { nom: "Colchicine", dosage: "1mg", duree: "5 jours" },
          { nom: "Allopurinol", dosage: "300mg", duree: "365 jours" }
        ],
        notes: "Régime hypo-purinique — éviter alcool et abats"
      },
      {
        id: UUID(), date: new Date("2024-09-27"),
        medecin: { nom: "Dr. Mansouri", specialite: "Cardiologie" },
        diagnostic: "HTA — ajustement thérapeutique",
        tension: { systolique: NumberInt(150), diastolique: NumberInt(96) },
        medicaments: [{ nom: "Amlodipine", dosage: "10mg", duree: "90 jours" }],
        notes: "Uricémie à 580 µmol/L — allopurinol continué"
      }
    ]
  },
  {
    cin: "198403077799",
    nom: "Rekik", prenom: "Meriem",
    dateNaissance: new Date("1984-03-07"), sexe: "F",
    adresse: { wilaya: "Alger", commune: "Ben Aknoun" },
    groupeSanguin: "A+",
    antecedents: ["Lupus érythémateux systémique"],
    allergies: ["AINS", "Sulfamides"],
    consultations: [
      {
        id: UUID(), date: new Date("2024-01-30"),
        medecin: { nom: "Dr. Hamidi", specialite: "Rhumatologie" },
        diagnostic: "Lupus — poussée modérée",
        tension: { systolique: NumberInt(124), diastolique: NumberInt(80) },
        medicaments: [
          { nom: "Hydroxychloroquine", dosage: "400mg", duree: "365 jours" },
          { nom: "Prednisone", dosage: "20mg", duree: "30 jours" }
        ],
        notes: "Bilan immunologique complet réalisé — Anti-dsDNA élevés"
      },
      {
        id: UUID(), date: new Date("2024-07-22"),
        medecin: { nom: "Dr. Hamidi", specialite: "Rhumatologie" },
        diagnostic: "Lupus en rémission",
        tension: { systolique: NumberInt(120), diastolique: NumberInt(76) },
        medicaments: [{ nom: "Hydroxychloroquine", dosage: "200mg", duree: "365 jours" }],
        notes: "Complément C3/C4 normalisés"
      },
      {
        id: UUID(), date: new Date("2024-12-15"),
        medecin: { nom: "Dr. Hamidi", specialite: "Rhumatologie" },
        diagnostic: "Lupus — suivi semestriel",
        tension: { systolique: NumberInt(118), diastolique: NumberInt(74) },
        medicaments: [{ nom: "Hydroxychloroquine", dosage: "200mg", duree: "365 jours" }],
        notes: "Stable — continuer le suivi ophtalmologique"
      }
    ]
  },
  {
    cin: "196305181166",
    nom: "Sellami", prenom: "Abdelhamid",
    dateNaissance: new Date("1963-05-18"), sexe: "M",
    adresse: { wilaya: "Oran", commune: "Arzew" },
    groupeSanguin: "O+",
    antecedents: ["Diabète type 2", "HTA", "Rétinopathie diabétique"],
    allergies: [],
    consultations: [
      {
        id: UUID(), date: new Date("2023-12-20"),
        medecin: { nom: "Dr. Zitouni", specialite: "Ophtalmologie" },
        diagnostic: "Rétinopathie diabétique non proliférante",
        tension: { systolique: NumberInt(150), diastolique: NumberInt(95) },
        medicaments: [{ nom: "Ranibizumab", dosage: "0.5mg IVT", duree: "Mensuel x3" }],
        notes: "Laser photocoagulation envisagé"
      },
      {
        id: UUID(), date: new Date("2024-04-05"),
        medecin: { nom: "Dr. Khelifi", specialite: "Endocrinologie" },
        diagnostic: "Diabète type 2 — déséquilibré (complication oculaire)",
        tension: { systolique: NumberInt(155), diastolique: NumberInt(98) },
        medicaments: [
          { nom: "Insuline Glargine", dosage: "40UI", duree: "90 jours" },
          { nom: "Metformine", dosage: "500mg", duree: "90 jours" }
        ],
        notes: "HbA1c à 10.2% — urgence métabolique"
      },
      {
        id: UUID(), date: new Date("2024-10-14"),
        medecin: { nom: "Dr. Mansouri", specialite: "Cardiologie" },
        diagnostic: "HTA non contrôlée — risque cardiovasculaire élevé",
        tension: { systolique: NumberInt(162), diastolique: NumberInt(100) },
        medicaments: [
          { nom: "Amlodipine", dosage: "10mg", duree: "90 jours" },
          { nom: "Ramipril", dosage: "10mg", duree: "90 jours" }
        ],
        notes: "Bithérapie antihypertensive initiée"
      }
    ]
  },
  {
    cin: "199607028833",
    nom: "Aoudia", prenom: "Imane",
    dateNaissance: new Date("1996-07-02"), sexe: "F",
    adresse: { wilaya: "Alger", commune: "Birkhadem" },
    groupeSanguin: "AB+",
    antecedents: [],
    allergies: [],
    consultations: [
      {
        id: UUID(), date: new Date("2024-05-17"),
        medecin: { nom: "Dr. Ferhat", specialite: "Médecine générale" },
        diagnostic: "Infection urinaire basse",
        tension: { systolique: NumberInt(112), diastolique: NumberInt(68) },
        medicaments: [{ nom: "Fosfomycine", dosage: "3g", duree: "Dose unique" }],
        notes: "ECBU de contrôle dans 7 jours"
      },
      {
        id: UUID(), date: new Date("2024-11-28"),
        medecin: { nom: "Dr. Ferhat", specialite: "Médecine générale" },
        diagnostic: "Bilan annuel — RAS",
        tension: { systolique: NumberInt(110), diastolique: NumberInt(66) },
        medicaments: [],
        notes: "Tous les paramètres dans la norme"
      }
    ]
  },
  {
    cin: "197812193344",
    nom: "Benlahsen", prenom: "Omar",
    dateNaissance: new Date("1978-12-19"), sexe: "M",
    adresse: { wilaya: "Annaba", commune: "El Bouni" },
    groupeSanguin: "B-",
    antecedents: ["Épilepsie"],
    allergies: ["Carbamazépine"],
    consultations: [
      {
        id: UUID(), date: new Date("2024-02-26"),
        medecin: { nom: "Dr. Hamidi", specialite: "Neurologie" },
        diagnostic: "Épilepsie partielle — crises contrôlées",
        tension: { systolique: NumberInt(126), diastolique: NumberInt(82) },
        medicaments: [
          { nom: "Lévétiracétam", dosage: "1000mg", duree: "365 jours" },
          { nom: "Acide valproïque", dosage: "500mg", duree: "365 jours" }
        ],
        notes: "Dernière crise il y a 6 mois — bonne observance"
      },
      {
        id: UUID(), date: new Date("2024-08-14"),
        medecin: { nom: "Dr. Hamidi", specialite: "Neurologie" },
        diagnostic: "Épilepsie — suivi semestriel",
        tension: { systolique: NumberInt(124), diastolique: NumberInt(80) },
        medicaments: [{ nom: "Lévétiracétam", dosage: "1000mg", duree: "365 jours" }],
        notes: "EEG stable — maintien du traitement actuel"
      }
    ]
  },
  {
    cin: "196910076622",
    nom: "Taleb", prenom: "Zahia",
    dateNaissance: new Date("1969-10-07"), sexe: "F",
    adresse: { wilaya: "Alger", commune: "El Harrach" },
    groupeSanguin: "A-",
    antecedents: ["Ostéoporose", "Diabète type 2"],
    allergies: [],
    consultations: [
      {
        id: UUID(), date: new Date("2024-01-19"),
        medecin: { nom: "Dr. Benali", specialite: "Rhumatologie" },
        diagnostic: "Ostéoporose post-ménopausique",
        tension: { systolique: NumberInt(130), diastolique: NumberInt(83) },
        medicaments: [
          { nom: "Alendronate", dosage: "70mg", duree: "Hebdomadaire" },
          { nom: "Calcium", dosage: "1000mg", duree: "365 jours" },
          { nom: "Vitamine D3", dosage: "800UI", duree: "365 jours" }
        ],
        notes: "T-score à -2.8 — ostéoporose confirmée"
      },
      {
        id: UUID(), date: new Date("2024-05-30"),
        medecin: { nom: "Dr. Khelifi", specialite: "Endocrinologie" },
        diagnostic: "Diabète type 2 — équilibré",
        tension: { systolique: NumberInt(134), diastolique: NumberInt(85) },
        medicaments: [{ nom: "Metformine", dosage: "1g", duree: "90 jours" }],
        notes: "HbA1c à 7.0% — objectif atteint"
      },
      {
        id: UUID(), date: new Date("2024-10-22"),
        medecin: { nom: "Dr. Benali", specialite: "Rhumatologie" },
        diagnostic: "Ostéoporose — fracture vertébrale T12",
        tension: { systolique: NumberInt(128), diastolique: NumberInt(82) },
        medicaments: [
          { nom: "Alendronate", dosage: "70mg", duree: "Hebdomadaire" },
          { nom: "Calcium", dosage: "1000mg", duree: "365 jours" }
        ],
        notes: "Corset lombaire prescrit — kiné en cours"
      }
    ]
  }
];

db.patients.insertMany(patients);

// ─── 1.3 : Collection analyses (référencée par patient_id) ───────────────────
// Récupérer les _id des patients pour les références
const pat = db.patients.find({}, { _id: 1, cin: 1 }).toArray();
const byIndex = (i) => pat[i]._id;

const analyses = [
  // Patient 0 — Ahmed Bensalem (Diabète type 2 + HTA)
  {
    patient_id: byIndex(0), date: new Date("2024-01-10"),
    type: "Glycémie",
    resultats: { glycemie_a_jeun: 1.82, HbA1c: 8.4, unite: "g/L" },
    laboratoire: "Labo Central Alger", valide: true
  },
  {
    patient_id: byIndex(0), date: new Date("2024-06-05"),
    type: "Lipidogramme",
    resultats: { cholesterol_total: 2.1, LDL: 1.35, HDL: 0.42, triglycerides: 1.65, unite: "g/L" },
    laboratoire: "Labo Central Alger", valide: true
  },
  // Patient 2 — Mohamed Hadj Aissa (IRC + Diabète + HTA)
  {
    patient_id: byIndex(2), date: new Date("2023-11-28"),
    type: "Créatinine",
    resultats: { creatinine: 210, uree: 12.5, DFG_CKD_EPI: 28, unite: "µmol/L" },
    laboratoire: "Labo CHU Constantine", valide: true
  },
  {
    patient_id: byIndex(2), date: new Date("2024-03-14"),
    type: "NFS",
    resultats: { hemoglobine: 10.2, hematocrite: 31, leucocytes: 6800, plaquettes: 210000 },
    laboratoire: "Labo CHU Constantine", valide: true
  },
  {
    patient_id: byIndex(2), date: new Date("2024-03-14"),
    type: "Glycémie",
    resultats: { glycemie_a_jeun: 1.95, HbA1c: 9.0, unite: "g/L" },
    laboratoire: "Labo CHU Constantine", valide: true
  },
  // Patient 4 — Karim Bouchama (HTA + Dyslipidémie)
  {
    patient_id: byIndex(4), date: new Date("2024-01-25"),
    type: "Lipidogramme",
    resultats: { cholesterol_total: 2.8, LDL: 1.9, HDL: 0.38, triglycerides: 2.1, unite: "g/L" },
    laboratoire: "Labo Privé Annaba", valide: true
  },
  {
    patient_id: byIndex(4), date: new Date("2024-07-10"),
    type: "Lipidogramme",
    resultats: { cholesterol_total: 2.1, LDL: 1.1, HDL: 0.45, triglycerides: 1.4, unite: "g/L" },
    laboratoire: "Labo Privé Annaba", valide: true
  },
  // Patient 6 — Abdelkader Belaidi (Diabète + HTA + Cardio)
  {
    patient_id: byIndex(6), date: new Date("2024-01-08"),
    type: "ECG",
    resultats: { rythme: "Sinusal", frequence: 68, PR: 180, QRS: 95, QTc: 420, anomalies: "Sus-décalage ST absent" },
    laboratoire: "CHU Tlemcen", valide: true
  },
  {
    patient_id: byIndex(6), date: new Date("2024-05-20"),
    type: "Glycémie",
    resultats: { glycemie_a_jeun: 2.45, HbA1c: 9.1, unite: "g/L" },
    laboratoire: "CHU Tlemcen", valide: true
  },
  // Patient 9 — Fatima Zohra Sahnoune (Diabète + HTA)
  {
    patient_id: byIndex(9), date: new Date("2024-01-03"),
    type: "Glycémie",
    resultats: { glycemie_a_jeun: 1.72, HbA1c: 7.8, unite: "g/L" },
    laboratoire: "Labo Central Oran", valide: true
  },
  {
    patient_id: byIndex(9), date: new Date("2024-08-28"),
    type: "NFS",
    resultats: { hemoglobine: 11.8, hematocrite: 35, leucocytes: 7200, plaquettes: 245000 },
    laboratoire: "Labo Central Oran", valide: true
  },
  // Patient 12 — Ali Moulay (BPCO)
  {
    patient_id: byIndex(12), date: new Date("2024-01-20"),
    type: "NFS",
    resultats: { hemoglobine: 16.2, hematocrite: 49, leucocytes: 9500, plaquettes: 310000 },
    laboratoire: "Labo Alger Centre", valide: true
  },
  // Patient 16 — Abdelhamid Sellami (Diabète + HTA + Rétinopathie)
  {
    patient_id: byIndex(16), date: new Date("2024-04-01"),
    type: "Glycémie",
    resultats: { glycemie_a_jeun: 2.92, HbA1c: 10.2, unite: "g/L" },
    laboratoire: "Labo CHU Oran", valide: true
  },
  {
    patient_id: byIndex(16), date: new Date("2024-04-01"),
    type: "Lipidogramme",
    resultats: { cholesterol_total: 2.6, LDL: 1.8, HDL: 0.35, triglycerides: 2.3, unite: "g/L" },
    laboratoire: "Labo CHU Oran", valide: true
  },
  // Patient 19 — Zahia Taleb (Ostéoporose + Diabète)
  {
    patient_id: byIndex(19), date: new Date("2024-01-16"),
    type: "Glycémie",
    resultats: { glycemie_a_jeun: 1.38, HbA1c: 7.0, unite: "g/L" },
    laboratoire: "Labo Alger Est", valide: true
  },
  {
    patient_id: byIndex(19), date: new Date("2024-01-16"),
    type: "NFS",
    resultats: { hemoglobine: 12.1, hematocrite: 36, leucocytes: 6500, plaquettes: 195000 },
    laboratoire: "Labo Alger Est", valide: true
  },
  // Vieille analyse (>5 ans) pour tester l'index TTL
  {
    patient_id: byIndex(0), date: new Date("2019-06-10"),
    type: "Glycémie",
    resultats: { glycemie_a_jeun: 1.55, HbA1c: 7.5, unite: "g/L" },
    laboratoire: "Labo Central Alger", valide: true
  }
];

db.analyses.insertMany(analyses);

print("✅ Modélisation terminée. Patients insérés :", db.patients.countDocuments());
print("✅ Analyses insérées :", db.analyses.countDocuments());
