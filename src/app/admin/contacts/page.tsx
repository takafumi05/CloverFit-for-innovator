"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAdminAuth } from "@/components/admin/context";
import { useBookingSheet } from "@/components/admin/useBookingSheet";
import BookingsTable from "@/components/admin/BookingsTable";
import BookingSheet from "@/components/admin/BookingSheet";
import type { Booking } from "@/lib/format";

function ContactsInner() {
  const { authFetch } = useAdminAuth();
  const router = useRouter();
  const sp = useSearchParams();
  const status = sp.get("status") || "all";
  const page = Math.max(1, parseInt(sp.get("page") || "1", 10) || 1);

  const [bookings, setBookings] = useState<Booking[] | null>(null);
  const [total, setTotal] = useState(0);

  const load = async () => {
    setBookings(null);
    const res = await authFetch(
      `/api/admin/bookings?status=${status}&page=${page}`
    );
    const data = (await res.json()) as { bookings: Booking[]; total: number };
    setBookings(data.bookings || []);
    setTotal(data.total || 0);
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status, page]);

  const bk = useBookingSheet(authFetch, load);

  const goto = (s: string, p: number) =>
    router.push(`/admin/contacts?status=${s}&page=${p}`);

  return (
    <>
      <BookingsTable
        bookings={bookings}
        total={total}
        filter={status}
        page={page}
        onFilter={(f) => goto(f, 1)}
        onPage={(p) => goto(status, p)}
        onOpen={bk.open}
      />
      <BookingSheet
        booking={bk.booking}
        saving={bk.saving}
        onClose={bk.close}
        onSave={bk.save}
      />
    </>
  );
}

export default function ContactsPage() {
  return (
    <Suspense fallback={null}>
      <ContactsInner />
    </Suspense>
  );
}
