import { ImageResponse } from "next/server";

export const size = {
  width: 64,
  height: 64,
};

export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          width: "100%",
          height: "100%",
          background: "linear-gradient(135deg, #0f172a 0%, #1e293b 60%, #036672 100%)",
          color: "#f1f5f9",
          fontSize: 28,
          fontWeight: 700,
          letterSpacing: 2,
          borderRadius: "32%",
          textTransform: "uppercase",
        }}
      >
        PM
      </div>
    ),
    {
      ...size,
    }
  );
}
