import Link from "next/link";

import { AdminDashboardShell } from "@/components/admin/AdminDashboardShell";
import { updateInquiryStatusAction } from "@/app/admin/inquiries/actions";
import { createClient } from "@/lib/supabase/server";

type PageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

type InquiryItem = {
  id: string;
  name: string;
  company: string | null;
  email: string | null;
  phone: string | null;
  subject: string | null;
  message: string;
  source: string;
  status: string;
  created_at: string;
};

async function getInquiries(status: string) {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    return { data: [] as InquiryItem[], dataUnavailable: true };
  }

  try {
    const supabase = await createClient();
    let query = supabase
      .from("inquiries")
      .select("id,name,company,email,phone,subject,message,source,status,created_at")
      .order("created_at", { ascending: false });

    if (status !== "all") {
      query = query.eq("status", status);
    }

    const { data, error } = await query;

    if (error) {
      console.warn("[admin] inquiries read failed:", error.message);
      return { data: [] as InquiryItem[], dataUnavailable: true };
    }

    return { data: (data ?? []) as InquiryItem[], dataUnavailable: false };
  } catch {
    console.warn("[admin] unexpected error reading inquiries");
    return { data: [] as InquiryItem[], dataUnavailable: true };
  }
}

function formatDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return new Intl.DateTimeFormat("id-ID", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

export default async function AdminInquiriesPage({ searchParams }: PageProps) {
  const params = (await searchParams) ?? {};
  const statusParam = Array.isArray(params.status) ? params.status[0] : params.status;
  const selectedStatus = statusParam && ["new", "contacted", "closed", "all"].includes(statusParam) ? statusParam : "all";

  const { data: inquiries, dataUnavailable } = await getInquiries(selectedStatus);

  return (
    <AdminDashboardShell
      currentPath="/admin/inquiries"
      title="Inquiries"
      subtitle="Daftar inquiry yang masuk dari halaman publik dan status follow-up tim sales."
      dataUnavailable={dataUnavailable}
    >
      <section className="rounded-3xl bg-white p-4 shadow-sm ring-1 ring-slate-200/70">
        <div className="flex flex-wrap gap-2">
          {[
            { label: "All", value: "all" },
            { label: "New", value: "new" },
            { label: "Contacted", value: "contacted" },
            { label: "Closed", value: "closed" },
          ].map((item) => (
            <Link
              key={item.value}
              href={`/admin/inquiries?status=${item.value}`}
                className={`rounded-full px-3 py-1.5 text-xs font-semibold ${
                  selectedStatus === item.value ? "bg-[#e7000b] text-white" : "bg-slate-100 text-slate-700 hover:bg-[#EAECED] hover:text-[#e7000b]"
                }`}
              >
              {item.label}
            </Link>
          ))}
        </div>
      </section>

      <section className="overflow-x-auto rounded-3xl bg-white shadow-sm ring-1 ring-slate-200/70">
            <table className="min-w-full text-sm">
              <thead className="bg-[#f8fafc] text-left text-xs uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-4 py-3">Date</th>
                  <th className="px-4 py-3">Contact</th>
                  <th className="px-4 py-3">Subject</th>
                  <th className="px-4 py-3">Message</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {inquiries.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-6 text-center text-slate-500">
                      Belum ada inquiry.
                    </td>
                  </tr>
                ) : (
                  inquiries.map((item) => (
                    <tr key={item.id} className="align-top hover:bg-[#EAECED]/55">
                      <td className="whitespace-nowrap px-4 py-3 text-xs text-slate-500">{formatDate(item.created_at)}</td>
                      <td className="px-4 py-3">
                        <p className="font-semibold text-slate-900">{item.name}</p>
                        <p className="text-xs text-slate-600">{item.company ?? "-"}</p>
                        <p className="mt-1 text-xs text-slate-600">{item.email ?? "-"}</p>
                        <p className="text-xs text-slate-600">{item.phone ?? "-"}</p>
                      </td>
                      <td className="px-4 py-3">
                        <p className="font-medium text-slate-900">{item.subject ?? "(Tanpa subjek)"}</p>
                        <p className="mt-1 text-xs text-slate-500">Source: {item.source}</p>
                      </td>
                      <td className="max-w-sm px-4 py-3 text-slate-700">{item.message}</td>
                      <td className="px-4 py-3">
                        <span className={`rounded-full px-2 py-1 text-xs font-semibold ${item.status === "closed" ? "bg-emerald-100 text-emerald-700" : item.status === "contacted" ? "bg-amber-100 text-amber-700" : "bg-red-50 text-[#e7000b]"}`}>{item.status}</span>
                      </td>
                      <td className="px-4 py-3">
                        <form action={updateInquiryStatusAction} className="flex flex-wrap gap-2">
                          <input type="hidden" name="id" value={item.id} />
                          <button name="next_status" value="new" className="rounded border border-slate-300 px-2 py-1 text-xs transition hover:bg-slate-50">
                            New
                          </button>
                          <button name="next_status" value="contacted" className="rounded border border-red-300 px-2 py-1 text-xs text-red-700 hover:bg-red-50">
                            Contacted
                          </button>
                          <button name="next_status" value="closed" className="rounded border border-emerald-300 px-2 py-1 text-xs text-emerald-700 hover:bg-emerald-50">
                            Closed
                          </button>
                        </form>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
      </section>
    </AdminDashboardShell>
  );
}
