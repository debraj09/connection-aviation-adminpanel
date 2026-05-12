"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/page-header";
import { Save, Video, Loader2, Globe, Trash2 } from "lucide-react";
import { toast } from "sonner";

const BASE_URL = "https://aviation.braventra.in/api/hero";

export default function HeroPage() {
  const [loading, setLoading] = useState(true);
  const [exists, setExists] = useState(false);
  const [data, setData] = useState({
    title: "",
    description: "",
    video_url: "",
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await fetch(BASE_URL);
      const json = await res.json();
      if (json) {
        setData(json);
        setExists(true);
      } else {
        setExists(false);
        setData({ title: "", description: "", video_url: "" });
      }
    } catch (err) {
      toast.error("Could not load hero settings");
    } finally {
      setLoading(false);
    }
  };

  const onSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch(BASE_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!response.ok) throw new Error();

      toast.success(exists ? "Updated successfully" : "Created successfully");
      fetchData();
    } catch (error) {
      toast.error("Failed to save data");
    }
  };

  const onDelete = async () => {
    if (!confirm("Are you sure you want to delete this hero section?")) return;
    try {
      const response = await fetch(BASE_URL, { method: "DELETE" });
      if (!response.ok) throw new Error();

      toast.success("Hero section deleted");
      fetchData();
    } catch (error) {
      toast.error("Failed to delete");
    }
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <PageHeader
        title="Hero Section"
        description="Manage your main aviation banner content and video."
      />

      <div className="grid lg:grid-cols-5 gap-6">
        <Card className="lg:col-span-3">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>
              {exists ? "Edit Content" : "Create New Content"}
            </CardTitle>
            {exists && (
              <Button
                variant="ghost"
                size="icon"
                onClick={onDelete}
                className="text-destructive hover:bg-destructive/10"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </CardHeader>
          <CardContent>
            <form onSubmit={onSave} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  value={data.title}
                  onChange={(e) => setData({ ...data, title: e.target.value })}
                  placeholder="e.g. Fly Beyond Limits"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="desc">Description</Label>
                <Textarea
                  id="desc"
                  rows={4}
                  value={data.description}
                  onChange={(e) =>
                    setData({ ...data, description: e.target.value })
                  }
                  placeholder="Bespoke private aviation services..."
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="vid">Video Link</Label>
                <div className="flex gap-2">
                  <Input
                    id="vid"
                    value={data.video_url}
                    onChange={(e) =>
                      setData({ ...data, video_url: e.target.value })
                    }
                    placeholder="https://youtube.com/..."
                  />
                  <div className="flex items-center px-3 bg-muted rounded-md border">
                    <Globe className="h-4 w-4 text-muted-foreground" />
                  </div>
                </div>
              </div>
              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-primary to-accent text-primary-foreground hover:opacity-90"
              >
                <Save className="h-4 w-4 mr-2" />
                {exists ? "Save Changes" : "Create Hero Section"}
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Preview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="relative rounded-xl p-6 bg-slate-950 text-white min-h-[220px] flex flex-col justify-end overflow-hidden border border-slate-800">
              <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent z-10" />
              <div className="absolute inset-0 flex items-center justify-center opacity-10">
                <Video className="w-20 h-20" />
              </div>

              <div className="relative z-20">
                <h3 className="text-xl font-bold leading-tight">
                  {data.title || "Your Title"}
                </h3>
                <p className="text-[11px] mt-2 opacity-60 line-clamp-3">
                  {data.description || "Your description will appear here..."}
                </p>
              </div>
            </div>
            <p className="mt-4 text-[10px] font-mono text-muted-foreground break-all opacity-50">
              URL: {data.video_url || "Not set"}
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
