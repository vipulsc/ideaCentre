import { authOptions } from "@/lib/auth";
import { getServerSession } from "next-auth/next";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/?next=/dashboard");
  }

  return (
    <div className="dashboard-shell min-h-screen font-sans antialiased">
      {children}
    </div>
  );
}
