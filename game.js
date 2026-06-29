'use strict';
/* =========================================================================
   NEXUS DEFENSE — core data definitions
   ========================================================================= */

const GRID_COLS = 22;
const GRID_ROWS = 13;
let CELL = 40; // recalculated on resize

const DIFFICULTY = {
  easy:   { goldMul: 1.3, hpMul: 0.75, healthStart: 130, label: 'EASY' },
  normal: { goldMul: 1.0, hpMul: 1.0,  healthStart: 100, label: 'NORMAL' },
  hard:   { goldMul: 0.85, hpMul: 1.35, healthStart: 80,  label: 'HARD' }
};

const TOTAL_WAVES = 20;

/* ---------------- TOWER DEFINITIONS ---------------- */
// dmg, range, rate (ms between shots), cost, splash, special behaviors handled in combat system
const TOWER_DEFS = {
  gatling: {
    id:'gatling', name:'Gatling Turret', icon:'⚙', cost:60,
    dmg:4, range:120, rate:140, projSpeed:9, color:'#00f0ff',
    desc:'Rapid-fire, low damage. Excellent vs swarms.',
    upgradeCostMul:0.75, maxLevel:3
  },
  laser: {
    id:'laser', name:'Laser Spire', icon:'⚡', cost:90,
    dmg:14, range:150, rate:500, projSpeed:0, color:'#a742ff', beam:true,
    desc:'Sustained beam, high single-target damage.',
    upgradeCostMul:0.8, maxLevel:3
  },
  plasma: {
    id:'plasma', name:'Plasma Cannon', icon:'☄', cost:130,
    dmg:28, range:130, rate:900, projSpeed:6, color:'#ff8a00', splash:55,
    desc:'Explosive splash damage in an area.',
    upgradeCostMul:0.8, maxLevel:3
  },
  railgun: {
    id:'railgun', name:'Railgun', icon:'▸', cost:160,
    dmg:55, range:220, rate:1300, projSpeed:18, color:'#ffffff', pierce:true,
    desc:'Devastating shot that pierces through the entire line.',
    upgradeCostMul:0.85, maxLevel:3
  },
  tesla: {
    id:'tesla', name:'Tesla Coil', icon:'⌁', cost:140,
    dmg:16, range:115, rate:650, projSpeed:0, color:'#5ad1ff', chain:4, chainRange:90,
    desc:'Lightning arcs between up to 4 nearby enemies.',
    upgradeCostMul:0.8, maxLevel:3
  },
  cryo: {
    id:'cryo', name:'Cryo Tower', icon:'❄', cost:100,
    dmg:6, range:110, rate:600, projSpeed:7, color:'#7af0ff', slow:0.5, slowDur:1500,
    desc:'Slows enemies on hit. Stacks reduce armor effectively.',
    upgradeCostMul:0.75, maxLevel:3
  },
  emp: {
    id:'emp', name:'EMP Tower', icon:'◎', cost:150,
    dmg:8, range:125, rate:1100, projSpeed:0, color:'#ffe14d', empBurst:true, empRadius:80,
    desc:'Disables shields and armor plating in a burst radius.',
    upgradeCostMul:0.8, maxLevel:3
  },
  missile: {
    id:'missile', name:'Missile Battery', icon:'✦', cost:170,
    dmg:34, range:190, rate:1100, projSpeed:5.5, color:'#ff2d6e', splash:65, homing:true,
    desc:'Homing missiles with strong area damage.',
    upgradeCostMul:0.85, maxLevel:3
  },
  detector: {
    id:'detector', name:'Stealth Detector', icon:'◉', cost:110,
    dmg:10, range:140, rate:700, projSpeed:8, color:'#0fffa0', revealStealth:true,
    desc:'Reveals and damages cloaked enemies others cannot hit.',
    upgradeCostMul:0.75, maxLevel:3
  },
  disruptor: {
    id:'disruptor', name:'Shield Disruptor', icon:'⬢', cost:135,
    dmg:5, range:130, rate:500, projSpeed:8, color:'#c46bff', shieldStrip:0.6,
    desc:'Strips enemy shields, exposing them to burst damage.',
    upgradeCostMul:0.8, maxLevel:3
  }
};
const TOWER_ORDER = ['gatling','laser','plasma','railgun','tesla','cryo','emp','missile','detector','disruptor'];

/* ---------------- ENEMY DEFINITIONS ---------------- */
// base stats scaled per wave at runtime
const ENEMY_DEFS = {
  drone:    { name:'Drone', hp:30,  speed:1.6, gold:4,  size:11, color:'#9fb3c8', shape:'circle' },
  runner:   { name:'Runner', hp:20, speed:2.6, gold:5,  size:9,  color:'#ffd23f', shape:'triangle' },
  brute:    { name:'Brute', hp:110, speed:0.9, gold:10, size:16, color:'#ff6b3d', shape:'square' },
  shielded: { name:'Shielded Unit', hp:70, speed:1.2, gold:9, size:13, color:'#5ad1ff', shape:'hex', shield:50, shieldRegenDelay:5000 },
  stealth:  { name:'Phase Walker', hp:45, speed:1.5, gold:8, size:11, color:'#c46bff', shape:'diamond', stealth:true },
  armored:  { name:'Armored Crawler', hp:90, speed:0.8, gold:9, size:14, color:'#8a8a8a', shape:'square', armor:0.4 },
  swarm:    { name:'Swarmling', hp:12, speed:2.0, gold:2, size:7, color:'#ff9fd0', shape:'circle' },
  titan:    { name:'Titan', hp:420, speed:0.55, gold:35, size:22, color:'#ff2d6e', shape:'hex', armor:0.25, isBoss:true }
};

/* ---------------- HERO DEFINITIONS ---------------- */
const HERO_DEFS = {
  vanguard: {
    id:'vanguard', name:'Vanguard', icon:'🛡',
    color:'#00f0ff',
    desc:'Melee bruiser. Aura boosts nearby tower damage. Ultimate: shockwave stun.',
    baseHp:260, dmg:22, range:46, atkRate:450, speed:1.4,
    auraRange:130, auraDmgMul:0.18,
    ultName:'Overload Pulse', ultCooldown:18000,
    ultDesc:'Stuns all enemies in a large radius for 1.8s and deals burst damage.'
  },
  phantom: {
    id:'phantom', name:'Phantom Blade', icon:'🗲',
    color:'#a742ff',
    desc:'High mobility striker, bonus damage to shielded/stealth foes. Ultimate: blink barrage.',
    baseHp:150, dmg:34, range:42, atkRate:300, speed:2.4,
    bonusVsShielded:0.6, revealStealth:true,
    ultName:'Blink Barrage', ultCooldown:14000,
    ultDesc:'Teleports between the 5 nearest enemies, striking each for heavy damage.'
  },
  architect: {
    id:'architect', name:'The Architect', icon:'🔧',
    color:'#ffb800',
    desc:'Support hero. Passively boosts all tower fire rate nearby. Ultimate: emergency repair + research surge.',
    baseHp:180, dmg:10, range:120, atkRate:900, speed:1.1,
    auraRange:160, auraRateMul:0.22,
    ultName:'Surge Protocol', ultCooldown:20000,
    ultDesc:'Instantly restores 15 core health and grants a burst of research points.'
  }
};

