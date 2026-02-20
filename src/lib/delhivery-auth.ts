/**
 * Delhivery Authentication Utility
 * Handles token generation for Delhivery API
 */

const DELHIVERY_USERNAME = process.env.DELHIVERY_USERNAME || "ALLAHABADORGANIC5167B2B";
const DELHIVERY_PASSWORD = process.env.DELHIVERY_PASSWORD || "Manju@5864";
const DELHIVERY_AUTH_URL = "https://ltl-clients-api.delhivery.com/ums/login";

/**
 * Fetch a new auth token from Delhivery API
 */
export async function generateDelhiveryToken(): Promise<string> {
  if (!DELHIVERY_USERNAME || !DELHIVERY_PASSWORD) {
    throw new Error('Delhivery credentials not configured');
  }

  const options = {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ 
      username: DELHIVERY_USERNAME, 
      password: DELHIVERY_PASSWORD,
    })
  };

  try {
    const response = await fetch(DELHIVERY_AUTH_URL, options);
    const responseText = await response.text();

    if (!response.ok) {
      console.error("Delhivery authentication error:", response.status, responseText);
      throw new Error(`Failed to authenticate with Delhivery: ${response.status} ${responseText}`);
    }

    let data;
    try {
      data = JSON.parse(responseText);
    } catch (e) {
      console.error("Failed to parse Delhivery authentication response:", e);
      console.error("Raw response:", responseText);
      throw new Error(`Invalid JSON response from Delhivery: ${responseText}`);
    }

    // The token is now inside data.data.jwt
    if (!data.data || !data.data.jwt) {
      throw new Error(`Invalid response from Delhivery authentication API: ${JSON.stringify(data)}`);
    }

    return data.data.jwt;
  } catch (error) {
    console.error('Delhivery authentication error:', error);
    throw error;
  }
}

/**
 * Always generate a new Delhivery token (no caching)
 */
export async function getDelhiveryToken(): Promise<string> {
  try {
    return await generateDelhiveryToken();
  } catch (error) {
    console.error('Error getting Delhivery token:', error);
    throw error;
  }
}

