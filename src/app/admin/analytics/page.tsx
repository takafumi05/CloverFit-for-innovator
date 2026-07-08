"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAdminAuth } from "@/components/admin/context";
import AnalyticsPanel from "@/components/admin/AnalyticsPanel";
import type { Analytics } from "@/lib/format";

function AnalyticsInner() {
  const { authFetch } = useAdminAuth();
  const router = useRouter();
  const sp = useSearchParams();
  const range = sp.get("range") === "30d" ? "30d" : "7d";

  const [data, setData] = useState<Analytics | null>(null);

  useEffect(() => {
    setData(null);
    (async () => {
      const res = await authFetch(`/api/admin/analytics?range=${range}`);
      setData((await res.json()) as Analytics);
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [range]);

  return (
    <AnalyticsPanel
      data={data}
      range={range}
      onRange={(r) => router.push(`/admin/analytics?range=${r}`)}
    />
  );
}

export default function AnalyticsPage() {
  return (
    <Suspense fallback={null}>
      <AnalyticsInner />
    </Suspense>
  );
}
