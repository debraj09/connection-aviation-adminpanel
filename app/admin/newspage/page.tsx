"use client";

import { useState, useEffect, useRef } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Plus, Edit3, Trash2, Loader2, X, RefreshCw, Search, UploadCloud } from "lucide-react";
import { toast } from "sonner";

interface NewsItem {
  id?: number;
  title: string;
  description: string;
  publish_date: string;
  image_path?: string;
}

const API_URL = "https://aviation.braventra.in/api/news";

export default function NewsPage() {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const [formData, setFormData] = useState<NewsItem>({
    title: "",
    description: "",
    publish_date: new Date().toISOString().split("T")[0],
  });

  useEffect(() => {
    fetchNews();
  }, []);

  const fetchNews = async () => {
    setLoading(true);
    try {
      const res = await fetch(API_URL);
      const json = await res.json();
      if (Array.isArray(json)) setNews(json);
    } catch (err) {
      toast.error("Failed to fetch news updates");
    } finally {
      setLoading(false);
    }
  };

  const openCreateModal = () => {
    setSelectedFile(null);
    setFormData({
      title: "",
      description: "",
      publish_date: new Date().toISOString().split("T")[0],
    });
    setModalOpen(true);
  };

  const openEditModal = (item: NewsItem) => {
    setSelectedFile(null);
    const formattedDate = item.publish_date ? item.publish_date.split("T")[0] : "";
    setFormData({ ...item, publish_date: formattedDate });
    setModalOpen(true);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const isEditing = !!formData.id;

    const dataPayload = new FormData();
    dataPayload.append("title", formData.title);
    dataPayload.append("description", formData.description || ".");
    dataPayload.append("publish_date", formData.publish_date);

    if (selectedFile) {
      dataPayload.append("image", selectedFile);
    } else if (formData.image_path) {
      dataPayload.append("existing_path", formData.image_path);
    }

    try {
      const url = isEditing ? `${API_URL}/${formData.id}` : API_URL;
      const res = await fetch(url, {
        method: isEditing ? "PUT" : "POST",
        body: dataPayload,
      });

      if (!res.ok) throw new Error();
      toast.success(isEditing ? "News updated successfully" : "News update created");
      setModalOpen(false);
      fetchNews();
    } catch {
      toast.error("Failed to process server update payload");
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to permanently delete this news update?")) return;
    try {
      const res = await fetch(`${API_URL}/${id}`, { method: "DELETE" });
      if (res.ok) {
        toast.success("News record removed permanently");
        fetchNews();
      }
    } catch {
      toast.error("Deletion task failed");
    }
  };

  const filteredNews = news.filter((item) =>
    item.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto space-y-6 p-4">
      {/* Upper Management Layout Action Row */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Latest Updated News</h1>
          <p className="text-sm text-gray-500">Manage real-time corporate bulletin points and notifications</p>
        </div>
        <div className="flex items-center gap-2 w-full md:w-auto">
          <div className="relative flex-grow md:w-64">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search news..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 h-10 bg-white"
            />
          </div>
          <Button variant="outline" size="icon" onClick={fetchNews} className="h-10 w-10 bg-white">
            <RefreshCw className="h-4 w-4" />
          </Button>
          <Button onClick={openCreateModal} className="bg-[#007A93] hover:bg-[#006378] text-white font-medium px-4 h-10 shadow-sm flex items-center gap-1.5">
            <Plus className="h-4 w-4" /> Add New Update
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="flex h-64 items-center justify-center">
          <Loader2 className="animate-spin h-8 w-8 text-[#007A93]" />
        </div>
      ) : (
        <Card className="border-gray-200 shadow-sm overflow-hidden bg-white">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-gray-500 border-collapse">
              <thead className="bg-gray-50 text-xs font-semibold uppercase text-gray-700 tracking-wider border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 font-medium text-gray-400 w-44">Date</th>
                  <th className="px-6 py-4 font-medium text-gray-400">Title</th>
                  <th className="px-6 py-4 font-medium text-gray-400">Description</th>
                  <th className="px-6 py-4 font-medium text-gray-400 w-32">Image</th>
                  <th className="px-6 py-4 font-medium text-gray-400 text-right w-28">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 bg-white">
                {filteredNews.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="text-center py-12 text-gray-400">
                      No matching news items found.
                    </td>
                  </tr>
                ) : (
                  filteredNews.map((item) => (
                    <tr key={item.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap">
                        {item.publish_date ? new Date(item.publish_date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : 'N/A'}
                      </td>
                      <td className="px-6 py-4 font-semibold text-gray-900 max-w-sm">
                        <div className="line-clamp-2 leading-snug">{item.title}</div>
                      </td>
                      <td className="px-6 py-4 text-gray-500 max-w-md">
                        <div className="line-clamp-2 leading-relaxed">{item.description || '.'}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-xs">
                        {item.image_path ? (
                          <span className="text-emerald-600 font-medium bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded">
                            Has Image
                          </span>
                        ) : (
                          <span className="text-gray-400 font-normal">No image</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button variant="ghost" size="icon" onClick={() => openEditModal(item)} className="text-blue-600 hover:bg-blue-50">
                            <Edit3 className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => handleDelete(item.id!)} className="text-red-500 hover:bg-red-50">
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

      {/* Structured Configuration Popup Window Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 overflow-y-auto backdrop-blur-xs">
          <div className="bg-white w-full max-w-2xl rounded-xl shadow-2xl overflow-hidden border border-gray-100 flex flex-col my-auto max-h-[90vh]">
            
            {/* Header Area */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gray-50/70">
              <h3 className="text-base font-bold text-gray-900 tracking-tight">
                {formData.id ? "Modify News Bulletin" : "Create News Record Entry"}
              </h3>
              <button onClick={() => setModalOpen(false)} className="text-gray-400 hover:text-gray-600 p-1">
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Core Form Element Fields */}
            <form onSubmit={handleFormSubmit} className="overflow-y-auto p-6 space-y-4 flex-grow text-sm">
              <div className="space-y-1.5">
                <Label className="font-semibold text-gray-700 text-xs">News Title <span className="text-red-500">*</span></Label>
                <Input
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g., ISO 9001:2015 Certified"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <Label className="font-semibold text-gray-700 text-xs">Publishing Date <span className="text-red-500">*</span></Label>
                <Input
                  type="date"
                  value={formData.publish_date}
                  onChange={(e) => setFormData({ ...formData, publish_date: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-1.5">
                <Label className="font-semibold text-gray-700 text-xs">Description / Content Summary</Label>
                <Textarea
                  rows={4}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Enter details about this updated announcement configuration point..."
                />
              </div>

              {/* Upload Drop Tray Block */}
              <div className="space-y-1.5">
                <Label className="font-semibold text-gray-700 text-xs">Supporting Graphic Banner Image</Label>
                <div 
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-gray-200 hover:border-gray-400 bg-gray-50/50 rounded-lg p-5 flex flex-col items-center justify-center cursor-pointer transition-colors group"
                >
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) setSelectedFile(e.target.files[0]);
                    }}
                    accept="image/jpeg,image/png,image/gif,image/webp"
                    className="hidden"
                  />
                  <UploadCloud className="h-7 w-7 text-gray-400 group-hover:text-gray-600 mb-1.5 transition-colors" />
                  <div className="text-xs font-semibold text-blue-600 hover:underline">
                    {selectedFile ? selectedFile.name : formData.image_path ? "Replace media document" : "Choose File Attachment"}
                  </div>
                  {!selectedFile && !formData.image_path && (
                    <span className="text-gray-400 text-[11px] mt-0.5">No file chosen</span>
                  )}
                  <p className="text-[10px] text-gray-400 mt-1">Maximum scale constraint: 2MB (JPEG, PNG, WebP)</p>
                </div>
              </div>

              {/* Interaction Row Controls */}
              <div className="flex items-center justify-end gap-2 pt-4 border-t border-gray-100 mt-6">
                <Button type="button" variant="outline" onClick={() => setModalOpen(false)} className="h-9 px-4 text-xs font-medium">
                  Cancel
                </Button>
                <Button type="submit" className="bg-[#007A93] hover:bg-[#006378] text-white font-medium text-xs px-4 h-9 shadow-sm">
                  {formData.id ? "Save Structural Changes" : "＋ Deploy Update Record"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}