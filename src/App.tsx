import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
} from "react-router-dom";
import { AppProvider } from "./components/AppContext";
import { TrackingProvider } from "./tracking/TrackingContext";
import { Header } from "./components/Header";
import { Footer } from "./components/Footer";
import { HomePage } from "./components/pages/HomePage";
import { ProductPage } from "./components/pages/ProductPage";
import { CartPage } from "./components/pages/CartPage";
import { CheckoutPage } from "./components/pages/CheckoutPage";
import { ConfirmationPage } from "./components/pages/ConfirmationPage";
import { CategoryPage } from "./components/pages/CategoryPage";
import { SearchPage } from "./components/pages/SearchPage";
import CalibrationPage from "./components/pages/CalibrationPage";
import ResearchPage from "./components/pages/ResearchPage";
import { WebGazerWrapper } from "./tracking/WebGazerWrapper";
import { HeatmapVisualizer } from "./components/HeatmapVisualizer";
import { useAppContext } from "./components/AppContext";

function AppLayout() {
  const { state, closeHeatmapVisualizer } = useAppContext();
  const location = useLocation();
  const isHome = location.pathname === "/";
  const hideHeader = location.pathname.startsWith("/calibration");

  return (
    <div className="min-h-screen bg-background">
      {!hideHeader && <Header />}

      <WebGazerWrapper>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/:category" element={<CategoryPage />} />
          <Route path="/product/:id" element={<ProductPage />} />
          <Route path="/cart" element={<CartPage />} />
          <Route path="/checkout" element={<CheckoutPage />} />
          <Route path="/confirmation" element={<ConfirmationPage />} />
          <Route path="/search" element={<SearchPage />} />
          <Route path="/research" element={<ResearchPage />} />

          {/* ✅ Calibration page */}
          <Route path="/calibration" element={<CalibrationPage />} />
        </Routes>
      </WebGazerWrapper>

      {isHome && <Footer />}

      {/* Global heatmap visualizer - persists across navigation */}
      {state.heatmapVisualizer.isOpen && (
        <HeatmapVisualizer onClose={closeHeatmapVisualizer} />
      )}
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <TrackingProvider>
        <Router>
          <AppLayout />
        </Router>
      </TrackingProvider>
    </AppProvider>
  );
}
