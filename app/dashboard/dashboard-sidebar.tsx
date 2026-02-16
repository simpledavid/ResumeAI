"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

type DashboardSidebarProps = {
  username: string;
};

export default function DashboardSidebar({ username }: DashboardSidebarProps) {
  const router = useRouter();

  async function onLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  }

  return (
    <aside className="border-b border-white/10 pb-5 md:flex md:min-h-[860px] md:flex-col md:border-r md:border-b-0 md:pb-0 md:pr-6">
      <p className="pt-2 text-2xl font-bold text-slate-100 md:text-3xl">{username}</p>
      <p className="mt-1 text-sm text-slate-400">简历工作台</p>

      <Card className="mt-5 border-white/10 bg-white/[0.03] shadow-[0_12px_30px_rgba(0,0,0,0.24)]">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm text-slate-100">简历预览</CardTitle>
          <CardDescription className="text-slate-400">编辑后可直接打印导出 PDF</CardDescription>
        </CardHeader>
        <CardContent>
          <Button
            type="button"
            className="w-full bg-[#329a60] text-[#d5f3e4] hover:bg-[#3da96e]"
            onClick={() => window.print()}
          >
            导出 PDF
          </Button>
        </CardContent>
      </Card>

      <div className="mt-6 space-y-1 text-sm text-[#d7c6a4] md:mt-auto">
        <p>• 模板中心</p>
        <p>• 简历设置</p>
      </div>

      <Button
        type="button"
        variant="outline"
        className="mt-4 justify-start border-white/15 bg-transparent text-[#d7c6a4] hover:bg-white/10 hover:text-[#d7c6a4]"
        onClick={onLogout}
      >
        退出登录
      </Button>
    </aside>
  );
}
