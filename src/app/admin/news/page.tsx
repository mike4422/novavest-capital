"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Newspaper, Save, Trash2, Edit, Plus, Eye, EyeOff, Calendar } from "lucide-react";
import { AdminHeader } from "@/components/admin/admin-header";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";

export default function NewsPage() {
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  // Form State
  const [editId, setEditId] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [published, setPublished] = useState("true");

  // Data State
  const [news, setNews] = useState<any[]>([]);

  useEffect(() => {
    fetchNews();
  }, []);

  async function fetchNews() {
    setFetching(true);
    try {
      const res = await fetch("/api/admin/news");
      const json = await res.json();
      if (json.ok && json.news) {
        setNews(json.news);
      }
    } catch (err) {
      toast.error("Failed to load news articles.");
    } finally {
      setFetching(false);
    }
  }

  function handleEdit(article: any) {
    setEditId(article.id);
    setTitle(article.title);
    setContent(article.content);
    setPublished(article.published ? "true" : "false");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function handleReset() {
    setEditId(null);
    setTitle("");
    setContent("");
    setPublished("true");
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    const payload = {
      id: editId,
      title,
      content,
      published: published === "true"
    };

    try {
      const res = await fetch("/api/admin/news", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();

      if (!res.ok) throw new Error(data.error);
      
      toast.success(data.message);
      handleReset();
      fetchNews();
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Are you sure you want to permanently delete this article?")) return;

    try {
      const res = await fetch(`/api/admin/news?id=${id}`, { method: "DELETE" });
      const data = await res.json();

      if (!res.ok) throw new Error(data.error);
      
      toast.success(data.message);
      if (editId === id) handleReset();
      fetchNews();
    } catch (err: any) {
      toast.error(err.message);
    }
  }

  return (
    <>
      <AdminHeader 
        title="News & Announcements" 
        subtitle="Publish public-facing updates, market insights, and platform news." 
      />
      
      <div className="p-4 md:p-8 grid grid-cols-1 xl:grid-cols-[450px_1fr] gap-8">
        
        {/* Left Column: Editor */}
        <Card className="glass-card p-6 border-indigo-500/20 h-fit sticky top-24">
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-bold flex items-center gap-2 text-indigo-400">
              {editId ? <Edit className="h-5 w-5" /> : <Plus className="h-5 w-5" />} 
              {editId ? "Edit Article" : "Create New Article"}
            </h2>
            {editId && (
              <Button type="button" variant="ghost" size="sm" onClick={handleReset} className="h-7 text-xs text-slate-400">
                Cancel Edit
              </Button>
            )}
          </div>
          
          <form onSubmit={handleSave} className="space-y-5">
            <div className="space-y-2">
              <Label>Article Title</Label>
              <Input 
                placeholder="e.g. Q3 Roadmap Update" 
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label>Article Content (Supports simple HTML)</Label>
              <Textarea 
                placeholder="Write your announcement here..." 
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="min-h-[250px] resize-y leading-relaxed"
                required
              />
            </div>

            <div className="space-y-2">
              <Label>Visibility Status</Label>
              <Select value={published} onValueChange={setPublished}>
                <SelectTrigger className={published === "true" ? "border-emerald-500/50 text-emerald-300 bg-emerald-500/10" : "border-amber-500/50 text-amber-300 bg-amber-500/10"}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="true">
                    <span className="flex items-center gap-2"><Eye className="h-4 w-4" /> Published (Live on site)</span>
                  </SelectItem>
                  <SelectItem value="false">
                    <span className="flex items-center gap-2"><EyeOff className="h-4 w-4" /> Draft (Hidden)</span>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button type="submit" variant="premium" className="w-full" loading={loading}>
              <Save className="h-4 w-4 mr-2" /> {editId ? "Save Changes" : "Publish Article"}
            </Button>
          </form>
        </Card>

        {/* Right Column: News History */}
        <Card className="glass-card flex flex-col">
          <div className="p-6 border-b border-white/10 flex items-center justify-between bg-white/[0.02]">
            <h2 className="font-bold flex items-center gap-2 text-slate-300">
              <Newspaper className="h-5 w-5" /> Article Directory
            </h2>
            <Badge variant="secondary" className="bg-white/5 border-white/10 text-slate-300">
              {news.length} Articles
            </Badge>
          </div>
          
          <div className="overflow-x-auto flex-1 p-0">
            {fetching ? (
              <div className="p-12 text-center text-slate-500">Loading articles...</div>
            ) : news.length === 0 ? (
              <div className="p-12 text-center">
                <Newspaper className="h-8 w-8 text-slate-500 mx-auto mb-3 opacity-50" />
                <p className="text-slate-400 text-lg">No news published yet.</p>
                <p className="text-slate-500 text-sm mt-1">Use the editor to create your first announcement.</p>
              </div>
            ) : (
              <div className="divide-y divide-white/5">
                {news.map((article: any) => (
                  <div key={article.id} className={`p-5 transition-colors ${editId === article.id ? 'bg-indigo-500/10' : 'hover:bg-white/[0.02]'}`}>
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                      
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center gap-3">
                          <h4 className="font-bold text-base text-white">{article.title}</h4>
                          <Badge variant={article.published ? "success" : "secondary"} className="text-[9px] h-4">
                            {article.published ? "LIVE" : "DRAFT"}
                          </Badge>
                        </div>
                        
                        <p className="text-sm text-slate-400 line-clamp-2 pr-8">{article.content}</p>
                        
                        <div className="flex items-center gap-2 text-[11px] text-slate-500 font-mono">
                          <Calendar className="h-3 w-3" />
                          {new Date(article.created_at).toLocaleDateString()} at {new Date(article.created_at).toLocaleTimeString()}
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0 border-t sm:border-t-0 border-white/10 pt-3 sm:pt-0">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => handleEdit(article)}
                          className="text-slate-300 hover:text-white"
                        >
                          <Edit className="h-4 w-4 mr-2" /> Edit
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => handleDelete(article.id)}
                          className="text-slate-400 hover:text-rose-400 hover:bg-rose-500/10"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>

                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </Card>

      </div>
    </>
  );
}