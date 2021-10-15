const attrs = {};
attrs["Credential"] = "";

function eraseCookie(cookieName) {
  delete attrs[cookieName];
}

eraseCookie("credential");

function getCredential() {
  const credential = attrs["Credential"];
  return credential;
}

function createCookie(cookieName, cookiePayload) {
  attrs[cookieName] = cookiePayload;
  return attrs;
}
createCookie(
  "credential",
  "someRandomCatchyHash37f1f79255b66b5c02348e3dc6ff5fcd559654e2"
);
