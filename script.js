(()=>{'use strict';
const C=document.getElementById('game'),X=C.getContext('2d'),W=1280,H=720,S='diliJungleV2';
const A={logo:'assets/dlicom-logo.png',mascot:'assets/dili-mascot.png'},I={};
Object.entries(A).forEach(([k,s])=>{
  let i=new Image;
  i.src=s;
  i.onload=()=>I[k]=i
});

let save=Object.assign({
  coins:0,
  stars:0,
  unlocked:1,
  done:{},
  sound:true,
  music:true,
  vibration:true,
  tilt:false
},JSON.parse(localStorage.getItem(S)||'{}'));

const levels=[
  ['TUTORIAL',2800,10,3,1],
  ['EASY',3300,12,5,1.08],
  ['ROBOT ZONE',3800,14,7,1.18],
  ['GAPS & PLATFORMS',4400,17,9,1.3],
  ['CHALLENGE',5200,20,12,1.45]
];

let g={
  screen:'title',
  level:1,
  data:null,
  p:null,
  cam:0,
  score:0,
  coins:0,
  stars:0,
  kills:0,
  parts:[],
  shake:0,
  last:performance.now()
};

let key={l:false,r:false,j:false};

const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const rnd=(a,b)=>a+Math.random()*(b-a);

function saveIt(){
  localStorage.setItem(S,JSON.stringify(save))
}

function rr(x,y,w,h,r){
  r=Math.min(r,w/2,h/2);
  X.beginPath();
  X.moveTo(x+r,y);
  X.arcTo(x+w,y,x+w,y+h,r);
  X.arcTo(x+w,y+h,x,y+h,r);
  X.arcTo(x,y+h,x,y,r);
  X.arcTo(x,y,x+w,y,r);
  X.closePath()
}

function t(v,x,y,z=20,c='#fff',a='left',w=700){
  X.fillStyle=c;
  X.font=`${w} ${z}px Arial`;
  X.textAlign=a;
  X.fillText(v,x,y)
}

function panel(x,y,w,h,a=.88){
  X.fillStyle=`rgba(6,27,58,${a})`;
  rr(x,y,w,h,22);
  X.fill();
  X.strokeStyle='rgba(110,210,255,.5)';
  X.lineWidth=2;
  X.stroke()
}

function btn(x,y,w,h,l){
  X.fillStyle='#126dcc';
  rr(x,y,w,h,17);
  X.fill();
  X.strokeStyle='rgba(170,230,255,.55)';
  X.stroke();
  t(l,x+w/2,y+h/2+7,21,'#fff','center',800)
}

function fit(){
  let r=W/H,w=innerWidth,h=innerHeight;
  if(w/h>r)w=h*r;
  else h=w/r;
  C.style.width=w+'px';
  C.style.height=h+'px'
}

addEventListener('resize',fit);
fit();

function bg(cam=0){
  let q=X.createLinearGradient(0,0,0,H);
  q.addColorStop(0,'#67c9f4');
  q.addColorStop(.55,'#c8eddb');
  q.addColorStop(1,'#80ca69');
  X.fillStyle=q;
  X.fillRect(0,0,W,H);

  X.fillStyle='#ffe99a';
  X.beginPath();
  X.arc(1010,125,58,0,7);
  X.fill();

  X.fillStyle='#73b984';
  X.beginPath();
  X.moveTo(0,440);
  for(let x=0;x<=W;x+=80)
    X.lineTo(x,365+Math.sin((x+cam*.08)/170)*40);
  X.lineTo(W,H);
  X.lineTo(0,H);
  X.fill();

  X.fillStyle='#4d9b6e';
  X.beginPath();
  X.moveTo(0,510);
  for(let x=0;x<=W;x+=70)
    X.lineTo(x,430+Math.sin((x+cam*.13)/120)*30);
  X.lineTo(W,H);
  X.lineTo(0,H);
  X.fill();

  for(let i=-1;i<12;i++)
    tree(i*145-(cam*.22%145),360,1+(i%3)*.08)
}

function tree(x,y,s){
  X.save();
  X.translate(x,y);
  X.scale(s,s);

  X.fillStyle='#70472c';
  X.fillRect(-10,0,20,100);

  X.fillStyle='#24714a';

  [[0,-18,42],[30,4,34],[-28,5,34],[0,25,43]].forEach(p=>{
    X.beginPath();
    X.arc(p[0],p[1],p[2],0,7);
    X.fill()
  });

  X.restore()
}

function logo(x,y,w=300){
  if(I.logo){
    let r=I.logo.width/I.logo.height;
    X.drawImage(I.logo,x,y,w,w/r)
  }else{
    t('DLICOM',x+w/2,y+52,52,'#fff','center',900);
    t('JUNGLE GAME',x+w/2,y+82,18,'#dff8ff','center',800)
  }
}

function ball(x,y,r,a=1){
  X.save();
  X.globalAlpha=a;

  let q=X.createRadialGradient(
    x-r*.35,y-r*.4,3,
    x,y,r
  );

  q.addColorStop(0,'#74ddff');
  q.addColorStop(.55,'#177fe6');
  q.addColorStop(1,'#063b98');

  X.fillStyle=q;
  X.beginPath();
  X.arc(x,y,r,0,7);
  X.fill();

  X.strokeStyle='#8be3ff';
  X.lineWidth=5;
  X.stroke();

  if(I.mascot){
  let s=r*1.05;
  let ar=I.mascot.width/I.mascot.height;

  X.save();
  X.beginPath();
  X.arc(x,y,r-3,0,Math.PI*2);
  X.clip();

  X.drawImage(
    I.mascot,
    x-s/2,
    y-s/(2*ar),
    s,
    s/ar
  );

  X.restore();
  }
  }else{
    X.fillStyle='#1b6cdf';
    rr(x-r*.58,y-r*.25,r*1.16,r*.62,r*.2);
    X.fill();

    X.fillStyle='#f2fbff';

    for(let z of [-1,1]){
      X.beginPath();
      X.moveTo(x+z*r*.38,y);
      X.lineTo(x+z*r*.16,y-r*.2);
      X.lineTo(x+z*r*.02,y+r*.04);
      X.lineTo(x+z*r*.2,y+r*.2);
      X.closePath();
      X.fill()
    }

    X.fillStyle='#06182e';
    X.beginPath();
    X.arc(x-r*.22,y,3,0,7);
    X.arc(x+r*.22,y,3,0,7);
    X.fill()
  }

  X.restore()
}

function coin(x,y,r=16){
  let q=X.createRadialGradient(
    x-r*.3,y-r*.35,2,
    x,y,r
  );

  q.addColorStop(0,'#fff59a');
  q.addColorStop(.45,'#ffd33d');
  q.addColorStop(1,'#e98a00');

  X.fillStyle=q;
  X.beginPath();
  X.arc(x,y,r,0,7);
  X.fill();

  t('D',x,y+6,r*.9,'#9b5c00','center',900)
}

function robot(x,y){
  X.fillStyle='#172c3e';
  rr(x-27,y-22,54,34,8);
  X.fill();

  X.fillStyle='#ff5b4d';
  rr(x-15,y-16,30,12,4);
  X.fill();

  X.fillStyle='#142333';
  X.fillRect(x-10,y-11,5,5);
  X.fillRect(x+5,y-11,5,5);

  X.strokeStyle='#142333';
  X.lineWidth=4;
  X.beginPath();
  X.moveTo(x-16,y+12);
  X.lineTo(x-23,y+26);
  X.moveTo(x+16,y+12);
  X.lineTo(x+23,y+26);
  X.stroke()
}

function make(n){
  let L=levels[n-1];
  let ps=[{x:-220,y:590,w:650,h:70}];
  let cs=[];
  let es=[];
  let x=350;
  let i=0;

  while(x<L[1]){
    let w=190+i%3*45;
    let y=530-i%4*52;

    ps.push({
      x,
      y,
      w,
      h:35
    });

    x+=w+65+i%4*20;
    i++
  }

  ps.push({
    x:L[1]-80,
    y:505,
    w:400,
    h:85
  });

  for(let j=0;j<L[2];j++){
    let p=ps[1+(j*2)%(ps.length-2)];

    cs.push({
      x:p.x+p.w*.5,
      y:p.y-38,
      r:16,
      on:1
    })
  }

  for(let j=0;j<L[3];j++){
    let p=ps[2+(j*3)%(ps.length-3)];

    es.push({
      x:p.x+p.w/2,
      y:p.y-27,
      min:p.x+25,
      max:p.x+p.w-25,
      d:j%2?1:-1,
      s:(1+.18*(j%3))*L[4],
      dead:0
    })
  }

  return {
    L,
    ps,
    cs,
    es,
    goal:L[1]
  }
}

class P{
  constructor(){
    this.x=90;
    this.y=500;
    this.w=58;
    this.h=58;
    this.vx=0;
    this.vy=0;
    this.g=0;
    this.c=.1;
    this.lock=0;
    this.life=3;
    this.inv=0
  }

  get cx(){
    return this.x+29
  }

  get cy(){
    return this.y+29
  }

  update(d){
    if(key.l)this.vx-=1150*d;
    if(key.r)this.vx+=1150*d;

    if(save.tilt)
      this.vx+=g.tiltX*600*d;

    this.vx*=Math.pow(this.g?.8:.94,d*60);
    this.vx=clamp(this.vx,-360,360);

    this.vy+=1450*d;

    if(key.j&&!this.lock&&(this.g||this.c>0)){
      this.vy=-620;
      this.g=0;
      this.c=0;
      this.lock=1;
      beep(540,.06)
    }

    if(!key.j)
      this.lock=0;

    this.x+=this.vx*d;
    this.y+=this.vy*d;

    if(this.x<0)
      this.x=0;

    if(this.inv>0)
      this.inv-=d
  }

  draw(){
    if(this.inv>0&&Math.floor(this.inv*14)%2===0)
      return;

    ball(this.cx,this.cy,30)
  }
}

function start(n){
  g.level=n;
  g.data=make(n);
  g.p=new P;
  g.cam=0;
  g.score=0;
  g.coins=0;
  g.stars=0;
  g.kills=0;
  g.parts=[];
  g.screen='play';
  g.running=1
}

function hit(a,b){
  return a.x<b.x+b.w&&
         a.x+a.w>b.x&&
         a.y<b.y+b.h&&
         a.y+a.h>b.y
}

function physics(){
  let p=g.p;
  p.g=0;

  for(let q of g.data.ps){
    if(
      p.vy>=0&&
      p.y+p.h-p.vy*.016<=q.y+10&&
      p.x+p.w>q.x&&
      p.x<q.x+q.w&&
      p.y+p.h>=q.y&&
      p.y+p.h<=q.y+30
    ){
      p.y=q.y-p.h;
      p.vy=0;
      p.g=1;
      p.c=.1
    }
  }

  for(let e of g.data.es){
    if(e.dead)continue;

    e.x+=e.d*e.s*70/60;

    if(e.x<e.min){
      e.x=e.min;
      e.d=1
    }

    if(e.x>e.max){
      e.x=e.max;
      e.d=-1
    }

    let er={
      x:e.x-27,
      y:e.y-22,
      w:54,
      h:44
    };

    let pr={
      x:p.x+7,
      y:p.y+7,
      w:44,
      h:44
    };

    if(p.inv<=0&&hit(pr,er)){
      if(p.vy>100&&p.y+p.h<e.y+8){
        e.dead=1;
        p.vy=-470;
        g.kills++;
        g.score+=100;
        beep(180,.08)
      }else{
        p.life--;
        p.inv=2;
        p.vy=-420;
        p.vx=(p.cx<e.x?-1:1)*320;
        g.shake=10;

        if(p.life<=0){
          g.screen='gameover';
          g.running=0
        }
      }
    }
  }

  for(let c of g.data.cs)
    if(c.on&&Math.hypot(p.cx-c.x,p.cy-c.y)<41){
      c.on=0;
      g.coins++;
      g.score+=25;
      save.coins++;
      saveIt();
      beep(880,.05)
    }

  if(p.y>H+160){
    p.life--;

    if(p.life<=0){
      g.screen='gameover';
      g.running=0
    }else{
      p.x=Math.max(60,g.cam+90);
      p.y=350;
      p.vx=p.vy=0;
      p.inv=2
    }
  }

  if(p.x>g.data.goal){
    g.stars=
      g.coins>=g.data.L[2]*.8?3:
      g.coins>=g.data.L[2]*.4?2:1;

    g.score+=g.stars*100;

    save.done[g.level]=g.stars;

    if(g.level>=save.unlocked&&g.level<5)
      save.unlocked=g.level+1;

    save.stars=
      Object.values(save.done).reduce((a,b)=>a+b,0);

    saveIt();

    g.screen='complete';
    g.running=0
  }

  g.cam=clamp(
    g.cam+(p.x-360-g.cam)*.12,
    0,
    Math.max(0,g.data.goal-W*.65)
  )
}

function particles(d){
  for(let p of g.parts){
    p.l-=d;
    p.x+=p.vx*d;
    p.y+=p.vy*d;
    p.vy+=500*d
  }

  g.parts=g.parts.filter(p=>p.l>0)
}

function world(){
  bg(g.cam);

  X.save();

  if(g.shake>0)
    X.translate(
      rnd(-g.shake,g.shake),
      rnd(-g.shake,g.shake)
    );

  for(let p of g.data.ps){
    let x=p.x-g.cam;

    if(x>W+100||x+p.w<-100)
      continue;

    X.fillStyle='#573a29';
    rr(x,p.y,p.w,p.h,8);
    X.fill();

    X.fillStyle='#4da94f';
    rr(x,p.y-8,p.w,16,7);
    X.fill()
  }

  for(let c of g.data.cs)
    if(c.on)
      coin(c.x-g.cam,c.y,c.r);

  for(let e of g.data.es)
    if(!e.dead)
      robot(e.x-g.cam,e.y);

  let gx=g.data.goal-g.cam;

  X.strokeStyle='#5b3922';
  X.lineWidth=7;
  X.beginPath();
  X.moveTo(gx,510);
  X.lineTo(gx,400);
  X.stroke();

  X.fillStyle='#ff4e42';
  X.beginPath();
  X.moveTo(gx,405);
  X.lineTo(gx+80,420);
  X.lineTo(gx,438);
  X.fill();

  g.p.draw();

  X.restore()
}

function hud(){
  panel(15,14,365,64,.82);

  ball(54,46,24);

  t(
    levels[g.level-1][0],
    88,
    42,
    18
  );

  t(
    '❤'.repeat(g.p.life),
    88,
    64,
    17,
    '#ff6e6e'
  );

  panel(W-325,14,310,64,.82);

  t(
    '🪙 '+g.coins,
    W-250,
    53,
    20,
    '#ffe067',
    'center'
  );

  t(
    '★ '+g.stars,
    W-150,
    53,
    20,
    '#ffe067',
    'center'
  );

  t(
    g.score,
    W-50,
    53,
    18,
    '#fff',
    'center'
  )
}

function controls(){
  [
    ['◀',70,H-78],
    ['▶',170,H-78],
    ['▲',W-82,H-78]
  ].forEach(a=>{
    X.fillStyle='rgba(12,75,145,.82)';
    X.strokeStyle='#a5e5ff';

    X.beginPath();
    X.arc(a[1],a[2],37,0,7);
    X.fill();
    X.stroke();

    t(
      a[0],
      a[1],
      a[2]+10,
      29,
      '#fff',
      'center',
      900
    )
  });

  X.fillStyle='rgba(12,75,145,.82)';
  X.beginPath();
  X.arc(W-145,H-135,29,0,7);
  X.fill();

  t(
    'Ⅱ',
    W-145,
    H-125,
    20,
    '#fff',
    'center',
    900
  )
}

function draw(){
  X.clearRect(0,0,W,H);

  if(g.screen==='title'){
    bg();
    logo(425,65,430);
    ball(265,390,120);
    btn(470,420,340,90,'PLAY')
  }

  else if(g.screen==='menu'){
    menu()
  }

  else if(g.screen==='levels'){
    levelsScreen()
  }

  else if(g.screen==='profile'){
    profile()
  }

  else if(g.screen==='settings'){
    settings()
  }

  else if(g.screen==='play'){
    world();
    hud();
    controls()
  }

  else if(g.screen==='pause'){
    world();
    hud();

    panel(410,135,460,445,.95);

    t(
      'PAUSED',
      640,
      195,
      36,
      '#fff',
      'center',
      900
    );

    btn(500,225,280,58,'RESUME');
    btn(500,295,280,58,'RESTART');
    btn(500,365,280,58,'LEVEL SELECT');
    btn(500,435,280,58,'MAIN MENU')
  }

  else if(g.screen==='complete'){
    bg();

    panel(355,95,570,545,.95);

    t(
      'LEVEL COMPLETE!',
      640,
      155,
      34,
      '#fff',
      'center',
      900
    );

    t(
      '★'.repeat(g.stars)+'☆'.repeat(3-g.stars),
      640,
      215,
      52,
      '#ffd54a',
      'center',
      900
    );

    ball(640,340,78);

    t(
      'Coins collected: '+g.coins,
      640,
      450,
      20,
      '#ffe067',
      'center'
    );

    t(
      'Enemies defeated: '+g.kills,
      640,
      485,
      18,
      '#ccecff',
      'center'
    );

    t(
      'Score: '+g.score,
      640,
      518,
      18,
      '#ccecff',
      'center'
    );

    btn(
      465,
      555,
      350,
      55,
      g.level<5?'NEXT LEVEL':'PLAY AGAIN'
    )
  }

  else if(g.screen==='gameover'){
    bg();

    panel(400,145,480,430,.96);

    t(
      'GAME OVER',
      640,
      215,
      42,
      '#ff6b62',
      'center',
      900
    );

    ball(640,320,75,.75);

    t(
      'Score: '+g.score,
      640,
      420,
      22
    );

    btn(500,465,280,58,'RETRY');
    btn(500,535,280,58,'MAIN MENU')
  }
}

function menu(){
  bg();

  logo(55,35,270);

  panel(50,130,585,525,.87);

  ball(180,300,95);

  btn(305,175,275,70,'START GAME');
  btn(305,255,275,64,'LEVEL MODE');
  btn(305,330,275,64,'PROFILE');
  btn(305,405,275,64,'ACHIEVEMENTS');
  btn(305,480,275,64,'SETTINGS');

  panel(710,110,480,470,.87);

  t(
    'DLICOM JUNGLE',
    950,
    160,
    28,
    '#fff',
    'center',
    900
  );

  ball(950,285,112);

  t(
    'Coins: '+save.coins,
    950,
    450,
    21,
    '#ffe067',
    'center'
  );

  t(
    'Unlocked: '+save.unlocked+'/5',
    950,
    490,
    18,
    '#ccecff',
    'center'
  )
}

function levelsScreen(){
  bg();

  t(
    'LEVEL SELECT',
    W/2,
    65,
    38,
    '#fff',
    'center',
    900
  );

  for(let i=0;i<5;i++){
    let x=55+i*245;
    let locked=i+1>save.unlocked;

    panel(x,160,215,350,.9);

    ball(
      x+107,
      245,
      50,
      locked?.35:1
    );

    t(
      String(i+1),
      x+25,
      196,
      22
    );

    t(
      levels[i][0],
      x+107,
      325,
      15,
      '#fff',
      'center',
      900
    );

    let s=save.done[i+1]||0;

    t(
      '★'.repeat(s)+'☆'.repeat(3-s),
      x+107,
      395,
      24,
      '#ffd54a',
      'center'
    );

    btn(
      x+25,
      430,
      165,
      48,
      locked?'LOCKED':'PLAY'
    )
  }

  btn(35,40,120,45,'← BACK')
}

function profile(){
  bg();

  panel(235,90,810,540,.9);

  t(
    'PROFILE',
    640,
    145,
    34,
    '#fff',
    'center',
    900
  );

  ball(400,305,95);

  t(
    'PLAYER',
    540,
    235,
    18,
    '#b9dcf0'
  );

  t(
    'Dili Explorer',
    540,
    275,
    30,
    '#fff',
    'left',
    900
  );

  t(
    'Unlocked Levels: '+save.unlocked+'/5',
    540,
    330,
    19
  );

  t(
    'Total Coins: '+save.coins,
    540,
    375,
    19,
    '#ffd84a'
  );

  t(
    'Total Stars: '+save.stars,
    540,
    420,
    19,
    '#ffd84a'
  );

  btn(520,510,240,58,'BACK')
}

function row(l,on,y){
  panel(385,y,510,58,.62);

  t(
    l,
    420,
    y+37,
    19
  );

  X.fillStyle=on?'#4bd46d':'#566474';
  rr(805,y+13,60,30,15);
  X.fill();

  X.fillStyle='#fff';
  X.beginPath();
  X.arc(on?850:820,y+28,10,0,7);
  X.fill()
}

function settings(){
  bg();

  panel(300,85,680,555,.9);

  t(
    'SETTINGS',
    640,
    140,
    34,
    '#fff',
    'center',
    900
  );

  row('Sound',save.sound,210);
  row('Music',save.music,285);
  row('Tilt Control',save.tilt,360);
  row('Vibration',save.vibration,435);

  btn(520,530,240,58,'BACK')
}

function point(e){
  let r=C.getBoundingClientRect();

  return {
    x:(e.clientX-r.left)*W/r.width,
    y:(e.clientY-r.top)*H/r.height
  }
}

function click(x,y){

  if(g.screen==='title'){
    if(x>430&&x<850&&y>400&&y<535)
      g.screen='menu';

    return
  }

  if(g.screen==='menu'){

    if(x>295&&x<600&&y>165&&y<250)
      start(save.unlocked);

    else if(x>295&&x<600&&y>250&&y<325)
      g.screen='levels';

    else if(x>295&&x<600&&y>325&&y<475)
      g.screen='profile';

    else if(x>295&&x<600&&y>475&&y<565)
      g.screen='settings';

    return
  }

  if(g.screen==='levels'){

    if(x<180&&y<110){
      g.screen='menu';
      return
    }

    for(let i=0;i<5;i++){
      let bx=55+i*245;

      if(
        x>bx&&
        x<bx+215&&
        y>410&&
        y<630&&
        i+1<=save.unlocked
      ){
        start(i+1);
        return
      }
    }

    return
  }

  if(g.screen==='profile'){

    if(x>480&&x<800&&y>490)
      g.screen='menu';

    return
  }

  if(g.screen==='settings'){

    if(x>480&&x<800&&y>510)
      g.screen='menu';

    else if(y>195&&y<275)
      save.sound=!save.sound;

    else if(y>275&&y<350)
      save.music=!save.music;

    else if(y>350&&y<425)
      save.tilt=!save.tilt;

    else if(y>425&&y<510)
      save.vibration=!save.vibration;

    saveIt();
    return
  }

  if(g.screen==='play'){

    if(x>W-205&&y>H-190){
      g.screen='pause';
      g.running=0;
      return
    }

    if(y>H-140){

      if(x<125){
        key.l=1;
        setTimeout(()=>key.l=0,130)
      }

      else if(x<235){
        key.r=1;
        setTimeout(()=>key.r=0,130)
      }

      else if(x>W-135){
        key.j=1;
        setTimeout(()=>key.j=0,150)
      }
    }

    return
  }

  if(g.screen==='pause'){

    if(x>480&&x<800&&y>215&&y<295){
      g.screen='play';
      g.running=1
    }

    else if(x>480&&x<800&&y>295&&y<365)
      start(g.level);

    else if(x>480&&x<800&&y>365&&y<435)
      g.screen='levels';

    else if(x>480&&x<800&&y>435&&y<510)
      g.screen='menu';

    return
  }

  if(g.screen==='complete'){

    if(x>440&&x<840&&y>535)
      start(g.level<5?g.level+1:g.level);

    return
  }

  if(g.screen==='gameover'){

    if(x>480&&x<800&&y>450&&y<535)
      start(g.level);

    else if(x>480&&x<800&&y>530)
      g.screen='menu'
  }
}

C.addEventListener('pointerdown',e=>{
  e.preventDefault();

  let p=point(e);
  click(p.x,p.y);
},{passive:false});

C.addEventListener('pointerup',e=>{
  e.preventDefault();
  key.l=key.r=key.j=0;
},{passive:false});

C.addEventListener('pointercancel',e=>{
  e.preventDefault();
  key.l=key.r=key.j=0;
},{passive:false});
});

