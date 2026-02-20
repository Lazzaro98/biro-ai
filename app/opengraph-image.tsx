import { ImageResponse } from "next/og";

export const alt = "Biro AI — Vodič kroz papirologiju u Srbiji";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OGImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #1e1b4b 0%, #312e81 40%, #4338ca 100%)",
          fontFamily: "sans-serif",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Decorative circles */}
        <div
          style={{
            position: "absolute",
            top: -120,
            right: -120,
            width: 500,
            height: 500,
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(139,92,246,0.3), transparent 70%)",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: -150,
            left: -100,
            width: 600,
            height: 600,
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(99,102,241,0.25), transparent 70%)",
          }}
        />

        {/* Clipboard icon */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            marginBottom: 24,
          }}
        >
          <div
            style={{
              width: 80,
              height: 80,
              borderRadius: 18,
              background: "rgba(255,255,255,0.1)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 44,
            }}
          >
            📋
          </div>
        </div>

        {/* Title */}
        <div
          style={{
            display: "flex",
            alignItems: "baseline",
            gap: 16,
            marginBottom: 16,
          }}
        >
          <span
            style={{
              fontSize: 72,
              fontWeight: 800,
              background: "linear-gradient(135deg, #a78bfa, #c4b5fd)",
              backgroundClip: "text",
              color: "transparent",
            }}
          >
            Biro
          </span>
          <span
            style={{
              fontSize: 72,
              fontWeight: 800,
              color: "white",
            }}
          >
            AI
          </span>
        </div>

        {/* Subtitle */}
        <p
          style={{
            fontSize: 28,
            color: "rgba(255,255,255,0.7)",
            margin: 0,
            maxWidth: 600,
            textAlign: "center",
            lineHeight: 1.4,
          }}
        >
          Vodič kroz papirologiju u Srbiji.
          <br />
          AI te vodi korak po korak.
        </p>

        {/* Bottom tags */}
        <div
          style={{
            display: "flex",
            gap: 12,
            marginTop: 40,
          }}
        >
          {["Otvaranje firme", "Checkliste", "Personalizovano"].map(
            (tag) => (
              <div
                key={tag}
                style={{
                  padding: "8px 20px",
                  borderRadius: 24,
                  background: "rgba(255,255,255,0.1)",
                  border: "1px solid rgba(255,255,255,0.15)",
                  color: "rgba(255,255,255,0.8)",
                  fontSize: 18,
                }}
              >
                {tag}
              </div>
            ),
          )}
        </div>
      </div>
    ),
    { ...size },
  );
}
