import Link from "next/link";
import { AsterMark } from "@/components/layout/logo";
import { ButtonLink } from "@/components/ui/button";

export default function NotFound() {
  return (
    <main id="main" className="page-container flex min-h-dvh flex-col items-center justify-center py-24 text-center">
      <AsterMark className="size-12" />
      <p className="eyebrow mt-8">404</p>
      <h1 className="mt-3 text-4xl font-semibold tracking-[-0.03em]">
        This path doesn&rsquo;t lead anywhere — <span className="display-italic text-primary">yet.</span>
      </h1>
      <p className="mt-4 max-w-md text-muted">The page you&rsquo;re looking for doesn&rsquo;t exist or has moved.</p>
      <div className="mt-8 flex gap-3">
        <ButtonLink href="/">Back to home</ButtonLink>
        <Link href="/contact" className="inline-flex h-11 items-center px-4 font-medium text-primary hover:text-primary-deep">Contact us</Link>
      </div>
    </main>
  );
}
