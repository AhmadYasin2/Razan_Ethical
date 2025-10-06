import { useState, useRef, useEffect } from "react";
import { Search, ShoppingCart, Menu, X } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Badge } from "./ui/badge";
import { useNavigate } from "react-router-dom";
import Fuse from "fuse.js";
import { mockProducts } from "../data";

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
    navigate(`/product/${id}`);
    setIsFocused(false);
    setSuggestions([]);
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
        <div className="flex h-16 items-center justify-between relative">
          {/* Logo */}
          <div className="flex items-center space-x-4">
            <button
              onClick={handleLogoClick}
              className="text-2xl font-bold hover:opacity-80 transition-opacity"
            >
              StyleStore
            </button>
          </div>

          {/* Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            {[
              { label: "Women", path: "/women" },
              { label: "Men", path: "/men" },
              { label: "Kids", path: "/kids" },
              { label: "Sale", path: "/sale" },
            ].map(({ label, path }) => (
              <button
                key={path}
                onClick={() => navigate(path)}
                className="relative text-sm font-medium text-gray-800 transition-all duration-300 hover:text-blue-600 group"
              >
                {label}
                <span className="absolute left-0 bottom-[-4px] w-0 h-[2px] bg-blue-600 transition-all duration-300 group-hover:w-full"></span>
              </button>
            ))}
          </nav>

          {/* Search Bar */}
          <div
            className="hidden md:flex flex-1 max-w-md ml-8 relative"
            ref={dropdownRef}
          >
            <form onSubmit={handleSearchSubmit} className="w-full">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  type="search"
                  placeholder="Search products..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onFocus={() => setIsFocused(true)}
                  className="pl-10 pr-4"
                />
              </div>
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
                              ${item.price}
                            </p>
                          </div>
                        </button>
                      ))}
                    </div>

                    <div className="border-t p-2 text-center">
                      <button
                        onClick={() => {
                          navigate(
                            `/search?q=${encodeURIComponent(searchTerm.trim())}`
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

          {/* Cart + Menu */}
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="icon"
              className="relative"
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
              className="md:hidden"
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
