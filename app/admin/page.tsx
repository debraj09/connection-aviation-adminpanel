"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { PageHeader } from "@/components/page-header";
import { Image, Info, Plane, HelpCircle, ArrowRight, Loader2 } from "lucide-react";

const API_BASE = "https://aviation.braventra.in/api";

interface DashboardData {
  hero: { title: string; description: string } | null;
  servicesCount: number;
  faqsCount: number;
  aboutExists: boolean;
}

export default function DashboardPage() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<DashboardData>({
    hero: null,
    servicesCount: 0,
    faqsCount: 0,
    aboutExists: false,
  });

  useEffect(() => {
    const fetchAll = async () => {
      setLoading(true);
      try {
        const [heroRes, servicesRes, faqsRes, aboutRes] = await Promise.all([
          fetch(`${API_BASE}/hero`).then((r) => r.json()).catch(() => null),
          fetch(`${API_BASE}/services`).then((r) => r.json()).catch(() => []),
          fetch(`${API_BASE}/faqs`).then((r) => r.json()).catch(() => []),
          fetch(`${API_BASE}/about`).then((r) => r.json()).catch(() => null),
        ]);

        setData({
          hero: heroRes,
          servicesCount: Array.isArray(servicesRes) ? servicesRes.length : 0,
          faqsCount: Array.isArray(faqsRes) ? faqsRes.length : 0,
          aboutExists: aboutRes && !aboutRes.error,
        });
      } catch (err) {
        console.error("Failed to load dashboard data", err);
      } finally {
        setLoading(false);
      }
    };

    fetchAll();
  }, []);

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="animate-spin text-primary h-8 w-8" />
      </div>
    );
  }

  const stats = [
    {
      href: "/admin/hero",
      label: "Hero Section",
      icon: Image,
      count: 1,
      description: "Main banner content →",
    },
    {
      href: "/admin/about",
      label: "About Us",
      icon: Info,
      count: 1,
      description: "Company information →",
    },
    {
      href: "/admin/services",
      label: "Services",
      icon: Plane,
      count: data.servicesCount,
      description: "Aviation services →",
    },
    {
      href: "/admin/faqs",
      label: "FAQs",
      icon: HelpCircle,
      count: data.faqsCount,
      description: "Frequently asked →",
    },
  ];

  return (
    <div className="max-w-6xl mx-auto">
      <PageHeader
        title="Welcome back, Admin"
        description="Manage your Connection Aviation website content from one place."
      />

      {/* Hero Banner Preview */}
      <Card className="mb-8 overflow-hidden bg-gradient-to-r from-primary to-accent text-primary-foreground">
        <CardContent className="p-6 sm:p-8">
          <p className="text-xs uppercase tracking-widest opacity-80 font-semibold">
            SINCE 2004
          </p>
          <h2 className="text-2xl sm:text-3xl font-bold mt-2">
            {data.hero?.title || "Fly Beyond Limits"}
          </h2>
          <p className="mt-3 opacity-80 max-w-xl leading-relaxed">
            {data.hero?.description ||
              "Bespoke private aviation. Update website sections in real time and keep your customers informed."}
          </p>
        </CardContent>
      </Card>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {stats.map((stat) => (
          <Link key={stat.href} href={stat.href}>
            <Card className="hover:shadow-lg transition-all hover:border-primary/30 h-full">
              <CardContent className="p-5 flex flex-col h-full">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-sm font-medium text-muted-foreground">
                    {stat.label}
                  </span>
                  <stat.icon className="h-5 w-5 text-primary" />
                </div>
                <p className="text-3xl font-bold text-foreground">{stat.count}</p>
                <p className="text-sm text-muted-foreground mt-2 flex items-center gap-1">
                  {stat.description}
                </p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
