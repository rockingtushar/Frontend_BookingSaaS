export interface Business {
  id: number;
  name: string;
  email: string;
  type: string;
}

export interface Service {
  id: number;
  business_id: number;
  name: string;
  description?: string;
  price?: number;
  duration_minutes?: number;
}

export interface Customer {
  id: number;
  business_id: number;
  name: string;
  phone: string;
}

export interface Booking {
  id: number;
  business_id: number;
  customer_id: number;
  service_id: number;
  date: string;
  status: string;
}

export interface BookingResponse {
  booking_id: number;
  whatsapp_link: string;
}

export interface AuthResponse {
  access_token: string;
  business: Business;
}
