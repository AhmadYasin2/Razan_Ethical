import { useSearchParams } from "react-router-dom";
import { ProductGrid } from "../ProductGrid";
import { useAppContext } from "../AppContext";
import { mockProducts } from "../../data";

export function SearchPage() {
  const [params] = useSearchParams();
  const { addToCart } = useAppContext();
  const query = params.get("q")?.toLowerCase() || "";

  const results = mockProducts.filter(
    (p) =>
      p.name.toLowerCase().includes(query) ||
      p.category.toLowerCase().includes(query)
  );

  const handleAddToCart = (productId: string) => {
    const product = results.find((p) => p.id === productId);
    if (product) {
      addToCart({
        product,
        quantity: 1,
        addOns: {},
      });
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">
        Search results for “{query || "all"}”
      </h1>
      {results.length > 0 ? (
        <ProductGrid products={results} onAddToCart={handleAddToCart} />
      ) : (
        <p className="text-muted-foreground">No products found.</p>
      )}
    </div>
  );
}
