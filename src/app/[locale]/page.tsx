import { useTranslations } from "next-intl";
import { setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";

export default function LandingPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  return <LandingContent params={params} />;
}

async function LandingContent({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  return <Landing />;
}

function Landing() {
  const t = useTranslations();

  return (
    <div className="flex flex-1 flex-col items-center justify-center px-6">
      <div className="max-w-md text-center space-y-6">
        <h1 className="text-4xl font-bold tracking-tight">
          {t("landing.hero")}
        </h1>
        <p className="text-lg text-muted-foreground">{t("landing.subtitle")}</p>
        <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Link
            href="/register"
            className="inline-flex h-11 items-center justify-center rounded-md bg-primary px-6 text-primary-foreground font-semibold transition-colors hover:bg-primary/90"
          >
            {t("landing.cta")}
          </Link>
          <Link
            href="/login"
            className="inline-flex h-11 items-center justify-center rounded-md border border-input px-6 font-semibold transition-colors hover:bg-accent"
          >
            {t("auth.login")}
          </Link>
        </div>
      </div>
    </div>
  );
}
