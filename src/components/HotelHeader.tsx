import { MapPin, Phone, Star, Moon, Sun } from "lucide-react";
import React, { useEffect, useState } from "react";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/contexts/ThemeContext";
import { config } from "@/config/constants";

const HotelHeader: React.FC = () => {
  const { theme, toggleTheme } = useTheme();


  const [hotel, setHotel] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);



const hotelId = config.HOTEL_ID;
const apiBase = config.API_BASE;




  useEffect(() => {
    const fetchHotel = async () => {
      try {
        const res = await axios.get(`${apiBase}/hotel/${hotelId}`);
        setHotel(res.data);
        setError(null);
      } catch (err: any) {
        console.error("Error fetching hotel:", err);
        // Fallback to mock data if API fails
        setHotel({
          name: "Sonachala Hotel",
          location: "Friends Colony, Tiruvannamalai",
          description: "A peaceful retreat in the foothills of Arunachala. Experience spiritual rejuvenation amidst serene surroundings.",
          contact: "+91-XXXX-XXXXXX",
          address: "Friends Colony, Tiruvannamalai, Tamil Nadu, India - 606601",
          stars: 5
        });
        setError(null);
      } finally {
        setLoading(false);
      }
    };
    fetchHotel();
  }, [hotelId, apiBase]);

  return (
    <div className="bg-gradient-to-r from-card to-card/95 border-b-4 border-primary py-6 transition-colors duration-300">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="flex-1">
            {loading ? (
              <h1>Loading hotel details...</h1>
            ) : error ? (
              <h1>{error}</h1>
            ) : hotel ? (
              <>
                <h1 className="text-3xl md:text-4xl font-bold mb-2 text-primary">{hotel.name}</h1>
                <div className="flex items-center gap-1 mb-2">
                  {[...Array(hotel.stars || 5)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 fill-primary text-primary" />
                  ))}
                </div>
                <div className="flex flex-col md:flex-row gap-4 text-sm text-foreground">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-primary" />
                    <span>{hotel.address || "No address provided"}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-primary" />
                    <span>{hotel.contact || "No phone provided"}</span>
                    
                  </div>
                </div>
                {hotel.description && <p className="mt-2 text-foreground">{hotel.description}</p>}
              </>
            ) : (
              <h1>No hotel data found.</h1>
            )}
          </div>
          
          {/* Theme Toggle Button */}
          <div className="flex items-center gap-2">
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
        </div>
      </div>
    </div>
  );
 
};

export default HotelHeader;
