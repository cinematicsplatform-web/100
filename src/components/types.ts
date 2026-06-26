

export const ContentType = {
  Movie: 'movie',
  Series: 'series',
} as const;

export type ContentType = typeof ContentType[keyof typeof ContentType];

export const categories = [
  'مسلسلات عربية',
  'مسلسلات تركية',
  'مسلسلات اجنبية',
  'افلام عربية',
  'افلام تركية',
  'افلام اجنبية',
  'افلام هندية',
  'أفلام أنيميشن',
  'مسلسلات أنيميشن',
  'برامج تلفزيونية',
  'رمضان',
  'قريباً',
  'حصرياً لرمضان',
  'برامج رمضان',
  'افلام العيد',
  'مسلسلات رمضان',
] as const;

export type Category = typeof categories[number];

export const genres = [
    'أكشن', 'مغامرة', 'تشويق', 'جريمة', 'غموض', 'إثارة', 'دراما', 'اجتماعي', 'رومانسي', 
    'كوميديا', 'رعب', 'خيال علمي', 'فانتازيا', 'تاريخي', 'سيرة ذاتية', 'حربي', 
    'عائلي', 'أطفال', 'وثائقي', 'موسيقي',
] as const;

export type Genre = typeof genres[number];

export type View = 'home' | 'movies' | 'series' | 'kids' | 'ramadan' | 'soon' | 'detail' | 'watch' | 'admin' | 'login' | 'register' | 'profileSelector' | 'accountSettings' | 'privacy' | 'copyright' | 'about' | 'myList' | 'category' | 'profileHub' | 'maintenance' | 'search';

export type LoginError = 'none' | 'userNotFound' | 'wrongPassword';

export interface Server {
  id: number;
  name: string;
  url: string;
  downloadUrl: string;
  isActive: boolean;
}

export interface Episode {
  id: number;
  title?: string;
  thumbnail?: string; // Made optional
  description?: string; // New: Episode Story/Description
  duration?: string; // Changed to string to support "45:30" format
  progress: number; // percentage
  servers: Server[];
  isLastEpisode?: boolean;
  virtual_path?: string;
}

export interface Season {
  id: number;
  seasonNumber: number;
  title?: string;
  episodes: Episode[];
  poster?: string; // New: Season specific poster
  backdrop?: string; // New: Season specific backdrop
  horizontalPoster?: string; // New: Season specific horizontal poster
  logoUrl?: string; // New: Season specific logo (transparent)
  trailerUrl?: string; // New: Season specific trailer URL (Optional)
  releaseYear?: number; // New: Optional release year for the season
  description?: string; // New: Optional description/plot for the season
  cast?: string[]; // New: Optional cast specific to the season
  isUpcoming?: boolean; // New: Mark season as upcoming
  
  // Mobile Specifics
  mobileImageUrl?: string; // Optional custom image for mobile (Portrait/Custom Crop)
  useCustomMobileImage?: boolean; // Toggle to use the custom image
  enableMobileCrop?: boolean; // New: Toggle for mobile customization
  mobileCropPosition?: number; // Legacy X
  mobileCropPositionX?: number; // 0-100 percentage X
  mobileCropPositionY?: number; // 0-100 percentage Y
}

