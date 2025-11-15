import React, { createContext, useContext, useState, ReactNode } from "react";
import { Product } from "./ProductCard";

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
  currentPage: "home" | "product" | "cart" | "checkout" | "confirmation";
  selectedProduct: Product | null;
  cartItems: CartItem[];
  showAppPopup: boolean;
  appPopupDismissed: boolean;
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
  webGazerSession: {
    isActive: boolean;
    isCalibrated: boolean;
    modelData: any;
    startTime: number | null;
  };
  heatmapVisualizer: {
    isOpen: boolean;
    sessionData: any | null;
  };
}

interface AppContextType {
  state: AppState;
  setCurrentPage: (page: AppState["currentPage"]) => void;
  setSelectedProduct: (product: Product | null) => void;
  addToCart: (item: CartItem) => void;
  removeFromCart: (index: number) => void;
  updateCartItem: (index: number, updates: Partial<CartItem>) => void;
  setShowAppPopup: (show: boolean) => void;
  dismissAppPopup: () => void;
  setUrgencyTimer: (time: number) => void;
  setUserAccount: (account: Partial<AppState["userAccount"]>) => void;
  setOrderTotal: (total: number) => void;
  setHiddenFees: (fees: AppState["hiddenFees"]) => void;
  startWebGazerSession: () => void;
  endWebGazerSession: () => void;
  setWebGazerCalibrated: () => void;
  openHeatmapVisualizer: () => void;
  closeHeatmapVisualizer: () => void;
  setHeatmapSessionData: (data: any) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useAppContext must be used within an AppProvider");
  }
  return context;
};

export const AppProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [state, setState] = useState<AppState>({
    currentPage: "home",
    selectedProduct: null,
    cartItems: [],
    showAppPopup: true,
    appPopupDismissed: false,
    urgencyTimer: 300,
    userAccount: {},
    orderTotal: 0,
    hiddenFees: {},
    webGazerSession: {
      isActive: false,
      isCalibrated: false,
      modelData: null,
      startTime: null,
    },
    heatmapVisualizer: {
      isOpen: false,
      sessionData: null,
    },
  });

  const setCurrentPage = (page: AppState["currentPage"]) => {
    setState((prev) => ({ ...prev, currentPage: page }));
  };

  const setSelectedProduct = (product: Product | null) => {
    setState((prev) => ({ ...prev, selectedProduct: product }));
  };

  const addToCart = (item: CartItem) => {
    setState((prev) => ({
      ...prev,
      cartItems: [...prev.cartItems, item],
    }));
  };

  const removeFromCart = (index: number) => {
    setState((prev) => ({
      ...prev,
      cartItems: prev.cartItems.filter((_, i) => i !== index),
    }));
  };

  const updateCartItem = (index: number, updates: Partial<CartItem>) => {
    setState((prev) => ({
      ...prev,
      cartItems: prev.cartItems.map((item, i) =>
        i === index ? { ...item, ...updates } : item
      ),
    }));
  };

  const setShowAppPopup = (show: boolean) => {
    setState((prev) => ({ ...prev, showAppPopup: show }));
  };

  const dismissAppPopup = () => {
    setState((prev) => ({
      ...prev,
      appPopupDismissed: true,
      showAppPopup: false,
    }));
  };

  const setUrgencyTimer = (time: number) => {
    setState((prev) => ({ ...prev, urgencyTimer: time }));
  };

  const setUserAccount = (account: Partial<AppState["userAccount"]>) => {
    setState((prev) => ({
      ...prev,
      userAccount: { ...prev.userAccount, ...account },
    }));
  };

  const setOrderTotal = (total: number) => {
    setState((prev) => ({ ...prev, orderTotal: total }));
  };

  const setHiddenFees = (fees: AppState["hiddenFees"]) => {
    setState((prev) => ({ ...prev, hiddenFees: fees }));
  };

  const startWebGazerSession = () => {
    const calibrated = localStorage.getItem("webgazerCalibrated") === "true";

    setState((prev) => ({
      ...prev,
      webGazerSession: {
        isActive: true,
        isCalibrated: calibrated,
        modelData: null,
        startTime: Date.now(),
      },
    }));
  };

  const setWebGazerCalibrated = () => {
    setState((prev) => ({
      ...prev,
      webGazerSession: {
        ...prev.webGazerSession,
        isCalibrated: true,
      },
    }));
  };

  const endWebGazerSession = () => {
    setState((prev) => ({
      ...prev,
      webGazerSession: {
        isActive: false,
        isCalibrated: false,
        modelData: null,
        startTime: null,
      },
    }));
  };

  const openHeatmapVisualizer = () => {
    setState((prev) => ({
      ...prev,
      heatmapVisualizer: {
        ...prev.heatmapVisualizer,
        isOpen: true,
      },
    }));
  };

  const closeHeatmapVisualizer = () => {
    setState((prev) => ({
      ...prev,
      heatmapVisualizer: {
        isOpen: false,
        sessionData: null,
      },
    }));
  };

  const setHeatmapSessionData = (data: any) => {
    setState((prev) => ({
      ...prev,
      heatmapVisualizer: {
        ...prev.heatmapVisualizer,
        sessionData: data,
      },
    }));
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
    setHiddenFees,
    startWebGazerSession,
    endWebGazerSession,
    setWebGazerCalibrated,
    openHeatmapVisualizer,
    closeHeatmapVisualizer,
    setHeatmapSessionData,
  };

  return (
    <AppContext.Provider value={contextValue}>{children}</AppContext.Provider>
  );
};
