export interface Property {
  id: string;
  title: string;
  location: string;
  price: string;
  priceRaw: number;
  bedrooms: number;
  bathrooms: number;
  surface: number;
  parking: number;
  type: string;
  typeId: number;
  image: string;
  gallery: string[];
  description: string;
  features: string[];
  year: number | null;
  latitude: number | null;
  longitude: number | null;
  postedAt: string;
}

export interface PropertyLocation {
  id: string;
  title: string;
  location: string;
  type: string;
  priceRaw: number;
  latitude: number;
  longitude: number;
}

export interface PropertyType {
  id: number;
  name: string;
  _count: {
    properties: number;
  };
}

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface PropertiesResponse {
  properties: Property[];
  pagination: Pagination;
}

export interface User {
  id: string;
  email: string;
  username: string;
  firstName: string;
  lastName: string;
  role: "Superadmin" | "Admin" | "AgencyHead" | "User";
  createdAt?: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

export type PropertySort = "recent" | "price_asc" | "price_desc" | "surface_desc";

export interface PropertyFilters {
  search?: string;
  type?: string;
  minPrice?: number;
  maxPrice?: number;
  minSurface?: number;
  maxSurface?: number;
  minBedrooms?: number;
  minBathrooms?: number;
  minGarage?: number;
  sort?: PropertySort;
  page?: number;
  limit?: number;
}

export interface ContactPayload {
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
  propertyId?: string;
}

export interface ContactMessage {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  subject: string;
  message: string;
  propertyId: string | null;
  propertyName: string | null;
  createdAt: string;
}

export interface ContactMessagesResponse {
  messages: ContactMessage[];
  pagination: Pagination;
}

export interface CreatePropertyPayload {
  name: string;
  description: string;
  typeId: number;
  localisation: string;
  price: number;
  surface: number;
  bedroom: number;
  bathroom: number;
  garage: number;
  photos?: string[];
  details?: {
    features?: string[];
    year?: number;
    latitude?: number;
    longitude?: number;
  };
}
