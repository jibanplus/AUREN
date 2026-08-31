// Vercel Serverless Function for IndiaMART search
// This is a Vite project deployed to Vercel

const ANAKIN_API_URL = 'https://api.anakin.io/v1';
const ANAKIN_API_KEY = process.env.ANAKIN_API_KEY;

if (!ANAKIN_API_KEY) {
  console.warn('ANAKIN_API_KEY environment variable is not set');
}

interface IndiaMARTSearchResult {
  id: string;
  name: string;
  image: string;
  supplier_name: string;
  supplier_price: number;
  category?: string;
  description?: string;
  supplier_url?: string;
  indiamart_url?: string;
}

export default async function handler(req: any, res: any) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { query } = req.body;

    if (!query || typeof query !== 'string' || query.trim().length === 0) {
      return res.status(400).json({ error: 'Search query is required' });
    }

    if (!ANAKIN_API_KEY) {
      console.error('ANAKIN_API_KEY environment variable is not set');
      return res.status(500).json({ error: 'Server configuration error: API key not configured' });
    }

    // Call Anakin API for search with IndiaMART-specific query
    const response = await fetch(`${ANAKIN_API_URL}/search`, {
      method: 'POST',
      headers: {
        'X-API-Key': ANAKIN_API_KEY,
        'Authorization': `Bearer ${ANAKIN_API_KEY}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({
        prompt: `site:indiamart.com ${query.trim()}`,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Anakin API error:', errorText);
      
      if (response.status === 401) {
        return res.status(500).json({ error: 'Invalid API key' });
      }
      
      if (response.status === 429) {
        return res.status(429).json({ error: 'API rate limit exceeded. Please try again later.' });
      }

      return res.status(503).json({ error: 'IndiaMART API is temporarily unavailable' });
    }

    const responseText = await response.text();
    
    if (!responseText || responseText.trim() === '') {
      console.error('Empty response from Anakin API');
      return res.status(500).json({ error: 'Empty response from IndiaMART API' });
    }

    let data;
    try {
      data = JSON.parse(responseText);
    } catch (e) {
      console.error('Failed to parse JSON:', responseText);
      return res.status(500).json({ error: 'Invalid JSON response from IndiaMART API' });
    }

    // Transform Anakin API response to our format
    const results: IndiaMARTSearchResult[] = [];

    // Parse search results and extract basic info from title/snippet
    const searchResults = Array.isArray(data) ? data : (data.results || data.data?.results || data.data || []);
    if (!Array.isArray(searchResults)) {
      return res.status(502).json({ error: 'Unexpected response format from Anakin API' });
    }
    
    for (const result of searchResults) {
      let price = 0;
      let supplierName = 'Unknown';
      let description = result.snippet?.substring(0, 200) || undefined;
      let imageUrl = '';

      // Extract price from title (look for ₹ symbol)
      const titlePriceMatch = result.title?.match(/₹\s*[\d,]+/g);
      if (titlePriceMatch && titlePriceMatch.length > 0) {
        const priceStr = titlePriceMatch[0].replace(/[₹,\s]/g, '');
        price = parseFloat(priceStr) || 0;
      }

      // Extract supplier name from title (usually after last hyphen)
      if (result.title) {
        const titleParts = result.title.split('-');
        if (titleParts.length > 1) {
          supplierName = titleParts[titleParts.length - 1].trim();
          // Remove ID if present
          supplierName = supplierName.replace(/\|.*$/, '').trim();
        }
      }

      // Try to extract image from the result
      if (result.image) {
        imageUrl = result.image;
      } else if (result.thumbnail) {
        imageUrl = result.thumbnail;
      } else if (result.img) {
        imageUrl = result.img;
      } else if (result.pagemap?.cse_image?.[0]?.src) {
        imageUrl = result.pagemap.cse_image[0].src;
      } else if (result.pagemap?.cse_thumbnail?.[0]?.src) {
        imageUrl = result.pagemap.cse_thumbnail[0].src;
      }

      // If no image found, try to extract from snippet/description
      if (!imageUrl && result.snippet) {
        const imageMatch = result.snippet.match(/https?:\/\/[^\s]+\.(jpg|jpeg|png|webp|gif)/i);
        if (imageMatch) {
          imageUrl = imageMatch[0];
        }
      }

      results.push({
        id: result.url || '',
        name: result.title || '',
        image: imageUrl,
        supplier_name: supplierName,
        supplier_price: price,
        category: undefined,
        description: description,
        supplier_url: result.url,
        indiamart_url: result.url,
      });
    }

    return res.status(200).json({ results });
  } catch (error) {
    console.error('IndiaMART search error:', error);
    return res.status(500).json({ error: 'Failed to search IndiaMART' });
  }
}
