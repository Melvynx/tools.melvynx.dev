import { ImageResponse } from "next/og";
import type { PropsWithChildren } from "react";

export const getOpenGraphBase = async (
  props: PropsWithChildren<{
    size: {
      width: number;
      height: number;
    };
  }>
) => {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          position: "relative",
          gap: 16,
          fontFamily: "system-ui, sans-serif",
          color: "black",
          backgroundColor: "white",
          opacity: "1",
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "flex-start",
            alignItems: "flex-start",
            height: "100%",
            flex: 1,
            padding: "96px 64px",
            gap: 16,
          }}
        >
          <p
            style={{
              fontFamily: "system-ui, sans-serif",
              fontSize: "48px",
              fontWeight: "bold",
              margin: 0,
            }}
          >
            tools.melvynx.dev
          </p>

          {props.children}
        </div>
      </div>
    ),
    {
      ...props.size,
    }
  );
};
