import { useState, useEffect } from 'react';
import { ArrowLeft, Star, Shield, Info } from 'lucide-react';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Checkbox } from '../ui/checkbox';
import { Alert, AlertDescription } from '../ui/alert';
import { useAppContext } from '../AppContext';
import { useNavigate } from 'react-router-dom';
import { ProductGrid } from '../ProductGrid';
import { Product } from '../ProductCard';
import { mockProductsWomen } from '../../data/mockProductsWomen';
import { mockProductsMen } from '../../data/mockProductsMen';
import { mockProductsKids } from '../../data/mockProductsKids';

const sizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];
const colors = ['Black', 'White', 'Navy', 'Gray', 'Red'];

export function ProductPage() {
  const { state, addToCart, setSelectedProduct } = useAppContext();
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedColor, setSelectedColor] = useState('');
  const [warrantyOptIn, setWarrantyOptIn] = useState(false);
  const [newsletterOptIn, setNewsletterOptIn] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [state.selectedProduct]);

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
  const stockLevel = Math.floor(Math.random() * 50) + 10;

  const handleAddToCart = () => {
    if (!selectedSize || !selectedColor) {
      alert('Please select size and color');
      return;
    }

    const cartItem = {
      product,
      size: selectedSize,
      color: selectedColor,
      quantity: 1,
      addOns: {
        warranty: warrantyOptIn,
        insurance: false,
        premiumSupport: false,
      },
    };

    addToCart(cartItem);
    navigate('/cart');
  };

  const handleCheckout = () => {
    if (!selectedSize || !selectedColor) {
      alert('Please select size and color before proceeding to checkout');
      return;
    }

    const cartItem = {
      product,
      size: selectedSize,
      color: selectedColor,
      quantity: 1,
      addOns: {
        warranty: warrantyOptIn,
        insurance: false,
        premiumSupport: false,
      },
    };

    addToCart(cartItem);
    navigate('/checkout');
  };

  // Recommendations
  let dataset: Product[] = [];
  switch (product.gender) {
    case 'women':
      dataset = mockProductsWomen;
      break;
    case 'men':
      dataset = mockProductsMen;
      break;
    case 'kids':
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
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <Button onClick={() => navigate(-1)} variant="outline" className="mb-6">
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to Products
      </Button>

      <div className="grid md:grid-cols-2 gap-8">
        <div>
          <img
            src={product.image}
            alt={`${product.name} - ${product.category}`}
            className="w-full rounded-lg"
          />
        </div>

        <div>
          <div className="flex items-center gap-2 mb-2">
            {product.isNew && <Badge className="bg-blue-600">New</Badge>}
            {product.isSale && <Badge className="bg-green-600">Sale</Badge>}
          </div>

          <h1 className="text-3xl mb-4">{product.name}</h1>

          {/* Verified ratings */}
          <div className="flex items-center gap-2 mb-4">
            <div className="flex">
              {[1, 2, 3, 4, 5].map((i) => (
                <Star
                  key={i}
                  className={`h-5 w-5 ${
                    i <= 4 ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
                  }`}
                />
              ))}
            </div>
            <span className="text-sm text-gray-600">4.2 (127 verified reviews)</span>
            <Badge variant="outline" className="ml-2 text-xs">
              <Shield className="h-3 w-3 mr-1" />
              Verified
            </Badge>
          </div>

          <div className="flex items-center gap-3 mb-6">
            <span className="text-3xl">${product.price}</span>
            {product.originalPrice && (
              <span className="text-xl text-gray-500 line-through">
                ${product.originalPrice}
              </span>
            )}
            {product.originalPrice && (
              <Badge variant="outline" className="bg-green-50 border-green-200 text-green-800">
                Save ${(product.originalPrice - product.price).toFixed(2)}
              </Badge>
            )}
          </div>

          {/* Honest stock info */}
          <Alert className="mb-6">
            <Info className="h-4 w-4" />
            <AlertDescription>
              {stockLevel > 5
                ? `${stockLevel} items available for immediate shipping`
                : `Low stock: Only ${stockLevel} left`}
            </AlertDescription>
          </Alert>

          <div className="space-y-4 mb-6">
            <div>
              <label htmlFor="size-select" className="block text-sm font-medium mb-2">
                Size *
              </label>
              <Select value={selectedSize} onValueChange={setSelectedSize}>
                <SelectTrigger id="size-select">
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
              <label htmlFor="color-select" className="block text-sm font-medium mb-2">
                Color *
              </label>
              <Select value={selectedColor} onValueChange={setSelectedColor}>
                <SelectTrigger id="color-select">
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

          {/* Optional Add-ons */}
          <div className="border rounded-lg p-4 mb-6 bg-gray-50">
            <h3 className="font-medium mb-3">Optional Add-ons</h3>
            <div className="space-y-3">
              <div className="flex items-start space-x-3">
                <Checkbox
                  id="warranty-optin"
                  checked={warrantyOptIn}
                  onCheckedChange={setWarrantyOptIn}
                />
                <div className="flex-1">
                  <label htmlFor="warranty-optin" className="text-sm font-medium block">
                    Extended Warranty (2 years) - $19.99
                  </label>
                  <p className="text-xs text-gray-600 mt-1">
                    Covers manufacturing defects and normal wear.
                    <button className="text-blue-600 underline ml-1">View terms</button>
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <Checkbox
                  id="newsletter-optin"
                  checked={newsletterOptIn}
                  onCheckedChange={setNewsletterOptIn}
                />
                <div className="flex-1">
                  <label htmlFor="newsletter-optin" className="text-sm font-medium block">
                    Subscribe to our newsletter
                  </label>
                  <p className="text-xs text-gray-600 mt-1">
                    Get notified about new arrivals and offers. Unsubscribe anytime.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col gap-3">
            <Button
              onClick={handleAddToCart}
              className="w-full h-12 text-lg"
              disabled={!selectedSize || !selectedColor || stockLevel === 0}
            >
              {stockLevel === 0
                ? 'Out of Stock'
                : `Add to Cart - $${(
                    warrantyOptIn ? product.price + 19.99 : product.price
                  ).toFixed(2)}`}
            </Button>

            <Button
              onClick={handleCheckout}
              variant="secondary"
              className="w-full h-12 text-lg"
              disabled={!selectedSize || !selectedColor || stockLevel === 0}
            >
              Proceed to Checkout
            </Button>
          </div>

          <div className="mt-4 text-center text-sm text-gray-600">
            Free shipping on orders over $75 • 30-day return policy
          </div>
        </div>
      </div>

      {/* Recommendations */}
      {recommendedProducts.length > 0 && (
        <div className="mt-16">
          <h2 className="text-2xl font-semibold mb-6">You Might Also Like</h2>
          <ProductGrid
            products={recommendedProducts}
            onAddToCart={(id) => {
              const p = recommendedProducts.find((x) => x.id === id);
              if (p)
                addToCart({
                  product: p,
                  quantity: 1,
                  addOns: { warranty: false, insurance: false, premiumSupport: false },
                });
            }}
            onViewProduct={handleViewProduct}
          />
        </div>
      )}
    </div>
  );
}
