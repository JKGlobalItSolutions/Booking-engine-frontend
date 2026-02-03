import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useState } from "react";
import axios from "axios";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { CheckCircle, XCircle, Loader2 } from "lucide-react";
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
  totalRooms?: number;
  pricePerNight?: number;
  bedType?: string;
  perAdultPrice?: number;
  perChildPrice?: number;
  discount?: number;
  taxPercentage?: number;
  commission?: number;
  maxGuests?: number;
  roomSize?: string;
  availability?: string;
  image?: string;
  createdAt?: string;
  updatedAt?: string;
}

interface RoomSelection {
  roomId: string;
  roomCount: number;
  adults: number;
  childAge5to12: number;
  childBelow5: number;
}

interface ReservationSummaryProps {
  roomPrice: number;
  nights: number;
  discount: number;
  roomCount: number;
  // Booking data props
  selectedRoom: Room | null;
  guestInfo: GuestInfo;
  checkIn: string;
  checkOut: string;
  adults: number;
  children: number;
  paymentMethod: string;
  paymentProofFile: File | null;
  hotelId: string;
  roomSelections?: Record<string, RoomSelection>;
  roomsData?: Room[];
  totalCharges?: number;
  totalGuestCharges?: number;
  totalSubtotal?: number;
  totalTaxes?: number;
  grandTotal?: number;
}

