import { useState } from 'react';
import { Check, ArrowLeft, Package, Download, Mail, Phone } from 'lucide-react';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Separator } from '../ui/separator';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Alert, AlertDescription } from '../ui/alert';
import { useAppContext } from '../AppContext';
import { useNavigate } from 'react-router-dom';

export function ConfirmationPage() {
  const { state } = useAppContext();
  const navigate = useNavigate();

  const calculateItemsTotal = () => {
    return state.cartItems.reduce((total, item) => {
      let itemTotal = item.product.price * item.quantity;
      if (item.addOns.warranty) itemTotal += 19.99;
      return total + itemTotal;
    }, 0);
  };

  const calculateTotals = () => {
    const subtotal = calculateItemsTotal();
    const shipping = subtotal >= 75 ? 0 : 6.99;
    const tax = subtotal * 0.08;
    const total = subtotal + shipping + tax;
    return { subtotal, shipping, tax, total };
  };

  const { subtotal, shipping, tax, total } = calculateTotals();
  const orderNumber = `ORD-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

  const handleExportOrder = () => {
    const orderData = {
      orderNumber,
      date: new Date().toISOString(),
      items: state.cartItems,
      totals: { subtotal, shipping, tax, total },
    };
    const dataStr = JSON.stringify(orderData, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
    const exportFileDefaultName = `order-${orderNumber}.json`;
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* Success Header */}
      <div className="text-center mb-8">
        <div className="bg-green-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
          <Check className="h-10 w-10 text-green-600" />
        </div>
        <h1 className="text-3xl mb-2">Order Confirmed!</h1>
        <p className="text-gray-600">
          Thank you for your purchase. Your order has been processed successfully.
        </p>
        <p className="text-sm text-gray-500 mt-2">Order #{orderNumber}</p>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* LEFT COLUMN */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                Order Details
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {state.cartItems.map((item, index) => (
                  <div key={index} className="flex gap-3 py-3 border-b last:border-b-0">
                    <img
                      src={item.product.image}
                      alt={`${item.product.name} - ${item.product.category}`}
                      className="w-16 h-16 object-cover rounded"
                    />
                    <div className="flex-1">
                      <p className="font-medium">{item.product.name}</p>
                      <p className="text-sm text-gray-600">
                        {item.size} • {item.color}
                      </p>
                      <p className="text-sm font-medium">${item.product.price}</p>
                      {item.addOns.warranty && (
                        <p className="text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded mt-1 inline-block">
                          Extended Warranty: $19.99
                        </p>
                      )}
                    </div>
                    <div className="text-right">
                      <p className="text-sm">Qty: {item.quantity}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Cost Breakdown */}
              <div className="mt-6 space-y-2 bg-gray-50 p-4 rounded-lg">
                <div className="flex justify-between text-sm">
                  <span>Subtotal</span>
                  <span>${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Shipping</span>
                  <span>${shipping.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Tax</span>
                  <span>${tax.toFixed(2)}</span>
                </div>
                <Separator />
                <div className="flex justify-between font-medium">
                  <span>Total Charged</span>
                  <span>${total.toFixed(2)}</span>
                </div>
              </div>

              <div className="mt-4 flex gap-2">
                <Button variant="outline" size="sm" onClick={handleExportOrder}>
                  <Download className="h-4 w-4 mr-2" />
                  Export Order
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Shipping & Support */}
          <Card>
            <CardHeader>
              <CardTitle>Shipping & Support</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-medium mb-2">Shipping Information</h4>
                <div className="text-sm space-y-1">
                  <p>Estimated delivery: 5–7 business days</p>
                  <p>Tracking number will be sent via email within 24 hours</p>
                  <p>Free returns within 30 days</p>
                </div>
              </div>

              <Separator />

              <div>
                <h4 className="font-medium mb-2">Need Help?</h4>
                <div className="text-sm space-y-2">
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    <span>support@stylestore.com</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4" />
                    <span>1-800-STYLE-01</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* RIGHT COLUMN */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>You Might Also Like</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 mb-4">
                Based on your purchase, here are some items other customers enjoyed:
              </p>

              <div className="space-y-3">
                <div className="border rounded-lg p-3">
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-medium text-sm">Matching Accessories Set</h4>
                    <span className="text-sm font-medium">$39.99</span>
                  </div>
                  <p className="text-xs text-gray-600 mb-2">
                    Belt, scarf, and jewelry that complement your style
                  </p>
                  <Button variant="outline" size="sm" className="w-full">
                    View Details
                  </Button>
                </div>

                <div className="border rounded-lg p-3">
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-medium text-sm">Care Kit</h4>
                    <span className="text-sm font-medium">$24.99</span>
                  </div>
                  <p className="text-xs text-gray-600 mb-2">
                    Keep your clothing looking new with our care products
                  </p>
                  <Button variant="outline" size="sm" className="w-full">
                    View Details
                  </Button>
                </div>
              </div>

              <Alert className="mt-4">
                <AlertDescription className="text-xs">
                  These are honest recommendations based on customer reviews. No pressure — just options.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>

          {/* Receipt */}
          <Card>
            <CardHeader>
              <CardTitle>Receipt</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Order Number:</span>
                  <span className="font-mono">{orderNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span>Date:</span>
                  <span>{new Date().toLocaleDateString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>Payment Method:</span>
                  <span>•••• •••• •••• 1234</span>
                </div>
                <div className="flex justify-between">
                  <span>Total Charged:</span>
                  <span className="font-medium">${total.toFixed(2)}</span>
                </div>
              </div>

              <p className="text-xs text-gray-600 mt-4">
                A detailed receipt has been sent to your email address.
              </p>
            </CardContent>
          </Card>

          {/* ✅ Fixed Buttons */}
          <div className="flex gap-4">
            <Button onClick={() => navigate('/')} className="flex-1">
              Continue Shopping
            </Button>
            <Button
              variant="outline"
              onClick={() => navigate('/')}
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
