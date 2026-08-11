import releaseLedger from "@/production/metadata/video-release.json";
import type { ProductionStatus, VideoProvider } from "@/lib/types";

type ReleaseState =
  | "planned"
  | "captured"
  | "prepared"
  | "mastered"
  | "review"
  | "approved"
  | "published";

interface ReleaseRecord {
  id: string;
  state: ReleaseState;
  publication: {
    provider: string | null;
    assetId: string | null;
    playbackUrl: string | null;
  };
}
const records = new Map(
  (releaseLedger.videos as ReleaseRecord[]).map((video) => [video.id, video]),
);
const providers = new Set<VideoProvider>([
  "youtube",
  "vimeo",
  "mux",
  "local",
  "external",
]);

const productionStatus = (state: ReleaseState): ProductionStatus => {
  if (state === "published") return "published";
  if (state === "planned") return "planned";
  return "recorded";
};

export function getVideoRelease(id: string): {
  status: ProductionStatus;
  provider: VideoProvider;
  videoId: string | null;
  url?: string;
} {
  const record = records.get(id);
  if (!record) {
    return { status: "planned", provider: "external", videoId: null };
  }
  const provider = providers.has(record.publication.provider as VideoProvider)
    ? (record.publication.provider as VideoProvider)
    : "external";
  return {
    status: productionStatus(record.state),
    provider,
    videoId: record.publication.assetId,
    url: record.publication.playbackUrl ?? undefined,
  };
}
