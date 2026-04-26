import { ImageResponse } from "next/og";

export const runtime = "edge";

export function GET() {
  const size = 192;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #4F46E5, #10B981)",
          color: "white",
          fontSize: 72,
          fontWeight: 800,
          letterSpacing: -2,
        }}
      >
        EJ
      </div>
    ),
    {
      width: size,
      height: size,
    }
  );
}

