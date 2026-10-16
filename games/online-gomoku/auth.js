import { initializeApp } from "https://www.gstatic.com/firebasejs/13.0.0/firebase-app.js";
import { getAuth, GithubAuthProvider, signInWithPopup, signOut,
  setPersistence, inMemoryPersistence } from "https://www.gstatic.com/firebasejs/13.0.0/firebase-auth.js";
import { firebaseConfig } from "./config.js";

const KEY = "online-gomoku-github-app-token-v2";
const LEGACY_KEY = "online-gomoku-token-v1";
const LOGOUT = "online-gomoku-logout-v1";
const auth = getAuth(initializeApp(firebaseConfig));
await setPersistence(auth, inMemoryPersistence);
let memoryToken = null;
let persistent = false;
export function savedToken() {
  // Discard OAuth App credentials in both stores, retaining pending game writes.
  for (const name of ["sessionStorage", "localStorage"]) {
    try { window[name].removeItem(LEGACY_KEY); } catch { /* Storage is optional. */ }
  }
  for (const name of ["sessionStorage", "localStorage"]) {
    try {
      const value = window[name].getItem(KEY);
      if (value?.startsWith("ghu_")) { memoryToken = value; persistent = name === "localStorage"; return value; }
      if (value) window[name].removeItem(KEY);
    } catch { /* Storage is optional. */ }
  }
  return memoryToken;
}
export function clearToken() {
  memoryToken = null;
  for (const name of ["sessionStorage", "localStorage"]) {
    try { window[name].removeItem(KEY); window[name].removeItem(LEGACY_KEY); } catch { /* In-memory fallback. */ }
  }
}
export async function login(remember) {
  const provider = new GithubAuthProvider();
  // GitHub App permissions are configured in GitHub, not requested as scopes.
  const result = await signInWithPopup(auth, provider);
  const token = GithubAuthProvider.credentialFromResult(result)?.accessToken;
  if (!token) throw new Error("noToken");
  if (!token.startsWith("ghu_")) throw new Error("wrongTokenType");
  clearToken();
  memoryToken = token;
  persistent = remember;
  let stored = true;
  try { window[remember ? "localStorage" : "sessionStorage"].setItem(KEY, token); }
  catch { stored = false; }
  return { token, stored };
}
export async function logout(notify = true) {
  clearToken();
  if (notify) {
    try { localStorage.setItem(LOGOUT, String(Date.now())); } catch { /* Optional. */ }
  }
  if (auth) await signOut(auth);
}
export function watchLogout(callback) {
  window.addEventListener("storage", event => {
    if (event.key === LOGOUT || (persistent && event.key === KEY && !event.newValue)) callback();
  });
}
