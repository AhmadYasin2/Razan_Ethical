import { useState } from "react";
import { ArrowLeft, Trash2, Shield, Headphones } from "lucide-react";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Separator } from "../ui/separator";
import { useAppContext } from "../AppContext";
import { useNavigate } from "react-router-dom";

export function CartPage() {
  const { state, removeFromCart, updateCartItem } = useAppContext();
  const navigate = useNavigate();

  const removeAddOn = (
    itemIndex: number,
    addon: keyof (typeof state.cartItems)[0]["addOns"]
  ) => {
    const updatedAddOns = {
      ...state.cartItems[itemIndex].addOns,
      [addon]: false,
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
  const total = subtotal;

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
      <Button onClick={() => navigate("/")} variant="outline" className="mb-6">
        <ArrowLeft className="h-4 w-4 mr-2" />
        Continue Shopping
      </Button>

      <h1 className="text-3xl mb-8">Shopping Cart</h1>

      <div className="grid lg:grid-cols-3 gap-8">
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
                  <p className="text-lg font-medium">JOD{item.product.price}</p>

                  {(item.addOns.warranty ||
                    item.addOns.insurance ||
                    item.addOns.premiumSupport) && (
                    <div className="mt-3 space-y-2">
                      {item.addOns.warranty && (
                        <div className="flex items-center justify-between text-sm">
                          <span>Extended Warranty</span>
                          <div className="flex items-center gap-2">
                            <span>JOD19.99</span>
                            <button
                              onClick={() => removeAddOn(index, "warranty")}
                              className="text-xs text-gray-400 hover:text-gray-600 underline"
                            >
                              remove
                            </button>
                          </div>
                        </div>
                      )}

                      {item.addOns.insurance && (
                        <div className="flex items-center justify-between text-sm p-2 rounded bg-blue-50">
                          <div className="flex items-center gap-2">
                            <Shield className="h-4 w-4 text-blue-600" />
                            <span>Protection Insurance</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span>JOD14.99</span>
                            <button
                              onClick={() => removeAddOn(index, "insurance")}
                              className="text-xs hover:text-gray-600 underline"
                            >
                              remove
                            </button>
                          </div>
                        </div>
                      )}

                      {item.addOns.premiumSupport && (
                        <div className="flex items-center justify-between text-sm p-2 rounded bg-green-50">
                          <div className="flex items-center gap-2">
                            <Headphones className="h-4 w-4 text-green-600" />
                            <span>Premium Support</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span>JOD9.99</span>
                            <button
                              onClick={() =>
                                removeAddOn(index, "premiumSupport")
                              }
                              className="text-xs hover:text-gray-600 underline"
                            >
                              remove
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
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
            </div>
          ))}
        </div>

        <div className="border rounded-lg p-6 h-fit">
          <h2 className="text-xl mb-4">Order Summary</h2>

          <div className="space-y-2 mb-4">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span>JOD{subtotal.toFixed(2)}</span>
            </div>
          </div>

          <Separator className="my-4" />

          <div className="flex justify-between text-lg font-medium mb-6">
            <span>Total</span>
            <span>JOD{total.toFixed(2)}</span>
          </div>

          <Button onClick={() => navigate("/checkout")} className="w-full h-12">
            Proceed to Checkout
          </Button>
        </div>
      </div>
    </div>
  );
}
