import { useState } from 'react';
import { Smartphone, Star } from 'lucide-react';
import { Button } from '../ui/button';
import { useAppContext } from '../AppContext';

export function AppPopup() {
  const { state, dismissAppPopup } = useAppContext();

  const handleDismiss = () => {
    dismissAppPopup();
  };

  // Don't show popup if it has been dismissed or if not on home page
  if (state.appPopupDismissed || state.currentPage !== 'home') {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg max-w-md w-full p-6 relative animate-in fade-in-50 scale-in-95">
        <div className="text-center">
          <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
            <Smartphone className="h-8 w-8 text-blue-600" />
          </div>
          
          <h3 className="text-xl mb-2">Get the Best Deals!</h3>
          <p className="text-gray-600 mb-4">
            Download our mobile app for exclusive discounts up to 50% off!
          </p>
          
          <div className="flex items-center justify-center gap-1 mb-4">
            {[1, 2, 3, 4, 5].map(i => (
              <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
            ))}
            <span className="text-sm text-gray-600 ml-2">4.9 stars (10k+ reviews)</span>
          </div>
          
          <div className="space-y-3">
            <Button className="w-full bg-blue-600 hover:bg-blue-700">
              Download App Now
            </Button>
            <Button 
              variant="ghost" 
              className="w-full text-gray-500 text-sm"
              onClick={handleDismiss}
            >
              Maybe later
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}