import { prisma } from "../../../../lib/prisma";

async function lookupItunes(id, type) {
  const res = await fetch(`https://itunes.apple.com/lookup?id=${encodeURIComponent(id)}`, {
    next: { revalidate: 300 }
  });
  const data = await res.json();
  const item = data.results?.[0];
  if (!item) return null;

  return {
    title: type === "artist" ? item.artistName : type === "album" ? item.collectionName : item.trackName,
    artist: item.artistName,
    artworkUrl: item.artworkUrl100 ? item.artworkUrl100.replace("100x100", "300x300") : null,
    previewUrl: item.previewUrl || null,
    externalUrl: item.trackViewUrl || item.collectionViewUrl || item.artistLinkUrl || null
  };
}

async function loadPlaylist(slug) {
  const playlist = await prisma.playlist.findUnique({
    where: { shareSlug: slug },
    include: { tracks: { orderBy: { addedAt: "asc" } }, owner: { select: { name: true } } }
  });
  if (!playlist || !playlist.isPublic) return null;
  return playlist;
}

export default async function SharePage({ params }) {
  const { type, id } = params;

  if (type === "playlist") {
    const playlist = await loadPlaylist(id);
    if (!playlist) {
      return (
        <div className="share-page">
          <h2>Playlist not found</h2>
          <p style={{ color: "var(--text-dim)" }}>This playlist is private or has been deleted.</p>
        </div>
      );
    }
    return (
      <div className="share-page">
        <div className="share-header">
          <div className="share-cover">{playlist.name.slice(0, 2).toUpperCase()}</div>
          <div>
            <h2 style={{ margin: 0 }}>{playlist.name}</h2>
            <p style={{ color: "var(--text-dim)", margin: "4px 0 0" }}>
              Created by {playlist.owner?.name || "someone"} · {playlist.tracks.length} tracks
            </p>
          </div>
        </div>
        <div className="list" style={{ marginTop: 8 }}>
          {playlist.tracks.map((t) => (
            <div className="row" key={t.id} style={{ cursor: "default" }}>
              {t.artworkUrl ? (
                <img className="row-avatar" src={t.artworkUrl} alt="" />
              ) : (
                <div className="row-avatar">{t.title.slice(0, 2).toUpperCase()}</div>
              )}
              <div className="row-body">
                <div className="row-title-line">
                  <span className="row-title">{t.title}</span>
                </div>
                <div className="row-sub-line">
                  <span className="row-subtitle">{t.artist}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
        <p style={{ color: "var(--text-dim)", fontSize: 13, marginTop: 24 }}>
          Shared via XamusiceL — open the app to search & save your own music.
        </p>
      </div>
    );
  }

  const item = await lookupItunes(id, type);
  if (!item) {
    return (
      <div className="share-page">
        <h2>Not found</h2>
      </div>
    );
  }

  return (
    <div className="share-page">
      <div className="share-header">
        {item.artworkUrl ? (
          <img className="share-cover" src={item.artworkUrl} alt="" />
        ) : (
          <div className="share-cover" />
        )}
        <div>
          <h2 style={{ margin: 0 }}>{item.title}</h2>
          <p style={{ color: "var(--text-dim)", margin: "4px 0 0" }}>{item.artist}</p>
        </div>
      </div>

      {item.previewUrl && (
        <audio controls style={{ width: "100%", marginTop: 12 }} src={item.previewUrl}>
          Preview is not supported on this device.
        </audio>
      )}

      <p style={{ color: "var(--text-dim)", fontSize: 13, marginTop: 24 }}>
        Shared via XamusiceL — open the app to search & save your own music.
      </p>
    </div>
  );
}
