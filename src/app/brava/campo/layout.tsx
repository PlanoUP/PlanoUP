import OfflineServiceWorkerRegistrar from "@/components/brava/campo/OfflineServiceWorkerRegistrar";

export default function CampoLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <OfflineServiceWorkerRegistrar />
      {children}
    </>
  );
}
