import { redirect } from "next/navigation";
import { getSessionFromCookie } from "@/lib/auth";
import DashboardEditor from "@/app/dashboard/dashboard-editor";
import { getServerDb } from "@/lib/db-server";

export const runtime = 'edge';

export default async function DashboardPage() {
  const session = await getSessionFromCookie();
  if (!session) {
    redirect("/login");
  }

  const db = getServerDb();
  const user = await db.users.findUserById(session.sub);

  const username = user?.username ?? session.username;
  const avatarUrl = user?.avatarUrl ?? null;

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_12%_0%,rgba(66,109,208,0.16),transparent_38%),radial-gradient(circle_at_88%_100%,rgba(255,138,92,0.16),transparent_34%),linear-gradient(145deg,#0f141f_0%,#121928_45%,#171e2f_100%)] text-slate-100">
      <div className="mx-auto min-h-screen w-full max-w-[1760px] px-4 py-4 md:px-8 md:py-6">
        <div>
          <DashboardEditor username={username} initialAvatarUrl={avatarUrl} />
        </div>
      </div>
    </main>
  );
}
