import { PageHeader } from "@/components/admin/ui";
import { VideoManager } from "@/components/admin/VideoManager";
import { getVideoAdmin } from "@/lib/admin/queries";
import { requireRole } from "@/lib/auth";
import { MAX_VIDEO_MB } from "@/lib/env";

export const metadata = { title: "Video projection" };

export default async function VideosPage() {
  await requireRole("videos");
  const { rows, settings, canRevert } = await getVideoAdmin();
  return (
    <>
      <PageHeader
        title="Video projection"
        description="Control the video on the home page hero and the “Now Showing” section. Upload, schedule, rotate and preview — changes go live instantly."
      />
      <VideoManager rows={rows} settings={settings} canRevert={canRevert} maxMb={MAX_VIDEO_MB} />
    </>
  );
}
