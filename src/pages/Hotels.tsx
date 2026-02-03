import { useState, useEffect } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { MapPin, Star, Search, Users, Phone, Image as ImageIcon } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { config } from "@/config/constants";
import { useTheme } from "@/contexts/ThemeContext";
import { Moon, Sun } from "lucide-react";

interface Hotel {
  _id: string;
  name: string;
  address: string;
  contact: string;
  images: string[];
  path: string;
  createdAt: string;
  updatedAt: string;
}

export default function Hotels() {
  const { theme, toggleTheme } = useTheme();
  const [hotels, setHotels] = useState<Hotel[]>([]);
  const [filteredHotels, setFilteredHotels] = useState<Hotel[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const { toast } = useToast();

  const apiBase = config.API_BASE;

  // Fetch all hotels
  const fetchHotels = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${apiBase}/hotel/all`);
      setHotels(response.data);
      setFilteredHotels(response.data);
    } catch (error) {
      console.error("Error fetching hotels:", error);
      toast({
        title: "Error",
        description: "Failed to load hotels. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Search filter
  useEffect(() => {
    if (searchTerm.trim() === "") {
      setFilteredHotels(hotels);
    } else {
      const filtered = hotels.filter(hotel =>
        hotel.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        hotel.address.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredHotels(filtered);
    }
  }, [searchTerm, hotels]);

  useEffect(() => {
    fetchHotels();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-6">
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading hotels...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-6">
        {/* Header Section */}
        <div className="flex justify-between items-start mb-8">
          <div>
            <h1 className="text-4xl font-bold text-primary mb-2">Discover Hotels</h1>
            <p className="text-muted-foreground text-lg">
              Find and book your perfect accommodation from our curated collection
            </p>
          </div>
          <Button
            variant="outline"
            size="icon"
            onClick={toggleTheme}
            className="bg-primary/10 hover:bg-primary/20 border-primary text-primary transition-all duration-300"
            aria-label="Toggle theme"
          >
            {theme === 'dark' ? (
              <Sun className="h-5 w-5" />
            ) : (
              <Moon className="h-5 w-5" />
            )}
          </Button>
        </div>

        {/* Search Bar */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Search hotels by name or location..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </CardContent>
        </Card>

        {/* Results Summary */}
        <div className="mb-6">
          <p className="text-muted-foreground">
            Showing {filteredHotels.length} of {hotels.length} hotels
          </p>
        </div>

        {/* Hotels Grid */}
        {filteredHotels.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <div className="mb-4">
                <ImageIcon className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">No hotels found</h3>
                <p className="text-muted-foreground">
                  {searchTerm ? "Try adjusting your search criteria." : "No hotels are currently available."}
                </p>
              </div>
              {searchTerm && (
                <Button
                  variant="outline"
                  onClick={() => setSearchTerm("")}
                  className="mt-4"
                >
                  Clear Search
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredHotels.map((hotel) => (
              <Card key={hotel._id} className="overflow-hidden hover:shadow-lg transition-shadow">
                {/* Hotel Image */}
                <div className="relative h-48 bg-gradient-to-br from-primary/20 to-primary/5">
                  {hotel.images && hotel.images.length > 0 ? (
                    <img
                      src={hotel.images[0]}
                      alt={hotel.name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        // Fallback to gradient if image fails to load
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <ImageIcon className="w-16 h-16 text-muted-foreground" />
                    </div>
                  )}
                  <div className="absolute top-4 left-4">
                    <Badge variant="secondary" className="bg-primary/90 text-primary-foreground">
                      Featured
                    </Badge>
                  </div>
                </div>

                <CardHeader className="pb-2">
                  <CardTitle className="text-xl font-bold text-primary line-clamp-1">
                    {hotel.name}
                  </CardTitle>
                </CardHeader>

                <CardContent className="space-y-4">
                  {/* Location */}
                  <div className="flex items-start gap-2">
                    <MapPin className="w-4 h-4 text-muted-foreground mt-1 flex-shrink-0" />
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {hotel.address}
                    </p>
                  </div>

                  {/* Contact */}
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">
                      {hotel.contact}
                    </p>
                  </div>

                  {/* Rating */}
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-4 h-4 ${i < 4 ? 'text-yellow-400 fill-current' : 'text-gray-300'
                            }`}
                        />
                      ))}
                    </div>
                    <span className="text-sm text-muted-foreground">(4.0)</span>
                  </div>

                  {/* Hotel Path Info */}
                  <div className="bg-muted p-3 rounded-lg">
                    <p className="text-xs text-muted-foreground mb-1">Hotel ID</p>
                    <p className="text-sm font-mono">{hotel.path}</p>
                  </div>

                  {/* Action Button */}
                  <Link to={`/hotels/${hotel.path}`} className="block">
                    <Button className="w-full" size="lg">
                      <Users className="w-4 h-4 mr-2" />
                      View Details & Book
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Call to Action */}
        {hotels.length > 0 && (
          <Card className="mt-12 bg-primary/5 border-primary/20">
            <CardContent className="p-8 text-center">
              <h2 className="text-2xl font-bold text-primary mb-2">
                Don't see your hotel?
              </h2>
              <p className="text-muted-foreground mb-4">
                More hotels are being added regularly. Check back soon!
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}