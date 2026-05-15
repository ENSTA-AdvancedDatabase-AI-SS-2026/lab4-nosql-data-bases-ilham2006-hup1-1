// TP4 - Exercice 1 : Création du graphe UniConnect DZ
// Effacer la base pour partir propre
MATCH (n) DETACH DELETE n;

// ─── 1.1 : Contraintes d'unicité ─────────────────────────────────────────────
CREATE CONSTRAINT etudiant_id   IF NOT EXISTS FOR (e:Etudiant)   REQUIRE e.id  IS UNIQUE;
CREATE CONSTRAINT cours_code    IF NOT EXISTS FOR (c:Cours)       REQUIRE c.code IS UNIQUE;
CREATE CONSTRAINT competence_nom IF NOT EXISTS FOR (c:Competence) REQUIRE c.nom  IS UNIQUE;
CREATE CONSTRAINT club_nom      IF NOT EXISTS FOR (c:Club)        REQUIRE c.nom  IS UNIQUE;
CREATE CONSTRAINT entreprise_nom IF NOT EXISTS FOR (e:Entreprise) REQUIRE e.nom  IS UNIQUE;

// ─── 1.2 : Compétences ────────────────────────────────────────────────────────
UNWIND [
  {nom: "Python",          categorie: "Programmation"},
  {nom: "Java",            categorie: "Programmation"},
  {nom: "C++",             categorie: "Programmation"},
  {nom: "SQL",             categorie: "Bases de Données"},
  {nom: "NoSQL",           categorie: "Bases de Données"},
  {nom: "Machine Learning",categorie: "IA"},
  {nom: "Deep Learning",   categorie: "IA"},
  {nom: "React",           categorie: "Web"},
  {nom: "Node.js",         categorie: "Web"},
  {nom: "Docker",          categorie: "DevOps"},
  {nom: "Linux",           categorie: "Systèmes"},
  {nom: "Réseaux",         categorie: "Infrastructure"},
  {nom: "Cybersécurité",   categorie: "Sécurité"},
  {nom: "Data Science",    categorie: "IA"},
  {nom: "Git",             categorie: "DevOps"}
] AS comp
MERGE (:Competence {nom: comp.nom, categorie: comp.categorie});

// ─── 1.3 : Cours ──────────────────────────────────────────────────────────────
UNWIND [
  {code: "INFO401", intitule: "Bases de Données Avancées",    credits: 6, dept: "Informatique"},
  {code: "INFO402", intitule: "Intelligence Artificielle",    credits: 6, dept: "Informatique"},
  {code: "INFO403", intitule: "Développement Web",            credits: 4, dept: "Informatique"},
  {code: "INFO404", intitule: "Systèmes Distribués",          credits: 5, dept: "Informatique"},
  {code: "INFO405", intitule: "Cloud Computing",              credits: 4, dept: "Informatique"},
  {code: "INFO406", intitule: "Sécurité Informatique",        credits: 4, dept: "Informatique"},
  {code: "INFO407", intitule: "Vision par Ordinateur",        credits: 5, dept: "Informatique"},
  {code: "MATH301", intitule: "Algèbre Linéaire",             credits: 5, dept: "Mathématiques"},
  {code: "MATH302", intitule: "Probabilités et Statistiques", credits: 5, dept: "Mathématiques"},
  {code: "ELEC301", intitule: "Traitement du Signal",         credits: 4, dept: "Electronique"}
] AS cours
MERGE (:Cours {code: cours.code, intitule: cours.intitule,
               credits: cours.credits, departement: cours.dept});

// ─── Cours → Compétences requises ─────────────────────────────────────────────
MATCH (c:Cours {code: "INFO401"}), (cp:Competence {nom: "SQL"})    MERGE (c)-[:REQUIERT]->(cp);
MATCH (c:Cours {code: "INFO401"}), (cp:Competence {nom: "NoSQL"})  MERGE (c)-[:REQUIERT]->(cp);
MATCH (c:Cours {code: "INFO402"}), (cp:Competence {nom: "Python"}) MERGE (c)-[:REQUIERT]->(cp);
MATCH (c:Cours {code: "INFO402"}), (cp:Competence {nom: "Machine Learning"}) MERGE (c)-[:REQUIERT]->(cp);
MATCH (c:Cours {code: "INFO403"}), (cp:Competence {nom: "React"})   MERGE (c)-[:REQUIERT]->(cp);
MATCH (c:Cours {code: "INFO403"}), (cp:Competence {nom: "Node.js"}) MERGE (c)-[:REQUIERT]->(cp);
MATCH (c:Cours {code: "INFO404"}), (cp:Competence {nom: "Docker"})  MERGE (c)-[:REQUIERT]->(cp);
MATCH (c:Cours {code: "INFO404"}), (cp:Competence {nom: "Linux"})   MERGE (c)-[:REQUIERT]->(cp);
MATCH (c:Cours {code: "INFO405"}), (cp:Competence {nom: "Docker"})  MERGE (c)-[:REQUIERT]->(cp);
MATCH (c:Cours {code: "INFO406"}), (cp:Competence {nom: "Cybersécurité"}) MERGE (c)-[:REQUIERT]->(cp);
MATCH (c:Cours {code: "INFO407"}), (cp:Competence {nom: "Deep Learning"}) MERGE (c)-[:REQUIERT]->(cp);
MATCH (c:Cours {code: "INFO407"}), (cp:Competence {nom: "Python"})  MERGE (c)-[:REQUIERT]->(cp);
MATCH (c:Cours {code: "MATH302"}), (cp:Competence {nom: "Data Science"}) MERGE (c)-[:REQUIERT]->(cp);

