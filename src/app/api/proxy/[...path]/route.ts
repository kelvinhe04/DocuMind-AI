import { auth, clerkClient } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { PLANS, type PlanId } from "@/lib/plans";

const FASTAPI = process.env.FASTAPI_URL ?? "http://localhost:8000";

async function handler(
  req: NextRequest,
  { params }: { params: Promise<{ path: string[] }> },
) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "unauth" }, { status: 401 });

  const { path } = await params;
  const pathStr = path.join("/");

  // Gating solo en upload
  if (pathStr === "documents/upload" && req.method === "POST") {
    const clerk = await clerkClient();
    const user = await clerk.users.getUser(userId);
    const planId = ((user.publicMetadata?.plan as PlanId) ?? "free") as PlanId;
    const plan = PLANS[planId];

    const contentType = req.headers.get("content-type") ?? "";
    const isImage = contentType.includes("image") ||
      (contentType.includes("multipart") &&
        req.headers.get("x-file-type")?.startsWith("image"));

    if (!plan.ocr && isImage) {
      return NextResponse.json(
        { error: "upgrade_required", reason: "OCR de imágenes requiere plan Starter o superior." },
        { status: 402 },
      );
    }

    if (plan.maxDocs !== Infinity) {
      const listRes = await fetch(`${FASTAPI}/documents`, {
        headers: { "x-user-id": userId },
      });
      if (listRes.ok) {
        const data = await listRes.json();
        const count: number = data?.documents?.length ?? 0;
        if (count >= plan.maxDocs) {
          return NextResponse.json(
            {
              error: "upgrade_required",
              reason: `El plan Free permite hasta ${plan.maxDocs} documentos. Actualiza para subir más.`,
            },
            { status: 402 },
          );
        }
      }
    }
  }

  const url = `${FASTAPI}/${pathStr}${req.nextUrl.search}`;

  const isGetOrHead = req.method === "GET" || req.method === "HEAD";
  const body = isGetOrHead ? undefined : await req.blob();

  const headers: Record<string, string> = {
    "x-user-id": userId,
  };
  const ct = req.headers.get("content-type");
  if (ct) headers["content-type"] = ct;

  const upstream = await fetch(url, { method: req.method, body, headers });

  const resHeaders: Record<string, string> = {
    "content-type": upstream.headers.get("content-type") ?? "application/json",
  };
  const cd = upstream.headers.get("content-disposition");
  if (cd) resHeaders["content-disposition"] = cd;

  return new NextResponse(upstream.body, {
    status: upstream.status,
    headers: resHeaders,
  });
}

export { handler as GET, handler as POST, handler as PUT, handler as PATCH, handler as DELETE };
