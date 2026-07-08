"use client";

import { useEffect, useState } from "react";
import { useAdminAuth } from "@/components/admin/context";
import { useBookingSheet } from "@/components/admin/useBookingSheet";
import Dashboard from "@/components/admin/Dashboard";
import BookingSheet from "@/components/admin/BookingSheet";
import type { Booking, Stats } from "@/lib/format";

export default function DashboardPage() {
  const { authFetch } = useAdminAuth();
  const [stats, setStats] = useState<Stats | null>(null);
  const [recent, setRecent] = useState<Booking[] | null>(null);

  const load = async () => {
    const res = await authFetch("/api/admin/stats");
    const data = (await res.json()) as { stats: Stats; recent: Booking[] };
    setStats(data.stats);
    setRecent(data.recent || []);
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const bk = useBookingSheet(authFetch, load);

  return (
    <>
      <Dashboard stats={stats} recent={recent} onOpen={bk.open} />
      <BookingSheet
        booking={bk.booking}
        saving={bk.saving}
        onClose={bk.close}
        onSave={bk.save}
      />
    </>
  );
}
