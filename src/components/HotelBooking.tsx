import { useState, useEffect } from "react";
import axios from "axios";
import { io, Socket } from "socket.io-client";
// import HotelHeader from "./HotelHeader";
import { ReservationSummary } from "./ReservationSummary";
import { RoomCard } from "./RoomCard";
import { GuestForm } from "./GuestForm";
import { PaymentSection } from "./PaymentSection";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { MapPin, Shield, Clock, Users, Camera, Map, Info, CheckCircle, CreditCard, Phone, AlertTriangle, Calendar } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { config } from "@/config/constants";






interface GuestInfo {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  city: string;
  country: string;
}

interface Room {
  _id?: string;
  hotel?: string;
  type?: string;
  roomDescription?: string;
  totalRooms?: number;
  pricePerNight?: number;
  bedType?: string;
  perAdultPrice?: number;
  perChildPrice?: number;
  discount?: number;
  taxPercentage?: number;
  maxGuests?: number;
  roomSize?: string;
  availability?: string;
  image?: string;
  createdAt?: string;
  updatedAt?: string;
  availableCount?: number;
}

interface RoomSelection {
  roomId: string;
  roomCount: number;
  adults: number;
  childAge5to12: number;
  childBelow5: number;
}

interface HotelBookingProps {
  hotelId: string;
}

