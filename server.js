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

// Chatwoot API configuration
const CHATWOOT_URL = process.env.CHATWOOT_URL;
const CHATWOOT_API_KEY = process.env.CHATWOOT_API_KEY || process.env.CHATWOOT_ACCESS_TOKEN;
const CHATWOOT_ACCOUNT_ID = process.env.CHATWOOT_ACCOUNT_ID || '1';
const CHATWOOT_API_TOKEN = process.env.CHATWOOT_API_TOKEN; // Optional token to protect our API

// Validate environment variables
if (!BREVO_API_KEY) {
  console.warn('⚠️  WARNING: BREVO_API_KEY is not set. Brevo API calls will fail.');
}

if (!CHATWOOT_URL || !CHATWOOT_API_KEY) {
  console.warn('⚠️  WARNING: CHATWOOT_URL or CHATWOOT_API_KEY is not set. Chatwoot API integration will not work.');
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

async function updateBrevoContactById(contactId, attributes = {}) {
  if (!BREVO_API_KEY) {
    throw new Error('BREVO_API_KEY is not configured');
  }

  try {
    // Log what we're sending to Brevo for debugging
    console.log('Updating Brevo contact ID:', contactId, 'with attributes:', attributes);
    
    const response = await axios.put(
      `${BREVO_API_URL}/contacts/${contactId}`,
      {
        attributes: attributes
      },
      {
        headers: {
          'api-key': BREVO_API_KEY,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      }
    );
    
    console.log('Brevo update response:', response.data);
    return response.data;
  } catch (error) {
    console.error('Brevo API error:', error.response?.data || error.message);
    if (error.response?.data) {
      throw new Error(error.response.data.message || 'Failed to update contact');
    }
    throw error;
  }
}

async function updateBrevoContact(email, attributes = {}) {
  // First get the contact to find its ID
  const contact = await getBrevoContact(email);
  if (!contact || !contact.id) {
    throw new Error('Contact not found in Brevo');
  }
  
  // Update using contact ID
  return await updateBrevoContactById(contact.id, attributes);
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

// Chatwoot API helper functions
async function getChatwootContact(contactId) {
  if (!CHATWOOT_URL || !CHATWOOT_API_KEY) {
    throw new Error('Chatwoot API is not configured');
  }

  try {
    const response = await axios.get(
      `${CHATWOOT_URL}/api/v1/accounts/${CHATWOOT_ACCOUNT_ID}/contacts/${contactId}`,
      {
        headers: {
          'api_access_token': CHATWOOT_API_KEY
        }
      }
    );
    return response.data;
  } catch (error) {
    if (error.response?.status === 404) {
      return null;
    }
    throw error;
  }
}

async function getChatwootConversation(conversationId) {
  if (!CHATWOOT_URL || !CHATWOOT_API_KEY) {
    throw new Error('Chatwoot API is not configured');
  }

  try {
    const response = await axios.get(
      `${CHATWOOT_URL}/api/v1/accounts/${CHATWOOT_ACCOUNT_ID}/conversations/${conversationId}`,
      {
        headers: {
          'api_access_token': CHATWOOT_API_KEY
        }
      }
    );
    return response.data;
  } catch (error) {
    if (error.response?.status === 404) {
      return null;
    }
    throw error;
  }
}

// Middleware to optionally check CHATWOOT_API_TOKEN (for protecting our API)
function optionalAuth(req, res, next) {
  if (CHATWOOT_API_TOKEN) {
    const authHeader = req.headers.authorization;
    if (!authHeader || authHeader !== `Bearer ${CHATWOOT_API_TOKEN}`) {
      console.warn('⚠️  API request without valid token (in development mode, allowing anyway)');
      // In development, we allow requests without token
      // In production, you might want to return 401 here
    }
  }
  next();
}

// API Routes

// Get contact email from Chatwoot (using conversation or contact ID)
app.get('/api/chatwoot/contact', optionalAuth, async (req, res) => {
  try {
    const { conversationId, contactId } = req.query;

    if (!conversationId && !contactId) {
      return res.status(400).json({ error: 'conversationId or contactId is required' });
    }

    let contact = null;
    let contactIdToUse = contactId;
    
    // If we have conversationId, get conversation first to get contactId
    if (conversationId && !contactId) {
      const conversation = await getChatwootConversation(conversationId);
      if (conversation) {
        // Chatwoot API returns contact ID in conversation.contact.id or conversation.contact_id
        contactIdToUse = conversation.contact?.id || conversation.contact_id;
      }
    }
    
    // Fetch contact using contactId
    if (contactIdToUse) {
      contact = await getChatwootContact(contactIdToUse);
    }

    if (!contact) {
      return res.status(404).json({ error: 'Contact not found' });
    }

    // Extract email from contact - Chatwoot returns it in contact.email or contact.contact.email
    const email = contact.email || 
                 contact.contact?.email ||
                 contact.identifier ||
                 (contact.additional_attributes && contact.additional_attributes.email);

    if (!email || !email.includes('@')) {
      return res.status(404).json({ error: 'Contact email not found' });
    }

    res.json({
      email,
      contact: {
        id: contact.id,
        name: contact.name,
        email: email
      }
    });
  } catch (error) {
    console.error('Error fetching Chatwoot contact:', error);
    res.status(500).json({ 
      error: 'Failed to fetch contact from Chatwoot',
      message: error.message 
    });
  }
});

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

// Update contact in Brevo
app.put('/api/brevo/contact/:email', async (req, res) => {
  try {
    const { email } = req.params;
    const { attributes } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    if (!attributes || Object.keys(attributes).length === 0) {
      return res.status(400).json({ error: 'Attributes are required' });
    }

    const result = await updateBrevoContact(email, attributes);

    res.json({
      success: true,
      email,
      contact: result
    });
  } catch (error) {
    console.error('Error updating contact:', error);
    res.status(500).json({ 
      error: 'Failed to update contact in Brevo',
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