// ─── 1.4 : Clubs ──────────────────────────────────────────────────────────────
UNWIND [
  {nom: "Club IA USTHB",       universite: "USTHB", domaine: "Intelligence Artificielle"},
  {nom: "Club Dev USTHB",      universite: "USTHB", domaine: "Développement"},
  {nom: "Club Cyber UMBB",     universite: "UMBB",  domaine: "Cybersécurité"},
  {nom: "Club Robotique USTO", universite: "USTO",  domaine: "Robotique"},
  {nom: "Club Data UMC",       universite: "UMC",   domaine: "Data Science"},
  {nom: "Club Web UBMA",       universite: "UBMA",  domaine: "Web"},
  {nom: "Club Math USTHB",     universite: "USTHB", domaine: "Mathématiques"},
  {nom: "Club IoT UMBB",       universite: "UMBB",  domaine: "Internet des Objets"}
] AS cl
MERGE (:Club {nom: cl.nom, universite: cl.universite, domaine: cl.domaine});

// ─── 1.5 : Entreprises ────────────────────────────────────────────────────────
UNWIND [
  {nom: "Sonatrach",   secteur: "Énergie",         ville: "Alger"},
  {nom: "Djezzy",      secteur: "Télécoms",         ville: "Alger"},
  {nom: "Ooredoo",     secteur: "Télécoms",         ville: "Alger"},
  {nom: "Condor",      secteur: "Électronique",     ville: "Bordj Bou Arreridj"},
  {nom: "Mobilis",     secteur: "Télécoms",         ville: "Alger"},
  {nom: "CIB",         secteur: "Finance",          ville: "Alger"},
  {nom: "NCA Rouiba",  secteur: "Agroalimentaire",  ville: "Rouiba"},
  {nom: "Cevital",     secteur: "Agroalimentaire",  ville: "Bejaia"},
  {nom: "Ericsson DZ", secteur: "Télécoms",         ville: "Alger"},
  {nom: "IBM DZ",      secteur: "Informatique",     ville: "Alger"}
] AS ent
MERGE (:Entreprise {nom: ent.nom, secteur: ent.secteur, ville: ent.ville});

