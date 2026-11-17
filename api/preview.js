/* Find an optional Apple Music preview when Spotify has none. */
"use strict";

function normalizedName(value) {
  return String(value || "").normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .toLowerCase().replace(/\([^)]*\)|\[[^\]]*\]/g, " ").replace(/\b(feat|ft)\.?\b.*$/g, "")
    .replace(/[^a-z0-9]+/g, " ").trim();
}

function send(res, status, body) {
  res.setHeader("Cache-Control", "no-store");
  return res.status(status).json(body);
}

module.exports = async (req, res) => {
  if (req.method !== "GET") return send(res, 405, { error: "Method not allowed" });
  const url = new URL(req.url, "http://localhost");
  const track = (url.searchParams.get("track") || "").slice(0, 160);
  const artist = (url.searchParams.get("artist") || "").slice(0, 160);
  const album = (url.searchParams.get("album") || "").slice(0, 160);
  if (!track || !artist) return send(res, 400, { error: "Track and artist are required" });

  try {
    const query = new URLSearchParams({ country: "IN", entity: "song", limit: "10", term: `${track} ${artist}` });
    const response = await fetch(`https://itunes.apple.com/search?${query}`, { signal: AbortSignal.timeout(3000) });
    if (!response.ok) return send(res, 200, { previewUrl: "" });
    const data = await response.json();
    const wantedTrack = normalizedName(track), wantedArtist = normalizedName(artist.split(",")[0]);
    const matches = (Array.isArray(data.results) ? data.results : []).filter((item) =>
      normalizedName(item.trackName) === wantedTrack && normalizedName(item.artistName) === wantedArtist &&
      typeof item.previewUrl === "string" && typeof item.trackViewUrl === "string");
    const wantedAlbum = normalizedName(album);
    const match = matches.find((item) => wantedAlbum && normalizedName(item.collectionName).includes(wantedAlbum)) || matches[0];
    if (!match) return send(res, 200, { previewUrl: "" });
    const preview = new URL(match.previewUrl), store = new URL(match.trackViewUrl);
    if (preview.protocol !== "https:" || !preview.hostname.endsWith(".itunes.apple.com") ||
        store.protocol !== "https:" || store.hostname !== "music.apple.com") return send(res, 200, { previewUrl: "" });
    return send(res, 200, { previewUrl: preview.href, previewProvider: "Apple Music", previewStoreUrl: store.href });
  } catch {
    return send(res, 200, { previewUrl: "" });
  }
};

module.exports._test = { normalizedName };
