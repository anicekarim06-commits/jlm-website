import type { AppLocale } from "@/lib/content/locale";

/**
 * Strings for the two route boundaries, loading.tsx and not-found.tsx.
 *
 * These must be client components (rendered on the server, they ran outside
 * setRequestLocale and forced every page to be dynamic), and using
 * useTranslations in a client component ships next-intl's formatter and all
 * messages to every page. So the few strings they need are mirrored here.
 *
 * Source of truth is still src/messages/*.json: tests/unit/boundary-labels
 * fails if these drift from `common.loading` and the `notFound` namespace.
 */
export type BoundaryLabels = {
  loading: string;
  notFound: {
    title: string;
    body: string;
    backHome: string;
    seeProjects: string;
  };
};

export const boundaryLabels: Record<AppLocale, BoundaryLabels> = {
  fr: {
    loading: "Chargement...",
    notFound: {
      title: "Cette page est introuvable",
      body: "Le lien est peut-être incorrect ou la page a été déplacée. Retrouvez nos projets et nos actions depuis l'accueil.",
      backHome: "Retour à l'accueil",
      seeProjects: "Voir nos projets",
    },
  },
  ar: {
    loading: "جاري التحميل...",
    notFound: {
      title: "تعذّر العثور على هذه الصفحة",
      body: "قد يكون الرابط غير صحيح أو أن الصفحة قد نُقلت. يمكنك الوصول إلى مشاريعنا وأعمالنا من الصفحة الرئيسية.",
      backHome: "العودة إلى الرئيسية",
      seeProjects: "اطّلع على مشاريعنا",
    },
  },
  en: {
    loading: "Loading...",
    notFound: {
      title: "This page can't be found",
      body: "The link may be wrong or the page may have moved. You can find our projects and actions from the home page.",
      backHome: "Back to home",
      seeProjects: "See our projects",
    },
  },
};
