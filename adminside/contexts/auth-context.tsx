"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { User } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";
import { Database } from "@/lib/database.types";

type AdminUser = Database["public"]["Tables"]["admin_users"]["Row"];

interface AuthContextType {
  user: User | null;
  adminUser: AdminUser | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signUp: (email: string, password: string, fullName: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [adminUser, setAdminUser] = useState<AdminUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [isFetchingAdmin, setIsFetchingAdmin] = useState(false);

  useEffect(() => {
    // Check active sessions and subscribe to auth changes
    supabase.auth.getSession().then(({ data: { session } }) => {
      console.log("Initial session check:", session?.user?.email || "No user");
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchAdminUser(session.user.id);
      } else {
        setLoading(false);
      }
    }).catch((error) => {
      console.error("Error getting session:", error);
      setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log("🔔 Auth state changed:", event, session?.user?.email || "No user");

      // Only update on certain events to avoid redundant calls
      if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED' || event === 'SIGNED_OUT') {
        console.log("🔄 Processing auth event:", event);
        setUser(session?.user ?? null);
        if (session?.user) {
          console.log("👤 User found, fetching admin user...");
          await fetchAdminUser(session.user.id);
        } else {
          console.log("❌ No user, setting states to null");
          setAdminUser(null);
          setLoading(false);
        }
      } else {
        console.log("⏭️ Skipping event:", event);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const fetchAdminUser = async (userId: string) => {
    // Prevent multiple simultaneous calls
    if (isFetchingAdmin) {
      console.log("⏭️ fetchAdminUser already in progress, skipping...");
      return;
    }

    console.log("🔍 fetchAdminUser START - userId:", userId);
    setIsFetchingAdmin(true);

    try {
      // Direct query without custom timeout - let Supabase handle it
      const { data, error } = await supabase
        .from("admin_users")
        .select("*")
        .eq("user_id", userId)
        .maybeSingle<AdminUser>();

      console.log("📊 Query complete - data:", data, "error:", error);

      if (error) {
        console.error("❌ Error fetching admin user:", error.message, error);

        // Log detailed error info for debugging
        if (error.code) console.error("Error code:", error.code);
        if (error.details) console.error("Error details:", error.details);
        if (error.hint) console.error("Error hint:", error.hint);

        setAdminUser(null);
      } else if (data) {
        console.log("✅ Data received - is_active:", data.is_active);
        if (data.is_active) {
          console.log("✅ Admin user SET - email:", data.email);
          setAdminUser(data);
        } else {
          console.warn("⚠️ User found but not active:", data.email);
          setAdminUser(null);
        }
      } else {
        // No admin user found - this might mean the record doesn't exist
        console.warn("⚠️ No admin_users record found for user_id:", userId);
        console.log("💡 You may need to create an admin_users record in Supabase");
        setAdminUser(null);
      }
    } catch (error: any) {
      console.error("❌ Exception in fetchAdminUser:", error?.message || error);
      console.error("Full error:", error);
      setAdminUser(null);
    } finally {
      console.log("🏁 fetchAdminUser COMPLETE - setting loading to FALSE");
      setIsFetchingAdmin(false);
      setLoading(false);
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error("Sign in error:", error);
        return { error };
      }

      console.log("Sign in successful:", data.user?.email);
      return { error: null };
    } catch (error) {
      console.error("Unexpected sign in error:", error);
      return { error };
    }
  };

  const signUp = async (email: string, password: string, fullName: string) => {
    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
          },
        },
      });

      if (error) return { error };

      // User will be automatically added to admin_users table via database trigger
      return { error: null };
    } catch (error) {
      return { error };
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setAdminUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        adminUser,
        loading,
        signIn,
        signUp,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
