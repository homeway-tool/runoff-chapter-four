'use strict';
// Firebase adapter for the existing revision-aware sync UI. No ChatGPT server is required.
window.FirebaseCloud=(()=>{
 let auth,db,configured=false;
 const error=(message,status)=>Object.assign(new Error(message),{status});
 const ready=(async()=>{
  const config=window.RUNOFF_FIREBASE_CONFIG;
  if(!config||/PASTE_|YOUR_/.test(JSON.stringify(config)))throw error('尚未設定 Google 登入：請依 README 修改 firebase-config.js；目前可使用本機案件。',503);
  if(!window.firebase)throw error('登入元件未載入，請確認網路後重新整理；目前可使用本機案件。',503);
  firebase.initializeApp(config);auth=firebase.auth();db=firebase.firestore();
  await auth.setPersistence(firebase.auth.Auth.Persistence.LOCAL);
  await new Promise((resolve,reject)=>{const stop=auth.onAuthStateChanged(()=>{stop();resolve();},reject);});
  configured=true;
 })();
 // The UI awaits ready as well; attach a handler immediately to avoid an unhandled rejection.
 ready.catch(()=>{});
 function errorMessage(e){const known={
  'auth/unauthorized-domain':'此網址未授權 Google 登入，請至 Firebase Authentication 的 Authorized domains 加入網站網域。',
  'auth/popup-blocked':'登入視窗被瀏覽器阻擋，請允許彈出視窗，再按 Google 登入。',
  'auth/popup-closed-by-user':'登入視窗已關閉，尚未完成登入。',
  'auth/operation-not-allowed':'請先在 Firebase Authentication 啟用 Google 登入。',
  'permission-denied':'無法讀寫雲端案件，請確認已發布 firestore.rules 的規則，並已登入正確帳號。',
  'unavailable':'雲端連線暫時無法使用，本機修改仍會保留。'};
  return known[e.code]||e.message||'雲端操作失敗';
 }
 async function signIn(){await ready;if(!configured)throw error('請先完成 Firebase 設定',503);const provider=new firebase.auth.GoogleAuthProvider();provider.setCustomParameters({prompt:'select_account'});return auth.signInWithPopup(provider);}
 async function signOut(){await ready;return auth.signOut();}
 async function request(path,options={}){
  await ready;const user=auth.currentUser;if(!user)throw error('尚未登入',401);
  if(path==='/api/me')return {user:{id:user.uid,email:user.email}};
  const coll=db.collection('users').doc(user.uid).collection('projects');
  try{
   if(path==='/api/projects'){
    const snapshot=await coll.get({source:'server'});
    return {projects:snapshot.docs.map(doc=>{const v=doc.data();return {id:doc.id,revision:v.revision,deleted:v.deleted,project:v.deleted?null:JSON.parse(v.payload)};})};
   }
   const match=path.match(/^\/api\/projects\/([^/]+)$/);if(!match)throw error('不支援的資料操作',400);
   const id=decodeURIComponent(match[1]);if(!/^[A-Za-z0-9_-]{1,160}$/.test(id))throw error('案件代碼格式不符',400);
   const ref=coll.doc(id),method=options.method||'GET';
   if(method==='GET'){const snap=await ref.get({source:'server'});if(!snap.exists||snap.data().deleted)throw error('案件不存在',404);const v=snap.data();return {project:JSON.parse(v.payload),revision:v.revision};}
   const expected=Number(options.headers?.['If-Match']);if(!Number.isInteger(expected)||expected<0)throw error('缺少版本資訊，請重新整理雲端',400);
   let payload='{}',name='';
   if(method==='PUT'){
    const p=Project.validate(JSON.parse(options.body));if(p.id!==id)throw error('案件代碼不一致',400);
    payload=JSON.stringify(p);name=p.name;
    if(new TextEncoder().encode(payload).length>850000)throw error('案件超過單筆雲端容量（850 KB），請先下載 JSON 備份。',413);
   }else if(method!=='DELETE')throw error('不支援的資料操作',400);
   return await db.runTransaction(async tx=>{
    const snap=await tx.get(ref),old=snap.exists?snap.data():null;
    if((old?.revision||0)!==expected||old?.deleted||(method==='DELETE'&&!old))throw error('其他裝置已更新或刪除案件',409);
    const revision=expected+1;tx.set(ref,{name:method==='DELETE'?(old.name||''):name,payload,revision,deleted:method==='DELETE',updatedAt:firebase.firestore.FieldValue.serverTimestamp()});
    return {revision};
   });
  }catch(e){if(!e.status)e.message=errorMessage(e);throw e;}
 }
 return {ready,request,signIn,signOut,errorMessage};
})();