// ─── 1.6 : 50 Étudiants ───────────────────────────────────────────────────────
UNWIND [
  // ── USTHB (10 étudiants) ──────────────────────────────────────────────────
  {id:"E001", prenom:"Ahmed",    nom:"Bensalem",   universite:"USTHB", filiere:"Informatique", annee:3, ville:"Alger"},
  {id:"E002", prenom:"Fatima",   nom:"Ouali",      universite:"USTHB", filiere:"Informatique", annee:3, ville:"Alger"},
  {id:"E003", prenom:"Karim",    nom:"Hadjadj",    universite:"USTHB", filiere:"Informatique", annee:4, ville:"Alger"},
  {id:"E004", prenom:"Nour",     nom:"Belkadi",    universite:"USTHB", filiere:"Mathématiques",annee:2, ville:"Alger"},
  {id:"E005", prenom:"Yasmina", nom:"Amrani",     universite:"USTHB", filiere:"GL",            annee:5, ville:"Blida"},
  {id:"E006", prenom:"Riad",     nom:"Meziani",    universite:"USTHB", filiere:"Informatique", annee:3, ville:"Alger"},
  {id:"E007", prenom:"Lina",     nom:"Boukhalfa",  universite:"USTHB", filiere:"Informatique", annee:2, ville:"Alger"},
  {id:"E008", prenom:"Mehdi",    nom:"Saadaoui",   universite:"USTHB", filiere:"GL",            annee:4, ville:"Alger"},
  {id:"E009", prenom:"Sara",     nom:"Khelil",     universite:"USTHB", filiere:"Mathématiques",annee:3, ville:"Alger"},
  {id:"E010", prenom:"Amine",    nom:"Bouzidi",    universite:"USTHB", filiere:"Informatique", annee:5, ville:"Alger"},
  // ── UMBB (10 étudiants) ──────────────────────────────────────────────────
  {id:"E011", prenom:"Asma",     nom:"Benamara",   universite:"UMBB",  filiere:"Informatique", annee:3, ville:"Boumerdès"},
  {id:"E012", prenom:"Hicham",   nom:"Laib",       universite:"UMBB",  filiere:"Electronique", annee:4, ville:"Boumerdès"},
  {id:"E013", prenom:"Imane",    nom:"Benhassine",  universite:"UMBB",  filiere:"Telecoms",     annee:3, ville:"Boumerdès"},
  {id:"E014", prenom:"Walid",    nom:"Ferhat",     universite:"UMBB",  filiere:"Informatique", annee:2, ville:"Alger"},
  {id:"E015", prenom:"Meriem",   nom:"Attar",      universite:"UMBB",  filiere:"GL",            annee:5, ville:"Boumerdès"},
  {id:"E016", prenom:"Sofiane",  nom:"Boudiaf",    universite:"UMBB",  filiere:"Informatique", annee:3, ville:"Boumerdès"},
  {id:"E017", prenom:"Dina",     nom:"Hamidouche", universite:"UMBB",  filiere:"Mathématiques",annee:4, ville:"Alger"},
  {id:"E018", prenom:"Nassim",   nom:"Yahi",       universite:"UMBB",  filiere:"Electronique", annee:3, ville:"Boumerdès"},
  {id:"E019", prenom:"Amira",    nom:"Guerrouche", universite:"UMBB",  filiere:"Telecoms",     annee:2, ville:"Boumerdès"},
  {id:"E020", prenom:"Bilal",    nom:"Chikh",      universite:"UMBB",  filiere:"Informatique", annee:5, ville:"Alger"},
  // ── USTO (10 étudiants) ──────────────────────────────────────────────────
  {id:"E021", prenom:"Zineb",    nom:"Kaci",       universite:"USTO",  filiere:"Informatique", annee:3, ville:"Oran"},
  {id:"E022", prenom:"Mohamed",  nom:"Boutaleb",   universite:"USTO",  filiere:"Electronique", annee:4, ville:"Oran"},
  {id:"E023", prenom:"Houria",   nom:"Rahmani",    universite:"USTO",  filiere:"Informatique", annee:5, ville:"Oran"},
  {id:"E024", prenom:"Redouane", nom:"Mebarki",    universite:"USTO",  filiere:"GL",            annee:3, ville:"Oran"},
  {id:"E025", prenom:"Soumia",   nom:"Benmahdi",   universite:"USTO",  filiere:"Mathématiques",annee:2, ville:"Oran"},
  {id:"E026", prenom:"Tarek",    nom:"Chabane",    universite:"USTO",  filiere:"Telecoms",     annee:4, ville:"Oran"},
  {id:"E027", prenom:"Nadia",    nom:"Benali",     universite:"USTO",  filiere:"Informatique", annee:3, ville:"Oran"},
  {id:"E028", prenom:"Youcef",   nom:"Benyoucef",  universite:"USTO",  filiere:"Electronique", annee:5, ville:"Oran"},
  {id:"E029", prenom:"Sabrina",  nom:"Hammoudi",   universite:"USTO",  filiere:"GL",            annee:2, ville:"Oran"},
  {id:"E030", prenom:"Adel",     nom:"Mazouz",     universite:"USTO",  filiere:"Informatique", annee:4, ville:"Oran"},
  // ── UMC (10 étudiants) ────────────────────────────────────────────────────
  {id:"E031", prenom:"Ikram",    nom:"Bouchama",   universite:"UMC",   filiere:"Informatique", annee:3, ville:"Constantine"},
  {id:"E032", prenom:"Salim",    nom:"Boukhalkhal",universite:"UMC",   filiere:"Informatique", annee:4, ville:"Constantine"},
  {id:"E033", prenom:"Rania",    nom:"Mekki",      universite:"UMC",   filiere:"Mathématiques",annee:5, ville:"Constantine"},
  {id:"E034", prenom:"Farouk",   nom:"Ladjal",     universite:"UMC",   filiere:"GL",            annee:3, ville:"Constantine"},
  {id:"E035", prenom:"Wafa",     nom:"Belhaj",     universite:"UMC",   filiere:"Telecoms",     annee:2, ville:"Constantine"},
  {id:"E036", prenom:"Sami",     nom:"Guediri",    universite:"UMC",   filiere:"Electronique", annee:4, ville:"Constantine"},
  {id:"E037", prenom:"Nawal",    nom:"Belarbi",    universite:"UMC",   filiere:"Informatique", annee:3, ville:"Constantine"},
  {id:"E038", prenom:"Khaled",   nom:"Benkhaled",  universite:"UMC",   filiere:"GL",            annee:5, ville:"Constantine"},
  {id:"E039", prenom:"Samira",   nom:"Boussaha",   universite:"UMC",   filiere:"Informatique", annee:2, ville:"Constantine"},
  {id:"E040", prenom:"Yassine",  nom:"Benhamza",   universite:"UMC",   filiere:"Mathématiques",annee:4, ville:"Constantine"},
  // ── UBMA (10 étudiants) ───────────────────────────────────────────────────
  {id:"E041", prenom:"Amina",    nom:"Boudjelal",  universite:"UBMA",  filiere:"Informatique", annee:3, ville:"Annaba"},
  {id:"E042", prenom:"Rachid",   nom:"Boucherit",  universite:"UBMA",  filiere:"GL",            annee:4, ville:"Annaba"},
  {id:"E043", prenom:"Leila",    nom:"Ziani",      universite:"UBMA",  filiere:"Informatique", annee:5, ville:"Annaba"},
  {id:"E044", prenom:"Hamza",    nom:"Beloufa",    universite:"UBMA",  filiere:"Electronique", annee:2, ville:"Annaba"},
  {id:"E045", prenom:"Chaima",   nom:"Mahieddine", universite:"UBMA",  filiere:"Mathématiques",annee:3, ville:"Annaba"},
  {id:"E046", prenom:"Mourad",   nom:"Hamaidi",    universite:"UBMA",  filiere:"Informatique", annee:4, ville:"Annaba"},
  {id:"E047", prenom:"Nesrine",  nom:"Bensaid",    universite:"UBMA",  filiere:"Telecoms",     annee:3, ville:"Annaba"},
  {id:"E048", prenom:"Lotfi",    nom:"Guechi",     universite:"UBMA",  filiere:"GL",            annee:5, ville:"Annaba"},
  {id:"E049", prenom:"Dalila",   nom:"Aissaoui",   universite:"UBMA",  filiere:"Informatique", annee:2, ville:"Annaba"},
  {id:"E050", prenom:"Oussama",  nom:"Belhadj",    universite:"UBMA",  filiere:"Informatique", annee:4, ville:"Annaba"}
] AS data
MERGE (e:Etudiant {id: data.id})
SET e += data;

