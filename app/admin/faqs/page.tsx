"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/page-header";
import {
  Plus,
  Pencil,
  Trash2,
  Save,
  X,
  GripVertical,
  Loader2,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { toast } from "sonner";

interface Faq {
  id?: number;
  question: string;
  answer: string;
  display_order: number;
}

const API_URL = "https://aviation.braventra.in/api/faqs";

export default function FaqsPage() {
  const [faqs, setFaqs] = useState<Faq[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Faq | null>(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    fetchFaqs();
  }, []);

  const fetchFaqs = async () => {
    setLoading(true);
    try {
      const res = await fetch(API_URL);
      const data = await res.json();
      setFaqs(data);
    } catch (err) {
      toast.error("Failed to load FAQs");
    } finally {
      setLoading(false);
    }
  };

  const openNew = () => {
    setEditing({ question: "", answer: "", display_order: faqs.length + 1 });
    setOpen(true);
  };

  const openEdit = (f: Faq) => {
    setEditing({ ...f });
    setOpen(true);
  };

  const handleSave = async () => {
    if (!editing) return;

    const method = editing.id ? "PUT" : "POST";
    const url = editing.id ? `${API_URL}/${editing.id}` : API_URL;

    try {
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editing),
      });

      if (!res.ok) throw new Error();

      toast.success(editing.id ? "FAQ updated" : "FAQ added");
      setOpen(false);
      fetchFaqs();
    } catch (err) {
      toast.error("Failed to save FAQ");
    }
  };

  const remove = async (id: number) => {
    if (!confirm("Are you sure you want to delete this FAQ?")) return;
    try {
      const res = await fetch(`${API_URL}/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      toast.success("FAQ deleted");
      fetchFaqs();
    } catch (err) {
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
        title="FAQs"
        description="Manage frequently asked questions shown on your website."
        action={
          <Button
            onClick={openNew}
            className="bg-gradient-to-r from-primary to-accent text-primary-foreground hover:opacity-90 shadow-md"
          >
            <Plus className="h-4 w-4 mr-2" /> Add FAQ
          </Button>
        }
      />

      <div className="space-y-3">
        {faqs.length === 0 ? (
          <div className="text-center py-10 border-2 border-dashed rounded-lg text-muted-foreground">
            No FAQs found. Click &quot;Add FAQ&quot; to get started.
          </div>
        ) : (
          faqs.map((f) => (
            <Card
              key={f.id}
              className="hover:shadow-md transition-all border-border/50"
            >
              <CardContent className="p-4 sm:p-5">
                <div className="flex items-start gap-4">
                  <div className="flex flex-col items-center pt-1 text-muted-foreground/60">
                    <GripVertical className="h-4 w-4" />
                    <span className="text-[10px] font-bold mt-1 uppercase">
                      Order {f.display_order}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-foreground text-base">
                      {f.question}
                    </h3>
                    <p className="text-sm text-muted-foreground mt-1.5 leading-relaxed">
                      {f.answer}
                    </p>
                  </div>
                  <div className="flex gap-1 shrink-0">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => openEdit(f)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => f.id && remove(f.id)}
                      className="text-destructive hover:bg-destructive/10"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle>{editing?.id ? "Edit FAQ" : "New FAQ"}</DialogTitle>
          </DialogHeader>
          {editing && (
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Question</Label>
                <Input
                  value={editing.question}
                  onChange={(e) =>
                    setEditing({ ...editing, question: e.target.value })
                  }
                  placeholder="e.g., How quickly can a jet be arranged?"
                />
              </div>
              <div className="space-y-2">
                <Label>Answer</Label>
                <Textarea
                  rows={5}
                  value={editing.answer}
                  onChange={(e) =>
                    setEditing({ ...editing, answer: e.target.value })
                  }
                  placeholder="Detailed answer here..."
                />
              </div>
              <div className="space-y-2">
                <Label>Display Order</Label>
                <Input
                  type="number"
                  value={editing.display_order}
                  onChange={(e) =>
                    setEditing({
                      ...editing,
                      display_order: Number(e.target.value),
                    })
                  }
                />
                <p className="text-[10px] text-muted-foreground italic">
                  Lower numbers appear first.
                </p>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>
              <X className="h-4 w-4 mr-2" />
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              className="bg-gradient-to-r from-primary to-accent text-primary-foreground hover:opacity-90"
            >
              <Save className="h-4 w-4 mr-2" /> Save FAQ
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
