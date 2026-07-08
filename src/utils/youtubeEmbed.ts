export type YouTubeEmbedType = "video" | "playlist" | "channelUploads";

export interface YouTubeEmbedResult {
  src: string | null;
  id: string;
  type: YouTubeEmbedType | "invalid";
  reason?: string;
}

interface YouTubeEmbedOptions {
  autoplay?: boolean;
  muted?: boolean;
  controls?: boolean;
  loop?: boolean;
}

const VIDEO_ID_PATTERN = /^[a-zA-Z0-9_-]{11}$/;
const CHANNEL_ID_PATTERN = /^UC[a-zA-Z0-9_-]{22}$/;
const PLAYLIST_ID_PATTERN = /^(PL|UU|LL|RD|OLAK5uy_)[a-zA-Z0-9_-]{10,}$/;

const buildQuery = (options: YouTubeEmbedOptions, id: string, type: YouTubeEmbedType) => {
  const params = new URLSearchParams({
    rel: "0",
    playsinline: "1",
  });

  if (options.autoplay) params.set("autoplay", "1");
  if (options.muted) params.set("mute", "1");
  if (options.controls === false) params.set("controls", "0");
  if (options.loop && type === "video") {
    params.set("loop", "1");
    params.set("playlist", id);
  }

  return params.toString();
};

const makeEmbed = (
  id: string,
  type: YouTubeEmbedType,
  options: YouTubeEmbedOptions
): YouTubeEmbedResult => {
  const query = buildQuery(options, id, type);
  const src =
    type === "video"
      ? `https://www.youtube-nocookie.com/embed/${id}?${query}`
      : `https://www.youtube-nocookie.com/embed/videoseries?list=${id}&${query}`;

  return { src, id, type };
};

const normalizeCandidate = (value?: string) => value?.trim() ?? "";

const extractFromUrl = (rawValue: string): YouTubeEmbedResult | null => {
  try {
    const url = new URL(rawValue);
    const host = url.hostname.replace(/^www\./, "");
    const pathParts = url.pathname.split("/").filter(Boolean);

    if (!host.includes("youtube.com") && host !== "youtu.be") return null;

    const playlistId = url.searchParams.get("list");
    const watchVideoId = url.searchParams.get("v");

    if (watchVideoId && VIDEO_ID_PATTERN.test(watchVideoId)) {
      return { src: null, id: watchVideoId, type: "video" };
    }

    if (host === "youtu.be" && pathParts[0] && VIDEO_ID_PATTERN.test(pathParts[0])) {
      return { src: null, id: pathParts[0], type: "video" };
    }

    if ((pathParts[0] === "shorts" || pathParts[0] === "embed") && VIDEO_ID_PATTERN.test(pathParts[1])) {
      return { src: null, id: pathParts[1], type: "video" };
    }

    if (playlistId && PLAYLIST_ID_PATTERN.test(playlistId)) {
      return { src: null, id: playlistId, type: "playlist" };
    }

    if (pathParts[0] === "channel" && CHANNEL_ID_PATTERN.test(pathParts[1])) {
      return { src: null, id: `UU${pathParts[1].slice(2)}`, type: "channelUploads" };
    }

    return {
      src: null,
      id: rawValue,
      type: "invalid",
      reason:
        "URL YouTube reconnue, mais elle ne contient ni ID video, ni playlist, ni channel ID exploitable.",
    };
  } catch {
    return null;
  }
};

const extractCandidate = (candidate: string): YouTubeEmbedResult | null => {
  if (!candidate) return null;

  const urlResult = extractFromUrl(candidate);
  if (urlResult) return urlResult;

  if (VIDEO_ID_PATTERN.test(candidate)) return { src: null, id: candidate, type: "video" };
  if (PLAYLIST_ID_PATTERN.test(candidate)) return { src: null, id: candidate, type: "playlist" };
  if (CHANNEL_ID_PATTERN.test(candidate)) {
    return { src: null, id: `UU${candidate.slice(2)}`, type: "channelUploads" };
  }

  return null;
};

export const resolveYouTubeEmbed = (
  values: Array<string | undefined>,
  options: YouTubeEmbedOptions = {}
): YouTubeEmbedResult => {
  const candidates = values.map(normalizeCandidate).filter(Boolean);
  let firstInvalidResult: YouTubeEmbedResult | null = null;

  for (const candidate of candidates) {
    const result = extractCandidate(candidate);
    if (!result) continue;

    if (result.type === "invalid") {
      firstInvalidResult ??= result;
      continue;
    }

    return makeEmbed(result.id, result.type, options);
  }

  if (firstInvalidResult) return firstInvalidResult;

  return {
    src: null,
    id: "",
    type: "invalid",
    reason:
      "Ajoute une URL video YouTube, un ID video de 11 caracteres, une playlist ou un channel ID commençant par UC.",
  };
};
