# URL Metadata Cloud Function

This folder contains a Firebase Cloud Function to handle URL metadata fetching for the AuraMark application.

## Features

- Fetches metadata from URLs (title, description, image)
- Handles CORS properly for frontend integration
- Prioritizes Open Graph and Twitter Card metadata
- Provides fallbacks when metadata is missing

## Implementation

Two endpoints are provided:

1. `fetchUrlMetadata`: A callable function for use with the Firebase SDK
2. `getUrlMetadata`: An HTTP endpoint with CORS support for direct API access

## Deployment

To deploy the Cloud Function:

```bash
cd functions
npm install
firebase deploy --only functions
```

## Usage in Frontend

The function is integrated with the AddBookmarkModal component to automatically fetch metadata when a URL is entered.

Example usage:

```javascript
import { fetchUrlMetadata } from '../firebase/functions';

// Using the callable function
const result = await fetchUrlMetadata({ url: 'https://example.com' });
if (result.data.success) {
  const { title, description, image } = result.data.metadata;
  // Use the metadata...
}
```