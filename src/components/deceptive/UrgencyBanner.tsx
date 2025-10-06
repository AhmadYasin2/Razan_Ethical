import { Calendar, Info } from 'lucide-react';
import { Badge } from '../ui/badge';

export function EthicalBanner() {
  // Real promotion with accurate dates
  const promotionStart = new Date('2024-01-15');
  const promotionEnd = new Date('2024-01-22');
  const now = new Date();
  
  // Check if promotion is actually active
  const isPromotionActive = now >= promotionStart && now <= promotionEnd;
  
  if (!isPromotionActive) {
    return null;
  }

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <div className="bg-blue-50 border-b border-blue-200 py-3 px-4">
      <div className="max-w-7xl mx-auto flex items-center justify-center gap-3 text-blue-800">
        <Info className="h-4 w-4" />
        <div className="flex items-center gap-2 text-center text-sm">
          <span>Winter Sale - Up to 30% off selected items</span>
          <div className="flex items-center gap-1 bg-blue-100 px-2 py-1 rounded">
            <Calendar className="h-3 w-3" />
            <span className="text-xs">
              {formatDate(promotionStart)} - {formatDate(promotionEnd)}
            </span>
          </div>
        </div>
        <Badge variant="outline" className="border-blue-300 text-blue-700 bg-blue-50">
          Real Sale
        </Badge>
      </div>
    </div>
  );
}