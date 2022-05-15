// constants with your own configuration properties
const oidcProvider = 'Set OIDC provider';
const clientId = 'Set client id';
const audience = 'http://localhost:3030';

// constants that represent configuration you won‘t need to change
const responseType = 'code';
const redirectURI = 'http://localhost:3003/#callback';
const scope = 'openid profile email read:to-dos';
const codeChallengeMethod = 'S256';

// code verifier and challenge for the PKCE flow
let codeVerifier = sessionStorage.getItem('codeVerifier') || '' ;
let codeChallenge = '';

// user data
let idToken = '' ;
let accessToken = '' ;
let profile = '';

async function login () {
  codeVerifier = createRandomString();
  codeChallenge = bufferToBase64URLEncoded(await sha256(codeVerifier));
  sessionStorage.setItem('codeVerifier', codeVerifier );
  window.location = `https://${oidcProvider}/authorize?` +
    `audience=${audience}` +
    `&scope=${scope}` +
    `&response_type=${responseType}` +
    `&client_id=${clientId}` +
    `&code_challenge=${codeChallenge}` +
    `&code_challenge_method=${codeChallengeMethod}` +
    `&redirect_uri=${redirectURI}`;
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
  console.log(responseBody);
  accessToken = responseBody.access_token;
  idToken = responseBody.id_token;
  profile = validateIdToken(idToken);
}

function validateIdToken(idToken) {
  const decodedToken = jwt_decode(idToken);
  // fetch ID token details
  const {
    aud: audience,
    exp: expirationDate,
    iss: issuer
  } = decodedToken;
  
  const currentTime = Math.floor(Date.now() / 1000);
  // validate ID tokens
  if(audience !== clientId ||
      expirationDate < currentTime ||
      issuer !== `https://${oidcProvider}/`
      ) {
    throw Error ();
  }
  // return the decoded token
  return decodedToken ;
}

function isAuthenticated() {
  return idToken;
}

function getProfile() {
  return profile;
}
 
function getAccessToken() {
  return accessToken;
}
 