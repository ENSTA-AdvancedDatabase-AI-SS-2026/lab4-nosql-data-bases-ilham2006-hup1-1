// TP4 - Exercice 3 : Algorithmes de Graphe avec GDS
// Prérequis : Plugin Graph Data Science installé (inclus dans docker-compose)

// ─── 3.0 : Nettoyage des projections précédentes ──────────────────────────────
CALL gds.graph.exists('reseau_social') YIELD exists
WITH exists WHERE exists = true
CALL gds.graph.drop('reseau_social') YIELD graphName
RETURN graphName + ' supprimé' AS info;

// ─── 3.1 : Plus court chemin ──────────────────────────────────────────────────
// "Comment Ahmed peut-il rencontrer Yasmina ?"
// CONNAIT est non-orienté ici (*) pour simuler une relation sociale bidirectionnelle
MATCH p = shortestPath(
  (a:Etudiant {prenom: "Ahmed"})-[:CONNAIT*..10]-(b:Etudiant {prenom: "Yasmina"})
)
RETURN
  [n IN nodes(p) | n.prenom + " (" + n.universite + ")"] AS chemin,
  length(p) AS nb_intermediaires
ORDER BY nb_intermediaires ASC
LIMIT 1;

// ─── 3.2 : Projection du graphe en mémoire ────────────────────────────────────
// On projette un graphe NON-ORIENTÉ à partir de la relation CONNAIT
CALL gds.graph.project(
  'reseau_social',          // Nom de la projection
  'Etudiant',               // Nœuds : tous les étudiants
  {
    CONNAIT: {              // Relation projetée
      orientation: 'UNDIRECTED'  // Non-orienté (la relation est sociale)
    }
  }
);

// ─── 3.2 : Centralité de degré ────────────────────────────────────────────────
// Top 10 des étudiants les plus connectés dans le réseau
CALL gds.degree.stream('reseau_social')
YIELD nodeId, score
WITH gds.util.asNode(nodeId) AS etudiant, score
RETURN
  etudiant.prenom    AS prenom,
  etudiant.nom       AS nom,
  etudiant.universite AS universite,
  etudiant.filiere   AS filiere,
  score              AS nb_connexions
ORDER BY score DESC
LIMIT 10;

// ─── 3.2 BIS : Centralité de vecteur propre (PageRank) ────────────────────────
// Variante : qui est le plus « influent » (bien connecté à des gens bien connectés) ?
CALL gds.pageRank.stream('reseau_social', {
  maxIterations: 20,
  dampingFactor: 0.85
})
YIELD nodeId, score
WITH gds.util.asNode(nodeId) AS etudiant, score
RETURN
  etudiant.prenom    AS prenom,
  etudiant.universite AS universite,
  round(score * 1000) / 1000 AS pagerank_score
ORDER BY pagerank_score DESC
LIMIT 10;

// ─── 3.3 : Détection de communautés (Louvain) ────────────────────────────────
// Identifier les "cercles sociaux" naturels dans le réseau
CALL gds.louvain.stream('reseau_social')
YIELD nodeId, communityId
WITH communityId,
     collect(gds.util.asNode(nodeId).prenom)     AS prenoms,
     collect(gds.util.asNode(nodeId).universite)  AS universites
WITH communityId,
     size(prenoms) AS taille,
     prenoms[0..5] AS exemple_membres,
     // Université dominante dans la communauté
     [u IN universites | u][0] AS exemple_universite
RETURN
  communityId                AS id_communaute,
  taille                     AS nb_membres,
  exemple_membres            AS quelques_membres,
  exemple_universite         AS universite_représentée
ORDER BY taille DESC;

// ─── 3.3 BIS : Écriture des labels de communauté dans le graphe ───────────────
// Utile pour visualiser les communautés dans Neo4j Browser
CALL gds.louvain.write('reseau_social', {
  writeProperty: 'communaute_id'
})
YIELD communityCount, modularity, modularities
RETURN
  communityCount AS nb_communautes_detectees,
  round(modularity * 1000) / 1000 AS qualite_modularity;

