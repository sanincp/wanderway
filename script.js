/* Wander Way Tours & Travels LLP - loading animation
   1) plane flies and writes the W   2) "anderway" is written letter by letter   3) coming-soon page appears.
   Call finish() yourself if you want to control when the page is revealed. */

(function(){
  const $=id=>document.getElementById(id);
  const route=$('route'),plane=$('plane'),Wp=$('W'),loader=$('loader'),ink=$('ink'),map=$('inkmap');
  const CX=210.3,CY=93.6,ANG0=-47;        // plane's own centre & heading in the logo
  const L=route.getTotalLength(),DURATION=4200,TAIL=500,LEAD=26;
  const ease=t=>.5-.5*Math.cos(Math.PI*t),out=t=>1-(1-t)*(1-t);

  /* ---- Ink reveal: drawn on a <canvas> so it works in every browser (incl. iPhone Safari/Chrome) ----
     "ink map" = a small image that stores, for each pixel of the W, WHEN the plane flies past it (0-255).
     Every frame we keep only the pixels the plane has already passed, and draw the pink W through them. */
  const MX=215,MY=155;                    // area (in logo units) covered by the ink map
  let ready=false,ord,md,mc,mctx,ctx,WP,last=-999;
  function noInk(){ready=false;Wp.style.visibility='visible';ink.style.display='none';}   // fallback: just show the W
  function setup(){
    try{
      const w=map.naturalWidth,h=map.naturalHeight,t=document.createElement('canvas');
      t.width=w;t.height=h;const tc=t.getContext('2d');tc.drawImage(map,0,0);
      const px=tc.getImageData(0,0,w,h).data;ord=new Uint8Array(w*h);
      for(let i=0;i<ord.length;i++)ord[i]=px[i*4];
      mc=document.createElement('canvas');mc.width=w;mc.height=h;mctx=mc.getContext('2d');md=mctx.createImageData(w,h);
      ctx=ink.getContext('2d');WP=new Path2D(Wp.getAttribute('d'));ready=true;
    }catch(e){noInk();}
  }
  function reveal(th){
    if(!ready)return;
    const t=Math.round(th*255);if(t===last)return;last=t;            // redraw only when the front has moved
    const a=md.data;for(let i=0,n=ord.length;i<n;i++)a[i*4+3]=ord[i]<=t?255:0;
    mctx.putImageData(md,0,0);
    const dpr=Math.min(window.devicePixelRatio||1,3),r=loader.getBoundingClientRect();
    const cw=Math.round(r.width*dpr),ch=Math.round(r.height*dpr);
    if(ink.width!==cw||ink.height!==ch){ink.width=cw;ink.height=ch;}
    const s=cw/700;                                                  // logo units -> canvas pixels
    ctx.globalCompositeOperation='source-over';ctx.setTransform(1,0,0,1,0,0);ctx.clearRect(0,0,cw,ch);
    ctx.setTransform(s,0,0,s,0,-50*s);ctx.fillStyle='#E0098A';ctx.fill(WP);
    ctx.setTransform(1,0,0,1,0,0);ctx.globalCompositeOperation='destination-in';
    ctx.drawImage(mc,0,0,MX*s,MY*s);ctx.globalCompositeOperation='source-over';
  }

  let cur=null,t0;
  function place(d){
    const a=route.getPointAtLength(d),b=route.getPointAtLength(Math.min(L,d+3)),c=route.getPointAtLength(Math.max(0,d-3));
    const tgt=Math.atan2(b.y-c.y,b.x-c.x)*180/Math.PI; if(cur===null)cur=tgt;
    cur+=(((tgt-cur+540)%360)-180)*.3;            // smooth turning
    plane.setAttribute('transform',`translate(${a.x} ${a.y}) rotate(${cur-ANG0}) translate(${-CX} ${-CY})`);
  }
  function frame(ts){
    if(t0===undefined)t0=ts; const el=ts-t0; plane.style.opacity=1;
    if(el<DURATION){const d=L*ease(el/DURATION);place(d);reveal((d-LEAD)/L);}      // plane flies, ink follows just behind
    else if(el<DURATION+TAIL){place(L);reveal((L-LEAD*(1-out((el-DURATION)/TAIL)))/L);} // ink catches up to the plane
    else return land();
    requestAnimationFrame(frame);
  }
  function land(){
    plane.removeAttribute('transform');plane.classList.remove('flying');   // plane rests exactly as in the logo
    Wp.style.visibility='visible';ink.style.display='none';                 // complete, exact vector W
    write();                                                                // "anderway" is written letter by letter
  }
  // Handwriting-style reveal: each letter is wiped in left-to-right with a slanted pen edge, one after another
  const LET=[[159.5, 213.5, 120.0, 201.0], [224.0, 279.8, 120.0, 199.8], [290.2, 346.8, 102.5, 201.0], [358.0, 412.8, 119.8, 201.2], [423.2, 457.2, 120.2, 199.8], [462.5, 563.2, 121.0, 201.0], [570.8, 624.5, 120.0, 201.0], [628.0, 689.5, 121.0, 224.2]],PAD=3,SLANT=12,ST=140,DUR=380;
  function write(){
    let s;
    function step(now){
      if(s===undefined)s=now; const el=now-s; let done=true;
      LET.forEach(([x0,x1,tp,bt],i)=>{
        const q=Math.min(1,Math.max(0,(el-i*ST)/DUR)); if(q<1)done=false;
        const e=ease(q)*(x1-x0+2*PAD+SLANT), a=x0-PAD;
        $('p'+i).setAttribute('points',`${a},${tp} ${a+e},${tp} ${a+e-SLANT},${bt} ${a},${bt}`);
      });
      if(!done)requestAnimationFrame(step);
      else{LET.forEach((_,i)=>$('l'+i).removeAttribute('clip-path'));setTimeout(finish,800);}
    }
    requestAnimationFrame(step);
  }
  // Call finish() when your site is ready to hide the loader.
  function finish(){document.body.classList.add('ready');document.dispatchEvent(new Event('wanderway:loaded'));}
  // start once the ink map has decoded (or show the plain W if anything goes wrong)
  const go=()=>requestAnimationFrame(frame);
  if(map.complete&&map.naturalWidth){setup();go();}
  else{map.addEventListener('load',()=>{setup();go();});map.addEventListener('error',()=>{noInk();go();});}
})();