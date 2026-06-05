import { Mail, MessageCircle, Send, AtSign, Users, Camera } from "lucide-react";
import { PublicNavbar } from "@/components/layout/public-navbar";
import { Footer } from "@/components/layout/footer";
import { Card } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/server";

export const metadata = {
  title: "Contact Us | NovaVest Capital",
  description: "Get in touch with the NovaVest Capital support team and follow our official channels.",
};

export default async function ContactPage() {
  const supabase = await createClient();
  const { data } = await supabase.from("settings").select("value").eq("key", "links_replacement").single();
  const globalLinks = data?.value || {};

  return (
    <>
      <PublicNavbar />
      
      <main className="min-h-screen py-24 page-shell relative overflow-hidden">
        {/* Decorative Background Elements */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-teal-500/20 blur-[120px] rounded-full pointer-events-none" />
        
        <div className="max-w-3xl mx-auto relative z-10 text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-black tracking-tight mb-6">How can we help you?</h1>
          <p className="text-lg text-slate-400">
            Our enterprise support team is available 24/7. Reach out via email, connect with us on messaging apps, or follow our official social channels.
          </p>
        </div>

        {/* Support Channels Grid */}
        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          
          {/* Email Card */}
          <Card className="glass-card p-8 flex flex-col items-center text-center hover:-translate-y-1 transition-transform duration-300">
            <div className="h-14 w-14 rounded-full bg-rose-500/10 flex items-center justify-center mb-6">
              <Mail className="h-7 w-7 text-rose-400" />
            </div>
            <h3 className="text-lg font-bold mb-2">Email Support</h3>
            <p className="text-sm text-slate-400 mb-6 flex-1">Drop us an email anytime. We typically respond within 24 hours.</p>
            <a href={`mailto:${globalLinks.supportEmail || "support@novavest-capitals.com"}`} className="text-rose-400 font-bold hover:underline">
              {globalLinks.supportEmail || "support@novavest-capitals.com"}
            </a>
          </Card>

          {/* Telegram Card */}
          <Card className="glass-card p-8 flex flex-col items-center text-center hover:-translate-y-1 transition-transform duration-300">
            <div className="h-14 w-14 rounded-full bg-sky-500/10 flex items-center justify-center mb-6">
              <Send className="h-7 w-7 text-sky-400" />
            </div>
            <h3 className="text-lg font-bold mb-2">Telegram Community</h3>
            <p className="text-sm text-slate-400 mb-6 flex-1">Join our official Telegram channel for instant updates and live chat.</p>
            {globalLinks.telegram ? (
              <a href={globalLinks.telegram} target="_blank" rel="noopener noreferrer" className="text-sky-400 font-bold hover:underline">
                Join @Telegram
              </a>
            ) : (
              <span className="text-slate-500 text-sm">Temporarily Unavailable</span>
            )}
          </Card>

          {/* WhatsApp Card */}
          <Card className="glass-card p-8 flex flex-col items-center text-center hover:-translate-y-1 transition-transform duration-300">
            <div className="h-14 w-14 rounded-full bg-emerald-500/10 flex items-center justify-center mb-6">
              <MessageCircle className="h-7 w-7 text-emerald-400" />
            </div>
            <h3 className="text-lg font-bold mb-2">WhatsApp Support</h3>
            <p className="text-sm text-slate-400 mb-6 flex-1">Chat directly with a support agent via our official WhatsApp line.</p>
            {globalLinks.whatsapp ? (
              <a href={globalLinks.whatsapp} target="_blank" rel="noopener noreferrer" className="text-emerald-400 font-bold hover:underline">
                Message Us
              </a>
            ) : (
              <span className="text-slate-500 text-sm">Temporarily Unavailable</span>
            )}
          </Card>

          {/* X (Twitter) Card */}
          <Card className="glass-card p-8 flex flex-col items-center text-center hover:-translate-y-1 transition-transform duration-300">
            <div className="h-14 w-14 rounded-full bg-slate-500/10 flex items-center justify-center mb-6">
              <AtSign className="h-7 w-7 text-slate-300" />
            </div>
            <h3 className="text-lg font-bold mb-2">X (Twitter)</h3>
            <p className="text-sm text-slate-400 mb-6 flex-1">Follow us for the latest market insights and platform announcements.</p>
            {globalLinks.twitter ? (
              <a href={globalLinks.twitter} target="_blank" rel="noopener noreferrer" className="text-slate-300 font-bold hover:underline">
                Follow on X
              </a>
            ) : (
              <span className="text-slate-500 text-sm">Temporarily Unavailable</span>
            )}
          </Card>

          {/* Facebook Card */}
          <Card className="glass-card p-8 flex flex-col items-center text-center hover:-translate-y-1 transition-transform duration-300">
            <div className="h-14 w-14 rounded-full bg-blue-500/10 flex items-center justify-center mb-6">
              <Users className="h-7 w-7 text-blue-500" />
            </div>
            <h3 className="text-lg font-bold mb-2">Facebook</h3>
            <p className="text-sm text-slate-400 mb-6 flex-1">Join our Facebook community to connect with other investors globally.</p>
            {globalLinks.facebook ? (
              <a href={globalLinks.facebook} target="_blank" rel="noopener noreferrer" className="text-blue-500 font-bold hover:underline">
                Visit our Page
              </a>
            ) : (
              <span className="text-slate-500 text-sm">Temporarily Unavailable</span>
            )}
          </Card>

          {/* Instagram Card */}
          <Card className="glass-card p-8 flex flex-col items-center text-center hover:-translate-y-1 transition-transform duration-300">
            <div className="h-14 w-14 rounded-full bg-pink-500/10 flex items-center justify-center mb-6">
              <Camera className="h-7 w-7 text-pink-500" />
            </div>
            <h3 className="text-lg font-bold mb-2">Instagram</h3>
            <p className="text-sm text-slate-400 mb-6 flex-1">Check out our visual updates and behind-the-scenes content.</p>
            {globalLinks.instagram ? (
              <a href={globalLinks.instagram} target="_blank" rel="noopener noreferrer" className="text-pink-500 font-bold hover:underline">
                Follow on Instagram
              </a>
            ) : (
              <span className="text-slate-500 text-sm">Temporarily Unavailable</span>
            )}
          </Card>

        </div>
      </main>

      <Footer />
    </>
  );
}