"use client";

import { useState, useEffect, useRef } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/page-header";
import { Plus, Edit3, Trash2, Loader2, X, RefreshCw, Search, EyeOff, UploadCloud } from "lucide-react";
import { toast } from "sonner";

interface BlogPost {
  id?: number;
  title: string;
  short_desc: string;
  full_content: string;
  publish_date: string;
  author: string;
  publish_status: "Published" | "Draft";
  tags: string;
  banner_image?: string;
}

const API_URL = "https://aviation.braventra.in/api/blogs";

export default function BlogPage() {
  const [blogs, setBlogs] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const [formData, setFormData] = useState<BlogPost>({
    title: "",
    short_desc: "",
    full_content: "",
    publish_date: new Date().toISOString().split("T")[0],
    author: "Admin",
    publish_status: "Draft",
    tags: "",
  });

  useEffect(() => {
    fetchBlogs();
  }, []);

  const fetchBlogs = async () => {
    setLoading(true);
    try {
      const res = await fetch(API_URL);
      const json = await res.json();
      if (Array.isArray(json)) setBlogs(json);
    } catch (err) {
      toast.error("Failed to fetch blog posts");
    } finally {
      setLoading(false);
    }
  };

  const openCreateModal = () => {
    setSelectedFile(null);
    setFormData({
      title: "",
      short_desc: "",
      full_content: "",
      publish_date: new Date().toISOString().split("T")[0],
      author: "Admin",
      publish_status: "Draft",
      tags: "",
    });
    setModalOpen(true);
  };

  const openEditModal = (blog: BlogPost) => {
    setSelectedFile(null);
    // Format date string correctly to populate standard input type text/date safely
    const formattedDate = blog.publish_date ? blog.publish_date.split("T")[0] : "";
    setFormData({ ...blog, publish_date: formattedDate });
    setModalOpen(true);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const isEditing = !!formData.id;

    const dataPayload = new FormData();
    dataPayload.append("title", formData.title);
    dataPayload.append("short_desc", formData.short_desc);
    dataPayload.append("full_content", formData.full_content);
    dataPayload.append("publish_date", formData.publish_date);
    dataPayload.append("author", formData.author);
    dataPayload.append("publish_status", formData.publish_status);
    dataPayload.append("tags", formData.tags);

    if (selectedFile) {
      dataPayload.append("banner_image", selectedFile);
    } else if (formData.banner_image) {
      dataPayload.append("existing_path", formData.banner_image);
    } else {
      toast.error("Banner Image is required");
      return;
    }

    try {
      const url = isEditing ? `${API_URL}/${formData.id}` : API_URL;
      const res = await fetch(url, {
        method: isEditing ? "PUT" : "POST",
        body: dataPayload,
      });

      if (!res.ok) throw new Error();
      toast.success(isEditing ? "Blog updated successfully" : "Blog post created");
      setModalOpen(false);
      fetchBlogs();
    } catch {
      toast.error("Failed to process transaction payload");
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this blog post?")) return;
    try {
      const res = await fetch(`${API_URL}/${id}`, { method: "DELETE" });
      if (res.ok) {
        toast.success("Blog post removed permanently");
        fetchBlogs();
      }
    } catch {
      toast.error("Deletion failed");
    }
  };

  const filteredBlogs = blogs.filter((b) =>
    b.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto space-y-6 p-4">
      {/* Upper Management Header Sheet */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Blog Management</h1>
          <p className="text-sm text-gray-500">Create, edit, and manage your blog posts</p>
        </div>
        <div className="flex items-center gap-2 w-full md:w-auto">
          <div className="relative flex-grow md:w-64">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search blogs..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 h-10 bg-white"
            />
          </div>
          <Button variant="outline" size="icon" onClick={fetchBlogs} className="h-10 w-10 bg-white">
            <RefreshCw className="h-4 w-4" />
          </Button>
          <Button onClick={openCreateModal} className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-4 h-10 shadow-sm">
            <Plus className="h-4 w-4 mr-1.5" /> New Blog Post
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="flex h-64 items-center justify-center">
          <Loader2 className="animate-spin h-8 w-8 text-blue-600" />
        </div>
      ) : (
        <Card className="border-gray-200 shadow-sm overflow-hidden bg-white">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-gray-500 border-collapse">
              <thead className="bg-gray-50 text-xs font-semibold uppercase text-gray-700 tracking-wider border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 font-medium text-gray-400 w-12">ID</th>
                  <th className="px-6 py-4 font-medium text-gray-400 w-32">Date</th>
                  <th className="px-6 py-4 font-medium text-gray-400">Title</th>
                  <th className="px-6 py-4 font-medium text-gray-400 w-28">Author</th>
                  <th className="px-6 py-4 font-medium text-gray-400 w-24">Tags</th>
                  <th className="px-6 py-4 font-medium text-gray-400 w-28">Status</th>
                  <th className="px-6 py-4 font-medium text-gray-400 text-right w-28">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 bg-white">
                {filteredBlogs.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center py-12 text-gray-400">
                      No blog records matched the search criteria index parameters.
                    </td>
                  </tr>
                ) : (
                  filteredBlogs.map((b) => (
                    <tr key={b.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-6 py-4 text-gray-400 whitespace-nowrap">{b.id}</td>
                      <td className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap">
                        {b.publish_date ? new Date(b.publish_date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : 'N/A'}
                      </td>
                      <td className="px-6 py-4 max-w-md">
                        <div className="font-semibold text-gray-900 line-clamp-1">{b.title}</div>
                        <div className="text-xs text-gray-400 line-clamp-2 mt-0.5 font-normal leading-relaxed">{b.short_desc}</div>
                      </td>
                      <td className="px-6 py-4 text-gray-600 whitespace-nowrap">{b.author}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {b.tags ? (
                          <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded border border-slate-200/60 font-medium">
                            {b.tags.split(',')[0]}
                          </span>
                        ) : (
                          <span className="text-gray-300">-</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                          b.publish_status === "Published" 
                            ? "bg-green-50 text-green-700 border border-green-200" 
                            : "bg-amber-50 text-amber-700 border border-amber-200"
                        }`}>
                          {b.publish_status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button variant="ghost" size="icon" className="text-gray-400 hover:text-gray-600">
                            <EyeOff className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => openEditModal(b)} className="text-blue-600 hover:bg-blue-50">
                            <Edit3 className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => handleDelete(b.id!)} className="text-red-500 hover:bg-red-50">
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

      {/* Styled Creation and Edit Dialog Drawer Overlay Popup */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 overflow-y-auto backdrop-blur-xs">
          <div className="bg-white w-full max-w-4xl rounded-xl shadow-2xl overflow-hidden border border-gray-100 flex flex-col my-auto max-h-[95vh]">
            
            {/* Modal Container Title Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gray-50/70">
              <h3 className="text-base font-bold text-gray-900 tracking-tight">
                {formData.id ? "Edit Existing Blog Post" : "Create New Blog Post"}
              </h3>
              <button onClick={() => setModalOpen(false)} className="text-gray-400 hover:text-gray-600 transition-colors p-1">
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Scrolling Core Content Body */}
            <form onSubmit={handleFormSubmit} className="overflow-y-auto p-6 space-y-4 flex-grow text-sm">
              <div className="space-y-1.5">
                <Label className="font-semibold text-gray-700 text-xs">Title <span className="text-red-500">*</span></Label>
                <Input
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="The Ultimate Guide to Modern React"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <Label className="font-semibold text-gray-700 text-xs">Short Description (Max 500 chars)</Label>
                <Textarea
                  rows={2}
                  maxLength={500}
                  value={formData.short_desc}
                  onChange={(e) => setFormData({ ...formData, short_desc: e.target.value })}
                  placeholder="A brief summary of the blog post for listings."
                />
              </div>

              {/* Textarea configuration matching core editor content height parameters safely */}
              <div className="space-y-1.5">
                <Label className="font-semibold text-gray-700 text-xs">Full Content <span className="text-red-500">*</span></Label>
                <div className="border border-gray-200 rounded-md overflow-hidden focus-within:border-gray-400 transition-colors">
                  <div className="bg-gray-50 border-b border-gray-200 px-3 py-1.5 flex flex-wrap gap-4 text-gray-400 text-xs font-mono select-none">
                    <span>B</span><span>I</span><span>U</span><span>⁝ List</span><span>Link</span><span>Image</span>
                  </div>
                  <Textarea
                    rows={8}
                    value={formData.full_content}
                    onChange={(e) => setFormData({ ...formData, full_content: e.target.value })}
                    placeholder="Write your blog post content here..."
                    className="border-0 focus-visible:ring-0 rounded-none border-t-0 p-3 w-full"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <Label className="font-semibold text-gray-700 text-xs">Publish Date</Label>
                  <Input
                    type="date"
                    value={formData.publish_date}
                    onChange={(e) => setFormData({ ...formData, publish_date: e.target.value })}
                  />
                </div>

                <div className="space-y-1.5">
                  <Label className="font-semibold text-gray-700 text-xs">Author</Label>
                  <Input
                    value={formData.author}
                    onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                    placeholder="Admin"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label className="font-semibold text-gray-700 text-xs">Publish Status</Label>
                  <div className="flex items-center h-10 gap-2 px-1">
                    <input
                      type="checkbox"
                      id="publish_status"
                      checked={formData.publish_status === "Published"}
                      onChange={(e) => setFormData({ ...formData, publish_status: e.target.checked ? "Published" : "Draft" })}
                      className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <label htmlFor="publish_status" className={`text-sm font-semibold selection:bg-transparent ${formData.publish_status === "Published" ? "text-green-600" : "text-amber-600"}`}>
                      {formData.publish_status}
                    </label>
                  </div>
                </div>
              </div>

              <div className="space-y-1.5">
                <Label className="font-semibold text-gray-700 text-xs">Tags (Comma Separated)</Label>
                <Input
                  value={formData.tags}
                  onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                  placeholder="react, typescript, tutorial, admin"
                />
                <p className="text-[11px] text-gray-400 px-0.5">Separate tags with commas</p>
              </div>

              {/* File Attachment Drag Drop Wrapper view layout schema box from screenshot */}
              <div className="space-y-1.5">
                <Label className="font-semibold text-gray-700 text-xs">Banner Image <span className="text-red-500">*</span></Label>
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
                    {selectedFile ? selectedFile.name : formData.banner_image ? "Change current image" : "Choose File"}
                  </div>
                  {!selectedFile && !formData.banner_image && (
                    <span className="text-gray-400 text-[11px] mt-0.5">No file chosen</span>
                  )}
                  <p className="text-[10px] text-gray-400 mt-1">Max size: 2MB. Allowed types: JPEG, PNG, GIF, WebP.</p>
                </div>
              </div>

              {/* Action Operations Tray */}
              <div className="flex items-center justify-end gap-2 pt-4 border-t border-gray-100 mt-6">
                <Button type="button" variant="outline" onClick={() => setModalOpen(false)} className="h-9 px-4 text-xs font-medium">
                  Cancel
                </Button>
                <Button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white font-medium text-xs px-4 h-9 shadow-sm">
                  {formData.id ? "Save Structural Changes" : "＋ Create Post"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}