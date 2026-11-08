import { PageTransition } from "@/components/layout/PageTransition";

// A template re-mounts on every navigation, which is what drives the page transition.
export default function SiteTemplate({ children }: { children: React.ReactNode }) {
  return <PageTransition>{children}</PageTransition>;
}
