const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
(async()=>{
const records=new Map();let current={uid:'alice',email:'a@test'},lastPath='';const conflict=m=>({exists:records.has(m),data:()=>records.get(m)});
const db={
 collection(){return {doc(uid){return {collection(){return {
  doc(id){return {path:uid+'/'+id,get:async()=>conflict(uid+'/'+id)};},
  async get(){return {docs:[...records].filter(([k])=>k.startsWith(uid+'/')).map(([k,v])=>({id:k.split('/')[1],data:()=>v}))};}
 };}};}};},
 runTransaction(fn){return fn({get:async ref=>{lastPath=ref.path;return conflict(ref.path);},set:(ref,v)=>records.set(ref.path,v)});}
};
const auth={get currentUser(){return current;},setPersistence:async()=>{},onAuthStateChanged:fn=>{queueMicrotask(fn);return ()=>{};},signInWithPopup:async()=>{},signOut:async()=>{current=null;}};
function authFactory(){return auth;}authFactory.Auth={Persistence:{LOCAL:'local'}};authFactory.GoogleAuthProvider=function(){this.setCustomParameters=()=>{};};function firestore(){return db;}firestore.FieldValue={serverTimestamp:()=> 'server-time'};
const c={window:{RUNOFF_FIREBASE_CONFIG:{apiKey:'test',projectId:'test'}},firebase:{initializeApp(){},auth:authFactory,firestore},TextEncoder,Project:{validate:p=>p},queueMicrotask,console};c.window.firebase=c.firebase;vm.createContext(c);vm.runInContext(fs.readFileSync('firebase-cloud.js','utf8'),c);const api=c.window.FirebaseCloud;await api.ready;
const p={id:'case1',name:'測試案件',basins:[]},put=(rev,name)=>api.request('/api/projects/case1',{method:'PUT',headers:{'If-Match':String(rev)},body:JSON.stringify({...p,name})});
assert.equal((await put(0,'first')).revision,1);await assert.rejects(put(0,'stale'),e=>e.status===409);assert.equal((await put(1,'second')).revision,2);assert.equal(lastPath,'alice/case1');assert.equal((await api.request('/api/projects')).projects[0].project.name,'second');
current={uid:'bob',email:'b@test'};assert.equal((await api.request('/api/projects')).projects.length,0);await put(0,'bob copy');assert.equal(lastPath,'bob/case1');current={uid:'alice'};await api.request('/api/projects/case1',{method:'DELETE',headers:{'If-Match':'2'}});assert((await api.request('/api/projects')).projects[0].deleted);await assert.rejects(put(3,'resurrect'),e=>e.status===409);current=null;await assert.rejects(api.request('/api/me'),e=>e.status===401);
console.log('PASS Google adapter: account isolation, version conflicts, updates, deletion tombstones and signed-out denial.');
})().catch(e=>{console.error(e);process.exitCode=1;});
