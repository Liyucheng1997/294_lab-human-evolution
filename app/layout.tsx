import type { Metadata } from "next";
import { headers } from "next/headers";
import "./globals.css";

export async function generateMetadata(): Promise<Metadata> {
  const headerList = await headers();
  const host = headerList.get("x-forwarded-host") ?? headerList.get("host") ?? "localhost:3000";
  const protocol = headerList.get("x-forwarded-proto") ?? (host.startsWith("localhost") ? "http" : "https");
  const image = `${protocol}://${host}/og.png`;
  const title = "生命长河｜从细胞到人类";
  const description = "以现代演化生物学为依据，穿越 38 亿年地球生命史。";
  return {
    title,
    description,
    openGraph: { title, description, type: "website", locale: "zh_CN", images: [{ url: image, width: 1672, height: 941, alt: "生命长河：从细胞到人类的分支演化" }] },
    twitter: { card: "summary_large_image", title, description, images: [image] },
  };
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="zh-CN"><body>{children}</body></html>;
}
