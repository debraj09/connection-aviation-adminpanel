"use client";

import { useState, useEffect, useRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/page-header";
import { 
  Plus, Pencil, Trash2, Save, X, Loader2, Upload, 
  ChevronDown, ChevronUp, GripVertical 
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { toast } from "sonner";

interface Service {
  id?: number;
  slug: string;
  title: string;
  shortDesc: string;
  longDesc: string;
  image_path: string;
}

interface ServiceFaq {
  id?: number;
  service_id: number;
  question: string;
  answer: string;
  display_order: number;
}

const API_URL = "https://aviation.braventra.in/api/services";
const FAQ_API_URL = "https://aviation.braventra.in/api/service-faqs";
const IMAGE_BASE = "https://aviation.braventra.in";

export default function ServicesPage() {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Service | null>(null);
  const [open, setOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // FAQ states
  const [selectedServiceId, setSelectedServiceId] = useState<number | null>(null);
  const [faqs, setFaqs] = useState<ServiceFaq[]>([]);
  const [faqLoading, setFaqLoading] = useState(false);
  const [editingFaq, setEditingFaq] = useState<ServiceFaq | null>(null);
  const [faqOpen, setFaqOpen] = useState(false);
  const [expandedServices, setExpandedServices] = useState<Set<number>>(new Set());

  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = async () => {
    setLoading(true);
    try {
      const res = await fetch(API_URL);
      const data = await res.json();
      const formattedData = data.map((s: Service) => ({
        ...s,
        longDesc: Array.isArray(s.longDesc) ? s.longDesc[0] : s.longDesc,
      }));
      setServices(formattedData);
    } catch (err) {
      toast.error("Failed to load services");
    } finally {
      setLoading(false);
    }
  };

  const fetchFaqs = async (serviceId: number) => {
    setFaqLoading(true);
    try {
      const res = await fetch(`${FAQ_API_URL}/service/${serviceId}`);
      const data = await res.json();
      setFaqs(data);
    } catch (err) {
      toast.error("Failed to load FAQs");
    } finally {
      setFaqLoading(false);
    }
  };

  const toggleServiceExpand = (serviceId: number) => {
    const newExpanded = new Set(expandedServices);
    if (newExpanded.has(serviceId)) {
      newExpanded.delete(serviceId);
    } else {
      newExpanded.add(serviceId);
      setSelectedServiceId(serviceId);
      fetchFaqs(serviceId);
    }
    setExpandedServices(newExpanded);
  };

  const openNew = () => {
    setEditing({
      slug: "",
      title: "",
      shortDesc: "",
      longDesc: "",
      image_path: "",
    });
    setSelectedFile(null);
    setOpen(true);
  };

  const openEdit = (s: Service) => {
    setEditing({ ...s });
    setSelectedFile(null);
    setOpen(true);
  };

  const handleSave = async () => {
    if (!editing) return;

    const formData = new FormData();
    formData.append("slug", editing.slug);
    formData.append("title", editing.title);
    formData.append("shortDesc", editing.shortDesc);
    formData.append("longDesc", editing.longDesc);

    if (selectedFile) {
      formData.append("image", selectedFile);
    } else {
      formData.append("existing_path", editing.image_path);
    }

    const method = editing.id ? "PUT" : "POST";
    const url = editing.id ? `${API_URL}/${editing.id}` : API_URL;

    try {
      const res = await fetch(url, {
        method,
        body: formData,
      });

      if (!res.ok) throw new Error();

      toast.success(editing.id ? "Service updated" : "Service added");
      setOpen(false);
      fetchServices();
    } catch (err) {
      toast.error("Failed to save service");
    }
  };

  const remove = async (id: number) => {
    if (!confirm("Are you sure you want to delete this service?")) return;
    try {
      const res = await fetch(`${API_URL}/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      toast.success("Service deleted");
      fetchServices();
    } catch (err) {
      toast.error("Delete failed");
    }
  };

  // FAQ Handlers
  const openNewFaq = (serviceId: number) => {
    setEditingFaq({ 
      service_id: serviceId, 
      question: "", 
      answer: "", 
      display_order: faqs.length + 1 
    });
    setFaqOpen(true);
  };

  const openEditFaq = (faq: ServiceFaq) => {
    setEditingFaq({ ...faq });
    setFaqOpen(true);
  };

  const handleSaveFaq = async () => {
    if (!editingFaq) return;

    const method = editingFaq.id ? "PUT" : "POST";
    const url = editingFaq.id 
      ? `${FAQ_API_URL}/${editingFaq.id}` 
      : FAQ_API_URL;

    try {
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editingFaq),
      });

      if (!res.ok) throw new Error();

      toast.success(editingFaq.id ? "FAQ updated" : "FAQ added");
      setFaqOpen(false);
      if (selectedServiceId) {
        fetchFaqs(selectedServiceId);
      }
    } catch (err) {
      toast.error("Failed to save FAQ");
    }
  };

  const removeFaq = async (id: number) => {
    if (!confirm("Are you sure you want to delete this FAQ?")) return;
    try {
      const res = await fetch(`${FAQ_API_URL}/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      toast.success("FAQ deleted");
      if (selectedServiceId) {
        fetchFaqs(selectedServiceId);
      }
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
    <div className="max-w-6xl mx-auto">
      <PageHeader
        title="Services"
        description="Manage the aviation services displayed on your website."
        action={
          <Button
            onClick={openNew}
            className="bg-gradient-to-r from-primary to-accent text-primary-foreground hover:opacity-90 shadow-md"
          >
            <Plus className="h-4 w-4 mr-2" /> Add Service
          </Button>
        }
      />

      <div className="space-y-4">
        {services.map((s) => (
          <Card
            key={s.id}
            className="overflow-hidden hover:shadow-lg transition-all border-border/50"
          >
            <CardContent className="p-0">
              <div className="flex h-full flex-col">
                {/* Service Header */}
                <div className="flex items-stretch">
                  <div className="w-1/4 h-48 shrink-0 bg-muted">
                    {s.image_path ? (
                      <img
                        src={`${IMAGE_BASE}${s.image_path}`}
                        alt={s.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                        No Image
                      </div>
                    )}
                  </div>
                  <div className="flex-1 p-5 flex flex-col justify-between min-w-0">
                    <div>
                      <Badge
                        variant="outline"
                        className="mb-2 font-mono text-[10px]"
                      >
                        {s.slug}
                      </Badge>
                      <h3 className="font-bold text-lg truncate">{s.title}</h3>
                      <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                        {s.shortDesc}
                      </p>
                    </div>
                    <div className="flex gap-2 mt-4">
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-8"
                        onClick={() => openEdit(s)}
                      >
                        <Pencil className="h-3 w-3 mr-2" /> Edit
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 text-destructive hover:bg-destructive/10"
                        onClick={() => s.id && remove(s.id)}
                      >
                        <Trash2 className="h-3 w-3 mr-2" /> Delete
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-8 ml-auto"
                        onClick={() => s.id && toggleServiceExpand(s.id)}
                      >
                        {s.id && expandedServices.has(s.id) ? (
                          <>
                            <ChevronUp className="h-3 w-3 mr-2" /> Hide FAQs
                          </>
                        ) : (
                          <>
                            <ChevronDown className="h-3 w-3 mr-2" /> Show FAQs
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                </div>

                {/* FAQ Section */}
                {s.id && expandedServices.has(s.id) && (
                  <div className="border-t border-border/50 p-5 bg-muted/20">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="font-semibold text-sm">
                        Frequently Asked Questions
                      </h4>
                      <Button
                        size="sm"
                        onClick={() => s.id && openNewFaq(s.id)}
                        className="bg-gradient-to-r from-primary to-accent text-primary-foreground hover:opacity-90"
                      >
                        <Plus className="h-3 w-3 mr-2" /> Add FAQ
                      </Button>
                    </div>

                    {faqLoading ? (
                      <div className="flex justify-center py-4">
                        <Loader2 className="animate-spin text-primary h-6 w-6" />
                      </div>
                    ) : faqs.length === 0 ? (
                      <div className="text-center py-6 text-muted-foreground text-sm border-2 border-dashed rounded-lg">
                        No FAQs added for this service yet.
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {faqs.map((faq) => (
                          <div
                            key={faq.id}
                            className="bg-background rounded-lg p-4 border border-border/50 hover:shadow-md transition-shadow"
                          >
                            <div className="flex items-start gap-4">
                              <div className="flex flex-col items-center pt-1 text-muted-foreground/60">
                                <GripVertical className="h-4 w-4" />
                                <span className="text-[10px] font-bold mt-1 uppercase">
                                  {faq.display_order}
                                </span>
                              </div>
                              <div className="flex-1 min-w-0">
                                <h5 className="font-medium text-foreground text-sm">
                                  {faq.question}
                                </h5>
                                <p className="text-sm text-muted-foreground mt-1 leading-relaxed">
                                  {faq.answer}
                                </p>
                              </div>
                              <div className="flex gap-1 shrink-0">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => openEditFaq(faq)}
                                  className="h-8 w-8"
                                >
                                  <Pencil className="h-3 w-3" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => faq.id && removeFaq(faq.id)}
                                  className="h-8 w-8 text-destructive hover:bg-destructive/10"
                                >
                                  <Trash2 className="h-3 w-3" />
                                </Button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Service Edit/Create Dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editing?.id ? "Edit Service" : "Add New Service"}
            </DialogTitle>
          </DialogHeader>

          {editing && (
            <div className="space-y-5 py-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Service Title</Label>
                  <Input
                    value={editing.title}
                    onChange={(e) =>
                      setEditing({ ...editing, title: e.target.value })
                    }
                    placeholder="Private Jet Service"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Slug (URL Identifier)</Label>
                  <Input
                    value={editing.slug}
                    onChange={(e) =>
                      setEditing({ ...editing, slug: e.target.value })
                    }
                    placeholder="private-jet-service"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Service Image</Label>
                <div className="flex items-center gap-4 p-4 border rounded-lg bg-muted/30">
                  {editing.image_path && !selectedFile && (
                    <img
                      src={`${IMAGE_BASE}${editing.image_path}`}
                      alt="Preview"
                      className="w-16 h-16 object-cover rounded-md border"
                    />
                  )}
                  {selectedFile && (
                    <div className="w-16 h-16 bg-primary/10 rounded-md flex items-center justify-center">
                      <Upload className="h-6 w-6 text-primary" />
                    </div>
                  )}
                  <div className="flex-1 space-y-1">
                    <Input
                      type="file"
                      accept="image/*"
                      ref={fileInputRef}
                      onChange={(e) =>
                        setSelectedFile(e.target.files?.[0] || null)
                      }
                      className="cursor-pointer"
                    />
                    <p className="text-[10px] text-muted-foreground italic">
                      Recommended size: 800x600px. JPG, PNG or WebP.
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Short Description (Card View)</Label>
                <Textarea
                  rows={2}
                  value={editing.shortDesc}
                  onChange={(e) =>
                    setEditing({ ...editing, shortDesc: e.target.value })
                  }
                  placeholder="A brief summary for the services list page..."
                />
              </div>

              <div className="space-y-2">
                <Label>Long Description (Detail Page)</Label>
                <Textarea
                  rows={6}
                  value={editing.longDesc}
                  onChange={(e) =>
                    setEditing({ ...editing, longDesc: e.target.value })
                  }
                  placeholder="Detailed explanation of the service..."
                />
              </div>
            </div>
          )}

          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setOpen(false)}>
              <X className="h-4 w-4 mr-2" /> Cancel
            </Button>
            <Button
              onClick={handleSave}
              className="bg-gradient-to-r from-primary to-accent text-primary-foreground hover:opacity-90"
            >
              <Save className="h-4 w-4 mr-2" /> Save Service
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* FAQ Edit/Create Dialog */}
      <Dialog open={faqOpen} onOpenChange={setFaqOpen}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle>
              {editingFaq?.id ? "Edit FAQ" : "Add FAQ for Service"}
            </DialogTitle>
          </DialogHeader>
          {editingFaq && (
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Question</Label>
                <Input
                  value={editingFaq.question}
                  onChange={(e) =>
                    setEditingFaq({ ...editingFaq, question: e.target.value })
                  }
                  placeholder="e.g., How quickly can a jet be arranged?"
                />
              </div>
              <div className="space-y-2">
                <Label>Answer</Label>
                <Textarea
                  rows={5}
                  value={editingFaq.answer}
                  onChange={(e) =>
                    setEditingFaq({ ...editingFaq, answer: e.target.value })
                  }
                  placeholder="Detailed answer here..."
                />
              </div>
              <div className="space-y-2">
                <Label>Display Order</Label>
                <Input
                  type="number"
                  value={editingFaq.display_order}
                  onChange={(e) =>
                    setEditingFaq({
                      ...editingFaq,
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
            <Button variant="outline" onClick={() => setFaqOpen(false)}>
              <X className="h-4 w-4 mr-2" />
              Cancel
            </Button>
            <Button
              onClick={handleSaveFaq}
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