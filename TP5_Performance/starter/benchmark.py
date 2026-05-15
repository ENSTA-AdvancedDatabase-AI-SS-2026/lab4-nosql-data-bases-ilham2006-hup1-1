"""
TP5 - Benchmark Comparatif NoSQL
Mesurer les performances de Redis, MongoDB, Cassandra, Neo4j
"""
import time
import statistics
import json
from typing import Callable, List, Tuple
import threading

import redis
from pymongo import MongoClient
from cassandra.cluster import Cluster
from neo4j import GraphDatabase


# ─── Utilitaires de mesure ────────────────────────────────────────────────────

def measure_latency(fn: Callable, iterations: int = 1000) -> dict:
    latencies = []

    for _ in range(iterations):
        start = time.perf_counter()
        fn()
        latencies.append((time.perf_counter() - start) * 1000)

    latencies.sort()

    return {
        "mean_ms": statistics.mean(latencies),
        "p50_ms": latencies[int(0.50 * len(latencies))],
        "p95_ms": latencies[int(0.95 * len(latencies))],
        "p99_ms": latencies[int(0.99 * len(latencies))],
        "max_ms": max(latencies),
        "throughput_rps": 1000 / statistics.mean(latencies)
    }


def print_results(name: str, results: dict):
    print(f"\n{'='*50}")
    print(f" {name}")
    print(f"{'='*50}")
    for k, v in results.items():
        print(f"  {k:20s}: {v:.2f}")


# ─── Ex1 : Benchmark Écriture ─────────────────────────────────────────────────

def benchmark_write_redis(n: int = 100_000):
    r = redis.Redis(host='localhost', port=6379, decode_responses=True)
    r.flushdb()

    pipe = r.pipeline()

    start = time.perf_counter()

    for i in range(n):
        pipe.set(f"user:{i}", json.dumps({
            "id": i,
            "name": f"user{i}",
            "score": i % 100
        }))

        if i % 1000 == 0:
            pipe.execute()

    pipe.execute()

    duration = time.perf_counter() - start
    print_results("Redis WRITE", {
        "total_time_s": duration,
        "ops_per_sec": n / duration
    })


def benchmark_write_mongodb(n: int = 100_000):
    client = MongoClient("mongodb://admin:admin123@localhost:27017/")
    db = client["benchmark"]
    col = db["users"]
    col.drop()

    start = time.perf_counter()

    batch = []
    for i in range(n):
        batch.append({
            "id": i,
            "name": f"user{i}",
            "score": i % 100
        })

        if len(batch) == 1000:
            col.insert_many(batch)
            batch = []

    if batch:
        col.insert_many(batch)

    duration = time.perf_counter() - start
    print_results("MongoDB WRITE", {
        "total_time_s": duration,
        "ops_per_sec": n / duration
    })


def benchmark_write_cassandra(n: int = 100_000):
    cluster = Cluster(["127.0.0.1"])
    session = cluster.connect()

    session.execute("""
        CREATE KEYSPACE IF NOT EXISTS benchmark
        WITH replication = {'class': 'SimpleStrategy', 'replication_factor': 1}
    """)

    session.set_keyspace("benchmark")

    session.execute("""
        CREATE TABLE IF NOT EXISTS users (
            id int PRIMARY KEY,
            name text,
            score int
        )
    """)

    start = time.perf_counter()

    for i in range(n):
        session.execute("""
            INSERT INTO users (id, name, score)
            VALUES (%s, %s, %s)
        """, (i, f"user{i}", i % 100))

    duration = time.perf_counter() - start

    print_results("Cassandra WRITE", {
        "total_time_s": duration,
        "ops_per_sec": n / duration
    })


# ─── Ex2 : Benchmark Lecture ─────────────────────────────────────────────────

def benchmark_read_redis():
    r = redis.Redis(host='localhost', port=6379, decode_responses=True)

    def point_lookup():
        r.get("user:1")

    def range_query():
        r.keys("user:*")

    def complex_query():
        pipe = r.pipeline()
        for i in range(100):
            pipe.get(f"user:{i}")
        pipe.execute()

    print_results("Redis READ", measure_latency(point_lookup, 1000))
    print_results("Redis RANGE", measure_latency(range_query, 100))
    print_results("Redis COMPLEX", measure_latency(complex_query, 500))


def benchmark_read_mongodb():
    client = MongoClient("mongodb://admin:admin123@localhost:27017/")
    db = client["benchmark"]
    col = db["users"]

    def point_lookup():
        col.find_one({"id": 1})

    def range_query():
        list(col.find({"id": {"$lt": 1000}}))

    def aggregate():
        list(col.aggregate([
            {"$match": {"id": {"$lt": 1000}}},
            {"$group": {"_id": "$score", "count": {"$sum": 1}}}
        ]))

    print_results("MongoDB POINT", measure_latency(point_lookup, 1000))
    print_results("MongoDB RANGE", measure_latency(range_query, 100))
    print_results("MongoDB AGG", measure_latency(aggregate, 100))


# ─── Ex3 : Charge concurrente ─────────────────────────────────────────────────

def benchmark_concurrent(db_fn: Callable, n_clients: int = 50, requests_per_client: int = 200):
    latencies = []
    lock = threading.Lock()

    def worker():
        local_lat = []
        for _ in range(requests_per_client):
            start = time.perf_counter()
            db_fn()
            local_lat.append((time.perf_counter() - start) * 1000)

        with lock:
            latencies.extend(local_lat)

    threads = []

    start = time.perf_counter()

    for _ in range(n_clients):
        t = threading.Thread(target=worker)
        threads.append(t)
        t.start()

    for t in threads:
        t.join()

    total_time = time.perf_counter() - start

    latencies.sort()

    print_results("CONCURRENT LOAD", {
        "total_requests": len(latencies),
        "total_time_s": total_time,
        "mean_ms": statistics.mean(latencies),
        "p95_ms": latencies[int(0.95 * len(latencies))],
        "throughput_rps": len(latencies) / total_time
    })


# ─── Main ─────────────────────────────────────────────────────────────────────

if __name__ == "__main__":
    print("🚀 Benchmark NoSQL - Comparatif des 4 technologies")
    print("=" * 60)

    N = 10_000

    print("\n📝 Benchmark Écriture")
    benchmark_write_redis(N)
    benchmark_write_mongodb(N)
    benchmark_write_cassandra(N)

    print("\n📖 Benchmark Lecture")
    benchmark_read_redis()
    benchmark_read_mongodb()

    print("\n⚡ Test Charge Concurrente")

    r = redis.Redis()

    benchmark_concurrent(lambda: r.get("user:1"))
