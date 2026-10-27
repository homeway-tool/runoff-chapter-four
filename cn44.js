(function(root){
'use strict';
const P=root.Project,D=root.CNData;
function sync(s){if(s.soilGroup===undefined)s.soilGroup='';for(const b of s.basins){b.cnMode='weighted';for(const r of b.land){if(r.landCode){const item=D.find(x=>x.code===r.landCode);r.cn=item&&['A','B','C'].includes(s.soilGroup)?item[s.soilGroup]:null;}}}return s;}
function total(b){const area=b.land.reduce((v,r)=>v+(r.area||0),0),complete=b.land.length>0&&b.land.every(r=>typeof r.area==='number'&&r.area>=0&&typeof r.cn==='number'&&r.cn>0);const product=complete?b.land.reduce((v,r)=>v+r.area*r.cn,0):NaN;return {area,product,cn:complete&&area>0?product/area:NaN};}
const validate=P.validate,missing=P.missing;
P.validate=function(s){sync(s);if(!['','A','B','C'].includes(s.soilGroup))throw Error('基地土壤分類須為 A、B 或 C');for(const b of s.basins)for(const r of b.land)if(r.landCode&&!D.some(x=>x.code===r.landCode))throw Error('土地利用代碼不存在');return validate(s);};
P.missing=function(s){sync(s);const out=missing(s);for(const b of s.basins)if(b.tcMode==='direct')out.push({page:'tc',basin:b.id,text:b.name+'：選擇流入時間計算方式並補齊流入時間'});for(const b of s.basins)if(b.cnMode==='weighted'&&!Number.isFinite(total(b).cn)&&!out.some(x=>x.page==='cn'&&x.basin===b.id))out.push({page:'cn',basin:b.id,text:b.name+'：請補齊土地利用面積與 CN 查表資料'});return out;};
function adopted(b){return Number.isFinite(total(b).cn)?root.H.adoptedCN(b):NaN;}
root.CN44={sync,total,adopted};
})(globalThis);