addEventListener('keydown',e=>{
  let k=e.key.toLowerCase();

  if(k==='arrowleft'||k==='a')
    key.l=1;

  if(k==='arrowright'||k==='d')
    key.r=1;

  if(k==='arrowup'||k==='w'||k===' ')
    key.j=1;

  if(k==='escape'&&g.screen==='play'){
    g.screen='pause';
    g.running=0
  }
});

addEventListener('keyup',e=>{
  let k=e.key.toLowerCase();

  if(k==='arrowleft'||k==='a')
    key.l=0;

  if(k==='arrowright'||k==='d')
    key.r=0;

  if(k==='arrowup'||k==='w'||k===' ')
    key.j=0
});

addEventListener('deviceorientation',e=>{
  if(save.tilt&&e.gamma!=null)
    g.tiltX=clamp(e.gamma/35,-1,1)
});

let ac;

function beep(f,d){
  if(!save.sound)return;

  try{
    ac||=new(window.AudioContext||window.webkitAudioContext)();

    let o=ac.createOscillator();
    let q=ac.createGain();

    o.frequency.value=f;
    q.gain.value=.035;

    o.connect(q);
    q.connect(ac.destination);

    o.start();

    q.gain.exponentialRampToValueAtTime(
      .0001,
      ac.currentTime+d
    );

    o.stop(ac.currentTime+d)
  }catch(_){}
}

function vibrate(n){
  if(save.vibration&&navigator.vibrate)
    navigator.vibrate(n)
}

function update(d){

  if(g.screen==='play'&&g.running){
    g.p.update(d);
    physics();

    if(g.shake>0)
      g.shake=Math.max(0,g.shake-d*35)
  }

  particles(d)
}

function loop(now){
  let d=clamp(
    (now-g.last)/1000||0,
    .001,
    .033
  );

  g.last=now;

  update(d);
  draw();

  requestAnimationFrame(loop)
}

requestAnimationFrame(loop);

})();
