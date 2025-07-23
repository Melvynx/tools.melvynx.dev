import { getOpenGraphBase } from "@/og/get-og-base";

export const alt = "Codeline";
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

export default async function OgImage() {
  return getOpenGraphBase({
    size,
    children: (
      <div tw="flex flex-col gap-4">
        <p
          style={{
            fontFamily: "Space Grotesk",
          }}
          tw="text-6xl m-0 mt-0"
        >
          JSON Formatter
        </p>
        <p className="text-xl">
          Format and validate JSON with ease. Configure your options and see the
          result in live.
        </p>
      </div>
    ),
  });
}
