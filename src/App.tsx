import React, { useState, useCallback, useEffect, useLayoutEffect, useRef, Suspense } from 'react';
import firebase from 'firebase/compat/app';
import 'firebase/compat/auth';
import { db, auth, googleProvider, getUserProfile, updateUserProfileInFirestore, createUserProfileInFirestore, deleteUserFromFirestore, getSiteSettings, getAds, getUsers, updateSiteSettings as updateSiteSettingsInDb, addAd, updateAd, deleteAd, getPinnedContent, updatePinnedContentForPage, getTop10Content, updateTop10ContentForPage, requestNotificationPermission, getAllContent, getStories, getUserNotifications, getPeople, getPromotionalBanners } from './firebase'; 
import type { Content, User, Profile, Ad, PinnedItem, SiteSettings, View, PinnedContentState, Top10State, PageKey, Story, Notification, Person, LoginError, StartupAd, PromotionalBanner } from './types';
import { UserRole, triggerSelectors, ContentType } from './types';
import { initialSiteSettings, defaultAvatar, pinnedContentData as initialPinned, top10ContentData as initialTop10, femaleAvatars } from './data';

import Header from './components/Header';
import Footer from './components/Footer';
import BottomNavigation from './components/BottomNavigation';
import TvSidebar from './components/TvSidebar';
import PWAInstallPrompt from './components/PWAInstallPrompt';
import AdPlacement from './components/AdPlacement';
import AdZone from './components/AdZone'; 
import RequestContentModal from './components/RequestContentModal';
import { BouncingDotsLoader } from './components/BouncingDotsLoader';

import StartupAdModal from './components/StartupAdModal';

const DetailPage = React.lazy(() => import('./components/DetailPage'));
const LoginModal = React.lazy(() => import('./components/LoginModal'));
const AdminPanel = React.lazy(() => import('./components/AdminPanel'));
const CreateAccountPage = React.lazy(() => import('./components/CreateAccountPage'));
const OnboardingPage = React.lazy(() => import('./components/OnboardingPage'));
const MoviesPage = React.lazy(() => import('./components/MoviesPage'));
const SeriesPage = React.lazy(() => import('./components/SeriesPage'));
const ProgramsPage = React.lazy(() => import('./components/ProgramsPage')); 
const ProfileSelector = React.lazy(() => import('./components/ProfileSelector'));
const AccountSettingsPage = React.lazy(() => import('./components/AccountSettingsPage'));
const KidsPage = React.lazy(() => import('./components/KidsPage'));
const RamadanPage = React.lazy(() => import('./components/RamadanPage'));
const SoonPage = React.lazy(() => import('./components/SoonPage'));
const PrivacyPolicyPage = React.lazy(() => import('./components/PrivacyPolicyPage'));
const CopyrightPage = React.lazy(() => import('./components/CopyrightPage'));
const AboutPage = React.lazy(() => import('./components/AboutPage'));
const MyListPage = React.lazy(() => import('./components/MyListPage'));
const HomePage = React.lazy(() => import('./components/HomePage'));
const CategoryPage = React.lazy(() => import('./components/CategoryPage')); 
const ProfileHubPage = React.lazy(() => import('./components/ProfileHubPage'));
const MaintenancePage = React.lazy(() => import('./components/MaintenancePage'));
const EpisodeWatchPage = React.lazy(() => import('./components/EpisodeWatchPage'));
const SearchPage = React.lazy(() => import('./components/SearchPage'));
const WelcomePage = React.lazy(() => import('./components/WelcomePage'));
const NotificationsPage = React.lazy(() => import('./components/NotificationsPage'));
const AppPage = React.lazy(() => import('./pages/AppPage'));
const PeoplePage = React.lazy(() => import('./pages/PeoplePage'));
const PersonProfilePage = React.lazy(() => import('./pages/PersonProfilePage'));
const DownloadPage = React.lazy(() => import('./pages/DownloadPage'));
const AdGatePage = React.lazy(() => import('./components/AdGatePage'));
const ContentRequestPage = React.lazy(() => import('./pages/ContentRequestPage'));

const CheckCircleIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 1 1-18 0 9 9 0 0 1 18 0z" />
  </svg>
);

const ExclamationCircleIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9-3.75h.008v.008H12V8.25Z" />
  </svg>
);

interface Toast {
  id: number;
  message: string;
  type: 'success' | 'error' | 'info';
}

const VIEW_PATHS: Record<string, View> = {
    '/': 'home',
    '/movies': 'movies',
    '/series': 'series',
    '/programs': 'programs',
    '/kids': 'kids',
    '/ramadan': 'ramadan',
    '/soon': 'soon',
    '/newly-added': 'category',
    '/top-10': 'category',
    '/admin': 'admin',
    '/login': 'login',
    '/register': 'register',
    '/onboarding': 'onboarding',
    '/mylist': 'myList',
    '/account': 'accountSettings',
    '/profile': 'profileHub',
    '/privacy': 'privacy',
    '/copyright': 'copyright',
    '/about': 'about',
    '/maintenance': 'maintenance',
    '/search': 'search',
    '/welcome': 'welcome',
    '/notifications': 'notifications',
    '/app-download': 'appDownload',
    '/install-app': 'appDownload',
    '/people': 'people',
    '/person': 'personProfile',
    '/ad-gate': 'adGate',
    '/request': 'contentRequest',
    '/download': 'download'
};

const REVERSE_VIEW_PATHS: Record<string, string> = {
    'home': '/',
    'movies': '/movies',
    'series': '/series',
    'programs': '/programs',
    'kids': '/kids',
    'ramadan': '/ramadan',
    'soon': '/soon',
    'admin': '/admin',
    'login': '/login',
    'register': '/register',
    'onboarding': '/onboarding',
    'myList': '/mylist',
    'accountSettings': '/account',
    'profileHub': '/profile',
    'privacy': '/privacy',
    'copyright': '/copyright',
    'about': '/about',
    'detail': '/detail', 
    'profileSelector': '/profiles',
    'category': '/category',
    'maintenance': '/maintenance',
    'search': '/search',
    'welcome': '/welcome',
    'notifications': '/notifications',
    'appDownload': '/app-download',
    'people': '/people',
    'personProfile': '/person',
    'download': '/download',
    'adGate': '/ad-gate',
    'contentRequest': '/request'
};

const safeHistoryPush = (path: string) => {
    try {
        if (window.location.protocol === 'blob:') return;
        if (window.location.protocol !== 'file:' && window.location.origin !== 'null') {
             window.history.pushState({}, '', path);
        }
    } catch (e) {}
};

const safeHistoryReplace = (path: string) => {
    try {
        if (window.location.protocol === 'blob:') return;
        if (window.location.protocol !== 'file:' && window.location.origin !== 'null') {
            window.history.replaceState({}, '', path);
        }
    } catch (e) {}
};

const getSavedScrollPosition = (path: string) => {
    try {
        const saved = sessionStorage.getItem(`scroll_${path}`);
        return saved ? parseInt(saved, 10) : undefined;
    } catch (e) {
        return undefined;
    }
};

const saveScrollPosition = (path: string, position: number) => {
    try {
        sessionStorage.setItem(`scroll_${path}`, position.toString());
    } catch (e) {}
};

