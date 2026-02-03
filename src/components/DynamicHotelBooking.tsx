import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { io, Socket } from "socket.io-client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { MapPin, Shield, Clock, Users, CreditCard, Phone, AlertTriangle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { config } from "@/config/constants";
import { RoomCard } from "./RoomCard";
import { ReservationSummary } from "./ReservationSummary";
import { GuestForm } from "./GuestForm";
import { PaymentSection } from "./PaymentSection";

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

interface Hotel {
  _id: string;
  name: string;
  address: string;
  contact: string;
  images: string[];
  path: string;
}

export const DynamicHotelBooking = () => {
  const { hotelPath } = useParams<{ hotelPath: string }>();
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
  const [hotel, setHotel] = useState<Hotel | null>(null);
  const [hotelLoading, setHotelLoading] = useState(true);
  const [hotelError, setHotelError] = useState<string | null>(null);

  const apiBase = config.API_BASE;

  // Get hotelId - either from dynamic path or fallback to config
  const hotelId = hotel ? hotel._id : config.HOTEL_ID;

  // Generate confirmation ID function
  const generateConfirmationId = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < 8; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  };

  // Fetch hotel by path
  const fetchHotel = async () => {
    if (!hotelPath) {
      setHotelError("Hotel path not provided");
      setHotelLoading(false);
      return;
    }

    try {
      setHotelLoading(true);
      setHotelError(null);
      const response = await axios.get(`${apiBase}/hotel/path/${hotelPath}`);
      setHotel(response.data);
    } catch (err: any) {
      console.error("Error fetching hotel:", err);
      if (err.response?.status === 404) {
        setHotelError("Hotel not found");
      } else {
        setHotelError("Failed to load hotel details");
      }
      toast({
        title: "Error",
        description: "Failed to load hotel details. Please try again.",
        variant: "destructive",
      });
    } finally {
      setHotelLoading(false);
    }
  };

  // Function to fetch rooms data with fallback to mock data
  const fetchRooms = async (checkInDate?: string, checkOutDate?: string) => {
    try {
      if (!hotelId) {
        setRoomsError("Hotel ID not available");
        setRoomsLoading(false);
        return;
      }

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
          roomDescription: "Elegant room with comfortable amenities and stunning views.",
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
          type: "Suite",
          roomDescription: "Spacious suite with separate living area, perfect for families.",
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

  // Load hotel and rooms on component mount
  useEffect(() => {
    if (hotelPath) {
      fetchHotel();
    }
  }, [hotelPath]);

  useEffect(() => {
    if (hotelId) {
      fetchRooms(checkIn, checkOut);
    }
  }, [hotelId, checkIn, checkOut, lastUpdated]);

  // Socket.IO connection for real-time updates
  useEffect(() => {
    if (!hotelId) return;

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
        totalRoomCharges += (room.pricePerNight || 0) * nights * selection.roomCount;
        totalGuestCharges += (selection.adults * (room.perAdultPrice || 0));
        totalGuestCharges += (selection.childAge5to12 * (room.perChildPrice || 0));
        totalGuestCharges += (selection.childBelow5 * (room.perChildPrice || 0));
        
        totalRooms += selection.roomCount;
        totalAdults += selection.adults;
        totalChildren += selection.childAge5to12 + selection.childBelow5;
      }
    });

    const subtotal = totalRoomCharges + totalGuestCharges;
    const taxPercentage = 18;
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
      const formData = new FormData();
      
      formData.append('guestDetails', JSON.stringify({
        firstName: guestInfo.firstName,
        lastName: guestInfo.lastName,
        email: guestInfo.email,
        phone: guestInfo.phone,
        city: guestInfo.city,
        country: guestInfo.country
      }));

      formData.append('roomDetails', JSON.stringify({
        roomId: selectedRoom._id || '',
        roomType: selectedRoom.type || '',
        pricePerNight: selectedRoom.pricePerNight || 0,
        maxGuests: selectedRoom.maxGuests || 0,
        bedType: selectedRoom.bedType || '',
        roomSize: selectedRoom.roomSize || ''
      }));

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

      formData.append('amountDetails', JSON.stringify({
        roomCharges: totals.roomCharges,
        guestCharges: totals.guestCharges,
        subtotal: totals.subtotal,
        taxesAndFees: totals.taxes,
        discount: totals.discount,
        grandTotal: totals.total,
        currency: 'INR'
      }));

      formData.append('paymentDetails', JSON.stringify({
        paymentMethod: paymentMethod || 'UPI',
        paymentStatus: 'pending',
        transactionId: `TXN_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        paymentDate: new Date().toISOString()
      }));

      formData.append('paymentProof', paymentProofFile);

      const frontendConfirmationId = generateConfirmationId();
      formData.append('bookingMetadata', JSON.stringify({
        bookingDate: new Date().toISOString(),
        bookingSource: 'web',
        userAgent: navigator.userAgent,
        ipAddress: 'unknown',
        frontendConfirmationId: frontendConfirmationId
      }));

      const response = await axios.post(`${apiBase}/bookings`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        timeout: 30000,
      });

      const receivedConfirmationId = response.data.confirmationId || response.data.bookingId || response.data.id || frontendConfirmationId;
      setConfirmationId(receivedConfirmationId);
      
      toast({
        title: "🎉 Booking Confirmed!",
        description: `Your reservation has been confirmed! Confirmation ID: ${receivedConfirmationId}`,
      });

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
      
      let errorMessage = "There was an error processing your booking. Please try again.";
      
      if (error.response) {
        errorMessage = error.response.data?.message || error.response.data?.error || errorMessage;
      } else if (error.request) {
        errorMessage = "Unable to