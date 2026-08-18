export async function getAdobeAccessToken(): Promise<string> {
    const clientId = process.env.ADOBE_CLIENT_ID;
    const clientSecret = process.env.ADOBE_CLIENT_SECRET;

    if (!clientId || !clientSecret) {
        // throw new Error("Missing Adobe Client ID or Secret in environment variables.");
        console.warn("[Adobe Auth] Missing credentials, using mock token for MVP simulation.");
        return "mock_adobe_token_12345";
    }

    // Adobe IMS Token Endpoint for Service Account (OAuth Server-to-Server)
    const tokenUrl = "https://ims-na1.adobelogin.com/ims/token/v3";

    // Default scopes for InDesign / Firefly services (Adjust if specific scopes are required)
    const scopes = "openid,AdobeID,read_organizations,firefly_api,ff_apis";

    const params = new URLSearchParams();
    params.append("grant_type", "client_credentials");
    params.append("client_id", clientId);
    params.append("client_secret", clientSecret);
    params.append("scope", scopes);

    try {
        const response = await fetch(tokenUrl, {
            method: "POST",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
            },
            body: params.toString(),
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Adobe Auth Failed: ${response.status} - ${errorText}`);
        }

        const data = await response.json();

        // Log success as requested by the user
        console.log("Adobe Access Token: [SUCCESS]");

        return data.access_token;
    } catch (error) {
        console.error("Error fetching Adobe access token:", error);
        throw error;
    }
}
