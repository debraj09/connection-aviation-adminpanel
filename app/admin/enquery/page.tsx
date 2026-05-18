"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/page-header";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
  ArrowRight,
  Helicopter
} from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

// API Endpoints
const CHARTER_API_URL = "https://aviation.braventra.in/api/enquiries";
const HELI_API_URL = "https://aviation.braventra.in/api/helicopter-enquiries";

interface FlightLeg {
  leg_number: number;
  departure: string;
  arrival: string;
  passengers: number;
  date: string;
  time: string;
  aircraft: string;
}

interface CharterEnquiry {
  id: number;
  enquiry_id: string;
  trip_type: "oneway" | "roundtrip";
  one_way_legs: string | FlightLeg[];
  return_legs: string | FlightLeg[] | null;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  message: string | null;
  status: "pending" | "contacted" | "confirmed" | "cancelled";
  created_at: string;
}

interface HelicopterEnquiry {
  id: number;
  enquiry_id: string;
  from: string;
  to: string;
  date_of_journey: string;
  time_of_journey: string;
  passengers: number;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  message: string | null;
  status: "pending" | "contacted" | "confirmed" | "cancelled";
  created_at: string;
}

export default function EnquiriesPage() {
  const [loadingCharter, setLoadingCharter] = useState(true);
  const [loadingHeli, setLoadingHeli] = useState(true);
  const [charterEnquiries, setCharterEnquiries] = useState<CharterEnquiry[]>([]);
  const [heliEnquiries, setHeliEnquiries] = useState<HelicopterEnquiry[]>([]);
  
  // Inspection Modals Handling State
  const [selectedCharter, setSelectedCharter] = useState<CharterEnquiry | null>(null);
  const [selectedHeli, setSelectedHeli] = useState<HelicopterEnquiry | null>(null);
  const [charterModalOpen, setCharterModalOpen] = useState(false);
  const [heliModalOpen, setHeliModalOpen] = useState(false);

  useEffect(() => {
    fetchCharterEnquiries();
    fetchHeliEnquiries();
  }, []);

  const fetchCharterEnquiries = async () => {
    setLoadingCharter(true);
    try {
      const res = await fetch(CHARTER_API_URL);
      const json = await res.json();
      setCharterEnquiries(Array.isArray(json) ? json : []);
    } catch (err) {
      console.error("Fetch charter error:", err);
      toast.error("Failed to load charter enquiries");
    } finally {
      setLoadingCharter(false);
    }
  };

  const fetchHeliEnquiries = async () => {
    setLoadingHeli(true);
    try {
      const res = await fetch(HELI_API_URL);
      const json = await res.json();
      setHeliEnquiries(Array.isArray(json) ? json : []);
    } catch (err) {
      console.error("Fetch helicopter error:", err);
      toast.error("Failed to load helicopter enquiries");
    } finally {
      setLoadingHeli(false);
    }
  };

  const onDeleteCharter = async (id: string | number, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm("Are you sure you want to delete this charter enquiry permanently?")) return;
    try {
      const response = await fetch(`${CHARTER_API_URL}/${id}`, { method: "DELETE" });
      if (!response.ok) throw new Error("Delete failed");
      toast.success("Charter enquiry deleted successfully");
      fetchCharterEnquiries();
    } catch (error) {
      toast.error("Delete sequence failed");
    }
  };

  const onDeleteHeli = async (id: string | number, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm("Are you sure you want to delete this helicopter enquiry permanently?")) return;
    try {
      const response = await fetch(`${HELI_API_URL}/${id}`, { method: "DELETE" });
      if (!response.ok) throw new Error("Delete failed");
      toast.success("Helicopter enquiry deleted successfully");
      fetchHeliEnquiries();
    } catch (error) {
      toast.error("Delete sequence failed");
    }
  };

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

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <PageHeader
        title="Enquiries Desk"
        description="View and manage inbound flight reservations across your standard business jets and helicopter operators fleets."
      />

      <Tabs defaultValue="charter" className="w-full">
        <TabsList className="grid grid-cols-2 max-w-md mb-4 bg-muted">
          <TabsTrigger value="charter" className="flex items-center gap-2">
            <Plane className="w-4 h-4" /> Charter Enquiries
          </TabsTrigger>
          <TabsTrigger value="helicopter" className="flex items-center gap-2">
            <Helicopter className="w-4 h-4" /> Helicopter Enquries
          </TabsTrigger>
        </TabsList>

        {/* ----------------- TAB: JET CHARTERS ----------------- */}
        <TabsContent value="charter">
          {loadingCharter ? (
            <div className="flex h-64 items-center justify-center"><Loader2 className="animate-spin text-primary" /></div>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>Received Jet Enquiries ({charterEnquiries.length})</CardTitle>
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
                      {charterEnquiries.length === 0 ? (
                        <tr><td colSpan={6} className="text-center p-8 text-muted-foreground">No customer jet enquiries have been logged yet.</td></tr>
                      ) : (
                        charterEnquiries.map((enquiry) => (
                          <tr key={enquiry.id} className="hover:bg-muted/40 transition-colors cursor-pointer group" onClick={() => { setSelectedCharter(enquiry); setCharterModalOpen(true); }}>
                            <td className="p-4 font-mono text-xs font-semibold text-primary">{enquiry.enquiry_id}</td>
                            <td className="p-4">
                              <div className="font-medium text-foreground">{enquiry.first_name} {enquiry.last_name}</div>
                              <div className="text-xs text-muted-foreground">{enquiry.email}</div>
                            </td>
                            <td className="p-4">
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium uppercase tracking-wide border ${enquiry.trip_type === "roundtrip" ? "bg-purple-50 text-purple-700 border-purple-200" : "bg-slate-50 text-slate-700 border-slate-200"}`}>
                                {enquiry.trip_type === "roundtrip" ? "Round Trip" : "One Way"}
                              </span>
                            </td>
                            <td className="p-4">
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium uppercase tracking-wide border ${getStatusBadgeClass(enquiry.status)}`}>
                                {enquiry.status || "pending"}
                              </span>
                            </td>
                            <td className="p-4 text-muted-foreground text-xs">{new Date(enquiry.created_at).toLocaleDateString(undefined, { dateStyle: "medium" })}</td>
                            <td className="p-4 text-right" onClick={(e) => e.stopPropagation()}>
                              <div className="flex items-center justify-end gap-2">
                                <Button variant="ghost" size="icon" onClick={() => { setSelectedCharter(enquiry); setCharterModalOpen(true); }} className="h-8 w-8 text-muted-foreground hover:text-primary"><Eye className="h-4 w-4" /></Button>
                                <Button variant="ghost" size="icon" onClick={(e) => onDeleteCharter(enquiry.enquiry_id, e)} className="h-8 w-8 text-destructive hover:bg-destructive/10"><Trash2 className="h-4 w-4" /></Button>
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
          )}
        </TabsContent>

        {/* ----------------- TAB: HELICOPTER ENQUIRIES ----------------- */}
        <TabsContent value="helicopter">
          {loadingHeli ? (
            <div className="flex h-64 items-center justify-center"><Loader2 className="animate-spin text-primary" /></div>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>Helicopter Estimation Enquiries ({heliEnquiries.length})</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto rounded-md border border-border">
                  <table className="w-full text-sm text-left border-collapse">
                    <thead>
                      <tr className="bg-muted/50 border-b border-border text-xs uppercase tracking-wider text-muted-foreground font-semibold">
                        <th className="p-4">ID</th>
                        <th className="p-4">Customer</th>
                        <th className="p-4">Route Path</th>
                        <th className="p-4">Pax</th>
                        <th className="p-4">Status</th>
                        <th className="p-4">Date Received</th>
                        <th className="p-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {heliEnquiries.length === 0 ? (
                        <tr><td colSpan={7} className="text-center p-8 text-muted-foreground">No helicopter estimations requests found.</td></tr>
                      ) : (
                        heliEnquiries.map((enquiry) => (
                          <tr key={enquiry.id} className="hover:bg-muted/40 transition-colors cursor-pointer group" onClick={() => { setSelectedHeli(enquiry); setHeliModalOpen(true); }}>
                            <td className="p-4 font-mono text-xs font-semibold text-sky-700">{enquiry.enquiry_id}</td>
                            <td className="p-4">
                              <div className="font-medium text-foreground">{enquiry.first_name} {enquiry.last_name}</div>
                              <div className="text-xs text-muted-foreground">{enquiry.phone}</div>
                            </td>
                            <td className="p-4 font-medium text-slate-800">
                              <div className="flex items-center gap-2">
                                <span className="text-slate-900">{enquiry.from}</span>
                                <ArrowRight className="w-3.5 h-3.5 text-muted-foreground" />
                                <span className="text-slate-900">{enquiry.to}</span>
                              </div>
                            </td>
                            <td className="p-4 font-mono font-medium">{enquiry.passengers}</td>
                            <td className="p-4">
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium uppercase tracking-wide border ${getStatusBadgeClass(enquiry.status)}`}>
                                {enquiry.status || "pending"}
                              </span>
                            </td>
                            <td className="p-4 text-muted-foreground text-xs">{new Date(enquiry.created_at).toLocaleDateString(undefined, { dateStyle: "medium" })}</td>
                            <td className="p-4 text-right" onClick={(e) => e.stopPropagation()}>
                              <div className="flex items-center justify-end gap-2">
                                <Button variant="ghost" size="icon" onClick={() => { setSelectedHeli(enquiry); setHeliModalOpen(true); }} className="h-8 w-8 text-muted-foreground hover:text-primary"><Eye className="h-4 w-4" /></Button>
                                <Button variant="ghost" size="icon" onClick={(e) => onDeleteHeli(enquiry.enquiry_id, e)} className="h-8 w-8 text-destructive hover:bg-destructive/10"><Trash2 className="h-4 w-4" /></Button>
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
          )}
        </TabsContent>
      </Tabs>

      {/* ================= MODAL: CHARTER INSPECTOR ================= */}
      <Dialog open={charterModalOpen} onOpenChange={setCharterModalOpen}>
        <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto">
          {selectedCharter && (
            <>
              <DialogHeader className="border-b border-border pb-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <span className="text-xs font-mono font-bold text-muted-foreground block uppercase tracking-widest">Jet Inspection Panel</span>
                    <DialogTitle className="text-2xl font-bold tracking-tight">Enquiry {selectedCharter.enquiry_id}</DialogTitle>
                  </div>
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider border ${getStatusBadgeClass(selectedCharter.status)}`}>
                    {selectedCharter.status || "pending"}
                  </span>
                </div>
              </DialogHeader>
              <div className="space-y-6 pt-2">
                <div className="grid sm:grid-cols-2 gap-4 bg-muted/30 border border-border p-4 rounded-xl">
                  <div className="space-y-2">
                    <h3 className="text-xs font-bold uppercase text-muted-foreground tracking-wider flex items-center gap-1.5"><User className="w-3.5 h-3.5" /> Customer Info</h3>
                    <p className="text-base font-semibold text-foreground">{selectedCharter.first_name} {selectedCharter.last_name}</p>
                  </div>
                  <div className="space-y-1.5">
                    <h3 className="text-xs font-bold uppercase text-muted-foreground tracking-wider flex items-center gap-1.5"><Mail className="w-3.5 h-3.5" /> Communications</h3>
                    <div className="text-sm space-y-0.5">
                      <p className="text-foreground"><span className="text-muted-foreground">Email:</span> {selectedCharter.email}</p>
                      <p className="text-foreground"><span className="text-muted-foreground">Phone:</span> {selectedCharter.phone}</p>
                    </div>
                  </div>
                </div>
                <div className="space-y-4">
                  <h3 className="text-sm font-bold text-primary uppercase tracking-widest border-b border-border pb-2">Flight Itinerary Details</h3>
                  <div className="space-y-3">
                    <h4 className="text-xs font-bold uppercase tracking-widest text-slate-500 flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-primary inline-block" /> Outbound Journey Legs</h4>
                    {parseLegs(selectedCharter.one_way_legs).map((leg, index) => (
                      <div key={index} className="bg-slate-50/50 border border-slate-200 rounded-xl p-4 grid md:grid-cols-4 gap-4 items-center">
                        <div className="md:col-span-2">
                          <div className="text-xs text-muted-foreground font-semibold uppercase mb-1">Sector {index + 1}</div>
                          <div className="flex items-center gap-2 text-base font-bold text-slate-900">
                            <span>{leg.departure}</span><ArrowRight className="w-4 h-4 text-muted-foreground" /><span>{leg.arrival}</span>
                          </div>
                        </div>
                        <div className="space-y-1">
                          <div className="text-xs text-muted-foreground uppercase tracking-wider flex items-center gap-1"><Plane className="w-3 h-3" /> Aircraft Specs</div>
                          <div className="text-xs font-semibold text-slate-800 bg-slate-100 rounded px-2 py-0.5 w-fit">{leg.aircraft || "Unspecified Fleet"}</div>
                          <div className="text-xs text-muted-foreground">Pax Count: {leg.passengers}</div>
                        </div>
                        <div className="space-y-0.5 text-xs text-slate-700">
                          <div className="flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5 text-muted-foreground" /> {leg.date}</div>
                          <div className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5 text-muted-foreground" /> {leg.time}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                  {selectedCharter.trip_type === "roundtrip" && selectedCharter.return_legs && (
                    <div className="space-y-3 mt-4">
                      <h4 className="text-xs font-bold uppercase tracking-widest text-purple-600 flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-purple-600 inline-block" /> Inbound Return Journey Legs</h4>
                      {parseLegs(selectedCharter.return_legs).map((leg, index) => (
                        <div key={index} className="bg-purple-50/20 border border-purple-100 rounded-xl p-4 grid md:grid-cols-4 gap-4 items-center">
                          <div className="md:col-span-2">
                            <div className="text-xs text-purple-500/70 font-semibold uppercase mb-1">Return Sector {index + 1}</div>
                            <div className="flex items-center gap-2 text-base font-bold text-slate-900">
                              <span>{leg.departure}</span><ArrowRight className="w-4 h-4 text-muted-foreground" /><span>{leg.arrival}</span>
                            </div>
                          </div>
                          <div className="space-y-1">
                            <div className="text-xs text-muted-foreground uppercase tracking-wider flex items-center gap-1"><Plane className="w-3 h-3" /> Aircraft Specs</div>
                            <div className="text-xs font-semibold text-purple-800 bg-purple-50 border border-purple-100 rounded px-2 py-0.5 w-fit">{leg.aircraft || "Unspecified Fleet"}</div>
                            <div className="text-xs text-muted-foreground">Pax Count: {leg.passengers}</div>
                          </div>
                          <div className="space-y-0.5 text-xs text-slate-700">
                            <div className="flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5 text-muted-foreground" /> {leg.date}</div>
                            <div className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5 text-muted-foreground" /> {leg.time}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                <div className="space-y-2 border-t border-border pt-4">
                  <h3 className="text-xs font-bold uppercase text-muted-foreground tracking-wider flex items-center gap-1.5"><MessageSquare className="w-3.5 h-3.5" /> Customer Remarks</h3>
                  <div className="bg-muted/40 rounded-xl p-4 border border-border text-sm text-foreground leading-relaxed whitespace-pre-wrap">
                    {selectedCharter.message || "No custom message variations provided."}
                  </div>
                </div>
              </div>
              <div className="border-t border-border pt-4 flex justify-end">
                <Button onClick={() => setCharterModalOpen(false)}>Close Inspection View</Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* ================= MODAL: HELICOPTER INSPECTOR ================= */}
      <Dialog open={heliModalOpen} onOpenChange={setHeliModalOpen}>
        <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto">
          {selectedHeli && (
            <>
              <DialogHeader className="border-b border-border pb-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <span className="text-xs font-mono font-bold text-sky-600 block uppercase tracking-widest">Helicopter Inspector Panel</span>
                    <DialogTitle className="text-2xl font-bold tracking-tight">Estimation {selectedHeli.enquiry_id}</DialogTitle>
                  </div>
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider border ${getStatusBadgeClass(selectedHeli.status)}`}>
                    {selectedHeli.status || "pending"}
                  </span>
                </div>
              </DialogHeader>
              <div className="space-y-6 pt-2">
                <div className="grid sm:grid-cols-2 gap-4 bg-muted/30 border border-border p-4 rounded-xl">
                  <div className="space-y-2">
                    <h3 className="text-xs font-bold uppercase text-muted-foreground tracking-wider flex items-center gap-1.5"><User className="w-3.5 h-3.5" /> Customer Identity</h3>
                    <p className="text-base font-semibold text-foreground">{selectedHeli.first_name} {selectedHeli.last_name}</p>
                  </div>
                  <div className="space-y-1.5">
                    <h3 className="text-xs font-bold uppercase text-muted-foreground tracking-wider flex items-center gap-1.5"><Mail className="w-3.5 h-3.5" /> Contact Channels</h3>
                    <div className="text-sm space-y-0.5">
                      <p className="text-foreground"><span className="text-muted-foreground">Email:</span> {selectedHeli.email}</p>
                      <p className="text-foreground"><span className="text-muted-foreground">Phone:</span> {selectedHeli.phone}</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-sm font-bold text-sky-700 uppercase tracking-widest border-b border-border pb-2">Single-Sector Flight Plan</h3>
                  <div className="bg-sky-50/30 border border-sky-100 rounded-xl p-5 grid md:grid-cols-3 gap-6 items-center">
                    <div className="md:col-span-1 space-y-1">
                      <div className="text-xs text-sky-600 font-bold uppercase tracking-wider">Flight Sector Route</div>
                      <div className="flex flex-col gap-1 text-base font-bold text-slate-900">
                        <span className="text-slate-500 text-xs font-normal">From:</span>
                        <span className="bg-white px-2 py-1 rounded border border-slate-100 text-sm">{selectedHeli.from}</span>
                        <span className="text-slate-500 text-xs font-normal mt-1">To:</span>
                        <span className="bg-white px-2 py-1 rounded border border-slate-100 text-sm">{selectedHeli.to}</span>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="text-xs text-muted-foreground uppercase tracking-wider flex items-center gap-1"><Helicopter className="w-3.5 h-3.5 text-sky-600" /> Operational Metrics</div>
                      <div className="text-xs font-semibold text-sky-800 bg-sky-50 border border-sky-100 rounded px-2 py-1 w-fit">Helicopter Operational Fleet</div>
                      <div className="text-sm font-medium text-slate-700 mt-1">Total Booked Passengers: <span className="font-bold text-slate-900">{selectedHeli.passengers}</span></div>
                    </div>
                    <div className="space-y-1 text-sm text-slate-700 font-medium">
                      <div className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Schedule Timing</div>
                      <div className="flex items-center gap-2 bg-white px-2.5 py-1 rounded border border-slate-100 text-xs text-slate-800"><Calendar className="w-3.5 h-3.5 text-slate-400" /> {selectedHeli.date_of_journey}</div>
                      <div className="flex items-center gap-2 bg-white px-2.5 py-1 rounded border border-slate-100 text-xs text-slate-800 mt-1.5"><Clock className="w-3.5 h-3.5 text-slate-400" /> {selectedHeli.time_of_journey}</div>
                    </div>
                  </div>
                </div>

                <div className="space-y-2 border-t border-border pt-4">
                  <h3 className="text-xs font-bold uppercase text-muted-foreground tracking-wider flex items-center gap-1.5"><MessageSquare className="w-3.5 h-3.5" /> Customer Remarks & Message</h3>
                  <div className="bg-muted/40 rounded-xl p-4 border border-border text-sm text-foreground leading-relaxed whitespace-pre-wrap">
                    {selectedHeli.message || "No requirements variation notes passed on."}
                  </div>
                </div>
              </div>
              <div className="border-t border-border pt-4 flex justify-end">
                <Button onClick={() => setHeliModalOpen(false)} className="bg-gradient-to-r from-sky-700 to-blue-800 hover:from-sky-800 hover:to-blue-900 text-white shadow-sm">
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