import { ImageResponse } from "next/og";

export const runtime = "edge";

export const alt = "Chrome Extensions Icon Generator";
export const size = {
  width: 1200,
  height: 630,
};

export const contentType = "image/png";

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#f8fafc",
          fontSize: 32,
          fontWeight: 600,
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            marginBottom: 40,
          }}
        >
          {/* Chrome Extension Icon Visual */}
          <div
            style={{
              width: 120,
              height: 120,
              backgroundColor: "#3b82f6",
              borderRadius: 16,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              marginRight: 30,
            }}
          >
            <div
              style={{
                width: 80,
                height: 80,
                backgroundColor: "white",
                borderRadius: 8,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 40,
              }}
            >
              🔧
            </div>
          </div>
          
          {/* Arrow */}
          <div
            style={{
              fontSize: 60,
              color: "#6b7280",
              marginRight: 30,
            }}
          >
            →
          </div>
          
          {/* Multiple Icons */}
          <div
            style={{
              display: "flex",
              gap: 10,
              flexWrap: "wrap",
              maxWidth: 200,
            }}
          >
            {[16, 32, 48, 64, 128, 256].map((size) => (
              <div
                key={size}
                style={{
                  width: size > 64 ? 32 : size / 2,
                  height: size > 64 ? 32 : size / 2,
                  backgroundColor: "#3b82f6",
                  borderRadius: 4,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: size > 64 ? 12 : size / 4,
                  color: "white",
                }}
              >
                {size}
              </div>
            ))}
          </div>
        </div>
        
        <div
          style={{
            color: "#1f2937",
            marginBottom: 20,
            textAlign: "center",
          }}
        >
          Chrome Extensions Icon Generator
        </div>
        
        <div
          style={{
            color: "#6b7280",
            fontSize: 24,
            textAlign: "center",
            maxWidth: 600,
          }}
        >
          Generate all required icon sizes for Chrome extensions from a single image
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}