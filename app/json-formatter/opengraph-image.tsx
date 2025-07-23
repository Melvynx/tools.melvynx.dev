import { getOpenGraphBase } from "@/og/get-og-base";

export const alt = "JSON Formatter - Tools Melvynx";
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
            fontSize: "96px",
            margin: 0,
            fontWeight: "bold",
          }}
        >
          JSON Formatter
        </p>
        <p style={{ fontSize: "32px", margin: 0, color: "#666" }}>
          Format and validate JSON with ease
        </p>
      </div>
    ),
  });
}
