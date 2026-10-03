/* Wander Way Tours & Travels LLP - loading animation
   1) plane flies and writes the W   2) "anderway" is written letter by letter   3) coming-soon page appears.
   Call finish() yourself if you want to control when the page is revealed. */

(function(){
  const $=id=>document.getElementById(id);
  const route=$('route'),plane=$('plane'),Wp=$('W'),fs=[...document.querySelectorAll('.f')];
  const CX=210.3,CY=93.6,ANG0=-47;        // plane's own centre & heading in the logo
  const L=route.getTotalLength(),DURATION=4200,TAIL=500,LEAD=26,K=300;
  const ease=t=>.5-.5*Math.cos(Math.PI*t),out=t=>1-(1-t)*(1-t);
  const reveal=th=>{const c=(K*th+.5).toFixed(3);fs.forEach(f=>f.setAttribute('intercept',c));};
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
    Wp.removeAttribute('mask');                                             // complete, exact W
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
  requestAnimationFrame(frame);
})();