// ─── 1.7 : Relations CONNAIT ──────────────────────────────────────────────────
// Connexions intra-USTHB
MATCH (a:Etudiant {id:"E001"}),(b:Etudiant {id:"E002"}) MERGE (a)-[:CONNAIT {depuis:2022, contexte:"cours"}]->(b);
MATCH (a:Etudiant {id:"E001"}),(b:Etudiant {id:"E003"}) MERGE (a)-[:CONNAIT {depuis:2021, contexte:"club"}]->(b);
MATCH (a:Etudiant {id:"E001"}),(b:Etudiant {id:"E006"}) MERGE (a)-[:CONNAIT {depuis:2023, contexte:"projet"}]->(b);
MATCH (a:Etudiant {id:"E002"}),(b:Etudiant {id:"E004"}) MERGE (a)-[:CONNAIT {depuis:2022, contexte:"cours"}]->(b);
MATCH (a:Etudiant {id:"E002"}),(b:Etudiant {id:"E007"}) MERGE (a)-[:CONNAIT {depuis:2023, contexte:"club"}]->(b);
MATCH (a:Etudiant {id:"E003"}),(b:Etudiant {id:"E008"}) MERGE (a)-[:CONNAIT {depuis:2021, contexte:"cours"}]->(b);
MATCH (a:Etudiant {id:"E004"}),(b:Etudiant {id:"E009"}) MERGE (a)-[:CONNAIT {depuis:2022, contexte:"projet"}]->(b);
MATCH (a:Etudiant {id:"E005"}),(b:Etudiant {id:"E010"}) MERGE (a)-[:CONNAIT {depuis:2020, contexte:"cours"}]->(b);
MATCH (a:Etudiant {id:"E006"}),(b:Etudiant {id:"E007"}) MERGE (a)-[:CONNAIT {depuis:2023, contexte:"club"}]->(b);
MATCH (a:Etudiant {id:"E008"}),(b:Etudiant {id:"E010"}) MERGE (a)-[:CONNAIT {depuis:2021, contexte:"projet"}]->(b);
MATCH (a:Etudiant {id:"E009"}),(b:Etudiant {id:"E010"}) MERGE (a)-[:CONNAIT {depuis:2022, contexte:"cours"}]->(b);
// Connexions intra-UMBB
MATCH (a:Etudiant {id:"E011"}),(b:Etudiant {id:"E012"}) MERGE (a)-[:CONNAIT {depuis:2022, contexte:"cours"}]->(b);
MATCH (a:Etudiant {id:"E011"}),(b:Etudiant {id:"E014"}) MERGE (a)-[:CONNAIT {depuis:2023, contexte:"club"}]->(b);
MATCH (a:Etudiant {id:"E012"}),(b:Etudiant {id:"E013"}) MERGE (a)-[:CONNAIT {depuis:2022, contexte:"projet"}]->(b);
MATCH (a:Etudiant {id:"E013"}),(b:Etudiant {id:"E016"}) MERGE (a)-[:CONNAIT {depuis:2023, contexte:"cours"}]->(b);
MATCH (a:Etudiant {id:"E014"}),(b:Etudiant {id:"E015"}) MERGE (a)-[:CONNAIT {depuis:2021, contexte:"club"}]->(b);
MATCH (a:Etudiant {id:"E015"}),(b:Etudiant {id:"E020"}) MERGE (a)-[:CONNAIT {depuis:2020, contexte:"cours"}]->(b);
MATCH (a:Etudiant {id:"E016"}),(b:Etudiant {id:"E017"}) MERGE (a)-[:CONNAIT {depuis:2023, contexte:"projet"}]->(b);
MATCH (a:Etudiant {id:"E017"}),(b:Etudiant {id:"E018"}) MERGE (a)-[:CONNAIT {depuis:2022, contexte:"cours"}]->(b);
MATCH (a:Etudiant {id:"E018"}),(b:Etudiant {id:"E019"}) MERGE (a)-[:CONNAIT {depuis:2023, contexte:"club"}]->(b);
MATCH (a:Etudiant {id:"E019"}),(b:Etudiant {id:"E020"}) MERGE (a)-[:CONNAIT {depuis:2022, contexte:"cours"}]->(b);
// Connexions intra-USTO
MATCH (a:Etudiant {id:"E021"}),(b:Etudiant {id:"E022"}) MERGE (a)-[:CONNAIT {depuis:2022, contexte:"cours"}]->(b);
MATCH (a:Etudiant {id:"E021"}),(b:Etudiant {id:"E024"}) MERGE (a)-[:CONNAIT {depuis:2023, contexte:"club"}]->(b);
MATCH (a:Etudiant {id:"E022"}),(b:Etudiant {id:"E023"}) MERGE (a)-[:CONNAIT {depuis:2022, contexte:"projet"}]->(b);
MATCH (a:Etudiant {id:"E023"}),(b:Etudiant {id:"E027"}) MERGE (a)-[:CONNAIT {depuis:2021, contexte:"cours"}]->(b);
MATCH (a:Etudiant {id:"E024"}),(b:Etudiant {id:"E025"}) MERGE (a)-[:CONNAIT {depuis:2023, contexte:"club"}]->(b);
MATCH (a:Etudiant {id:"E025"}),(b:Etudiant {id:"E030"}) MERGE (a)-[:CONNAIT {depuis:2022, contexte:"cours"}]->(b);
MATCH (a:Etudiant {id:"E026"}),(b:Etudiant {id:"E027"}) MERGE (a)-[:CONNAIT {depuis:2023, contexte:"projet"}]->(b);
MATCH (a:Etudiant {id:"E027"}),(b:Etudiant {id:"E028"}) MERGE (a)-[:CONNAIT {depuis:2022, contexte:"cours"}]->(b);
MATCH (a:Etudiant {id:"E028"}),(b:Etudiant {id:"E029"}) MERGE (a)-[:CONNAIT {depuis:2023, contexte:"club"}]->(b);
MATCH (a:Etudiant {id:"E029"}),(b:Etudiant {id:"E030"}) MERGE (a)-[:CONNAIT {depuis:2022, contexte:"cours"}]->(b);
// Connexions intra-UMC
MATCH (a:Etudiant {id:"E031"}),(b:Etudiant {id:"E032"}) MERGE (a)-[:CONNAIT {depuis:2022, contexte:"cours"}]->(b);
MATCH (a:Etudiant {id:"E031"}),(b:Etudiant {id:"E034"}) MERGE (a)-[:CONNAIT {depuis:2023, contexte:"club"}]->(b);
MATCH (a:Etudiant {id:"E032"}),(b:Etudiant {id:"E033"}) MERGE (a)-[:CONNAIT {depuis:2022, contexte:"projet"}]->(b);
MATCH (a:Etudiant {id:"E033"}),(b:Etudiant {id:"E040"}) MERGE (a)-[:CONNAIT {depuis:2021, contexte:"cours"}]->(b);
MATCH (a:Etudiant {id:"E034"}),(b:Etudiant {id:"E035"}) MERGE (a)-[:CONNAIT {depuis:2023, contexte:"club"}]->(b);
MATCH (a:Etudiant {id:"E035"}),(b:Etudiant {id:"E036"}) MERGE (a)-[:CONNAIT {depuis:2022, contexte:"cours"}]->(b);
MATCH (a:Etudiant {id:"E036"}),(b:Etudiant {id:"E037"}) MERGE (a)-[:CONNAIT {depuis:2023, contexte:"projet"}]->(b);
MATCH (a:Etudiant {id:"E037"}),(b:Etudiant {id:"E038"}) MERGE (a)-[:CONNAIT {depuis:2022, contexte:"cours"}]->(b);
MATCH (a:Etudiant {id:"E038"}),(b:Etudiant {id:"E039"}) MERGE (a)-[:CONNAIT {depuis:2023, contexte:"club"}]->(b);
MATCH (a:Etudiant {id:"E039"}),(b:Etudiant {id:"E040"}) MERGE (a)-[:CONNAIT {depuis:2022, contexte:"cours"}]->(b);
// Connexions intra-UBMA
MATCH (a:Etudiant {id:"E041"}),(b:Etudiant {id:"E042"}) MERGE (a)-[:CONNAIT {depuis:2022, contexte:"cours"}]->(b);
MATCH (a:Etudiant {id:"E041"}),(b:Etudiant {id:"E044"}) MERGE (a)-[:CONNAIT {depuis:2023, contexte:"club"}]->(b);
MATCH (a:Etudiant {id:"E042"}),(b:Etudiant {id:"E043"}) MERGE (a)-[:CONNAIT {depuis:2022, contexte:"projet"}]->(b);
MATCH (a:Etudiant {id:"E043"}),(b:Etudiant {id:"E048"}) MERGE (a)-[:CONNAIT {depuis:2021, contexte:"cours"}]->(b);
MATCH (a:Etudiant {id:"E044"}),(b:Etudiant {id:"E045"}) MERGE (a)-[:CONNAIT {depuis:2023, contexte:"club"}]->(b);
MATCH (a:Etudiant {id:"E045"}),(b:Etudiant {id:"E046"}) MERGE (a)-[:CONNAIT {depuis:2022, contexte:"cours"}]->(b);
MATCH (a:Etudiant {id:"E046"}),(b:Etudiant {id:"E047"}) MERGE (a)-[:CONNAIT {depuis:2023, contexte:"projet"}]->(b);
MATCH (a:Etudiant {id:"E047"}),(b:Etudiant {id:"E048"}) MERGE (a)-[:CONNAIT {depuis:2022, contexte:"cours"}]->(b);
MATCH (a:Etudiant {id:"E048"}),(b:Etudiant {id:"E049"}) MERGE (a)-[:CONNAIT {depuis:2023, contexte:"club"}]->(b);
MATCH (a:Etudiant {id:"E049"}),(b:Etudiant {id:"E050"}) MERGE (a)-[:CONNAIT {depuis:2022, contexte:"cours"}]->(b);
// ── Connexions INTER-universités (assurer la connexité globale du graphe) ──────
MATCH (a:Etudiant {id:"E005"}),(b:Etudiant {id:"E015"}) MERGE (a)-[:CONNAIT {depuis:2022, contexte:"hackathon"}]->(b);
MATCH (a:Etudiant {id:"E010"}),(b:Etudiant {id:"E020"}) MERGE (a)-[:CONNAIT {depuis:2022, contexte:"conference"}]->(b);
MATCH (a:Etudiant {id:"E015"}),(b:Etudiant {id:"E023"}) MERGE (a)-[:CONNAIT {depuis:2021, contexte:"hackathon"}]->(b);
MATCH (a:Etudiant {id:"E020"}),(b:Etudiant {id:"E031"}) MERGE (a)-[:CONNAIT {depuis:2023, contexte:"online"}]->(b);
MATCH (a:Etudiant {id:"E023"}),(b:Etudiant {id:"E043"}) MERGE (a)-[:CONNAIT {depuis:2022, contexte:"conference"}]->(b);
MATCH (a:Etudiant {id:"E030"}),(b:Etudiant {id:"E040"}) MERGE (a)-[:CONNAIT {depuis:2023, contexte:"hackathon"}]->(b);
MATCH (a:Etudiant {id:"E040"}),(b:Etudiant {id:"E050"}) MERGE (a)-[:CONNAIT {depuis:2022, contexte:"online"}]->(b);
MATCH (a:Etudiant {id:"E003"}),(b:Etudiant {id:"E032"}) MERGE (a)-[:CONNAIT {depuis:2023, contexte:"stage"}]->(b);
MATCH (a:Etudiant {id:"E008"}),(b:Etudiant {id:"E011"}) MERGE (a)-[:CONNAIT {depuis:2022, contexte:"cours"}]->(b);
MATCH (a:Etudiant {id:"E038"}),(b:Etudiant {id:"E048"}) MERGE (a)-[:CONNAIT {depuis:2023, contexte:"hackathon"}]->(b);
// Ahmed ↔ Yasmina (via intermédiaires : garantit un chemin pour 3.1)
MATCH (a:Etudiant {id:"E003"}),(b:Etudiant {id:"E015"}) MERGE (a)-[:CONNAIT {depuis:2022, contexte:"conference"}]->(b);

