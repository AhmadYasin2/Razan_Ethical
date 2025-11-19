import { useState, useEffect } from "react";
import { ArrowLeft, Star, Users, Clock, Check } from "lucide-react";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Checkbox } from "../ui/checkbox";
import { useAppContext } from "../AppContext";
import { useNavigate } from "react-router-dom";
import { ProductGrid } from "../ProductGrid";
import { Product } from "../ProductCard";
import { mockProductsWomen } from "../../data/mockProductsWomen";
import { mockProductsMen } from "../../data/mockProductsMen";
import { mockProductsKids } from "../../data/mockProductsKids";

const sizes = ["XS", "S", "M", "L", "XL", "XXL"];
const colors = ["Black", "White", "Navy", "Gray", "Red"];

const fakeActivities = [
  "Emma from London just bought this item!",
  "Mike from New York purchased this 3 minutes ago",
  "Sarah from Paris added this to cart",
  "John from Tokyo just bought 2 of these",
  "Lisa from Sydney purchased this item",
  "David from Berlin just bought this",
  "Anna from Rome added this to wishlist",
];

export function ProductPage() {
  const { state, addToCart, setSelectedProduct } = useAppContext();
  const [selectedSize, setSelectedSize] = useState("");
  const [selectedColor, setSelectedColor] = useState("");
  const [warrantyChecked, setWarrantyChecked] = useState(false);
  const [newsletterChecked, setNewsletterChecked] = useState(false);
  const [currentActivity, setCurrentActivity] = useState(0);
  const [added, setAdded] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [state.selectedProduct]);

  // fake social proof rotation
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentActivity((prev) => (prev + 1) % fakeActivities.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  if (!state.selectedProduct) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Button onClick={() => navigate(-1)} variant="outline" className="mb-6">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Products
        </Button>
        <p className="mt-4">Product not found.</p>
      </div>
    );
  }

  const product = state.selectedProduct;

  const handleAddToCart = () => {
    if (!selectedSize || !selectedColor) {
      alert("Please select size and color");
      return;
    }

    const cartItem = {
      product,
      size: selectedSize,
      color: selectedColor,
      quantity: 1,
      addOns: {
        warranty: warrantyChecked,
        insurance: false,
        premiumSupport: false,
      },
    };

    addToCart(cartItem);
    setAdded(true);

    // ✅ Immediately move user to cart page
    setTimeout(() => {
      setAdded(false);
      navigate("/cart");
    }, 800);
  };

  // product recommendations logic
  let dataset: Product[] = [];
  switch (product.gender) {
    case "women":
      dataset = mockProductsWomen;
      break;
    case "men":
      dataset = mockProductsMen;
      break;
    case "kids":
      dataset = mockProductsKids;
      break;
    default:
      dataset = [...mockProductsMen, ...mockProductsWomen, ...mockProductsKids];
      break;
  }

  const recommendedProducts = dataset
    .filter(
      (p) =>
        p.id !== product.id &&
        p.category?.toLowerCase() === product.category?.toLowerCase()
    )
    .slice(0, 4);

  const handleViewProduct = (p: Product) => {
    setSelectedProduct(p);
    navigate(`/product/${p.id}`);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <Button onClick={() => navigate(-1)} variant="outline" className="mb-6">
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to Products
      </Button>

      {/* social proof banner */}

      <div className="grid md:grid-cols-2 gap-8 mb-12">
        <div>
          <img
            src={product.image}
            alt={product.name}
            className="w-full rounded-lg"
          />
        </div>

        <div>
          <h1 className="text-3xl mb-4">{product.name}</h1>

          <div className="flex items-center gap-2 mb-4">
            <div className="flex">
              {[1, 2, 3, 4, 5].map((i) => (
                <Star
                  key={i}
                  className="h-5 w-5 fill-yellow-400 text-yellow-400"
                />
              ))}
            </div>
            <span className="text-sm text-gray-600">
              4.9 (100 Verified reviews)
            </span>
          </div>

          <div className="flex items-center gap-3 mb-6">
            <span className="text-3xl">JOD{product.price}</span>
          </div>

          {/* options */}
          <div className="space-y-4 mb-6">
            <div>
              <label className="block text-sm font-medium mb-2">Size</label>
              <Select value={selectedSize} onValueChange={setSelectedSize}>
                <SelectTrigger>
                  <SelectValue placeholder="Select size" />
                </SelectTrigger>
                <SelectContent>
                  {sizes.map((size) => (
                    <SelectItem key={size} value={size}>
                      {size}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Color</label>
              <Select value={selectedColor} onValueChange={setSelectedColor}>
                <SelectTrigger>
                  <SelectValue placeholder="Select color" />
                </SelectTrigger>
                <SelectContent>
                  {colors.map((color) => (
                    <SelectItem key={color} value={color}>
                      {color}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* addons */}
          <div className="border rounded-lg p-4 mb-6 bg-gray-50">
            <h3 className="font-medium mb-3">Recommended Add-ons</h3>
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="warranty"
                  checked={warrantyChecked}
                  onCheckedChange={setWarrantyChecked}
                  className="m-4 "
                />
                <label htmlFor="warranty" className="text-sm flex-1">
                  <span className="font-medium ">
                    Extended Warranty (2 years){" "}
                    <a
                      href="/privacy-terms"
                      className="text-blue-600 underline"
                    >
                      view privacy and terms
                    </a>
                  </span>
                  <span className="text-gray-600 block">
                    Protect your purchase - only JOD19.99
                  </span>
                </label>
                <span className="text-sm font-medium">JOD19.99</span>
              </div>
            </div>
          </div>

          <Button
            onClick={handleAddToCart}
            className={`w-full h-12 text-lg transition-all duration-300 ${
              added ? "bg-green-600 text-white scale-105" : ""
            }`}
            disabled={!selectedSize || !selectedColor}
          >
            {added ? (
              <span className="flex items-center justify-center gap-2">
                <Check className="h-5 w-5" /> Added to Cart
              </span>
            ) : (
              <>
                Add to Cart - JOD
                {warrantyChecked
                  ? (product.price + 19.99).toFixed(2)
                  : product.price}
              </>
            )}
          </Button>
        </div>
      </div>

      {recommendedProducts.length > 0 && (
        <div className="mt-16">
          <h2 className="text-2xl font-semibold mb-6">Recommended for You</h2>
          <ProductGrid
            products={recommendedProducts}
            onAddToCart={(id) => {
              const p = recommendedProducts.find((x) => x.id === id);
              if (p)
                addToCart({
                  product: p,
                  quantity: 1,
                  addOns: {
                    warranty: false,
                    insurance: false,
                    premiumSupport: false,
                  },
                });
            }}
            onViewProduct={handleViewProduct}
          />
        </div>
      )}
    </div>
  );
}
