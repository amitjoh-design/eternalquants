"use client";

import { useEffect, useState } from "react";
import Hero from "@/components/Hero";
import Dashboard from "@/components/Dashboard";
import { supabase } from "@/lib/supabase";
import { User } from "@supabase/supabase-js";

export default function Home() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user ?? null);
      setLoading(false);
    };

    checkUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-[#030a06]">
        <div className="w-8 h-8 rounded-full border-2 border-[#00ff8c] border-t-transparent animate-spin"></div>
      </div>
    );
  }

  if (user) {
    return <Dashboard user={user} />;
  }

  return (
    <main className="min-h-screen">
      <Hero />
    </main>
  );
}