// ─── 1.8 : Relations SUIT (étudiant → cours) avec notes ──────────────────────
UNWIND [
  // USTHB
  {eid:"E001", ccode:"INFO401", sem:"S5", note:15.5},
  {eid:"E001", ccode:"INFO402", sem:"S5", note:14.0},
  {eid:"E001", ccode:"INFO403", sem:"S5", note:16.0},
  {eid:"E002", ccode:"INFO401", sem:"S5", note:17.0},
  {eid:"E002", ccode:"INFO402", sem:"S5", note:13.5},
  {eid:"E003", ccode:"INFO402", sem:"S7", note:18.0},
  {eid:"E003", ccode:"INFO404", sem:"S7", note:16.5},
  {eid:"E004", ccode:"MATH301", sem:"S3", note:15.0},
  {eid:"E004", ccode:"MATH302", sem:"S3", note:14.0},
  {eid:"E005", ccode:"INFO401", sem:"S9", note:17.5},
  {eid:"E005", ccode:"INFO404", sem:"S9", note:16.0},
  {eid:"E006", ccode:"INFO401", sem:"S5", note:12.0},
  {eid:"E006", ccode:"INFO403", sem:"S5", note:14.5},
  {eid:"E007", ccode:"INFO403", sem:"S3", note:15.0},
  {eid:"E008", ccode:"INFO402", sem:"S7", note:16.0},
  {eid:"E008", ccode:"INFO404", sem:"S7", note:15.5},
  {eid:"E009", ccode:"MATH301", sem:"S5", note:18.5},
  {eid:"E010", ccode:"INFO401", sem:"S9", note:16.5},
  {eid:"E010", ccode:"INFO407", sem:"S9", note:17.0},
  // UMBB
  {eid:"E011", ccode:"INFO401", sem:"S5", note:14.0},
  {eid:"E011", ccode:"INFO406", sem:"S5", note:16.0},
  {eid:"E012", ccode:"ELEC301", sem:"S7", note:15.5},
  {eid:"E013", ccode:"INFO404", sem:"S5", note:13.5},
  {eid:"E014", ccode:"INFO401", sem:"S3", note:12.5},
  {eid:"E015", ccode:"INFO402", sem:"S9", note:17.5},
  {eid:"E015", ccode:"INFO407", sem:"S9", note:18.0},
  {eid:"E016", ccode:"INFO401", sem:"S5", note:14.5},
  {eid:"E017", ccode:"MATH302", sem:"S7", note:16.0},
  {eid:"E018", ccode:"ELEC301", sem:"S5", note:14.0},
  {eid:"E019", ccode:"INFO404", sem:"S3", note:13.0},
  {eid:"E020", ccode:"INFO406", sem:"S9", note:15.5},
  // USTO
  {eid:"E021", ccode:"INFO403", sem:"S5", note:14.0},
  {eid:"E022", ccode:"ELEC301", sem:"S7", note:16.0},
  {eid:"E023", ccode:"INFO402", sem:"S9", note:17.0},
  {eid:"E024", ccode:"INFO401", sem:"S5", note:13.5},
  {eid:"E025", ccode:"MATH302", sem:"S3", note:15.5},
  {eid:"E026", ccode:"INFO404", sem:"S7", note:14.5},
  {eid:"E027", ccode:"INFO403", sem:"S5", note:15.0},
  {eid:"E028", ccode:"ELEC301", sem:"S9", note:16.5},
  {eid:"E029", ccode:"INFO401", sem:"S3", note:12.0},
  {eid:"E030", ccode:"INFO405", sem:"S7", note:14.0},
  // UMC
  {eid:"E031", ccode:"INFO401", sem:"S5", note:15.0},
  {eid:"E032", ccode:"INFO402", sem:"S7", note:16.5},
  {eid:"E033", ccode:"MATH302", sem:"S9", note:17.0},
  {eid:"E034", ccode:"INFO401", sem:"S5", note:13.0},
  {eid:"E035", ccode:"INFO404", sem:"S3", note:14.5},
  {eid:"E036", ccode:"ELEC301", sem:"S7", note:15.5},
  {eid:"E037", ccode:"INFO401", sem:"S5", note:14.0},
  {eid:"E038", ccode:"INFO402", sem:"S9", note:16.0},
  {eid:"E039", ccode:"INFO401", sem:"S3", note:12.5},
  {eid:"E040", ccode:"MATH301", sem:"S7", note:17.5},
  // UBMA
  {eid:"E041", ccode:"INFO401", sem:"S5", note:14.0},
  {eid:"E042", ccode:"INFO403", sem:"S7", note:15.5},
  {eid:"E043", ccode:"INFO406", sem:"S9", note:16.0},
  {eid:"E044", ccode:"ELEC301", sem:"S3", note:13.5},
  {eid:"E045", ccode:"MATH302", sem:"S5", note:16.5},
  {eid:"E046", ccode:"INFO401", sem:"S7", note:15.0},
  {eid:"E047", ccode:"INFO404", sem:"S5", note:14.5},
  {eid:"E048", ccode:"INFO402", sem:"S9", note:17.0},
  {eid:"E049", ccode:"INFO401", sem:"S3", note:12.0},
  {eid:"E050", ccode:"INFO405", sem:"S7", note:14.5}
] AS s
MATCH (e:Etudiant {id: s.eid}), (c:Cours {code: s.ccode})
MERGE (e)-[:SUIT {semestre: s.sem, note: s.note}]->(c);

