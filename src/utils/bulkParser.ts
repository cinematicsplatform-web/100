import type { Episode, Server } from '../types';

export interface ParsedEpisodePayload {
  episodeNum: number;
  episodePayload: Episode;
}

/**
 * Parses raw links (e.g. Telegram or other direct streaming URLs) from a text area,
 * splits them line-by-line, trims, and maps them to structural Episode objects.
 * 
 * @param rawText Multi-line string of URLs
 * @param startEpisodeNum Starting episode number (e.g., 1)
 * @param seasonVirtualPath Parent season path, e.g., "series/Turky/AR-Dub/Aziz/S1"
 */
export function parseBulkLinks(
  rawText: string,
  startEpisodeNum: number,
  seasonVirtualPath: string
): ParsedEpisodePayload[] {
  const lines = rawText.split('\n').map((line) => line.trim()).filter(Boolean);
  const parsed: ParsedEpisodePayload[] = [];

  lines.forEach((url, index) => {
    const episodeNum = startEpisodeNum + index;
    const paddedNum = episodeNum < 10 ? `0${episodeNum}` : `${episodeNum}`;
    
    // Setup a default high-quality server structure for the parsed video link
    const defaultServer: Server = {
      id: Date.now() + index, // Ensure unique ID
      name: 'سيرفر إضافي (تليجرام)',
      url: url,
      downloadUrl: url,
      isActive: true
    };

    const episodePayload: Episode = {
      id: episodeNum,
      title: `الحلقة ${episodeNum}`,
      description: `حلقة رقم ${episodeNum} تم استيرادها عبر مدير الملفات الذكي`,
      progress: 0,
      servers: [defaultServer],
      virtual_path: `${seasonVirtualPath}/E${paddedNum}`,
      isScheduled: false,
      notifyOnPublish: false,
      telegramOriginalUrl: url
    };

    parsed.push({
      episodeNum,
      episodePayload
    });
  });

  return parsed;
}
