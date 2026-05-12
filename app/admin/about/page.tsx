"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/page-header";
import { Save, Loader2, Trash2 } from "lucide-react";
import { toast } from "sonner";

const API_URL = "https://aviation.braventra.in/api/about";

export default function AboutPage() {
  const [loading, setLoading] = useState(true);
  const [exists, setExists] = useState(false);
  const [data, setData] = useState({
    title: "",
    subtitle: "",
    who_we_are_title: "",
    content: "",
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await fetch(API_URL);
      const json = await res.json();
      if (json && !json.error) {
        setData(json);
        setExists(true);
      } else {
        setExists(false);
        setData({ title: "", subtitle: "", who_we_are_title: "", content: "" });
      }
    } catch (err) {
      console.error("Fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  const onSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!response.ok) throw new Error("Update failed");

      toast.success(exists ? "About section updated" : "About section created");
      fetchData();
    } catch (error) {
      toast.error("Error saving data");
    }
  };

  const onDelete = async () => {
    if (!confirm("Are you sure you want to delete the About content?")) return;
    try {
      await fetch(API_URL, { method: "DELETE" });
      toast.success("Content cleared");
      fetchData();
    } catch (error) {
      toast.error("Delete failed");
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
        title="About Us"
        description="Manage the content for the About Us section."
      />

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>
            {exists ? "Edit About Content" : "Add About Content"}
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
          <form onSubmit={onSave} className="space-y-5">
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Main Title</Label>
                <Input
                  value={data.title}
                  onChange={(e) => setData({ ...data, title: e.target.value })}
                  placeholder="e.g. About Connection Aviation"
                />
              </div>
              <div className="space-y-2">
                <Label>Who We Are Heading</Label>
                <Input
                  value={data.who_we_are_title}
                  onChange={(e) =>
                    setData({ ...data, who_we_are_title: e.target.value })
                  }
                  placeholder="e.g. Who We Are"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Subtitle</Label>
              <Input
                value={data.subtitle}
                onChange={(e) =>
                  setData({ ...data, subtitle: e.target.value })
                }
                placeholder="e.g. Redefining the skies..."
              />
            </div>
            <div className="space-y-2">
              <Label>Main Content Body</Label>
              <Textarea
                rows={8}
                value={data.content}
                onChange={(e) => setData({ ...data, content: e.target.value })}
                placeholder="Enter the detailed company description..."
              />
            </div>
            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-primary to-accent text-primary-foreground hover:opacity-90 shadow-md"
            >
              <Save className="h-4 w-4 mr-2" />
              {exists ? "Save Changes" : "Create About Section"}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Visual Indicator of mode */}
      <p className="mt-4 text-center text-xs text-muted-foreground uppercase tracking-widest">
        {exists ? "● Live on Website" : "○ Content Missing"}
      </p>
    </div>
  );
}
