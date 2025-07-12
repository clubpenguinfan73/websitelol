# Get Spotify Refresh Token - Simple Method

## Step 1: Create Spotify App
1. Go to https://developer.spotify.com/dashboard
2. Click "Create App" 
3. Fill in:
   - **App Name**: Your Profile Website
   - **App Description**: Personal profile integration
   - **Redirect URI**: `https://httpbin.org/anything`
4. Save and copy your **Client ID** and **Client Secret**

## Step 2: Get Authorization Code
1. Click this URL to authorize your app:

```
https://accounts.spotify.com/authorize?client_id=f3de4f2a29744cd08369c0d071bb3a1a&response_type=code&redirect_uri=https://httpbin.org/anything&scope=user-read-currently-playing%20user-read-playback-state%20user-read-recently-played
```

2. Open this URL in your browser
3. Authorize the app
4. You'll be redirected to httpbin.org/anything with a JSON response showing your authorization code
5. Look for the "code" value in the "args" section of the JSON response (this is your authorization code)

## Step 3: Get Refresh Token
1. Open https://httpie.io/app or use curl/Postman
2. Make a POST request to `https://accounts.spotify.com/api/token` with:

**Headers:**
```
Content-Type: application/x-www-form-urlencoded
Authorization: Basic BASE64_ENCODED_CLIENT_CREDENTIALS
```

**Body (form-encoded):**
```
grant_type=authorization_code
code=YOUR_AUTHORIZATION_CODE
redirect_uri=https://httpbin.org/anything
```

**To get BASE64_ENCODED_CLIENT_CREDENTIALS:**
- Combine: `CLIENT_ID:CLIENT_SECRET`
- Base64 encode it (use https://www.base64encode.org/)

## Step 4: Alternative - Use curl command
Replace AUTHORIZATION_CODE with the code from Step 2 and run this:

```bash
curl -X POST "https://accounts.spotify.com/api/token" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -H "Authorization: Basic ZjNkZTRmMmEyOTc0NGNkMDgzNjljMGQwNzFiYjNhMWE6ZmZmZTQ0ZmEyNTg1NDZjMjhkOTJkMWZiZmI0NGQ2MmU=" \
  -d "grant_type=authorization_code&code=AUTHORIZATION_CODE&redirect_uri=https://httpbin.org/anything"
```

## Step 5: Get Your Credentials
The response will include a `refresh_token`. You'll need:
- SPOTIFY_CLIENT_ID (from Step 1)
- SPOTIFY_CLIENT_SECRET (from Step 1)  
- SPOTIFY_REFRESH_TOKEN (from Step 3/4)

Provide these as secrets to enable Spotify integration!