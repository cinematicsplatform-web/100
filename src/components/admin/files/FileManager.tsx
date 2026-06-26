import React, { useState, useEffect } from 'react';
import { 
  getFirestore, 
  collection, 
  getDocs, 
  doc, 
  updateDoc, 
  addDoc, 
  setDoc,
  deleteDoc
} from 'firebase/firestore';
import { 
  Folder, 
  FileText, 
  ChevronRight, 
  ChevronDown, 
  Plus, 
  Edit3, 
  Trash2, 
  Upload, 
  Link, 
  FileVideo, 
  Database,
  ArrowLeft,
  X,
  Play,
  Settings,
  HardDrive,
  Search
} from 'lucide-react';
import { generateFolderTree, batchUpdateVirtualPaths, VirtualNode } from '../../../utils/pathUtils';
import { parseBulkLinks } from '../../../utils/bulkParser';
import type { Content, Episode, Season, Server } from '../../../types';

const STREAM_PROXY_BASE = "https://cinematix-cinematix-server.hf.space";

interface FileManagerProps {
  addToast: (message: string, type: 'success' | 'error' | 'info') => void;
  onContentChanged: () => void;
}

export default function FileManager({ addToast, onContentChanged }: FileManagerProps) {
  const [allContent, setAllContent] = useState<Content[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [treeRoot, setTreeRoot] = useState<VirtualNode | null>(null);
  const [currentPath, setCurrentPath] = useState<string>(''); // empty means root
  const [selectedNode, setSelectedNode] = useState<VirtualNode | null>(null);
  const [copiedPath, setCopiedPath] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const getSearchResults = (): VirtualNode[] => {
    if (!treeRoot || !searchQuery.trim()) return [];
    const results: VirtualNode[] = [];
    const query = searchQuery.toLowerCase().trim();
    
    const traverse = (node: VirtualNode) => {
      if (node.path) {
        const matchesName = node.name.toLowerCase().includes(query);
        const matchesPath = node.path.toLowerCase().includes(query);
        if (matchesName || matchesPath) {
          results.push(node);
        }
      }
      if (node.children) {
        node.children.forEach(child => traverse(child));
      }
    };
    
    if (treeRoot.children) {
      treeRoot.children.forEach(child => traverse(child));
    }
    return results;
  };

  const handleCopyCleanLink = (nodePath: string) => {
    const cleanLink = `${STREAM_PROXY_BASE}/${nodePath}.mp4`;
    navigator.clipboard.writeText(cleanLink).then(() => {
      setCopiedPath(nodePath);
      addToast('تم نسخ رابط البث النظيف (MP4) بنجاح!', 'success');
      setTimeout(() => {
        setCopiedPath(null);
      }, 2000);
    }).catch(err => {
      console.error('Failed to copy link:', err);
      addToast('حدث خطأ أثناء النسخ إلى الحافظة.', 'error');
    });
  };
  
  // Navigation expand/collapse states for folder tree
  const [expandedFolders, setExpandedFolders] = useState<Record<string, boolean>>({
    '': true, // Root is expanded by default
  });

  // Modal States
  const [isBulkModalOpen, setIsBulkModalOpen] = useState(false);
  const [isNewFolderModalOpen, setIsNewFolderModalOpen] = useState(false);
  const [isRenameModalOpen, setIsRenameModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  // Form Field States
  const [newFolderName, setNewFolderName] = useState('');
  const [linkOption, setLinkOption] = useState<'link' | 'create'>('link');
  const [linkToContentId, setLinkToContentId] = useState('');
  const [newContentTitle, setNewContentTitle] = useState('');
  const [newContentType, setNewContentType] = useState<'movie' | 'series'>('series');
  const [contentSearchQuery, setContentSearchQuery] = useState('');
  
  const [renameValue, setRenameValue] = useState('');
  const [isPropagatingRename, setIsPropagatingRename] = useState(false);

  // Bulk Upload links fields
  const [bulkLinksText, setBulkLinksText] = useState('');
  const [startEpisodeNum, setStartEpisodeNum] = useState(1);
  const [isSubmittingBulk, setIsSubmittingBulk] = useState(false);

  // Direct server edit state in node details
  const [isEditingServers, setIsEditingServers] = useState(false);
  const [serverUrlInput, setServerUrlInput] = useState('');
  const [serverNameInput, setServerNameInput] = useState('سيرفر أساسي');

  useEffect(() => {
    fetchContent();
  }, []);

  const fetchContent = async () => {
    setIsLoading(true);
    try {
      const db = getFirestore();
      const contentRef = collection(db, 'content');
      const snapshot = await getDocs(contentRef);
      const contentData = snapshot.docs.map(d => ({ ...d.data(), id: d.id })) as Content[];
      setAllContent(contentData);
      
      const parsedTree = generateFolderTree(contentData);
      setTreeRoot(parsedTree);
    } catch (err) {
      console.error('Error loading content for FileManager:', err);
      addToast('حدث خطأ أثناء تحميل الملفات والمحتويات.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const toggleFolder = (path: string) => {
    setExpandedFolders(prev => ({
      ...prev,
      [path]: !prev[path]
    }));
  };

  // Get children of current path
  const getCurrentDirectoryNode = (): VirtualNode | null => {
    if (!treeRoot) return null;
    if (!currentPath) return treeRoot;

    const segments = currentPath.split('/');
    let current: VirtualNode = treeRoot;

    for (const segment of segments) {
      const next = current.children.find(c => c.name === segment);
      if (next) {
        current = next;
      } else {
        return null;
      }
    }
    return current;
  };

  const currentDirNode = getCurrentDirectoryNode();
  const breadcrumbs = currentPath ? currentPath.split('/') : [];

  const handleNavigate = (path: string) => {
    setCurrentPath(path);
    setSelectedNode(null);
    setIsEditingServers(false);
  };

  const handleNodeClick = (node: VirtualNode) => {
    setSelectedNode(node);
    setIsEditingServers(false);
    if (node.contentType === 'episode' && node.data?.servers?.length > 0) {
      setServerUrlInput(node.data.servers[0].url || '');
      setServerNameInput(node.data.servers[0].name || 'سيرفر أساسي');
    } else if (node.contentType === 'movie' && node.data?.servers?.length > 0) {
      setServerUrlInput(node.data.servers[0].url || '');
      setServerNameInput(node.data.servers[0].name || 'سيرفر أساسي');
    } else {
      setServerUrlInput('');
      setServerNameInput('سيرفر أساسي');
    }
  };

  const handleNodeDoubleClick = (node: VirtualNode) => {
    if (node.type === 'folder') {
      handleNavigate(node.path);
    } else {
      handleNodeClick(node);
    }
  };

  // --- MODULE A: Folder Renaming & Deep Propagation ---
  const handleRenameFolder = async () => {
    if (!renameValue.trim() || !currentDirNode) return;
    setIsPropagatingRename(true);
    
    try {
      const oldPath = currentDirNode.path;
      const segments = oldPath.split('/');
      segments[segments.length - 1] = renameValue.trim();
      const newPath = segments.join('/');

      const affectedCount = await batchUpdateVirtualPaths(oldPath, newPath);
      addToast(`تم تغيير اسم المجلد بنجاح وتحديث ${affectedCount} من الملفات المرتبطة به.`, 'success');
      
      setIsRenameModalOpen(false);
      setRenameValue('');
      onContentChanged();
      
      // Navigate to the new path
      setCurrentPath(newPath);
      await fetchContent();
    } catch (err) {
      console.error('Rename folder error:', err);
      addToast('فشل تغيير اسم المجلد وتحديث المسارات.', 'error');
    } finally {
      setIsPropagatingRename(false);
    }
  };

  // --- MODULE B: Bulk Link Parser ---
  const handleBulkUpload = async () => {
    if (!bulkLinksText.trim() || !currentDirNode) return;
    
    // Check if we are inside a season directory (e.g. series/.../S1)
    const segments = currentDirNode.path.split('/');
    const seasonSegment = segments[segments.length - 1];
    const isSeasonFolder = /^S\d+$/i.test(seasonSegment);

    if (!isSeasonFolder) {
      addToast('يجب استخدام هذه الميزة داخل مجلد موسم محدد (مثال: S1, S2).', 'error');
      return;
    }

    setIsSubmittingBulk(true);
    try {
      const parsedPayloads = parseBulkLinks(bulkLinksText, startEpisodeNum, currentDirNode.path);
      
      if (parsedPayloads.length === 0) {
        addToast('يرجى إدخال روابط صحيحة (رابط واحد في كل سطر).', 'error');
        setIsSubmittingBulk(false);
        return;
      }

      // Find the associated Series Content
      // Go up 2 levels: e.g. series/Turky/Aziz/S1 -> series/Turky/Aziz is series path
      const seriesPath = segments.slice(0, segments.length - 1).join('/');
      const seriesContent = allContent.find(c => c.virtual_path === seriesPath);

      if (!seriesContent) {
        addToast('لم يتم العثور على المسلسل الأصلي المرتبط بهذا الموسم في قاعدة البيانات.', 'error');
        setIsSubmittingBulk(false);
        return;
      }

      const seasonNum = parseInt(seasonSegment.replace(/S/i, ''), 10);
      const db = getFirestore();
      
      // Copy existing seasons or initialize
      const existingSeasons = seriesContent.seasons ? [...seriesContent.seasons] : [];
      let seasonIndex = existingSeasons.findIndex(s => s.seasonNumber === seasonNum);

      if (seasonIndex === -1) {
        // Create new season if it doesn't exist
        const newSeason: Season = {
          id: seasonNum,
          seasonNumber: seasonNum,
          title: `الموسم ${seasonNum}`,
          episodes: []
        };
        existingSeasons.push(newSeason);
        seasonIndex = existingSeasons.length - 1;
      }

      const targetSeason = { ...existingSeasons[seasonIndex] };
      const existingEpisodes = targetSeason.episodes ? [...targetSeason.episodes] : [];

      // Add/Overwrite parsed episodes
      parsedPayloads.forEach(({ episodeNum, episodePayload }) => {
        const epIndex = existingEpisodes.findIndex(e => e.id === episodeNum);
        if (epIndex !== -1) {
          existingEpisodes[epIndex] = { ...existingEpisodes[epIndex], ...episodePayload };
        } else {
          existingEpisodes.push(episodePayload);
        }
      });

      // Sort episodes by ID
      existingEpisodes.sort((a, b) => a.id - b.id);
      targetSeason.episodes = existingEpisodes;
      existingSeasons[seasonIndex] = targetSeason;

      // Write to Firestore
      const contentDocRef = doc(db, 'content', seriesContent.id);
      await updateDoc(contentDocRef, {
        seasons: existingSeasons,
        updatedAt: new Date().toISOString()
      });

      addToast(`تم استيراد ${parsedPayloads.length} حلقات بنجاح داخل ${seriesContent.title}!`, 'success');
      setIsBulkModalOpen(false);
      setBulkLinksText('');
      onContentChanged();
      await fetchContent();
    } catch (err) {
      console.error('Bulk link parsing/writing error:', err);
      addToast('حدث خطأ أثناء استيراد الروابط وتحديث المسلسل.', 'error');
    } finally {
      setIsSubmittingBulk(false);
    }
  };

  // --- MODULE C: Two-Way Reactive Binding & New Folder ---
  const handleCreateFolder = async () => {
    if (!newFolderName.trim()) return;

    try {
      const parentPath = currentPath ? `${currentPath}/` : '';
      const fullNewPath = `${parentPath}${newFolderName.trim()}`;
      const db = getFirestore();

      // Check folder context (under series/ or movies/)
      const isUnderSeries = fullNewPath.startsWith('series');
      const isUnderMovies = fullNewPath.startsWith('movies');

      if (isUnderSeries && linkOption === 'link') {
        if (!linkToContentId) {
          addToast('يرجى تحديد المسلسل لربطه بالمجلد.', 'error');
          return;
        }
        
        // Link existing Series to the new path
        const contentDocRef = doc(db, 'content', linkToContentId);
        await updateDoc(contentDocRef, {
          virtual_path: fullNewPath,
          updatedAt: new Date().toISOString()
        });

        addToast('تم ربط المسلسل بنجاح وتأسيس المجلد الافتراضي.', 'success');
      } else if (isUnderMovies && linkOption === 'link') {
        if (!linkToContentId) {
          addToast('يرجى تحديد الفيلم لربطه بالمجلد.', 'error');
          return;
        }

        const contentDocRef = doc(db, 'content', linkToContentId);
        await updateDoc(contentDocRef, {
          virtual_path: fullNewPath,
          updatedAt: new Date().toISOString()
        });

        addToast('تم ربط الفيلم بنجاح وتأسيس المجلد الافتراضي.', 'success');
      } else {
        // Create new Content document
        if (!newContentTitle.trim()) {
          addToast('يرجى إدخال عنوان للمحتوى الجديد.', 'error');
          return;
        }

        const newContentPayload: Omit<Content, 'id'> = {
          title: newContentTitle.trim(),
          description: `عمل جديد تم إنشاؤه عبر مدير الملفات تحت المسار ${fullNewPath}`,
          type: newContentType,
          poster: 'https://placehold.co/400x600/1a1f29/white?text=No+Poster',
          backdrop: 'https://placehold.co/1280x720/1a1f29/white?text=No+Backdrop',
          rating: 4.5,
          ageRating: '13+',
          categories: [newContentType === 'movie' ? 'افلام عربية' : 'مسلسلات عربية'],
          genres: ['دراما'],
          releaseYear: new Date().getFullYear(),
          cast: [],
          visibility: 'general',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          virtual_path: fullNewPath
        };

        if (newContentType === 'series') {
          newContentPayload.seasons = [];
        } else {
          newContentPayload.servers = [];
        }

        await addDoc(collection(db, 'content'), newContentPayload);
        addToast('تم إنشاء عمل جديد وتخصيص المجلد له بنجاح.', 'success');
      }

      setIsNewFolderModalOpen(false);
      setNewFolderName('');
      setNewContentTitle('');
      setLinkToContentId('');
      setContentSearchQuery('');
      onContentChanged();
      await fetchContent();
    } catch (err) {
      console.error('Create folder/content error:', err);
      addToast('فشل إنشاء المجلد أو ربط المحتوى.', 'error');
    }
  };

  // Delete virtual path mapping (or delete content optionally)
  const handleDeleteFolder = async () => {
    if (!currentDirNode) return;

    try {
      const db = getFirestore();
      
      // Find all content matches
      const oldPath = currentDirNode.path;
      const linkedContent = allContent.find(c => c.virtual_path === oldPath);

      if (linkedContent) {
        // Remove virtual path to un-map it
        const contentDocRef = doc(db, 'content', linkedContent.id);
        await updateDoc(contentDocRef, {
          virtual_path: ''
        });
        addToast(`تم فك ارتباط المجلد بـ "${linkedContent.title}". تم الاحتفاظ بالمحتوى في قاعدة البيانات.`, 'success');
      } else {
        addToast('المجلد افتراضي فارغ، تم حذفه من المسارات بنجاح.', 'success');
      }

      setIsDeleteModalOpen(false);
      onContentChanged();
      
      // Go up 1 level
      const segments = currentPath.split('/');
      segments.pop();
      setCurrentPath(segments.join('/'));
      await fetchContent();
    } catch (err) {
      console.error('Delete folder error:', err);
      addToast('فشل حذف المجلد.', 'error');
    }
  };

  // Direct edit for servers on Selected File (Movie or Episode)
  const handleSaveServerDirect = async () => {
    if (!selectedNode || !selectedNode.contentId) return;

    try {
      const db = getFirestore();
      const contentId = selectedNode.contentId;
      const targetContent = allContent.find(c => c.id === contentId);

      if (!targetContent) return;

      const updatedServer: Server = {
        id: Date.now(),
        name: serverNameInput.trim() || 'سيرفر أساسي',
        url: serverUrlInput.trim(),
        downloadUrl: serverUrlInput.trim(),
        isActive: true
      };

      if (selectedNode.contentType === 'movie') {
        const docRef = doc(db, 'content', contentId);
        await updateDoc(docRef, {
          servers: [updatedServer],
          updatedAt: new Date().toISOString()
        });
        addToast('تم تحديث سيرفر الفيلم بنجاح.', 'success');
      } else if (selectedNode.contentType === 'episode' && selectedNode.seasonNumber !== undefined && selectedNode.episodeId !== undefined) {
        const seasons = [...(targetContent.seasons || [])];
        const seasonIndex = seasons.findIndex(s => s.seasonNumber === selectedNode.seasonNumber);

        if (seasonIndex !== -1) {
          const episodes = [...seasons[seasonIndex].episodes];
          const epIndex = episodes.findIndex(e => e.id === selectedNode.episodeId);

          if (epIndex !== -1) {
            episodes[epIndex] = {
              ...episodes[epIndex],
              servers: [updatedServer],
              telegramOriginalUrl: serverUrlInput.trim()
            };
            seasons[seasonIndex].episodes = episodes;
            
            const docRef = doc(db, 'content', contentId);
            await updateDoc(docRef, {
              seasons: seasons,
              updatedAt: new Date().toISOString()
            });
            addToast(`تم تحديث سيرفر الحلقة ${selectedNode.episodeId} بنجاح.`, 'success');
          }
        }
      }

      setIsEditingServers(false);
      onContentChanged();
      await fetchContent();
    } catch (err) {
      console.error('Failed to update direct server:', err);
      addToast('حدث خطأ أثناء حفظ السيرفر المباشر.', 'error');
    }
  };

  // Helper to check if current folder is a Season folder (e.g. S1, S2)
  const isAtSeasonFolder = (): boolean => {
    if (!currentPath) return false;
    const segments = currentPath.split('/');
    const lastSegment = segments[segments.length - 1];
    return /^S\d+$/i.test(lastSegment);
  };

  // Recursively renders folders in sidebar tree
  const renderSidebarTree = (node: VirtualNode, level: number = 0) => {
    if (node.type === 'file') return null; // Folders only in sidebar

    const hasFolderChildren = node.children.some(c => c.type === 'folder');
    const isExpanded = expandedFolders[node.path];
    const isSelected = currentPath === node.path;

    return (
      <div key={node.path || 'root-node'} className="select-none">
        <div 
          style={{ paddingRight: `${level * 14}px` }}
          className={`flex items-center justify-between py-1.5 px-2 rounded-lg cursor-pointer transition-colors ${isSelected ? 'bg-blue-600/20 text-blue-400 border-r-2 border-blue-500' : 'text-gray-400 hover:bg-[#1a1f29] hover:text-white'}`}
          onClick={() => handleNavigate(node.path)}
        >
          <div className="flex items-center gap-2 truncate">
            {hasFolderChildren ? (
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  toggleFolder(node.path);
                }}
                className="p-0.5 hover:bg-gray-800 rounded transition-colors text-gray-500"
              >
                {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
              </button>
            ) : (
              <span className="w-5" />
            )}
            <Folder className={`w-4 h-4 ${isSelected ? 'text-blue-400' : 'text-yellow-500/80'}`} />
            <span className="text-xs font-bold truncate">{node.name}</span>
          </div>
        </div>

        {isExpanded && node.children.length > 0 && (
          <div className="mt-0.5 space-y-0.5 border-r border-gray-800 mr-2">
            {node.children.map(child => renderSidebarTree(child, level + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="bg-[#0f1014] rounded-2xl border border-gray-800 overflow-hidden shadow-2xl flex flex-col h-[750px]" dir="rtl">
      
      {/* Top action toolbar and breadcrumbs */}
      <div className="p-4 border-b border-gray-800 bg-[#16171d] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        {/* Breadcrumbs */}
        <div className="flex flex-wrap items-center gap-1.5 text-xs font-bold text-gray-400">
          <button 
            onClick={() => handleNavigate('')}
            className="flex items-center gap-1 hover:text-white transition-colors"
          >
            <HardDrive className="w-4 h-4 text-blue-400" />
            <span>مدير الملفات الافتراضي</span>
          </button>
          
          {breadcrumbs.map((segment, index) => {
            const partialPath = breadcrumbs.slice(0, index + 1).join('/');
            return (
              <React.Fragment key={partialPath}>
                <ChevronLeftIcon className="w-3 h-3 text-gray-600" />
                <button 
                  onClick={() => handleNavigate(partialPath)}
                  className="hover:text-white transition-colors text-[#00A7F8]"
                >
                  {segment}
                </button>
              </React.Fragment>
            );
          })}
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Create Folder button */}
          <button 
            onClick={() => {
              setLinkOption('link');
              setLinkToContentId('');
              setContentSearchQuery('');
              setIsNewFolderModalOpen(true);
            }}
            className="flex items-center gap-1.5 px-3.5 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-lg transition-colors shadow-lg shadow-blue-900/30"
          >
            <Plus className="w-4 h-4" />
            <span>مجلد جديد</span>
          </button>

          {/* Bulk Links button - enabled inside season */}
          <button 
            onClick={() => setIsBulkModalOpen(true)}
            disabled={!isAtSeasonFolder()}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold rounded-lg transition-colors shadow-lg ${isAtSeasonFolder() ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-900/20' : 'bg-gray-800 text-gray-600 cursor-not-allowed shadow-none'}`}
            title={isAtSeasonFolder() ? 'استيراد الحلقات جماعياً' : 'متاح فقط داخل مجلد موسم (S1 مثلاً)'}
          >
            <Upload className="w-4 h-4" />
            <span>استيراد جماعي للروابط</span>
          </button>

          {/* Rename folder button */}
          <button 
            onClick={() => {
              if (currentDirNode) {
                setRenameValue(currentDirNode.name);
                setIsRenameModalOpen(true);
              }
            }}
            disabled={!currentPath}
            className={`p-2 rounded-lg border transition-colors ${currentPath ? 'border-gray-700 bg-gray-800 hover:bg-gray-700 text-gray-300' : 'border-gray-900 bg-gray-900 text-gray-700 cursor-not-allowed'}`}
            title="تغيير اسم المجلد الحالي"
          >
            <Edit3 className="w-4 h-4" />
          </button>

          {/* Delete current folder button */}
          <button 
            onClick={() => setIsDeleteModalOpen(true)}
            disabled={!currentPath}
            className={`p-2 rounded-lg border transition-colors ${currentPath ? 'border-red-950 bg-red-950/20 hover:bg-red-900/40 text-red-400' : 'border-gray-900 bg-gray-900 text-gray-700 cursor-not-allowed'}`}
            title="حذف المجلد الحالي"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
      
      {/* Search Bar Row */}
      <div className="px-4 py-3 border-b border-gray-800 bg-[#0d0e12] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-lg">
          <Search className="w-4 h-4 text-gray-500 absolute right-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="ابحث عن فيلم، مسلسل، حلقة بث أو مسار افتراضي..."
            className="w-full bg-gray-900/80 border border-gray-800 rounded-xl py-2 pr-9 pl-4 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-blue-500/80 focus:bg-gray-900 transition-all text-right"
          />
          {searchQuery && (
            <button 
              onClick={() => setSearchQuery('')}
              className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white text-xs font-bold bg-gray-800 hover:bg-gray-700 px-2 py-0.5 rounded transition-all"
            >
              إلغاء
            </button>
          )}
        </div>
        {searchQuery.trim() && (
          <div className="text-[10px] font-bold text-blue-400 bg-blue-950/30 border border-blue-900/30 px-2.5 py-1 rounded-lg flex items-center gap-1.5 self-start sm:self-auto">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
            <span>نتائج البحث عن "{searchQuery}"</span>
          </div>
        )}
      </div>

      {/* Main split view */}
      <div className="flex-1 flex overflow-hidden">
        
        {/* Right Sidebar - Tree structure */}
        <aside className="w-72 border-l border-gray-800 bg-[#0c0d12] flex flex-col p-4 overflow-y-auto">
          <div className="mb-3 text-[10px] font-bold text-gray-500 uppercase tracking-wider">شجرة الملفات الافتراضية</div>
          {isLoading ? (
            <div className="flex-1 flex items-center justify-center py-12 text-xs text-gray-500">جاري تحميل الشجرة...</div>
          ) : treeRoot ? (
            <div className="space-y-1">
              {renderSidebarTree(treeRoot)}
            </div>
          ) : (
            <div className="text-xs text-gray-600 py-6 text-center">لا توجد مسارات</div>
          )}
        </aside>

        {/* Center Grid - Current folder children or Search Results */}
        <div className="flex-1 bg-[#090a0f] flex flex-col overflow-y-auto p-6">
          {isLoading ? (
            <div className="flex-1 flex flex-col items-center justify-center text-gray-400 gap-3">
              <span className="w-8 h-8 rounded-full border-2 border-blue-500 border-t-transparent animate-spin" />
              <span className="text-xs font-bold">جاري رصد الهيكل الافتراضي...</span>
            </div>
          ) : searchQuery.trim() ? (
            // Search Results Mode
            (() => {
              const results = getSearchResults();
              if (results.length === 0) {
                return (
                  <div className="flex-1 flex flex-col items-center justify-center text-center text-gray-500 py-12 gap-4">
                    <div className="w-16 h-16 rounded-full bg-gray-800/30 border border-gray-700/50 flex items-center justify-center text-2xl">🔍</div>
                    <div className="space-y-1">
                      <h5 className="font-bold text-sm text-gray-300">لم يتم العثور على نتائج</h5>
                      <p className="text-xs max-w-xs leading-relaxed text-gray-500">جرب البحث بكلمة مفتاحية مختلفة أو جزء من المسار الافتراضي للعمل أو الحلقة.</p>
                    </div>
                  </div>
                );
              }
              
              return (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold text-gray-400 flex items-center gap-2">
                      <span>🔍 نتائج البحث ({results.length})</span>
                    </h4>
                  </div>
                  
                  <div className="space-y-2.5">
                    {results.map(node => {
                      const isSelected = selectedNode?.path === node.path;
                      const isCopied = copiedPath === node.path;
                      return (
                        <div 
                          key={node.path}
                          onClick={() => handleNodeClick(node)}
                          onDoubleClick={() => {
                            if (node.type === 'folder') {
                              handleNavigate(node.path);
                              setSearchQuery('');
                            } else {
                              handleNodeDoubleClick(node);
                            }
                          }}
                          className={`p-3.5 rounded-xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 transition-all cursor-pointer relative ${isSelected ? 'border-blue-500 bg-blue-600/5 shadow-lg' : 'border-gray-800 bg-[#0f1015] hover:border-gray-700 hover:bg-[#15161d]'}`}
                        >
                          <div className="flex items-center gap-3 min-w-0 flex-1">
                            <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${node.type === 'folder' ? 'bg-yellow-600/10 text-yellow-500' : 'bg-blue-600/10 text-blue-400'}`}>
                              {node.type === 'folder' ? (
                                <Folder className="w-5 h-5" fill="currentColor" fillOpacity={0.1} />
                              ) : (
                                <FileVideo className="w-5 h-5" />
                              )}
                            </div>
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center gap-2 flex-wrap mb-1">
                                <span className="text-xs font-bold text-gray-100 truncate">{node.name}</span>
                                <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded border ${node.type === 'folder' ? 'bg-yellow-950/40 text-yellow-500 border-yellow-800/30' : 'bg-blue-950/40 text-blue-400 border-blue-900/30'}`}>
                                  {node.type === 'folder' ? (node.contentType === 'series' ? 'مسلسل' : node.contentType === 'movie' ? 'فيلم' : 'مجلد') : (node.contentType === 'episode' ? 'حلقة بث' : 'فيلم')}
                                </span>
                              </div>
                              <div className="text-[10px] font-mono text-gray-500 truncate" dir="ltr" style={{ textAlign: 'right' }}>
                                {node.path}
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto">
                            {node.type === 'file' && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleCopyCleanLink(node.path);
                                }}
                                className={`px-3 py-1.5 rounded-lg text-[11px] font-bold transition-all flex items-center gap-1.5 border ${
                                  isCopied 
                                    ? 'bg-emerald-950/40 text-emerald-400 border-emerald-500/30' 
                                    : 'bg-blue-600/10 hover:bg-blue-600 text-blue-400 hover:text-white border-blue-500/20 hover:border-blue-500'
                                }`}
                              >
                                <span>{isCopied ? '📋 تم النسخ!' : '📋 نسخ رابط البث'}</span>
                              </button>
                            )}
                            {node.type === 'folder' && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleNavigate(node.path);
                                  setSearchQuery('');
                                }}
                                className="px-3 py-1.5 rounded-lg text-[11px] font-bold transition-all flex items-center gap-1 bg-gray-800 hover:bg-gray-700 text-gray-300 border border-gray-700"
                              >
                                <span>فتح المجلد 📂</span>
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })()
          ) : (
            <>
              {currentDirNode && currentDirNode.children.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center text-center text-gray-500 py-12 gap-4">
                  <div className="w-16 h-16 rounded-full bg-gray-800/50 border border-gray-700 flex items-center justify-center text-4xl">📁</div>
                  <div className="space-y-1">
                    <h5 className="font-bold text-sm text-gray-300">مجلد افتراضي فارغ</h5>
                    <p className="text-xs max-w-xs leading-relaxed text-gray-500">لا يحتوي هذا المجلد على أعمال أو حلقات مخصصة بعد. قم بربط عمل أو استخدام الاستيراد الجماعي.</p>
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Folders Section */}
                  {currentDirNode && currentDirNode.children.some(c => c.type === 'folder') && (
                    <div className="space-y-3">
                      <h4 className="text-xs font-bold text-gray-400 flex items-center gap-2">
                        <span>📁 المجلدات الافتراضية</span>
                        <span className="w-1.5 h-1.5 rounded-full bg-yellow-500" />
                      </h4>
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                        {currentDirNode.children
                          .filter(c => c.type === 'folder')
                          .map(node => {
                            const isSelected = selectedNode?.path === node.path;
                            return (
                              <div 
                                key={node.path}
                                onClick={() => handleNodeClick(node)}
                                onDoubleClick={() => handleNodeDoubleClick(node)}
                                className={`p-4 rounded-xl border text-center transition-all cursor-pointer group flex flex-col items-center gap-3 relative ${isSelected ? 'border-blue-500 bg-blue-600/10 shadow-lg shadow-blue-900/10' : 'border-gray-800 bg-[#0f1015] hover:border-gray-700 hover:bg-[#15161d]'}`}
                              >
                                <div className="w-12 h-12 rounded-lg bg-yellow-600/10 flex items-center justify-center text-yellow-500 group-hover:scale-110 transition-transform">
                                  <Folder className="w-7 h-7" fill="currentColor" fillOpacity={0.1} />
                                </div>
                                <span className="text-xs font-bold text-gray-200 line-clamp-2 w-full break-all leading-relaxed" title={node.name}>
                                  {node.name}
                                </span>
                                {node.contentType && (
                                  <span className="absolute top-1.5 left-1.5 bg-gray-900 text-[9px] px-1.5 py-0.5 rounded border border-gray-800 text-gray-400">
                                    {node.contentType === 'series' ? 'مسلسل' : node.contentType === 'movie' ? 'فيلم' : 'حلقة'}
                                  </span>
                                )}
                              </div>
                            );
                          })}
                      </div>
                    </div>
                  )}

                  {/* Files / Video Clips Section */}
                  {currentDirNode && currentDirNode.children.some(c => c.type === 'file') && (
                    <div className="space-y-3">
                      <h4 className="text-xs font-bold text-gray-400 flex items-center gap-2">
                        <span>🎬 ملفات الفيديو وحلقات البث (.mp4)</span>
                        <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                      </h4>
                      <div className="space-y-2.5">
                        {currentDirNode.children
                          .filter(c => c.type === 'file')
                          .map(node => {
                            const isSelected = selectedNode?.path === node.path;
                            const isCopied = copiedPath === node.path;
                            return (
                              <div 
                                key={node.path}
                                onClick={() => handleNodeClick(node)}
                                onDoubleClick={() => handleNodeDoubleClick(node)}
                                className={`p-3.5 rounded-xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 transition-all cursor-pointer relative ${isSelected ? 'border-blue-500 bg-blue-600/5 shadow-lg' : 'border-gray-800 bg-[#0f1015] hover:border-gray-700 hover:bg-[#15161d]'}`}
                              >
                                <div className="flex items-center gap-3 min-w-0 flex-1">
                                  <div className="w-10 h-10 rounded-lg bg-blue-600/10 flex items-center justify-center text-blue-400 shrink-0">
                                    <FileVideo className="w-5 h-5" />
                                  </div>
                                  <div className="min-w-0 flex-1">
                                    <div className="flex items-center gap-2 flex-wrap mb-1">
                                      <span className="text-xs font-bold text-gray-100 truncate">{node.name}</span>
                                      <span className="bg-gray-800 text-[9px] font-bold px-1.5 py-0.5 rounded border border-gray-700 text-gray-400">
                                        {node.contentType === 'episode' ? 'حلقة بث' : 'فيلم'}
                                      </span>
                                    </div>
                                    <div className="text-[10px] font-mono text-gray-500 truncate" dir="ltr" style={{ textAlign: 'right' }}>
                                      {node.path}
                                    </div>
                                  </div>
                                </div>

                                {/* Copy stream button */}
                                <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto">
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleCopyCleanLink(node.path);
                                    }}
                                    className={`px-3 py-1.5 rounded-lg text-[11px] font-bold transition-all flex items-center gap-1.5 border ${
                                      isCopied 
                                        ? 'bg-emerald-950/40 text-emerald-400 border-emerald-500/30' 
                                        : 'bg-blue-600/10 hover:bg-blue-600 text-blue-400 hover:text-white border-blue-500/20 hover:border-blue-500'
                                    }`}
                                  >
                                    <span>{isCopied ? '📋 تم النسخ!' : '📋 نسخ رابط البث النظيف'}</span>
                                  </button>
                                </div>
                              </div>
                            );
                          })}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>

        {/* Left Sidebar - Detailed Node Properties */}
        {selectedNode && (
          <aside className="w-80 border-r border-gray-800 bg-[#0c0d12] flex flex-col p-4 overflow-y-auto">
            <div className="flex items-center justify-between border-b border-gray-800 pb-3 mb-4">
              <span className="text-xs font-bold text-gray-400 flex items-center gap-1">
                <Database className="w-3.5 h-3.5 text-blue-400" />
                <span>تفاصيل العنصر</span>
              </span>
              <button 
                onClick={() => setSelectedNode(null)}
                className="p-1 text-gray-500 hover:text-white rounded"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Basic Info */}
            <div className="space-y-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] text-gray-500 font-bold uppercase">الاسم الافتراضي</label>
                <div className="text-sm font-bold text-white bg-gray-900 p-2.5 rounded-lg border border-gray-800 select-all break-all">
                  {selectedNode.name}
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] text-gray-500 font-bold uppercase">المسار الافتراضي (Path)</label>
                <div className="text-[11px] font-mono text-gray-300 bg-gray-900 p-2.5 rounded-lg border border-gray-800 select-all break-all">
                  {selectedNode.path}
                </div>
              </div>

              {selectedNode.type === 'file' && (
                <button
                  onClick={() => handleCopyCleanLink(selectedNode.path)}
                  className={`w-full py-2.5 px-3.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 border ${
                    copiedPath === selectedNode.path
                      ? 'bg-emerald-950/40 text-emerald-400 border-emerald-500/30'
                      : 'bg-blue-600/10 hover:bg-blue-600 text-blue-400 hover:text-white border-blue-500/20 hover:border-blue-500'
                  }`}
                >
                  <span>{copiedPath === selectedNode.path ? '📋 تم نسخ الرابط!' : '📋 نسخ رابط البث النظيف (MP4)'}</span>
                </button>
              )}

              {/* Linked Database Entity Info */}
              {selectedNode.contentId && (
                <div className="p-3 bg-blue-600/5 rounded-xl border border-blue-500/20 space-y-2">
                  <span className="text-[10px] text-blue-400 font-bold flex items-center gap-1">
                    <Link className="w-3.5 h-3.5" />
                    <span>مرتبط بقاعدة البيانات (Binding Active)</span>
                  </span>

                  <div className="text-xs">
                    <span className="text-gray-500">معرف المحتوى: </span>
                    <span className="font-mono text-gray-300 select-all">{selectedNode.contentId}</span>
                  </div>

                  {selectedNode.contentType === 'episode' && (
                    <div className="text-xs">
                      <span className="text-gray-500">رقم الحلقة: </span>
                      <span className="font-bold text-emerald-400">{selectedNode.episodeId}</span>
                      {selectedNode.seasonNumber !== undefined && (
                        <span> (الموسم {selectedNode.seasonNumber})</span>
                      )}
                    </div>
                  )}

                  {selectedNode.data && (
                    <div className="space-y-1 mt-1 border-t border-gray-800/80 pt-2">
                      <div className="text-xs font-bold text-white truncate">{selectedNode.data.title || 'بلا عنوان'}</div>
                      <p className="text-[11px] text-gray-500 leading-relaxed line-clamp-3">{selectedNode.data.description || 'لا يوجد وصف متاح'}</p>
                    </div>
                  )}
                </div>
              )}

              {/* Streaming URL / Server Editing Panel (Direct Editing via Explorer) */}
              {(selectedNode.contentType === 'movie' || selectedNode.contentType === 'episode') && selectedNode.contentId && (
                <div className="space-y-3 pt-3 border-t border-gray-800">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">سيرفرات التشغيل (روابط البث)</span>
                    {!isEditingServers ? (
                      <button 
                        onClick={() => setIsEditingServers(true)}
                        className="text-xs font-bold text-blue-400 hover:text-blue-300"
                      >
                        تعديل الرابط
                      </button>
                    ) : (
                      <div className="flex gap-2">
                        <button 
                          onClick={handleSaveServerDirect}
                          className="text-xs font-bold text-emerald-400 hover:text-emerald-300"
                        >
                          حفظ
                        </button>
                        <button 
                          onClick={() => setIsEditingServers(false)}
                          className="text-xs font-bold text-gray-500 hover:text-gray-400"
                        >
                          إلغاء
                        </button>
                      </div>
                    )}
                  </div>

                  {isEditingServers ? (
                    <div className="space-y-2.5">
                      <div>
                        <label className="text-[9px] text-gray-500 font-bold mb-1 block">اسم السيرفر</label>
                        <input 
                          type="text" 
                          value={serverNameInput}
                          onChange={(e) => setServerNameInput(e.target.value)}
                          className="w-full bg-gray-900 border border-gray-800 rounded-lg p-2 text-xs text-white focus:outline-none focus:border-blue-500"
                        />
                      </div>
                      <div>
                        <label className="text-[9px] text-gray-500 font-bold mb-1 block">رابط الفيديو المباشر</label>
                        <textarea 
                          rows={3}
                          value={serverUrlInput}
                          onChange={(e) => setServerUrlInput(e.target.value)}
                          placeholder="مثال: https://telegram.org/video/..."
                          className="w-full bg-gray-900 border border-gray-800 rounded-lg p-2 text-xs text-white focus:outline-none focus:border-blue-500 font-mono"
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {selectedNode.data?.servers && selectedNode.data.servers.length > 0 ? (
                        selectedNode.data.servers.map((srv: Server, idx: number) => (
                          <div key={idx} className="p-2.5 bg-gray-900 border border-gray-800 rounded-lg flex flex-col gap-1.5">
                            <div className="flex items-center justify-between text-xs font-bold text-gray-300">
                              <span className="flex items-center gap-1.5">
                                <Play className="w-3.5 h-3.5 text-blue-400" />
                                {srv.name}
                              </span>
                            </div>
                            <span className="text-[10px] text-gray-500 font-mono truncate select-all">{srv.url}</span>
                          </div>
                        ))
                      ) : (
                        <div className="text-xs text-gray-600 italic bg-gray-950 p-3 rounded-lg border border-gray-900 text-center">لا توجد روابط تشغيل مضافة</div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          </aside>
        )}
      </div>

      {/* MODAL 1: Bulk Links Upload */}
      {isBulkModalOpen && (
        <div className="fixed inset-0 z-[300] bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0f1015] border border-gray-800 rounded-2xl w-full max-w-xl shadow-2xl overflow-hidden flex flex-col" dir="rtl">
            <div className="p-5 border-b border-gray-800 flex items-center justify-between bg-black/20">
              <div className="flex items-center gap-2">
                <Upload className="w-5 h-5 text-emerald-400" />
                <h3 className="font-bold text-white text-base">استيراد الروابط جماعياً (الناقل الذكي)</h3>
              </div>
              <button onClick={() => setIsBulkModalOpen(false)} className="text-gray-500 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="text-xs text-gray-400 bg-emerald-900/10 p-3 rounded-xl border border-emerald-500/20 leading-relaxed">
                سيقوم هذا الموديل بفصل الروابط التي تدخلها سطر تلو الآخر، وإنشاء حلقات مقابلة بشكل متسلسل يبدأ من رقم البداية المحدد. سيتم ربط كل حلقة بمسار افتراضي يتوافق مع هيكل قاعدة البيانات.
              </div>

              <div>
                <label className="text-xs font-bold text-gray-400 mb-1.5 block">القسم المستهدف (الموسم)</label>
                <div className="bg-gray-900 p-2.5 rounded-lg border border-gray-800 text-xs text-emerald-400 font-mono font-bold">
                  {currentPath}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-gray-400 mb-1.5 block">بداية رقم الحلقة</label>
                  <input 
                    type="number" 
                    min={1}
                    value={startEpisodeNum}
                    onChange={(e) => setStartEpisodeNum(Math.max(1, parseInt(e.target.value, 10) || 1))}
                    className="w-full bg-gray-900 border border-gray-800 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div className="flex flex-col justify-end">
                  <span className="text-[11px] text-gray-500 font-bold mb-1">
                    مثال: 1 يعني الحلقة 1، الحلقة 2... إلخ.
                  </span>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-gray-400 mb-1.5 block">الروابط المباشرة (رابط واحد في كل سطر)</label>
                <textarea 
                  rows={6}
                  value={bulkLinksText}
                  onChange={(e) => setBulkLinksText(e.target.value)}
                  placeholder="مثال:&#10;https://t.me/stream/aziz_s1_e01.mp4&#10;https://t.me/stream/aziz_s1_e02.mp4"
                  className="w-full bg-gray-900 border border-gray-800 rounded-lg p-3 text-xs text-white focus:outline-none focus:border-blue-500 font-mono leading-relaxed"
                />
              </div>
            </div>

            <div className="p-5 border-t border-gray-800 bg-black/20 flex items-center justify-end gap-3">
              <button 
                onClick={() => setIsBulkModalOpen(false)}
                className="px-4 py-2 bg-gray-900 border border-gray-800 text-gray-400 text-xs font-bold rounded-lg hover:bg-gray-800 transition-colors"
              >
                إلغاء
              </button>
              <button 
                onClick={handleBulkUpload}
                disabled={isSubmittingBulk || !bulkLinksText.trim()}
                className={`px-5 py-2 text-xs font-bold rounded-lg transition-colors flex items-center gap-1.5 ${isSubmittingBulk || !bulkLinksText.trim() ? 'bg-gray-800 text-gray-600 cursor-not-allowed' : 'bg-emerald-600 hover:bg-emerald-500 text-white'}`}
              >
                {isSubmittingBulk && <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />}
                <span>استيراد الروابط</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: Create Folder & Two-Way Bind */}
      {isNewFolderModalOpen && (
        <div className="fixed inset-0 z-[300] bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0f1015] border border-gray-800 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden flex flex-col" dir="rtl">
            <div className="p-5 border-b border-gray-800 flex items-center justify-between bg-black/20">
              <div className="flex items-center gap-2">
                <Folder className="w-5 h-5 text-blue-500" />
                <h3 className="font-bold text-white text-base">إنشاء مجلد افتراضي جديد</h3>
              </div>
              <button onClick={() => setIsNewFolderModalOpen(false)} className="text-gray-500 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="text-xs font-bold text-gray-400 mb-1.5 block">اسم المجلد الجديد (بالانجليزية يفضل)</label>
                <input 
                  type="text" 
                  value={newFolderName}
                  onChange={(e) => setNewFolderName(e.target.value)}
                  placeholder="مثال: Al-Heeba"
                  className="w-full bg-gray-900 border border-gray-800 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              {/* Show link prompts only if we are creating folders under series/ or movies/ */}
              {(currentPath.startsWith('series') || currentPath.startsWith('movies') || currentPath === '') && (
                <div className="space-y-4 pt-3 border-t border-gray-800">
                  <label className="text-xs font-bold text-gray-400 block mb-2">نوع المجلد والربط مع قاعدة البيانات</label>
                  
                  <div className="flex bg-[#0a0a0f] p-1 rounded-lg border border-gray-800">
                    <button 
                      onClick={() => setLinkOption('link')}
                      className={`flex-1 py-1.5 rounded text-xs font-bold transition-all ${linkOption === 'link' ? 'bg-blue-600 text-white' : 'text-gray-500 hover:text-gray-400'}`}
                    >
                      ربطه بعمل موجود
                    </button>
                    <button 
                      onClick={() => setLinkOption('create')}
                      className={`flex-1 py-1.5 rounded text-xs font-bold transition-all ${linkOption === 'create' ? 'bg-blue-600 text-white' : 'text-gray-500 hover:text-gray-400'}`}
                    >
                      إنشاء عمل جديد للمجلد
                    </button>
                  </div>

                  {linkOption === 'link' ? (
                    <div className="space-y-2.5">
                      <label className="text-[11px] text-gray-500 font-bold block">اختر العمل من قاعدة البيانات (متصل بالبحث)</label>
                      
                      {/* Search in Content box */}
                      <div className="relative">
                        <Search className="w-3.5 h-3.5 text-gray-500 absolute right-2.5 top-1/2 -translate-y-1/2" />
                        <input 
                          type="text"
                          value={contentSearchQuery}
                          onChange={(e) => setContentSearchQuery(e.target.value)}
                          placeholder="ابحث عن مسلسل أو فيلم بالاسم..."
                          className="w-full bg-gray-950 border border-gray-800 rounded-lg py-2.5 pr-8 pl-3 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-blue-500/80 text-right"
                        />
                      </div>

                      {/* Custom scrollable list of filtered content */}
                      <div className="border border-gray-800 rounded-xl overflow-hidden bg-gray-950">
                        <div className="max-h-48 overflow-y-auto divide-y divide-gray-900/80">
                          {(() => {
                            const filteredContentToLink = allContent
                              .filter(c => {
                                const isSeriesPath = currentPath.startsWith('series');
                                const isMoviePath = currentPath.startsWith('movies');
                                if (isSeriesPath) return c.type === 'series';
                                if (isMoviePath) return c.type === 'movie';
                                return true;
                              })
                              .filter(c => {
                                if (!contentSearchQuery.trim()) return true;
                                const q = contentSearchQuery.toLowerCase().trim();
                                return c.title.toLowerCase().includes(q) || (c.virtual_path && c.virtual_path.toLowerCase().includes(q));
                              });

                            if (filteredContentToLink.length > 0) {
                              return filteredContentToLink.map(c => {
                                const isSelected = linkToContentId === c.id;
                                return (
                                  <button
                                    key={c.id}
                                    type="button"
                                    onClick={() => setLinkToContentId(c.id)}
                                    className={`w-full text-right p-2.5 text-xs transition-all flex items-center justify-between ${
                                      isSelected 
                                        ? 'bg-blue-600/10 text-blue-400 font-bold' 
                                        : 'text-gray-300 hover:bg-gray-900/50 hover:text-white'
                                    }`}
                                  >
                                    <div className="flex items-center gap-2">
                                      <span className={`w-2 h-2 rounded-full ${isSelected ? 'bg-blue-500 animate-pulse' : 'bg-gray-700'}`} />
                                      <span>{c.title}</span>
                                    </div>
                                    <span className="text-[10px] text-gray-500 bg-gray-900 px-1.5 py-0.5 rounded border border-gray-800">
                                      {c.type === 'series' ? 'مسلسل' : 'فيلم'}
                                    </span>
                                  </button>
                                );
                              });
                            } else {
                              return (
                                <div className="p-4 text-center text-xs text-gray-500">
                                  لم يتم العثور على أي أعمال تطابق هذا البحث.
                                </div>
                              );
                            }
                          })()}
                        </div>
                      </div>

                      {linkToContentId && (
                        <div className="flex items-center justify-between text-[11px] text-gray-400 bg-blue-950/20 border border-blue-900/20 rounded-lg px-2.5 py-1.5">
                          <span>العمل المحدد: <strong className="text-blue-400">{allContent.find(c => c.id === linkToContentId)?.title}</strong></span>
                          <button 
                            type="button" 
                            onClick={() => setLinkToContentId('')} 
                            className="text-red-400 hover:text-red-300 font-bold"
                          >
                            إلغاء التحديد
                          </button>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <div>
                        <label className="text-[11px] text-gray-500 font-bold mb-1 block">عنوان العمل الجديد (بالعربية)</label>
                        <input 
                          type="text" 
                          value={newContentTitle}
                          onChange={(e) => setNewContentTitle(e.target.value)}
                          placeholder="مثال: الهيبة العودة"
                          className="w-full bg-gray-900 border border-gray-800 rounded-lg p-2 text-xs text-white focus:outline-none focus:border-blue-500"
                        />
                      </div>
                      <div>
                        <label className="text-[11px] text-gray-500 font-bold mb-1 block">نوع العمل</label>
                        <select
                          value={newContentType}
                          onChange={(e) => setNewContentType(e.target.value as 'movie' | 'series')}
                          className="w-full bg-gray-900 border border-gray-800 rounded-lg p-2 text-xs text-white focus:outline-none focus:border-blue-500"
                        >
                          <option value="series">مسلسل (Series)</option>
                          <option value="movie">فيلم (Movie)</option>
                        </select>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="p-5 border-t border-gray-800 bg-black/20 flex items-center justify-end gap-3">
              <button 
                onClick={() => setIsNewFolderModalOpen(false)}
                className="px-4 py-2 bg-gray-900 border border-gray-800 text-gray-400 text-xs font-bold rounded-lg hover:bg-gray-800 transition-colors"
              >
                إلغاء
              </button>
              <button 
                onClick={handleCreateFolder}
                disabled={!newFolderName.trim()}
                className={`px-5 py-2 text-xs font-bold rounded-lg transition-colors ${!newFolderName.trim() ? 'bg-gray-800 text-gray-600 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-500 text-white'}`}
              >
                تأسيس المجلد
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 3: Rename Folder */}
      {isRenameModalOpen && (
        <div className="fixed inset-0 z-[300] bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0f1015] border border-gray-800 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden flex flex-col" dir="rtl">
            <div className="p-5 border-b border-gray-800 flex items-center justify-between bg-black/20">
              <div className="flex items-center gap-2">
                <Edit3 className="w-5 h-5 text-blue-500" />
                <h3 className="font-bold text-white text-base">تغيير اسم المجلد الحالي</h3>
              </div>
              <button onClick={() => setIsRenameModalOpen(false)} className="text-gray-500 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="text-xs text-gray-400 bg-blue-900/10 p-3 rounded-xl border border-blue-500/20 leading-relaxed">
                سيقوم النظام بالبحث عن جميع الحلقات والمسلسلات والأفلام المرتبطة بهذا المجلد وتعديل مسارها الافتراضي تلقائياً لضمان اتساق قواعد البيانات وعدم انقطاع الروابط.
              </div>

              <div>
                <label className="text-xs font-bold text-gray-400 mb-1.5 block">الاسم الجديد للمجلد</label>
                <input 
                  type="text" 
                  value={renameValue}
                  onChange={(e) => setRenameValue(e.target.value)}
                  placeholder="مثال: Aziz-2026"
                  className="w-full bg-gray-900 border border-gray-800 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>

            <div className="p-5 border-t border-gray-800 bg-black/20 flex items-center justify-end gap-3">
              <button 
                onClick={() => setIsRenameModalOpen(false)}
                className="px-4 py-2 bg-gray-900 border border-gray-800 text-gray-400 text-xs font-bold rounded-lg hover:bg-gray-800 transition-colors"
              >
                إلغاء
              </button>
              <button 
                onClick={handleRenameFolder}
                disabled={isPropagatingRename || !renameValue.trim()}
                className={`px-5 py-2 text-xs font-bold rounded-lg transition-colors flex items-center gap-1.5 ${isPropagatingRename || !renameValue.trim() ? 'bg-gray-800 text-gray-600 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-500 text-white'}`}
              >
                {isPropagatingRename && <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />}
                <span>تأكيد وتحديث المسارات</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 4: Delete Confirmation */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 z-[300] bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0f1015] border border-gray-800 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden flex flex-col" dir="rtl">
            <div className="p-5 border-b border-gray-800 flex items-center justify-between bg-black/20">
              <div className="flex items-center gap-2 text-red-400">
                <Trash2 className="w-5 h-5" />
                <h3 className="font-bold text-white text-base">حذف مجلد الملفات الافتراضي</h3>
              </div>
              <button onClick={() => setIsDeleteModalOpen(false)} className="text-gray-500 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-3">
              <p className="text-xs text-gray-300 leading-relaxed">
                هل أنت متأكد من حذف المجلد الافتراضي <span className="text-red-400 font-bold font-mono">"{currentPath}"</span>؟
              </p>
              <p className="text-[11px] text-gray-500 leading-relaxed">
                سيقوم هذا الإجراء بإزالة المسار الافتراضي (<span className="font-mono">virtual_path</span>) من المسلسلات أو الحلقات المرتبطة، مع الاحتفاظ ببياناتها الأصلية داخل قاعدة بيانات سينماتيكس دون حذف المحتوى الفعلي.
              </p>
            </div>

            <div className="p-5 border-t border-gray-800 bg-black/20 flex items-center justify-end gap-3">
              <button 
                onClick={() => setIsDeleteModalOpen(false)}
                className="px-4 py-2 bg-gray-900 border border-gray-800 text-gray-400 text-xs font-bold rounded-lg hover:bg-gray-800 transition-colors"
              >
                إلغاء
              </button>
              <button 
                onClick={handleDeleteFolder}
                className="px-5 py-2 bg-red-600 hover:bg-red-500 text-white text-xs font-bold rounded-lg transition-colors"
              >
                تأكيد الحذف فك الارتباط
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

// Simple internal icon to prevent missing imports
function ChevronLeftIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />
    </svg>
  );
}
