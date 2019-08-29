// constants with your own configuration properties
const oidcProvider = 'oidc-handbook.auth0.com';
const audience = 'https://to-dos.somedomain.com';
const clientId = 'bKikeccK4xDZvq5cssoBlw6Jtq7HPHFH';

// constants that represent configuration you won't need to change
const scope = 'openid profile email read:to-dos';
const redirectURI = 'http://localhost:3000/#callback';
const codeChallengeMethod = 'S256';
const responseType = 'code';

// code verifier and challenge for the PKCE flow
let codeVerifier = sessionStorage.getItem('codeVerifier') || '';
let codeChallenge = '';

// user data
let idToken = '';
let accessToken = '';
let profile = '';

function createRandomString() {
  const charset = '0123456789ABCDEFGHIJKLMNOPQRSTUVXYZabcdefghijklmnopqrstuvwxyz-_~.';
  let random = '';
  const randomValues = Array.from(crypto.getRandomValues(new Uint8Array(43)));
  randomValues.forEach(v => (random += charset[v % charset.length]));
  return random;
}

function urlEncodeBase64(input) {
  const b64Chars = { '+': '-', '/': '_', '=': '' };
  return input.replace(/[\+\/=]/g, (m) => b64Chars[m]);
}

function sha256(input) {
  return window.crypto.subtle.digest({ name: 'SHA-256' }, new TextEncoder().encode(input));
}

function bufferToBase64URLEncoded(input) {
  const ie11SafeInput = new Uint8Array(input);
  return urlEncodeBase64(
    window.btoa(String.fromCharCode(...Array.from(ie11SafeInput)))
  );
}

async function login() {
  codeVerifier = createRandomString();
  codeChallenge = bufferToBase64URLEncoded(await sha256(codeVerifier));
  sessionStorage.setItem('codeVerifier', codeVerifier);
  window.location = `https://${oidcProvider}/authorize?` +
    `audience=${audience}` +
    `&scope=${scope}` +
    `&response_type=${responseType}` +
    `&client_id=${clientId}` +
    `&code_challenge=${codeChallenge}` +
    `&code_challenge_method=${codeChallengeMethod}` +
    `&redirect_uri=${redirectURI}`;
}

function isAuthenticated() {
  return idToken !== '';
}

async function handleRedirectCallback() {
  const queryParams = getQueryParams();
  const code = queryParams.find(queryParam => (queryParam.key === 'code'));

  const codeExchangeURL = `https://${oidcProvider}/oauth/token`;
  const codeExchangeFormData = new URLSearchParams();
  codeExchangeFormData.set('grant_type', 'authorization_code');
  codeExchangeFormData.set('client_id', clientId);
  codeExchangeFormData.set('code_verifier', codeVerifier);
  codeExchangeFormData.set('code', code.value);
  codeExchangeFormData.set('redirect_uri', redirectURI);

  const response = await fetch(codeExchangeURL, {
    method: 'POST',
    mode: 'cors',
    cache: 'no-cache',
    body: codeExchangeFormData,
  });

  const responseBody = await response.json();
  accessToken = responseBody.access_token;
  idToken = responseBody.id_token;
  console.log(idToken);
}

function getQueryParams() {
  const {search} = window.location;
  return search.replace('?', '').split('&').map(queryParam => {
    const keyValue = queryParam.split('=');
    return {
      key: keyValue[0],
      value: keyValue[1]
    }
  });
}

function getAccessToken() {
  return accessToken;
}

function getIdToken() {
  return idToken;
}

function getUser() {
  return profile;
}
