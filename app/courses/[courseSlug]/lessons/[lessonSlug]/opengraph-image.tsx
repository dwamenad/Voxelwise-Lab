import { ImageResponse } from "next/og";
import { getLesson } from "@/lib/content/catalog";

export const runtime = "nodejs";
export const alt = "Voxelwise Lab Lesson";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image({
  params,
}: {
  params: Promise<{ courseSlug: string; lessonSlug: string }>;
}) {
  const { courseSlug, lessonSlug } = await params;
  const result = getLesson(courseSlug, lessonSlug);

  const courseTitle = result?.course.title || "FSL Neuroimaging";
  const catalogNum = result?.course.catalogNumber || "FSL";
  const lessonTitle = result?.lesson.title || "Neuroimaging Lesson";
  const lessonNumber = result?.lesson.number || "1.1";
  const duration = result?.lesson.durationMinutes ? `${result.lesson.durationMinutes} min` : "15 min";

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "60px 70px",
          backgroundColor: "#0d0f12",
          color: "#f4f4f5",
          fontFamily: "system-ui, -apple-system, sans-serif",
        }}
      >
        {/* Top Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
            <div
              style={{
                width: "44px",
                height: "44px",
                backgroundColor: "#d4f24c",
                borderRadius: "10px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#0d0f12",
                fontWeight: 900,
                fontSize: "22px",
              }}
            >
              V
            </div>
            <span style={{ fontSize: "28px", fontWeight: 800, letterSpacing: "-0.5px" }}>
              Voxelwise Lab
            </span>
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
              backgroundColor: "rgba(255, 255, 255, 0.08)",
              padding: "8px 20px",
              borderRadius: "999px",
              fontSize: "18px",
              fontWeight: 600,
              color: "#a1a1aa",
            }}
          >
            <span>{catalogNum}</span>
            <span>·</span>
            <span>Lesson {lessonNumber}</span>
          </div>
        </div>

        {/* Center Content */}
        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          <span
            style={{
              fontSize: "22px",
              fontWeight: 700,
              color: "#d4f24c",
              textTransform: "uppercase",
              letterSpacing: "1px",
            }}
          >
            {courseTitle}
          </span>
          <h1
            style={{
              fontSize: "56px",
              fontWeight: 800,
              lineHeight: 1.15,
              letterSpacing: "-1px",
              margin: 0,
              color: "#ffffff",
              maxWidth: "1050px",
            }}
          >
            {lessonTitle}
          </h1>
        </div>

        {/* Bottom Bar */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            borderTop: "1px solid rgba(255, 255, 255, 0.12)",
            paddingTop: "30px",
          }}
        >
          <div style={{ display: "flex", gap: "24px", color: "#a1a1aa", fontSize: "20px" }}>
            <span>Neurodesk & FSL Hands-on Lab</span>
            <span>·</span>
            <span>{duration}</span>
          </div>
          <div
            style={{
              fontSize: "18px",
              fontWeight: 600,
              color: "#d4f24c",
            }}
          >
            Free & Open Education
          </div>
        </div>
      </div>
    ),
    { ...size }
  );
}
