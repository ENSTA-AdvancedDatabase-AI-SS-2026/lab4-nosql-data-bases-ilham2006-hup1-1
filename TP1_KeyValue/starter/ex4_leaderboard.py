 ## exo 4 
    
    """
TP1 - Exercice 4 : Classement des meilleures ventes
Use Case : Top produits ShopFast en temps réel
"""
import redis
from typing import Optional

r = redis.Redis(host='localhost', port=6379, decode_responses=True)

LEADERBOARD_KEY = "leaderboard:sales"


def record_sale(r, product_id, quantity: int = 1):
    """
    Enregistrer une vente dans le classement
    Utiliser ZINCRBY sur la clé LEADERBOARD_KEY
    """
    r.zincrby(LEADERBOARD_KEY, quantity, str(product_id))


def get_top_products(r, n: int = 10) -> list:
    """
    Retourner les N produits les plus vendus
    Format : [{"product_id": "1", "sales": 150}, ...]
    Astuce : ZREVRANGE avec WITHSCORES
    """
    results = r.zrevrange(LEADERBOARD_KEY, 0, n - 1, withscores=True)
    return [{"product_id": product_id, "sales": sales} for product_id, sales in results]


def get_product_rank(r, product_id) -> Optional[int]:
    """
    Retourner le rang 1-based d'un produit
    (1 = best seller, None si pas dans le classement)
    """
    # ZREVRANK retourne 0-based (0 = meilleur), on convertit en 1-based
    rank = r.zrevrank(LEADERBOARD_KEY, str(product_id))
    if rank is None:
        return None
    return rank + 1


def get_products_between_ranks(r, start_rank: int, end_rank: int) -> list:
    """
    Retourner les produits entre les rangs start et end (1-based)
    Ex: rangs 3 à 7 → 5 produits
    """
    # Convertir en 0-based pour ZREVRANGE
    results = r.zrevrange(LEADERBOARD_KEY, start_rank - 1, end_rank - 1, withscores=True)
    return [{"product_id": product_id, "sales": sales, "rank": start_rank + i}
            for i, (product_id, sales) in enumerate(results)]


def get_sales_stats(r) -> dict:
    """Statistiques globales du classement"""
    total_products = r.zcard(LEADERBOARD_KEY)
    if total_products == 0:
        return {}

    # Produit le plus vendu
    top = r.zrevrange(LEADERBOARD_KEY, 0, 0, withscores=True)
    # Produit le moins vendu
    bottom = r.zrange(LEADERBOARD_KEY, 0, 0, withscores=True)

    # Total des ventes (somme de tous les scores)
    all_scores = r.zrange(LEADERBOARD_KEY, 0, -1, withscores=True)
    total_sales = sum(score for _, score in all_scores)

    return {
        "total_products": total_products,
        "total_sales": int(total_sales),
        "avg_sales_per_product": round(total_sales / total_products, 1),
        "best_seller": {"product_id": top[0][0], "sales": int(top[0][1])},
        "worst_seller": {"product_id": bottom[0][0], "sales": int(bottom[0][1])},
    }


def simulate_sales_day(r, n_sales: int = 500):
    """
    Simuler une journée de ventes aléatoires
    Générer n_sales ventes aléatoires sur les produits 1-20
    """
    import random
    products = list(range(1, 21))
    for _ in range(n_sales):
        product_id = random.choice(products)
        qty = random.randint(1, 5)
        record_sale(r, product_id, qty)


if __name__ == "__main__":
    r.flushdb()

    print("Simulation de ventes...")
    simulate_sales_day(r, 500)

    print("\n🏆 Top 5 produits:")
    for i, p in enumerate(get_top_products(r, 5), 1):
        print(f"  {i}. Produit #{p['product_id']} — {int(p['sales'])} ventes")

    print(f"\nRang du produit #1 : {get_product_rank(r, 1)}")
    print(f"Rang du produit #99 (absent) : {get_product_rank(r, 99)}")

    print("\n📊 Produits classés 3e à 7e :")
    for p in get_products_between_ranks(r, 3, 7):
        print(f"  #{p['rank']} — Produit {p['product_id']} ({int(p['sales'])} ventes)")

    print("\n📈 Statistiques globales :")
    stats = get_sales_stats(r)
    for k, v in stats.items():
        print(f"  {k}: {v}")