// ─── 1.9 : Relations MAITRISE (étudiant → compétence) ─────────────────────────
UNWIND [
  {eid:"E001", cnom:"Python",           niveau:"avancé"},
  {eid:"E001", cnom:"SQL",              niveau:"intermédiaire"},
  {eid:"E001", cnom:"Machine Learning", niveau:"débutant"},
  {eid:"E002", cnom:"SQL",              niveau:"avancé"},
  {eid:"E002", cnom:"NoSQL",            niveau:"intermédiaire"},
  {eid:"E002", cnom:"Python",           niveau:"intermédiaire"},
  {eid:"E003", cnom:"Machine Learning", niveau:"avancé"},
  {eid:"E003", cnom:"Deep Learning",    niveau:"intermédiaire"},
  {eid:"E003", cnom:"Python",           niveau:"avancé"},
  {eid:"E004", cnom:"SQL",              niveau:"débutant"},
  {eid:"E005", cnom:"Python",           niveau:"avancé"},
  {eid:"E005", cnom:"SQL",              niveau:"avancé"},
  {eid:"E005", cnom:"NoSQL",            niveau:"avancé"},
  {eid:"E006", cnom:"SQL",              niveau:"intermédiaire"},
  {eid:"E007", cnom:"React",            niveau:"intermédiaire"},
  {eid:"E007", cnom:"Node.js",          niveau:"débutant"},
  {eid:"E008", cnom:"Docker",           niveau:"intermédiaire"},
  {eid:"E008", cnom:"Linux",            niveau:"avancé"},
  {eid:"E010", cnom:"Python",           niveau:"avancé"},
  {eid:"E010", cnom:"Deep Learning",    niveau:"avancé"},
  {eid:"E011", cnom:"Cybersécurité",    niveau:"intermédiaire"},
  {eid:"E011", cnom:"Linux",            niveau:"avancé"},
  {eid:"E012", cnom:"Réseaux",          niveau:"avancé"},
  {eid:"E013", cnom:"Réseaux",          niveau:"intermédiaire"},
  {eid:"E015", cnom:"Machine Learning", niveau:"avancé"},
  {eid:"E015", cnom:"Deep Learning",    niveau:"avancé"},
  {eid:"E015", cnom:"Python",           niveau:"avancé"},
  {eid:"E017", cnom:"Data Science",     niveau:"intermédiaire"},
  {eid:"E020", cnom:"Cybersécurité",    niveau:"avancé"},
  {eid:"E021", cnom:"React",            niveau:"avancé"},
  {eid:"E021", cnom:"Node.js",          niveau:"intermédiaire"},
  {eid:"E023", cnom:"Machine Learning", niveau:"avancé"},
  {eid:"E023", cnom:"Python",           niveau:"avancé"},
  {eid:"E025", cnom:"Data Science",     niveau:"intermédiaire"},
  {eid:"E027", cnom:"React",            niveau:"intermédiaire"},
  {eid:"E030", cnom:"Docker",           niveau:"avancé"},
  {eid:"E032", cnom:"Machine Learning", niveau:"intermédiaire"},
  {eid:"E033", cnom:"Data Science",     niveau:"avancé"},
  {eid:"E038", cnom:"Python",           niveau:"avancé"},
  {eid:"E040", cnom:"SQL",              niveau:"avancé"},
  {eid:"E041", cnom:"Python",           niveau:"intermédiaire"},
  {eid:"E043", cnom:"Cybersécurité",    niveau:"avancé"},
  {eid:"E045", cnom:"Data Science",     niveau:"intermédiaire"},
  {eid:"E048", cnom:"Machine Learning", niveau:"avancé"},
  {eid:"E048", cnom:"Deep Learning",    niveau:"intermédiaire"},
  {eid:"E050", cnom:"Docker",           niveau:"intermédiaire"}
] AS m
MATCH (e:Etudiant {id: m.eid}), (c:Competence {nom: m.cnom})
MERGE (e)-[:MAITRISE {niveau: m.niveau}]->(c);

