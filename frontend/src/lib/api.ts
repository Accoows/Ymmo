import axios from "axios";
import type {
  PropertiesResponse,
  Property,
  PropertyLocation,
  PropertyType,
  AuthResponse,
  User,
  PropertyFilters,
  ContactPayload,
  ContactMessagesResponse,
  CreatePropertyPayload,
} from "../types";

const api = axios.create({
  baseURL: "/api",
  headers: { "Content-Type": "application/json" },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("pi_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem("pi_token");
      localStorage.removeItem("pi_user");
    }
    return Promise.reject(err);
  }
);

// ─── Properties ─────────────────────────────────────────────────────────────

export async function fetchProperties(
  filters: PropertyFilters = {}
): Promise<PropertiesResponse> {
  const params = Object.fromEntries(
    Object.entries(filters).filter(([, v]) => v !== undefined && v !== "")
  );
  const { data } = await api.get<PropertiesResponse>("/properties", { params });
  return data;
}

export async function fetchFeaturedProperty(): Promise<Property | null> {
  const { data } = await api.get<{ property: Property | null }>(
    "/properties/featured"
  );
  return data.property;
}

export async function fetchPropertyById(id: string): Promise<Property> {
  const { data } = await api.get<{ property: Property }>(`/properties/${id}`);
  return data.property;
}

export async function fetchPropertyLocations(): Promise<PropertyLocation[]> {
  const { data } = await api.get<{ locations: PropertyLocation[] }>(
    "/properties/locations"
  );
  return data.locations;
}

export async function createProperty(
  payload: CreatePropertyPayload
): Promise<Property> {
  const { data } = await api.post<{ property: Property }>(
    "/properties",
    payload
  );
  return data.property;
}

export async function updateProperty(
  id: string,
  payload: Partial<CreatePropertyPayload>
): Promise<Property> {
  const { data } = await api.put<{ property: Property }>(
    `/properties/${id}`,
    payload
  );
  return data.property;
}

export async function deleteProperty(id: string): Promise<void> {
  await api.delete(`/properties/${id}`);
}

// Téléverse des fichiers image et renvoie leurs chemins servis (/uploads/...).
export async function uploadPhotos(files: File[]): Promise<string[]> {
  const formData = new FormData();
  files.forEach((file) => formData.append("photos", file));
  const { data } = await api.post<{ paths: string[] }>("/uploads", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return data.paths;
}

// ─── Property types ──────────────────────────────────────────────────────────

export async function fetchPropertyTypes(): Promise<PropertyType[]> {
  const { data } = await api.get<{ propertyTypes: PropertyType[] }>(
    "/property-types"
  );
  return data.propertyTypes;
}

// ─── Auth ────────────────────────────────────────────────────────────────────

export async function login(
  email: string,
  password: string
): Promise<AuthResponse> {
  const { data } = await api.post<AuthResponse>("/auth/login", {
    email,
    password,
  });
  return data;
}

export async function getMe(): Promise<User> {
  const { data } = await api.get<{ user: User }>("/auth/me");
  return data.user;
}

// ─── Contact ─────────────────────────────────────────────────────────────────

export async function sendContact(payload: ContactPayload): Promise<void> {
  await api.post("/contact", payload);
}

export async function fetchContactMessages(
  page = 1,
  limit = 20
): Promise<ContactMessagesResponse> {
  const { data } = await api.get<ContactMessagesResponse>("/contact", {
    params: { page, limit },
  });
  return data;
}

export async function deleteContactMessage(id: string): Promise<void> {
  await api.delete(`/contact/${id}`);
}
