import { getOpenGraphBase } from "@/og/get-og-base";

export const alt = "Markdown to HTML Converter - Tools Melvynx";
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

export default async function OgImage() {
  return getOpenGraphBase({
    size,
    children: (
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <p
          style={{
            fontFamily: "system-ui, sans-serif",
            fontSize: "80px",
            margin: 0,
            fontWeight: "bold",
          }}
        >
          Markdown to HTML
        </p>
        <p style={{ fontSize: "32px", margin: 0, color: "#666" }}>
          Convert markdown to HTML with ease
        </p>
      </div>
    ),
  });
}