export interface Content {
  id: string;
  tmdbId?: string; // FIX: Added missing tmdbId property
  title: string;
  description: string;
  type: ContentType;
  virtual_path?: string;
  poster: string;
  backdrop: string;
  top10Poster?: string; // Added top10Poster to fix type errors in ContentCard and ContentEditModal
  horizontalPoster?: string; // New: Horizontal/Landscape Poster for specific carousels
  mobileBackdropUrl?: string; // New: Specific vertical background for mobile
  rating: number; // out of 5
  ageRating: string;
  categories: Category[];
  genres: Genre[];
  releaseYear: number;
  cast: string[];
  director?: string; // FIX: Sync with root types
  writer?: string;   // FIX: Sync with root types
  bannerNote?: string;
  seasons?: Season[];
  servers?: Server[]; // For movies
  releaseDate?: string; // For upcoming content, e.g., '2026-03-01'
  visibility: 'general' | 'adults' | 'kids'; // Replaces isKidsSafe
  createdAt: string;
  updatedAt?: string;
  logoUrl?: string; // New: URL for the title logo image
  isLogoEnabled?: boolean; // New: Toggle to show logo instead of text
  trailerUrl?: string; // New: YouTube Trailer URL for Hero Background
  duration?: string; // New: Movie duration (e.g., "1h 30m")
  enableMobileCrop?: boolean; // New: Toggle for mobile image cropping
  mobileCropPosition?: number; // Legacy X
  mobileCropPositionX?: number; // New: Percentage (0-100) X
  mobileCropPositionY?: number; // New: Percentage (0-100) Y
  slug?: string; // New: SEO friendly URL slug
  autoLinkConfig?: AutoLinkConfig;
  dynamicLinkConfig?: DynamicLinkConfig;
  relatedContentIds?: string[];
}

export interface LinkDomainGroup {
  id: string;
  name: string;
  baseUrl: string;
}

export interface DynamicLinkConfig {
  enabled: boolean;
  groupId: string;
  servers: {
    id: number;
    name: string;
    path: string;
    suffix?: string;
    includeDownload?: boolean;
    active: boolean;
  }[];
}

export interface AutoLinkConfig {
  serverId: string;
  seriesSlug: string;
  suffix: string;
  padZero: boolean;
  padTwoZeros: boolean;
}

export interface GlobalServer {
  id: string;
  name: string;
  baseDomain: string;
  createdAt?: string;
}

export interface PinnedItem {
  contentId: string;
  bannerNote?: string;
}

export type PageKey = 'home' | 'movies' | 'series' | 'kids' | 'ramadan' | 'soon';

export type PinnedContentState = Record<PageKey, PinnedItem[]>;
export type Top10State = Record<PageKey, PinnedItem[]>;

export interface CarouselRow {
  id: string;
  title: string;
  contentIds: string[];
  isNew?: boolean; // To identify the "أحدث الإضافات" carousel
  showRanking?: boolean; // New: Flag to show ranking badges
}

export interface WatchHistoryItem {
  contentId: string;
  seasonId?: number;
  episodeId?: number;
  watchedAt: string; // ISO String
}

export const UserRole = {
  Guest: 'guest',
  User: 'user',
  Admin: 'admin'
} as const;

export type UserRole = typeof UserRole[keyof typeof UserRole];

export interface Profile {
  id: number;
  name: string;
  avatar: string;
  watchHistory: WatchHistoryItem[];
  myList: string[]; // Array of content IDs
  isKid: boolean;
}

export interface User {
  id: string;
  firstName?: string;
  lastName?: string;
  email: string;
  password?: string; // In a real app, this would be a hash
  role: UserRole;
  profiles: Profile[];
  fcmTokens?: string[]; // For notifications
}

export const adPlacements = [
  'home-top',
  'home-below-hero',
  'home-middle',
  'home-carousel-3-4',
  'home-bottom', 
  'listing-top', 
  'listing-sidebar', 
  'listing-bottom', 
  'watch-top',
  'watch-preroll',
  'watch-below-player', 
  'watch-sidebar',
  'watch-above-recommendations', 
  'watch-bottom',
  'movies-page',
  'series-page',
  'ramadan-page',
  'soon-page',
  'kids-top',
  'kids-bottom',
  'ramadan-top',
  'ramadan-bottom',
  'soon-page-top',
  'soon-page-bottom',
  'global-popunder',
  'global-social-bar', 
  'global-sticky-footer',
  'global_head',
  'details_sidebar',
  'player_overlay',
  'player_bottom',
  // NEW POSITIONS
  'action_download',
  'action_next_episode',
  'page_movies_top',
  'page_series_top',
  'page_kids_top',
  'page_ramadan_top'
] as const;