// Vérification : distribution des communautés
MATCH (e:Etudiant)
RETURN e.communaute_id AS communaute,
       count(e)         AS taille,
       collect(e.prenom)[0..4] AS exemples,
       collect(DISTINCT e.universite) AS universites_presentes
ORDER BY taille DESC;

// ─── 3.4 : Recommandation de contacts ────────────────────────────────────────
// "Qui Ahmed devrait-il connaître ?"
// Score = nb_amis_communs * 3 + nb_cours_communs * 2 + (meme_filiere ? 1 : 0)
MATCH (moi:Etudiant {prenom: "Ahmed"})
// Candidats : pas encore amis avec Ahmed, et pas Ahmed lui-même
MATCH (suggestion:Etudiant)
WHERE suggestion <> moi
  AND NOT (moi)-[:CONNAIT]-(suggestion)

// Amis en commun
OPTIONAL MATCH (moi)-[:CONNAIT]-(ami_commun:Etudiant)-[:CONNAIT]-(suggestion)
WITH moi, suggestion, count(DISTINCT ami_commun) AS nb_amis_communs

// Cours en commun
OPTIONAL MATCH (moi)-[:SUIT]->(cours:Cours)<-[:SUIT]-(suggestion)
WITH moi, suggestion, nb_amis_communs, count(DISTINCT cours) AS nb_cours_communs

// Bonus même filière
WITH moi, suggestion, nb_amis_communs, nb_cours_communs,
     CASE WHEN moi.filiere = suggestion.filiere THEN 1 ELSE 0 END AS bonus_filiere

// Calcul du score final
WITH suggestion,
     nb_amis_communs,
     nb_cours_communs,
     bonus_filiere,
     (nb_amis_communs * 3) + (nb_cours_communs * 2) + bonus_filiere AS score

// On ne garde que les suggestions avec un score > 0
WHERE score > 0
RETURN
  suggestion.prenom     AS prenom,
  suggestion.nom        AS nom,
  suggestion.universite AS universite,
  suggestion.filiere    AS filiere,
  nb_amis_communs       AS amis_en_commun,
  nb_cours_communs      AS cours_en_commun,
  bonus_filiere         AS meme_filiere,
  score                 AS score_recommandation
ORDER BY score DESC
LIMIT 5;

// ─── 3.5 : Chemin de compétences ─────────────────────────────────────────────
// "Quels cours mènent à Machine Learning ?"
// Via la chaîne COURS → REQUIERT → COMPÉTENCE
MATCH path = (debut:Cours)-[:REQUIERT*1..3]->(but:Competence {nom: "Machine Learning"})
RETURN
  [n IN nodes(path) |
    CASE WHEN n:Cours      THEN "📘 " + n.intitule
         WHEN n:Competence THEN "⚡ " + n.nom
         ELSE n.nom
    END
  ] AS parcours_apprentissage,
  length(path) AS nb_etapes
ORDER BY nb_etapes ASC;

// ─── 3.5 BIS : Étudiants qui ont déjà les prérequis pour Machine Learning ─────
// "Qui est prêt à suivre INFO402 ?"
MATCH (c:Cours {code: "INFO402"})-[:REQUIERT]->(req:Competence)
WITH collect(req.nom) AS competences_requises, c

MATCH (e:Etudiant)-[:MAITRISE]->(comp:Competence)
WHERE comp.nom IN competences_requises
WITH e, c, collect(comp.nom) AS competences_maitrisees, competences_requises
WHERE size(competences_maitrisees) = size(competences_requises)
  AND NOT (e)-[:SUIT]->(c)
RETURN
  e.prenom     AS etudiant,
  e.universite AS universite,
  competences_maitrisees AS competences_ok,
  c.intitule   AS cours_accessible
ORDER BY etudiant;

// ─── Nettoyage de la projection GDS ──────────────────────────────────────────
CALL gds.graph.drop('reseau_social')
YIELD graphName
RETURN graphName + ' supprimé' AS info;
