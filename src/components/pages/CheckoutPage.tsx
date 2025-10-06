import { useState } from "react";
import { ArrowLeft, CreditCard, User, UserCheck, Info } from "lucide-react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Checkbox } from "../ui/checkbox";
import { Separator } from "../ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { Alert, AlertDescription } from "../ui/alert";
import { useAppContext } from "../AppContext";
import { useNavigate } from "react-router-dom";

export function CheckoutPage() {
  const { state, setUserAccount } = useAppContext();
  const navigate = useNavigate(); // ✅ use navigate instead of setCurrentPage

  const [checkoutType, setCheckoutType] = useState<"guest" | "account">("guest");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [newsletterOptIn, setNewsletterOptIn] = useState(false);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");

  const calculateTotal = () => {
    const subtotal = state.cartItems.reduce((total, item) => {
      let itemTotal = item.product.price * item.quantity;
      if (item.addOns.warranty) itemTotal += 19.99;
      return total + itemTotal;
    }, 0);

    const shipping = subtotal >= 75 ? 0 : 6.99;
    const tax = subtotal * 0.08;
    return subtotal + shipping + tax;
  };

  const handleCompleteOrder = () => {
    if (checkoutType === "account" && (!email || !password)) {
      alert("Please fill in all required fields");
      return;
    }

    if (checkoutType === "account") {
      setUserAccount({
        email,
        hasAccount: true,
        premiumTrial: false,
      });
    }

    // ✅ Navigate to confirmation page
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
        <div className="space-y-6">
          {/* Customer Info Section */}
          <div className="border rounded-lg p-6">
            <h2 className="text-xl mb-4">Customer Information</h2>

            <Tabs
              value={checkoutType}
              onValueChange={(value: "guest" | "account") => setCheckoutType(value)}
            >
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="guest" className="flex items-center gap-2">
                  <User className="h-4 w-4" /> Guest Checkout
                </TabsTrigger>
                <TabsTrigger value="account" className="flex items-center gap-2">
                  <UserCheck className="h-4 w-4" /> Create Account
                </TabsTrigger>
              </TabsList>

              <TabsContent value="guest" className="space-y-4 mt-4">
                <Alert>
                  <Info className="h-4 w-4" />
                  <AlertDescription>
                    You can checkout as a guest. Order tracking will be sent to your email.
                  </AlertDescription>
                </Alert>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>First Name *</Label>
                    <Input value={firstName} onChange={(e) => setFirstName(e.target.value)} required />
                  </div>
                  <div>
                    <Label>Last Name *</Label>
                    <Input value={lastName} onChange={(e) => setLastName(e.target.value)} required />
                  </div>
                </div>

                <div>
                  <Label>Email Address *</Label>
                  <Input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="your.email@example.com"
                    required
                  />
                </div>
              </TabsContent>

              <TabsContent value="account" className="space-y-4 mt-4">
                <Alert>
                  <Info className="h-4 w-4" />
                  <AlertDescription>
                    Create an account to track orders and get faster checkout.
                  </AlertDescription>
                </Alert>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>First Name *</Label>
                    <Input value={firstName} onChange={(e) => setFirstName(e.target.value)} required />
                  </div>
                  <div>
                    <Label>Last Name *</Label>
                    <Input value={lastName} onChange={(e) => setLastName(e.target.value)} required />
                  </div>
                </div>

                <div>
                  <Label>Email Address *</Label>
                  <Input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="your.email@example.com"
                    required
                  />
                </div>

                <div>
                  <Label>Create Password *</Label>
                  <Input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Choose a secure password"
                    required
                  />
                </div>
              </TabsContent>
            </Tabs>

            {/* Newsletter Opt-in */}
            <div className="mt-4 pt-4 border-t">
              <div className="flex items-start space-x-3">
                <Checkbox
                  id="newsletter-checkout"
                  checked={newsletterOptIn}
                  onCheckedChange={setNewsletterOptIn}
                />
                <div>
                  <label htmlFor="newsletter-checkout" className="text-sm font-medium">
                    Subscribe to hear about future offers
                  </label>
                  <p className="text-xs text-gray-600 mt-1">
                    Get notified about new arrivals. You can unsubscribe anytime.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Payment Info */}
          <div className="border rounded-lg p-6">
            <div className="flex items-center gap-2 mb-4">
              <CreditCard className="h-5 w-5" />
              <h2 className="text-xl">Payment Information</h2>
            </div>

            <div className="space-y-4">
              <div>
                <Label>Card Number *</Label>
                <Input placeholder="1234 5678 9012 3456" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Expiry Date *</Label>
                  <Input placeholder="MM/YY" />
                </div>
                <div>
                  <Label>CVV *</Label>
                  <Input placeholder="123" />
                </div>
              </div>

              <div>
                <Label>Cardholder Name *</Label>
                <Input placeholder="John Doe" />
              </div>

              <Alert>
                <Info className="h-4 w-4" />
                <AlertDescription>
                  Your payment info is encrypted and secure. We never store your card details.
                </AlertDescription>
              </Alert>

              <Button onClick={handleCompleteOrder} className="w-full h-12">
                Complete Order - ${calculateTotal().toFixed(2)}
              </Button>
            </div>
          </div>
        </div>

        {/* Order Summary */}
        <div className="border rounded-lg p-6 h-fit">
          <h2 className="text-xl mb-4">Order Summary</h2>
          {state.cartItems.map((item, index) => (
            <div key={index} className="flex gap-3 mb-3">
              <img
                src={item.product.image}
                alt={item.product.name}
                className="w-16 h-16 object-cover rounded"
              />
              <div className="flex-1">
                <p className="text-sm font-medium">{item.product.name}</p>
                <p className="text-xs text-gray-600">{item.size} • {item.color}</p>
                <p className="text-sm">${item.product.price}</p>
              </div>
            </div>
          ))}

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
