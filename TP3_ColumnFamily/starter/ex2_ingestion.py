"""
TP3 - Exercice 2 : Ingestion de données IoT
Use Case : SmartGrid DZ - 10 000 capteurs, 5 minutes de mesures
"""

from cassandra.cluster import Cluster
from cassandra.query import BatchStatement, BatchType
import uuid
import random
from datetime import datetime, timedelta
import time

# Configuration
CASSANDRA_HOST = 'localhost'
KEYSPACE = 'smartgrid'
NB_CAPTEURS = 10000
MINUTES_HISTORIQUE = 5

WILAYAS = ["Alger", "Oran", "Constantine", "Annaba", "Blida"]

COMMUNES = {
    "Alger": ["Bab Ezzouar", "Hydra", "El Harrach", "Dar El Beida"],
    "Oran": ["Bir El Djir", "Es Senia", "Arzew"],
    "Constantine": ["El Khroub", "Ain Smara", "Hamma Bouziane"],
    "Annaba": ["El Bouni", "El Hadjar", "Seraidi"],
    "Blida": ["Bougara", "Boufarik", "Larbaa"],
}


def connect():
    """Connexion au cluster Cassandra"""
    cluster = Cluster([CASSANDRA_HOST])
    session = cluster.connect(KEYSPACE)
    return session, cluster


def generate_mesure(capteur_id, wilaya, commune, timestamp):
    """Générer une mesure réaliste"""

    tension = round(220 + random.gauss(0, 5), 2)

    alerte = tension < 200 or tension > 240 or random.random() < 0.05

    code_alerte = None

    if tension < 200:
        code_alerte = "SOUS_TENSION"

    elif tension > 240:
        code_alerte = "SUR_TENSION"

    elif alerte:
        code_alerte = "ANOMALIE"

    return {
        "capteur_id": capteur_id,
        "date_jour": timestamp.date(),
        "timestamp": timestamp,
        "wilaya": wilaya,
        "commune": commune,
        "tension_v": tension,
        "courant_a": round(random.uniform(0.5, 15.0), 2),
        "puissance_kw": round(random.uniform(0.1, 3.3), 3),
        "frequence_hz": round(50 + random.gauss(0, 0.1), 2),
        "temperature": round(random.uniform(20, 65), 1),
        "alerte": alerte,
        "code_alerte": code_alerte
    }


def prepare_statements(session):
    """Préparer les requêtes"""

    mesure_stmt = session.prepare("""
        INSERT INTO mesures_par_capteur (
            capteur_id,
            date_jour,
            timestamp,
            wilaya,
            commune,
            tension_v,
            courant_a,
            puissance_kw,
            frequence_hz,
            temperature,
            alerte,
            code_alerte
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        USING TTL 7776000
    """)

    alerte_stmt = session.prepare("""
        INSERT INTO alertes_par_wilaya (
            wilaya,
            date_jour,
            timestamp,
            capteur_id,
            code_alerte,
            description,
            gravite,
            resolue
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        USING TTL 31536000
    """)

    return mesure_stmt, alerte_stmt


def insert_single(session, prepared_stmt, mesure):
    """
    Insérer une seule mesure
    """

    session.execute(prepared_stmt, (
        mesure["capteur_id"],
        mesure["date_jour"],
        mesure["timestamp"],
        mesure["wilaya"],
        mesure["commune"],
        mesure["tension_v"],
        mesure["courant_a"],
        mesure["puissance_kw"],
        mesure["frequence_hz"],
        mesure["temperature"],
        mesure["alerte"],
        mesure["code_alerte"]
    ))


def insert_batch(session, mesure_stmt, alerte_stmt, mesures):
    """
    Insérer un batch efficacement
    """

    batch = BatchStatement(batch_type=BatchType.UNLOGGED)

    for mesure in mesures:

        batch.add(mesure_stmt, (
            mesure["capteur_id"],
            mesure["date_jour"],
            mesure["timestamp"],
            mesure["wilaya"],
            mesure["commune"],
            mesure["tension_v"],
            mesure["courant_a"],
            mesure["puissance_kw"],
            mesure["frequence_hz"],
            mesure["temperature"],
            mesure["alerte"],
            mesure["code_alerte"]
        ))

        # Insertion des alertes
        if mesure["alerte"]:

            gravite = 2

            if mesure["tension_v"] < 200 or mesure["tension_v"] > 240:
                gravite = 3

            batch.add(alerte_stmt, (
                mesure["wilaya"],
                mesure["date_jour"],
                mesure["timestamp"],
                mesure["capteur_id"],
                mesure["code_alerte"],
                "Anomalie détectée sur le réseau",
                gravite,
                False
            ))

    session.execute(batch)


def run_ingestion(session):
    """
    Générer et insérer les données
    """

    print(f"Démarrage ingestion : {NB_CAPTEURS} capteurs × {MINUTES_HISTORIQUE} min")

    start = time.time()

    mesure_stmt, alerte_stmt = prepare_statements(session)

    # Génération des capteurs
    capteurs = []

    for _ in range(NB_CAPTEURS):

        wilaya = random.choice(WILAYAS)
        commune = random.choice(COMMUNES[wilaya])

        capteurs.append({
            "id": uuid.uuid4(),
            "wilaya": wilaya,
            "commune": commune
        })

    now = datetime.now()

    total_inserted = 0

    for minute in range(MINUTES_HISTORIQUE):

        current_time = now - timedelta(minutes=minute)

        batch_mesures = []

        for capteur in capteurs:

            mesure = generate_mesure(
                capteur["id"],
                capteur["wilaya"],
                capteur["commune"],
                current_time
            )

            batch_mesures.append(mesure)

            # Bonne pratique Cassandra :
            # batch max 50 lignes
            if len(batch_mesures) == 50:

                insert_batch(
                    session,
                    mesure_stmt,
                    alerte_stmt,
                    batch_mesures
                )

                total_inserted += len(batch_mesures)

                batch_mesures = []

        # Dernier batch
        if batch_mesures:

            insert_batch(
                session,
                mesure_stmt,
                alerte_stmt,
                batch_mesures
            )

            total_inserted += len(batch_mesures)

    elapsed = time.time() - start

    print(f"\n✅ {total_inserted:,} mesures insérées en {elapsed:.1f}s")

    print(f"🚀 Débit : {total_inserted/elapsed:,.0f} mesures/seconde")


if __name__ == "__main__":

    session, cluster = connect()

    try:
        run_ingestion(session)

    finally:
        cluster.shutdown()
