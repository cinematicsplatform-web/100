import { next } from '@vercel/edge';

export const config = {
  // Match all request paths except for the ones starting with:
  // - api (API routes)
  // - _next/static (static files - if applicable)
  // - _next/image (image optimization files - if applicable)
  // - favicon.ico (favicon file)
  // - sw.js (service worker)
  // - firebase-messaging-sw.js (service worker)
  matcher: '/((?!api|_next/static|_next/image|favicon.ico|sw.js|firebase-messaging-sw.js).*)',
};

export default function middleware(request: Request) {
  const userAgent = request.headers.get('user-agent')?.toLowerCase() || '';
  
  // List of bots to trigger prerendering
  const bots = [
    'googlebot', 
    'bingbot', 
    'yandex', 
    'baiduspider', 
    'facebookexternalhit', 
    'twitterbot', 
    'whatsapp', 
    'linkedinbot', 
    'telegrambot', 
    'discordbot'
  ];
  
  const isBot = bots.some(bot => userAgent.includes(bot));
  
  // Check if the URL points to a static asset/extension
  const isExtension = /\.(js|css|xml|less|png|jpg|jpeg|gif|pdf|doc|txt|ico|rss|zip|mp3|rar|exe|wmv|doc|avi|ppt|mpg|mpeg|tif|wav|mov|psd|ai|xls|mp4|m4a|swf|dat|dmg|iso|flv|m4v|torrent|ttf|woff|svg|eot)$/i.test(request.url);

  if (isBot && !isExtension) {
    // Redirect bots to Prerender.io to serve rendered HTML
    const newUrl = `https://service.prerender.io/${request.url}`;
    
    return fetch(newUrl, {
      headers: {
        'X-Prerender-Token': process.env.PRERENDER_TOKEN || '',
        'User-Agent': request.headers.get('user-agent') || 'bot'
      },
    });
  }

  // Allow normal users and static assets to pass through
  return next();
}