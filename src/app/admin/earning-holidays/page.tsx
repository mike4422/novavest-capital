"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import { CalendarOff, Save, Calendar, Trash2, Plus, AlertCircle } from "lucide-react";
import { AdminHeader } from "@/components/admin/admin-header";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";

type Holiday = { date: string; reason: string };

export default function EarningHolidaysPage() {
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  // Holiday State
  const [pauseOnWeekends, setPauseOnWeekends] = useState("false");
  const [specificDates, setSpecificDates] = useState<Holiday[]>([]);

  useEffect(() => {
    fetchSettings();
  }, []);

  async function fetchSettings() {
    setFetching(true);
    try {
      const res = await fetch("/api/admin/earning-holidays");
      const json = await res.json();
      
      if (json.ok && json.settings) {
        setPauseOnWeekends(json.settings.pauseOnWeekends ? "true" : "false");
        setSpecificDates(json.settings.specificDates || []);
      }
    } catch (err) {
      toast.error("Failed to load earning holidays.");
    } finally {
      setFetching(false);
    }
  }

  function handleDateChange(index: number, field: keyof Holiday, value: string) {
    const newDates = [...specificDates];
    newDates[index][field] = value;
    setSpecificDates(newDates);
  }

  function addDate() {
    setSpecificDates([...specificDates, { date: "", reason: "" }]);
  }

  function removeDate(index: number) {
    const newDates = specificDates.filter((_, i) => i !== index);
    setSpecificDates(newDates);
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    // Filter out any empty dates before saving
    const cleanDates = specificDates.filter(d => d.date.trim() !== "");

    const payload = {
      pauseOnWeekends: pauseOnWeekends === "true",
      specificDates: cleanDates
    };

    try {
      const res = await fetch("/api/admin/earning-holidays", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();

      if (!res.ok) throw new Error(data.error);
      
      toast.success(data.message);
      setSpecificDates(cleanDates); // Update UI to remove blanks
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  }

  if (fetching) {
    return <div className="p-12 text-center text-slate-500">Loading earning holidays...</div>;
  }

  return (
    <>
      <AdminHeader 
        title="Earning Holidays" 
        subtitle="Configure non-earning days where investments will not generate daily ROI." 
      />
      
      <form onSubmit={handleSave} className="p-4 md:p-8 space-y-8 max-w-5xl">
        
        {/* Top Bar with Save Button */}
        <div className="flex items-center justify-between bg-slate-950/50 p-4 rounded-2xl border border-white/10">
          <p className="text-sm text-slate-400">Control your platform's active trading schedule.</p>
          <Button type="submit" variant="premium" loading={loading}>
            <Save className="h-4 w-4 mr-2" /> Save Schedule
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Weekend Settings */}
          <Card className="glass-card p-6 border-indigo-500/20 h-fit">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold flex items-center gap-2 text-indigo-400">
                <CalendarOff className="h-5 w-5" /> Weekend ROI
              </h2>
              <Badge variant={pauseOnWeekends === "true" ? "warning" : "success"}>
                {pauseOnWeekends === "true" ? "PAUSED" : "ACTIVE"}
              </Badge>
            </div>
            
            <div className="space-y-6">
              <div className="space-y-2">
                <Label>Weekend Earnings Status</Label>
                <Select value={pauseOnWeekends} onValueChange={setPauseOnWeekends}>
                  <SelectTrigger className={pauseOnWeekends === "true" ? "border-amber-500/50 text-amber-300 bg-amber-500/10" : "border-emerald-500/50 text-emerald-300 bg-emerald-500/10"}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="false">Active (Earn 7 days a week)</SelectItem>
                    <SelectItem value="true">Paused (No earnings on Sat/Sun)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {pauseOnWeekends === "true" && (
                <div className="p-3 bg-indigo-500/10 border border-indigo-500/20 rounded-lg flex gap-3 text-indigo-200 text-xs">
                  <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                  <p>When paused, the daily cron job will skip processing ROI for any user on Saturdays and Sundays. The investment duration will effectively take longer to complete.</p>
                </div>
              )}
            </div>
          </Card>

          {/* Specific Calendar Dates */}
          <Card className="glass-card p-6 border-sky-500/20">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold flex items-center gap-2 text-sky-400">
                <Calendar className="h-5 w-5" /> Custom Holidays
              </h2>
              <Badge variant="secondary" className="bg-sky-500/10 text-sky-300 border-sky-500/20">
                {specificDates.length} Days Set
              </Badge>
            </div>
            
            <div className="space-y-4">
              <p className="text-xs text-slate-400 mb-4">
                Define specific dates (like major holidays) where the system should not distribute profits.
              </p>

              {specificDates.map((holiday, index) => (
                <div key={index} className="grid grid-cols-[1fr_1fr_auto] gap-3 animate-in fade-in slide-in-from-bottom-2">
                  <div className="space-y-1">
                    <Label className="text-[10px] text-slate-500">Date</Label>
                    <Input 
                      type="date" 
                      value={holiday.date} 
                      onChange={(e) => handleDateChange(index, "date", e.target.value)} 
                      className="bg-slate-900"
                      required
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-[10px] text-slate-500">Reason / Label</Label>
                    <Input 
                      type="text" 
                      value={holiday.reason} 
                      onChange={(e) => handleDateChange(index, "reason", e.target.value)} 
                      placeholder="e.g. Christmas Day"
                      className="bg-slate-900"
                      required
                    />
                  </div>
                  <div className="flex items-end pb-1">
                    <Button 
                      type="button" 
                      variant="ghost" 
                      size="icon" 
                      onClick={() => removeDate(index)}
                      className="text-slate-500 hover:text-rose-400 hover:bg-rose-500/10"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}

              <Button 
                type="button" 
                variant="outline" 
                className="w-full mt-4 border-dashed border-white/20 text-slate-400 hover:text-white"
                onClick={addDate}
              >
                <Plus className="h-4 w-4 mr-2" /> Add Holiday Date
              </Button>
            </div>
          </Card>

        </div>
      </form>
    </>
  );
}