export type AdPlacement = typeof adPlacements[number];

export const adPlacementLabels: Record<AdPlacement, string> = {
    'home-top': 'الرئيسية - أعلى القائمة',
    'home-below-hero': 'الرئيسية - أسفل الهيرو (Hero)',
    'home-middle': 'الرئيسية - منتصف الصفحة',
    'home-carousel-3-4': 'الرئيسية - بين القسم 3 و 4',
    'home-bottom': 'الرئيسية - أسفل الصفحة',
    'listing-top': 'القوائم (عام) - أعلى',
    'listing-sidebar': 'القوائم (عام) - شريط جانبي (ديسكتوب)',
    'listing-bottom': 'القوائم (عام) - أسفل الصفحة',
    'watch-top': 'المشاهدة - أعلى المشغل',
    'watch-preroll': 'المشاهدة - قبل الفيديو (Pre-roll)',
    'watch-below-player': 'المشاهدة - أسفل المشغل مباشرة',
    'watch-sidebar': 'المشاهدة - الشريط الجانبي',
    'watch-above-recommendations': 'المشاهدة - قبل التوصيات',
    'watch-bottom': 'المشاهدة - أسفل الصفحة',
    'movies-page': 'صفحة الأفلام - وسط',
    'series-page': 'صفحة المسلسلات - وسط',
    'ramadan-page': 'صفحة رمضان - وسط',
    'soon-page': 'صفحة قريباً - وسط',
    'kids-top': 'صفحة الأطفال - أعلى',
    'kids-bottom': 'صفحة الأطفال - أسفل',
    'ramadan-top': 'صفحة رمضان - أعلى',
    'ramadan-bottom': 'صفحة رمضان - أسفل',
    'soon-page-top': 'صفحة قريباً - أعلى',
    'soon-page-bottom': 'صفحة قريباً - أسفل',
    'global-popunder': 'إعلان منبثق (Popunder)',
    'global-social-bar': 'شريط عائم (Social Bar)',
    'global-sticky-footer': 'ثابت أسفل الشاشة (Sticky Footer)',
    'global_head': 'سكربتات عامة (Head)',
    'details_sidebar': 'التفاصيل - شريط جانبي',
    'player_overlay': 'المشغل - طبقة شفافة (Overlay)',
    'player_bottom': 'المشغل - أسفل الفيديو',
    // NEW LABELS
    'action_download': 'إجراء - عند التحميل (Wait Timer)',
    'action_next_episode': 'إجراء - الحلقة التالية (Wait Timer)',
    'page_movies_top': 'صفحة الأفلام - بانر علوي',
    'page_series_top': 'صفحة المسلسلات - بانر علوي',
    'page_kids_top': 'صفحة الأطفال - بانر علوي',
    'page_ramadan_top': 'صفحة رمضان - بانر علوي',
};

// NEW: Device Targeting Type
export type DeviceTarget = 'all' | 'mobile' | 'desktop';

// NEW: Smart Popunder Triggers
export type TriggerTarget = 'all' | 'watch-now' | 'play-button' | 'download-button' | 'server-select' | 'navigation';

export const triggerTargetLabels: Record<TriggerTarget, string> = {
    'all': 'في كل مكان (Global Click)',
    'watch-now': 'زر "شاهد الآن" (Watch Now Button)',
    'play-button': 'مشغل الفيديو (Play Button)',
    'download-button': 'زر التحميل (Download Button)',
    'server-select': 'اختيار السيرفر (Server Selection)',
    'navigation': 'القوائم (Navigation Links)'
};

// CSS Selectors Mapping for the Engine
export const triggerSelectors: Record<TriggerTarget, string> = {
    'all': 'body',
    'watch-now': '.target-watch-btn',
    'play-button': '.video-player-wrapper',
    'download-button': '.target-download-btn',
    'server-select': '.target-server-btn',
    'navigation': '.target-nav-link'
};

