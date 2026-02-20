import { ImageResponse } from "next/og";

export const runtime = "edge";

export const alt = "Timezone Checker";
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
            gap: 20,
          }}
        >
          {["SF", "Bali", "Geneva"].map((city, i) => (
            <div
              key={city}
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 8,
              }}
            >
              <div
                style={{
                  fontSize: 18,
                  color: "#6b7280",
                  fontWeight: 500,
                }}
              >
                {city}
              </div>
              <div
                style={{
                  display: "flex",
                  gap: 3,
                }}
              >
                {Array.from({ length: 6 }, (_, j) => (
                  <div
                    key={j}
                    style={{
                      width: 28,
                      height: 28,
                      borderRadius: 4,
                      backgroundColor:
                        j >= 2 && j <= 4
                          ? "rgba(16, 185, 129, 0.25)"
                          : i === 0 && j < 2
                            ? "#e2e8f0"
                            : "#f1f5f9",
                      border:
                        j >= 2 && j <= 4
                          ? "1px solid rgba(16, 185, 129, 0.4)"
                          : "1px solid #e2e8f0",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 10,
                      color: j >= 2 && j <= 4 ? "#059669" : "#94a3b8",
                    }}
                  >
                    {(j + 7 + i * 8) % 24}h
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div
          style={{
            color: "#1f2937",
            marginBottom: 20,
            textAlign: "center",
          }}
        >
          Timezone Checker
        </div>

        <div
          style={{
            color: "#6b7280",
            fontSize: 24,
            textAlign: "center",
            maxWidth: 600,
          }}
        >
          Compare timezones and find overlapping awake hours
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