export const ReservationSummary = ({
  roomPrice,
  nights,
  discount,
  roomCount,
  selectedRoom,
  guestInfo,
  checkIn,
  checkOut,
  adults,
  children,
  paymentMethod,
  paymentProofFile,
  hotelId,
  roomSelections = {},
  roomsData = [],
  totalCharges = 0,
  totalGuestCharges = 0,
  totalSubtotal = 0,
  totalTaxes = 0,
  grandTotal = 0,
}: ReservationSummaryProps) => {
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [bookingId, setBookingId] = useState<string>("");
  const [errorMessage, setErrorMessage] = useState<string>("");




  const apiBase = config.API_BASE;



  // Use passed totals or calculate from old logic
  const roomCharges = totalCharges || (roomPrice * nights * roomCount);
  const guestCharges = totalGuestCharges || 0;
  const subtotal = totalSubtotal || (roomCharges + guestCharges);
  const taxes = totalTaxes || Math.round(subtotal * 0.18);
  const total = grandTotal || (subtotal + taxes - discount);
  const taxPercentage = 18;

  const handleProceedToPay = async () => {
    // Validate required data
    if (!selectedRoom) {
      toast({
        title: "Please select a room",
        description: "You need to select a room before proceeding to payment",
        variant: "destructive",
      });
      return;
    }

    const requiredFields = [
      "firstName",
      "lastName",
      "email",
      "phone",
      "city",
      "country",
    ];
    const missingFields = requiredFields.filter(
      (field) => !guestInfo[field as keyof GuestInfo]
    );

    if (missingFields.length > 0) {
      toast({
        title: "Please fill in all required fields",
        description: "All guest information fields are required for booking",
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
      formData.append(
        "guestDetails",
        JSON.stringify({
          firstName: guestInfo.firstName,
          lastName: guestInfo.lastName,
          email: guestInfo.email,
          phone: guestInfo.phone,
          city: guestInfo.city,
          country: guestInfo.country,
        })
      );

      // Selected Room Details
      formData.append(
        "roomDetails",
        JSON.stringify({
          roomId: selectedRoom._id || "",
          roomType: selectedRoom.type || "",
          pricePerNight: selectedRoom.pricePerNight || 0,
          maxGuests: selectedRoom.maxGuests || 0,
          bedType: selectedRoom.bedType || "",
          roomSize: selectedRoom.roomSize || "",
        })
      );

      // Booking Details
      formData.append(
        "bookingDetails",
        JSON.stringify({
          checkIn: checkIn,
          checkOut: checkOut,
          numberOfRooms: roomCount,
          numberOfAdults: adults,
          numberOfChildren: children,
          numberOfNights: nights,
          hotelId: hotelId,
        })
      );

      // Amount Details
      formData.append(
        "amountDetails",
        JSON.stringify({
          roomCharges: roomCharges,
          guestCharges: guestCharges,
          subtotal: subtotal,
          taxesAndFees: taxes,
          discount: discount,
          grandTotal: total,
          currency: "INR",
        })
      );

      // Payment Details
      formData.append(
        "paymentDetails",
        JSON.stringify({
          paymentMethod: paymentMethod || "UPI",
          paymentStatus: "pending",
          transactionId: `TXN_${Date.now()}_${Math.random()
            .toString(36)
            .substr(2, 9)}`,
          paymentDate: new Date().toISOString(),
        })
      );

      console.log(formData);

      // Payment Proof Image
      formData.append("paymentProof", paymentProofFile);

      // Additional metadata
      formData.append(
        "bookingMetadata",
        JSON.stringify({
          bookingDate: new Date().toISOString(),
          bookingSource: "web",
          userAgent: navigator.userAgent,
          ipAddress: "unknown",
        })
      );

      // Log FormData contents for debugging
      for (let [key, value] of formData.entries()) {
        console.log(`${key}:`, value);
      }

    

      // Backend API call
      const response = await axios.post(
        `${apiBase}/bookings`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
          timeout: 60000,
        }
      );

      console.log(formData);

      // Success handling
      const confirmationId =
        response.data.confirmationId ||
        response.data.bookingId ||
        response.data.id ||
        Date.now().toString().slice(-6);
      setBookingId(confirmationId);
      setShowSuccessModal(true);
    } catch (error: any) {
      console.error("Booking error:", error);

      // Enhanced error handling
      let errorMsg =
        "There was an error processing your booking. Please try again.";

      if (error.response) {
        errorMsg =
          error.response.data?.message ||
          error.response.data?.error ||
          errorMsg;
      } else if (error.request) {
        errorMsg =
          "Unable to connect to the server. Please check your internet connection.";
      } else {
        errorMsg = error.message || errorMsg;
      }

      setErrorMessage(errorMsg);
      setShowErrorModal(true);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <>
      <Card className="sticky top-6 h-fit shadow-lg border-2 border-primary/20">
        <CardHeader className="bg-primary/10 border-b-2 border-primary/20">
          <CardTitle className="text-2xl font-bold text-primary">
            Reservation Summary
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="space-y-4">
            <div className="flex justify-between items-center bg-primary/10 p-3 rounded border border-primary/30">
              <span className="text-sm font-bold text-primary">Check In</span>
              <span className="font-medium text-foreground">{checkIn || 'Not selected'}</span>
            </div>
            <div className="flex justify-between items-center bg-primary/10 p-3 rounded border border-primary/30">
              <span className="text-sm font-bold text-primary">Check Out</span>
              <span className="font-medium text-foreground">{checkOut || 'Not selected'}</span>
            </div>

            <hr className="border-2 border-dark" />

            {/* Room Breakdown */}
            {Object.entries(roomSelections).filter(([_, sel]) => sel.roomCount > 0).length > 0 && (
              <div className="space-y-3">
                {Object.entries(roomSelections)
                  .filter(([_, sel]) => sel.roomCount > 0)
                  .map(([roomId, sel]) => {
                    const room = roomsData.find(r => r._id === roomId);
                    if (!room) return null;
                    
                    return (
                      <div key={roomId} className="bg-muted p-3 rounded border border-border">
                        <div className="font-bold text-sm mb-2 text-primary">{room.type}</div>
                        <div className="text-xs space-y-1">
                          <div className="flex justify-between">
                            <span>Rooms: {sel.roomCount}</span>
                            <span>₹{((room.pricePerNight || 0) * nights * sel.roomCount).toLocaleString()}</span>
                          </div>
                          {sel.adults > 0 && (
                            <div className="flex justify-between">
                              <span>Adults: {sel.adults}</span>
                              <span>₹{(sel.adults * (room.perAdultPrice || 0)).toLocaleString()}</span>
                            </div>
                          )}
                          {sel.childAge5to12 > 0 && (
                            <div className="flex justify-between">
                              <span>Child (5-12yrs): {sel.childAge5to12}</span>
                              <span>₹{(sel.childAge5to12 * (room.perChildPrice || 0)).toLocaleString()}</span>
                            </div>
                          )}
                          {sel.childBelow5 > 0 && (
                            <div className="flex justify-between">
                              <span>Child (below 5yrs): {sel.childBelow5}</span>
                              <span>₹{(sel.childBelow5 * (room.perChildPrice || 0)).toLocaleString()}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
              </div>
            )}

            <hr className="border-2 border-dark" />
            <div className="flex justify-between">
              <span className="text-sm">Room Charges</span>
              <span className="font-medium">
                ₹{roomCharges.toLocaleString()}
              </span>
            </div>

            {guestCharges > 0 && (
              <div className="flex justify-between">
                <span className="text-sm">Guest Charges</span>
                <span className="font-medium">
                  ₹{guestCharges.toLocaleString()}
                </span>
              </div>
            )}

            <hr className="border-2 border-dark" />

            <div className="flex justify-between">
              <span className="text-sm">Subtotal</span>
              <span className="font-medium">₹{subtotal.toLocaleString()}</span>
            </div>

            <hr className="border-2 border-dark" />

            <div className="flex justify-between">
              <span className="text-sm font-bold text-foreground">Total Taxes</span>
              <span className="font-bold text-foreground">INR {taxes.toLocaleString()}</span>
            </div>

            {discount > 0 && (
              <div className="flex justify-between text-success">
                <span className="text-sm">Discount</span>
                <span className="font-medium">
                  -₹{discount.toLocaleString()}
                </span>
              </div>
            )}

            <Separator />

            <div className="bg-primary text-primary-foreground p-4 rounded-lg shadow-lg border-2 border-primary">
              <div className="flex justify-between items-center">
                <span className="text-lg font-bold">Grand Total</span>
                <div className="text-right">
                  <div className="text-xs opacity-90">Price Breakdown</div>
                  <div className="text-3xl font-bold">INR {total.toLocaleString()}</div>
                </div>
              </div>
            </div>

            <div className="mt-6">
              <Button
                className="w-full rounded-lg text-center bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-lg py-6"
                onClick={handleProceedToPay}
                disabled={isProcessing}
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Processing...
                  </>
                ) : (
                  "Complete Booking"
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Success Modal */}
      <Dialog open={showSuccessModal} onOpenChange={setShowSuccessModal}>
        <DialogContent className="max-w-md mx-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-green-600">
              <CheckCircle className="h-6 w-6" />
              Booking Confirmed!
            </DialogTitle>
            <DialogDescription>
              Your reservation has been successfully confirmed.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="bg-green-50 p-4 rounded-lg">
              <p className="text-sm text-green-800">
                <strong>Confirmation ID:</strong> {bookingId}
              </p>
              <p className="text-sm text-green-700 mt-2">
                Please save this confirmation ID for your records.
              </p>
            </div>
            <div className="text-sm text-gray-600">
              <p>
                <strong>Check-in:</strong> {checkIn}
              </p>
              <p>
                <strong>Check-out:</strong> {checkOut}
              </p>
              <p>
                <strong>Room:</strong> {selectedRoom?.type}
              </p>
              <p>
                <strong>Total Amount:</strong> ₹{total.toLocaleString()}
              </p>
            </div>
            <Button
              onClick={() => setShowSuccessModal(false)}
              className="w-full"
              variant="luxury"
            >
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Error Modal */}
      <Dialog open={showErrorModal} onOpenChange={setShowErrorModal}>
        <DialogContent className="max-w-md mx-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600">
              <XCircle className="h-6 w-6" />
              Booking Failed
            </DialogTitle>
            <DialogDescription>
              There was an error processing your booking.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="bg-red-50 p-4 rounded-lg">
              <p className="text-sm text-red-800">{errorMessage}</p>
            </div>
            <div className="flex gap-2">
              <Button
                onClick={() => setShowErrorModal(false)}
                variant="outline"
                className="flex-1"
              >
                Close
              </Button>
              <Button
                onClick={() => {
                  setShowErrorModal(false);
                  handleProceedToPay();
                }}
                className="flex-1"
                variant="luxury"
              >
                Try Again
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};
