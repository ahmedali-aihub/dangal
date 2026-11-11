import { PageHeader } from "@/components/admin/ui";
import { VideoManager } from "@/components/admin/VideoManager";
import { getHeroVideoRow } from "@/lib/admin/queries";
import { requireRole } from "@/lib/auth";
import { MAX_VIDEO_MB } from "@/lib/env";

export const metadata = { title: "Home video" };

export default async function VideosPage() {
  const [, current] = await Promise.all([requireRole("videos"), getHeroVideoRow()]);
  return (
    <>
      <PageHeader title="Home video" description="The one video on your website — it plays at the top of the home page. Upload a new one any time." />
      <VideoManager current={current} maxMb={MAX_VIDEO_MB} />
    </>
  );
}
