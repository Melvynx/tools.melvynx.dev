import { ImageResponse } from "next/og";
import type { PropsWithChildren } from "react";
import { getOgImageFont } from "./get-og-fonts";

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
          fontFamily: "Geist",

          color: "black",
          backgroundColor: "white",
          opacity: "1",
        }}
      >
        <div
          tw="flex flex-col justify-start items-start h-full flex-1 px-16 py-24"
          style={{ gap: 16 }}
        >
          <p
            style={{
              fontFamily: "Space Grotesk",
            }}
            tw="text-3xl font-bold m-0"
          >
            tools.melvynx.dev
          </p>

          {props.children}
        </div>
      </div>
    ),
    {
      // For convenience, we can re-use the exported opengraph-image
      // size config to also set the ImageResponse's width and height.
      ...props.size,
      fonts: await getOgImageFont(),
    }
  );
};
