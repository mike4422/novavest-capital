"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Link as LinkIcon, Save, Send, MessageCircle, AtSign, Users, Camera, Mail, Smartphone } from "lucide-react";
import { AdminHeader } from "@/components/admin/admin-header";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function LinksReplacementPage() {
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  // Link States
  const [telegram, setTelegram] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [twitter, setTwitter] = useState("");
  const [facebook, setFacebook] = useState("");
  const [instagram, setInstagram] = useState("");
  const [supportEmail, setSupportEmail] = useState("");
  const [iosApp, setIosApp] = useState("");
  const [androidApp, setAndroidApp] = useState("");

  useEffect(() => {
    fetchSettings();
  }, []);

  async function fetchSettings() {
    setFetching(true);
    try {
      const res = await fetch("/api/admin/links-replacement");
      const json = await res.json();
      
      if (json.ok && json.settings) {
        setTelegram(json.settings.telegram || "");
        setWhatsapp(json.settings.whatsapp || "");
        setTwitter(json.settings.twitter || "");
        setFacebook(json.settings.facebook || "");
        setInstagram(json.settings.instagram || "");
        setSupportEmail(json.settings.supportEmail || "");
        setIosApp(json.settings.iosApp || "");
        setAndroidApp(json.settings.androidApp || "");
      }
    } catch (err) {
      toast.error("Failed to load global links.");
    } finally {
      setFetching(false);
    }
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    const payload = {
      telegram,
      whatsapp,
      twitter,
      facebook,
      instagram,
      supportEmail,
      iosApp,
      androidApp
    };

    try {
      const res = await fetch("/api/admin/links-replacement", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();

      if (!res.ok) throw new Error(data.error);
      
      toast.success(data.message);
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  }

  if (fetching) {
    return <div className="p-12 text-center text-slate-500">Loading global links...</div>;
  }

  return (
    <>
      <AdminHeader 
        title="Links Replacement" 
        subtitle="Manage global URLs for social media, community groups, and app downloads." 
      />
      
      <form onSubmit={handleSave} className="p-4 md:p-8 space-y-8 max-w-5xl">
        
        {/* Top Bar with Save Button */}
        <div className="flex items-center justify-between bg-slate-950/50 p-4 rounded-2xl border border-white/10">
          <p className="text-sm text-slate-400">Updating URLs here will instantly reflect across your entire frontend.</p>
          <Button type="submit" variant="premium" loading={loading}>
            <Save className="h-4 w-4 mr-2" /> Save All Links
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Direct Communication Box */}
          <Card className="glass-card p-6 border-sky-500/20">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold flex items-center gap-2 text-sky-400">
                <MessageCircle className="h-5 w-5" /> Direct Communication
              </h2>
            </div>
            
            <div className="space-y-5">
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Send className="h-4 w-4 text-sky-400" /> Telegram Group / Channel
                </Label>
                <Input 
                  type="url"
                  value={telegram} 
                  onChange={(e) => setTelegram(e.target.value)} 
                  placeholder="https://t.me/your_channel"
                />
              </div>

              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <MessageCircle className="h-4 w-4 text-emerald-400" /> WhatsApp Support
                </Label>
                <Input 
                  type="url"
                  value={whatsapp} 
                  onChange={(e) => setWhatsapp(e.target.value)} 
                  placeholder="https://wa.me/1234567890"
                />
              </div>

              <div className="space-y-2 pt-2">
                <Label className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-rose-400" /> Support Email
                </Label>
                <Input 
                  type="email"
                  value={supportEmail} 
                  onChange={(e) => setSupportEmail(e.target.value)} 
                  placeholder="support@novavest-capitals.com"
                />
              </div>
            </div>
          </Card>

          {/* Social Media Box */}
          <Card className="glass-card p-6 border-violet-500/20">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold flex items-center gap-2 text-violet-400">
                <LinkIcon className="h-5 w-5" /> Social Media Profiles
              </h2>
            </div>
            
            <div className="space-y-5">
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <AtSign className="h-4 w-4 text-sky-400" /> X (Twitter) URL
                </Label>
                <Input 
                  type="url"
                  value={twitter} 
                  onChange={(e) => setTwitter(e.target.value)} 
                  placeholder="https://twitter.com/your_handle"
                />
              </div>

              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-blue-500" /> Facebook Page
                </Label>
                <Input 
                  type="url"
                  value={facebook} 
                  onChange={(e) => setFacebook(e.target.value)} 
                  placeholder="https://facebook.com/your_page"
                />
              </div>

              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Camera className="h-4 w-4 text-pink-500" /> Instagram Profile
                </Label>
                <Input 
                  type="url"
                  value={instagram} 
                  onChange={(e) => setInstagram(e.target.value)} 
                  placeholder="https://instagram.com/your_profile"
                />
              </div>
            </div>
          </Card>

          {/* Mobile Apps Box */}
          <Card className="glass-card p-6 border-emerald-500/20 lg:col-span-2">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold flex items-center gap-2 text-emerald-400">
                <Smartphone className="h-5 w-5" /> Mobile App Downloads
              </h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label>Apple App Store URL</Label>
                <Input 
                  type="url"
                  value={iosApp} 
                  onChange={(e) => setIosApp(e.target.value)} 
                  placeholder="https://apps.apple.com/app/id123456789"
                />
              </div>

              <div className="space-y-2">
                <Label>Google Play Store URL</Label>
                <Input 
                  type="url"
                  value={androidApp} 
                  onChange={(e) => setAndroidApp(e.target.value)} 
                  placeholder="https://play.google.com/store/apps/details?id=com.yourapp"
                />
              </div>
            </div>
          </Card>

        </div>
      </form>
    </>
  );
}