export const HotelBooking = ({ hotelId }: HotelBookingProps) => {










  const { toast } = useToast();

  // Search state
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");

  // Room selections state - tracks selections for each room type
  const [roomSelections, setRoomSelections] = useState<Record<string, RoomSelection>>({});

  // Booking state
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [guestInfo, setGuestInfo] = useState<GuestInfo>({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    city: "",
    country: "",
  });




  const [paymentMethod, setPaymentMethod] = useState("");


  const [paymentProofFile, setPaymentProofFile] = useState<File | null>(null);



  const [isProcessing, setIsProcessing] = useState(false);
  const [confirmationId, setConfirmationId] = useState<string>("");

  const [lastUpdated, setLastUpdated] = useState(Date.now());
  const [roomsData, setRoomsData] = useState<Room[]>([]);
  const [filteredRooms, setFilteredRooms] = useState<Room[]>([]);
  const [unavailableRooms, setUnavailableRooms] = useState<Room[]>([]);
  const [soldOutRooms, setSoldOutRooms] = useState<Room[]>([]);
  const [roomsLoading, setRoomsLoading] = useState(true);
  const [roomsError, setRoomsError] = useState<string | null>(null);
  const [socket, setSocket] = useState<Socket | null>(null);

  // Hotel data state
  const [hotel, setHotel] = useState<any>(null);
  const [hotelLoading, setHotelLoading] = useState(true);
  const [hotelError, setHotelError] = useState<string | null>(null);






  // Use the passed hotelId prop instead of config
  // const hotelId = config.HOTEL_ID;

  const apiBase = config.API_BASE;

  // Generate confirmation ID function
  const generateConfirmationId = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < 8; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  };

  // Function to fetch rooms data with fallback to mock data
  const fetchRooms = async (checkInDate?: string, checkOutDate?: string) => {
    try {
      // Try to fetch from API first
      const params = new URLSearchParams();
      if (checkInDate) params.append('checkIn', checkInDate);
      if (checkOutDate) params.append('checkOut', checkOutDate);

      try {
        const res = await axios.get(`${apiBase}/rooms/hotel/${hotelId}`, { params });
        setRoomsData(res.data);
        setRoomsError(null);
        setRoomsLoading(false);
        return;
      } catch (apiError) {
        console.error("API fetch failed, using mock data:", apiError);
      }

      // Fallback to mock rooms data if API fails
      const mockRooms = [
        {
          _id: "room1",
          hotel: hotelId,
          type: "Deluxe Room",
          roomDescription: "Elegant room with comfortable amenities and stunning views of Arunachala hill.",
          totalRooms: 10,
          pricePerNight: 2500,
          bedType: "King Bed",
          perAdultPrice: 100,
          perChildPrice: 50,
          discount: 200,
          taxPercentage: 18,
          maxGuests: 2,
          roomSize: "35 sq m",
          availability: "Available",
          image: "/assets/deluxe-room.jpg",
          availableCount: 8
        },
        {
          _id: "room2",
          hotel: hotelId,
          type: "Executive Room",
          roomDescription: "Premium room with modern amenities and work desk perfect for business travelers.",
          totalRooms: 6,
          pricePerNight: 3500,
          bedType: "Queen Bed",
          perAdultPrice: 120,
          perChildPrice: 60,
          discount: 300,
          taxPercentage: 18,
          maxGuests: 2,
          roomSize: "45 sq m",
          availability: "Available",
          image: "/assets/executive-room.jpg",
          availableCount: 5
        },
        {
          _id: "room3",
          hotel: hotelId,
          type: "Manor Suite",
          roomDescription: "Spacious suite with separate living area, perfect for families or extended stays.",
          totalRooms: 4,
          pricePerNight: 5500,
          bedType: "King Bed + Sofa",
          perAdultPrice: 150,
          perChildPrice: 75,
          discount: 500,
          taxPercentage: 18,
          maxGuests: 4,
          roomSize: "65 sq m",
          availability: "Available",
          image: "/assets/manor-suite.jpg",
          availableCount: 3
        },
        {
          _id: "room4",
          hotel: hotelId,
          type: "Signature Room",
          roomDescription: "Luxury room with premium amenities and personalized services.",
          totalRooms: 2,
          pricePerNight: 4500,
          bedType: "King Bed",
          perAdultPrice: 140,
          perChildPrice: 70,
          discount: 400,
          taxPercentage: 18,
          maxGuests: 2,
          roomSize: "55 sq m",
          availability: "Available",
          image: "/assets/signature-room.jpg",
          availableCount: 2
        },
        {
          _id: "room5",
          hotel: hotelId,
          type: "Standard Room",
          roomDescription: "Comfortable room with essential amenities at affordable rates.",
          totalRooms: 15,
          pricePerNight: 1500,
          bedType: "Twin Beds",
          perAdultPrice: 80,
          perChildPrice: 40,
          discount: 100,
          taxPercentage: 18,
          maxGuests: 2,
          roomSize: "25 sq m",
          availability: "Available",
          image: "/assets/standard-room.jpg",
          availableCount: 12
        },
        {
          _id: "room6",
          hotel: hotelId,
          type: "Studio Suite",
          roomDescription: "Contemporary suite with modern design and kitchenette.",
          totalRooms: 3,
          pricePerNight: 4000,
          bedType: "Queen Bed",
          perAdultPrice: 130,
          perChildPrice: 65,
          discount: 350,
          taxPercentage: 18,
          maxGuests: 3,
          roomSize: "50 sq m",
          availability: "Available",
          image: "/assets/studio-suite.jpg",
          availableCount: 2
        }
      ];

      setRoomsData(mockRooms);
      setRoomsError(null);
    } catch (err: any) {
      setRoomsError("No rooms available at this time");
    } finally {
      setRoomsLoading(false);
    }
  };

  // Function to fetch hotel data with fallback to mock data
  const fetchHotel = async () => {
    try {
      setHotelLoading(true);
      setHotelError(null);

      const res = await axios.get(`${apiBase}/hotel/${hotelId}`);
      setHotel(res.data);
    } catch (err: any) {
      console.error("Error fetching hotel:", err);
      // Fallback to mock hotel data if API fails
      const mockHotel = {
        name: "Sonachala Hotel",
        location: "Friends Colony, Tiruvannamalai",
        description: "A peaceful retreat in the foothills of Arunachala. Experience spiritual rejuvenation amidst serene surroundings.",
        contact: "+91-XXXX-XXXXXX",
        address: "Friends Colony, Tiruvannamalai, Tamil Nadu, India - 606601",
      };
      setHotel(mockHotel);
      setHotelError(null);
    } finally {
      setHotelLoading(false);
    }
  };

  // Load all rooms on component mount
  useEffect(() => {
    fetchRooms(checkIn, checkOut);

    // Auto-refresh every 30 seconds
    const interval = setInterval(() => {
      fetchRooms(checkIn, checkOut);
    }, 30000);

    return () => clearInterval(interval);
  }, [hotelId, checkIn, checkOut, lastUpdated]);

  // Socket.IO connection for real-time updates
  useEffect(() => {
    const newSocket = io(apiBase);
    setSocket(newSocket);

    // Listen for room updates
    newSocket.on('roomCreated', (data) => {
      if (data.hotelId === hotelId) {
        toast({
          title: "New room added!",
          description: "Room inventory has been updated.",
        });
        setLastUpdated(Date.now());
      }
    });

    newSocket.on('roomUpdated', (data) => {
      if (data.hotelId === hotelId) {
        toast({
          title: "Room updated!",
          description: "Room information has been updated.",
        });
        setLastUpdated(Date.now());
      }
    });

    newSocket.on('roomDeleted', (data) => {
      if (data.hotelId === hotelId) {
        toast({
          title: "Room removed!",
          description: "A room has been removed from inventory.",
        });
        setLastUpdated(Date.now());
      }
    });

    return () => {
      newSocket.close();
    };
  }, [hotelId, apiBase]);

  // Filter rooms - show all available rooms
  useEffect(() => {
    const availableRooms = roomsData.filter(
      (room) => room.availability === "Available" && (room.availableCount || 0) > 0
    );
    const soldOutRooms = roomsData.filter(
      (room) => room.availability === "Available" && (room.availableCount || 0) === 0
    );
    setFilteredRooms(availableRooms);
    setSoldOutRooms(soldOutRooms);
    setUnavailableRooms([]);
  }, [roomsData]);

  const calculateNights = () => {
    if (checkIn && checkOut) {
      const start = new Date(checkIn);
      const end = new Date(checkOut);
      const diffTime = Math.abs(end.getTime() - start.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return diffDays;
    }
    return 1;
  };

  const nights = calculateNights();

  // Calculate totals based on all room selections
  const calculateTotals = () => {
    let totalRoomCharges = 0;
    let totalGuestCharges = 0;
    let totalRooms = 0;
    let totalAdults = 0;
    let totalChildren = 0;

    Object.entries(roomSelections).forEach(([roomId, selection]) => {
      const room = roomsData.find(r => r._id === roomId);
      if (room && selection.roomCount > 0) {
        // Room charges
        totalRoomCharges += (room.pricePerNight || 0) * nights * selection.roomCount;

        // Guest charges
        totalGuestCharges += (selection.adults * (room.perAdultPrice || 0));
        totalGuestCharges += (selection.childAge5to12 * (room.perChildPrice || 0));
        totalGuestCharges += (selection.childBelow5 * (room.perChildPrice || 0));

        totalRooms += selection.roomCount;
        totalAdults += selection.adults;
        totalChildren += selection.childAge5to12 + selection.childBelow5;
      }
    });

    const subtotal = totalRoomCharges + totalGuestCharges;
    const taxPercentage = 18; // Default tax percentage
    const taxes = Math.round(subtotal * (taxPercentage / 100));
    const discount = 0;
    const total = subtotal + taxes - discount;

    return {
      roomCharges: totalRoomCharges,
      guestCharges: totalGuestCharges,
      subtotal,
      taxes,
      discount,
      total,
      totalRooms,
      totalAdults,
      totalChildren
    };
  };

  const totals = calculateTotals();

  const handleRoomSelectionChange = (roomId: string, selection: RoomSelection) => {
    setRoomSelections(prev => ({
      ...prev,
      [roomId]: selection
    }));
  };

  const handleCheckAvailability = () => {
    if (!checkIn || !checkOut) {
      toast({
        title: "Please select dates",
        description: "Check-in and check-out dates are required",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Checking availability...",
      description: "Updating room availability for your dates",
    });
    setRoomsLoading(true);
    fetchRooms(checkIn, checkOut);
  };

  const handleBookNow = () => {
    // Check if any rooms are selected
    const hasSelection = Object.values(roomSelections).some(s => s.roomCount > 0);

    if (!hasSelection) {
      toast({
        title: "Please select rooms",
        description: "You need to select at least one room to proceed",
        variant: "destructive",
      });
      return;
    }

    if (!checkIn || !checkOut) {
      toast({
        title: "Please select dates",
        description: "Check-in and check-out dates are required",
        variant: "destructive",
      });
      return;
    }

    // Set a dummy selected room for compatibility with existing code
    const firstSelectedRoomId = Object.keys(roomSelections).find(
      id => roomSelections[id].roomCount > 0
    );
    const firstRoom = roomsData.find(r => r._id === firstSelectedRoomId);

    if (firstRoom) {
      setSelectedRoom(firstRoom);
      document.getElementById('guest-form')?.scrollIntoView({ behavior: 'smooth' });
      toast({
        title: "Rooms selected!",
        description: "Please fill in your details below to complete the booking.",
      });
    }
  };








  const handleMakePayment = async () => {
    // Validate guest info
    const requiredFields = ['firstName', 'lastName', 'email', 'phone', 'city', 'country'];
    const missingFields = requiredFields.filter(field => !guestInfo[field as keyof GuestInfo]);

    if (missingFields.length > 0) {
      toast({
        title: "Please fill in all required fields",
        description: "All guest information fields are required for booking",
        variant: "destructive",
      });
      return;
    }

    if (!selectedRoom) {
      toast({
        title: "Please select a room",
        description: "You need to select a room before making payment",
        variant: "destructive",
      });
      return;
    }

    if (!paymentProofFile) {
      toast({
        title: "Please upload payment proof",
        description: "Payment proof image is required to confirm the booking",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);

    try {
      // Create FormData for multipart/form-data submission
      const formData = new FormData();

      // Guest Details
      formData.append('guestDetails', JSON.stringify({
        firstName: guestInfo.firstName,
        lastName: guestInfo.lastName,
        email: guestInfo.email,
        phone: guestInfo.phone,
        city: guestInfo.city,
        country: guestInfo.country
      }));

      // Selected Room Details
      formData.append('roomDetails', JSON.stringify({
        roomId: selectedRoom._id || '',
        roomType: selectedRoom.type || '',
        pricePerNight: selectedRoom.pricePerNight || 0,
        maxGuests: selectedRoom.maxGuests || 0,
        bedType: selectedRoom.bedType || '',
        roomSize: selectedRoom.roomSize || ''
      }));

      // Booking Details with room selections
      formData.append('bookingDetails', JSON.stringify({
        checkIn: checkIn,
        checkOut: checkOut,
        numberOfRooms: totals.totalRooms,
        numberOfAdults: totals.totalAdults,
        numberOfChildren: totals.totalChildren,
        numberOfNights: nights,
        hotelId: hotelId,
        roomSelections: roomSelections
      }));

      // Amount Details
      formData.append('amountDetails', JSON.stringify({
        roomCharges: totals.roomCharges,
        guestCharges: totals.guestCharges,
        subtotal: totals.subtotal,
        taxesAndFees: totals.taxes,
        discount: totals.discount,
        grandTotal: totals.total,
        currency: 'INR'
      }));

      // Payment Details
      formData.append('paymentDetails', JSON.stringify({
        paymentMethod: paymentMethod || 'UPI',
        paymentStatus: 'pending',
        transactionId: `TXN_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        paymentDate: new Date().toISOString()
      }));

      // Payment Proof Image
      formData.append('paymentProof', paymentProofFile);

      // Additional metadata
      const frontendConfirmationId = generateConfirmationId();
      formData.append('bookingMetadata', JSON.stringify({
        bookingDate: new Date().toISOString(),
        bookingSource: 'web',
        userAgent: navigator.userAgent,
        ipAddress: 'unknown', // This would typically be handled by the backend
        frontendConfirmationId: frontendConfirmationId
      }));

      // Backend API call
      const response = await axios.post(`${apiBase}/bookings`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        timeout: 30000, // 30 second timeout
      });

      // Success handling
      const receivedConfirmationId = response.data.confirmationId || response.data.bookingId || response.data.id || frontendConfirmationId;
      setConfirmationId(receivedConfirmationId);

      toast({
        title: "🎉 Booking Confirmed!",
        description: `Your reservation has been confirmed! Confirmation ID: ${receivedConfirmationId}`,
      });

      // Reset form after successful booking
      setSelectedRoom(null);
      setGuestInfo({
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
        city: "",
        country: "",
      });
      setPaymentMethod("");
      setPaymentProofFile(null);
      setRoomSelections({});

    } catch (error: any) {
      console.error('Booking error:', error);

      // Enhanced error handling
      let errorMessage = "There was an error processing your booking. Please try again.";

      if (error.response) {
        // Server responded with error status
        errorMessage = error.response.data?.message || error.response.data?.error || errorMessage;
      } else if (error.request) {
        // Request was made but no response received
        errorMessage = "Unable to connect to the server. Please check your internet connection.";
      } else {
        // Something else happened
        errorMessage = error.message || errorMessage;
      }

      toast({
        title: "Booking failed",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };













  useEffect(() => {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    setCheckIn(today.toISOString().split('T')[0]);
    setCheckOut(tomorrow.toISOString().split('T')[0]);
  }, []);

  // Fetch hotel data on component mount
  useEffect(() => {
    fetchHotel();
  }, [hotelId]);





  console.log(guestInfo);





  return (
    <div className="w-full">
      {/* <HotelHeader /> */}

      <div className="py-6">
        {/* Date Selection Bar */}
        <Card className="mb-6 bg-card border-2 border-primary/20">
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
              <div>
                <Label htmlFor="checkIn" className="text-primary mb-2 block font-semibold text-base">Check In</Label>
                <Input
                  id="checkIn"
                  type="date"
                  value={checkIn}
                  onChange={(e) => setCheckIn(e.target.value)}
                  className="bg-background text-foreground border-border focus:border-primary focus:ring-primary"
                />
              </div>
              <div>
                <Label htmlFor="checkOut" className="text-primary mb-2 block font-semibold text-base">Check Out</Label>
                <Input
                  id="checkOut"
                  type="date"
                  value={checkOut}
                  onChange={(e) => setCheckOut(e.target.value)}
                  min={checkIn}
                  className="bg-background text-foreground border-border focus:border-primary focus:ring-primary"
                />
              </div>
              <div>
                <Button
                  onClick={handleCheckAvailability}
                  className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-bold"
                  size="lg"
                >
                  CHECK AVAILABILITY
                </Button>
              </div>
            </div>
            {checkIn && checkOut && (
              <div className="mt-3 text-sm">
                <span className="bg-primary text-primary-foreground px-3 py-1 rounded-full font-semibold">
                  {nights} night{nights !== 1 ? 's' : ''}
                </span>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            {/* Room listings */}
            <div className="space-y-4">
              {roomsLoading ? (
                <div>Loading rooms...</div>
              ) : roomsError ? (
                <div>{roomsError}</div>
              ) : (filteredRooms.length > 0 || unavailableRooms.length > 0 || soldOutRooms.length > 0) ? (
                <>
                  {/* Available Rooms */}
                  {filteredRooms.map((room) => (
                    <RoomCard
                      key={room._id}
                      id={room._id}
                      name={room.type}
                      image={room.image ? room.image : ""}
                      description={`Room Size: ${room.roomSize || "N/A"}`}
                      roomDescription={room.roomDescription || ""}
                      price={room.pricePerNight}
                      originalPrice={room.discount ? room.pricePerNight + room.discount : undefined}
                      features={[]}
                      capacity={room.maxGuests}
                      bedType={room.bedType}
                      isPopular={true}
                      availableCount={room.availableCount}
                      maxAvailableRooms={room.availableCount || 0}
                      perAdultPrice={room.perAdultPrice}
                      perChildPrice={room.perChildPrice}
                      nights={nights}
                      selection={roomSelections[room._id || ''] || { roomId: room._id || '', roomCount: 0, adults: 0, childAge5to12: 0, childBelow5: 0 }}
                      onSelectionChange={handleRoomSelectionChange}
                    />
                  ))}

                  {/* Sold Out Rooms */}
                  {soldOutRooms.map((room) => (
                    <RoomCard
                      key={room._id}
                      id={room._id}
                      name={room.type}
                      image={room.image ? room.image : ""}
                      description={`Room Size: ${room.roomSize || "N/A"}`}
                      roomDescription={room.roomDescription || ""}
                      price={room.pricePerNight}
                      originalPrice={room.discount ? room.pricePerNight + room.discount : undefined}
                      features={[]}
                      capacity={room.maxGuests}
                      bedType={room.bedType}
                      isPopular={true}
                      availableCount={0}
                      maxAvailableRooms={0}
                      perAdultPrice={room.perAdultPrice}
                      perChildPrice={room.perChildPrice}
                      nights={nights}
                      isSoldOut={true}
                      selection={roomSelections[room._id || ''] || { roomId: room._id || '', roomCount: 0, adults: 0, childAge5to12: 0, childBelow5: 0 }}
                      onSelectionChange={handleRoomSelectionChange}
                    />
                  ))}
                </>
              ) : (
                <div>No rooms available for the selected criteria.</div>
              )}

              {/* Book Now Button */}
              {Object.values(roomSelections).some(s => s.roomCount > 0) && (
                <div className="sticky bottom-0 bg-card border-t-2 border-primary p-4 shadow-lg">
                  <Button
                    onClick={handleBookNow}
                    className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-lg py-6"
                    size="lg"
                  >
                    BOOK NOW
                  </Button>
                </div>
              )}
            </div>








            {/* Payment Section */}
            {selectedRoom && (
              <PaymentSection
                paymentMethod={paymentMethod}
                onPaymentMethodChange={setPaymentMethod}
                onMakePayment={handleMakePayment}
                isProcessing={isProcessing}
                total={totals.total}
              />
            )}


            {/* Guest Form */}
            {selectedRoom && (
              <div id="guest-form">
                <GuestForm
                  guestInfo={guestInfo}
                  onGuestInfoChange={setGuestInfo}
                  paymentProofFile={paymentProofFile}
                  onPaymentProofChange={setPaymentProofFile}
                />
              </div>
            )}






            {/* Hotel Information Tabs
            <Card>
              <CardHeader>
                <CardTitle className="text-xl font-bold text-premium">
                  Hotel Information
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="gallery" className="w-full">
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="gallery" className="flex items-center gap-2">
                      <Camera className="w-4 h-4" />
                      Photo Gallery
                    </TabsTrigger>
                    <TabsTrigger value="facilities" className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4" />
                      Facilities
                    </TabsTrigger>
                    <TabsTrigger value="location" className="flex items-center gap-2">
                      <Map className="w-4 h-4" />
                      Location
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="gallery" className="mt-6">
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      {[
                        "/assets/deluxe-room.jpg",
                        "/assets/executive-room.jpg",
                        "/assets/manor-suite.jpg",
                        "/assets/signature-room.jpg",
                        "/assets/standard-room.jpg",
                        "/assets/studio-suite.jpg"
                      ].map((image, index) => (
                        <div key={index} className="aspect-square overflow-hidden rounded-lg">
                          <img
                            src={image}
                            alt={`Hotel gallery image ${index + 1}`}
                            className="w-full h-full object-cover hover:scale-105 transition-transform duration-300 cursor-pointer"
                            onClick={() => window.open(image, '_blank')}
                          />
                        </div>
                      ))}
                    </div>
                  </TabsContent>



                  <TabsContent value="facilities" className="mt-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <h3 className="font-semibold text-lg mb-3">Room Facilities</h3>
                        <div className="grid grid-cols-2 gap-2 text-sm">
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
                            "24/7 room service"
                          ].map((facility, index) => (
                            <div key={index} className="flex items-center gap-2">
                              <CheckCircle className="w-3 h-3 text-green-500" />
                              <span>{facility}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                      <div>
                        <h3 className="font-semibold text-lg mb-3">Hotel Facilities</h3>
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          {[
                            "Complimentary Packaged Water Bottles",
                            "Direct-Dialing Phone",
                            "Hair Dryer",
                            "High Speed Wi-Fi Internet(chargable)",
                            "Kettle",
                            "Marble Flooring",
                            "Shower",
                            "Sound proof windows",
                            "Study Table",
                            "Work Desk",
                            "Complimentary toiletries",
                            "Internet"
                          ].map((facility, index) => (
                            <div key={index} className="flex items-center gap-2">
                              <CheckCircle className="w-3 h-3 text-green-500" />
                              <span>{facility}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="location" className="mt-6">
                    <div className="space-y-4">
                      <div className="w-full h-96 rounded-lg overflow-hidden border">
                        <iframe
                          src={config.GOOGLE_MAPS_EMBED_URL}
                          width="100%"
                          height="100%"
                          style={{ border: 0 }}
                          allowFullScreen
                          loading="lazy"
                          referrerPolicy="no-referrer-when-downgrade"
                          title="Hotel Location - Friends Colony, Tiruvannamalai"
                        />
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        <div>
                          <h4 className="font-semibold mb-2">Address</h4>
                          <p className="text-muted-foreground">
                            Friends Colony<br />
                            Tiruvannamalai, Tamil Nadu<br />
                            India - 606601
                          </p>
                        </div>
                        <div>
                          <h4 className="font-semibold mb-2">Nearby Attractions</h4>
                          <div className="space-y-1 text-muted-foreground">
                            <p>• Arunachaleswarar Temple (2.5 km)</p>
                            <p>• Girivalam Path (1.8 km)</p>
                            <p>• Ramana Ashram (3.2 km)</p>
                            <p>• Local Market (1.2 km)</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card> */}















          </div>




          {/* Reservation Summary Sidebar */}
          <div className="lg:col-span-1">
            <ReservationSummary
              roomPrice={0}
              nights={nights}
              discount={totals.discount}
              roomCount={totals.totalRooms}
              selectedRoom={selectedRoom}
              guestInfo={guestInfo}
              checkIn={checkIn}
              checkOut={checkOut}
              adults={totals.totalAdults}
              children={totals.totalChildren}
              paymentMethod={paymentMethod}
              paymentProofFile={paymentProofFile}
              hotelId={hotelId}
              roomSelections={roomSelections}
              roomsData={roomsData}
              totalCharges={totals.roomCharges}
              totalGuestCharges={totals.guestCharges}
              totalSubtotal={totals.subtotal}
              totalTaxes={totals.taxes}
              grandTotal={totals.total}
            />




          </div>










        </div>

        {/* Reservation Policy and Terms & Conditions - Bottom Section */}
        <div className="mt-12 pt-8 border-t border-border">
          <Card className="bg-card">
            <CardHeader>
              <CardTitle className="text-2xl font-bold text-primary flex items-center gap-2">
                <Shield className="w-6 h-6 text-primary" />
                Reservation Policy and Terms & Conditions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <Shield className="w-5 h-5 text-luxury mt-1 flex-shrink-0" />
                    <div>
                      <h4 className="font-semibold text-base mb-2">Cancellation Policy</h4>
                      <div className="text-sm text-muted-foreground space-y-1">
                        <p>Free cancellation up to 24 hours before check-in</p>
                        <p>After that, one night's charge applies</p>
                        <p>No-show will result in full payment</p>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Clock className="w-5 h-5 text-luxury mt-1 flex-shrink-0" />
                    <div>
                      <h4 className="font-semibold text-base mb-2">Check-in/Check-out</h4>
                      <div className="text-sm text-muted-foreground space-y-1">
                        <p>Check-in: 3:00 PM</p>
                        <p>Check-out: 12:00 PM</p>
                        <p>Early check-in subject to availability</p>
                        <p>Late check-out may incur extra charges</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <Users className="w-5 h-5 text-luxury mt-1 flex-shrink-0" />
                    <div>
                      <h4 className="font-semibold text-base mb-2">Guest Policy</h4>
                      <div className="text-sm text-muted-foreground space-y-1">
                        <p>Maximum occupancy as specified per room</p>
                        <p>Additional guests may incur extra charges</p>
                        <p>Valid ID required at check-in</p>
                        <p>Children under 12 stay free with parents</p>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <MapPin className="w-5 h-5 text-luxury mt-1 flex-shrink-0" />
                    <div>
                      <h4 className="font-semibold text-base mb-2">Location & Access</h4>
                      <div className="text-sm text-muted-foreground space-y-1">
                        <p>Centrally located in Friends Colony</p>
                        <p>Easy access to major attractions</p>
                        <p>Business districts nearby</p>
                        <p>Public transport available</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="space-y-3">
                    <h4 className="font-semibold text-base flex items-center gap-2">
                      <CreditCard className="w-5 h-5 text-luxury" />
                      Payment Terms
                    </h4>
                    <div className="text-sm text-muted-foreground space-y-2">
                      <p>Full payment required for booking confirmation</p>

                      <p>UPI and digital payments supported</p>
                      <p>Payment proof required for verification</p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <h4 className="font-semibold text-base flex items-center gap-2">
                      <AlertTriangle className="w-5 h-5 text-luxury" />
                      Additional Policies
                    </h4>
                    <div className="text-sm text-muted-foreground space-y-2">
                      <p>No pets allowed</p>
                      <p>Smoking prohibited in rooms</p>
                      <p>Outside visitors must register</p>
                      <p>Damage charges apply for violations</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="space-y-3">
                    <h4 className="font-semibold text-base flex items-center gap-2">
                      <Phone className="w-5 h-5 text-luxury" />
                      Contact Information
                    </h4>
                    <div className="text-sm text-muted-foreground space-y-2">
                      <p>Phone: {hotelLoading ? "Loading..." : (hotel?.contact || "+91-XXXX-XXXXXX")}</p>
                      <p>Email: info@sonachalahotel.com</p>
                      <p>24/7 Front Desk Support</p>
                      <p>Emergency contact available</p>
                    </div>
                  </div>

                  <div className="bg-blue-50 p-4 rounded-lg">
                    <p className="text-sm text-blue-800 font-medium mb-2">Need Help?</p>
                    <p className="text-sm text-blue-600">
                      For any questions about our policies or special requests,
                      please contact our guest relations team.
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-8 pt-6 border-t">
                <div className="text-center text-sm text-muted-foreground">
                  <p className="mb-2">
                    By proceeding with your booking, you agree to our Terms & Conditions and Privacy Policy.
                  </p>
                  <p>
                    All bookings are subject to availability and hotel confirmation.
                    Rates are subject to change without prior notice.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
