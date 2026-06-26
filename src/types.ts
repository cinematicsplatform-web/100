
export const ContentType = {
  Movie: 'movie',
  Series: 'series',
  Program: 'program',
  Concert: 'concert',
  Play: 'play',
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
  'حفلات',
  'مسرحيات',
] as const;

export type Category = typeof categories[number];

export const genres = [
    'أكشن', 'مغامرة', 'تشويق', 'جريمة', 'غموض', 'إثارة', 'دراما', 'اجتماعي', 'رومانسي', 
    'كوميديا', 'رعب', 'خيال علمي', 'فانتازيا', 'تاريخي', 'سيرة ذاتية', 'حربي', 
    'عائلي', 'أطفال', 'وثائقي', 'موسيقي',
] as const;

export type Genre = typeof genres[number];

export type View = 'home' | 'movies' | 'series' | 'programs' | 'kids' | 'ramadan' | 'soon' | 'detail' | 'watch' | 'admin' | 'login' | 'register' | 'profileSelector' | 'accountSettings' | 'privacy' | 'copyright' | 'about' | 'myList' | 'category' | 'profileHub' | 'maintenance' | 'search' | 'welcome' | 'onboarding' | 'notifications' | 'appDownload' | 'people' | 'personProfile' | 'download' | 'adGate' | 'contentRequest';

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
  thumbnail?: string; 
  description?: string; 
  duration?: string; 
  progress: number; 
  servers: Server[];
  isLastEpisode?: boolean;
  badgeText?: string; 
  // حقول الجدولة الجديدة
  isScheduled?: boolean;
  scheduledAt?: string;
  notifyOnPublish?: boolean;
  virtual_path?: string;
  telegramOriginalUrl?: string;
}

export interface Season {
  id: number;
  seasonNumber: number;
  title?: string;
  episodes: Episode[];
  poster?: string; 
  backdrop?: string; 
  horizontalPoster?: string; 
  logoUrl?: string; 
  trailerUrl?: string; 
  releaseYear?: number; 
  description?: string; 
  cast?: string[]; 
  adLink?: string; 
  isUpcoming?: boolean; 
  status?: string;
  flipBackdrop?: boolean; 
  
  mobileImageUrl?: string; 
  useCustomMobileImage?: boolean; 
  enableMobileCrop?: boolean; 
  mobileCropPosition?: number; 
  mobileCropPositionX?: number; 
  mobileCropPositionY?: number; 
}

