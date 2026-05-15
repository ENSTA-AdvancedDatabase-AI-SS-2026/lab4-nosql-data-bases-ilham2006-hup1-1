
**Nodes (labels) and their properties:**

- `:Etudiant` – id, prenom, nom, universite, filiere, annee, ville
- `:Cours` – code, intitule, credits, departement
- `:Club` – nom, universite, domaine
- `:Entreprise` – nom, secteur, ville
- `:Competence` – nom, categorie

**Relations:**

- `[:CONNAIT]` – between students, with properties since and contexte
- `[:SUIT]` – student follows a course, with semestre and note
- `[:MEMBRE_DE]` – student is member of a club, with role
- `[:MAITRISE]` – student has a skill, with niveau
- `[:A_STAGE_CHEZ]` – student interned at a company, with annee and duree_mois
- `[:REQUIERT]` – course requires a skill

I used the Neo4j Browser to visualise the graph. The screenshot is not shown here, but my schema looks like the diagram above.

## 2. Community Detection Results (Louvain algorithm)

I ran the Louvain community detection algorithm using Neo4j GDS (Graph Data Science) library. My graph had 50 students from 5 different universities.

**Communities detected:**

- **Community 1 (size: 18 students)** – mostly students from USTHB and UMBB. They share many courses in Computer Science and are members of the same clubs (Club IA, Club Robotique). This is a "tech" community.

- **Community 2 (size: 12 students)** – students from USTO and UMC. They are in Business and Management fields. They follow courses like Marketing and Finance.

- **Community 3 (size: 10 students)** – students from UBMA. They are all in the same Electronics department. They know each other well and share skills like "Arduino" and "PCB Design".

- **Community 4 (size: 7 students)** – mixed universities. These students are not very connected to others. They are like "bridges" between communities.

- **Other (3 students)** – isolated or only connected through one friend.

**Why these communities make sense:** The algorithm grouped students by university and field of study. This matches real life: students from the same university and same major tend to form friend groups.

## 3. SQL vs Cypher Comparison

I chose a query: **"Find friends of friends of Ahmed who are not already his direct friends"** (recommendation of new contacts).

### SQL version (if using relational database)

We would have a table `Students` and a table `Friends` (many-to-many). The SQL query would be:

```sql
SELECT DISTINCT f2.friend_id
FROM Friends f1
JOIN Friends f2 ON f1.friend_id = f2.student_id
WHERE f1.student_id = 'Ahmed'
  AND f2.friend_id != 'Ahmed'
  AND f2.friend_id NOT IN (
    SELECT friend_id FROM Friends WHERE student_id = 'Ahmed'
  );
