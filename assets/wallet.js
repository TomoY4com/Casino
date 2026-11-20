/* 共通チップ(全ゲーム共通の財布)と配当表示
   localStorage は同じオリジンのページ間で共有されるため、
   どのゲームページからでも同じ残高を読み書きできます。 */
const Wallet=(()=>{
  const KEY="casino-wallet-v1",START=1000;
  const fresh=()=>({balance:START,net:0,rounds:0});
  const read=()=>{
    try{
      const o=JSON.parse(localStorage.getItem(KEY)||"null");
      if(o&&Number.isFinite(o.balance)&&o.balance>=0)
        return{balance:Math.floor(o.balance),net:Math.floor(+o.net||0),rounds:Math.max(0,Math.floor(+o.rounds||0))};
    }catch(e){}
    return fresh();
  };
  let s=read();const subs=[];
  // 別タブ・別ページでの変更を受け取る(自分自身の書き込みでは発火しません)
  try{addEventListener("storage",e=>{if(e.key===KEY){s=read();subs.forEach(f=>f({...s}))}})}catch(e){}
  return{
    START,
    get:()=>({...s}),
    set(p){s={...s,...p};try{localStorage.setItem(KEY,JSON.stringify(s))}catch(e){}},
    reset(){this.set(fresh())},
    on(f){subs.push(f)}
  };
})();

// 配当の合計(賭け金は引かない)を画面全体にフェード表示
function showPayout(v){
  let el=document.getElementById("payout");
  if(!el){el=document.createElement("div");el.id="payout";document.body.appendChild(el)}
  el.innerHTML=`<small>配当</small><b>${v.toLocaleString("ja-JP")}</b>`;
  el.getAnimations().forEach(a=>a.cancel());
  el.animate([
    {opacity:0,transform:"scale(.92)",offset:0},
    {opacity:1,transform:"scale(1)",offset:.15},
    {opacity:1,transform:"scale(1)",offset:.7},
    {opacity:0,transform:"scale(1.04)",offset:1}
  ],{duration:2600,easing:"ease-in-out"});
}
