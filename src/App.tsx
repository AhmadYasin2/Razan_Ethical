import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
} from "react-router-dom";
import { AppProvider } from "./components/AppContext";
import { Header } from "./components/Header";
import { Footer } from "./components/Footer";
import { EthicalBanner } from "./components/deceptive/UrgencyBanner";
import { HomePage } from "./components/pages/HomePage";
import { ProductPage } from "./components/pages/ProductPage";
import { CartPage } from "./components/pages/CartPage";
import { CheckoutPage } from "./components/pages/CheckoutPage";
import { ConfirmationPage } from "./components/pages/ConfirmationPage";
import { CategoryPage } from "./components/pages/CategoryPage";
import { SearchPage } from "./components/pages/SearchPage";

function AppLayout() {
  const location = useLocation();
  const isHome = location.pathname === "/";

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <EthicalBanner />

      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/:category" element={<CategoryPage />} />
        <Route path="/product/:id" element={<ProductPage />} />
        <Route path="/cart" element={<CartPage />} />
        <Route path="/checkout" element={<CheckoutPage />} />
        <Route path="/confirmation" element={<ConfirmationPage />} />
        <Route path="/search" element={<SearchPage />} />
      </Routes>

      {isHome && <Footer />}
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <Router>
        <AppLayout />
      </Router>
    </AppProvider>
  );
}
