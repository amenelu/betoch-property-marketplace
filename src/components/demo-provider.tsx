"use client";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { getBrowserClient } from "@/lib/supabase";
export type DemoRole = "buyer" | "owner" | "broker" | "admin";
export type DemoUser = {
  id: string;
  name: string;
  email: string;
  role: DemoRole;
} | null;
export type Inquiry = {
  id: string;
  propertyId: string;
  propertyTitle: string;
  message: string;
  status: "new" | "read" | "responded" | "closed";
  createdAt: string;
};
export type Report = {
  id: string;
  propertyId: string;
  propertyTitle: string;
  reason: string;
  description: string;
  status: "open" | "reviewing" | "resolved" | "dismissed";
  createdAt: string;
};
export type DemoListing = {
  id: string;
  title: string;
  neighborhood: string;
  price: number;
  status: "draft" | "pending_review" | "published" | "rejected";
  createdAt: string;
};
export type SellerAnalytics = {
  views: number;
  favorites: number;
  inquiries: number;
  byProperty: Record<string, { views: number; favorites: number; inquiries: number }>;
};
export type BookingRequest = {
  id: string;
  propertyId: string;
  propertyTitle: string;
  guestName: string;
  checkIn: string;
  checkOut: string;
  guestCount: number;
  message: string;
  status: "pending" | "approved" | "rejected" | "cancelled" | "completed";
  createdAt: string;
};
export type Review = {
  id: string;
  propertyId: string;
  propertyTitle: string;
  rating: number;
  title: string;
  text: string;
  stayType: "short_stay" | "medium_term" | "long_term";
  createdAt: string;
};
type Value = {
  ready: boolean;
  user: DemoUser;
  favorites: string[];
  inquiries: Inquiry[];
  reports: Report[];
  listings: DemoListing[];
  sellerAnalytics: SellerAnalytics;
  bookings: BookingRequest[];
  reviews: Review[];
  error: string;
  signIn: (email: string, password: string) => Promise<DemoRole>;
  signUp: (
    name: string,
    email: string,
    password: string,
    role: Exclude<DemoRole, "admin">,
  ) => Promise<{ confirmed: boolean }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  toggleFavorite: (id: string) => Promise<void>;
  sendInquiry: (
    x: Omit<Inquiry, "id" | "status" | "createdAt">,
  ) => Promise<void>;
  updateInquiry: (id: string, status: Inquiry["status"]) => Promise<void>;
  submitReport: (
    x: Omit<Report, "id" | "status" | "createdAt">,
  ) => Promise<void>;
  updateReport: (id: string, status: Report["status"]) => Promise<void>;
  addListing: (x: Record<string, unknown>) => Promise<string>;
  requestStay: (
    x: Omit<BookingRequest, "id" | "status" | "createdAt" | "guestName">,
  ) => Promise<void>;
  updateBooking: (
    id: string,
    status: BookingRequest["status"],
  ) => Promise<void>;
  addReview: (x: Omit<Review, "id" | "createdAt">) => Promise<void>;
};
const Context = createContext<Value | null>(null);
export function DemoProvider({ children }: { children: React.ReactNode }) {
  const [ready, setReady] = useState(false),
    [user, setUser] = useState<DemoUser>(null),
    [favorites, setFavorites] = useState<string[]>([]),
    [inquiries, setInquiries] = useState<Inquiry[]>([]),
    [reports, setReports] = useState<Report[]>([]),
    [listings, setListings] = useState<DemoListing[]>([]),
    [sellerAnalytics, setSellerAnalytics] = useState<SellerAnalytics>({
      views: 0, favorites: 0, inquiries: 0, byProperty: {},
    }),
    [bookings, setBookings] = useState<BookingRequest[]>([]),
    [reviews, setReviews] = useState<Review[]>([]),
    [error, setError] = useState("");
  const client = getBrowserClient();
  const token = useCallback(async () => {
    const { data } = await client!.auth.getSession();
    if (!data.session) throw new Error("Please sign in to continue");
    return data.session.access_token;
  }, [client]);
  const call = useCallback(
    async (path: string, init?: RequestInit) => {
      const access = await token();
      const response = await fetch(path, {
        ...init,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${access}`,
          ...init?.headers,
        },
      });
      const json = await response.json();
      if (!response.ok) throw new Error(json.error || "Request failed");
      return json;
    },
    [token],
  );
  const refresh = useCallback(async () => {
    if (!client) return;
    const {
      data: { user: authUser },
    } = await client.auth.getUser();
    if (!authUser) {
      setUser(null);
      setFavorites([]);
      setInquiries([]);
      setReports([]);
      setListings([]);
      setSellerAnalytics({ views: 0, favorites: 0, inquiries: 0, byProperty: {} });
      setBookings([]);
      return;
    }
    const { data: profile, error: profileError } = await client
      .from("profiles")
      .select("name,role")
      .eq("id", authUser.id)
      .single();
    if (profileError) throw profileError;
    setUser({
      id: authUser.id,
      name: profile.name,
      email: authUser.email || "",
      role: profile.role,
    });
    const [fav, inq, rep, book, own, events] = await Promise.all([
      client.from("favorites").select("property_id"),
      call("/api/inquiries"),
      client
        .from("property_reports")
        .select("*,properties(title)")
        .order("created_at", { ascending: false }),
      call("/api/bookings"),
      client
        .from("properties")
        .select("id,title,neighborhood,price,status,created_at")
        .eq("owner_id", authUser.id)
        .order("created_at", { ascending: false }),
      client
        .from("analytics_events")
        .select("property_id,event_type")
        .in("event_type", ["view", "favorite", "inquiry"]),
    ]);
    setFavorites((fav.data || []).map((x: { property_id: string }) => x.property_id));
    setInquiries(
      (inq.data || []).map((x: any) => ({
        id: x.id,
        propertyId: x.property_id,
        propertyTitle: x.properties?.title || "Property",
        message: x.message,
        status: x.status,
        createdAt: x.created_at,
      })),
    );
    setReports(
      (rep.data || []).map((x: any) => ({
        id: x.id,
        propertyId: x.property_id,
        propertyTitle: x.properties?.title || "Property",
        reason: x.reason,
        description: x.description || "",
        status: x.status,
        createdAt: x.created_at,
      })),
    );
    setBookings(
      (book.data || []).map((x: any) => ({
        id: x.id,
        propertyId: x.property_id,
        propertyTitle: x.properties?.title || "Stay",
        guestName: "Guest",
        checkIn: x.check_in,
        checkOut: x.check_out,
        guestCount: x.guest_count,
        message: x.message,
        status: x.status,
        createdAt: x.created_at,
      })),
    );
    setListings(
      (own.data || []).map((x: any) => ({
        id: x.id,
        title: x.title,
        neighborhood: x.neighborhood || "",
        price: Number(x.price),
        status: x.status,
        createdAt: x.created_at,
      })),
    );
    const ownedIds = new Set<string>((own.data || []).map((x: any) => String(x.id)));
    const received = (inq.data || []).filter(
      (x: any) => x.recipient_id === authUser.id && ownedIds.has(x.property_id),
    );
    const byProperty: SellerAnalytics["byProperty"] = {};
    ownedIds.forEach((id) => {
      byProperty[id] = { views: 0, favorites: 0, inquiries: 0 };
    });
    let views = 0;
    let favoriteEvents = 0;
    for (const event of events.data || []) {
      if (!event.property_id || !ownedIds.has(event.property_id)) continue;
      if (event.event_type === "view") { views++; byProperty[event.property_id].views++; }
      if (event.event_type === "favorite") { favoriteEvents++; byProperty[event.property_id].favorites++; }
    }
    for (const inquiry of received) byProperty[inquiry.property_id].inquiries++;
    setSellerAnalytics({ views, favorites: favoriteEvents, inquiries: received.length, byProperty });
  }, [client, call]);
  useEffect(() => {
    if (!client) {
      setError("Supabase is not configured");
      setReady(true);
      return;
    }
    client.auth
      .getSession()
      .then(() => refresh())
      .catch((e: Error) => setError(e.message))
      .finally(() => setReady(true));
    const { data } = client.auth.onAuthStateChange(() => {
      setTimeout(() => refresh().catch((e: Error) => setError(e.message)), 0);
    });
    return () => data.subscription.unsubscribe();
  }, [client, refresh]);
  const safely = useCallback(async (fn: () => Promise<void>) => {
    setError("");
    try {
      await fn();
    } catch (e) {
      const message = e instanceof Error ? e.message : "Request failed";
      setError(message);
      throw e;
    }
  }, []);
  const value = useMemo<Value>(
    () => ({
      ready,
      user,
      favorites,
      inquiries,
      reports,
      listings,
      sellerAnalytics,
      bookings,
      reviews,
      error,
      signIn: async (email, password) => {
        if (!client) throw new Error("Supabase is not configured");
        const { data, error } = await client.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        const { data: p, error: pe } = await client
          .from("profiles")
          .select("role")
          .eq("id", data.user.id)
          .single();
        if (pe) throw pe;
        await refresh();
        return p.role;
      },
      signUp: async (name, email, password, role) => {
        if (!client) throw new Error("Supabase is not configured");
        const { data, error } = await client.auth.signUp({
          email,
          password,
          options: {
            data: { name, role },
            emailRedirectTo: `${location.origin}/login`,
          },
        });
        if (error) throw error;
        return { confirmed: !!data.session };
      },
      signOut: async () => {
        await client?.auth.signOut();
        setUser(null);
      },
      resetPassword: async (email) => {
        if (!client) throw new Error("Supabase is not configured");
        const { error } = await client.auth.resetPasswordForEmail(email, {
          redirectTo: `${location.origin}/reset-password`,
        });
        if (error) throw error;
      },
      toggleFavorite: async (id) =>
        safely(async () => {
          const access = await token();
          const saved = favorites.includes(id);
          const response = await fetch(`/api/favorites/${id}`, {
            method: saved ? "DELETE" : "POST",
            headers: { Authorization: `Bearer ${access}` },
          });
          if (!response.ok) throw new Error((await response.json()).error);
          setFavorites((v) => (saved ? v.filter((x) => x !== id) : [...v, id]));
        }),
      sendInquiry: async (x) =>
        safely(async () => {
          await call("/api/inquiries", {
            method: "POST",
            body: JSON.stringify({
              property_id: x.propertyId,
              message: x.message,
            }),
          });
          await refresh();
        }),
      updateInquiry: async (id, status) =>
        safely(async () => {
          await call(`/api/inquiries/${id}`, {
            method: "PATCH",
            body: JSON.stringify({ status }),
          });
          await refresh();
        }),
      submitReport: async (x) =>
        safely(async () => {
          await call("/api/reports", {
            method: "POST",
            body: JSON.stringify({
              property_id: x.propertyId,
              reason: x.reason,
              description: x.description,
            }),
          });
          await refresh();
        }),
      updateReport: async (id, status) =>
        safely(async () => {
          await call(`/api/admin/reports/${id}`, {
            method: "PATCH",
            body: JSON.stringify({ status }),
          });
          await refresh();
        }),
      addListing: async (x) => {
        const json = await call("/api/properties", {
          method: "POST",
          body: JSON.stringify(x),
        });
        await refresh();
        return json.data.id;
      },
      requestStay: async (x) =>
        safely(async () => {
          await call("/api/bookings", {
            method: "POST",
            body: JSON.stringify({
              property_id: x.propertyId,
              check_in: x.checkIn,
              check_out: x.checkOut,
              guest_count: x.guestCount,
              message: x.message,
            }),
          });
          await refresh();
        }),
      updateBooking: async (id, status) =>
        safely(async () => {
          await call(`/api/bookings/${id}`, {
            method: "PATCH",
            body: JSON.stringify({ status }),
          });
          await refresh();
        }),
      addReview: async (x) => {
        setReviews((v) => [
          {
            ...x,
            id: crypto.randomUUID(),
            createdAt: new Date().toISOString(),
          },
          ...v,
        ]);
      },
    }),
    [
      ready,
      user,
      favorites,
      inquiries,
      reports,
      listings,
      sellerAnalytics,
      bookings,
      reviews,
      error,
      client,
      refresh,
      safely,
      token,
      call,
    ],
  );
  return <Context.Provider value={value}>{children}</Context.Provider>;
}
export function useDemo() {
  const value = useContext(Context);
  if (!value) throw new Error("AuthProvider is missing");
  return value;
}
