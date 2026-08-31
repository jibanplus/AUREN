import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(express.json());

const ANAKIN_API_URL = 'https://api.anakin.io/v1';
const ANAKIN_API_KEY = process.env.ANAKIN_API_KEY;

// API Routes
app.post('/api/indiamart/search', async (req, res) => {
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

  try {
    const { query } = req.body;

    if (!query || typeof query !== 'string' || query.trim().length === 0) {
      return res.status(400).json({ error: 'Search query is required' });
    }

    if (!ANAKIN_API_KEY) {
      return res.status(500).json({ error: 'Server configuration error: API key not configured' });
    }

    console.log('Searching IndiaMART for:', query);

    // Call Anakin API for search with IndiaMART-specific query
    const response = await fetch(`${ANAKIN_API_URL}/search`, {
      method: 'POST',
      headers: {
        'X-API-Key': ANAKIN_API_KEY,
        'Content-Type': 'application/json',
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
      console.error('Failed to parse JSON. Error:', e);
      return res.status(500).json({ error: 'Invalid JSON response from IndiaMART API', details: responseText.substring(0, 200) });
    }

    // Transform Anakin API response to our format
    const results = [];

    // Parse search results and extract basic info from title/snippet
    const searchResults = data.results || [];
    
    for (const result of searchResults) {
      let price = 0;
      let supplierName = 'Unknown';
      let description = result.snippet?.substring(0, 200) || undefined;
      
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
      
      results.push({
        id: result.url || '',
        name: result.title || '',
        image: '',
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
});

app.listen(PORT, () => {
  console.log(`API server running on http://localhost:${PORT}`);
});
