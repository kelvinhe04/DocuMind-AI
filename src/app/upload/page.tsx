import { AppShell } from "@/components/app/AppShell";
import { UploadDropzone } from "@/components/app/UploadDropzone";

export default function UploadPage() {
  return (
    <AppShell>
      <div className="flex-1 flex flex-col items-center justify-start pt-10 w-full">
        <div className="w-full max-w-2xl">
          <UploadDropzone />
        </div>
      </div>
    </AppShell>
  );
}
