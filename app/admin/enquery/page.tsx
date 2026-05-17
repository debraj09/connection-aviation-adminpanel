"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/page-header";
import { 
  Loader2, 
  Eye, 
  Trash2, 
  Plane, 
  Calendar, 
  Clock, 
  User, 
  Mail, 
  Phone, 
  MessageSquare,
  ArrowRight
} from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const API_URL = "https://aviation.braventra.in/api/enquiries";

interface FlightLeg {
  leg_number: number;
  departure: string;
  arrival: string;
  passengers: number;
  date: string;
  time: string;
  aircraft: string;
}

interface Enquiry {
  id: number;
  enquiry_id: string;
  trip_type: "oneway" | "roundtrip";
  one_way_legs: string | FlightLeg[]; // Backend returns stringified JSON
  return_legs: string | FlightLeg[] | null;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  message: string | null;
  status: "pending" | "contacted" | "confirmed" | "cancelled";
  created_at: string;
}

export default function EnquiriesPage() {
  const [loading, setLoading] = useState(true);
  const [enquiries, setEnquiries] = useState<Enquiry[]>([]);
  const [selectedEnquiry, setSelectedEnquiry] = useState<Enquiry | null>(null);
  const [detailModalOpen, setDetailModalOpen] = useState(false);

  useEffect(() => {
    fetchEnquiries();
  }, []);

  const fetchEnquiries = async () => {
    setLoading(true);
    try {
      const res = await fetch(API_URL);
      const json = await res.json();
      if (Array.isArray(json)) {
        setEnquiries(json);
      } else {
        setEnquiries([]);
      }
    } catch (err) {
      console.error("Fetch error:", err);
      toast.error("Failed to load enquiries");
    } finally {
      setLoading(false);
    }
  };

  const onDelete = async (id: string | number, e: React.MouseEvent) => {
    e.stopPropagation(); // Avoid triggering row clicks
    if (!confirm("Are you sure you want to delete this enquiry permanently?")) return;
    
    try {
      const response = await fetch(`${API_URL}/${id}`, { method: "DELETE" });
      if (!response.ok) throw new Error("Delete failed");
      
      toast.success("Enquiry deleted successfully");
      fetchEnquiries();
    } catch (error) {
      toast.error("Delete sequence failed");
    }
  };

  const handleViewDetails = (enquiry: Enquiry) => {
    setSelectedEnquiry(enquiry);
    setDetailModalOpen(true);
  };

  // Safe JSON parser helper for MySQL TEXT fields
  const parseLegs = (data: string | FlightLeg[]): FlightLeg[] => {
    if (typeof data === "string") {
      try {
        return JSON.parse(data);
      } catch {
        return [];
      }
    }
    return data || [];
  };

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case "confirmed": return "bg-emerald-50 text-emerald-700 border-emerald-200";
      case "contacted": return "bg-blue-50 text-blue-700 border-blue-200";
      case "cancelled": return "bg-rose-50 text-rose-700 border-rose-200";
      default: return "bg-amber-50 text-amber-700 border-amber-200";
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
    <div className="max-w-6xl mx-auto space-y-6">
      <PageHeader
        title="Flight Enquiries"
        description="View and inspect incoming flight bookings and customer specifications."
      />

      <Card>
        <CardHeader>
          <CardTitle>Received Enquiries ({enquiries.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto rounded-md border border-border">
            <table className="w-full text-sm text-left border-collapse">
              <thead>
                <tr className="bg-muted/50 border-b border-border text-xs uppercase tracking-wider text-muted-foreground font-semibold">
                  <th className="p-4">ID</th>
                  <th className="p-4">Customer</th>
                  <th className="p-4">Trip Type</th>
                  <th className="p-4">Status</th>
                  <th className="p-4">Date Received</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {enquiries.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center p-8 text-muted-foreground">
                      No customer enquiries have been logged yet.
                    </td>
                  </tr>
                ) : (
                  enquiries.map((enquiry) => (
                    <tr 
                      key={enquiry.id} 
                      className="hover:bg-muted/40 transition-colors cursor-pointer group"
                      onClick={() => handleViewDetails(enquiry)}
                    >
                      <td className="p-4 font-mono text-xs font-semibold text-primary">
                        {enquiry.enquiry_id}
                      </td>
                      <td className="p-4">
                        <div className="font-medium text-foreground">
                          {enquiry.first_name} {enquiry.last_name}
                        </div>
                        <div className="text-xs text-muted-foreground">{enquiry.email}</div>
                      </td>
                      <td className="p-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium uppercase tracking-wide border ${
                          enquiry.trip_type === "roundtrip" ? "bg-purple-50 text-purple-700 border-purple-200" : "bg-slate-50 text-slate-700 border-slate-200"
                        }`}>
                          {enquiry.trip_type === "roundtrip" ? "Round Trip" : "One Way"}
                        </span>
                      </td>
                      <td className="p-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium uppercase tracking-wide border ${getStatusBadgeClass(enquiry.status)}`}>
                          {enquiry.status || "pending"}
                        </span>
                      </td>
                      <td className="p-4 text-muted-foreground text-xs">
                        {new Date(enquiry.created_at).toLocaleDateString(undefined, {
                          dateStyle: "medium"
                        })}
                      </td>
                      <td className="p-4 text-right" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleViewDetails(enquiry)}
                            className="h-8 w-8 text-muted-foreground hover:text-primary"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={(e) => onDelete(enquiry.enquiry_id, e)}
                            className="h-8 w-8 text-destructive hover:bg-destructive/10"
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
        </CardContent>
      </Card>

      {/* INSPECTION DETAIL DIALOG MODAL */}
      <Dialog open={detailModalOpen} onOpenChange={setDetailModalOpen}>
        <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto">
          {selectedEnquiry && (
            <>
              <DialogHeader className="border-b border-border pb-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <span className="text-xs font-mono font-bold text-muted-foreground block uppercase tracking-widest">
                      Inspection Panel
                    </span>
                    <DialogTitle className="text-2xl font-bold tracking-tight">
                      Enquiry {selectedEnquiry.enquiry_id}
                    </DialogTitle>
                  </div>
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider border ${getStatusBadgeClass(selectedEnquiry.status)}`}>
                    {selectedEnquiry.status || "pending"}
                  </span>
                </div>
              </DialogHeader>

              <div className="space-y-6 pt-2">
                {/* Contact Layout Card */}
                <div className="grid sm:grid-cols-2 gap-4 bg-muted/30 border border-border p-4 rounded-xl">
                  <div className="space-y-2">
                    <h3 className="text-xs font-bold uppercase text-muted-foreground tracking-wider flex items-center gap-1.5">
                      <User className="w-3.5 h-3.5" /> Customer Info
                    </h3>
                    <p className="text-base font-semibold text-foreground">
                      {selectedEnquiry.first_name} {selectedEnquiry.last_name}
                    </p>
                  </div>
                  <div className="space-y-1.5">
                    <h3 className="text-xs font-bold uppercase text-muted-foreground tracking-wider flex items-center gap-1.5">
                      <Mail className="w-3.5 h-3.5" /> Communications
                    </h3>
                    <div className="text-sm space-y-0.5">
                      <p className="flex items-center gap-2 text-foreground">
                        <span className="text-muted-foreground">Email:</span> {selectedEnquiry.email}
                      </p>
                      <p className="flex items-center gap-2 text-foreground">
                        <span className="text-muted-foreground">Phone:</span> {selectedEnquiry.phone}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Flight Path Metrics */}
                <div className="space-y-4">
                  <h3 className="text-sm font-bold text-primary uppercase tracking-widest border-b border-border pb-2">
                    Flight Itinerary Details
                  </h3>

                  {/* One Way Legs */}
                  <div className="space-y-3">
                    <h4 className="text-xs font-bold uppercase tracking-widest text-slate-500 flex items-center gap-2">
                      <span className="h-2 w-2 rounded-full bg-primary inline-block" />
                      Outbound Journey Legs
                    </h4>
                    
                    {parseLegs(selectedEnquiry.one_way_legs).map((leg, index) => (
                      <div key={index} className="bg-slate-50/50 border border-slate-200 rounded-xl p-4 grid md:grid-cols-4 gap-4 items-center">
                        <div className="md:col-span-2">
                          <div className="text-xs text-muted-foreground font-semibold uppercase mb-1">Sector {index + 1}</div>
                          <div className="flex items-center gap-2 text-base font-bold text-slate-900">
                            <span>{leg.departure}</span>
                            <ArrowRight className="w-4 h-4 text-muted-foreground" />
                            <span>{leg.arrival}</span>
                          </div>
                        </div>
                        <div className="space-y-1">
                          <div className="text-xs text-muted-foreground uppercase tracking-wider flex items-center gap-1">
                            <Plane className="w-3 h-3" /> Aircraft Specs
                          </div>
                          <div className="text-xs font-semibold text-slate-800 bg-slate-100 rounded px-2 py-0.5 w-fit">
                            {leg.aircraft || "Unspecified Fleet"}
                          </div>
                          <div className="text-xs text-muted-foreground">Pax Count: {leg.passengers}</div>
                        </div>
                        <div className="space-y-0.5 text-xs text-slate-700">
                          <div className="flex items-center gap-1.5">
                            <Calendar className="w-3.5 h-3.5 text-muted-foreground" /> {leg.date}
                          </div>
                          <div className="flex items-center gap-1.5">
                            <Clock className="w-3.5 h-3.5 text-muted-foreground" /> {leg.time}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Return Legs */}
                  {selectedEnquiry.trip_type === "roundtrip" && selectedEnquiry.return_legs && (
                    <div className="space-y-3 mt-4">
                      <h4 className="text-xs font-bold uppercase tracking-widest text-purple-600 flex items-center gap-2">
                        <span className="h-2 w-2 rounded-full bg-purple-600 inline-block" />
                        Inbound Return Journey Legs
                      </h4>
                      
                      {parseLegs(selectedEnquiry.return_legs).map((leg, index) => (
                        <div key={index} className="bg-purple-50/20 border border-purple-100 rounded-xl p-4 grid md:grid-cols-4 gap-4 items-center">
                          <div className="md:col-span-2">
                            <div className="text-xs text-purple-500/70 font-semibold uppercase mb-1">Return Sector {index + 1}</div>
                            <div className="flex items-center gap-2 text-base font-bold text-slate-900">
                              <span>{leg.departure}</span>
                              <ArrowRight className="w-4 h-4 text-muted-foreground" />
                              <span>{leg.arrival}</span>
                            </div>
                          </div>
                          <div className="space-y-1">
                            <div className="text-xs text-muted-foreground uppercase tracking-wider flex items-center gap-1">
                              <Plane className="w-3 h-3" /> Aircraft Specs
                            </div>
                            <div className="text-xs font-semibold text-purple-800 bg-purple-50 border border-purple-100 rounded px-2 py-0.5 w-fit">
                              {leg.aircraft || "Unspecified Fleet"}
                            </div>
                            <div className="text-xs text-muted-foreground">Pax Count: {leg.passengers}</div>
                          </div>
                          <div className="space-y-0.5 text-xs text-slate-700">
                            <div className="flex items-center gap-1.5">
                              <Calendar className="w-3.5 h-3.5 text-muted-foreground" /> {leg.date}
                            </div>
                            <div className="flex items-center gap-1.5">
                              <Clock className="w-3.5 h-3.5 text-muted-foreground" /> {leg.time}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Message / Comments Box */}
                <div className="space-y-2 border-t border-border pt-4">
                  <h3 className="text-xs font-bold uppercase text-muted-foreground tracking-wider flex items-center gap-1.5">
                    <MessageSquare className="w-3.5 h-3.5" /> Customer Remarks & Message
                  </h3>
                  <div className="bg-muted/40 rounded-xl p-4 border border-border text-sm text-foreground leading-relaxed whitespace-pre-wrap">
                    {selectedEnquiry.message || "No message or custom requirements provided by customer."}
                  </div>
                </div>
              </div>

              <div className="border-t border-border pt-4 flex justify-end">
                <Button 
                  onClick={() => setDetailModalOpen(false)} 
                  className="bg-gradient-to-r from-primary to-accent text-primary-foreground shadow-sm"
                >
                  Close Inspection View
                </Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}