const App: React.FC = () => {
  
  const getInitialView = (): View => {
      const path = decodeURIComponent(window.location.pathname);
      const normalizedPath = path.length > 1 && path.endsWith('/') ? path.slice(0, -1) : path;
      
      if (VIEW_PATHS[normalizedPath]) return VIEW_PATHS[normalizedPath];
      if (normalizedPath.startsWith('/category/')) return 'category';
      if (normalizedPath.startsWith('/person/')) return 'personProfile';
      
      const isEpisodicWatch = normalizedPath.match(/^\/(?:watch|مشاهدة)\/.*?\/(?:الموسم|season)?\d+.*?\/(?:الحلقة|episode)?\d+/);
      if (isEpisodicWatch) return 'watch';

      if (normalizedPath.match(/^\/(?:watch|مشاهدة)\/(?:movie|فيلم)\//) || 
          normalizedPath.match(/^\/(?:series|program|مسلسل|برنامج|movie|فيلم|play|concert|watch|مشاهدة)\/([^\/]+)/)) {
          return 'detail';
      }
      
      return 'home';
  };

  const [view, setView] = useState<View>(getInitialView);
  const isPopStateRef = useRef(false);
  const historyStack = useRef<string[]>([window.location.pathname]);
  const prevViewRef = useRef<View>(getInitialView());
  const prevContentIdRef = useRef<string | undefined>(undefined);
  const pushHistory = useCallback((path: string) => {
      saveScrollPosition(window.location.pathname, window.scrollY);
      historyStack.current.push(path);
      safeHistoryPush(path);
  }, []);

  const handleGoBack = useCallback((fallbackView: View) => {
      saveScrollPosition(window.location.pathname, window.scrollY);
      if (historyStack.current.length > 1) {
          window.history.back();
      } else {
          handleSetView(fallbackView);
      }
  }, []);

  const [returnView, setReturnView] = useState<View>('home');
  const [selectedCategory, setSelectedCategory] = useState<string>(() => {
      const path = decodeURIComponent(window.location.pathname);
      if (path.startsWith('/category/')) return path.split('/category/')[1];
      if (path === '/newly-added') return 'newly-added';
      if (path === '/top-10') return 'top-10';
      return '';
  });

  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [activeProfile, setActiveProfile] = useState<Profile | null>(null);
  const [selectedContent, setSelectedContent] = useState<Content | null>(null);
  const [selectedPersonName, setSelectedPersonName] = useState<string>(() => {
      const path = decodeURIComponent(window.location.pathname);
      if (path.startsWith('/person/')) return path.split('/person/')[1];
      return '';
  });

  const [isSearchOpen, setIsSearchOpen] = useState(false);

  const [watchParams, setWatchParams] = useState<{ season: number, episode: number } | null>(null);
  const [detailParams, setDetailParams] = useState<{ seasonNumber: number } | null>(null);
  const [downloadParams, setDownloadParams] = useState<{ season?: number, episode?: number } | null>(null);
  
  const [adGateTarget, setAdGateTarget] = useState<{ view: View; content: Content; params?: any } | null>(null);

  const [authPrefillEmail, setAuthPrefillEmail] = useState('');

  const [allContent, setAllContent] = useState<Content[]>([]);
  const [people, setPeople] = useState<Person[]>([]);
  const [pinnedItems, setPinnedItems] = useState<PinnedContentState>(initialPinned);
  const [top10Items, setTop10Items] = useState<Top10State>(initialTop10);
  const [allStories, setAllStories] = useState<Story[]>([]);
  const [promoBanners, setPromoBanners] = useState<PromotionalBanner[]>([]);
  const [unreadNotificationsCount, setUnreadNotificationsCount] = useState(0);
  
  const [isTv, setIsTv] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  const [siteSettings, setSiteSettings] = useState<SiteSettings>(() => {
      let settings = initialSiteSettings;
      try {
          const savedTheme = localStorage.getItem('cinematix_active_theme');
          if (savedTheme) settings = { ...settings, activeTheme: savedTheme as any };
      } catch (e) {}
      return settings;
  });

  const [ads, setAds] = useState<Ad[]>([]);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [isContentLoading, setIsContentLoading] = useState(true);
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [showStartupAd, setShowStartupAd] = useState(false);
  const [activeStartupAds, setActiveStartupAds] = useState<StartupAd[]>([]);
  const [currentStartupAdIndex, setCurrentStartupAdIndex] = useState(0);

  const addToast = useCallback((message: string, type: 'success' | 'error' | 'info' = 'info') => {
    const id = Date.now() + Math.random();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 3000);
  }, []);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
      // Show startup ads only on the home page when content and auth are loaded
      if (!isContentLoading && !isAuthLoading && view === 'home' && siteSettings.startupAds && siteSettings.startupAds.length > 0) {
          const seenAdsStr = localStorage.getItem('seenStartupAds') || '[]';
          let seenAds: string[] = [];
          try {
              seenAds = JSON.parse(seenAdsStr);
          } catch (e) {}

          const activeUnseenAds = siteSettings.startupAds.filter(ad => ad.isActive && !seenAds.includes(ad.id));
          
          if (activeUnseenAds.length > 0 && activeStartupAds.length === 0) {
              const timer = setTimeout(() => {
                  setActiveStartupAds(activeUnseenAds);
                  setCurrentStartupAdIndex(0);
                  setShowStartupAd(true);
              }, 1000); // Small delay to let the app settle
              return () => clearTimeout(timer);
          }
      }
  }, [isContentLoading, isAuthLoading, view, siteSettings.startupAds]);

  useEffect(() => {
    const detectTv = () => {
        const userAgent = navigator.userAgent;
        const isSmartTV = /SmartTV|Tizen|WebOS|AppleTV|HbbTV|Roku|NetCast|BRAVIA/i.test(userAgent) || window.location.search.includes('tv=true');
        setIsTv(isSmartTV);
    };
    detectTv();
  }, []);

  useEffect(() => {
      if (activeProfile?.isKid) {
          const allowedKidsViews: View[] = ['kids', 'detail', 'watch', 'profileSelector', 'accountSettings', 'profileHub', 'myList', 'maintenance', 'search', 'download', 'adGate', 'contentRequest'];
          if (!allowedKidsViews.includes(view)) {
              setView('kids');
              safeHistoryReplace('/kids');
          }
      }
  }, [activeProfile, view]);

  const fullScreenViews = ['login', 'register', 'onboarding', 'profileSelector', 'admin', 'maintenance', 'watch', 'adGate', 'welcome'];

  useEffect(() => {
      if (!siteSettings.adsEnabled || fullScreenViews.includes(view)) return;

      const handleSmartPopunder = (e: MouseEvent) => {
          const now = Date.now();
          const userAgent = navigator.userAgent || navigator.vendor || (window as any).opera;
          const isMobileDevice = /android|iPad|iPhone|iPod/i.test(userAgent) || window.innerWidth <= 768;

          const popunderAds = ads.filter(a => {
              const isActive = a.status === 'active' || a.isActive === true;
              const matchesDevice = a.targetDevice === 'all' || (a.targetDevice === 'mobile' && isMobileDevice) || (a.targetDevice === 'desktop' && !isMobileDevice);
              const isPopunderType = a.placement === 'global-popunder' || a.triggerTarget;
              return isActive && matchesDevice && isPopunderType;
          });

          if (popunderAds.length === 0) return;

          popunderAds.forEach(ad => {
              const triggerKey = ad.triggerTarget || 'all';
              const selector = triggerSelectors[triggerKey] || 'body';
              const targetElement = (e.target as Element).closest(selector);
              
              if (targetElement) {
                  const lastRun = localStorage.getItem(`pop_last_${ad.id}`);
                  if (lastRun && (now - parseInt(lastRun) < 300000)) return; 

                  const code = (ad.code || ad.scriptCode || '').trim();
                  
                  if (ad.type === 'banner' && ad.destinationUrl) {
                      window.open(ad.destinationUrl, '_blank');
                      localStorage.setItem(`pop_last_${ad.id}`, now.toString());
                  } else if (code.startsWith('http')) {
                      window.open(code, '_blank');
                      localStorage.setItem(`pop_last_${ad.id}`, now.toString());
                  } else if (code) {
                      const div = document.createElement('div');
                      div.style.display = 'none';
                      div.className = `pop-exec-${ad.id}`;
                      try {
                          const range = document.createRange();
                          range.selectNode(document.body);
                          const fragment = range.createContextualFragment(code);
                          div.appendChild(fragment);
                          document.body.appendChild(div);
                          localStorage.setItem(`pop_last_${ad.id}`, now.toString());
                          setTimeout(() => div.remove(), 1000);
                      } catch (err) {
                          console.error("Popunder Exec Error:", err);
                      }
                  }
              }
          });
      };

      window.addEventListener('click', handleSmartPopunder, { capture: true }); 
      return () => window.removeEventListener('click', handleSmartPopunder, { capture: true });
  }, [ads, siteSettings.adsEnabled, view]);

  useEffect(() => {
      if ('scrollRestoration' in window.history) window.history.scrollRestoration = 'manual';
  }, []);

  useLayoutEffect(() => {
      const currentPath = window.location.pathname;
      const isSameContent = view === prevViewRef.current && selectedContent?.id === prevContentIdRef.current;
      
      if (isPopStateRef.current) {
          const savedPosition = getSavedScrollPosition(currentPath);
          if (savedPosition !== undefined) {
              let attempts = 0;
              const tryScroll = () => {
                  window.scrollTo({ top: savedPosition, left: 0, behavior: 'instant' as any });
                  attempts++;
                  if (window.scrollY < savedPosition - 2 && attempts < 10) {
                      setTimeout(tryScroll, 50);
                  }
              };
              tryScroll();
          } else {
              window.scrollTo({ top: 0, left: 0, behavior: 'instant' as any });
          }
          isPopStateRef.current = false;
      } else if (!isSameContent) {
          window.scrollTo({ top: 0, left: 0, behavior: 'instant' as any });
      }
      
      prevViewRef.current = view;
      prevContentIdRef.current = selectedContent?.id;
  }, [view, selectedContent?.id, selectedPersonName, selectedCategory, window.location.pathname]); 

  const resolveContentFromUrl = useCallback((path: string, contentList: Content[], currentView?: View) => {
      const decodedPath = decodeURIComponent(path);
      const normalizedPath = decodedPath.length > 1 && decodedPath.endsWith('/') ? decodedPath.slice(0, -1) : decodedPath;

      if (currentView === 'admin' || normalizedPath.startsWith('/admin')) return;

      const isStaticPath = !!VIEW_PATHS[normalizedPath] || normalizedPath === '/' || normalizedPath === '';
      if (isStaticPath) return;

      if (decodedPath.startsWith('/person/')) {
        const name = decodedPath.split('/person/')[1];
        setSelectedPersonName(name);
        setView('personProfile');
        return;
      }

      const watchMatch = decodedPath.match(/^\/(?:watch|مشاهدة)\/([^\/]+)\/(?:الموسم|season)?(\d+)\/(?:الحلقة|episode)?(\d+)/) || 
                         decodedPath.match(/^\/(?:watch|مشاهدة)\/([^\/]+)\/(\d+)\/(\d+)/);
      
      if (watchMatch) {
          const slug = watchMatch[1];
          const season = parseInt(watchMatch[2]);
          const episode = parseInt(watchMatch[3]);
          const foundContent = contentList.find(c => (c.slug === slug) || (c.id === slug));
          if (foundContent) {
              setSelectedContent(foundContent);
              setWatchParams({ season, episode });
              setView('watch');
              return;
          }
      }

      const movieWatchMatch = decodedPath.match(/^\/(?:watch|مشاهدة)\/(?:movie|فيلم|video\.movie)\/([^\/]+)/) ||
                              decodedPath.match(/^\/(?:watch|مشاهدة)\/([^\/]+)$/);
      if (movieWatchMatch) {
          const slug = movieWatchMatch[1];
          const foundContent = contentList.find(c => (c.slug === slug) || (c.id === slug));
          if (foundContent) {
              setSelectedContent(foundContent);
              setView('detail');
              return;
          }
      }

      const seriesDetailMatch = decodedPath.match(/^\/(?:series|program|مسلسل|برنامج)\/([^\/]+)\/(?:الموسم|season)?(\d+)/);
      if (seriesDetailMatch) {
          const slug = seriesDetailMatch[1];
          const season = parseInt(seriesDetailMatch[2]);
          const foundContent = contentList.find(c => (c.slug === slug) || (c.id === slug));
          if (foundContent) {
              setSelectedContent(foundContent);
              setDetailParams({ seasonNumber: season });
              setView('detail');
              return;
          }
      }

      const match = decodedPath.match(/^\/(?:series|program|مسلسل|برنامج|movie|فيلم|play|concert)\/([^\/]+)/);
      if (match && match[1]) {
          const slug = match[1];
          const foundContent = contentList.find(c => (c.slug === slug) || (c.id === slug));
          if (foundContent) {
              setSelectedContent(foundContent);
              setView('detail');
              return;
          }
      }
  }, []); 

  useEffect(() => {
      const handlePopState = () => {
          isPopStateRef.current = true;
          historyStack.current.pop();

          const newView = getInitialView();
          if (newView !== 'search') setIsSearchOpen(false); 
          
          setView(newView); 
          const path = decodeURIComponent(window.location.pathname);
          
          if (path.startsWith('/category/')) {
              setSelectedCategory(path.split('/category/')[1]);
          } else if (path.startsWith('/person/')) {
              setSelectedPersonName(path.split('/person/')[1]);
          }

          if (allContent.length > 0) {
              resolveContentFromUrl(window.location.pathname, allContent, newView);
          }
      };
      window.addEventListener('popstate', handlePopState);
      return () => window.removeEventListener('popstate', handlePopState);
  }, [allContent, resolveContentFromUrl, view]); 

  // Track scroll position continuously
  useEffect(() => {
      let timeoutId: any;
      const handleScroll = () => {
          if (timeoutId) clearTimeout(timeoutId);
          const currentPath = window.location.pathname;
          const currentScrollY = window.scrollY;
          timeoutId = setTimeout(() => {
              saveScrollPosition(currentPath, currentScrollY);
          }, 100);
      };
      window.addEventListener('scroll', handleScroll, { passive: true });
      return () => {
          window.removeEventListener('scroll', handleScroll);
          if (timeoutId) clearTimeout(timeoutId);
      };
  }, []);

  useLayoutEffect(() => {
      const root = document.documentElement;
      root.classList.remove('theme-ramadan', 'theme-ios', 'theme-night-city', 'theme-nature', 'theme-eid', 'theme-cosmic-teal', 'theme-netflix-red', 'theme-shahid');
      
      if (view === 'login' || view === 'register' || view === 'admin') {
          root.classList.add('allow-selection');
      } else {
          root.classList.remove('allow-selection');
      }

      if (view === 'admin') return;
      
      let active = siteSettings.activeTheme;

      if (active !== 'default') {
          root.classList.add(`theme-${active}`);
      }
      
      localStorage.setItem('cinematix_active_theme', active);
  }, [siteSettings.activeTheme, view]); 

  const fetchData = useCallback(async () => {
      try {
          setIsContentLoading(true);
          const [contentList, settings, adsList, pinnedData, top10Data, storiesList, peopleList, promoBannersList] = await Promise.all([
              getAllContent(currentUser?.role === UserRole.Admin),
              getSiteSettings(),
              getAds(),
              getPinnedContent(),
              getTop10Content(),
              getStories(currentUser?.role !== UserRole.Admin),
              getPeople(),
              getPromotionalBanners()
          ]);
          setAllContent(contentList);
          setPeople(peopleList);
          setPromoBanners(promoBannersList);
          setSiteSettings(prev => ({...settings, activeTheme: settings.activeTheme || 'default'}));
          setAds(adsList);
          setPinnedItems(pinnedData);
          setTop10Items(top10Data);
          setAllStories(storiesList);
      } catch (error) {
          console.error("Error fetching data", error);
      } finally {
          setIsContentLoading(false);
      }
  }, [currentUser?.role]);

   useEffect(() => {
       const hideLoader = () => {
         const preloader = document.getElementById('preloader');
         if (preloader && !preloader.classList.contains('preloader-hidden')) {
             preloader.classList.add('preloader-hidden');
             setTimeout(() => { if (preloader) preloader.style.display = 'none'; }, 500);
         }
       };
       
       const skipSplash = document.documentElement.classList.contains('hide-splash');
       const startTime = Date.now();
       const MAX_LOADER_TIME = skipSplash ? 0 : 3000; 
       const isHomePage = window.location.pathname === '/';
       
       fetchData().finally(() => { 
           const elapsedTime = Date.now() - startTime;
           const remainingTime = Math.max(0, MAX_LOADER_TIME - elapsedTime);
           setTimeout(() => { hideLoader(); }, isHomePage ? (remainingTime > 0 ? 300 : 0) : 0);
       });

       const safetyTimer = setTimeout(() => { hideLoader(); }, MAX_LOADER_TIME);
       return () => clearTimeout(safetyTimer);
   }, [fetchData]);
  
  useEffect(() => {
      if (allContent.length > 0) resolveContentFromUrl(window.location.pathname, allContent, view);
  }, [allContent, resolveContentFromUrl, view]);

  useEffect(() => {
      requestNotificationPermission();

      const unsubscribe = auth.onAuthStateChanged(async (firebaseUser) => {
          try {
              if (firebaseUser) {
                  requestNotificationPermission(firebaseUser.uid);
                  
                  const profile = await getUserProfile(firebaseUser.uid);
                  if (profile) {
                      const user: User = { 
                          id: firebaseUser.uid, 
                          email: firebaseUser.email || '', 
                          role: profile.role || UserRole.User, 
                          profiles: profile.profiles || [], 
                          firstName: profile.firstName, 
                          lastName: profile.lastName,
                          setupCompleted: profile.setupCompleted || false
                      };
                      setCurrentUser(user);

                      if (user.setupCompleted === false && user.profiles.length > 0) {
                          setActiveProfile(user.profiles[0]);
                          handleSetView('onboarding');
                      } else {
                        const savedProfileId = localStorage.getItem('cinematix_active_profile');
                        if (savedProfileId) {
                            const savedProfile = user.profiles.find(p => p.id === Number(savedProfileId));
                            if (savedProfile) setActiveProfile(savedProfile);
                        }
                      }
                      
                      if (user.role === UserRole.Admin) {
                           const usersList = await getUsers();
                           setAllUsers(usersList);
                      }

                      const notifications = await getUserNotifications(user.id);
                      setUnreadNotificationsCount(notifications.filter(n => !n.isRead).length);
                  }
              } else { 
                setCurrentUser(null); 
                setActiveProfile(null); 
                localStorage.removeItem('cinematix_active_profile'); 
                setUnreadNotificationsCount(0);
              }
          } finally { setIsAuthLoading(false); }
      });
      return () => unsubscribe();
  }, []);

  const handleSetView = (newView: View, category?: string, params?: any) => {
      const subViews: View[] = ['detail', 'watch', 'personProfile', 'download', 'category', 'search', 'login', 'register', 'welcome', 'adGate', 'contentRequest', 'about', 'privacy', 'copyright'];
      
      if (subViews.includes(newView) && !subViews.includes(view)) setReturnView(view);
      
      if (newView === 'login' && params?.email) setAuthPrefillEmail(params.email);
      else if (newView === 'login' && !params?.email) setAuthPrefillEmail('');
      
      if (newView === 'search') setIsSearchOpen(true);
      else setIsSearchOpen(false);

      setView(newView);
      if (category) setSelectedCategory(category);
      
      if (newView === 'watch' && params) {
          setWatchParams(params);
          setDetailParams(null);
          if (selectedContent) {
              const slug = selectedContent.slug || selectedContent.id;
              pushHistory(`/watch/${slug}/الموسم${params.season}/الحلقة${params.episode}`);
          }
      } else if (newView === 'download' && params) {
          setDownloadParams(params);
          if (params.content) setSelectedContent(params.content);
          const path = REVERSE_VIEW_PATHS['download'];
          if (path && window.location.pathname !== path) pushHistory(path);
      } else {
          if (newView !== 'watch' && newView !== 'download') {
              setWatchParams(null);
              setDownloadParams(null);
          }
          let path = REVERSE_VIEW_PATHS[newView];
          if (newView === 'category' && category) {
              if (category === 'newly-added') path = '/newly-added';
              else if (category === 'top-10') path = '/top-10';
              else path = `/category/${category}`;
          } else if (newView === 'personProfile' && params?.name) path = `/person/${params.name}`;
          
          if (newView === 'detail' && selectedContent) {
              const slug = selectedContent.slug || selectedContent.id;
              const type = selectedContent.type;
              const isEpisodic = type === ContentType.Series || type === ContentType.Program;
              if (!isEpisodic) path = `/watch/movie/${slug}`;
              else {
                  const sNum = params?.season || detailParams?.seasonNumber || 1;
                  path = `/${type}/${slug}/الموسم${sNum}`;
                  if (!detailParams || detailParams.seasonNumber !== sNum) setDetailParams({ seasonNumber: sNum });
              }
          } else if (newView === 'detail') setDetailParams(null);
          
          if (path && window.location.pathname !== path) pushHistory(path);
      }
  };

  const handleSelectContent = (content: Content, seasonNumber?: number, episodeNumber?: number, isSoon?: boolean) => {
      if (isSearchOpen) setIsSearchOpen(false);

      if (view !== 'detail' && view !== 'adGate') setReturnView(view);
      
      const slug = content.slug || content.id;
      const isEpisodic = content.type === ContentType.Series || content.type === ContentType.Program;

      if (isEpisodic) {
          if (episodeNumber) {
              if (siteSettings.isAdsGateEnabled) {
                  setSelectedContent(content);
                  setAdGateTarget({ view: 'watch', content, params: { season: seasonNumber || 1, episode: episodeNumber } });
                  handleSetView('adGate');
              } else {
                  setSelectedContent(content);
                  setWatchParams({ season: seasonNumber || 1, episode: episodeNumber });
                  setDetailParams(null);
                  setView('watch');
                  pushHistory(`/watch/${slug}/الموسم${seasonNumber || 1}/الحلقة${episodeNumber}`);
              }
              return;
          }

          setSelectedContent(content);
          let targetSeason = seasonNumber;
          if (!targetSeason && content.seasons && content.seasons.length > 0) {
              if (isSoon) {
                  targetSeason = [...content.seasons].sort((a, b) => b.seasonNumber - a.seasonNumber)[0].seasonNumber;
              } else {
                  const publishedSeason = [...content.seasons].filter(s => s.status !== 'coming_soon' && !s.isUpcoming).sort((a, b) => b.seasonNumber - a.seasonNumber)[0];
                  targetSeason = publishedSeason ? publishedSeason.seasonNumber : [...content.seasons].sort((a, b) => b.seasonNumber - a.seasonNumber)[0].seasonNumber;
              }
          } else if (!targetSeason) {
              targetSeason = 1;
          }
          
          setDetailParams({ seasonNumber: targetSeason });
          setView('detail');
          pushHistory(`/${content.type}/${slug}/الموسم${targetSeason}${isSoon ? '?targetSeason=upcoming' : ''}`);
      } else { 
          if (siteSettings.isAdsGateEnabled) {
              setSelectedContent(content);
              setAdGateTarget({ view: 'detail', content });
              handleSetView('adGate');
          } else {
              setSelectedContent(content);
              setDetailParams(null);
              setView('detail');
              pushHistory(`/watch/movie/${slug}`);
          }
      }
  };

  const handleAdGateDone = () => {
      if (!adGateTarget) return;
      const { view: targetView, content, params } = adGateTarget;
      setSelectedContent(content);
      if (targetView === 'watch' && params) {
          setWatchParams(params);
          setDetailParams(null);
          setView('watch');
          const slug = content.slug || content.id;
          pushHistory(`/watch/${slug}/الموسم${params.season}/الحلقة${params.episode}`);
      } else {
          setDetailParams(null);
          setView('detail');
          const slug = content.slug || content.id;
          pushHistory(`/watch/movie/${slug}`);
      }
      setAdGateTarget(null);
  };

  const handleAdGateCancel = () => {
      setAdGateTarget(null);
      handleSetView(returnView || 'home');
  };

  const handlePersonClick = (name: string) => {
    if (view !== 'personProfile') setReturnView(view);
    setSelectedPersonName(name);
    handleSetView('personProfile', undefined, { name });
  };

  const handleLogin = async (email: string, pass: string): Promise<LoginError> => {
      try { await auth.signInWithEmailAndPassword(email, pass); return 'none'; }
      catch (error: any) { return (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') ? error.code.replace('auth/', '') as any : 'userNotFound'; }
  };

  const handleGoogleLogin = async () => {
    const isSupportedProtocol = ['http:', 'https:', 'chrome-extension:'].includes(window.location.protocol);
    
    if (!isSupportedProtocol) {
      addToast('تسجيل الدخول عبر جوجل غير مدعوم في بيئة المعاينة الحالية (بروتوكول غير صالح). يرجى استخدام البريد الإلكتروني وكلمة المرور.', 'error');
      return;
    }

    try {
      setIsAuthLoading(true);
      const result = await auth.signInWithPopup(googleProvider);
      if (result.user) {
        const uid = result.user.uid;
        const profileData = await getUserProfile(uid);
        
        if (!profileData) {
          const nameParts = result.user.displayName?.split(' ') || ['User'];
          const firstName = nameParts[0];
          const lastName = nameParts.slice(1).join(' ');
          const selectedAvatar = result.user.photoURL || defaultAvatar;
          
          const defaultProfile: Profile = { 
            id: Date.now(), 
            name: result.user.displayName || 'مستخدم جوجل', 
            avatar: selectedAvatar, 
            isKid: false, 
            watchHistory: [], 
            myList: [] 
          };
          
          await createUserProfileInFirestore(uid, { 
            firstName, 
            lastName, 
            email: result.user.email || '', 
            profiles: [defaultProfile], 
            setupCompleted: true 
          });
          
          setActiveProfile(defaultProfile);
          addToast('مرحباً بك في سينماتيكس!', 'success');
        } else {
          if (profileData.profiles && profileData.profiles.length > 0) {
              const savedProfileId = localStorage.getItem('cinematix_active_profile');
              const active = profileData.profiles.find(p => String(p.id) === savedProfileId) || profileData.profiles[0];
              setActiveProfile(active);
          }
          addToast('تم تسجيل الدخول بنجاح!', 'success');
        }
        
        handleSetView('home');
      }
    } catch (error: any) {
      console.error("Google Login Error:", error);
      if (error.code === 'auth/operation-not-supported-in-this-environment') {
          addToast('بيئة التشغيل الحالية لا تدعم النوافذ المنبثقة. يرجى استخدام متصفح قياسي أو الدخول عبر البريد الإلكتروني.', 'error');
      } else if (error.code !== 'auth/popup-closed-by-user') {
          addToast('فشل تسجيل الدخول بواسطة Google.', 'error');
      }
    } finally {
      setIsAuthLoading(false);
    }
  };

  const handleRegister = async (newUser: Omit<User, 'id' | 'role' | 'profiles'> & { gender: 'male' | 'female' }): Promise<string | null> => {
      try {
          const cred = await auth.createUserWithEmailAndPassword(newUser.email, newUser.password || '');
          if (cred.user) {
               const selectedAvatar = newUser.gender === 'female' ? (femaleAvatars[1] || femaleAvatars[0]) : defaultAvatar;
               const defaultProfile: Profile = { id: Date.now(), name: newUser.firstName || 'المستخدم', avatar: selectedAvatar, isKid: false, watchHistory: [], myList: [] };
               await createUserProfileInFirestore(cred.user.uid, { firstName: newUser.firstName, lastName: newUser.lastName, email: newUser.email, profiles: [defaultProfile], setupCompleted: false });
               addToast('تم إنشاء الحساب بنجاح!', 'success');
               setActiveProfile(defaultProfile);
               handleSetView('onboarding');
               return null;
          }
          return 'unknown-error';
      } catch (error: any) { return error.code; }
  };

  const handleLogout = async () => { localStorage.removeItem('cinematix_active_profile'); await auth.signOut(); setCurrentUser(null); setActiveProfile(null); handleSetView('home'); addToast('تم تسجيل الخروج.', 'info'); };
  const handleProfileSelect = (profile: Profile) => { localStorage.setItem('cinematix_active_profile', String(profile.id)); setActiveProfile(profile); if (profile.isKid) handleSetView('kids'); else handleSetView('home'); };
  
  const handleOnboardingFinish = async (profileData: Partial<Profile>, extraData: any) => {
      if (currentUser && activeProfile) {
          const updatedProfile = { ...activeProfile, ...profileData };
          const updatedProfiles = currentUser.profiles.map(p => p.id === activeProfile.id ? updatedProfile : p);
          await updateUserProfileInFirestore(currentUser.id, { profiles: updatedProfiles, setupCompleted: true });
          setActiveProfile(updatedProfile);
          setCurrentUser(prev => prev ? { ...prev, setupCompleted: true, profiles: updatedProfiles } : null);
          addToast('تم إعداد حسابك بنجاح!', 'success');
          handleSetView('home');
      }
  };

  const handleToggleMyList = async (contentId: string) => {
      if (!currentUser || !activeProfile) { handleSetView('login'); return; }
      const currentList = activeProfile.myList || [];
      const newList = currentList.includes(contentId) ? currentList.filter(id => id !== contentId) : [...currentList, contentId];
      if (!currentList.includes(contentId)) addToast('تمت الإضافة إلى القائمة', 'success');
      const updatedProfile = { ...activeProfile, myList: newList };
      setActiveProfile(updatedProfile);
      const updatedProfiles = currentUser.profiles.map(p => p.id === activeProfile.id ? updatedProfile : p);
      setCurrentUser({ ...currentUser, profiles: updatedProfiles });
      await updateUserProfileInFirestore(currentUser.id, { profiles: updatedProfiles });
  };

  const handleUpdateSiteSettings = async (settings: SiteSettings) => {
      try { await updateSiteSettingsInDb(settings); setSiteSettings(settings); addToast('تم حفظ الإعدادات بنجاح', 'success'); } catch (e) { addToast('فشل حفظ الإعدادات', 'error'); }
  };

  const handleUpdatePinnedItems = async (pageKey: PageKey, items: PinnedItem[]) => {
      try { await updatePinnedContentForPage(pageKey, items); setPinnedItems(prev => ({ ...prev, [pageKey]: items })); addToast('تم تحديث المحتوى المثبت', 'success'); } catch (e) { addToast('فشل التحديث', 'error'); }
  };

  const handleUpdateTop10Items = async (pageKey: PageKey, items: PinnedItem[]) => {
      try { await updateTop10ContentForPage(pageKey, items); setTop10Items(prev => ({ ...prev, [pageKey]: items })); addToast('تم تحديث قائمة التوب 10', 'success'); } catch (e) { addToast('فشل التحديث', 'error'); }
  };

  const handleUpdateAd = async (ad: Ad) => {
      try { await updateAd(ad.id, ad); setAds(prev => prev.map(a => a.id === ad.id ? ad : a)); addToast('تم تحديث الإعلان', 'success'); } catch (e) { addToast('فشل تحديث الإعلان', 'error'); }
  };

  const handleDeleteAd = async (adId: string) => {
      try { await deleteAd(adId); setAds(prev => prev.filter(a => a.id !== adId)); addToast('تم حذف الإعلان', 'success'); } catch (e) { addToast('فشل حذف الإعلان', 'error'); }
  };

  const handleAddAd = async (adData: Omit<Ad, 'id' | 'updatedAt'>) => {
      try { const id = await addAd(adData); const newAd: Ad = { ...adData, id, updatedAt: new Date().toISOString() }; setAds(prev => [newAd, ...prev]); addToast('تم إضافة الإعلان بنجاح', 'success'); } catch (e) { addToast('فشل إضافة الإعلان', 'error'); }
  };

  const handleAddAdmin = async (newAdmin: Omit<User, 'id' | 'role' | 'profiles'>) => {
      try { const cred = await auth.createUserWithEmailAndPassword(newAdmin.email, newAdmin.password || ''); if (cred.user) { const defaultProfile: Profile = { id: Date.now(), name: newAdmin.firstName || 'المسؤول', avatar: defaultAvatar, isKid: false, watchHistory: [], myList: [] }; await createUserProfileInFirestore(cred.user.uid, { firstName: newAdmin.firstName, email: newAdmin.email, profiles: [defaultProfile] }); await updateUserProfileInFirestore(cred.user.uid, { role: UserRole.Admin }); addToast('تم إضافة المسؤول بنجاح!', 'success'); const usersList = await getUsers(); setAllUsers(usersList); } } catch (error: any) { addToast(error.message, 'error'); throw error; }
  };

  const handleDeleteUser = async (userId: string) => {
      try { await deleteUserFromFirestore(userId); setAllUsers(prev => prev.filter(u => u.id !== userId)); addToast('تم حذف المستخدم بنجاح', 'success'); } catch (e) { addToast('فشل حذف المستخدم', 'error'); }
  };

  useEffect(() => {
    if (siteSettings.is_maintenance_mode_enabled && currentUser?.role !== UserRole.Admin) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [siteSettings.is_maintenance_mode_enabled, currentUser]);

  const renderView = () => {
      const isAdmin = currentUser?.role === UserRole.Admin;
      const isMaintenance = siteSettings.is_maintenance_mode_enabled;
      const isRamadanTheme = siteSettings.activeTheme === 'ramadan';
      const isEidTheme = siteSettings.activeTheme === 'eid';
      const isCosmicTealTheme = siteSettings.activeTheme === 'cosmic-teal';
      const isNetflixRedTheme = siteSettings.activeTheme === 'netflix-red';
      const LoadingSpinner = () => (<div className="min-h-screen flex items-center justify-center bg-[var(--bg-body)]"><BouncingDotsLoader size="lg" delayMs={300} colorClass="bg-[var(--color-accent)]" /></div>);

      if (isMaintenance && !isAdmin) {
          if (view === 'login') return <LoginModal onSetView={handleSetView} onLogin={handleLogin} onGoogleLogin={handleGoogleLogin} isRamadanTheme={isRamadanTheme} isEidTheme={isEidTheme} isCosmicTealTheme={isCosmicTealTheme} isNetflixRedTheme={isNetflixRedTheme} isShahidTheme={siteSettings.activeTheme === 'shahid'} authReturnView={returnView} initialEmail={authPrefillEmail} />;
          return <MaintenancePage socialLinks={siteSettings.socialLinks} onSetView={handleSetView} />;
      }
      
      if (!isAuthLoading && currentUser && currentUser.setupCompleted && !activeProfile && view !== 'profileSelector' && view !== 'accountSettings' && view !== 'admin' && view !== 'onboarding') return <ProfileSelector user={currentUser} onSelectProfile={handleProfileSelect} onSetView={handleSetView} />;

      const getContentWithMeta = (items: PinnedItem[]) => items.map((p): Content | null => {
          const content = allContent.find(c => c.id === p.contentId);
          if (!content) return null;
          let finalContent = { ...content };
          const isEpisodic = content.type === ContentType.Series || content.type === ContentType.Program;
          if (isEpisodic && content.seasons && content.seasons.length > 0) {
              const latestSeason = [...content.seasons].sort((a, b) => b.seasonNumber - a.seasonNumber)[0];
              if (latestSeason) {
                  if (latestSeason.poster) finalContent.poster = latestSeason.poster;
                  if (latestSeason.backdrop) finalContent.backdrop = latestSeason.backdrop;
                  if (latestSeason.logoUrl) { finalContent.logoUrl = latestSeason.logoUrl; finalContent.isLogoEnabled = true; }
                  if (latestSeason.description) finalContent.description = latestSeason.description;
                  if (latestSeason.releaseYear) finalContent.releaseYear = latestSeason.releaseYear;
                  if (latestSeason.horizontalPoster) finalContent.horizontalPoster = latestSeason.horizontalPoster;
                  finalContent.trailerUrl = latestSeason.trailerUrl || undefined;
                  if (latestSeason.mobileImageUrl) finalContent.mobileBackdropUrl = latestSeason.mobileImageUrl;
                  if (latestSeason.enableMobileCrop !== undefined) finalContent.enableMobileCrop = latestSeason.enableMobileCrop;
                  if (latestSeason.mobileCropPositionX !== undefined) finalContent.mobileCropPositionX = latestSeason.mobileCropPositionX;
                  if (latestSeason.mobileCropPositionY !== undefined) finalContent.mobileCropPositionY = latestSeason.mobileCropPositionY;
              }
          }
          return { ...finalContent, bannerNote: p.bannerNote || finalContent.bannerNote };
      }).filter((c): c is Content => !!c);

      const getPinnedContentWithMeta = (page: PageKey) => getContentWithMeta(pinnedItems[page]);
      const getTop10ContentWithMeta = (page: PageKey) => getContentWithMeta(top10Items[page]);

      switch (view) {
          case 'home': return <HomePage allContent={allContent} pinnedContent={getPinnedContentWithMeta('home')} top10Content={getTop10ContentWithMeta('home')} stories={allStories} onSelectContent={handleSelectContent} isLoggedIn={!!currentUser} isAdmin={isAdmin} myList={activeProfile?.myList} onToggleMyList={handleToggleMyList} ads={ads} siteSettings={siteSettings} onNavigate={handleSetView} isLoading={isContentLoading} isRamadanTheme={isRamadanTheme} isEidTheme={isEidTheme} isCosmicTealTheme={isCosmicTealTheme} isNetflixRedTheme={isNetflixRedTheme} activeProfile={activeProfile} promoBanners={promoBanners} />;
          case 'movies': return <MoviesPage allContent={allContent} pinnedContent={getPinnedContentWithMeta('movies')} top10Content={getTop10ContentWithMeta('movies')} onSelectContent={handleSelectContent} isLoggedIn={!!currentUser} isAdmin={isAdmin} myList={activeProfile?.myList} onToggleMyList={handleToggleMyList} ads={ads} adsEnabled={siteSettings.adsEnabled} onNavigate={handleSetView} isLoading={isContentLoading} isRamadanTheme={isRamadanTheme} isEidTheme={isEidTheme} isCosmicTealTheme={isCosmicTealTheme} isNetflixRedTheme={isNetflixRedTheme} siteSettings={siteSettings} promoBanners={promoBanners} />;
          case 'series': return <SeriesPage allContent={allContent} pinnedContent={getPinnedContentWithMeta('series')} top10Content={getTop10ContentWithMeta('series')} onSelectContent={handleSelectContent} isLoggedIn={!!currentUser} isAdmin={isAdmin} myList={activeProfile?.myList} onToggleMyList={handleToggleMyList} ads={ads} adsEnabled={siteSettings.adsEnabled} siteSettings={siteSettings} onNavigate={handleSetView} isLoading={isContentLoading} isRamadanTheme={isRamadanTheme} isEidTheme={isEidTheme} isCosmicTealTheme={isCosmicTealTheme} isNetflixRedTheme={isNetflixRedTheme} promoBanners={promoBanners} />;
          case 'programs': return <ProgramsPage allContent={allContent} onSelectContent={handleSelectContent} isLoggedIn={!!currentUser} myList={activeProfile?.myList} onToggleMyList={handleToggleMyList} ads={ads} adsEnabled={siteSettings.adsEnabled} onNavigate={handleSetView} isLoading={isContentLoading} isRamadanTheme={isRamadanTheme} isEidTheme={isEidTheme} isCosmicTealTheme={isCosmicTealTheme} isNetflixRedTheme={isNetflixRedTheme} activeProfile={activeProfile} />;
          case 'kids': return <KidsPage allContent={allContent} pinnedContent={getPinnedContentWithMeta('kids')} top10Content={getTop10ContentWithMeta('kids')} onSelectContent={handleSelectContent} isLoggedIn={!!currentUser} isAdmin={isAdmin} myList={activeProfile?.myList} onToggleMyList={handleToggleMyList} ads={ads} adsEnabled={siteSettings.adsEnabled} onNavigate={handleSetView} isLoading={isContentLoading} isRamadanTheme={isRamadanTheme} isEidTheme={isEidTheme} isCosmicTealTheme={isCosmicTealTheme} isNetflixRedTheme={isNetflixRedTheme} isShahidTheme={siteSettings.activeTheme === 'shahid'} />;
          case 'ramadan': return <RamadanPage allContent={allContent} pinnedContent={getPinnedContentWithMeta('ramadan')} top10Content={getTop10ContentWithMeta('ramadan')} onSelectContent={handleSelectContent} isLoggedIn={!!currentUser} isAdmin={isAdmin} myList={activeProfile?.myList} onToggleMyList={handleToggleMyList} ads={ads} adsEnabled={siteSettings.adsEnabled} siteSettings={siteSettings} onNavigate={handleSetView} isLoading={isContentLoading} />;
          case 'soon': return <SoonPage allContent={allContent} pinnedContent={getPinnedContentWithMeta('soon')} onSelectContent={handleSelectContent} isLoggedIn={!!currentUser} isAdmin={isAdmin} myList={activeProfile?.myList} onToggleMyList={handleToggleMyList} ads={ads} adsEnabled={siteSettings.adsEnabled} isLoading={isContentLoading} isRamadanTheme={isRamadanTheme} isEidTheme={isEidTheme} isCosmicTealTheme={isCosmicTealTheme} isNetflixRedTheme={isNetflixRedTheme} isShahidTheme={siteSettings.activeTheme === 'shahid'} />;
          case 'welcome': return <WelcomePage allContent={allContent} onSetView={handleSetView} isRamadanTheme={isRamadanTheme} isEidTheme={isEidTheme} isCosmicTealTheme={isCosmicTealTheme} isNetflixRedTheme={isNetflixRedTheme} isShahidTheme={siteSettings.activeTheme === 'shahid'} returnView={returnView} />;
          case 'onboarding': return <OnboardingPage allContent={allContent} activeProfile={activeProfile} onFinish={handleOnboardingFinish} onSetView={handleSetView} />;
          case 'notifications': return currentUser ? <NotificationsPage userId={currentUser.id} onSetView={handleSetView} onUpdateUnreadCount={setUnreadNotificationsCount} /> : <LoginModal onSetView={handleSetView} onLogin={handleLogin} onGoogleLogin={handleGoogleLogin} isRamadanTheme={isRamadanTheme} isEidTheme={isEidTheme} isCosmicTealTheme={isCosmicTealTheme} isNetflixRedTheme={isNetflixRedTheme} isShahidTheme={siteSettings.activeTheme === 'shahid'} authReturnView={returnView} initialEmail={authPrefillEmail} />;
          case 'appDownload': return <AppPage onSetView={handleSetView} onGoBack={handleGoBack} appConfig={siteSettings.appConfig} returnView={returnView} />;
          case 'people': return <PeoplePage allContent={allContent} onPersonClick={handlePersonClick} onSetView={handleSetView} />;
          case 'personProfile': return <PersonProfilePage name={selectedPersonName} allContent={allContent} people={people} onSelectContent={handleSelectContent} onSetView={handleSetView} onGoBack={handleGoBack} isRamadanTheme={isRamadanTheme} isEidTheme={isEidTheme} isCosmicTealTheme={isCosmicTealTheme} isNetflixRedTheme={isNetflixRedTheme} returnView={returnView} />;
          case 'adGate': return <AdGatePage content={adGateTarget?.content || ({} as Content)} targetView={adGateTarget?.view || 'home'} onDone={handleAdGateDone} onCancel={handleAdGateCancel} ads={ads} adsEnabled={siteSettings.adsEnabled} isRamadanTheme={isRamadanTheme} isEidTheme={isEidTheme} isCosmicTealTheme={isCosmicTealTheme} isNetflixRedTheme={isNetflixRedTheme} />;
          case 'contentRequest': return <ContentRequestPage onSetView={handleSetView} onGoBack={handleGoBack} currentUser={currentUser} addToast={addToast} returnView={returnView} isRamadanTheme={isRamadanTheme} isEidTheme={isEidTheme} isCosmicTealTheme={isCosmicTealTheme} isNetflixRedTheme={isNetflixRedTheme} />;
          case 'detail':
               return (
                   <DetailPage key={window.location.pathname} locationPath={window.location.pathname} content={selectedContent || ({} as Content)} people={people} initialSeasonNumber={detailParams?.seasonNumber} ads={ads} adsEnabled={siteSettings.adsEnabled} allContent={allContent} onSelectContent={handleSelectContent} onPersonClick={handlePersonClick} isLoggedIn={!!currentUser} isAdmin={isAdmin} myList={activeProfile?.myList} onToggleMyList={handleToggleMyList} onSetView={handleSetView} onGoBack={handleGoBack} isRamadanTheme={isRamadanTheme} isEidTheme={isEidTheme} isCosmicTealTheme={isCosmicTealTheme} isNetflixRedTheme={isNetflixRedTheme} isShahidTheme={siteSettings.activeTheme === 'shahid'} />
               );
          case 'watch':
               return (
                   <EpisodeWatchPage content={selectedContent || ({} as Content)} seasonNumber={watchParams?.season || 1} episodeNumber={watchParams?.episode || 1} allContent={allContent} onSetView={handleSetView} onGoBack={handleGoBack} isAdmin={isAdmin} ads={ads} adsEnabled={siteSettings.adsEnabled} isRamadanTheme={isRamadanTheme} isEidTheme={isEidTheme} isCosmicTealTheme={isCosmicTealTheme} isNetflixRedTheme={isNetflixRedTheme} />
               );
           case 'download':
               return (
                   <DownloadPage content={selectedContent || ({} as Content)} seasonNumber={downloadParams?.season} episodeNumber={downloadParams?.episode} onSetView={handleSetView} isRamadanTheme={isRamadanTheme} isEidTheme={isEidTheme} isCosmicTealTheme={isCosmicTealTheme} isNetflixRedTheme={isNetflixRedTheme} returnView={returnView} />
               );
           case 'login': if (isAuthLoading) return <LoadingSpinner />; return <LoginModal onSetView={handleSetView} onLogin={handleLogin} onGoogleLogin={handleGoogleLogin} isRamadanTheme={isRamadanTheme} isEidTheme={isEidTheme} isCosmicTealTheme={isCosmicTealTheme} isNetflixRedTheme={isNetflixRedTheme} isShahidTheme={siteSettings.activeTheme === 'shahid'} authReturnView={returnView} initialEmail={authPrefillEmail} />;
           case 'register': if (isAuthLoading) return <LoadingSpinner />; return <CreateAccountPage onSetView={handleSetView} onRegister={handleRegister} onGoogleLogin={handleGoogleLogin} isRamadanTheme={isRamadanTheme} isEidTheme={isEidTheme} isCosmicTealTheme={isCosmicTealTheme} isNetflixRedTheme={isNetflixRedTheme} isShahidTheme={siteSettings.activeTheme === 'shahid'} authReturnView={returnView} />;
           case 'profileSelector': if (isAuthLoading) return <LoadingSpinner />; return currentUser ? <ProfileSelector user={currentUser} onSelectProfile={handleProfileSelect} onSetView={handleSetView} /> : <LoginModal onSetView={handleSetView} onLogin={handleLogin} onGoogleLogin={handleGoogleLogin} isRamadanTheme={isRamadanTheme} isEidTheme={isEidTheme} isCosmicTealTheme={isCosmicTealTheme} isNetflixRedTheme={isNetflixRedTheme} isShahidTheme={siteSettings.activeTheme === 'shahid'} authReturnView={returnView} initialEmail={authPrefillEmail} />;
           case 'myList': if (isAuthLoading) return <LoadingSpinner />; return activeProfile ? <MyListPage allContent={allContent} activeProfile={activeProfile} onSelectContent={handleSelectContent} isLoggedIn={!!currentUser} myList={activeProfile.myList} onToggleMyList={handleToggleMyList} onSetView={handleSetView} onGoBack={handleGoBack} isRamadanTheme={isRamadanTheme} isEidTheme={isEidTheme} isCosmicTealTheme={isCosmicTealTheme} isNetflixRedTheme={isNetflixRedTheme} /> : <LoginModal onSetView={handleSetView} onLogin={handleLogin} onGoogleLogin={handleGoogleLogin} isRamadanTheme={isRamadanTheme} isEidTheme={isEidTheme} isCosmicTealTheme={isCosmicTealTheme} isNetflixRedTheme={isNetflixRedTheme} isShahidTheme={siteSettings.activeTheme === 'shahid'} authReturnView={returnView} initialEmail={authPrefillEmail} />;
           case 'category': return <CategoryPage categoryTitle={selectedCategory} allContent={allContent} onSelectContent={handleSelectContent} isLoggedIn={!!currentUser} myList={activeProfile?.myList} onToggleMyList={handleToggleMyList} onSetView={handleSetView} onGoBack={handleGoBack} returnView={returnView} isRamadanTheme={isRamadanTheme} isEidTheme={isEidTheme} isCosmicTealTheme={isCosmicTealTheme} isNetflixRedTheme={isNetflixRedTheme} ads={ads} adsEnabled={siteSettings.adsEnabled} onRequestOpen={() => handleSetView('contentRequest')} />;
           case 'admin': 
                if (isAuthLoading) return <LoadingSpinner />; 
                if (!isAdmin) {
                    return (
                        <div className="min-h-screen flex flex-col items-center justify-center bg-[#090b10] text-center p-8">
                             <BouncingDotsLoader size="lg" delayMs={300} className="mb-6" colorClass="bg-[var(--color-accent)]" />
                             <h2 className="text-xl font-bold text-white mb-2">جاري التحقق من الصلاحيات...</h2>
                             <p className="text-gray-500 text-sm">يرجى الانتظار، سيتم توجيهك قريباً.</p>
                         </div>
                     );
                 }
                 return (
                     <AdminPanel 
                         allUsers={allUsers}
                         allAds={ads}
                         pinnedItems={pinnedItems}
                         top10Items={top10Items}
                         stories={allStories}
                         siteSettings={siteSettings}
                         onSetSiteSettings={handleUpdateSiteSettings}
                         onSetPinnedItems={handleUpdatePinnedItems}
                         onSetTop10Items={handleUpdateTop10Items}
                         onSetView={handleSetView}
                         onUpdateAd={handleUpdateAd}
                         onDeleteAd={handleDeleteAd}
                         onAddAd={handleAddAd}
                         onAddAdmin={handleAddAdmin}
                         onDeleteUser={handleDeleteUser}
                         onContentChanged={fetchData}
                         addToast={addToast}
                     />
                 );
            case 'accountSettings': 
                if (isAuthLoading) return <LoadingSpinner />; 
                return currentUser ? (
                    <AccountSettingsPage 
                        user={currentUser} 
                        onUpdateProfile={async (p) => { 
                            const updatedProfiles = currentUser.profiles.map(prof => prof.id === p.id ? p : prof); 
                            if (!currentUser.profiles.find(prof => prof.id === p.id)) updatedProfiles.push(p); 
                            const updatedUser = { ...currentUser, profiles: updatedProfiles }; 
                            setCurrentUser(updatedUser); 
                            if (activeProfile?.id === p.id) setActiveProfile(p); 
                            await updateUserProfileInFirestore(currentUser.id, { profiles: updatedProfiles }); 
                            addToast('تم تحديث الملف الشخصي', 'success'); 
                        }} 
                        onDeleteProfile={async (pid) => { 
                            const updatedProfiles = currentUser.profiles.filter(p => p.id !== pid); 
                            setCurrentUser({ ...currentUser, profiles: updatedProfiles }); 
                            await updateUserProfileInFirestore(currentUser.id, { profiles: updatedProfiles }); 
                            if (activeProfile?.id === pid) setActiveProfile(null); 
                            addToast('تم حذف الملف الشخصي', 'success'); 
                        }} 
                        onUpdatePassword={async (oldP, newP) => { 
                            try { 
                                const msg = firebase.auth.EmailAuthProvider.credential(currentUser.email, oldP); 
                                await auth.currentUser?.reauthenticateWithCredential(msg); 
                                await auth.currentUser?.updatePassword(newP); 
                                addToast('تم تغيير كلمة المرور', 'success'); 
                                return true; 
                            } catch (e) { 
                                addToast('كلمة المرور القديمة غير صحيحة', 'error'); 
                                return false; 
                            } 
                        }} 
                        onDeleteAccount={async () => { 
                            await deleteUserFromFirestore(currentUser.id); 
                            await auth.currentUser?.delete(); 
                            handleSetView('home'); 
                            addToast('تم حذف الحساب', 'info'); 
                        }} 
                        onSetView={handleSetView} 
                        isRamadanTheme={isRamadanTheme} 
                        isEidTheme={isEidTheme} 
                        isCosmicTealTheme={isCosmicTealTheme} 
                        isNetflixRedTheme={isNetflixRedTheme} 
                    />
                ) : (
                    <LoginModal 
                        onSetView={handleSetView} 
                        onLogin={handleLogin} 
                        onGoogleLogin={handleGoogleLogin} 
                        isRamadanTheme={isRamadanTheme} 
                        isEidTheme={isEidTheme} 
                        isCosmicTealTheme={isCosmicTealTheme} 
                        isNetflixRedTheme={isNetflixRedTheme} 
                        isShahidTheme={siteSettings.activeTheme === 'shahid'} 
                        authReturnView={returnView} 
                        initialEmail={authPrefillEmail} 
                    />
                );
            case 'profileHub': 
                 if (isAuthLoading) return <LoadingSpinner />;
                 return (currentUser && activeProfile) ? (
                     <ProfileHubPage 
                         user={currentUser} 
                         activeProfile={activeProfile} 
                         onSetView={handleSetView} 
                         onLogout={handleLogout} 
                         isRamadanTheme={isRamadanTheme} 
                         isEidTheme={isEidTheme} 
                         isCosmicTealTheme={isCosmicTealTheme} 
                         isNetflixRedTheme={isNetflixRedTheme} 
                     />
                 ) : (
                     <LoginModal 
                         onSetView={handleSetView} 
                         onLogin={handleLogin} 
                         onGoogleLogin={handleGoogleLogin} 
                         isRamadanTheme={isRamadanTheme} 
                         isEidTheme={isEidTheme} 
                         isCosmicTealTheme={isCosmicTealTheme} 
                         isNetflixRedTheme={isNetflixRedTheme} 
                         isShahidTheme={siteSettings.activeTheme === 'shahid'} 
                         authReturnView={returnView} 
                         initialEmail={authPrefillEmail} 
                     />
                 );
            case 'privacy': return <PrivacyPolicyPage content={siteSettings.privacyPolicy} onSetView={handleSetView} onGoBack={handleGoBack} returnView={returnView} isRamadanTheme={isRamadanTheme} isEidTheme={isEidTheme} isCosmicTealTheme={isCosmicTealTheme} isNetflixRedTheme={isNetflixRedTheme} />;
           case 'copyright': return <CopyrightPage content={siteSettings.copyrightPolicy} onSetView={handleSetView} onGoBack={handleGoBack} returnView={returnView} isRamadanTheme={isRamadanTheme} isEidTheme={isEidTheme} isCosmicTealTheme={isCosmicTealTheme} isNetflixRedTheme={isNetflixRedTheme} />;
           case 'about': return <AboutPage onSetView={handleSetView} onGoBack={handleGoBack} returnView={returnView} isRamadanTheme={isRamadanTheme} isEidTheme={isEidTheme} isCosmicTealTheme={isCosmicTealTheme} isNetflixRedTheme={isNetflixRedTheme} />;
           case 'search': return <SearchPage allContent={allContent} onSelectContent={handleSelectContent} onSetView={handleSetView} onGoBack={handleGoBack} />;
          default: return <HomePage allContent={allContent} pinnedContent={[]} onSelectContent={handleSelectContent} isLoggedIn={!!currentUser} myList={activeProfile?.myList} onToggleMyList={handleToggleMyList} ads={ads} siteSettings={siteSettings} onNavigate={handleSetView} activeProfile={activeProfile} isLoading={isContentLoading} promoBanners={promoBanners} />;
      }
  };

  const mobileCleanViews = ['myList', 'accountSettings', 'profileHub'];
  
  const headerAllowedViews: View[] = [
    'home', 'series', 'movies', 'ramadan', 'kids', 'soon', 'detail'
  ];

  const isForcedProfileSelection = !isAuthLoading && currentUser && currentUser.setupCompleted && !activeProfile && view !== 'profileSelector' && view !== 'accountSettings' && view !== 'admin' && view !== 'onboarding';

  const isDetailMobile = view === 'detail' && isMobile;
  const isChoosingProfile = view === 'profileSelector' || isForcedProfileSelection;

  const isMaintenanceActive = siteSettings.is_maintenance_mode_enabled && currentUser?.role !== UserRole.Admin;

  const showGlobalHeader = (headerAllowedViews.includes(view) || (siteSettings.activeTheme === 'shahid' && view !== 'admin' && view !== 'watch' && view !== 'adGate' && view !== 'maintenance' && view !== 'onboarding')) && view !== 'search' && view !== 'category' && view !== 'login' && view !== 'register' && view !== 'welcome' && !isDetailMobile && !isChoosingProfile && !isTv && !isMaintenanceActive;
  
  const showGlobalFooter = !fullScreenViews.includes(view) && !isTv && !isMaintenanceActive;
  
  const bottomNavRestrictedViews = ['home', 'movies', 'series', 'search', 'kids', 'ramadan'];
  const showBottomNav = showGlobalFooter && !mobileCleanViews.includes(view) && view !== 'profileSelector' && bottomNavRestrictedViews.includes(view);
  
  const footerClass = (mobileCleanViews.includes(view) || view === 'search') ? 'hidden md:block' : '';
  const bottomAdClass = mobileCleanViews.includes(view) ? 'hidden md:block' : 'fixed bottom-0 left-0 w-full z-[1000] bg-black/80';
  const socialBarClass = mobileCleanViews.includes(view) ? 'hidden md:block' : 'fixed z-[90] bottom-20 left-4 right-4 md:bottom-4 md:left-4 md:right-auto md:w-auto pointer-events-auto';

  const shouldShowGlobalAds = siteSettings.adsEnabled && !isMaintenanceActive && !fullScreenViews.includes(view);

  useEffect(() => {
    if (window.location.pathname === '/admin' && view !== 'admin' && !isAuthLoading) {
        if (currentUser?.role === UserRole.Admin) {
            setView('admin');
        } else {
            handleSetView('login');
        }
    }
  }, [currentUser, isAuthLoading, view]);

  return (
    <div className={`min-h-screen text-white font-['Cairo'] ${view === 'watch' ? '' : 'pb-16 md:pb-0'} ${isTv ? 'pr-20' : ''}`}>
        <div className="fixed top-4 right-4 z-[9999] flex flex-col gap-2">
            {toasts.map(toast => (
                <div key={toast.id} className={`flex items-center gap-2 px-4 py-3 rounded-lg shadow-lg animate-fade-in-up transition-all duration-300 ${toast.type === 'success' ? 'bg-green-600 text-white' : toast.type === 'error' ? 'bg-red-600 text-white' : 'bg-blue-600 text-white'}`}>
                    {toast.type === 'success' ? <CheckCircleIcon /> : toast.type === 'error' ? <ExclamationCircleIcon /> : null}
                    <span className="text-sm font-bold">{toast.message}</span>
                </div>
            ))}
        </div>
        
        {shouldShowGlobalAds && <AdZone position="global_head" />}
        
        {showGlobalHeader && (
            <Header 
                onSetView={handleSetView} 
                currentUser={currentUser} 
                activeProfile={activeProfile} 
                onLogout={handleLogout} 
                allContent={allContent} 
                onSelectContent={handleSelectContent} 
                currentView={view} 
                isRamadanTheme={siteSettings.activeTheme === 'ramadan'} 
                isEidTheme={siteSettings.activeTheme === 'eid'} 
                isCosmicTealTheme={siteSettings.activeTheme === 'cosmic-teal'} 
                isNetflixRedTheme={siteSettings.activeTheme === 'netflix-red'} 
                isShahidTheme={siteSettings.activeTheme === 'shahid'} 
                returnView={returnView} 
                isKidProfile={activeProfile?.isKid} 
                onOpenSearch={() => handleSetView('search')} 
                unreadNotificationsCount={unreadNotificationsCount} 
            />
        )}

        {isTv && (
            <TvSidebar onSetView={handleSetView} currentView={view} activeProfile={activeProfile} isRamadanTheme={siteSettings.activeTheme === 'ramadan'} isEidTheme={siteSettings.activeTheme === 'eid'} isCosmicTealTheme={siteSettings.activeTheme === 'cosmic-teal'} isNetflixRedTheme={siteSettings.activeTheme === 'netflix-red'} />
        )}
        
        {shouldShowGlobalAds && <AdPlacement ads={ads} placement="global-social-bar" isEnabled={siteSettings.adsEnabled} className={socialBarClass} />}
        
        {shouldShowGlobalAds && <AdPlacement ads={ads} placement="global-sticky-footer" isEnabled={siteSettings.adsEnabled} className={bottomAdClass} />}
        
        <div className="relative z-10">
            <Suspense fallback={<div className="flex items-center justify-center min-h-screen"><BouncingDotsLoader size="lg" delayMs={300} colorClass="bg-[var(--color-accent)]" /></div>}>
                {renderView()}
            </Suspense>
        </div>

        {showGlobalFooter && (
            <>
                <Footer socialLinks={siteSettings.socialLinks} onSetView={handleSetView} isRamadanFooter={siteSettings.activeTheme === 'ramadan'} className={footerClass} />
                {showBottomNav && ( 
                    <> 
                        <BottomNavigation currentView={view} onSetView={handleSetView} activeProfile={activeProfile} isLoggedIn={!!currentUser} isRamadanTheme={siteSettings.activeTheme === 'ramadan'} isEidTheme={siteSettings.activeTheme === 'eid'} isCosmicTealTheme={siteSettings.activeTheme === 'cosmic-teal'} isNetflixRedTheme={siteSettings.activeTheme === 'netflix-red'} /> 
                        <PWAInstallPrompt /> 
                    </> 
                )}
            </>
        )}

        {showStartupAd && activeStartupAds.length > 0 && activeStartupAds[currentStartupAdIndex] && (
            <StartupAdModal
                key={activeStartupAds[currentStartupAdIndex].id}
                adConfig={activeStartupAds[currentStartupAdIndex]}
                allContent={allContent}
                onClose={() => {
                    const currentAd = activeStartupAds[currentStartupAdIndex];
                    // Mark as seen
                    const seenAdsStr = localStorage.getItem('seenStartupAds') || '[]';
                    let seenAds: string[] = [];
                    try { seenAds = JSON.parse(seenAdsStr); } catch (e) {}
                    seenAds.push(currentAd.id);
                    localStorage.setItem('seenStartupAds', JSON.stringify(seenAds));

                    if (currentStartupAdIndex < activeStartupAds.length - 1) {
                        setCurrentStartupAdIndex(currentStartupAdIndex + 1);
                        // Briefly hide then show next ad ? We can just change the index but StartupAdModal expects an unmount/remount to trigger visibility transition?
                        // Let's force an unmount.
                        setShowStartupAd(false);
                        setTimeout(() => setShowStartupAd(true), 350); 
                    } else {
                        setShowStartupAd(false);
                        setActiveStartupAds([]);
                        setCurrentStartupAdIndex(0);
                    }
                }}
                onSelectContent={(content) => {
                    handleSelectContent(content);
                }}
            />
        )}
    </div>
  );
};

export default App;