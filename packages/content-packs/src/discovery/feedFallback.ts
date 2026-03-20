import type { DiscoveryFeedItemPayload, DiscoveryFeedLocale, DiscoveryFeedPagePayload } from "@nametests/backend-contracts";
import { copyByLocale } from "../copy";
import { homeFeedCards } from "./homeFeed";

const PAGE_SIZE = 8;
const TOTAL_CYCLES = 5;

const socialProofByLocale: Record<DiscoveryFeedLocale, string[]> = {
  en: ["Hot right now", "Popular tonight", "Played all day", "Trending in the feed", "Freshly surfaced"],
  fr: ["Hot en ce moment", "Populaire ce soir", "Joue toute la journee", "Tendance dans le feed", "Remonte a l'instant"],
  es: ["Hot ahora", "Popular esta noche", "Jugado todo el dia", "En tendencia en el feed", "Recien subido"],
  de: ["Gerade hot", "Heute Abend beliebt", "Den ganzen Tag gespielt", "Im Feed im Trend", "Frisch nach oben"],
  ar: ["رائج الان", "شائع هذا المساء", "تم لعبه طوال اليوم", "يتصدر الموجز", "عاد للواجهة الان"],
  pt: ["Em alta agora", "Popular esta noite", "Jogado o dia todo", "Em tendencia no feed", "Recem destacado"]
};

const teaserPrefixes: Record<DiscoveryFeedLocale, string[]> = {
  en: ["Popular now", "Fresh pick", "Replay magnet", "Late-night favorite", "Crowd favorite"],
  fr: ["Populaire maintenant", "Choix du moment", "Aimant a replays", "Favori du soir", "Chouchou du public"],
  es: ["Popular ahora", "Eleccion fresca", "Iman de replay", "Favorito nocturno", "Favorito del publico"],
  de: ["Jetzt beliebt", "Frischer Pick", "Replay-Magnet", "Nachtlicher Favorit", "Publikumsliebling"],
  ar: ["شائع الان", "اختيار جديد", "مغناطيس اعادة اللعب", "مفضل الليل", "مفضل الجمهور"],
  pt: ["Popular agora", "Escolha fresca", "Ima de replay", "Favorito da noite", "Favorito do publico"]
};

function buildFallbackItems(locale: DiscoveryFeedLocale): DiscoveryFeedItemPayload[] {
  const copy = copyByLocale[locale];

  return Array.from({ length: TOTAL_CYCLES }, (_, cycleIndex) =>
    homeFeedCards.map((card, cardIndex) => ({
      id: `${card.id}-cycle-${cycleIndex + 1}`,
      testId: card.testId,
      imageKey: card.testId,
      hot: card.hot && cycleIndex < 2,
      tag: card.tag[locale],
      title: card.title[locale],
      teaser: `${teaserPrefixes[locale][cycleIndex % teaserPrefixes[locale].length]} • ${copy[findSubtitleKey(card.testId)] ?? ""}`,
      socialProof: socialProofByLocale[locale][(cycleIndex + cardIndex) % socialProofByLocale[locale].length],
      palette: card.palette
    }))
  ).flat();
}

function findSubtitleKey(testId: string): string {
  switch (testId) {
    case "love-match":
      return "test.loveMatch.subtitle";
    case "wedding-bells":
      return "test.wedding.subtitle";
    case "friendship-score":
      return "test.friendship.subtitle";
    case "secret-crush":
      return "test.crush.subtitle";
    case "future-career":
      return "test.future.subtitle";
    case "drama-meter":
      return "test.drama.subtitle";
    case "star-aura":
      return "test.aura.subtitle";
    case "fame-level":
      return "test.fame.subtitle";
    case "destiny-headline":
      return "test.destinyHeadline.subtitle";
    case "past-life-echo":
      return "test.pastLife.subtitle";
    case "hidden-gift":
      return "test.hiddenGift.subtitle";
    case "aura-palette":
      return "test.auraPalette.subtitle";
    case "group-chat-role":
      return "test.groupChatRole.subtitle";
    case "soul-story":
      return "test.soulStory.subtitle";
    case "photo-archetype":
      return "test.photoArchetype.subtitle";
    case "movie-poster":
      return "test.moviePoster.subtitle";
    default:
      return "";
  }
}

export function getFallbackDiscoveryFeedPage(locale: DiscoveryFeedLocale, cursor?: string): DiscoveryFeedPagePayload {
  const allItems = buildFallbackItems(locale);
  const offset = Number.parseInt(cursor ?? "0", 10);
  const start = Number.isFinite(offset) && offset >= 0 ? offset : 0;
  const items = allItems.slice(start, start + PAGE_SIZE);
  const nextCursor = start + PAGE_SIZE < allItems.length ? String(start + PAGE_SIZE) : undefined;

  return {
    locale,
    items,
    nextCursor,
    generatedAt: new Date().toISOString()
  };
}
