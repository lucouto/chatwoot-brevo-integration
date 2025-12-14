# Chatwoot Brevo Integration Dashboard App

A Dashboard App for Chatwoot that integrates with Brevo (formerly Sendinblue) to manage contacts and subscribe them to mailing lists directly from the Chatwoot interface.

## Features

- 🔍 **View Contact Details**: Display contact information from Brevo directly in Chatwoot
- 📋 **Subscribe to Lists**: Add contacts to Brevo mailing lists with one click
- 🔄 **Real-time Updates**: Automatically fetch contact data when viewing a conversation
- 🎨 **Modern UI**: Clean and intuitive interface integrated into Chatwoot

## Prerequisites

- Node.js 18+ installed
- A Brevo account with API access
- A Chatwoot instance (self-hosted)
- Domain configured: `brevo.cheminneuf.community`

## Setup

### 1. Get Your Brevo API Key

1. Log in to your [Brevo account](https://app.brevo.com/)
2. Go to **Settings** → **API Keys** (or **SMTP & API** → **API Keys**)
3. Create a new API key or copy an existing one
4. **Important**: Keep this key secure!

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Environment Variables

Create a `.env` file based on `.env.example`:

```bash
cp .env.example .env
```

Edit `.env` and add your Brevo API key:

```env
PORT=3000
BREVO_API_KEY=your_brevo_api_key_here
```

### 4. Run the Application

**Development:**
```bash
npm start
```

The server will start on `http://localhost:3000` (or the port specified in `.env`).

The Dashboard App will be available at: `http://localhost:3000/chatwoot`

## Deployment with Coolify

### Using Coolify

1. **Connect your GitHub repository** to Coolify
2. **Create a new application** in Coolify
3. **Set the domain** to: `brevo.cheminneuf.community`
4. **Add environment variables** in Coolify:
   - `BREVO_API_KEY`: Your Brevo API key
   - `PORT`: `3000` (usually auto-detected)
5. **Deploy** the application

### Docker Deployment

The included `Dockerfile` allows for containerized deployment:

```bash
docker build -t chatwoot-brevo .
docker run -p 3000:3000 -e BREVO_API_KEY=your_key chatwoot-brevo
```

## Configure Chatwoot Dashboard App

1. Log in to your Chatwoot instance
2. Go to **Settings** → **Integrations** → **Dashboard Apps**
3. Click **"Add Dashboard App"** or **"New Dashboard App"**
4. Fill in the configuration:
   - **Name**: `Brevo Integration` (or any name you prefer)
   - **URL**: `https://brevo.cheminneuf.community/chatwoot`
5. Save the configuration

## Usage

1. Open a conversation in Chatwoot
2. Click on the **"Brevo Integration"** tab (or the name you configured)
3. The app will automatically:
   - Fetch the contact's email from Chatwoot
   - Display their Brevo contact details (if they exist)
   - Show available mailing lists
4. To subscribe a contact to a list:
   - Select a list from the dropdown
   - Click **"S'abonner à la liste"** (Subscribe to list)
   - The contact will be added to the selected Brevo list

## API Endpoints

The application provides the following API endpoints:

### GET `/api/brevo/contact/:email`
Get contact details from Brevo by email.

**Response:**
```json
{
  "email": "contact@example.com",
  "exists": true,
  "contact": {
    "id": 123,
    "email": "contact@example.com",
    "attributes": { ... },
    "listIds": [1, 2, 3]
  }
}
```

### POST `/api/brevo/subscribe`
Subscribe a contact to a Brevo list.

**Request Body:**
```json
{
  "email": "contact@example.com",
  "listId": 1,
  "attributes": { ... }  // optional
}
```

**Response:**
```json
{
  "success": true,
  "email": "contact@example.com",
  "listId": 1,
  "result": { ... }
}
```

### GET `/api/brevo/lists`
Get all available Brevo lists.

**Response:**
```json
{
  "lists": [
    {
      "id": 1,
      "name": "Newsletter",
      "uniqueSubscribers": 100
    }
  ]
}
```

### POST `/api/brevo/contact`
Create or update a contact in Brevo.

**Request Body:**
```json
{
  "email": "contact@example.com",
  "attributes": { ... },  // optional
  "listIds": [1, 2]       // optional
}
```

### GET `/health`
Health check endpoint.

## Troubleshooting

### The tab doesn't appear in Chatwoot

- Verify the URL is correct in Chatwoot Dashboard Apps settings
- Ensure the application is accessible from Chatwoot (no CORS issues)
- Check Chatwoot logs for errors

### "Contact not found in Brevo"

- The contact doesn't exist in Brevo yet
- You can still subscribe them to a list (they will be created automatically)

### Contact details don't load

- Check that `BREVO_API_KEY` is correctly configured
- Verify the API key has the necessary permissions
- Check server logs for API errors

### Lists don't load

- Ensure your Brevo API key has permission to read lists
- Check that you have at least one list created in Brevo

### CORS Errors

The application is configured with CORS enabled. If you still see CORS errors:

1. Verify the server is running
2. Check that the domain is correctly configured
3. Ensure HTTPS is used in production

## Security Notes

- **Always use HTTPS** in production
- **Never commit** your `.env` file or API keys to Git
- **Keep your Brevo API key secure** - it has full access to your Brevo account
- The application uses CORS but doesn't implement additional authentication for the frontend

## Development

### Project Structure

```
chatwoot_brevo/
├── server.js           # Express server and API routes
├── public/
│   └── chatwoot.html   # Dashboard App frontend
├── package.json        # Dependencies
├── .env.example        # Environment variables template
├── Dockerfile          # Docker configuration
└── README.md           # This file
```

### Testing Locally

1. Start the server: `npm start`
2. Open `http://localhost:3000/chatwoot` in your browser
3. Test the API endpoints using curl or Postman

Example:
```bash
curl http://localhost:3000/api/brevo/contact/test@example.com
```

## License

MIT

## Support

For issues related to:
- **Brevo API**: Check [Brevo API Documentation](https://developers.brevo.com/reference/getting-started-1)
- **Chatwoot**: Check [Chatwoot Documentation](https://www.chatwoot.com/docs)


