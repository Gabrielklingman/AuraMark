const functions = require('firebase-functions');
const admin = require('firebase-admin');
const axios = require('axios');
const cheerio = require('cheerio');
const cors = require('cors')({ origin: true });

admin.initializeApp();

/**
 * Cloud Function to fetch metadata from a URL
 * This function extracts title, description, and image from a URL's HTML content
 */
exports.fetchUrlMetadata = functions.https.onCall(async (data, context) => {
  // Validate input
  const url = data?.url;
  if (!url) {
    throw new functions.https.HttpsError('invalid-argument', 'URL is required');
  }

  try {
    // Fetch HTML content from the URL
    const response = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
      },
      timeout: 10000, // 10 seconds timeout
      maxRedirects: 5
    });

    const html = response.data;
    const $ = cheerio.load(html);
    
    // Extract metadata
    const metadata = {
      title: null,
      description: null,
      image: null,
      url: url,
    };

    // Get Open Graph title
    metadata.title = $('meta[property="og:title"]').attr('content') ||
                     $('meta[name="twitter:title"]').attr('content') ||
                     $('title').text() ||
                     null;

    // Get Open Graph description
    metadata.description = $('meta[property="og:description"]').attr('content') ||
                          $('meta[name="twitter:description"]').attr('content') ||
                          $('meta[name="description"]').attr('content') ||
                          null;

    // Get Open Graph image
    metadata.image = $('meta[property="og:image"]').attr('content') ||
                    $('meta[name="twitter:image"]').attr('content') ||
                    null;

    // Handle relative image URLs
    if (metadata.image && metadata.image.startsWith('/')) {
      const urlObj = new URL(url);
      metadata.image = `${urlObj.protocol}//${urlObj.host}${metadata.image}`;
    }

    // Clean up and trim results
    if (metadata.title) metadata.title = metadata.title.trim();
    if (metadata.description) metadata.description = metadata.description.trim();

    return { success: true, metadata };
  } catch (error) {
    console.error('Error fetching URL metadata:', error);
    throw new functions.https.HttpsError(
      'internal', 
      'Error fetching metadata from URL',
      { originalError: error.message }
    );
  }
});

/**
 * HTTP endpoint for URL metadata (alternative to callable function)
 * This can be used if you need CORS support or want to test the endpoint directly
 */
exports.getUrlMetadata = functions.https.onRequest((request, response) => {
  cors(request, response, async () => {
    // Only allow POST requests
    if (request.method !== 'POST') {
      response.status(405).send('Method Not Allowed');
      return;
    }

    // Get URL from request body
    const { url } = request.body;
    if (!url) {
      response.status(400).send({ error: 'URL is required' });
      return;
    }

    try {
      // Fetch HTML content from the URL
      const htmlResponse = await axios.get(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        },
        timeout: 10000,
        maxRedirects: 5
      });

      const html = htmlResponse.data;
      const $ = cheerio.load(html);
      
      // Extract metadata
      const metadata = {
        title: null,
        description: null,
        image: null,
        url: url,
      };

      // Get Open Graph title
      metadata.title = $('meta[property="og:title"]').attr('content') ||
                       $('meta[name="twitter:title"]').attr('content') ||
                       $('title').text() ||
                       null;

      // Get Open Graph description
      metadata.description = $('meta[property="og:description"]').attr('content') ||
                            $('meta[name="twitter:description"]').attr('content') ||
                            $('meta[name="description"]').attr('content') ||
                            null;

      // Get Open Graph image
      metadata.image = $('meta[property="og:image"]').attr('content') ||
                      $('meta[name="twitter:image"]').attr('content') ||
                      null;

      // Handle relative image URLs
      if (metadata.image && metadata.image.startsWith('/')) {
        const urlObj = new URL(url);
        metadata.image = `${urlObj.protocol}//${urlObj.host}${metadata.image}`;
      }

      // Clean up and trim results
      if (metadata.title) metadata.title = metadata.title.trim();
      if (metadata.description) metadata.description = metadata.description.trim();

      response.status(200).send({ success: true, metadata });
    } catch (error) {
      console.error('Error fetching URL metadata:', error);
      response.status(500).send({ 
        success: false, 
        error: 'Error fetching metadata from URL',
        message: error.message
      });
    }
  });
});