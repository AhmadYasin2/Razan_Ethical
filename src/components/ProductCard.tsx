import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ShoppingCart, Eye, Check } from "lucide-react";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { useAppContext } from "./AppContext";

export interface Product {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  image: string;
  category: string;
  isNew?: boolean;
  isSale?: boolean;
  onSale?: boolean;
  gender?: "men" | "women" | "kids";
  piecesLeft?: number;
}

interface ProductCardProps {
  product: Product;
  onAddToCart?: (productId: string) => void;
}

export function ProductCard({ product, onAddToCart }: ProductCardProps) {
  const { setSelectedProduct } = useAppContext();
  const navigate = useNavigate();
  const [added, setAdded] = useState(false);

  const handleViewProduct = () => {
    setSelectedProduct(product);
    navigate(`/product/${product.id}`);
  };

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onAddToCart) {
      onAddToCart(product.id);
      setAdded(true);
      setTimeout(() => setAdded(false), 1200);
    }
  };

  return (
    <div
      className="group relative bg-white rounded-lg border hover:shadow-lg transition-shadow overflow-hidden cursor-pointer"
      onClick={handleViewProduct}
    >
      <div className="aspect-square overflow-hidden">
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          loading="lazy"
        />
      </div>

      <div className="absolute top-3 left-3 flex flex-col gap-1">
        {product.isNew && <Badge className="bg-blue-600">New</Badge>}
        {product.isSale && <Badge className="bg-red-600">Sale</Badge>}
      </div>


      <div className="p-4">
        <h3 className="text-lg mb-2 group-hover:text-blue-600 transition-colors">
          {product.name}
        </h3>
        <p className="text-sm text-gray-600 mb-3">{product.category}</p>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xl">${product.price}</span>
            {product.originalPrice && (
              <span className="text-gray-500 line-through">
                ${product.originalPrice}
              </span>
            )}
          </div>

          <div className="flex gap-2">
            <Button
              size="sm"
              variant="outline"
              className="opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
                e.stopPropagation();
                handleViewProduct();
              }}
            >
              <Eye className="h-4 w-4" />
            </Button>

            <Button
              size="sm"
              className={`opacity-0 group-hover:opacity-100 transition-all duration-300 ${
                added ? "bg-green-600 text-white scale-105" : ""
              }`}
              onClick={handleAddToCart}
            >
              {added ? (
                <Check className="h-4 w-4" />
              ) : (
                <ShoppingCart className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>

        {product.isSale && (
          <div className="mt-2 text-xs text-red-600 font-medium">
            ⏰ Sale ends in 2 hours!
          </div>
        )}
      </div>
    </div>
  );
}
