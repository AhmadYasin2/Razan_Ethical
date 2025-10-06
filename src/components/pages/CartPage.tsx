import { useState } from "react";
import {
  ArrowLeft,
  Trash2,
  Shield,
  Headphones,
  Info,
} from "lucide-react";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Separator } from "../ui/separator";
import { Alert, AlertDescription } from "../ui/alert";
import { useAppContext } from "../AppContext";
import { useNavigate } from "react-router-dom";

export function CartPage() {
  const { state, removeFromCart, updateCartItem } = useAppContext();
  const navigate = useNavigate();

  const [recommendedUpgrades] = useState([
    {
      title: "Premium Package",
      desc: "Get express shipping + extended warranty + priority support",
      price: 29.99,
    },
  ]);

  // Add-on toggles
  const toggleAddOn = (
    itemIndex: number,
    addon: keyof (typeof state.cartItems)[0]["addOns"]
  ) => {
    const current = state.cartItems[itemIndex].addOns[addon];
    const updatedAddOns = {
      ...state.cartItems[itemIndex].addOns,
      [addon]: !current,
    };
    updateCartItem(itemIndex, { addOns: updatedAddOns });
  };

  const calculateSubtotal = () => {
    return state.cartItems.reduce((total, item) => {
      let itemTotal = item.product.price * item.quantity;
      if (item.addOns.warranty) itemTotal += 19.99;
      if (item.addOns.insurance) itemTotal += 14.99;
      if (item.addOns.premiumSupport) itemTotal += 9.99;
      return total + itemTotal;
    }, 0);
  };

  const subtotal = calculateSubtotal();
  const shipping = subtotal >= 75 ? 0 : 6.99;
  const tax = subtotal * 0.08;
  const total = subtotal + shipping + tax;

  // ✅ Navigate with React Router
  const handleProceedToCheckout = () => navigate("/checkout");

  if (state.cartItems.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Button
          onClick={() => navigate("/")}
          variant="outline"
          className="mb-6"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Continue Shopping
        </Button>

        <div className="text-center py-12">
          <h2 className="text-2xl mb-4">Your cart is empty</h2>
          <p className="text-gray-600 mb-6">Add some items to get started!</p>
          <Button onClick={() => navigate("/")}>Browse Products</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Button
        onClick={() => navigate("/")}
        variant="outline"
        className="mb-6"
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Continue Shopping
      </Button>

      <h1 className="text-3xl mb-8">Shopping Cart</h1>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* LEFT SIDE: Cart Items */}
        <div className="lg:col-span-2 space-y-6">
          {state.cartItems.map((item, index) => (
            <div key={index} className="border rounded-lg p-4">
              <div className="flex gap-4">
                <img
                  src={item.product.image}
                  alt={item.product.name}
                  className="w-24 h-24 object-cover rounded"
                />
                <div className="flex-1">
                  <h3 className="font-medium mb-1">{item.product.name}</h3>
                  <p className="text-sm text-gray-600 mb-2">
                    {item.size} • {item.color}
                  </p>
                  <p className="text-lg font-medium">${item.product.price}</p>

                  {/* Honest Add-ons */}
                  <div className="mt-3 space-y-2">
                    {/* Warranty */}
                    <div className="flex items-center justify-between text-sm bg-blue-50 p-2 rounded border border-blue-200">
                      <div className="flex items-center gap-2">
                        <Shield className="h-4 w-4 text-blue-600" />
                        <span>Extended Warranty</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span>$19.99</span>
                        <Button
                          variant={item.addOns.warranty ? "destructive" : "secondary"}
                          size="sm"
                          onClick={() => toggleAddOn(index, "warranty")}
                          className="text-xs"
                        >
                          {item.addOns.warranty ? "Remove" : "Add"}
                        </Button>
                      </div>
                    </div>

                    {/* Insurance */}
                    <div className="flex items-center justify-between text-sm bg-blue-50 p-2 rounded border border-blue-200">
                      <div className="flex items-center gap-2">
                        <Shield className="h-4 w-4 text-blue-600" />
                        <span>Protection Insurance</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span>$14.99</span>
                        <Button
                          variant={item.addOns.insurance ? "destructive" : "secondary"}
                          size="sm"
                          onClick={() => toggleAddOn(index, "insurance")}
                          className="text-xs"
                        >
                          {item.addOns.insurance ? "Remove" : "Add"}
                        </Button>
                      </div>
                    </div>

                    {/* Premium Support */}
                    <div className="flex items-center justify-between text-sm bg-green-50 p-2 rounded border border-green-200">
                      <div className="flex items-center gap-2">
                        <Headphones className="h-4 w-4 text-green-600" />
                        <span>Premium Support</span>
                        {item.addOns.premiumSupport && (
                          <Badge className="bg-green-600 text-xs">Added</Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <span>$9.99</span>
                        <Button
                          variant={item.addOns.premiumSupport ? "destructive" : "secondary"}
                          size="sm"
                          onClick={() => toggleAddOn(index, "premiumSupport")}
                          className="text-xs"
                        >
                          {item.addOns.premiumSupport ? "Remove" : "Add"}
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeFromCart(index)}
                  className="text-red-600 hover:text-red-700"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>

              {/* Transparent upgrade suggestion */}
              <div className="mt-4 p-3 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg border border-purple-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-purple-900">🎁 Upgrade Options</p>
                    <p className="text-sm text-purple-700">
                      {recommendedUpgrades[0].desc}
                    </p>
                  </div>
                  <Button className="bg-purple-600 hover:bg-purple-700 text-white font-bold">
                    Add for ${recommendedUpgrades[0].price.toFixed(2)}
                  </Button>
                </div>
              </div>
            </div>
          ))}

          {/* Honest upsell note */}
          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription>
              <strong>Recommended:</strong> Complete your experience with optional
              accessories and protection plans. No tricks, just choices.
            </AlertDescription>
          </Alert>
        </div>

        {/* RIGHT SIDE: Summary */}
        <div className="border rounded-lg p-6 h-fit">
          <h2 className="text-xl mb-4">Order Summary</h2>

          <div className="space-y-2 mb-4">
            <div className="flex justify-between">
              <span>
                Subtotal ({state.cartItems.length} item
                {state.cartItems.length !== 1 ? "s" : ""})
              </span>
              <span>${subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span>Shipping</span>
              <span>${shipping.toFixed(2)}</span>
            </div>
            {shipping === 0 ? (
              <p className="text-xs text-green-600">Free shipping applied!</p>
            ) : (
              <p className="text-xs text-gray-600">
                Free shipping on orders over $75
              </p>
            )}
            <div className="flex justify-between">
              <span>Tax (estimated)</span>
              <span>${tax.toFixed(2)}</span>
            </div>
          </div>

          <Separator className="my-4" />

          <div className="flex justify-between text-lg font-medium mb-6">
            <span>Total</span>
            <span>${total.toFixed(2)}</span>
          </div>

          <Button onClick={handleProceedToCheckout} className="w-full h-12">
            Proceed to Checkout
          </Button>

          <div className="mt-4 space-y-2 text-xs text-gray-600">
            <p>• 30-day return policy</p>
            <p>• Secure checkout with SSL encryption</p>
            <p>• Customer support: 1-800-STYLE-01</p>
          </div>
        </div>
      </div>
    </div>
  );
}
