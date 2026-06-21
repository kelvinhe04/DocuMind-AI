import { AppShell } from "@/components/app/AppShell";
import { SearchResults } from "@/components/app/SearchResults";

export default function SearchPage() {
  return (
    <AppShell>
      <div className="w-full max-w-3xl mx-auto">
        <SearchResults />
      </div>
    </AppShell>
  );
}
