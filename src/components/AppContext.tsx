import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Product } from './ProductCard';

export interface CartItem {
  
  product: Product;
  size?: string;
  color?: string;
  quantity: number;
  addOns: {
    warranty?: boolean;
    insurance?: boolean;
    premiumSupport?: boolean;
  };
}

interface AppState {
  currentPage: 'home' | 'product' | 'cart' | 'checkout' | 'confirmation';
  selectedProduct: Product | null;
  cartItems: CartItem[];
  showAppPopup: boolean;
  appPopupDismissed: boolean; // Track if popup was permanently dismissed
  urgencyTimer: number;
  userAccount: {
    email?: string;
    hasAccount?: boolean;
    premiumTrial?: boolean;
  };
  orderTotal: number;
  hiddenFees: {
    serviceCharge?: number;
    handlingFee?: number;
    processingFee?: number;
  };
}

interface AppContextType {
  state: AppState;
  setCurrentPage: (page: AppState['currentPage']) => void;
  setSelectedProduct: (product: Product | null) => void;
  addToCart: (item: CartItem) => void;
  removeFromCart: (index: number) => void;
  updateCartItem: (index: number, updates: Partial<CartItem>) => void;
  setShowAppPopup: (show: boolean) => void;
  dismissAppPopup: () => void; // Permanently dismiss popup
  setUrgencyTimer: (time: number) => void;
  setUserAccount: (account: Partial<AppState['userAccount']>) => void;
  setOrderTotal: (total: number) => void;
  setHiddenFees: (fees: AppState['hiddenFees']) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, setState] = useState<AppState>({
    currentPage: 'home',
    selectedProduct: null,
    cartItems: [],
    showAppPopup: true,
    appPopupDismissed: false, // Initially, the popup is not dismissed
    urgencyTimer: 300, // 5 minutes in seconds
    userAccount: {},
    orderTotal: 0,
    hiddenFees: {}
  });

  const setCurrentPage = (page: AppState['currentPage']) => {
    setState(prev => ({ ...prev, currentPage: page }));
  };

  const setSelectedProduct = (product: Product | null) => {
    setState(prev => ({ ...prev, selectedProduct: product }));
  };

  const addToCart = (item: CartItem) => {
    setState(prev => ({
      ...prev,
      cartItems: [...prev.cartItems, item]
    }));
  };

  const removeFromCart = (index: number) => {
    setState(prev => ({
      ...prev,
      cartItems: prev.cartItems.filter((_, i) => i !== index)
    }));
  };

  const updateCartItem = (index: number, updates: Partial<CartItem>) => {
    setState(prev => ({
      ...prev,
      cartItems: prev.cartItems.map((item, i) => 
        i === index ? { ...item, ...updates } : item
      )
    }));
  };

  const setShowAppPopup = (show: boolean) => {
    setState(prev => ({ ...prev, showAppPopup: show }));
  };

  const dismissAppPopup = () => {
    setState(prev => ({ ...prev, appPopupDismissed: true, showAppPopup: false }));
  };

  const setUrgencyTimer = (time: number) => {
    setState(prev => ({ ...prev, urgencyTimer: time }));
  };

  const setUserAccount = (account: Partial<AppState['userAccount']>) => {
    setState(prev => ({
      ...prev,
      userAccount: { ...prev.userAccount, ...account }
    }));
  };

  const setOrderTotal = (total: number) => {
    setState(prev => ({ ...prev, orderTotal: total }));
  };

  const setHiddenFees = (fees: AppState['hiddenFees']) => {
    setState(prev => ({ ...prev, hiddenFees: fees }));
  };

  const contextValue: AppContextType = {
    state,
    setCurrentPage,
    setSelectedProduct,
    addToCart,
    removeFromCart,
    updateCartItem,
    setShowAppPopup,
    dismissAppPopup,
    setUrgencyTimer,
    setUserAccount,
    setOrderTotal,
    setHiddenFees
  };

  return (
    <AppContext.Provider value={contextValue}>
      {children}
    </AppContext.Provider>
  );
};