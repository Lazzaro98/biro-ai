import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: 180,
          height: 180,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          borderRadius: 38,
          background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
        }}
      >
        {/* Clipboard symbol */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            position: "relative",
          }}
        >
          {/* Clip top */}
          <div
            style={{
              width: 44,
              height: 20,
              borderRadius: 6,
              background: "#c4b5fd",
              marginBottom: -6,
              zIndex: 2,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <div
              style={{
                width: 10,
                height: 10,
                borderRadius: 5,
                background: "#6366f1",
              }}
            />
          </div>
          {/* Board */}
          <div
            style={{
              width: 84,
              height: 104,
              borderRadius: 10,
              background: "rgba(255,255,255,0.95)",
              display: "flex",
              flexDirection: "column",
              padding: "22px 14px 14px",
              gap: 8,
            }}
          >
            <div
              style={{
                width: "100%",
                height: 6,
                borderRadius: 3,
                background: "#e0e7ff",
              }}
            />
            <div
              style={{
                width: "75%",
                height: 6,
                borderRadius: 3,
                background: "#e0e7ff",
              }}
            />
            <div
              style={{
                width: "100%",
                height: 6,
                borderRadius: 3,
                background: "#e0e7ff",
              }}
            />
            <div
              style={{
                width: "60%",
                height: 6,
                borderRadius: 3,
                background: "#e0e7ff",
              }}
            />
          </div>
        </div>
      </div>
    ),
    { ...size },
  );
}
