import { ImageResponse } from "next/og";

export const runtime = "edge";

export const alt = "Next.js Favicon Generator - Tools Melvynx";
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
          {/* Next.js Logo Visual */}
          <div
            style={{
              width: 120,
              height: 120,
              backgroundColor: "#000",
              borderRadius: 16,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              marginRight: 30,
              color: "white",
              fontSize: 24,
              fontWeight: "bold",
            }}
          >
            Next.js
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
          
          {/* Favicon Icons */}
          <div
            style={{
              display: "flex",
              gap: 15,
              alignItems: "center",
            }}
          >
            {/* icon.png */}
            <div
              style={{
                width: 64,
                height: 64,
                backgroundColor: "#3b82f6",
                borderRadius: 8,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 12,
                color: "white",
                fontWeight: "bold",
              }}
            >
              512
            </div>
            
            {/* favicon.ico */}
            <div
              style={{
                width: 32,
                height: 32,
                backgroundColor: "#10b981",
                borderRadius: 4,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 10,
                color: "white",
                fontWeight: "bold",
              }}
            >
              48
            </div>
            
            {/* apple-icon.png */}
            <div
              style={{
                width: 48,
                height: 48,
                backgroundColor: "#f59e0b",
                borderRadius: 6,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 11,
                color: "white",
                fontWeight: "bold",
              }}
            >
              180
            </div>
          </div>
        </div>
        
        <div
          style={{
            color: "#1f2937",
            marginBottom: 20,
            textAlign: "center",
          }}
        >
          Next.js Favicon Generator
        </div>
        
        <div
          style={{
            color: "#6b7280",
            fontSize: 24,
            textAlign: "center",
            maxWidth: 600,
          }}
        >
          Generate icon.png, favicon.ico, and apple-icon.png for your Next.js app
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}