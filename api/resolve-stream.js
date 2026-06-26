const admin = require('firebase-admin');

// Initialize Firebase Admin
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
  // CORS support
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    const { path } = req.query;
    if (!path) {
      return res.status(400).json({ error: 'Missing path parameter' });
    }

    let foundUrl = null;

    // Step 1: Search direct matching document where virtual_path === path
    const directQuery = await db.collection('content')
      .where('virtual_path', '==', path)
      .limit(1)
      .get();

    if (!directQuery.empty) {
      const doc = directQuery.docs[0];
      const data = doc.data();
      foundUrl = data.telegramOriginalUrl || (data.servers && data.servers[0] && data.servers[0].url);
    }

    // Step 2: If not found, check if it's a series episode by parent path slice
    if (!foundUrl) {
      const segments = path.split('/');
      if (segments.length >= 3) {
        // Derive parent path by removing the last 2 segments (e.g. S1/E01)
        const parentPath = segments.slice(0, -2).join('/');
        
        const parentQuery = await db.collection('content')
          .where('virtual_path', '==', parentPath)
          .limit(1)
          .get();

        if (!parentQuery.empty) {
          const parentData = parentQuery.docs[0].data();
          
          if (parentData.seasons) {
            for (const season of parentData.seasons) {
              if (season.episodes) {
                const matchedEpisode = season.episodes.find(ep => ep.virtual_path === path);
                if (matchedEpisode) {
                  foundUrl = matchedEpisode.telegramOriginalUrl || (matchedEpisode.servers && matchedEpisode.servers[0] && matchedEpisode.servers[0].url);
                  break;
                }
              }
            }
          }
        }
      }
    }

    // Step 3: Deep Scan all series documents in case virtual path formats are highly customized or have extra nesting
    if (!foundUrl) {
      const allSeriesQuery = await db.collection('content')
        .where('type', '==', 'series')
        .get();

      for (const doc of allSeriesQuery.docs) {
        const data = doc.data();
        if (data.seasons) {
          let found = false;
          for (const season of data.seasons) {
            if (season.episodes) {
              const matchedEpisode = season.episodes.find(ep => ep.virtual_path === path);
              if (matchedEpisode) {
                foundUrl = matchedEpisode.telegramOriginalUrl || (matchedEpisode.servers && matchedEpisode.servers[0] && matchedEpisode.servers[0].url);
                found = true;
                break;
              }
            }
          }
          if (found) break;
        }
      }
    }

    // Step 4: Check movies using a full list if direct query didn't succeed
    if (!foundUrl) {
      const allMoviesQuery = await db.collection('content')
        .where('type', '==', 'movie')
        .get();

      for (const doc of allMoviesQuery.docs) {
        const data = doc.data();
        if (data.virtual_path === path) {
          foundUrl = data.telegramOriginalUrl || (data.servers && data.servers[0] && data.servers[0].url);
          break;
        }
      }
    }

    if (!foundUrl) {
      return res.status(404).json({ error: 'Virtual stream path not found' });
    }

    // Extract message ID and hash from Telegram original URL
    const match = foundUrl.match(/\/stream\/(\d+)\?hash=([a-zA-Z0-9]+)/);
    if (!match) {
      return res.status(422).json({ 
        error: 'URL format mismatch. Found stream URL does not follow the required pattern.',
        url: foundUrl 
      });
    }

    return res.status(200).json({
      id: match[1],
      hash: match[2]
    });

  } catch (error) {
    console.error('Error in resolve-stream API:', error);
    return res.status(500).json({ error: error.message });
  }
};
