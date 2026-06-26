const admin = require('firebase-admin');

if (!admin.apps.length) {
  try {
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: process.env.FIREBASE_PRIVATE_KEY 
          ? process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n') 
          : undefined,
      }),
    });
  } catch (error) {
    console.error('Firebase Admin initialization error:', error);
  }
}

const db = admin.firestore();

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();

  try {
    let { path } = req.query;
    if (!path) return res.status(400).json({ error: 'Missing path parameter' });

    // 🚨 1. الجراحة الأولى: تنظيف المسار تماماً من (series/ ومن .mp4 ومن أي سلاش زائدة)
    let cleanTarget = decodeURIComponent(path)
      .replace(/^\//, '')
      .replace(/^series\//i, '')
      .replace(/^movies\//i, '')
      .replace(/\.(mp4|mkv|m3u8|webm)$/i, '')
      .trim();

    // بناء الاحتمالين للبحث (بـ series ومن غيرها)
    const pathVariants = [cleanTarget, `series/${cleanTarget}`, `movies/${cleanTarget}`];

    let foundUrl = null;

    // Step 1: Search direct matching document
    for (const variant of pathVariants) {
      const directQuery = await db.collection('content').where('virtual_path', '==', variant).limit(1).get();
      if (!directQuery.empty) {
        const data = directQuery.docs[0].data();
        foundUrl = data.telegramOriginalUrl || (data.servers && data.servers[0] && (data.servers[0].url || data.servers[0].downloadUrl));
        break;
      }
    }

    // Step 2: Parent path slice matching
    if (!foundUrl) {
      const segments = cleanTarget.split('/');
      if (segments.length >= 3) {
        const parentVariants = [
          segments.slice(0, -2).join('/'),
          `series/${segments.slice(0, -2).join('/')}`
        ];
        
        for (const pPath of parentVariants) {
          const parentQuery = await db.collection('content').where('virtual_path', '==', pPath).limit(1).get();
          if (!parentQuery.empty) {
            const parentData = parentQuery.docs[0].data();
            if (parentData.seasons) {
              for (const season of parentData.seasons) {
                if (season.episodes) {
                  const matchedEpisode = season.episodes.find(ep => {
                    const epClean = (ep.virtual_path || '').replace(/^series\//i, '').replace(/\.mp4$/i, '');
                    return epClean === cleanTarget || epClean.endsWith(segments[segments.length - 1]);
                  });
                  if (matchedEpisode) {
                    foundUrl = matchedEpisode.telegramOriginalUrl || (matchedEpisode.servers && matchedEpisode.servers[0] && (matchedEpisode.servers[0].url || matchedEpisode.servers[0].downloadUrl));
                    break;
                  }
                }
              }
            }
          }
          if (foundUrl) break;
        }
      }
    }

    // Step 3: Deep Scan with loose matching
    if (!foundUrl) {
      const allSeriesQuery = await db.collection('content').where('type', '==', 'series').get();
      const targetEpName = cleanTarget.split('/').pop(); // هيقفل على E01

      for (const doc of allSeriesQuery.docs) {
        const data = doc.data();
        if (data.seasons) {
          for (const season of data.seasons) {
            if (season.episodes) {
              const matchedEpisode = season.episodes.find(ep => {
                const vPath = ep.virtual_path || '';
                return vPath.includes(cleanTarget) || vPath.endsWith(targetEpName);
              });
              if (matchedEpisode) {
                foundUrl = matchedEpisode.telegramOriginalUrl || (matchedEpisode.servers && matchedEpisode.servers[0] && (matchedEpisode.servers[0].url || matchedEpisode.servers[0].downloadUrl));
                break;
              }
            }
          }
        }
        if (foundUrl) break;
      }
    }

    if (!foundUrl) {
      return res.status(404).json({ error: 'Virtual stream path not found in DB', attempted: cleanTarget });
    }

    // 🚨 2. الجراحة الثانية: صائد الـ ID والـ Hash المرن (بيصطاد من أي صيغة لينك)
    // بيبحث عن رقم بعد كلمة stream/ وعن أي هاش سواء كان ?hash= أو &hash=
    const idMatch = foundUrl.match(/\/stream\/(\d+)/);
    const hashMatch = foundUrl.match(/[?&]hash=([a-zA-Z0-9]+)/);

    if (!idMatch || !hashMatch) {
      return res.status(422).json({ 
        error: 'Regex extraction failed on the target URL',
        raw_url_found: foundUrl 
      });
    }

    return res.status(200).json({
      id: idMatch[1],
      hash: hashMatch[1]
    });

  } catch (error) {
    console.error('Resolver API Error:', error);
    return res.status(500).json({ error: error.message });
  }
};