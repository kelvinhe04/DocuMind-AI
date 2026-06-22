import { AppShell } from "@/components/app/AppShell";
import { UploadDropzone } from "@/components/app/UploadDropzone";

export default function UploadPage() {
  return (
    <AppShell>
      <div className="w-full">
        <div className="mx-auto w-full max-w-4xl">
          <UploadDropzone />
        </div>
      </div>
    </AppShell>
  );
}
