import { Hero } from "../Hero";
import { ProductGrid } from "../ProductGrid";
import { useAppContext } from "../AppContext";
import { mockProducts } from "../../data";

export const HomePage = () => {
  const { addToCart } = useAppContext();

  const handleAddToCart = (productId: string) => {
    const product = mockProducts.find((p) => p.id === productId);
    if (product) {
      addToCart({
        product,
        quantity: 1,
        addOns: {
          warranty: false,
          insurance: false,
          premiumSupport: false,
        },
      });
    }
  };

  return (
    <>
      <Hero />
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">Featured Products</h1>
        <ProductGrid products={mockProducts} onAddToCart={handleAddToCart} />
      </div>
    </>
  );
};
