require('dotenv').config();
const express = require('express');
const cors = require('cors');
const axios = require('axios');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Brevo API configuration
const BREVO_API_KEY = process.env.BREVO_API_KEY;
const BREVO_API_URL = 'https://api.brevo.com/v3';

// Validate environment variables
if (!BREVO_API_KEY) {
  console.warn('⚠️  WARNING: BREVO_API_KEY is not set. Brevo API calls will fail.');
}

// Helper function to validate JSON
function isJSONValid(str) {
  try {
    JSON.parse(str);
    return true;
  } catch (e) {
    return false;
  }
}

// Brevo API helper functions
async function getBrevoContact(email) {
  if (!BREVO_API_KEY) {
    throw new Error('BREVO_API_KEY is not configured');
  }

  try {
    const response = await axios.get(`${BREVO_API_URL}/contacts/${encodeURIComponent(email)}`, {
      headers: {
        'api-key': BREVO_API_KEY,
        'Content-Type': 'application/json'
      }
    });
    return response.data;
  } catch (error) {
    if (error.response?.status === 404) {
      return null; // Contact doesn't exist
    }
    throw error;
  }
}

async function subscribeContactToList(email, listId, attributes = {}) {
  if (!BREVO_API_KEY) {
    throw new Error('BREVO_API_KEY is not configured');
  }

  try {
    const response = await axios.post(
      `${BREVO_API_URL}/contacts/lists/${listId}/contacts/add`,
      {
        emails: [email],
        ...(Object.keys(attributes).length > 0 && { attributes })
      },
      {
        headers: {
          'api-key': BREVO_API_KEY,
          'Content-Type': 'application/json'
        }
      }
    );
    return response.data;
  } catch (error) {
    if (error.response?.data) {
      throw new Error(error.response.data.message || 'Failed to subscribe contact');
    }
    throw error;
  }
}

async function createOrUpdateContact(email, attributes = {}, listIds = []) {
  if (!BREVO_API_KEY) {
    throw new Error('BREVO_API_KEY is not configured');
  }

  try {
    const response = await axios.post(
      `${BREVO_API_URL}/contacts`,
      {
        email,
        ...(Object.keys(attributes).length > 0 && { attributes }),
        ...(listIds.length > 0 && { listIds })
      },
      {
        headers: {
          'api-key': BREVO_API_KEY,
          'Content-Type': 'application/json'
        }
      }
    );
    return response.data;
  } catch (error) {
    if (error.response?.data) {
      throw new Error(error.response.data.message || 'Failed to create/update contact');
    }
    throw error;
  }
}

async function getBrevoLists() {
  if (!BREVO_API_KEY) {
    throw new Error('BREVO_API_KEY is not configured');
  }

  try {
    const response = await axios.get(`${BREVO_API_URL}/contacts/lists`, {
      headers: {
        'api-key': BREVO_API_KEY,
        'Content-Type': 'application/json'
      },
      params: {
        limit: 50,
        offset: 0
      }
    });
    return response.data.lists || [];
  } catch (error) {
    if (error.response?.data) {
      throw new Error(error.response.data.message || 'Failed to fetch lists');
    }
    throw error;
  }
}

// API Routes

// Get Brevo contact details
app.get('/api/brevo/contact/:email', async (req, res) => {
  try {
    const { email } = req.params;

    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    const contact = await getBrevoContact(email);

    if (!contact) {
      return res.status(404).json({ 
        error: 'Contact not found in Brevo',
        email,
        exists: false
      });
    }

    res.json({
      email,
      exists: true,
      contact
    });
  } catch (error) {
    console.error('Error fetching Brevo contact:', error);
    res.status(500).json({ 
      error: 'Failed to fetch contact from Brevo',
      message: error.message 
    });
  }
});

// Subscribe contact to a list
app.post('/api/brevo/subscribe', async (req, res) => {
  try {
    const { email, listId, attributes } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    if (!listId) {
      return res.status(400).json({ error: 'List ID is required' });
    }

    const result = await subscribeContactToList(email, listId, attributes || {});

    res.json({
      success: true,
      email,
      listId,
      result
    });
  } catch (error) {
    console.error('Error subscribing contact:', error);
    res.status(500).json({ 
      error: 'Failed to subscribe contact',
      message: error.message 
    });
  }
});

// Create or update contact
app.post('/api/brevo/contact', async (req, res) => {
  try {
    const { email, attributes, listIds } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    const result = await createOrUpdateContact(email, attributes || {}, listIds || []);

    res.json({
      success: true,
      email,
      contact: result
    });
  } catch (error) {
    console.error('Error creating/updating contact:', error);
    res.status(500).json({ 
      error: 'Failed to create/update contact',
      message: error.message 
    });
  }
});

// Get all Brevo lists
app.get('/api/brevo/lists', async (req, res) => {
  try {
    const lists = await getBrevoLists();
    res.json({ lists });
  } catch (error) {
    console.error('Error fetching Brevo lists:', error);
    res.status(500).json({ 
      error: 'Failed to fetch lists from Brevo',
      message: error.message 
    });
  }
});

// Dashboard App page - served at /chatwoot
app.get('/chatwoot', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'chatwoot.html'));
});

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok',
    brevoConfigured: !!BREVO_API_KEY 
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Chatwoot Brevo Integration server running on port ${PORT}`);
  console.log(`📊 Dashboard App available at: http://localhost:${PORT}/chatwoot`);
  
  if (!BREVO_API_KEY) {
    console.warn('⚠️  BREVO_API_KEY is not set. Please configure it to use Brevo API.');
  } else {
    console.log('✅ Brevo API key is configured');
  }
});