// ─── 1.10 : Relations MEMBRE_DE (étudiant → club) ─────────────────────────────
UNWIND [
  {eid:"E001", cnom:"Club IA USTHB",       role:"membre"},
  {eid:"E003", cnom:"Club IA USTHB",       role:"président"},
  {eid:"E006", cnom:"Club Dev USTHB",      role:"membre"},
  {eid:"E007", cnom:"Club Dev USTHB",      role:"membre"},
  {eid:"E008", cnom:"Club Dev USTHB",      role:"vice-président"},
  {eid:"E010", cnom:"Club IA USTHB",       role:"membre"},
  {eid:"E011", cnom:"Club Cyber UMBB",     role:"président"},
  {eid:"E013", cnom:"Club IoT UMBB",       role:"membre"},
  {eid:"E016", cnom:"Club Cyber UMBB",     role:"membre"},
  {eid:"E020", cnom:"Club Cyber UMBB",     role:"vice-président"},
  {eid:"E021", cnom:"Club Web UBMA",       role:"membre"},
  {eid:"E023", cnom:"Club IA USTHB",       role:"membre"},
  {eid:"E024", cnom:"Club Robotique USTO", role:"président"},
  {eid:"E026", cnom:"Club Robotique USTO", role:"membre"},
  {eid:"E027", cnom:"Club Web UBMA",       role:"membre"},
  {eid:"E031", cnom:"Club Data UMC",       role:"membre"},
  {eid:"E033", cnom:"Club Data UMC",       role:"vice-président"},
  {eid:"E037", cnom:"Club Data UMC",       role:"membre"},
  {eid:"E041", cnom:"Club Web UBMA",       role:"vice-président"},
  {eid:"E043", cnom:"Club Cyber UMBB",     role:"membre"},
  {eid:"E045", cnom:"Club Math USTHB",     role:"membre"},
  {eid:"E048", cnom:"Club IA USTHB",       role:"membre"},
  {eid:"E050", cnom:"Club Robotique USTO", role:"membre"}
] AS m
MATCH (e:Etudiant {id: m.eid}), (c:Club {nom: m.cnom})
MERGE (e)-[:MEMBRE_DE {role: m.role}]->(c);

