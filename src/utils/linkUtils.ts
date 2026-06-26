import type { Content, Server, LinkDomainGroup } from '../types';

export function resolveServerWithGroup(
  server: Server,
  linkGroups: LinkDomainGroup[] = []
): Server {
  if (!server) return server;
  let resolvedUrl = server.url || '';
  let resolvedDownloadUrl = server.downloadUrl || '';

  if (resolvedUrl.startsWith('g:')) {
    const match = resolvedUrl.match(/^g:([^/]+)(.*)$/);
    if (match) {
      const groupId = match[1];
      const remainder = match[2];
      const group = linkGroups.find((g) => g.id === groupId);
      if (group && group.baseUrl) {
        const base = group.baseUrl.replace(/\/$/, "");
        resolvedUrl = `${base}${remainder}`;
      }
    }
  }

  if (resolvedDownloadUrl.startsWith('g:')) {
    const match = resolvedDownloadUrl.match(/^g:([^/]+)(.*)$/);
    if (match) {
      const groupId = match[1];
      const remainder = match[2];
      const group = linkGroups.find((g) => g.id === groupId);
      if (group && group.baseUrl) {
        const base = group.baseUrl.replace(/\/$/, "");
        resolvedDownloadUrl = `${base}${remainder}`;
      }
    }
  }

  return {
    ...server,
    url: resolvedUrl,
    downloadUrl: resolvedDownloadUrl
  };
}

export function resolveDynamicServers(
  content: Content,
  episodeNumber?: number,
  linkGroups: LinkDomainGroup[] = []
): Server[] {
  const config = content.dynamicLinkConfig;
  if (!config || !config.enabled || !config.groupId) {
    return [];
  }

  const group = linkGroups.find((g) => g.id === config.groupId);
  if (!group || !group.baseUrl) {
    return [];
  }

  // Build servers dynamically from config.servers
  const serversList = config.servers || [];
  return serversList.map((srv) => {
    // Strip trailing slash from baseUrl
    const baseUrl = group.baseUrl.replace(/\/$/, ""); 
    const path = srv.path.startsWith("/") ? srv.path : "/" + srv.path;
    
    // If episodic and we have a number, append episodeNumber; otherwise leave empty
    const epPart = episodeNumber !== undefined && episodeNumber !== null ? String(episodeNumber) : "";
    
    // Generate full watch URL (Three parts!)
    const watchUrl = `${baseUrl}${path}${epPart}${srv.suffix || ""}`;
    
    // Generate download URL if marked to include download link
    const downloadUrl = srv.includeDownload ? watchUrl : "";

    return {
      id: srv.id,
      name: srv.name,
      url: watchUrl,
      downloadUrl: downloadUrl,
      isActive: srv.active,
    };
  });
}
