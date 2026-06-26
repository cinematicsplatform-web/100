import { getFirestore, collection, getDocs, writeBatch, doc } from 'firebase/firestore';
import type { Content, ContentType } from '../types';

export interface VirtualNode {
  name: string;
  path: string; // Full virtual path (e.g., "series/Turky")
  type: 'folder' | 'file';
  children: VirtualNode[];
  contentId?: string; // Content document ID
  contentType?: ContentType | 'episode';
  seasonNumber?: number;
  episodeId?: number;
  data?: any; // Reference to actual movie, series or episode object
}

/**
 * Parses all contents and builds a Virtual Tree from virtual_path fields.
 */
export function generateFolderTree(contents: Content[]): VirtualNode {
  const root: VirtualNode = {
    name: 'الرئيسية',
    path: '',
    type: 'folder',
    children: []
  };

  contents.forEach((content) => {
    if (!content.virtual_path) return;
    
    const vPath = content.virtual_path;
    
    // Add the Content document node to the tree
    addPathToTree(root, vPath, 'folder', {
      contentId: content.id,
      contentType: content.type,
      data: content
    });

    // Add Episodes if it's a series and has seasons
    if (content.type === 'series' && content.seasons) {
      content.seasons.forEach((season) => {
        if (season.episodes) {
          season.episodes.forEach((episode) => {
            if (!episode.virtual_path) return;
            
            const epPath = episode.virtual_path;
            
            addPathToTree(root, epPath, 'file', {
              contentId: content.id,
              contentType: 'episode',
              seasonNumber: season.seasonNumber,
              episodeId: episode.id,
              data: episode
            });
          });
        }
      });
    }
  });

  return root;
}

/**
 * Helper function to inject a path and build intermediate virtual folders dynamically
 */
function addPathToTree(
  root: VirtualNode,
  path: string,
  type: 'folder' | 'file',
  extra: {
    contentId: string;
    contentType: ContentType | 'episode';
    seasonNumber?: number;
    episodeId?: number;
    data?: any;
  }
) {
  const segments = path.split('/').filter(Boolean);
  let current = root;

  segments.forEach((segment, index) => {
    const isLast = index === segments.length - 1;
    // Generate full virtual path up to the current segment
    const currentPath = segments.slice(0, index + 1).join('/');

    let nextNode = current.children.find((child) => child.name === segment);

    if (!nextNode) {
      nextNode = {
        name: segment,
        path: currentPath,
        type: isLast ? type : 'folder',
        children: []
      };
      current.children.push(nextNode);
    }

    if (isLast) {
      nextNode.type = type;
      nextNode.contentId = extra.contentId;
      nextNode.contentType = extra.contentType;
      if (extra.seasonNumber !== undefined) nextNode.seasonNumber = extra.seasonNumber;
      if (extra.episodeId !== undefined) nextNode.episodeId = extra.episodeId;
      nextNode.data = extra.data;
    }

    current = nextNode;
  });
}

/**
 * Deep propagation folder rename logic using strict Firebase v9+ Modular SDK.
 * Renames any occurrences of oldPath to newPath in root and embedded lists.
 * Implements chunk writing to safeguard against Firestore's 500-operation limit.
 */
export async function batchUpdateVirtualPaths(oldPath: string, newPath: string): Promise<number> {
  const db = getFirestore();
  const contentRef = collection(db, 'content');
  const snapshot = await getDocs(contentRef);
  
  const batchChunks: any[] = [];
  let currentBatch = writeBatch(db);
  let opCount = 0;
  let updatedCount = 0;
  
  snapshot.docs.forEach((documentSnap) => {
    const data = documentSnap.data() as Content;
    let isModified = false;
    const updatedFields: Partial<Content> = {};
    
    // Check root virtual_path prefix matching
    if (data.virtual_path && (data.virtual_path === oldPath || data.virtual_path.startsWith(oldPath + '/'))) {
      const rest = data.virtual_path.slice(oldPath.length);
      updatedFields.virtual_path = newPath + rest;
      isModified = true;
    }
    
    // Iterate through seasons and embedded episodes recursively
    if (data.seasons && data.seasons.length > 0) {
      const updatedSeasons = data.seasons.map((season) => {
        if (!season.episodes || season.episodes.length === 0) return season;
        
        let seasonModified = false;
        const updatedEpisodes = season.episodes.map((episode) => {
          if (episode.virtual_path && (episode.virtual_path === oldPath || episode.virtual_path.startsWith(oldPath + '/'))) {
            const rest = episode.virtual_path.slice(oldPath.length);
            seasonModified = true;
            return {
              ...episode,
              virtual_path: newPath + rest
            };
          }
          return episode;
        });
        
        if (seasonModified) {
          isModified = true;
          return {
            ...season,
            episodes: updatedEpisodes
          };
        }
        return season;
      });
      
      if (isModified) {
        updatedFields.seasons = updatedSeasons;
      }
    }
    
    if (isModified) {
      const docRef = doc(db, 'content', documentSnap.id);
      currentBatch.update(docRef, updatedFields);
      opCount++;
      updatedCount++;
      
      if (opCount >= 400) {
        batchChunks.push(currentBatch);
        currentBatch = writeBatch(db);
        opCount = 0;
      }
    }
  });
  
  if (opCount > 0) {
    batchChunks.push(currentBatch);
  }
  
  for (const b of batchChunks) {
    await b.commit();
  }
  
  return updatedCount;
}
