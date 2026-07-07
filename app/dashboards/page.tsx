import { redirect } from "next/navigation";

export const metadata = {
  title: "mos.bi — Dashboard editor",
};

export default function DashboardsPage() {
  redirect("/dashboards/editor");
}
