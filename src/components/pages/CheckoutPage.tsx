import { useState } from "react";
import { ArrowLeft, CreditCard } from "lucide-react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Checkbox } from "../ui/checkbox";
import { Separator } from "../ui/separator";
import { useAppContext } from "../AppContext";
import { useNavigate } from "react-router-dom";

export function CheckoutPage() {
  const { state, setUserAccount } = useAppContext();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [newsletter, setNewsletter] = useState(false);
  const [createAccount, setCreateAccount] = useState(false);

  const calculateTotal = () => {
    const subtotal = state.cartItems.reduce((total, item) => {
      let itemTotal = item.product.price * item.quantity;
      if (item.addOns.warranty) itemTotal += 19.99;
      if (item.addOns.insurance) itemTotal += 14.99;
      if (item.addOns.premiumSupport) itemTotal += 9.99;
      return total + itemTotal;
    }, 0);

    return subtotal; // No hidden fees
  };

  const handleCreateAccount = () => {
    if (!email || !password) {
      alert("Please fill in all required fields.");
      return;
    }

    setUserAccount({
      email,
      hasAccount: true,
      premiumTrial: false
    });

    navigate("/confirmation");
  };

  const handleGuestCheckout = () => {
    navigate("/confirmation");
  };

  if (state.cartItems.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Button onClick={() => navigate("/")} variant="outline" className="mb-6">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Home
        </Button>

        <div className="text-center py-12">
          <h2 className="text-2xl mb-4">No items to checkout</h2>
          <Button onClick={() => navigate("/")}>Browse Products</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <Button onClick={() => navigate("/cart")} variant="outline" className="mb-6">
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to Cart
      </Button>

      <h1 className="text-3xl mb-8">Checkout</h1>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* LEFT SIDE */}
        <div className="space-y-6">
          {/* Optional Account Creation */}
          <div className="border rounded-lg p-6">
            <h2 className="text-xl mb-4">Account (Optional)</h2>

            <div className="flex items-start space-x-2 mb-4">
              <Checkbox
                id="create-account"
                checked={createAccount}
                onCheckedChange={setCreateAccount}
              />
              <label htmlFor="create-account" className="text-sm">
                Create an account for easier order tracking
              </label>
            </div>

            {createAccount && (
              <div className="space-y-4">
                <div>
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email"
                  />
                </div>

                <div>
                  <Label htmlFor="password">Password *</Label>
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Create a password"
                  />
                </div>

                <div className="flex items-start space-x-2">
                  <Checkbox
                    id="newsletter"
                    checked={newsletter}
                    onCheckedChange={setNewsletter}
                  />
                  <label htmlFor="newsletter" className="text-sm text-gray-600">
                    Receive occasional product updates and discounts
                  </label>
                </div>

                <Button onClick={handleCreateAccount} className="w-full">
                  Create Account & Finish Checkout
                </Button>
              </div>
            )}

            {!createAccount && (
              <Button onClick={handleGuestCheckout} className="w-full mt-2">
                Continue as Guest
              </Button>
            )}
          </div>

          {/* Payment Form */}
          <div className="border rounded-lg p-6">
            <div className="flex items-center gap-2 mb-4">
              <CreditCard className="h-5 w-5" />
              <h2 className="text-xl">Payment Information</h2>
            </div>

            <div className="space-y-4">
              <div>
                <Label htmlFor="card">Card Number</Label>
                <Input id="card" placeholder="1234 5678 9012 3456" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="expiry">Expiry Date</Label>
                  <Input id="expiry" placeholder="MM/YY" />
                </div>
                <div>
                  <Label htmlFor="cvv">CVV</Label>
                  <Input id="cvv" placeholder="123" />
                </div>
              </div>

              <div>
                <Label htmlFor="cardholder">Cardholder Name</Label>
                <Input id="cardholder" placeholder="John Doe" />
              </div>

              <Button onClick={handleGuestCheckout} className="w-full h-12">
                Complete Order – ${calculateTotal().toFixed(2)}
              </Button>
            </div>
          </div>
        </div>

        {/* RIGHT SIDE: Order Summary */}
        <div className="border rounded-lg p-6 h-fit">
          <h2 className="text-xl mb-4">Order Summary</h2>

          <div className="space-y-3 mb-4">
            {state.cartItems.map((item, index) => (
              <div key={index} className="flex gap-3">
                <img
                  src={item.product.image}
                  alt={item.product.name}
                  className="w-16 h-16 object-cover rounded"
                />
                <div className="flex-1">
                  <p className="text-sm font-medium">{item.product.name}</p>
                  <p className="text-xs text-gray-600">
                    {item.size} • {item.color}
                  </p>
                  <p className="text-sm">${item.product.price}</p>
                  {item.addOns.warranty && (
                    <p className="text-xs text-gray-600">+ Warranty $19.99</p>
                  )}
                  {item.addOns.insurance && (
                    <p className="text-xs text-gray-600">+ Insurance $14.99</p>
                  )}
                  {item.addOns.premiumSupport && (
                    <p className="text-xs text-gray-600">
                      + Premium Support $9.99
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>

          <Separator className="my-4" />

          <div className="flex justify-between text-lg font-medium">
            <span>Total</span>
            <span>${calculateTotal().toFixed(2)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
