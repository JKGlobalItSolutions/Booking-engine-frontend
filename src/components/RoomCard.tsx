import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Users, Bed, Wifi, Car, Coffee, ShowerHead, AlertTriangle } from "lucide-react";
import { Hotel } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useState, useEffect } from "react";

interface RoomSelection {
  roomId: string;
  roomCount: number;
  adults: number;
  childAge5to12: number;
  childBelow5: number;
}

interface RoomCardProps {
  id: string;
  name: string;
  image: string;
  description: string;
  roomDescription: string;
  price: number;
  originalPrice?: number;
  features: string[];
  capacity: number;
  bedType: string;
  isPopular?: boolean;
  availableCount?: number;
  maxAvailableRooms: number;
  perAdultPrice?: number;
  perChildPrice?: number;
  nights: number;
  isSoldOut?: boolean;
  selection: RoomSelection;
  onSelectionChange: (roomId: string, selection: RoomSelection) => void;
}

export const RoomCard = ({
  id,
  name,
  image,
  description,
  roomDescription,
  price,
  originalPrice,
  features,
  capacity,
  bedType,
  isPopular,
  availableCount,
  maxAvailableRooms,
  perAdultPrice = 0,
  perChildPrice = 0,
  nights,
  isSoldOut,
  selection,
  onSelectionChange,
}: RoomCardProps) => {
  const [localSelection, setLocalSelection] = useState<RoomSelection>(selection);

  useEffect(() => {
    setLocalSelection(selection);
  }, [selection]);

  const handleRoomCountChange = (value: string) => {
    const count = parseInt(value);
    const newSelection = { ...localSelection, roomCount: count };
    if (count === 0) {
      newSelection.adults = 0;
      newSelection.childAge5to12 = 0;
      newSelection.childBelow5 = 0;
    }
    setLocalSelection(newSelection);
    onSelectionChange(id, newSelection);
  };

  const handleGuestChange = (field: 'adults' | 'childAge5to12' | 'childBelow5', value: string) => {
    const newSelection = { ...localSelection, [field]: parseInt(value) };
    setLocalSelection(newSelection);
    onSelectionChange(id, newSelection);
  };

  // Calculate room price for selected nights
  const calculateRoomPrice = () => {
    if (localSelection.roomCount === 0) return 0;
    
    const roomCharges = (price || 0) * nights * localSelection.roomCount;
    const adultCharges = localSelection.adults * perAdultPrice;
    const childCharges = (localSelection.childAge5to12 + localSelection.childBelow5) * perChildPrice;
    
    return roomCharges + adultCharges + childCharges;
  };

  const totalPrice = calculateRoomPrice();

  const getFeatureIcon = (feature: string) => {
    switch (feature.toLowerCase()) {
      case 'wi-fi':
        return <Wifi className="w-4 h-4" />;
      case 'parking':
        return <Car className="w-4 h-4" />;
      case 'breakfast':
        return <Coffee className="w-4 h-4" />;
      case 'ensuite bathroom':
        return <ShowerHead className="w-4 h-4" />;
      default:
        return null;
    }
  };

  return (
    <Card className={`overflow-hidden transition-all duration-300 ${isSoldOut ? 'opacity-60' : 'hover:shadow-lg hover:shadow-primary/20'} ${localSelection.roomCount > 0 ? 'border-2 border-primary bg-card' : 'bg-card'}`}>
      <div className="md:flex">
        <div className="md:w-1/3 relative">
          <img
            src={image}
            alt={name}
            className="w-50 h-50 md:h-full object-cover"
          />
        </div>

        <CardContent className="md:w-2/3 p-6">
          <div className="flex justify-between items-start mb-3">
            <div>
      

<h3 className="flex items-center gap-2 text-xl font-bold text-primary mb-1">
  <Hotel className="w-5 h-5 text-primary" />
  {name}
</h3>

              <div className="mb-2">
                <p className="text-sm text-muted-foreground mb-2">{roomDescription}</p>
                <Dialog>
                  <DialogTrigger asChild>
                    <button className="text-sm text-blue-600 hover:text-blue-800 ">
                      See More...
                    </button>
                  </DialogTrigger>
                  <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle className="text-2xl font-bold text-primary flex items-center gap-2">
                        <Hotel className="w-6 h-6 text-primary" />
                        {name}
                      </DialogTitle>
                    </DialogHeader>
                    <div className="space-y-6">
                      {/* Images Section */}
                      <div className="grid grid-cols-3 gap-4">
                        <div className="col-span-2">
                          <img
                            src={image}
                            alt={name}
                            className="w-full h-64 object-cover rounded-lg"
                          />
                        </div>
                        <div className="space-y-2">
                          <img
                            src={image}
                            alt={`${name} - another view`}
                            className="w-full h-30 object-cover rounded-lg"
                          />
                        </div>
                      </div>

                      {/* Description Section */}
                      <div className="space-y-4">
                        <div>
                          <p className="text-muted-foreground leading-relaxed">
                            {roomDescription}
                          </p>
                        </div>

                        {/* Facilities Section */}
                        <div className="space-y-4">
                          <h3 className="text-lg font-semibold text-gray-900">Facilities</h3>
                          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                            {[
                              "24/7 Hot water",
                              "AC",
                              "Attached Bathroom",
                              "Cable TV",
                              "Direct Phone",
                              "Double/Twin Beds",
                              "High speed WiFi internet",
                              "Iron with ironing board (on request)",
                              "LCD TV",
                              "Smoke Detector Alarms",
                              "Tea/Coffee Maker",
                              "24/7 room service",
                              "Complimentary Packaged Water Bottles",
                              "Direct-Dialing Phone",
                              "Double Bed",
                              "Hair Dryer",
                              "High Speed Wi-Fi Internet(chargable)",
                              "Kettle",
                              "King Bed",
                              "Marble Flooring",
                              "Shower",
                              "Sound proof windows",
                              "Study Table",
                              "Work Desk",
                              "Complimentary toiletries",
                              "Internet"
                            ].map((facility, index) => (
                              <div key={index} className="flex items-center gap-2">
                                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                <span className="text-sm text-gray-700">{facility}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-primary">
                ₹{(price ?? 0).toLocaleString()}
                <span className="text-sm font-normal text-muted-foreground ml-1">per night</span>
              </div>
              {originalPrice !== undefined && originalPrice !== null && (
                <div className="text-sm text-muted-foreground line-through">
                  ₹{(originalPrice ?? 0).toLocaleString()}
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center gap-4 mb-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <Users className="w-4 h-4" />
              <span>{capacity} Guests</span>
            </div>
            <div className="flex items-center gap-1">
              <Bed className="w-4 h-4" />
              <span>{bedType}</span>
            </div>
          </div>

          {/* Room Selection Section */}
          {!isSoldOut && (
            <div className="bg-muted/50 p-4 rounded-lg mb-4 space-y-4 border border-border">
              <div className="grid grid-cols-4 gap-3">
                <div>
                  <label className="text-xs font-semibold text-primary mb-1 block">Select Room</label>
                  <Select value={localSelection.roomCount.toString()} onValueChange={handleRoomCountChange}>
                    <SelectTrigger className="bg-background border-border focus:border-primary focus:ring-primary">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Array.from({ length: maxAvailableRooms + 1 }, (_, i) => (
                        <SelectItem key={i} value={i.toString()}>
                          {i}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {localSelection.roomCount > 0 && (
                  <>
                    <div>
                      <label className="text-xs font-semibold text-primary mb-1 block">Adults</label>
                      <Select value={localSelection.adults.toString()} onValueChange={(v) => handleGuestChange('adults', v)}>
                        <SelectTrigger className="bg-background border-border focus:border-primary focus:ring-primary">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {Array.from({ length: 11 }, (_, i) => (
                            <SelectItem key={i} value={i.toString()}>
                              {i}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <label className="text-xs font-semibold text-primary mb-1 block">Child (5-12yrs)</label>
                      <Select value={localSelection.childAge5to12.toString()} onValueChange={(v) => handleGuestChange('childAge5to12', v)}>
                        <SelectTrigger className="bg-background border-border focus:border-primary focus:ring-primary">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {Array.from({ length: 11 }, (_, i) => (
                            <SelectItem key={i} value={i.toString()}>
                              {i}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <label className="text-xs font-semibold text-primary mb-1 block">Child (below 5yrs)</label>
                      <Select value={localSelection.childBelow5.toString()} onValueChange={(v) => handleGuestChange('childBelow5', v)}>
                        <SelectTrigger className="bg-background border-border focus:border-primary focus:ring-primary">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {Array.from({ length: 11 }, (_, i) => (
                            <SelectItem key={i} value={i.toString()}>
                              {i}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </>
                )}
              </div>

              {localSelection.roomCount > 0 && (
                <div className="bg-primary/10 p-3 rounded border-2 border-primary">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-semibold text-foreground">Room Price</span>
                    <span className="text-sm text-muted-foreground">for {nights} night{nights !== 1 ? 's' : ''}</span>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-primary">
                      INR {totalPrice.toLocaleString()}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </div>
      {isSoldOut && (
        <div className="bg-red-50 text-red-800 p-3 flex items-center justify-center border-t">
          <AlertTriangle className="h-4 w-4 mr-2" />
          <span className="text-sm font-medium">{name} is sold out on selected dates</span>
        </div>
      )}
    </Card>
  );
};
