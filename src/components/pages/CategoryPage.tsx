// src/components/pages/CategoryPage.tsx
import { useParams } from "react-router-dom";
import { ProductGrid } from "../ProductGrid";
import { useAppContext } from "../AppContext";
import { mockProductsMen } from "../../data/mockProductsMen";
import { mockProductsWomen } from "../../data/mockProductsWomen";
import { mockProductsKids } from "../../data/mockProductsKids";
import { Product } from "../ProductCard";

export const CategoryPage = () => {
  const { category } = useParams<{ category: string }>();
  const { addToCart } = useAppContext();
  const allProducts = [
    ...mockProductsMen,
    ...mockProductsWomen,
    ...mockProductsKids,
  ];
  const saleProducts = allProducts.filter((p) => p.onSale || p.isSale);

  // Map category names to their data
  const categoryData: Record<string, Product[]> = {
    men: mockProductsMen,
    women: mockProductsWomen,
    kids: mockProductsKids,
    sale: saleProducts,
  };

  // Grab the right list or default to empty
  const products = categoryData[category?.toLowerCase() || ""] || [];

  const handleAddToCart = (productId: string) => {
    const product = products.find((p) => p.id === productId);
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
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6 capitalize">
        {category ? category.charAt(0).toUpperCase() + category.slice(1) : "Category"}
      </h1>

      {products.length > 0 ? (
        <ProductGrid products={products} onAddToCart={handleAddToCart} />
      ) : (
        <p className="text-gray-500">No products found in this category.</p>
      )}
    </div>
  );
};