export interface Content {
  id: string;
  tmdbId?: string; 
  title: string;
  description: string;
  type: ContentType;
  virtual_path?: string;
  poster: string;
  backdrop: string;
  top10Poster?: string; 
  horizontalPoster?: string; 
  mobileBackdropUrl?: string; 
  rating: number; 
  ageRating: string;
  categories: Category[];
  genres: Genre[];
  releaseYear: number;
  cast: string[];
  director?: string;
  writer?: string;
  bannerNote?: string;
  seasons?: Season[];
  servers?: Server[]; 
  releaseDate?: string; 
  visibility: 'general' | 'adults' | 'kids'; 
  createdAt: string;
  updatedAt?: string;
  scheduledAt?: string; // موعد النشر المجدول (ISO String)
  isScheduled?: boolean; // هل العمل مجدول؟
  notifyOnPublish?: boolean; // هل نرسل إشعار عند النشر؟
  logoUrl?: string; 
  isLogoEnabled?: boolean; 
  trailerUrl?: string; 
  duration?: string; 
  enableMobileCrop?: boolean; 
  mobileCropPosition?: number; 
  mobileCropPositionX?: number; 
  mobileCropPositionY?: number; 
  slug?: string; 
  isUpcoming?: boolean; 
  flipBackdrop?: boolean; 
  views?: number;
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

export interface Person {
  id: string;
  name: string;
  normalizedName: string;
  tmdbId?: string;
  image?: string;
  biography?: string;
  role: 'actor' | 'director' | 'writer' | 'crew';
  birthday?: string;
  placeOfBirth?: string;
  updatedAt: string;
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  body: string;
  type: 'info' | 'play' | 'alert' | 'new_content';
  isRead: boolean;
  createdAt: string;
  targetUrl?: string;
  imageUrl?: string;
  broadcastId?: string;
}

export interface BroadcastNotification {
  id: string;
  title: string;
  body: string;
  type: 'info' | 'play' | 'alert' | 'new_content';
  imageUrl?: string;
  targetUrl?: string;
  createdAt: string;
  recipientCount: number;
}

export interface PinnedItem {
  contentId: string;
  bannerNote?: string;
}

export type PageKey = 'home' | 'movies' | 'series' | 'kids' | 'ramadan' | 'soon';

export interface StoryMediaItem {
  url: string;
  mediaType: 'video' | 'image';
  ctaText?: string;   
  targetUrl?: string; 
}

export interface Story {
  id: string;
  title: string;
  thumbnailUrl: string;
  mediaItems: StoryMediaItem[];
  isActive: boolean;
  createdAt: string;
}

export type PinnedContentState = Record<PageKey, PinnedItem[]>;
export type Top10State = Record<PageKey, PinnedItem[]>;

export interface CarouselRow {
  id: string;
  title: string;
  contentIds: string[];
  isNew?: boolean; 
  showRanking?: boolean; 
}

export interface WatchHistoryItem {
  contentId: string;
  seasonId?: number;
  episodeId?: number;
  watchedAt: string; 
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
  myList: string[]; 
  isKid: boolean;
}

export interface User {
  id: string;
  firstName?: string;
  lastName?: string;
  email: string;
  password?: string; 
  role: UserRole;
  profiles: Profile[];
  fcmTokens?: string[]; 
  setupCompleted?: boolean;
}

export const adPlacements = [
  'home-top', 'home-below-hero', 'home-middle', 'home-carousel-3-4', 'home-bottom', 
  'listing-top', 'listing-sidebar', 'listing-bottom', 'watch-top', 'watch-preroll',
  'watch-below-player', 'watch-sidebar', 'watch-above-recommendations', 'watch-bottom',
  'movies-page', 'series-page', 'ramadan-page', 'soon-page', 'kids-top', 'kids-bottom',
  'ramadan-top', 'ramadan-bottom', 'soon-page-top', 'soon-page-bottom', 'global-popunder',
  'global-social-bar', 'global-sticky-footer', 'global_head', 'details_sidebar',
  'player_overlay', 'player_bottom', 'action_download', 'action_next_episode',
  'page_movies_top', 'page_series_top', 'page_kids_top', 'page_ramadan_top',
  // NEW PLACEMENTS
  'search-top', 'search-bottom', 'category-top', 'category-bottom', 'category-sidebar',
  'person-profile-top', 'person-profile-bottom', 'notifications-top', 'notifications-bottom',
  'profile-hub-top', 'profile-hub-bottom', 'account-settings-top', 'about-page-top',
  'privacy-page-top', 'copyright-page-top', 'download-page-top', 'download-page-bottom'
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
    'action_download': 'إجراء - عند التحميل (Wait Timer)',
    'action_next_episode': 'إجراء - الحلقة التالية (Wait Timer)',
    'page_movies_top': 'صفحة الأفلام - بانر علوي',
    'page_series_top': 'صفحة المسلسلات - بانر علوي',
    'page_kids_top': 'صفحة الأطفال - بانر علوي',
    'page_ramadan_top': 'صفحة رمضان - بانر علوي',
    // NEW LABELS
    'search-top': 'البحث - أعلى النتائج',
    'search-bottom': 'البحث - أسفل النتائج',
    'category-top': 'الأقسام - أعلى الشبكة',
    'category-bottom': 'الأقسام - أسفل الشبكة',
    'category-sidebar': 'الأقسام - شريط جانبي',
    'person-profile-top': 'صفحة الفنان - أعلى',
    'person-profile-bottom': 'صفحة الفنان - أسفل',
    'notifications-top': 'الإشعارات - أعلى',
    'notifications-bottom': 'الإشعارات - أسفل',
    'profile-hub-top': 'الملف الشخصي - أعلى',
    'profile-hub-bottom': 'الملف الشخصي - أسفل',
    'account-settings-top': 'الإعدادات - أعلى',
    'about-page-top': 'من نحن - أعلى',
    'privacy-page-top': 'الخصوصية - أعلى',
    'copyright-page-top': 'حقوق الملكية - أعلى',
    'download-page-top': 'التحميل - أعلى',
    'download-page-bottom': 'التحميل - أسفل',
};

export type DeviceTarget = 'all' | 'mobile' | 'desktop';
export type TriggerTarget = 'all' | 'watch-now' | 'play-button' | 'download-button' | 'server-select' | 'navigation';

export const triggerTargetLabels: Record<TriggerTarget, string> = {
    'all': 'في كل مكان (Global Click)',
    'watch-now': 'زر "شاهد الآن" (Watch Now Button)',
    'play-button': 'مشغل الفيديو (Play Button)',
    'download-button': 'زر التحميل (Download Button)',
    'server-select': 'اختيار السيرفر (Server Selection)',
    'navigation': 'القوائم (Navigation Links)'
};

export const triggerSelectors: Record<TriggerTarget, string> = {
    'all': 'body',
    'watch-now': '.target-watch-btn',
    'play-button': '.video-player-wrapper',
    'download-button': '.target-download-btn',
    'server-select': '.target-server-btn',
    'navigation': '.target-nav-link'
};

export type AdType = 'banner' | 'code';
export type AdPosition = AdPlacement;

export interface Ad {
  id: string;
  title: string;
  code?: string;
  imageUrl?: string;
  destinationUrl?: string;
  scriptCode?: string;
  type?: AdType;
  placement: AdPlacement;
  position?: AdPlacement;
  status: 'active' | 'disabled';
  isActive?: boolean;
  targetDevice: DeviceTarget;
  triggerTarget?: TriggerTarget; 
  timerDuration?: number; 
  updatedAt: string; 
  isGlobal?: boolean; // New: Global fallback property
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

export interface AppReview {
  id: string;
  user: string;
  date: string;
  rating: number;
  text: string;
}

export interface AppConfig {
  apkUrl: string;
  appSize: string;
  version: string;
  heroImage?: string;
  screenshots: string[];
  reviews: AppReview[];
}

export interface PromotionalBannerItem {
    title: string;
    description?: string;
    thumbnail: string;
    duration: string;
    videoUrl: string;
}

export interface PromotionalBanner {
    id: string;
    targetPage: string;
    positionIndex: number;
    targetCarousel?: string;
    title: string;
    subtitle: string;
    contentId?: string;
    bannerType?: string;
    logoUrl?: string;
    backgroundImage: string;
    items: PromotionalBannerItem[];
    isActive: boolean;
}

export interface StartupAd {
  id: string;
  name: string;
  imageUrlPc: string;
  imageUrlMobile: string;
  linkType: 'content' | 'external' | 'none';
  targetContentId?: string;
  externalUrl?: string;
  isActive: boolean;
  updatedAt: string;
}

export interface SiteSettings {
    shoutBar: ShoutBar;
    socialLinks: SocialLinks;
    countdownDate: string;
    adsEnabled: boolean;
    startupAd?: StartupAd; // keep for backward compatibility temporarily
    startupAds?: StartupAd[];
    isAdsGateEnabled: boolean; 
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
    showTop10Ramadan: boolean;
    showTop10Kids: boolean;
    showTop10Articles: boolean;
    showTop10Users: boolean;
    serviceAccountJson?: string; 
    apkUrl?: string;
    appConfig?: AppConfig;
}

export interface ContentRequest {
    id: string;
    title: string;
    type: 'movie' | 'series';
    notes?: string;
    userId?: string | null; 
    status: 'pending' | 'completed';
    createdAt: string; 
}

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
  sourceType?: SectionSourceType; 
  itemLimit?: number;
  selectedContentIds?: string[]; 
  filterGenre?: string[]; 
  filterType?: string; 
  showRanking?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface ReleaseSource {
  name: string;
  url: string;
}

export type ReleasePriority = 'low' | 'medium' | 'high' | 'hot';
export type ReleaseStatus = 'ongoing' | 'hiatus' | 'finished' | 'upcoming';

export interface ReleaseSchedule {
  id: string;
  seriesId?: string;
  seriesName: string;
  poster: string;
  daysOfWeek: number[]; 
  time: string; // "HH:mm"
  sources: ReleaseSource[];
  isActive: boolean;
  lastAddedAt: string | null;
  priority: ReleasePriority; 
  status: ReleaseStatus; 
  releaseYear?: number; 
  nextEpisodeNumber?: number; 
  internalNotes?: string; 
}
