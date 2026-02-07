import { useState, useEffect } from 'react';

export interface YouTubeVideo {
    title: string;
    link: string;
    thumbnail: string;
    pubDate: Date;
    channel: string;
}

interface RSSFeed {
    status: string;
    feed: {
        url: string;
        title: string;
        link: string;
        author: string;
        description: string;
        image: string;
    };
    items: {
        title: string;
        link: string;
        pubDate: string;
        thumbnail?: string;
    }[];
    channelName?: string;
}

export const useYouTube = () => {
    const [latestVideo, setLatestVideo] = useState<YouTubeVideo | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    useEffect(() => {
        const fetchVideos = async () => {
            try {
                const channels = [
                    { id: 'UCF7k4rUFrDUGwZlb-Z8lMtA', name: 'Generación Privilegiada' }, // Generación Privilegiada
                    { id: 'UCVmFtZ41cAJJTP4X9bCMzoQ', name: 'Monte de Sión' }  // Monte de Sión
                ];

                const promises = channels.map(ch =>
                    fetch(`https://api.rss2json.com/v1/api.json?rss_url=https://www.youtube.com/feeds/videos.xml?channel_id=${ch.id}`)
                        .then(res => res.json())
                        .then((data: RSSFeed) => ({ ...data, channelName: ch.name }))
                        .catch(err => null)
                );

                const results = await Promise.all(promises);
                let allVideos: YouTubeVideo[] = [];

                results.forEach(feed => {
                    if (feed && feed.items) {
                        feed.items.forEach((item) => {
                            const videoId = item.link.split('v=')[1]?.split('&')[0];
                            if (videoId) {
                                allVideos.push({
                                    title: item.title,
                                    link: item.link,
                                    pubDate: new Date(item.pubDate),
                                    thumbnail: `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`,
                                    channel: feed.channelName || 'YouTube'
                                });
                            }
                        });
                    }
                });

                // Sort by date descending
                allVideos.sort((a, b) => b.pubDate.getTime() - a.pubDate.getTime());

                if (allVideos.length > 0) {
                    setLatestVideo(allVideos[0]);
                }
            } catch (e) {
                console.error("Error fetching YT videos", e);
                setError(e as Error);
            } finally {
                setLoading(false);
            }
        };

        fetchVideos();
    }, []);

    return { latestVideo, loading, error };
};
