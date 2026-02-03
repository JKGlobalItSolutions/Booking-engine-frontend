import { Calendar, Users, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";

interface SearchBarProps {
  checkIn: string;
  checkOut: string;
  rooms: number;
  adults: number;
  children: number;
  onCheckInChange: (date: string) => void;
  onCheckOutChange: (date: string) => void;
  onRoomsChange: (rooms: number) => void;
  onAdultsChange: (adults: number) => void;
  onChildrenChange: (children: number) => void;
  onSearch: () => void;
  maxRooms?: number;
}

export const SearchBar = ({
  checkIn,
  checkOut,
  rooms,
  adults,
  children,
  onCheckInChange,
  onCheckOutChange,
  onRoomsChange,
  onAdultsChange,
  onChildrenChange,
  onSearch,
  maxRooms,
}: SearchBarProps) => {
  const calculateNights = () => {
    if (checkIn && checkOut) {
      const start = new Date(checkIn);
      const end = new Date(checkOut);
      const diffTime = Math.abs(end.getTime() - start.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return diffDays;
    }
    return 0;
  };

  return (
    <Card className="p-6 mb-6 bg-card shadow-lg">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-7 gap-4 items-end">
        <div className="lg:col-span-2">
          <Label htmlFor="checkin">Check-in</Label>
          <div className="relative">
            <Calendar className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              id="checkin"
              type="date"
              value={checkIn}
              onChange={(e) => onCheckInChange(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        
        <div className="lg:col-span-2">
          <Label htmlFor="checkout">Check-out</Label>
          <div className="relative">
            <Calendar className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              id="checkout"
              type="date"
              value={checkOut}
              onChange={(e) => onCheckOutChange(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        
        <div>
          <Label>Nights</Label>
          <div className="h-10 flex items-center px-3 bg-muted rounded-md text-sm font-medium">
            {calculateNights()}
          </div>
        </div>
        
        <div>
          <Label htmlFor="rooms">Rooms</Label>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => onRoomsChange(Math.max(1, rooms - 1))}>-</Button>
            <Input
              id="rooms"
              type="number"
              min="1"
              max={maxRooms}
              value={rooms}
              onChange={(e) => onRoomsChange(Math.max(1, Math.min(maxRooms || Infinity, Number(e.target.value))))}
              className="w-16 text-center"
            />
            <Button variant="outline" size="sm" onClick={() => onRoomsChange(Math.min(maxRooms || Infinity, rooms + 1))} disabled={rooms >= (maxRooms || Infinity)}>+</Button>
          </div>
        </div>
        
        <div>
          <Label htmlFor="adults">Adults</Label>
          <Input
            id="adults"
            type="number"
            min="1"
            value={adults}
            onChange={(e) => onAdultsChange(Number(e.target.value))}
          />
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4 items-end">
        <div>
          <Label htmlFor="children">Children</Label>
          <Input
            id="children"
            type="number"
            min="0"
            value={children}
            onChange={(e) => onChildrenChange(Number(e.target.value))}
          />
        </div>
        
        <div className="md:col-span-2">
          <Button 
            onClick={onSearch}
            variant="luxury"
            size="lg"
            className="w-full"
          >
            Check Availability
          </Button>
        </div>
      </div>
    </Card>
  );
};
