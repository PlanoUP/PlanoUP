import { redirect } from "next/navigation";

export default function CustosRedirect() {
  redirect("/brava/consolidado?tab=custos");
}
