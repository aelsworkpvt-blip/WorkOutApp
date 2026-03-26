import { NextResponse } from "next/server";
import {
  getAndroidPackageName,
  getAndroidSha256Fingerprints,
} from "@/lib/env";

export const dynamic = "force-dynamic";

export function GET() {
  const packageName = getAndroidPackageName();
  const fingerprints = getAndroidSha256Fingerprints();

  const body =
    packageName && fingerprints.length > 0
      ? [
          {
            relation: ["delegate_permission/common.handle_all_urls"],
            target: {
              namespace: "android_app",
              package_name: packageName,
              sha256_cert_fingerprints: fingerprints,
            },
          },
        ]
      : [];

  return NextResponse.json(body, {
    headers: {
      "Cache-Control": "public, max-age=300",
      "X-Assetlinks-Status":
        body.length > 0 ? "configured" : "unconfigured",
    },
  });
}
