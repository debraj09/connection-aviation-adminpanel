import type { ReactNode } from "react";
import { AdminLayout } from "@/components/admin-layout";
import { Toaster } from "sonner";

export default function AdminRootLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <AdminLayout>{children}</AdminLayout>
      <Toaster richColors position="top-right" />
    </>
  );
}