export type AdType = 'banner' | 'code';
export type AdPosition = AdPlacement; // Alias for backward compatibility

export interface Ad {
  id: string;
  title: string;
  code?: string; // HTML/JS code - OPTIONAL for Banner ads
  // Re-adding banner props for backward/forward compatibility with new system requests
  imageUrl?: string;
  destinationUrl?: string;
  scriptCode?: string; // Alternate for 'code' in some contexts, unifying to 'code' is better but keeping consistent
  type?: AdType; // Optional in old schema, mandatory in new, handled via defaults
  
  placement: AdPlacement;
  position?: AdPlacement; // Alias for placement
  status: 'active' | 'disabled';
  isActive?: boolean; // Alias for status
  
  targetDevice: DeviceTarget;
  triggerTarget?: TriggerTarget; 
  
  timerDuration?: number; // New: Duration in seconds for action ads
  
  updatedAt: string; // ISO String
}


export interface ShoutBar {
  text: string;
  isVisible: boolean;
}

export interface SocialLinks {
  facebook: string;
  instagram: string;
  twitter: string;
  facebookGroup: string;
  contactUs: string;
}

export type ThemeType = 'default' | 'ramadan' | 'ios' | 'night-city' | 'nature' | 'eid' | 'cosmic-teal' | 'netflix-red' | 'shahid';

export interface SiteSettings {
    shoutBar: ShoutBar;
    socialLinks: SocialLinks;
    countdownDate: string;
    adsEnabled: boolean;
    privacyPolicy: string;
    copyrightPolicy: string; 
    isCountdownVisible: boolean;
    isRamadanModeEnabled: boolean; 
    activeTheme: ThemeType; 
    isShowRamadanCarousel: boolean; 
    is_maintenance_mode_enabled: boolean;
    showTop10Home: boolean;
    showTop10Movies: boolean;
    showTop10Series: boolean;
    serviceAccountJson?: string; // Replaced fcmServerKey with this
}

// New Interface for Content Requests
export interface ContentRequest {
    id: string;
    title: string;
    type: 'movie' | 'series';
    notes?: string;
    userId?: string | null; // Allow null
    status: 'pending' | 'completed';
    createdAt: string; // ISO String
}

// Types for Gemini Service (AI Dashboard)
export const MediaType = {
  MOVIE: 'movie',
  SERIES: 'series',
} as const;

export type MediaType = typeof MediaType[keyof typeof MediaType];

export interface MediaItem {
  id: string;
  title: string;
  description: string;
  type: MediaType | string;
  rating: number;
  year: number;
  genre: string[];
  imageUrl: string;
  backdropUrl: string;
  isVip: boolean;
}

export interface CategorySection {
  title: string;
  items: MediaItem[];
}

// --- New Types for Dynamic Home Sections ---
export type SectionDisplayType = 'vertical_poster' | 'horizontal_card' | 'hybrid';
export type SectionContentType = 'automatic' | 'manual';
export type SectionSourceType = 'latest' | 'top_rated' | 'most_viewed' | 'by_genre';
export type SectionPageLocation = 'home' | 'movies' | 'series' | 'kids' | 'ramadan' | 'soon';

export interface HomeSection {
  id: string;
  title: string;
  isVisible: boolean;
  positionIndex: number;
  pageLocation: SectionPageLocation;
  displayType: SectionDisplayType;
  contentType: SectionContentType;
  sourceType?: SectionSourceType; // For automatic
  itemLimit?: number;
  selectedContentIds?: string[]; // For manual
  filterGenre?: string[]; // For automatic by genre
  filterType?: string; // 'movie' | 'series' (optional filter)
  showRanking?: boolean;
  createdAt?: string;
  updatedAt?: string;
}
