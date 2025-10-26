"use client";

import { useState, useEffect, ChangeEvent } from "react";
import { useRouter } from "next/navigation";
import { getSupabaseClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import ModernHeader from "@/components/modern-header";
import { ThemeToggle } from "@/components/theme-toggle";
import { ArrowLeft, Save } from "lucide-react";
import { toast } from "sonner";

export default function ProfilePage() {
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const router = useRouter();
  const supabase = getSupabaseClient();

  useEffect(() => {
    const checkAuth = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) {
        router.push("/auth");
      } else {
        setUser(session.user);
        await fetchProfile(session.user.id);
      }
      setIsLoading(false);
    };

    checkAuth();
  }, [router, supabase]);

  const fetchProfile = async (userId: string) => {
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .single();

    if (error) {
      console.error("Error fetching profile:", error);
      toast.error("Failed to load profile");
    } else {
      setProfile(data);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/auth");
  };

  const handleBack = () => {
    router.push("/dashboard");
  };

  const handleSave = async () => {
    if (!profile) return;

    setIsSaving(true);
    const { error } = await supabase
      .from("profiles")
      .update({
        full_name: profile.full_name,
        username: profile.username,
        bio: profile.bio,
        website: profile.website,
        updated_at: new Date(),
      })
      .eq("id", profile.id);

    setIsSaving(false);

    if (error) {
      console.error("Error updating profile:", error);
      toast.error("Failed to update profile");
    } else {
      toast.success("Profile updated successfully");
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setProfile({
      ...profile,
      [field]: value,
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-teal-50/50 to-cyan-50/50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50/50 to-cyan-50/50">
      <ModernHeader user={user} onLogout={handleLogout} />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-foreground">
            Profile Information
          </h1>
          <Button
            variant="outline"
            onClick={handleBack}
            className="border-border bg-background/50"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Button>
        </div>
        <div className="bg-card/80 backdrop-blur-sm rounded-lg shadow p-6 border border-border">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">
                Email
              </label>
              <Input
                type="email"
                value={profile?.email || ""}
                disabled
                className="bg-background/50 border-border"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-1">
                Full Name
              </label>
              <Input
                type="text"
                value={profile?.full_name || ""}
                onChange={(e: ChangeEvent<HTMLInputElement>) =>
                  handleInputChange("full_name", e.target.value)
                }
                placeholder="Enter your full name"
                className="bg-background/50 border-border"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-1">
                Username
              </label>
              <Input
                type="text"
                value={profile?.username || ""}
                onChange={(e: ChangeEvent<HTMLInputElement>) =>
                  handleInputChange("username", e.target.value)
                }
                placeholder="Enter your username"
                className="bg-background/50 border-border"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-1">
                Bio
              </label>
              <Textarea
                value={profile?.bio || ""}
                onChange={(e: ChangeEvent<HTMLTextAreaElement>) =>
                  handleInputChange("bio", e.target.value)
                }
                placeholder="Tell us about yourself"
                rows={3}
                className="bg-background/50 border-border"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-1">
                Website
              </label>
              <Input
                type="url"
                value={profile?.website || ""}
                onChange={(e: ChangeEvent<HTMLInputElement>) =>
                  handleInputChange("website", e.target.value)
                }
                placeholder="https://example.com"
                className="bg-background/50 border-border"
              />
            </div>

            <div className="pt-4">
              <Button
                onClick={handleSave}
                disabled={isSaving}
                className="bg-primary hover:bg-primary/90"
              >
                <Save className="mr-2 h-4 w-4" />
                {isSaving ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
