import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase.js";

export function useProfile(user) {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      setProfile(null);
      return;
    }

    setLoading(true);
    const fetchProfile = async () => {
      try {
        const { data, error } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", user.id)
          .single();

        if (error && error.code !== 'PGRST116') { // PGRST116 means row not found, which is ok for new users
          throw error;
        }
        setProfile(data);
      } catch (err) {
        console.error("Error fetching profile:", err);
        setProfile(null);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [user]);

  async function updateProfile(updates = {}) {
    if (!user) throw new Error("No user available to update profile.");
    const payload = { ...updates, id: user.id, updated_at: new Date() };
    const { data, error } = await supabase
      .from("profiles")
      .upsert(payload)
      .select()
      .single();
    if (error) throw error;
    setProfile(data);
    return data;
  }

  return { profile, loading, updateProfile };
}