/* ---------------- TECH TREE DEFINITIONS ---------------- */
// Three branches: Offense, Defense, Economy. Each node costs research points, earned passively + bonus from kills.
const TECH_TREE = {
  offense: {
    title:'Offense',
    nodes:[
      { id:'dmg1', name:'Targeting Matrix I', desc:'+10% tower damage', icon:'◈', cost:20, effect:{type:'globalDmgMul', value:0.10} },
      { id:'dmg2', name:'Targeting Matrix II', desc:'+15% tower damage', icon:'◈', cost:45, effect:{type:'globalDmgMul', value:0.15}, requires:'dmg1' },
      { id:'crit', name:'Overcharge Rounds', desc:'15% chance towers deal 2x damage', icon:'✺', cost:60, effect:{type:'critChance', value:0.15}, requires:'dmg2' },
      { id:'rate1', name:'Servo Tuning', desc:'+12% tower fire rate', icon:'⟳', cost:35, effect:{type:'globalRateMul', value:0.12}, requires:'dmg1' }
    ]
  },
  defense: {
    title:'Defense',
    nodes:[
      { id:'core1', name:'Core Plating', desc:'+20 max core health', icon:'⛨', cost:20, effect:{type:'maxHealth', value:20} },
      { id:'core2', name:'Reactive Armor', desc:'+30 max core health', icon:'⛨', cost:50, effect:{type:'maxHealth', value:30}, requires:'core1' },
      { id:'slow1', name:'Stasis Field', desc:'All slow effects 25% stronger', icon:'❄', cost:40, effect:{type:'slowPotency', value:0.25}, requires:'core1' },
      { id:'range1', name:'Sensor Array', desc:'+8% tower range', icon:'◎', cost:30, effect:{type:'globalRangeMul', value:0.08} }
    ]
  },
  economy: {
    title:'Economy',
    nodes:[
      { id:'gold1', name:'Salvage Protocol', desc:'+15% gold from kills', icon:'◆', cost:20, effect:{type:'goldMul', value:0.15} },
      { id:'gold2', name:'Auto-Refinery', desc:'+8 gold per wave start (passive)', icon:'◆', cost:40, effect:{type:'passiveGold', value:8}, requires:'gold1' },
      { id:'research1', name:'Research Lab', desc:'+1 research per kill', icon:'⬡', cost:25, effect:{type:'researchPerKill', value:1} },
      { id:'cheaper', name:'Mass Production', desc:'Towers cost 10% less', icon:'⬡', cost:55, effect:{type:'towerCostMul', value:-0.10}, requires:'research1' }
    ]
  }
};

/* =========================================================================
   STATE
   ========================================================================= */
const state = {
  difficulty: 'normal',
  gold: 200,
  research: 0,
  health: 100,
  maxHealth: 100,
  wave: 0,
  waveActive: false,
  waveSpawning: false,
  gameOver: false,
  speed: 1,
  kills: 0,
  goldEarnedTotal: 0,
  path: [],          // array of {c,r} grid cells defining enemy path
  pathSet: new Set(),// quick lookup "c,r" -> true for occupied-by-path
  pathPoints: [],     // world-space polyline points (with start/end extension)
  towers: [],
  enemies: [],
  projectiles: [],
  particles: [],
  heroes: {},        // id -> hero instance (only active one moves/fights)
  activeHeroId: null,
  selectedTowerType: null, // for placement
  selectedEntity: null,    // selected placed tower or hero, for info panel
  techPurchased: {},       // nodeId -> level purchased (bool for now, single tier each)
  mods: { // aggregated tech tree effects
    globalDmgMul: 1, globalRateMul: 1, globalRangeMul: 1,
    critChance: 0, slowPotency: 1, goldMul: 1, researchPerKill: 0,
    passiveGold: 0, towerCostMul: 1, maxHealthBonus: 0
  },
  enemiesRemainingInWave: 0,
  enemiesToSpawn: [],
  spawnTimer: 0,
  nextEnemySpawnDelay: 0,
};

function recalcMods(){
  const m = { globalDmgMul:1, globalRateMul:1, globalRangeMul:1, critChance:0,
              slowPotency:1, goldMul:1, researchPerKill:0, passiveGold:0,
              towerCostMul:1, maxHealthBonus:0 };
  for(const branchKey in TECH_TREE){
    for(const node of TECH_TREE[branchKey].nodes){
      if(state.techPurchased[node.id]){
        const e = node.effect;
        switch(e.type){
          case 'globalDmgMul': m.globalDmgMul += e.value; break;
          case 'globalRateMul': m.globalRateMul += e.value; break;
          case 'globalRangeMul': m.globalRangeMul += e.value; break;
          case 'critChance': m.critChance += e.value; break;
          case 'slowPotency': m.slowPotency += e.value; break;
          case 'goldMul': m.goldMul += e.value; break;
          case 'researchPerKill': m.researchPerKill += e.value; break;
          case 'passiveGold': m.passiveGold += e.value; break;
          case 'towerCostMul': m.towerCostMul += e.value; break;
          case 'maxHealth': m.maxHealthBonus += e.value; break;
        }
      }
    }
  }
  state.mods = m;
  state.maxHealth = DIFFICULTY[state.difficulty].healthStart + m.maxHealthBonus;
}

/* =========================================================================
   PROCEDURAL PATH GENERATION (validated separately — see path_test.js)
   ========================================================================= */
