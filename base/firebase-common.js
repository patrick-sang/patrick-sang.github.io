import { initializeApp } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-app.js";
import { getAuth, onAuthStateChanged, signInAnonymously, signInWithEmailAndPassword, signOut } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-auth.js";
import { getFirestore, collection, doc, getDoc, getDocs, addDoc, setDoc, updateDoc, deleteDoc, onSnapshot, query, orderBy, serverTimestamp, runTransaction } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-firestore.js";
import { firebaseConfig } from "./firebase-config.js";

export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const fb = {collection,doc,getDoc,getDocs,addDoc,setDoc,updateDoc,deleteDoc,onSnapshot,query,orderBy,serverTimestamp,runTransaction};
export let isAdmin = false;
export function safeText(value=""){return String(value ?? "").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));}
export function validHttpUrl(value=""){try{const u=new URL(value);return ["http:","https:"].includes(u.protocol)?u.href:""}catch{return ""}}
// Images are hosted with the website (for example in /img/) or on an external image host.
// No Firebase Storage bucket or paid Storage plan is required.
export function validImageSource(value=""){
  const raw=String(value ?? "").trim();
  if(!raw) return "";
  if(/^data:image\/(png|jpeg|jpg|webp|gif|svg\+xml)[;,]/i.test(raw)) return raw;
  // Keep relative website paths relative so localhost paths are not accidentally saved to Firestore.
  if(!/^[a-zA-Z][a-zA-Z0-9+.-]*:/.test(raw) && !raw.startsWith("//")) return raw;
  try {
    const u=new URL(raw);
    return ["http:","https:"].includes(u.protocol)?u.href:"";
  } catch { return ""; }
}
export async function signInAdmin(){
  const email=prompt("Admin email address:"); if(!email) return null;
  const password=prompt("Admin password:"); if(!password) return null;
  return await signInWithEmailAndPassword(auth,email.trim(),password);
}
export function watchAuth(callback){
 return onAuthStateChanged(auth,async user=>{
  try{if(!user) {await signInAnonymously(auth);return;}
   const snap=await getDoc(doc(db,"admins",user.uid)); isAdmin=!!snap.exists() && snap.data().enabled!==false;
   document.body.classList.toggle("firebase-admin",isAdmin);
   callback({user,isAdmin});
  }catch(error){console.error(error);callback({user,isAdmin:false,error});}
 });
}
export {onAuthStateChanged,signInAnonymously,signOut,signInWithEmailAndPassword,serverTimestamp};
