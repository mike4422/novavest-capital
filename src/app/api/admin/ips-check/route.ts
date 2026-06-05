import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireAdmin } from "@/lib/auth";

export async function GET() {
  try {
    await requireAdmin();
    const admin = createAdminClient();
    
    // Fetch all profiles to analyze IPs
    const { data: profiles, error } = await admin
      .from("profiles")
      .select("id, email, full_name, registration_ip, last_login_ip");
      
    if (error) throw error;

    // Group users by IP address
    const ipMap = new Map();

    profiles.forEach(user => {
      // Process Registration IP
      if (user.registration_ip) {
        if (!ipMap.has(user.registration_ip)) ipMap.set(user.registration_ip, new Map());
        ipMap.get(user.registration_ip).set(user.id, { 
          id: user.id, 
          email: user.email, 
          name: user.full_name, 
          type: 'Registration' 
        });
      }
      // Process Last Login IP
      if (user.last_login_ip) {
        if (!ipMap.has(user.last_login_ip)) ipMap.set(user.last_login_ip, new Map());
        const existing = ipMap.get(user.last_login_ip).get(user.id);
        ipMap.get(user.last_login_ip).set(user.id, { 
          id: user.id, 
          email: user.email, 
          name: user.full_name, 
          // If they also registered with this IP, mark as Both
          type: existing ? 'Reg & Login' : 'Last Login' 
        });
      }
    });

    // Format the results into an array
    const results = Array.from(ipMap.entries()).map(([ip, userMap]) => ({
      ip,
      users: Array.from(userMap.values())
    })).filter(entry => entry.ip !== null && entry.ip !== '');

    // Sort to show IPs with multiple users (fraud risk) at the very top
    results.sort((a, b) => b.users.length - a.users.length);
    
    return NextResponse.json({ ok: true, data: results });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to run IP check." }, { status: 500 });
  }
}