function mulberry32(seed){
  let a = seed;
  return function(){
    a |= 0; a = (a + 0x6D2B79F5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function generatePath(cols, rows, seed){
  const rng = mulberry32(seed);
  const startRow = Math.max(2, Math.min(rows - 3, Math.floor(rows/2) + Math.floor((rng()-0.5)*rows*0.4)));
  let r = startRow, c = 0;
  const path = [{c,r}];
  const visited = new Set([`${c},${r}`]);
  const targetCol = cols - 1;
  let guard = 0;

  while(c < targetCol && guard < 5000){
    guard++;
    const choices = [];
    choices.push({dc:1, dr:0, w:5});
    if(r > 1) choices.push({dc:0, dr:-1, w:2});
    if(r < rows-2) choices.push({dc:0, dr:1, w:2});
    const totalW = choices.reduce((s,ch)=>s+ch.w,0);
    let roll = rng()*totalW;
    let pick = choices[0];
    for(const ch of choices){ if(roll < ch.w){ pick = ch; break; } roll -= ch.w; }
    const nc = c + pick.dc, nr = r + pick.dr;
    const key = `${nc},${nr}`;
    if(visited.has(key)) continue;
    if(nr < 0 || nr >= rows) continue;
    c = nc; r = nr;
    path.push({c,r});
    visited.add(key);
  }
  return path;
}

function buildPathWorldPoints(){
  // convert grid path to world-space center points, with slight extension off-screen at both ends
  const pts = state.path.map(p => ({
    x: p.c*CELL + CELL/2,
    y: p.r*CELL + CELL/2
  }));
  if(pts.length >= 2){
    const first = pts[0], second = pts[1];
    const dx = first.x-second.x, dy = first.y-second.y;
    pts.unshift({x:first.x+dx*3, y:first.y+dy*3});
    const last = pts[pts.length-1], prev = pts[pts.length-2];
    const dx2 = last.x-prev.x, dy2 = last.y-prev.y;
    pts.push({x:last.x+dx2*3, y:last.y+dy2*3});
  }
  state.pathPoints = pts;
}

function getPointAtDistance(distance){
  // walk along pathPoints polyline, returns {x,y,angle} at given distance from start
  const pts = state.pathPoints;
  let remaining = distance;
  for(let i=0;i<pts.length-1;i++){
    const a = pts[i], b = pts[i+1];
    const segLen = Math.hypot(b.x-a.x, b.y-a.y);
    if(remaining <= segLen){
      const t = segLen === 0 ? 0 : remaining/segLen;
      return {
        x: a.x + (b.x-a.x)*t,
        y: a.y + (b.y-a.y)*t,
        angle: Math.atan2(b.y-a.y, b.x-a.x)
      };
    }
    remaining -= segLen;
  }
  const last = pts[pts.length-1], prev = pts[pts.length-2];
  return { x:last.x, y:last.y, angle: Math.atan2(last.y-prev.y, last.x-prev.x) };
}

function getTotalPathLength(){
  const pts = state.pathPoints;
  let total = 0;
  for(let i=0;i<pts.length-1;i++){
    total += Math.hypot(pts[i+1].x-pts[i].x, pts[i+1].y-pts[i].y);
  }
  return total;
}
let TOTAL_PATH_LENGTH = 0;

function isOnPath(c,r){
  return state.pathSet.has(`${c},${r}`);
}

/* =========================================================================
   ENTITIES
   ========================================================================= */
let _idCounter = 1;
function nextId(){ return _idCounter++; }

class Enemy{
  constructor(typeKey, waveScale){
    const def = ENEMY_DEFS[typeKey];
    this.id = nextId();
    this.type = typeKey;
    this.def = def;
    const hpMul = DIFFICULTY[state.difficulty].hpMul;
    this.maxHp = Math.round(def.hp * waveScale * hpMul);
    this.hp = this.maxHp;
    this.shieldMax = def.shield ? Math.round(def.shield * waveScale * hpMul * 0.6) : 0;
    this.shield = this.shieldMax;
    this.shieldBroken = false;
    this.shieldRegenAt = 0;
    this.armor = def.armor || 0;
    this.speed = def.speed * (22+CELL*0); // placeholder, recalculated below
    this.baseSpeedPxPerSec = def.speed * 26;
    this.dist = 0;
    this.x = 0; this.y = 0; this.angle = 0;
    this.slowFactor = 1; // multiplier on speed, <1 = slowed
    this.slowUntil = 0;
    this.stealth = !!def.stealth;
    this.revealed = false; // becomes true if a detector tower has line on it
    this.alive = true;
    this.gold = Math.round(def.gold * DIFFICULTY[state.difficulty].goldMul);
    this.isBoss = !!def.isBoss;
    this.empUntil = 0; // when emp-disabled (shield/armor ignored), timestamp
    this.hitFlash = 0;
  }
  effectiveSpeed(){
    let s = this.baseSpeedPxPerSec * this.slowFactor;
    return s;
  }
  takeDamage(amount, opts={}){
    if(!this.alive) return 0;
    let dmg = amount;
    const empActive = performance.now() < this.empUntil;
    // shield absorbs first (unless emp disables it)
    if(this.shield > 0 && !empActive){
      const absorbed = Math.min(this.shield, dmg);
      this.shield -= absorbed;
      dmg -= absorbed;
      if(this.shield <= 0) this.shieldRegenAt = performance.now() + (this.def.shieldRegenDelay||5000);
    }
    if(dmg > 0){
      let armorVal = empActive ? 0 : this.armor;
      const reduced = dmg * (1-armorVal);
      this.hp -= reduced;
      this.hitFlash = 100;
    }
    if(this.hp <= 0 && this.alive){
      this.alive = false;
      return this.gold;
    }
    return 0;
  }
  applySlow(factor, durationMs){
    const potency = state.mods.slowPotency;
    const effFactor = Math.max(0.15, 1 - (1-factor)*potency);
    if(effFactor < this.slowFactor || performance.now() > this.slowUntil){
      this.slowFactor = effFactor;
    }
    this.slowUntil = Math.max(this.slowUntil, performance.now() + durationMs);
  }
  update(dt){
    const now = performance.now();
    if(now > this.slowUntil) this.slowFactor = 1;
    if(this.shieldMax > 0 && this.shield <= 0 && now > this.shieldRegenAt){
      this.shield = this.shieldMax;
    }
    if(this.hitFlash>0) this.hitFlash -= dt*1000;
    const moveDist = this.effectiveSpeed() * dt;
    this.dist += moveDist;
    const p = getPointAtDistance(this.dist);
    this.x = p.x; this.y = p.y; this.angle = p.angle;
    if(this.dist >= TOTAL_PATH_LENGTH - 30){
      this.reachedEnd = true;
    }
  }
}

class Projectile{
  constructor(opts){
    Object.assign(this, {
      x:0,y:0,targetX:0,targetY:0, speed:8, dmg:0, color:'#fff',
      target:null, splash:0, pierce:false, homing:false, sourceTower:null,
      shieldStrip:0, empBurst:false, empRadius:0, life:0
    }, opts);
    this.id = nextId();
    this.dead = false;
    this.angle = Math.atan2(this.targetY-this.y, this.targetX-this.x);
  }
  update(dt){
    this.life += dt;
    if(this.life > 3) { this.dead = true; return; }
    if(this.homing && this.target && this.target.alive){
      this.targetX = this.target.x; this.targetY = this.target.y;
    }
    const dx = this.targetX-this.x, dy = this.targetY-this.y;
    const dist = Math.hypot(dx,dy);
    const moveAmt = this.speed*60*dt;
    this.angle = Math.atan2(dy,dx);
    if(dist <= moveAmt || dist < 4){
      this.onHit();
      this.dead = true;
    } else {
      this.x += (dx/dist)*moveAmt;
      this.y += (dy/dist)*moveAmt;
    }
  }
  onHit(){
    spawnImpactFX(this.targetX, this.targetY, this.color);
    if(this.pierce){
      // damage all enemies along the line from source tower through target
      const enemiesHit = state.enemies.filter(e=>e.alive && pointNearSegment(e.x,e.y,this.sourceTower.x,this.sourceTower.y,this.targetX,this.targetY,14));
      enemiesHit.forEach(e=>dealDamageToEnemy(e, this.dmg));
    } else if(this.splash > 0){
      state.enemies.forEach(e=>{
        if(!e.alive) return;
        if(Math.hypot(e.x-this.targetX, e.y-this.targetY) <= this.splash){
          dealDamageToEnemy(e, this.dmg);
        }
      });
    } else if(this.empBurst){
      state.enemies.forEach(e=>{
        if(!e.alive) return;
        if(Math.hypot(e.x-this.targetX, e.y-this.targetY) <= this.empRadius){
          e.empUntil = performance.now() + 2500;
          dealDamageToEnemy(e, this.dmg);
        }
      });
    } else {
      if(this.target && this.target.alive){
        if(this.shieldStrip){
          this.target.shield = Math.max(0, this.target.shield - this.target.shieldMax*this.shieldStrip);
        }
        dealDamageToEnemy(this.target, this.dmg);
      }
    }
  }
}

function pointNearSegment(px,py,ax,ay,bx,by,thresh){
  const dx=bx-ax, dy=by-ay;
  const len2 = dx*dx+dy*dy;
  let t = len2===0?0:((px-ax)*dx+(py-ay)*dy)/len2;
  t = Math.max(0,Math.min(1,t));
  const cx = ax+dx*t, cy = ay+dy*t;
  return Math.hypot(px-cx,py-cy) <= thresh;
}

function dealDamageToEnemy(enemy, dmg){
  let finalDmg = dmg;
  if(Math.random() < state.mods.critChance) finalDmg *= 2;
  const goldGained = enemy.takeDamage(finalDmg);
  if(!enemy.alive && goldGained > 0){
    onEnemyKilled(enemy, goldGained);
  }
}

function onEnemyKilled(enemy, goldGained){
  const finalGold = Math.round(goldGained * state.mods.goldMul);
  state.gold += finalGold;
  state.goldEarnedTotal += finalGold;
  state.research += state.mods.researchPerKill;
  state.kills++;
  spawnDeathFX(enemy.x, enemy.y, enemy.def.color);
}

class Tower{
  constructor(typeKey, gx, gy){
    const def = TOWER_DEFS[typeKey];
    this.id = nextId();
    this.type = typeKey;
    this.def = def;
    this.gx = gx; this.gy = gy;
    this.x = gx*CELL+CELL/2; this.y = gy*CELL+CELL/2;
    this.level = 1;
    this.cooldown = 0;
    this.angle = 0;
    this.target = null;
    this.kills = 0;
  }
  getDmg(){
    const lvlMul = 1 + (this.level-1)*0.55;
    return this.def.dmg * lvlMul * state.mods.globalDmgMul;
  }
  getRange(){
    const lvlMul = 1 + (this.level-1)*0.12;
    return this.def.range * lvlMul * state.mods.globalRangeMul;
  }
  getRate(){
    const lvlMul = 1 - (this.level-1)*0.12;
    let rate = this.def.rate * Math.max(0.4,lvlMul) / state.mods.globalRateMul;
    // hero architect aura
    if(this._architectBoost) rate *= (1-this._architectBoost);
    return rate;
  }
  upgradeCost(){
    return Math.round(this.def.cost * (0.9 + this.level*this.def.upgradeCostMul));
  }
  sellValue(){
    let invested = this.def.cost;
    for(let l=1;l<this.level;l++) invested += Math.round(this.def.cost*(0.9+l*this.def.upgradeCostMul));
    return Math.round(invested*0.6);
  }
  findTarget(){
    const range = this.getRange();
    let best = null, bestDist = Infinity;
    for(const e of state.enemies){
      if(!e.alive) continue;
      if(e.stealth && !e.revealed && !this.def.revealStealth) continue;
      const d = Math.hypot(e.x-this.x, e.y-this.y);
      if(d <= range && d < bestDist){
        best = e; bestDist = d;
      }
    }
    return best;
  }
  update(dt){
    this.cooldown -= dt*1000;
    if(this.def.revealStealth){
      state.enemies.forEach(e=>{
        if(e.stealth && Math.hypot(e.x-this.x,e.y-this.y) <= this.getRange()) e.revealed = true;
      });
    }
    if(!this.target || !this.target.alive || Math.hypot(this.target.x-this.x,this.target.y-this.y) > this.getRange()){
      this.target = this.findTarget();
    }
    if(this.target) this.angle = Math.atan2(this.target.y-this.y, this.target.x-this.x);
    if(this.target && this.cooldown <= 0){
      this.fire();
      this.cooldown = this.getRate();
    }
  }
  fire(){
    const t = this.target;
    const dmg = this.getDmg();
    if(this.def.beam){
      // instant beam — apply damage immediately, draw beam FX
      dealDamageToEnemy(t, dmg);
      spawnBeamFX(this.x,this.y,t.x,t.y,this.def.color);
      return;
    }
    if(this.def.chain){
      // tesla: chain lightning hits primary + up to N nearby
      let targets = [t];
      let cur = t;
      const hit = new Set([t.id]);
      for(let i=1;i<this.def.chain;i++){
        let next=null, nd=Infinity;
        for(const e of state.enemies){
          if(!e.alive||hit.has(e.id)) continue;
          const d = Math.hypot(e.x-cur.x,e.y-cur.y);
          if(d<=this.def.chainRange && d<nd){ next=e; nd=d; }
        }
        if(!next) break;
        targets.push(next); hit.add(next.id); cur=next;
      }
      targets.forEach((tg,i)=>{
        dealDamageToEnemy(tg, dmg*(i===0?1:0.7));
      });
      spawnChainFX(this.x,this.y,targets,this.def.color);
      return;
    }
    const proj = new Projectile({
      x:this.x, y:this.y, targetX:t.x, targetY:t.y, target:t,
      speed:this.def.projSpeed, dmg, color:this.def.color,
      splash:this.def.splash||0, pierce:!!this.def.pierce, homing:!!this.def.homing,
      sourceTower:this, shieldStrip:this.def.shieldStrip||0,
      empBurst:!!this.def.empBurst, empRadius:this.def.empRadius||0
    });
    if(this.def.slow){
      proj._applySlow = ()=> t.applySlow(this.def.slow, this.def.slowDur);
    }
    state.projectiles.push(proj);
    if(this.def.slow) t.applySlow(this.def.slow, this.def.slowDur);
  }
}

class Hero{
  constructor(typeKey){
    const def = HERO_DEFS[typeKey];
    this.id = nextId();
    this.type = typeKey;
    this.def = def;
    this.maxHp = def.baseHp;
    this.hp = this.maxHp;
    this.x = -100; this.y = -100;
    this.deployed = false;
    this.target = null;
    this.cooldown = 0;
    this.ultCooldown = 0;
    this.angle = 0;
    this.respawnTimer = 0;
  }
  deploy(x,y){
    this.x=x; this.y=y; this.deployed=true; this.hp=this.maxHp;
  }
  applyAuras(){
    if(!this.deployed || this.hp<=0) return;
    state.towers.forEach(t=>{
      const d = Math.hypot(t.x-this.x, t.y-this.y);
      t._architectBoost = 0;
      if(this.def.auraDmgMul && d<=this.def.auraRange){ t._heroDmgBoost=this.def.auraDmgMul; } else { t._heroDmgBoost=0; }
      if(this.def.auraRateMul && d<=this.def.auraRange){ t._architectBoost=this.def.auraRateMul; }
    });
  }
  findTarget(){
    let best=null,bd=Infinity;
    for(const e of state.enemies){
      if(!e.alive) continue;
      if(e.stealth && !e.revealed && !this.def.revealStealth) continue;
      const d=Math.hypot(e.x-this.x,e.y-this.y);
      if(d<200 && d<bd){best=e;bd=d;}
    }
    return best;
  }
  update(dt){
    if(!this.deployed) return;
    if(this.hp<=0){
      this.deployed=false;
      this.respawnTimer = 15000;
      return;
    }
    this.cooldown -= dt*1000;
    this.ultCooldown = Math.max(0,this.ultCooldown-dt*1000);
    this.applyAuras();
    if(!this.target || !this.target.alive || Math.hypot(this.target.x-this.x,this.target.y-this.y)>180){
      this.target = this.findTarget();
    }
    if(this.target){
      const d = Math.hypot(this.target.x-this.x, this.target.y-this.y);
      this.angle = Math.atan2(this.target.y-this.y, this.target.x-this.x);
      if(d > this.def.range){
        const mv = this.def.speed*40*dt;
        this.x += Math.cos(this.angle)*mv;
        this.y += Math.sin(this.angle)*mv;
      } else if(this.cooldown<=0){
        let dmg = this.def.dmg;
        if(this.def.bonusVsShielded && (this.target.shieldMax>0 || this.target.armor>0)) dmg *= (1+this.def.bonusVsShielded);
        dealDamageToEnemy(this.target, dmg);
        spawnImpactFX(this.target.x,this.target.y,this.def.color);
        this.cooldown = this.def.atkRate;
      }
    }
    // take damage from nearby enemies (simple proximity-based)
    state.enemies.forEach(e=>{
      if(!e.alive) return;
      const d = Math.hypot(e.x-this.x,e.y-this.y);
      if(d < 24) this.hp -= 6*dt;
    });
  }
  canUseUlt(){ return this.deployed && this.ultCooldown<=0; }
  useUlt(){
    if(!this.canUseUlt()) return;
    this.ultCooldown = this.def.ultCooldown;
    if(this.type==='vanguard'){
      state.enemies.forEach(e=>{
        if(!e.alive) return;
        const d = Math.hypot(e.x-this.x,e.y-this.y);
        if(d<=150){ dealDamageToEnemy(e,60); e.applySlow(0.05, 1800); }
      });
      spawnShockwaveFX(this.x,this.y,150,this.def.color);
    } else if(this.type==='phantom'){
      const targets = state.enemies.filter(e=>e.alive).sort((a,b)=>Math.hypot(a.x-this.x,a.y-this.y)-Math.hypot(b.x-this.x,b.y-this.y)).slice(0,5);
      targets.forEach((t,i)=>{
        setTimeout(()=>{ if(t.alive){ dealDamageToEnemy(t,70); spawnImpactFX(t.x,t.y,this.def.color); } }, i*120);
      });
    } else if(this.type==='architect'){
      state.health = Math.min(state.maxHealth, state.health+15);
      state.research += 12;
      spawnShockwaveFX(this.x,this.y,80,this.def.color);
    }
  }
}

/* =========================================================================
   PARTICLES / FX
   ========================================================================= */
function spawnImpactFX(x,y,color){
  for(let i=0;i<5;i++){
    state.particles.push({x,y,vx:(Math.random()-0.5)*120,vy:(Math.random()-0.5)*120,life:0.3,maxLife:0.3,color,size:2+Math.random()*2,kind:'spark'});
  }
}
function spawnDeathFX(x,y,color){
  for(let i=0;i<12;i++){
    const a = Math.random()*Math.PI*2, sp=40+Math.random()*100;
    state.particles.push({x,y,vx:Math.cos(a)*sp,vy:Math.sin(a)*sp,life:0.5,maxLife:0.5,color,size:2+Math.random()*3,kind:'spark'});
  }
}
function spawnBeamFX(x1,y1,x2,y2,color){
  state.particles.push({x:x1,y:y1,x2,y2,life:0.12,maxLife:0.12,color,kind:'beam'});
}
function spawnChainFX(x1,y1,targets,color){
  let prevX=x1,prevY=y1;
  targets.forEach(t=>{
    state.particles.push({x:prevX,y:prevY,x2:t.x,y2:t.y,life:0.18,maxLife:0.18,color,kind:'beam'});
    prevX=t.x; prevY=t.y;
  });
}
function spawnShockwaveFX(x,y,radius,color){
  state.particles.push({x,y,radius:0,maxRadius:radius,life:0.5,maxLife:0.5,color,kind:'shockwave'});
}
function updateParticles(dt){
  for(let i=state.particles.length-1;i>=0;i--){
    const p = state.particles[i];
    p.life -= dt;
    if(p.kind==='spark'){
      p.x += p.vx*dt; p.y += p.vy*dt;
      p.vx *= 0.9; p.vy*=0.9;
    } else if(p.kind==='shockwave'){
      p.radius = p.maxRadius*(1-p.life/p.maxLife);
    }
    if(p.life<=0) state.particles.splice(i,1);
  }
}

/* =========================================================================
   WAVE MANAGEMENT
   ========================================================================= */
function buildWaveQueue(waveNum){
  const queue = [];
  const scale = 1 + (waveNum-1)*0.16;
  const count = 8 + Math.floor(waveNum*1.6);

  // composition rules by wave tier
  const pool = ['drone'];
  if(waveNum>=2) pool.push('runner');
  if(waveNum>=3) pool.push('swarm');
  if(waveNum>=4) pool.push('shielded');
  if(waveNum>=5) pool.push('brute');
  if(waveNum>=6) pool.push('stealth');
  if(waveNum>=8) pool.push('armored');

  for(let i=0;i<count;i++){
    const type = pool[Math.floor(Math.random()*pool.length)];
    queue.push(type);
  }
  if(waveNum % 5 === 0){
    queue.push('titan');
  }
  return { queue, scale };
}

function startWave(){
  if(state.waveActive || state.gameOver) return;
  state.wave++;
  if(state.wave > TOTAL_WAVES){ state.wave = TOTAL_WAVES; }
  const {queue, scale} = buildWaveQueue(state.wave);
  state.enemiesToSpawn = queue;
  state.waveScale = scale;
  state.waveActive = true;
  state.waveSpawning = true;
  state.spawnTimer = 0;
  state.gold += state.mods.passiveGold;
  updateHUD();
}

function updateSpawning(dt){
  if(!state.waveSpawning) return;
  state.spawnTimer -= dt*1000;
  if(state.spawnTimer<=0 && state.enemiesToSpawn.length>0){
    const type = state.enemiesToSpawn.shift();
    const e = new Enemy(type, state.waveScale);
    state.enemies.push(e);
    state.spawnTimer = type==='swarm'?180:(type==='titan'?0:380);
    if(state.enemiesToSpawn.length===0) state.waveSpawning=false;
  }
}

function checkWaveComplete(){
  if(state.waveActive && !state.waveSpawning && state.enemies.length===0){
    state.waveActive = false;
    if(state.wave >= TOTAL_WAVES){
      triggerWin();
    }
  }
}

/* =========================================================================
   MAIN UPDATE LOOP
   ========================================================================= */
function gameUpdate(dt){
  if(state.gameOver) return;
  updateSpawning(dt);
  state.towers.forEach(t=>t.update(dt));
  if(state.activeHeroId) state.heroes[state.activeHeroId].update(dt);

  for(let i=state.enemies.length-1;i>=0;i--){
    const e = state.enemies[i];
    if(!e.alive){ state.enemies.splice(i,1); continue; }
    e.update(dt);
    if(e.reachedEnd){
      state.health -= e.isBoss?15:(e.def.size>15?6:3);
      state.enemies.splice(i,1);
      if(state.health<=0){ state.health=0; triggerLose(); return; }
    }
  }
  for(let i=state.projectiles.length-1;i>=0;i--){
    const p = state.projectiles[i];
    p.update(dt);
    if(p.dead) state.projectiles.splice(i,1);
  }
  updateParticles(dt);
  checkWaveComplete();
  updateHUD();
}

function triggerWin(){
  state.gameOver=true;
  showEndScreen(true);
}
function triggerLose(){
  state.gameOver=true;
  showEndScreen(false);
}

/* =========================================================================
   RENDERING
   ========================================================================= */
let ctx, fxCtx, canvas, fxCanvas;
let mouseGX=-1, mouseGY=-1, mouseX=0, mouseY=0;

function resizeCanvases(){
  const wrap = document.getElementById('canvas-wrap');
  const w = wrap.clientWidth, h = wrap.clientHeight;
  const cellW = w/GRID_COLS, cellH = h/GRID_ROWS;
  CELL = Math.floor(Math.min(cellW, cellH));
  const totalW = CELL*GRID_COLS, totalH = CELL*GRID_ROWS;
  [canvas, fxCanvas].forEach(cv=>{
    cv.width = totalW; cv.height = totalH;
    cv.style.width = totalW+'px'; cv.style.height = totalH+'px';
    cv.style.position='absolute';
    cv.style.left = ((w-totalW)/2)+'px';
    cv.style.top = ((h-totalH)/2)+'px';
  });
  if(state.path.length){
    buildPathWorldPoints();
    TOTAL_PATH_LENGTH = getTotalPathLength();
  }
}

function drawGrid(){
  ctx.clearRect(0,0,canvas.width,canvas.height);
  ctx.fillStyle = '#070a14';
  ctx.fillRect(0,0,canvas.width,canvas.height);
  ctx.strokeStyle = 'rgba(0,240,255,0.045)';
  ctx.lineWidth=1;
  for(let c=0;c<=GRID_COLS;c++){
    ctx.beginPath(); ctx.moveTo(c*CELL,0); ctx.lineTo(c*CELL,GRID_ROWS*CELL); ctx.stroke();
  }
  for(let r=0;r<=GRID_ROWS;r++){
    ctx.beginPath(); ctx.moveTo(0,r*CELL); ctx.lineTo(GRID_COLS*CELL,r*CELL); ctx.stroke();
  }
}

function drawPath(){
  if(!state.path || state.path.length===0) return;
  ctx.save();
  ctx.strokeStyle = 'rgba(167,66,255,0.18)';
  ctx.lineWidth = CELL*0.86;
  ctx.lineCap='round'; ctx.lineJoin='round';
  ctx.beginPath();
  state.path.forEach((p,i)=>{
    const x=p.c*CELL+CELL/2, y=p.r*CELL+CELL/2;
    if(i===0) ctx.moveTo(x,y); else ctx.lineTo(x,y);
  });
  ctx.stroke();

  ctx.strokeStyle = 'rgba(167,66,255,0.4)';
  ctx.lineWidth = 2;
  ctx.setLineDash([10,8]);
  ctx.beginPath();
  state.path.forEach((p,i)=>{
    const x=p.c*CELL+CELL/2, y=p.r*CELL+CELL/2;
    if(i===0) ctx.moveTo(x,y); else ctx.lineTo(x,y);
  });
  ctx.stroke();
  ctx.setLineDash([]);

  // core marker at end
  const endP = state.path[state.path.length-1];
  ctx.fillStyle='rgba(0,240,255,0.15)';
  ctx.beginPath(); ctx.arc(endP.c*CELL+CELL/2, endP.r*CELL+CELL/2, CELL*0.9, 0, Math.PI*2); ctx.fill();
  ctx.strokeStyle='var(--cyan)';
  ctx.strokeStyle='#00f0ff';
  ctx.lineWidth=2;
  ctx.beginPath(); ctx.arc(endP.c*CELL+CELL/2, endP.r*CELL+CELL/2, CELL*0.55, 0, Math.PI*2); ctx.stroke();
  ctx.restore();
}

function drawPlacementPreview(){
  if(!state.selectedTowerType) return;
  if(mouseGX<0||mouseGY<0||mouseGX>=GRID_COLS||mouseGY>=GRID_ROWS) return;
  const valid = !isOnPath(mouseGX,mouseGY) && !towerAt(mouseGX,mouseGY);
  const def = TOWER_DEFS[state.selectedTowerType];
  const x = mouseGX*CELL+CELL/2, y = mouseGY*CELL+CELL/2;
  ctx.save();
  ctx.globalAlpha=0.85;
  ctx.beginPath(); ctx.arc(x,y,def.range,0,Math.PI*2);
  ctx.strokeStyle = valid? 'rgba(0,240,255,0.5)':'rgba(255,45,110,0.6)';
  ctx.fillStyle = valid? 'rgba(0,240,255,0.06)':'rgba(255,45,110,0.08)';
  ctx.fill(); ctx.stroke();
  ctx.globalAlpha=1;
  ctx.fillStyle = valid? '#0d2230':'#3a0d18';
  ctx.fillRect(x-CELL*0.4,y-CELL*0.4,CELL*0.8,CELL*0.8);
  ctx.strokeStyle = valid?'#00f0ff':'#ff2d6e';
  ctx.lineWidth=2;
  ctx.strokeRect(x-CELL*0.4,y-CELL*0.4,CELL*0.8,CELL*0.8);
  ctx.restore();
}

function towerAt(gx,gy){
  return state.towers.find(t=>t.gx===gx&&t.gy===gy);
}

function drawTower(t){
  const isSel = state.selectedEntity===t;
  ctx.save();
  ctx.translate(t.x,t.y);
  // base
  ctx.fillStyle = '#10172a';
  ctx.strokeStyle = isSel? '#fff' : t.def.color;
  ctx.lineWidth = isSel?2.5:1.6;
  ctx.beginPath();
  const s = CELL*0.36;
  ctx.moveTo(-s,-s*0.5); ctx.lineTo(-s*0.5,-s); ctx.lineTo(s*0.5,-s); ctx.lineTo(s,-s*0.5);
  ctx.lineTo(s,s*0.5); ctx.lineTo(s*0.5,s); ctx.lineTo(-s*0.5,s); ctx.lineTo(-s,s*0.5);
  ctx.closePath(); ctx.fill(); ctx.stroke();
  // turret barrel
  ctx.rotate(t.angle||0);
  ctx.fillStyle = t.def.color;
  ctx.shadowColor = t.def.color; ctx.shadowBlur=8;
  ctx.fillRect(0,-3,s*1.1,6);
  ctx.shadowBlur=0;
  ctx.restore();
  // level pips
  for(let i=0;i<t.level;i++){
    ctx.fillStyle = t.def.color;
    ctx.beginPath(); ctx.arc(t.x - (t.level-1)*4 + i*8, t.y+CELL*0.42, 2.2, 0, Math.PI*2); ctx.fill();
  }
  if(isSel){
    ctx.strokeStyle='rgba(255,255,255,0.25)';
    ctx.beginPath(); ctx.arc(t.x,t.y,t.getRange(),0,Math.PI*2); ctx.stroke();
  }
}

function drawEnemy(e){
  ctx.save();
  ctx.translate(e.x,e.y);
  if(e.stealth && !e.revealed){ ctx.globalAlpha=0.25; }
  const flash = e.hitFlash>0;
  ctx.fillStyle = flash? '#fff' : e.def.color;
  ctx.strokeStyle = e.def.color;
  ctx.shadowColor = e.def.color; ctx.shadowBlur = e.isBoss?14:6;
  const sz = e.def.size;
  switch(e.def.shape){
    case 'circle':
      ctx.beginPath(); ctx.arc(0,0,sz*0.7,0,Math.PI*2); ctx.fill();
      break;
    case 'triangle':
      ctx.rotate(e.angle+Math.PI/2);
      ctx.beginPath(); ctx.moveTo(0,-sz*0.8); ctx.lineTo(sz*0.7,sz*0.6); ctx.lineTo(-sz*0.7,sz*0.6); ctx.closePath(); ctx.fill();
      break;
    case 'square':
      ctx.rotate(e.angle);
      ctx.fillRect(-sz*0.6,-sz*0.6,sz*1.2,sz*1.2);
      break;
    case 'diamond':
      ctx.rotate(Math.PI/4);
      ctx.fillRect(-sz*0.55,-sz*0.55,sz*1.1,sz*1.1);
      break;
    case 'hex':
    default:
      ctx.beginPath();
      for(let i=0;i<6;i++){
        const a = Math.PI/3*i;
        const px=Math.cos(a)*sz*0.75, py=Math.sin(a)*sz*0.75;
        if(i===0) ctx.moveTo(px,py); else ctx.lineTo(px,py);
      }
      ctx.closePath(); ctx.fill();
  }
  ctx.shadowBlur=0;
  ctx.restore();

  // hp bar
  const w = sz*1.6;
  ctx.fillStyle='rgba(0,0,0,0.5)';
  ctx.fillRect(e.x-w/2, e.y-sz-9, w, 4);
  ctx.fillStyle = e.hp/e.maxHp>0.5?'#0fffa0':(e.hp/e.maxHp>0.25?'#ffb800':'#ff2d6e');
  ctx.fillRect(e.x-w/2, e.y-sz-9, w*Math.max(0,e.hp/e.maxHp), 4);
  if(e.shieldMax>0 && e.shield>0){
    ctx.fillStyle='rgba(90,209,255,0.9)';
    ctx.fillRect(e.x-w/2, e.y-sz-13, w*(e.shield/e.shieldMax), 2.5);
  }
}

function drawProjectile(p){
  ctx.save();
  ctx.fillStyle=p.color; ctx.shadowColor=p.color; ctx.shadowBlur=8;
  ctx.beginPath();
  ctx.translate(p.x,p.y); ctx.rotate(p.angle);
  ctx.fillRect(-5,-1.5,10,3);
  ctx.restore();
}

function drawParticle(p){
  if(p.kind==='spark'){
    ctx.globalAlpha = Math.max(0,p.life/p.maxLife);
    ctx.fillStyle=p.color;
    ctx.beginPath(); ctx.arc(p.x,p.y,p.size,0,Math.PI*2); ctx.fill();
    ctx.globalAlpha=1;
  } else if(p.kind==='beam'){
    ctx.globalAlpha = Math.max(0,p.life/p.maxLife);
    ctx.strokeStyle=p.color; ctx.lineWidth=2.5; ctx.shadowColor=p.color; ctx.shadowBlur=10;
    ctx.beginPath(); ctx.moveTo(p.x,p.y); ctx.lineTo(p.x2,p.y2); ctx.stroke();
    ctx.shadowBlur=0; ctx.globalAlpha=1;
  } else if(p.kind==='shockwave'){
    ctx.globalAlpha = Math.max(0,p.life/p.maxLife)*0.7;
    ctx.strokeStyle=p.color; ctx.lineWidth=3;
    ctx.beginPath(); ctx.arc(p.x,p.y,p.radius,0,Math.PI*2); ctx.stroke();
    ctx.globalAlpha=1;
  }
}

function drawHero(h){
  if(!h.deployed) return;
  ctx.save();
  ctx.translate(h.x,h.y);
  ctx.fillStyle=h.def.color; ctx.shadowColor=h.def.color; ctx.shadowBlur=12;
  ctx.beginPath(); ctx.arc(0,0,14,0,Math.PI*2); ctx.fill();
  ctx.shadowBlur=0;
  ctx.fillStyle='#05070d';
  ctx.font='14px sans-serif'; ctx.textAlign='center'; ctx.textBaseline='middle';
  ctx.fillText(h.def.icon,0,1);
  ctx.restore();
  const w=30;
  ctx.fillStyle='rgba(0,0,0,0.5)'; ctx.fillRect(h.x-w/2,h.y-24,w,4);
  ctx.fillStyle='#0fffa0'; ctx.fillRect(h.x-w/2,h.y-24,w*Math.max(0,h.hp/h.maxHp),4);
}

function render(){
  drawGrid();
  drawPath();
  state.towers.forEach(drawTower);
  if(state.activeHeroId) drawHero(state.heroes[state.activeHeroId]);
  state.enemies.forEach(drawEnemy);
  state.projectiles.forEach(drawProjectile);
  drawPlacementPreview();

  fxCtx.clearRect(0,0,fxCanvas.width,fxCanvas.height);
  const tmp = ctx; ctx = fxCtx;
  state.particles.forEach(drawParticle);
  ctx = tmp;
}

/* =========================================================================
   UI WIRING
   ========================================================================= */
function buildTowerGrid(){
  const grid = document.getElementById('tower-grid');
  grid.innerHTML='';
  TOWER_ORDER.forEach(key=>{
    const def = TOWER_DEFS[key];
    const cost = Math.max(10, Math.round(def.cost * state.mods.towerCostMul));
    const card = document.createElement('div');
    card.className='tower-card'+(state.selectedTowerType===key?' selected':'')+(state.gold<cost?' unaffordable':'');
    card.innerHTML = `<div class="tower-icon" style="color:${def.color}">${def.icon}</div><div class="tower-name">${def.name}</div><div class="tower-cost">◆ ${cost}</div>`;
    card.onclick = ()=>{
      state.selectedTowerType = state.selectedTowerType===key? null : key;
      state.selectedEntity = null;
      buildTowerGrid();
      renderInfoPanel();
    };
    grid.appendChild(card);
  });
}

function buildHeroGrid(){
  const grid = document.getElementById('hero-grid');
  grid.innerHTML='';
  Object.keys(HERO_DEFS).forEach(key=>{
    if(!state.heroes[key]) state.heroes[key] = new Hero(key);
    const hero = state.heroes[key];
    const def = HERO_DEFS[key];
    const card = document.createElement('div');
    card.className='hero-card'+(state.activeHeroId===key?' active':'');
    const cdLabel = hero.respawnTimer>0? `RESPAWN ${Math.ceil(hero.respawnTimer/1000)}s` : (state.activeHeroId===key?'DEPLOYED':'TAP TO DEPLOY');
    card.innerHTML = `<div class="h-icon">${def.icon}</div><div class="h-name">${def.name}</div><div class="h-cd">${cdLabel}</div>`;
    card.onclick = ()=> deployHero(key);
    grid.appendChild(card);
  });
}

function deployHero(key){
  const hero = state.heroes[key];
  if(hero.respawnTimer>0) return;
  // swap: deploy at core entrance point
  state.activeHeroId = key;
  const spawnPt = state.pathPoints[1] || {x:CELL*2,y:CELL*GRID_ROWS/2};
  hero.deploy(spawnPt.x, spawnPt.y);
  buildHeroGrid();
}

function renderInfoPanel(){
  const el = document.getElementById('info-content');
  if(state.selectedEntity && state.selectedEntity instanceof Tower){
    const t = state.selectedEntity;
    const cost = t.upgradeCost();
    el.innerHTML = `
      <div class="info-row"><span>${t.def.name}</span><span>LV ${t.level}/${t.def.maxLevel}</span></div>
      <div class="info-row"><span>Damage</span><span>${Math.round(t.getDmg())}</span></div>
      <div class="info-row"><span>Range</span><span>${Math.round(t.getRange())}</span></div>
      <div class="info-row"><span>Fire Rate</span><span>${(1000/t.getRate()).toFixed(1)}/s</span></div>
      <div class="info-row"><span>Kills</span><span>${t.kills}</span></div>
      <div class="panel-actions">
        <button class="top-btn" id="btn-upgrade" ${t.level>=t.def.maxLevel?'disabled':''}>${t.level>=t.def.maxLevel?'MAX':'UPGRADE ◆'+cost}</button>
        <button class="top-btn danger" id="btn-sell">SELL ◆${t.sellValue()}</button>
      </div>`;
    const up = document.getElementById('btn-upgrade');
    if(up) up.onclick=()=>{
      if(state.gold>=cost && t.level<t.def.maxLevel){ state.gold-=cost; t.level++; renderInfoPanel(); updateHUD(); }
    };
    document.getElementById('btn-sell').onclick=()=>{
      state.gold += t.sellValue();
      state.towers = state.towers.filter(x=>x!==t);
      state.selectedEntity=null;
      renderInfoPanel(); updateHUD();
    };
  } else if(state.selectedEntity && state.selectedEntity instanceof Hero){
    const h = state.selectedEntity;
    el.innerHTML = `
      <div class="info-row"><span>${h.def.name}</span><span>${h.deployed?'ACTIVE':'BENCHED'}</span></div>
      <div class="info-row"><span>HP</span><span>${Math.round(h.hp)}/${h.maxHp}</span></div>
      <div class="info-row"><span>Ultimate</span><span>${h.def.ultName}</span></div>
      <div class="info-row"><span style="font-size:10px;line-height:1.4">${h.def.ultDesc}</span><span></span></div>
      <div class="panel-actions">
        <button class="top-btn" id="btn-ult" ${h.canUseUlt()?'':'disabled'}>${h.canUseUlt()?'USE ULTIMATE':'CD '+Math.ceil(h.ultCooldown/1000)+'s'}</button>
      </div>`;
    const ultBtn = document.getElementById('btn-ult');
    if(ultBtn) ultBtn.onclick=()=>{ h.useUlt(); renderInfoPanel(); };
  } else {
    el.innerHTML = `<div class="empty-hint">Select a tower from the grid to place it, or click a deployed tower / hero on the map to inspect and upgrade it.</div>`;
  }
}

function buildTechTree(){
  const body = document.getElementById('tech-body');
  body.innerHTML='';
  Object.keys(TECH_TREE).forEach(branchKey=>{
    const branch = TECH_TREE[branchKey];
    const col = document.createElement('div');
    col.className='tech-branch';
    col.innerHTML = `<div class="tech-branch-title">${branch.title}</div>`;
    branch.nodes.forEach(node=>{
      const purchased = !!state.techPurchased[node.id];
      const locked = node.requires && !state.techPurchased[node.requires];
      const afford = state.research >= node.cost;
      const div = document.createElement('div');
      div.className = 'tech-node'+(purchased?' maxed':'')+(locked?' locked-node':'');
      div.innerHTML = `<div class="t-icon">${node.icon}</div>
        <div class="t-info"><div class="t-name">${node.name}</div><div class="t-desc">${node.desc}</div></div>
        <div class="t-cost ${afford&&!purchased&&!locked?'afford':''}">${purchased?'✓':'⬡'+node.cost}</div>`;
      if(!purchased && !locked){
        div.onclick=()=>{
          if(state.research>=node.cost){
            state.research-=node.cost;
            state.techPurchased[node.id]=true;
            recalcMods();
            buildTechTree(); updateHUD(); buildTowerGrid();
          }
        };
      }
      col.appendChild(div);
    });
    body.appendChild(col);
  });
}

function updateHUD(){
  document.getElementById('stat-health').textContent = Math.round(state.health);
  document.getElementById('stat-gold').textContent = state.gold;
  document.getElementById('stat-research').textContent = Math.round(state.research);
  document.getElementById('stat-wave').textContent = `${Math.min(state.wave,TOTAL_WAVES)} / ${TOTAL_WAVES}`;
  const waveBtn = document.getElementById('btn-start-wave');
  waveBtn.disabled = state.waveActive;
  waveBtn.textContent = state.waveActive? '⏳ WAVE IN PROGRESS' : (state.wave>=TOTAL_WAVES? '▶ DEPLOY FINAL WAVE' : '▶ DEPLOY WAVE');
  refreshHeroLabels();
  refreshTowerAffordability();
}

// Lightweight per-frame refresh: only updates text content of existing hero cards,
// never rebuilds DOM nodes (rebuilding every frame would destroy click targets / hover state).
function refreshHeroLabels(){
  const cards = document.querySelectorAll('#hero-grid .hero-card');
  Object.keys(HERO_DEFS).forEach((key,i)=>{
    const hero = state.heroes[key];
    if(!hero || !cards[i]) return;
    const cdEl = cards[i].querySelector('.h-cd');
    const label = hero.respawnTimer>0? `RESPAWN ${Math.ceil(hero.respawnTimer/1000)}s` : (state.activeHeroId===key?'DEPLOYED':'TAP TO DEPLOY');
    if(cdEl && cdEl.textContent!==label) cdEl.textContent = label;
    cards[i].classList.toggle('active', state.activeHeroId===key);
  });
}

function refreshTowerAffordability(){
  document.querySelectorAll('.tower-card').forEach((card,i)=>{
    const key = TOWER_ORDER[i];
    const cost = Math.max(10, Math.round(TOWER_DEFS[key].cost*state.mods.towerCostMul));
    card.classList.toggle('unaffordable', state.gold<cost);
  });
}

function showEndScreen(won){
  document.getElementById('end-screen').classList.remove('hidden');
  document.getElementById('end-title').textContent = won? 'VICTORY':'DEFEAT';
  document.getElementById('end-title').className = 'overlay-title '+(won?'win':'lose');
  document.getElementById('end-sub').textContent = won? 'The core held against every wave. Nexus Defense grid fully operational.' : 'The core has been overrun. Synthetic forces breach the perimeter.';
  document.getElementById('end-wave').textContent = Math.min(state.wave,TOTAL_WAVES);
  document.getElementById('end-kills').textContent = state.kills;
  document.getElementById('end-gold').textContent = state.goldEarnedTotal;
}

/* =========================================================================
   INPUT HANDLING
   ========================================================================= */
function setupInput(){
  canvas.addEventListener('mousemove', e=>{
    const rect = canvas.getBoundingClientRect();
    mouseX = e.clientX-rect.left; mouseY = e.clientY-rect.top;
    mouseGX = Math.floor(mouseX/CELL); mouseGY = Math.floor(mouseY/CELL);
  });
  canvas.addEventListener('mouseleave', ()=>{ mouseGX=-1; mouseGY=-1; });
  canvas.addEventListener('click', e=>{
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX-rect.left, y = e.clientY-rect.top;
    const gx = Math.floor(x/CELL), gy = Math.floor(y/CELL);

    if(state.selectedTowerType){
      const def = TOWER_DEFS[state.selectedTowerType];
      const cost = Math.max(10, Math.round(def.cost*state.mods.towerCostMul));
      if(!isOnPath(gx,gy) && !towerAt(gx,gy) && state.gold>=cost && gx>=0&&gx<GRID_COLS&&gy>=0&&gy<GRID_ROWS){
        state.gold -= cost;
        const t = new Tower(state.selectedTowerType, gx, gy);
        state.towers.push(t);
        state.selectedTowerType = null;
        buildTowerGrid();
        updateHUD();
      }
      return;
    }
    // selection: check tower
    const t = towerAt(gx,gy);
    if(t){ state.selectedEntity=t; renderInfoPanel(); return; }
    // check hero proximity
    if(state.activeHeroId){
      const h = state.heroes[state.activeHeroId];
      if(h.deployed && Math.hypot(h.x-x,h.y-y)<20){ state.selectedEntity=h; renderInfoPanel(); return; }
    }
    state.selectedEntity=null; renderInfoPanel();
  });

  // touch support
  canvas.addEventListener('touchstart', e=>{
    const rect = canvas.getBoundingClientRect();
    const touch = e.touches[0];
    mouseX = touch.clientX-rect.left; mouseY = touch.clientY-rect.top;
    mouseGX = Math.floor(mouseX/CELL); mouseGY = Math.floor(mouseY/CELL);
  }, {passive:true});

  document.getElementById('btn-start-wave').onclick = startWave;
  document.getElementById('btn-restart').onclick = ()=> initGame(state.difficulty);

  document.getElementById('tech-handle').onclick = ()=>{
    document.getElementById('tech-drawer').classList.toggle('open');
  };

  document.querySelectorAll('.speed-btn').forEach(btn=>{
    btn.onclick = ()=>{
      document.querySelectorAll('.speed-btn').forEach(b=>b.classList.remove('active'));
      btn.classList.add('active');
      state.speed = parseInt(btn.dataset.speed);
    };
  });

  document.querySelectorAll('.diff-btn').forEach(btn=>{
    btn.onclick=()=>{
      document.querySelectorAll('.diff-btn').forEach(b=>b.classList.remove('active'));
      btn.classList.add('active');
      state.difficulty = btn.dataset.diff;
    };
  });
  document.getElementById('btn-launch').onclick = ()=>{
    document.getElementById('start-screen').classList.add('hidden');
    initGame(state.difficulty);
  };
  document.getElementById('btn-play-again').onclick = ()=>{
    document.getElementById('end-screen').classList.add('hidden');
    initGame(state.difficulty);
  };

  window.addEventListener('resize', resizeCanvases);
}

/* =========================================================================
   INIT / MAIN LOOP
   ========================================================================= */
function initGame(difficulty){
  state.difficulty = difficulty;
  state.gold = 200;
  state.research = 0;
  state.wave = 0;
  state.waveActive=false; state.waveSpawning=false; state.gameOver=false;
  state.kills=0; state.goldEarnedTotal=0;
  state.towers=[]; state.enemies=[]; state.projectiles=[]; state.particles=[];
  state.heroes={}; state.activeHeroId=null;
  state.selectedTowerType=null; state.selectedEntity=null;
  state.techPurchased={};
  recalcMods();
  state.health = state.maxHealth;

  const seed = Math.floor(Math.random()*1e9);
  state.path = generatePath(GRID_COLS, GRID_ROWS, seed);
  state.pathSet = new Set(state.path.map(p=>`${p.c},${p.r}`));
  resizeCanvases();

  buildTowerGrid();
  buildHeroGrid();
  buildTechTree();
  renderInfoPanel();
  updateHUD();
  document.getElementById('end-screen').classList.add('hidden');
}

let lastTime=0;
function loop(ts){
  if(!lastTime) lastTime=ts;
  let dt = (ts-lastTime)/1000;
  dt = Math.min(dt, 0.05); // clamp for tab-switch safety
  lastTime = ts;
  if(!state.gameOver){
    const steps = state.speed;
    for(let i=0;i<steps;i++) gameUpdate(dt);
  }
  // hero respawn timer ticks regardless of speed mult for fairness
  Object.values(state.heroes).forEach(h=>{
    if(h.respawnTimer>0){ h.respawnTimer -= dt*1000*state.speed; if(h.respawnTimer<=0){h.respawnTimer=0; buildHeroGrid();} }
  });
  render();
  requestAnimationFrame(loop);
}

window.addEventListener('DOMContentLoaded', ()=>{
  canvas = document.getElementById('gameCanvas');
  fxCanvas = document.getElementById('fxCanvas');
  ctx = canvas.getContext('2d');
  fxCtx = fxCanvas.getContext('2d');
  setupInput();
  recalcMods();
  resizeCanvases();
  requestAnimationFrame(loop);
});
