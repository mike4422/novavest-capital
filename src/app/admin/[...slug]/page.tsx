import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import { AdminHeader } from "@/components/admin/admin-header";
import { Card } from "@/components/ui/card";

// We update the type here so params is treated as a Promise
export default async function GenericAdminPage({ params }: { params: Promise<{ slug: string[] }> }) {
  // Await the params before trying to read the slug
  const resolvedParams = await params;
  const { supabase } = await requireAdmin();
  
  // Now we can safely join the slug
  const path = resolvedParams.slug.join("/");
  
  // Format the URL path into a readable title (e.g. "top-referral-earnings" -> "Top Referral Earnings")
  const title = path.split("-").map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(" ");
  
  // Map certain URL slugs to actual database tables if they exist
  let tableName = path.replace(/-/g, "_"); // "withdrawal-requests" -> "withdrawal_requests"
  
  // Edge cases mapping based on schema
  if (path === "investment-packages") tableName = "investment_plans";
  if (path === "accounts-blacklist") tableName = "profiles"; // Would normally filter by suspended
  if (path === "news" || path === "user-notices") tableName = "announcements";
  
  let dbData: any[] = [];
  let tableHeaders: string[] = [];
  let fetchError = null;

  try {
    // Attempt to fetch from the mapped table
    const { data, error } = await supabase.from(tableName).select("*").limit(50);
    
    if (!error && data && data.length > 0) {
      dbData = data;
      // Dynamically generate table headers based on the keys of the first object
      tableHeaders = Object.keys(data[0]).filter(key => !key.includes('id') && key !== 'metadata'); 
    } else {
      fetchError = error?.message;
    }
  } catch (err) {
    fetchError = "Table structure not directly mapped or currently empty.";
  }

  return (
    <>
      <AdminHeader title={title} subtitle={`Database management for ${title.toLowerCase()}`} />
      
      <div className="p-4 md:p-8">
        <Card className="glass-card overflow-hidden">
          <div className="p-6 border-b border-white/10 flex justify-between items-center bg-white/5">
            <h2 className="text-lg font-bold">{title} Data</h2>
            <div className="text-xs text-slate-400 font-mono">Table: {tableName}</div>
          </div>
          
          <div className="overflow-x-auto">
            {dbData.length > 0 ? (
              <table className="w-full text-left text-sm">
                <thead className="text-xs uppercase text-slate-400 bg-white/[0.02]">
                  <tr className="border-b border-white/10">
                    {tableHeaders.map(header => (
                      <th key={header} className="p-4">{header.replace(/_/g, " ")}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {dbData.map((row, i) => (
                    <tr key={i} className="border-b border-white/5 hover:bg-white/[0.02]">
                      {tableHeaders.map(header => (
                        <td key={header} className="p-4 max-w-[200px] truncate">
                          {String(row[header] ?? "—")}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="p-12 text-center text-slate-400">
                <p className="text-lg mb-2">No data found or interface under construction.</p>
                <p className="text-sm">We successfully routed you to the <strong>{title}</strong> interface. <br/> The database table `{tableName}` is currently empty or requires custom mapping.</p>
              </div>
            )}
          </div>
        </Card>
      </div>
    </>
  );
}