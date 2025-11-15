import { useState } from "react";
import {
  Check,
  ArrowLeft,
  Package,
  Clock
} from "lucide-react";
import { Button } from "../ui/button";
import { Separator } from "../ui/separator";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { useAppContext } from "../AppContext";
import { useNavigate } from "react-router-dom";

export function ConfirmationPage() {
  const { state } = useAppContext();
  const navigate = useNavigate();
  const [showDetails, setShowDetails] = useState(false);

  const calculateTotal = () => {
    return state.cartItems.reduce((total, item) => {
      let itemTotal = item.product.price * item.quantity;
      if (item.addOns.warranty) itemTotal += 19.99;
      if (item.addOns.insurance) itemTotal += 14.99;
      if (item.addOns.premiumSupport) itemTotal += 9.99;
      return total + itemTotal;
    }, 0);
  };

  const orderNumber = `ORDER-${Math.random()
    .toString(36)
    .substr(2, 9)
    .toUpperCase()}`;

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* Success Header */}
      <div className="text-center mb-8">
        <div className="bg-green-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
          <Check className="h-10 w-10 text-green-600" />
        </div>
        <h1 className="text-3xl mb-2">Order Confirmed</h1>
        <p className="text-gray-600">
          Thank you for your purchase. Your order has been processed.
        </p>
        <p className="text-sm text-gray-500 mt-2">Order #{orderNumber}</p>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* LEFT COLUMN */}
        <div className="space-y-6">
          {/* Order Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                Order Summary
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {state.cartItems.map((item, index) => (
                  <div
                    key={index}
                    className="flex gap-3 py-2 border-b last:border-b-0"
                  >
                    <img
                      src={item.product.image}
                      alt={item.product.name}
                      className="w-12 h-12 object-cover rounded"
                    />
                    <div className="flex-1">
                      <p className="text-sm font-medium">
                        {item.product.name}
                      </p>
                      <p className="text-xs text-gray-600">
                        {item.size} • {item.color}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium">
                        ${item.product.price.toFixed(2)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowDetails(!showDetails)}
                className="w-full mt-4 text-xs"
              >
                {showDetails ? "Hide" : "Show"} detailed breakdown
              </Button>

              {showDetails && (
                <div className="mt-4 space-y-2 text-sm border-t pt-4">
                  {state.cartItems.map((item, index) => (
                    <div key={index} className="space-y-1">
                      {item.addOns.warranty && (
                        <div className="flex justify-between text-gray-600">
                          <span className="text-xs">• Extended Warranty</span>
                          <span className="text-xs">$19.99</span>
                        </div>
                      )}
                      {item.addOns.insurance && (
                        <div className="flex justify-between text-gray-600">
                          <span className="text-xs">• Insurance</span>
                          <span className="text-xs">$14.99</span>
                        </div>
                      )}
                      {item.addOns.premiumSupport && (
                        <div className="flex justify-between text-gray-600">
                          <span className="text-xs">• Premium Support</span>
                          <span className="text-xs">$9.99</span>
                        </div>
                      )}
                    </div>
                  ))}

                  <Separator className="my-2" />
                </div>
              )}
            </CardContent>
          </Card>

          {/* Shipping Info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Shipping Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm">Estimated Delivery:</span>
                  <span className="text-sm font-medium">
                    5–7 business days
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Shipping Method:</span>
                  <span className="text-sm">Standard Shipping</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Tracking:</span>
                  <span className="text-sm text-blue-600">
                    Available within 24 hours
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* RIGHT COLUMN */}
        <div className="space-y-6">
          {/* Payment Summary */}
          <Card>
            <CardHeader>
              <CardTitle>Payment Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between text-lg font-medium">
                  <span>Total Charged:</span>
                  <span>${calculateTotal().toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Payment Method:</span>
                  <span>•••• •••• •••• 1234</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Navigation Buttons */}
          <div className="flex gap-4">
            <Button onClick={() => navigate("/")} className="flex-1">
              Continue Shopping
            </Button>
            <Button
              variant="outline"
              onClick={() => navigate("/")}
              className="flex-1"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Home
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
