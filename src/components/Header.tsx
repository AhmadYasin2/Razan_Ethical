import { useState, useRef, useEffect } from "react";
import { Search, ShoppingCart, Menu, X, Eye } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Badge } from "./ui/badge";
import { useNavigate } from "react-router-dom";
import Fuse from "fuse.js";
import { mockProducts } from "../data";
import { useAppContext } from "./AppContext";

interface HeaderProps {
  cartItemCount?: number;
}

export function Header({ cartItemCount = 0 }: HeaderProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [isFocused, setIsFocused] = useState(false);
  const navigate = useNavigate();
  const dropdownRef = useRef<HTMLDivElement | null>(null);
  const { state, endWebGazerSession, setSelectedProduct } = useAppContext();

  // Setup fuzzy search
  const fuse = new Fuse(mockProducts, {
    keys: ["name", "category"],
    threshold: 0.4, // lower = stricter match
  });

  const handleCartClick = () => navigate("/cart");
  const handleLogoClick = () => navigate("/");

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchTerm.trim())}`);
      setIsFocused(false);
      setSuggestions([]);
    }
  };

  const handleProductClick = (id: string) => {
    const product = mockProducts.find((p) => p.id === id);
    if (product) {
      setSelectedProduct(product);
      navigate(`/product/${id}`);
      setIsFocused(false);
      setSuggestions([]);
    }
  };

  const handleFinishSession = () => {
    navigate("/research");
  };

  // Fuzzy search while typing
  useEffect(() => {
    if (searchTerm.trim()) {
      const results = fuse.search(searchTerm).map((r) => r.item);
      setSuggestions(results.slice(0, 5));
    } else {
      setSuggestions([]);
    }
  }, [searchTerm]);

  // Hide dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsFocused(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center gap-4">
          {/* Logo */}
          <div className="flex-shrink-0">
            <button
              onClick={handleLogoClick}
              className="text-2xl font-bold hover:opacity-80 transition-opacity"
            >
              StyleStore
            </button>
          </div>

          {/* Navigation */}
          <nav className="hidden md:flex items-center gap-6 lg:gap-8">
            {[
              { label: "Women", path: "/women" },
              { label: "Men", path: "/men" },
              { label: "Kids", path: "/kids" },
              { label: "Sale", path: "/sale" },
            ].map(({ label, path }) => (
              <button
                key={path}
                onClick={() => navigate(path)}
                className="relative text-sm font-medium text-gray-800 transition-all duration-300 hover:text-blue-600 group whitespace-nowrap"
              >
                {label}
                <span className="absolute left-0 bottom-[-4px] w-0 h-[2px] bg-blue-600 transition-all duration-300 group-hover:w-full"></span>
              </button>
            ))}
          </nav>

          {/* Spacer */}
          <div className="flex-1"></div>

          {/* Search Bar + Cart + Menu */}
          <div className="flex items-center gap-3 flex-shrink-0">
            {/* Search Bar */}
            <div className="relative" ref={dropdownRef}>
              <form onSubmit={handleSearchSubmit}>
                <Input
                  type="search"
                  placeholder="Search products..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onFocus={() => setIsFocused(true)}
                  className="w-48 sm:w-56 lg:w-80"
                />
              </form>

              {/* Live Suggestions */}
              {isFocused && (
                <div
                  className="absolute left-0 right-0 mt-2 bg-background border rounded-lg shadow-lg z-50"
                  style={{ top: "100%" }}
                >
                  {suggestions.length > 0 ? (
                    <>
                      <div className="max-h-64 w-full overflow-auto">
                        {suggestions.map((item) => (
                          <button
                            key={item.id}
                            onClick={() => handleProductClick(item.id)}
                            className="w-full text-left px-4 py-2 hover:bg-accent transition-colors flex items-center space-x-3"
                          >
                            <img
                              src={item.image}
                              alt={item.name}
                              className="w-10 h-10 object-cover rounded-md"
                            />
                            <div>
                              <p className="font-medium">{item.name}</p>
                              <p className="text-sm text-muted-foreground">
                                JOD{item.price}
                              </p>
                            </div>
                          </button>
                        ))}
                      </div>

                      <div className="border-t p-2 text-center">
                        <button
                          onClick={() => {
                            navigate(
                              `/search?q=${encodeURIComponent(
                                searchTerm.trim()
                              )}`
                            );
                            setIsFocused(false);
                          }}
                          className="text-sm font-medium text-primary hover:underline"
                        >
                          See more results
                        </button>
                      </div>
                    </>
                  ) : (
                    <div className="px-4 py-3 text-sm text-muted-foreground text-center">
                      No results found
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Finish Session Button */}
            {state.webGazerSession.isActive &&
              state.webGazerSession.isCalibrated && (
                <Button
                  variant="default"
                  size="sm"
                  onClick={handleFinishSession}
                  className="bg-blue-600 hover:bg-blue-700 flex items-center gap-2 whitespace-nowrap"
                >
                  <Eye className="h-4 w-4" />
                  <span className="hidden lg:inline">Finish Session</span>
                  <span className="lg:hidden">End</span>
                </Button>
              )}

            <Button
              variant="ghost"
              size="icon"
              className="relative flex-shrink-0"
              onClick={handleCartClick}
            >
              <ShoppingCart className="h-5 w-5" />
              {cartItemCount > 0 && (
                <Badge
                  variant="destructive"
                  className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0 flex items-center justify-center text-xs"
                >
                  {cartItemCount}
                </Badge>
              )}
            </Button>

            {/* Mobile Menu Button */}
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden flex-shrink-0"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}
