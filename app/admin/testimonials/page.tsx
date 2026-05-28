"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/page-header";
import { Plus, Edit3, Trash2, Loader2, Star, X } from "lucide-react";
import { toast } from "sonner";

interface Testimonial {
  id?: number;
  client_name: string;
  position: string;
  company: string;
  comment: string;
  stars: number;
  display_order: string | number;
  is_active: number;
}

const API_URL = "https://aviation.braventra.in/api/testimonials";

export default function TestimonialsPage() {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  
  // Single form object initialization matching database configuration fields
  const [formData, setFormData] = useState<Testimonial>({
    client_name: "",
    position: "",
    company: "",
    comment: "",
    stars: 5,
    display_order: "",
    is_active: 1,
  });

  useEffect(() => {
    fetchTestimonials();
  }, []);

  const fetchTestimonials = async () => {
    setLoading(true);
    try {
      const res = await fetch(API_URL);
      const json = await res.json();
      if (Array.isArray(json)) {
        setTestimonials(json);
      }
    } catch (err) {
      console.error("Fetch Error:", err);
      toast.error("Failed to load testimonials");
    } finally {
      setLoading(false);
    }
  };

  const openCreateModal = () => {
    setFormData({
      client_name: "",
      position: "",
      company: "",
      comment: "",
      stars: 5,
      display_order: "",
      is_active: 1,
    });
    setModalOpen(true);
  };

  const openEditModal = (t: Testimonial) => {
    setFormData({ ...t, display_order: t.display_order ?? "" });
    setModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.client_name || !formData.comment) {
      toast.error("Please fill in all required fields.");
      return;
    }

    const isEditing = !!formData.id;
    const url = isEditing ? `${API_URL}/${formData.id}` : API_URL;
    const method = isEditing ? "PUT" : "POST";

    try {
      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!response.ok) throw new Error("API Execution Error");
      toast.success(isEditing ? "Testimonial updated successfully" : "Testimonial created successfully");
      setModalOpen(false);
      fetchTestimonials();
    } catch (error) {
      toast.error("Error executing action");
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this testimonial?")) return;
    try {
      const response = await fetch(`${API_URL}/${id}`, { method: "DELETE" });
      if (response.ok) {
        toast.success("Testimonial removed from system");
        fetchTestimonials();
      }
    } catch (error) {
      toast.error("Deletion failed");
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <PageHeader
          title="Testimonials Management"
          description="Manage client testimonials and ratings cleanly without graphic image attachments."
        />
        <Button onClick={openCreateModal} className="bg-[#1A5B7A] hover:bg-[#144760] text-white">
          <Plus className="h-4 w-4 mr-2" /> Add New Testimonial
        </Button>
      </div>

      {loading ? (
        <div className="flex h-64 items-center justify-center">
          <Loader2 className="animate-spin h-8 w-8 text-primary" />
        </div>
      ) : (
        <Card className="border-gray-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left text-sm text-gray-500">
              <thead className="bg-gray-50 text-xs font-semibold tracking-wider uppercase text-gray-700 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 font-medium text-gray-900">Order</th>
                  <th className="px-6 py-4 font-medium text-gray-900">Client Info</th>
                  <th className="px-6 py-4 font-medium text-gray-900">Review & Comment</th>
                  <th className="px-6 py-4 font-medium text-gray-900">Status</th>
                  <th className="px-6 py-4 font-medium text-gray-900 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 border-t border-gray-200 bg-white">
                {testimonials.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="text-center py-10 text-muted-foreground">
                      No reviews found. Click 'Add New Testimonial' to add data records.
                    </td>
                  </tr>
                ) : (
                  testimonials.map((t) => (
                    <tr key={t.id} className="hover:bg-gray-50/70 transition-colors">
                      <td className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap">
                        {t.display_order || "N/A"}
                      </td>
                      <td className="px-6 py-4 max-w-xs">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 shrink-0 rounded-full bg-gray-300 text-white font-bold flex items-center justify-center uppercase text-sm">
                            {t.client_name.charAt(0)}
                          </div>
                          <div>
                            <div className="font-semibold text-gray-900">{t.client_name}</div>
                            <div className="text-xs text-gray-400">
                              {t.position || t.company ? `at ${t.position || ""} ${t.company || ""}` : "Client Info N/A"}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-0.5 text-amber-400 mb-1">
                          {Array.from({ length: 5 }).map((_, index) => (
                            <Star
                              key={index}
                              className={`h-4 w-4 ${index < t.stars ? "fill-current" : "text-gray-200"}`}
                            />
                          ))}
                        </div>
                        <p className="text-gray-600 line-clamp-2 text-xs md:text-sm leading-relaxed max-w-xl">
                          {t.comment}
                        </p>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                          t.is_active ? "bg-emerald-50 text-emerald-700 border border-emerald-200" : "bg-gray-100 text-gray-700"
                        }`}>
                          {t.is_active ? "Active" : "Inactive"}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => openEditModal(t)}
                            className="text-indigo-600 hover:bg-indigo-50"
                          >
                            <Edit3 className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDelete(t.id!)}
                            className="text-destructive hover:bg-destructive/10"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Styled Dialog Box Modal Layer built from image_90b920.png specifications */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-xl rounded-xl shadow-2xl overflow-hidden border border-gray-100 flex flex-col max-h-[90vh]">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h3 className="text-lg font-bold text-gray-900">
                {formData.id ? "Edit Testimonial Content" : "Create New Testimonial"}
              </h3>
              <button onClick={() => setModalOpen(false)} className="text-gray-400 hover:text-gray-600 transition-colors">
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Modal Form Scroll Area */}
            <form onSubmit={handleSubmit} className="overflow-y-auto p-6 space-y-4 flex-grow">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-gray-700">Client Name <span className="text-red-500">*</span></Label>
                  <Input
                    value={formData.client_name}
                    onChange={(e) => setFormData({ ...formData, client_name: e.target.value })}
                    placeholder="e.g. Nimai Das"
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-gray-700">Position</Label>
                  <Input
                    value={formData.position}
                    onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                    placeholder="e.g. Flight Operations Director"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-gray-700">Company Name</Label>
                <Input
                  value={formData.company}
                  onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                  placeholder="e.g. Geemadhura Innovations Private Limited"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-gray-700">Comment / Review Content <span className="text-red-500">*</span></Label>
                <Textarea
                  rows={4}
                  value={formData.comment}
                  onChange={(e) => setFormData({ ...formData, comment: e.target.value })}
                  placeholder="Paste or write user comment experience detailed layout parameters..."
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4 items-end pt-2">
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-gray-700">Stars (1 to 5)</Label>
                  <Input
                    type="number"
                    min={1}
                    max={5}
                    value={formData.stars}
                    onChange={(e) => setFormData({ ...formData, stars: parseInt(e.target.value) || 5 })}
                  />
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-gray-700">Display Order Index</Label>
                  <Input
                    type="number"
                    placeholder="Auto"
                    value={formData.display_order}
                    onChange={(e) => setFormData({ ...formData, display_order: e.target.value })}
                  />
                </div>
              </div>

              {/* Status Switch Checkbox */}
              <div className="flex items-center gap-2 pt-3">
                <input
                  type="checkbox"
                  id="active-toggle"
                  checked={formData.is_active === 1}
                  onChange={(e) => setFormData({ ...formData, is_active: e.target.checked ? 1 : 0 })}
                  className="h-4 w-4 rounded border-gray-300 text-[#1A5B7A] focus:ring-[#1A5B7A]"
                />
                <label htmlFor="active-toggle" className="text-sm font-medium text-gray-700 selection:bg-transparent cursor-pointer">
                  Active (Show on live web views)
                </label>
              </div>

              {/* Action Sheet Footer buttons inside form component container */}
              <div className="flex items-center justify-end gap-3 pt-6 border-t border-gray-100 mt-4">
                <Button type="button" variant="outline" onClick={() => setModalOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" className="bg-[#0f6285] hover:bg-[#0b4863] text-white">
                  {formData.id ? "Save Structural Changes" : "Create Testimonial"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}