// ─── 1.11 : Relations A_STAGE_CHEZ ────────────────────────────────────────────
UNWIND [
  {eid:"E005", enom:"Sonatrach",   annee:2024, duree:3},
  {eid:"E010", enom:"IBM DZ",      annee:2024, duree:6},
  {eid:"E015", enom:"Djezzy",      annee:2023, duree:4},
  {eid:"E020", enom:"Ericsson DZ", annee:2024, duree:3},
  {eid:"E023", enom:"Djezzy",      annee:2024, duree:6},
  {eid:"E030", enom:"Ooredoo",     annee:2023, duree:3},
  {eid:"E033", enom:"CIB",         annee:2024, duree:3},
  {eid:"E038", enom:"Sonatrach",   annee:2023, duree:6},
  {eid:"E043", enom:"Ericsson DZ", annee:2024, duree:3},
  {eid:"E048", enom:"IBM DZ",      annee:2024, duree:6}
] AS s
MATCH (e:Etudiant {id: s.eid}), (ent:Entreprise {nom: s.enom})
MERGE (e)-[:A_STAGE_CHEZ {annee: s.annee, duree_mois: s.duree}]->(ent);

// ─── 1.12 : Vérification finale ───────────────────────────────────────────────
MATCH (n) RETURN labels(n)[0] AS type, count(n) AS total ORDER BY total DESC;
MATCH ()-[r]->() RETURN type(r) AS relation, count(r) AS total ORDER BY total DESC;
