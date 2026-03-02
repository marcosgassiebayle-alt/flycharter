import { z } from "zod";

export const CreateOfferSchema = z.object({
  aircraftId: z.string().min(1, "Seleccioná una aeronave"),
  category: z.enum(["TOUR", "ROUND_TRIP", "ONE_WAY", "RETURN"]),
  vehicleType: z.enum(["PLANE", "HELICOPTER"]),
  origin: z.string().min(1, "El origen es obligatorio"),
  originCode: z.string().optional(),
  originLat: z.number().optional(),
  originLng: z.number().optional(),
  destination: z.string().optional(),
  destinationCode: z.string().optional(),
  destinationLat: z.number().optional(),
  destinationLng: z.number().optional(),
  departureAt: z.string().min(1, "La fecha de salida es obligatoria"),
  returnAt: z.string().optional(),
  basePrice: z.number().min(1, "El precio base es obligatorio"),
  minPrice: z.number().min(0),
  isEmptyLeg: z.boolean().default(false),
  discountType: z.string().optional(),
  discountRules: z.any().optional(),
  cancellationPolicy: z.string().optional(),
  notes: z.string().optional(),
});

export const CreateRequestSchema = z.object({
  customerEmail: z.string().email("Ingresá un email válido"),
  customerName: z.string().min(1, "El nombre es obligatorio"),
  customerPhone: z.string().optional(),
  vehicleType: z.enum(["PLANE", "HELICOPTER"]).optional(),
  category: z.enum(["TOUR", "ROUND_TRIP", "ONE_WAY", "RETURN"]),
  origin: z.string().min(1, "El origen es obligatorio"),
  originCode: z.string().optional(),
  destination: z.string().optional(),
  destinationCode: z.string().optional(),
  departureDate: z.string().min(1, "La fecha de ida es obligatoria"),
  returnDate: z.string().optional(),
  passengersCount: z.number().min(1, "Mínimo 1 pasajero").max(20),
  budgetMin: z.number().optional(),
  budgetMax: z.number().optional(),
  notes: z.string().optional(),
});

export const CreateBidSchema = z.object({
  requestId: z.string().min(1),
  aircraftId: z.string().min(1, "Seleccioná una aeronave"),
  price: z.number().min(1, "El precio es obligatorio"),
  message: z.string().optional(),
  departureAt: z.string().min(1, "La fecha de salida es obligatoria"),
  returnAt: z.string().optional(),
});

export const CreateBookingSchema = z.object({
  offerId: z.string().optional(),
  bidId: z.string().optional(),
  customerEmail: z.string().email("Ingresá un email válido"),
  customerName: z.string().min(1, "El nombre es obligatorio"),
  customerPhone: z.string().optional(),
  passengersCount: z.number().min(1).max(20),
});

export const ContactFormSchema = z.object({
  name: z.string().min(1, "El nombre es obligatorio"),
  email: z.string().email("Ingresá un email válido"),
  subject: z.enum(["Cliente", "Operador", "Prensa", "Otro"]),
  message: z.string().min(10, "El mensaje debe tener al menos 10 caracteres"),
});

export const CreateAircraftSchema = z.object({
  type: z.enum(["PLANE", "HELICOPTER"]),
  model: z.string().min(1, "El modelo es obligatorio"),
  capacity: z.number().min(1).max(50),
  description: z.string().optional(),
  yearBuilt: z.number().optional(),
  registration: z.string().optional(),
  images: z.array(z.string().url()).default([]),
  amenities: z.array(z.string()).default([]),
});

export const LoginSchema = z.object({
  email: z.string().email("Ingresá un email válido"),
  password: z.string().min(6, "La contraseña debe tener al menos 6 caracteres"),
});

export const RegisterSchema = z.object({
  name: z.string().min(1, "El nombre es obligatorio"),
  companyName: z.string().optional(),
  email: z.string().email("Ingresá un email válido"),
  phone: z.string().optional(),
  password: z.string().min(8, "La contraseña debe tener al menos 8 caracteres"),
});
