import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// Handle POST requests (Standard for API fetch calls)
export async function POST() {
  try {
    const supabase = await createClient();
    
    // This securely clears the Supabase session cookies from the server
    await supabase.auth.signOut();
    
    return NextResponse.json({ ok: true, message: "Logged out successfully." });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to log out." }, { status: 500 });
  }
}

// Handle GET requests (In case your logout button is a simple <a> tag or Next.js <Link>)
export async function GET(request: Request) {
  try {
    const supabase = await createClient();
    await supabase.auth.signOut();
    
    // Redirect the user back to the login page after clearing the session
    const requestUrl = new URL(request.url);
    return NextResponse.redirect(new URL("/login", requestUrl.origin));
  } catch (error: any) {
    const requestUrl = new URL(request.url);
    return NextResponse.redirect(new URL("/login", requestUrl.origin));
  }
}