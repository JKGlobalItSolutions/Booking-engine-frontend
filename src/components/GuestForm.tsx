import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface GuestInfo {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  city: string;
  country: string;

}





interface GuestFormProps {
  guestInfo: GuestInfo;
  onGuestInfoChange: (info: GuestInfo) => void;
  paymentProofFile?: File | null;
  onPaymentProofChange?: (file: File | null) => void;
}


export const GuestForm = ({ guestInfo, onGuestInfoChange, paymentProofFile, onPaymentProofChange }: GuestFormProps) => {



  const handleInputChange = (field: keyof GuestInfo, value: string) => {
    onGuestInfoChange({
      ...guestInfo,
      [field]: value,
    });
  } 

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (onPaymentProofChange) {
      onPaymentProofChange(e.target.files?.[0] || null);
    }
  }




  

  return (
    <Card className="mb-6">
      <CardHeader className="bg-gradient-to-r from-luxury/10 to-luxury/5">
        <CardTitle className="text-xl font-bold text-premium">
          Guest Information
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6">
  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="firstName">First Name *</Label>
            <Input
              id="firstName"
              value={guestInfo.firstName}
              onChange={(e) => handleInputChange('firstName', e.target.value)}
              placeholder="Enter your first name"
              required
            />
          </div>
          
          <div>
            <Label htmlFor="lastName">Last Name *</Label>
            <Input
              id="lastName"
              value={guestInfo.lastName}
              onChange={(e) => handleInputChange('lastName', e.target.value)}
              placeholder="Enter your last name"
              required
            />
          </div>
          
          <div>
            <Label htmlFor="email">Email Address *</Label>
            <Input
              id="email"
              type="email"
              value={guestInfo.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              placeholder="Enter your email"
              required
            />
          </div>
          
          <div>
            <Label htmlFor="phone">Phone Number *</Label>
            <Input
              id="phone"
              type="tel"
              value={guestInfo.phone}
              onChange={(e) => handleInputChange('phone', e.target.value)}
              placeholder="Enter your phone number"
              required
            />
          </div>
          
          <div>
            <Label htmlFor="city">City *</Label>
            <Input
              id="city"
              value={guestInfo.city}
              onChange={(e) => handleInputChange('city', e.target.value)}
              placeholder="Enter your city"
              required
            />
          </div>
          
          <div>
            <Label htmlFor="country">Country *</Label>
            <Select 
              value={guestInfo.country} 
              onValueChange={(value) => handleInputChange('country', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select your country" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="IN">India</SelectItem>
                <SelectItem value="US">United States</SelectItem>
                <SelectItem value="UK">United Kingdom</SelectItem>
                <SelectItem value="CA">Canada</SelectItem>
                <SelectItem value="AU">Australia</SelectItem>
                <SelectItem value="DE">Germany</SelectItem>
                <SelectItem value="FR">France</SelectItem>
                <SelectItem value="JP">Japan</SelectItem>
                <SelectItem value="SG">Singapore</SelectItem>
                <SelectItem value="AE">United Arab Emirates</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Payment Proof Image Upload */}
          <div className="md:col-span-2">
            <Label htmlFor="paymentProof">Payment Proof (Image Upload)</Label>
            <Input
              id="paymentProof"
              type="file"
              accept="image/*"
              onChange={handleFileChange}
            />
            {paymentProofFile && (
              <div className="mt-2">
                <span className="text-sm text-muted-foreground">Selected file: {paymentProofFile.name}</span>
              </div>
            )}
          </div>

        </div>
      </CardContent>
    </Card>
  );
};