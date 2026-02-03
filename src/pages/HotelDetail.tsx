import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import axios from "axios";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, MapPin, Star, Users, Phone, Image as ImageIcon } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { config } from "@/config/constants";
import { HotelBooking } from "@/components/HotelBooking";
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

export default function HotelDetail() {
  const { hotelPath } = useParams<{ hotelPath: string }>();
  const [hotel, setHotel] = useState<Hotel | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const { theme, toggleTheme } = useTheme();

  const apiBase = config.API_BASE;

  // Fetch hotel by path
  const fetchHotel = async () => {
    if (!hotelPath) {
      setError("Hotel path not provided");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const response = await axios.get(`${apiBase}/hotel/path/${hotelPath}`);
      setHotel(response.data);
    } catch (err: any) {
      console.error("Error fetching hotel:", err);
      if (err.response?.status === 404) {
        setError("Hotel not found");
      } else {
        setError("Failed to load hotel details");
      }
      toast({
        title: "Error",
        description: "Failed to load hotel details. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHotel();
  }, [hotelPath]);

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-6">
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading hotel details...</p>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error || !hotel) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-6">
          <Card>
            <CardContent className="p-12 text-center">
              <div className="mb-4">
                <ImageIcon className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">{error || "Hotel not found"}</h3>
                <p className="text-muted-foreground mb-4">
                  The hotel you're looking for doesn't exist or may have been removed.
                </p>
                {/* <Link to="/hotels">
                  <Button variant="outline">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to Hotels
                  </Button>
                </Link> */}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header with back button */}
      <div className="container mx-auto px-4 py-6">
        <div className="mb-6 flex justify-between items-center">
          {/* <Link to="/hotels">
            <Button variant="outline" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Hotels
            </Button>
          </Link> */}

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

        {/* Hotel Header */}
        <Card className="mb-6 overflow-hidden">
          <div className="relative h-64 md:h-80 bg-gradient-to-br from-primary/20 to-primary/5">
            {hotel.images && hotel.images.length > 0 ? (
              <img
                src={hotel.images[0]}
                alt={hotel.name}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                }}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <ImageIcon className="w-24 h-24 text-muted-foreground" />
              </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
            <div className="absolute bottom-6 left-6 text-white">
              <h1 className="text-3xl md:text-4xl font-bold mb-2">{hotel.name}</h1>
              <div className="flex items-center gap-2">
                <MapPin className="w-5 h-5" />
                <span className="text-lg">{hotel.address}</span>
              </div>
            </div>
            <div className="absolute top-6 right-6">
              {/* <Badge variant="secondary" className="bg-primary/90 text-primary-foreground">
                <Star className="w-3 h-3 mr-1" />
                Featured
              </Badge> */}
            </div>
          </div>

          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Hotel Info */}
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold mb-2">Contact Information</h3>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Phone className="w-4 h-4" />
                    <span>{hotel.contact}</span>
                  </div>
                </div>

                {/* <div>
                  <h3 className="text-lg font-semibold mb-2">Hotel ID</h3>
                  <p className="text-sm font-mono bg-muted p-2 rounded">
                    {hotel.path}
                  </p>
                </div> */}
              </div>

              {/* Rating and Features */}
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold mb-2">Rating</h3>
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-5 h-5 ${i < 4 ? 'text-yellow-400 fill-current' : 'text-gray-300'
                            }`}
                        />
                      ))}
                    </div>
                    <span className="text-muted-foreground">(4.0) • Excellent</span>
                  </div>
                </div>

                {/* <div>
                  <h3 className="text-lg font-semibold mb-2">Features</h3>
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="outline">Free WiFi</Badge>
                    <Badge variant="outline">24/7 Service</Badge>
                    <Badge variant="outline">Premium Location</Badge>
                    <Badge variant="outline">Best Price</Badge>
                  </div>
                </div> */}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Hotel Gallery */}
        {hotel.images && hotel.images.length > 1 && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Gallery</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {hotel.images.slice(1, 5).map((image, index) => (
                  <div
                    key={index}
                    className="aspect-square overflow-hidden rounded-lg cursor-pointer hover:opacity-80 transition-opacity"
                    onClick={() => window.open(image, '_blank')}
                  >
                    <img
                      src={image}
                      alt={`${hotel.name} gallery ${index + 1}`}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Room Booking Section - Integrated */}
        <div className="mb-6">
          <HotelBooking hotelId={hotel._id} />
        </div>

        {/* Additional Information */}
        <Card>
          <CardHeader>
            <CardTitle>About This Hotel</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="prose prose-gray max-w-none">
              <p className="text-muted-foreground">
                Experience exceptional hospitality at {hotel.name}. Located in the heart of {hotel.address},
                our hotel offers comfortable accommodations with modern amenities and personalized service.
              </p>
              <p className="text-muted-foreground mt-4">
                Whether you're traveling for business or leisure, we provide everything you need for a memorable stay.
                Our prime location puts you close to major attractions, business centers, and transportation hubs.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}