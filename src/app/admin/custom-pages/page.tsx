"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import { FileText, Save, Trash2, Edit, Plus, Eye, EyeOff, Link as LinkIcon, ExternalLink } from "lucide-react";
import { AdminHeader } from "@/components/admin/admin-header";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";

export default function CustomPagesAdmin() {
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  // Form State
  const [editId, setEditId] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [content, setContent] = useState("");
  const [published, setPublished] = useState("true");

  // Data State
  const [pages, setPages] = useState<any[]>([]);

  useEffect(() => {
    fetchPages();
  }, []);

  async function fetchPages() {
    setFetching(true);
    try {
      const res = await fetch("/api/admin/custom-pages");
      const json = await res.json();
      if (json.ok && json.pages) {
        setPages(json.pages);
      }
    } catch (err) {
      toast.error("Failed to load custom pages.");
    } finally {
      setFetching(false);
    }
  }

  // Auto-generate slug from title if it's a new post and slug is empty
  function handleTitleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const newTitle = e.target.value;
    setTitle(newTitle);
    if (!editId) {
      setSlug(newTitle.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, ''));
    }
  }

  function handleEdit(page: any) {
    setEditId(page.id);
    setTitle(page.title);
    setSlug(page.slug);
    setContent(page.content);
    setPublished(page.published ? "true" : "false");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function handleReset() {
    setEditId(null);
    setTitle("");
    setSlug("");
    setContent("");
    setPublished("true");
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    const payload = {
      id: editId,
      title,
      slug,
      content,
      published: published === "true"
    };

    try {
      const res = await fetch("/api/admin/custom-pages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();

      if (!res.ok) throw new Error(data.error);
      
      toast.success(data.message);
      handleReset();
      fetchPages();
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Are you sure you want to permanently delete this page?")) return;

    try {
      const res = await fetch(`/api/admin/custom-pages?id=${id}`, { method: "DELETE" });
      const data = await res.json();

      if (!res.ok) throw new Error(data.error);
      
      toast.success(data.message);
      if (editId === id) handleReset();
      fetchPages();
    } catch (err: any) {
      toast.error(err.message);
    }
  }

  return (
    <>
      <AdminHeader 
        title="Custom Pages" 
        subtitle="Create dynamic, standalone pages like 'About Us' or 'How it Works' without coding." 
      />
      
      <div className="p-4 md:p-8 grid grid-cols-1 xl:grid-cols-[450px_1fr] gap-8">
        
        {/* Left Column: Editor */}
        <Card className="glass-card p-6 border-teal-500/20 h-fit sticky top-24">
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-bold flex items-center gap-2 text-teal-400">
              {editId ? <Edit className="h-5 w-5" /> : <Plus className="h-5 w-5" />} 
              {editId ? "Edit Page" : "Create New Page"}
            </h2>
            {editId && (
              <Button type="button" variant="ghost" size="sm" onClick={handleReset} className="h-7 text-xs text-slate-400">
                Cancel Edit
              </Button>
            )}
          </div>
          
          <form onSubmit={handleSave} className="space-y-5">
            <div className="space-y-2">
              <Label>Page Title</Label>
              <Input 
                placeholder="e.g. Affiliate Program" 
                value={title}
                onChange={handleTitleChange}
                required
              />
            </div>

            <div className="space-y-2">
              <Label>URL Slug</Label>
              <div className="flex items-center relative">
                <span className="absolute left-3 text-slate-500 text-xs">/pages/</span>
                <Input 
                  value={slug}
                  onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
                  className="pl-[60px] font-mono text-sm"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Page Content (HTML Supported)</Label>
              <Textarea 
                placeholder="Write your page content here..." 
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
                    <span className="flex items-center gap-2"><Eye className="h-4 w-4" /> Published (Live)</span>
                  </SelectItem>
                  <SelectItem value="false">
                    <span className="flex items-center gap-2"><EyeOff className="h-4 w-4" /> Draft (Hidden)</span>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button type="submit" variant="premium" className="w-full" loading={loading}>
              <Save className="h-4 w-4 mr-2" /> {editId ? "Save Changes" : "Publish Page"}
            </Button>
          </form>
        </Card>

        {/* Right Column: Page Directory */}
        <Card className="glass-card flex flex-col">
          <div className="p-6 border-b border-white/10 flex items-center justify-between bg-white/[0.02]">
            <h2 className="font-bold flex items-center gap-2 text-slate-300">
              <FileText className="h-5 w-5" /> Page Directory
            </h2>
            <Badge variant="secondary" className="bg-white/5 border-white/10 text-slate-300">
              {pages.length} Pages
            </Badge>
          </div>
          
          <div className="overflow-x-auto flex-1 p-0">
            {fetching ? (
              <div className="p-12 text-center text-slate-500">Loading pages...</div>
            ) : pages.length === 0 ? (
              <div className="p-12 text-center">
                <FileText className="h-8 w-8 text-slate-500 mx-auto mb-3 opacity-50" />
                <p className="text-slate-400 text-lg">No custom pages created.</p>
                <p className="text-slate-500 text-sm mt-1">Use the builder to add your first page.</p>
              </div>
            ) : (
              <div className="divide-y divide-white/5">
                {pages.map((page: any) => (
                  <div key={page.id} className={`p-5 transition-colors ${editId === page.id ? 'bg-teal-500/10' : 'hover:bg-white/[0.02]'}`}>
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                      
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center gap-3">
                          <h4 className="font-bold text-base text-white">{page.title}</h4>
                          <Badge variant={page.published ? "success" : "secondary"} className="text-[9px] h-4">
                            {page.published ? "LIVE" : "DRAFT"}
                          </Badge>
                        </div>
                        
                        <div className="flex items-center gap-2 text-[11px] text-teal-400 font-mono">
                          <LinkIcon className="h-3 w-3" />
                          /pages/{page.slug}
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0 border-t sm:border-t-0 border-white/10 pt-3 sm:pt-0">
                        {page.published && (
                          <Link href={`/pages/${page.slug}`} target="_blank">
                            <Button variant="outline" size="sm" className="text-slate-300 hover:text-white">
                              <ExternalLink className="h-4 w-4" />
                            </Button>
                          </Link>
                        )}
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => handleEdit(page)}
                          className="text-slate-300 hover:text-white"
                        >
                          <Edit className="h-4 w-4 mr-2" /> Edit
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => handleDelete(page.id)}
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