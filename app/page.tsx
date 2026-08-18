"use client";

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Grid, OrbitControls, Sparkles } from "@react-three/drei";
import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import type { Group, Mesh } from "three";

type Stage = {
  id: string; short: string; latin: string; title: string; time: string;
  date: string; accent: string; color: string; environment: string;
  fact: string; evidence: string; hotspot: string; hotspotDetail: string;
};

const stages: Stage[] = [
  { id:"cell",short:"细胞",latin:"PROKARYOTIC CELL",title:"生命起步",time:"≥ 3.7 Ga",date:"至少 37 亿年前",accent:"#b8f06c",color:"#438667",environment:"无氧海洋",fact:"简单细胞已经存在。模型中的中央链状结构是拟核，不是真正的细胞核。",evidence:"同位素·叠层石·微体化石",hotspot:"拟核",hotspotDetail:"原核生物的 DNA 不被核膜包裹。"},
  { id:"eukaryote",short:"真核",latin:"EUKARYOGENESIS",title:"两种生命合为一体",time:"1.8–2.7 Ga",date:"约 27–18 亿年前",accent:"#72d9ef",color:"#3189a0",environment:"原生海洋",fact:"古菌谱系的宿主与细菌建立内共生，后者最终成为线粒体。",evidence:"线粒体 DNA·双层膜·分子系统树",hotspot:"线粒体",hotspotDetail:"它保留自己的环状 DNA，显示其细菌起源。"},
  { id:"ocean",short:"海洋动物",latin:"EARLY CHORDATES",title:"身体开始有了前后",time:"≈ 520 Ma",date:"约 5.2 亿年前",accent:"#ffbf69",color:"#a76939",environment:"寒武纪海洋",fact:"早期脊索动物形成明确的头尾轴、肌节与背侧神经索，但它们还不是有颌鱼类。",evidence:"澄江生物群·软躯体化石",hotspot:"脊索",hotspotDetail:"支撑身体的弹性结构，是脊柱的演化前身。"},
  { id:"land",short:"登陆",latin:"TETRAPOD TRANSITION",title:"鳍内骨骼变成四肢",time:"≈ 375 Ma",date:"约 3.75 亿年前",accent:"#e9de73",color:"#69733d",environment:"泥盆与浅水",fact:"肉鳍鱼的鳍肢已有与上臂、前臂相应的骨骼。过渡发生在浅水边缘，不是一次跃上陆地。",evidence:"Tiktaalik·Acanthostega·骨骼同源",hotspot:"鳍肢骨",hotspotDetail:"一块上骨、两块前骨、多块末端骨的布局已出现。"},
  { id:"mammal",short:"哺乳类",latin:"EARLY MAMMALIAFORMS",title:"在恐龙脚下的夜行者",time:"≈ 225 Ma",date:"约 2.25 亿年前",accent:"#ef9a75",color:"#815744",environment:"三叠纪森林",fact:"最早哺乳类与恐龙共存。毛发、高代谢与中耳骨是在哺乳形类中逐步组合的。",evidence:"牙齿·下颌·软组织印痕",hotspot:"中耳骨",hotspotDetail:"原先属于颌关节的骨骼逐步参与听觉。"},
  { id:"hominin",short:"人族",latin:"AUSTRALOPITHECUS",title:"双足先于大脑",time:"≈ 3.7 Ma",date:"约 370 万年前",accent:"#f2c394",color:"#9c6947",environment:"林地与草地镶嵌",fact:"南方古猿已能稳定双足行走，但脑容量仍接近类人猿。人类特征不是一包同时出现的套装。",evidence:"Laetoli 足迹·骨盆·股骨",hotspot:"短宽骨盆",hotspotDetail:"骨盆侧向弯曲，让单腿支撑时能稳定躯干。"},
  { id:"human",short:"智人",latin:"HOMO SAPIENS",title:"还在演化的一支",time:"≈ 300 ka",date:"约 30 万年前至今",accent:"#f2eee0",color:"#b8a48d",environment:"非洲，后扩散至全球",fact:"智人在非洲的联系种群中逐步演化，并与尼安德特人、丹尼索瓦人发生基因交流。",evidence:"化石·古 DNA·考古学",hotspot:"高圆颅形",hotspotDetail:"智人颅骨更高圆，眉脊减小；大脑不是简单变大，而是重组。"},
];

function mat(color:string, wireframe:boolean, emissive="#000000"){
  return <meshStandardMaterial color={color} roughness={.56} metalness={.03} wireframe={wireframe} emissive={emissive} emissiveIntensity={.45}/>;
}

function ProtoCell({wireframe}:{wireframe:boolean}){
  return <group>
    <mesh><icosahedronGeometry args={[2.1,5]}/><meshPhysicalMaterial color="#438667" roughness={.2} transmission={wireframe?0:.28} thickness={1.1} transparent opacity={wireframe?.3:.72} wireframe={wireframe}/></mesh>
    <mesh rotation={[.7,.2,.5]}><torusKnotGeometry args={[.62,.12,150,18,2,5]}/>{mat("#d7ff7a",wireframe,"#6c992f")}</mesh>
    {Array.from({length:15},(_,i)=><mesh key={i} position={[Math.sin(i*2.7)*1.35,Math.cos(i*1.4)*1.15,Math.sin(i*1.9)*1.2]}><sphereGeometry args={[.07+(i%3)*.03,16,16]}/>{mat(i%2?"#ef8b50":"#b9e96d",wireframe)}</mesh>)}
  </group>;
}

function Eukaryote({wireframe}:{wireframe:boolean}){
  return <group>
    <mesh><sphereGeometry args={[2.12,64,64]}/><meshPhysicalMaterial color="#317f91" transparent opacity={wireframe?.25:.5} transmission={wireframe?0:.32} roughness={.18} wireframe={wireframe}/></mesh>
    <mesh position={[-.35,.18,.1]}><sphereGeometry args={[.76,40,40]}/>{mat("#7bdcf0",wireframe,"#1a768c")}</mesh>
    {[[-1.1,.75,.45],[.95,.65,.25],[.9,-.85,.6],[-.85,-.85,-.2]].map((p,i)=><mesh key={i} position={p as [number,number,number]} rotation={[0,i*.8,.5]}><capsuleGeometry args={[.18,.55,12,24]}/>{mat("#ffae65",wireframe,"#8e4725")}</mesh>)}
    <mesh rotation={[1,.2,.3]}><torusGeometry args={[1.35,.035,12,100]}/>{mat("#bcefff",wireframe)}</mesh>
  </group>;
}

function Chordate({wireframe}:{wireframe:boolean}){
  return <group rotation={[0,-.32,0]}>
    <mesh scale={[2.3,.58,.48]}>{<sphereGeometry args={[1,48,32]}/>} {mat("#c88747",wireframe)}</mesh>
    <mesh position={[2.25,0,0]} rotation={[0,0,-Math.PI/2]}><coneGeometry args={[.78,1.45,3]}/>{mat("#e0a258",wireframe)}</mesh>
    <mesh position={[-1.7,.18,.26]}><sphereGeometry args={[.14,24,24]}/>{mat("#efffca",wireframe,"#efffca")}</mesh>
    <mesh position={[-.6,.55,0]} rotation={[0,0,-.25]}><coneGeometry args={[.36,1.05,3]}/>{mat("#e2a95c",wireframe)}</mesh>
    <mesh position={[-.2,-.48,.24]} rotation={[1.2,0,.2]}><coneGeometry args={[.32,.85,3]}/>{mat("#a96d37",wireframe)}</mesh>
    {Array.from({length:8},(_,i)=><mesh key={i} position={[-1+i*.38,0,.47]}><boxGeometry args={[.04,.68,.035]}/>{mat("#5d412b",wireframe)}</mesh>)}
  </group>;
}

function Tetrapod({wireframe}:{wireframe:boolean}){
  const limb=(x:number,z:number,side:number)=><group position={[x,-.22,z]} rotation={[0,0,side*.65]}><mesh><capsuleGeometry args={[.15,.72,10,18]}/>{mat("#8b934a",wireframe)}</mesh><mesh position={[side*.28,-.5,0]} rotation={[0,0,side*.7]}><capsuleGeometry args={[.11,.55,10,18]}/>{mat("#a5a858",wireframe)}</mesh></group>;
  return <group rotation={[0,-.2,0]}>
    <mesh scale={[2.05,.7,.62]}><sphereGeometry args={[1,48,32]}/>{mat("#737a3e",wireframe)}</mesh>
    <mesh position={[-1.72,.2,0]} scale={[.78,.62,.62]}><sphereGeometry args={[1,36,24]}/>{mat("#858b49",wireframe)}</mesh>
    <mesh position={[-2.18,.35,.42]}><sphereGeometry args={[.1,18,18]}/>{mat("#f2ee9b",wireframe,"#f2ee9b")}</mesh>
    <mesh position={[2.1,0,0]} rotation={[0,0,-Math.PI/2]}><coneGeometry args={[.55,1.65,14]}/>{mat("#69713b",wireframe)}</mesh>
    {limb(-.8,.5,-1)}{limb(-.8,-.5,-1)}{limb(.95,.5,1)}{limb(.95,-.5,1)}
  </group>;
}

function Mammal({wireframe}:{wireframe:boolean}){
  const leg=(x:number,z:number)=><group position={[x,-.65,z]}><mesh><capsuleGeometry args={[.17,.9,10,18]}/>{mat("#7b5544",wireframe)}</mesh><mesh position={[0,-.58,.08]} rotation={[Math.PI/2,0,0]}><capsuleGeometry args={[.14,.35,8,14]}/>{mat("#6f493b",wireframe)}</mesh></group>;
  return <group rotation={[0,-.45,0]}>
    <mesh scale={[1.75,.82,.73]}><sphereGeometry args={[1,48,32]}/>{mat("#865f4b",wireframe)}</mesh>
    <mesh position={[-1.65,.25,0]} scale={[.75,.65,.64]}><sphereGeometry args={[1,36,24]}/>{mat("#956b52",wireframe)}</mesh>
    <mesh position={[-2.15,.12,0]} rotation={[0,0,Math.PI/2]}><coneGeometry args={[.38,.85,18]}/>{mat("#9f7459",wireframe)}</mesh>
    <mesh position={[-1.72,.78,.35]} rotation={[.4,0,-.2]}><coneGeometry args={[.23,.72,14]}/>{mat("#9c7056",wireframe)}</mesh>
    <mesh position={[-2.05,.37,.43]}><sphereGeometry args={[.09,16,16]}/>{mat("#fff3bf",wireframe,"#fff3bf")}</mesh>
    <mesh position={[1.78,.18,0]} rotation={[0,0,-Math.PI/2]}><torusGeometry args={[1.05,.1,12,50,Math.PI*1.35]}/>{mat("#78503f",wireframe)}</mesh>
    {leg(-1,.48)}{leg(-1,-.48)}{leg(.9,.48)}{leg(.9,-.48)}
  </group>;
}

function Humanoid({wireframe,modern=false}:{wireframe:boolean;modern?:boolean}){
  const skin=modern?"#b7a38c":"#9b6848"; const torso=modern?[.82,1.55,.48]:[.92,1.35,.55];
  return <group position={[0,-1.4,0]} rotation={[0,-.25,0]}>
    <mesh position={[0,3.02,0]} scale={modern?[.58,.72,.58]:[.64,.68,.66]}><sphereGeometry args={[1,40,32]}/>{mat(skin,wireframe)}</mesh>
    {!modern&&<mesh position={[-.1,2.82,.56]} scale={[.5,.32,.34]}><sphereGeometry args={[1,24,18]}/>{mat("#a97856",wireframe)}</mesh>}
    <mesh position={[0,1.75,0]} scale={torso as [number,number,number]}><sphereGeometry args={[1,36,28]}/>{mat(skin,wireframe)}</mesh>
    <mesh position={[0,.65,0]} scale={[.72,.52,.5]}><sphereGeometry args={[1,32,24]}/>{mat(modern?"#a88e74":"#8e5e43",wireframe)}</mesh>
    {[[-.58,1.9,.15,.22],[.58,1.9,.15,-.22]].map((p,i)=><group key={i} position={[p[0],p[1],p[2]]} rotation={[0,0,p[3]]}><mesh position={[0,-.56,0]}><capsuleGeometry args={[.19,1.12,10,18]}/>{mat(skin,wireframe)}</mesh><mesh position={[i?-.18:.18,-1.48,0]} rotation={[0,0,i?.22:-.22]}><capsuleGeometry args={[.16,.9,10,18]}/>{mat(skin,wireframe)}</mesh></group>)}
    {[[-.33,.2,0,-.08],[.33,.2,0,.08]].map((p,i)=><group key={i} position={[p[0],p[1],p[2]]} rotation={[0,0,p[3]]}><mesh position={[0,-.62,0]}><capsuleGeometry args={[.25,1.18,10,18]}/>{mat(skin,wireframe)}</mesh><mesh position={[i?-.04:.04,-1.62,.04]}><capsuleGeometry args={[.2,.92,10,18]}/>{mat(skin,wireframe)}</mesh><mesh position={[0,-2.13,.17]} rotation={[Math.PI/2,0,0]}><capsuleGeometry args={[.19,.38,8,14]}/>{mat(skin,wireframe)}</mesh></group>)}
  </group>;
}

function Model({id,wireframe}:{id:string;wireframe:boolean}){
  if(id==="cell") return <ProtoCell wireframe={wireframe}/>;
  if(id==="eukaryote") return <Eukaryote wireframe={wireframe}/>;
  if(id==="ocean") return <Chordate wireframe={wireframe}/>;
  if(id==="land") return <Tetrapod wireframe={wireframe}/>;
  if(id==="mammal") return <Mammal wireframe={wireframe}/>;
  return <Humanoid wireframe={wireframe} modern={id==="human"}/>;
}

function CameraRig({stage}:{stage:number}){
  const {camera}=useThree();
  useFrame((_,delta)=>{
    const human=stage>4; const target=new THREE.Vector3(human?0:0,human?.35:0,human?8.7:7.4);
    camera.position.lerp(target,1-Math.exp(-delta*2.4)); camera.lookAt(0,human?.25:0,0);
  }); return null;
}

function EvolutionModel({stage,paused,wireframe}:{stage:number;paused:boolean;wireframe:boolean}){
  const ref=useRef<Group>(null); const [born]=useState(()=>performance.now());
  useFrame((state,delta)=>{
    if(!ref.current)return;
    const age=(performance.now()-born)/1000; const s=Math.min(1,age*1.7);
    ref.current.scale.lerp(new THREE.Vector3(s,s,s),.16);
    ref.current.position.y=Math.sin(state.clock.elapsedTime*.75)*.1;
    if(!paused) ref.current.rotation.y+=delta*.08;
  });
  return <group ref={ref} scale={0.02} key={stages[stage].id}><Model id={stages[stage].id} wireframe={wireframe}/></group>;
}

function Hotspot({stage,open,onOpen}:{stage:number;open:boolean;onOpen:()=>void}){
  const mesh=useRef<Mesh>(null); const positions:[[number,number,number],...Array<[number,number,number]>]=[[.35,.2,.8],[.95,.65,.6],[0,.35,.65],[.8,-.15,.75],[-1.55,.65,.65],[0,.7,.65],[0,3.35,.5]];
  useFrame((state)=>{if(mesh.current){const s=1+Math.sin(state.clock.elapsedTime*3)*.18;mesh.current.scale.setScalar(s)}});
  return <group position={positions[stage]}><mesh ref={mesh} onClick={(e)=>{e.stopPropagation();onOpen()}}><sphereGeometry args={[open?.16:.12,20,20]}/><meshBasicMaterial color={stages[stage].accent}/></mesh><pointLight color={stages[stage].accent} intensity={4} distance={2}/></group>;
}

function Scene({stage,paused,wireframe,hotspot,openHotspot}:{stage:number;paused:boolean;wireframe:boolean;hotspot:boolean;openHotspot:()=>void}){
  return <Canvas camera={{position:[0,0,7.4],fov:40}} dpr={[1,1.6]} gl={{antialias:true,toneMapping:THREE.ACESFilmicToneMapping}}>
    <color attach="background" args={["#050a08"]}/><fog attach="fog" args={["#050a08",8,18]}/>
    <ambientLight intensity={.8}/><hemisphereLight color={stages[stage].accent} groundColor="#18201b" intensity={1.5}/>
    <directionalLight position={[-5,6,5]} intensity={3.5} color="#eaf5da"/><pointLight position={[4,-2,3]} intensity={7} color={stages[stage].accent} distance={12}/>
    <Suspense fallback={null}><EvolutionModel key={stages[stage].id} stage={stage} paused={paused} wireframe={wireframe}/>{hotspot&&<Hotspot stage={stage} open={hotspot} onOpen={openHotspot}/>}</Suspense>
    <Sparkles count={stage<2?120:55} scale={[11,7,7]} size={stage<2?2.4:1.2} speed={.16} color={stages[stage].accent} opacity={.35}/>
    <Grid position={[0,-3.25,0]} args={[20,20]} cellSize={.7} cellThickness={.4} cellColor="#33483d" sectionSize={3.5} sectionThickness={.7} sectionColor={stages[stage].color} fadeDistance={13} fadeStrength={1.5} infiniteGrid/>
    <CameraRig stage={stage}/><OrbitControls makeDefault enablePan={false} minDistance={4.8} maxDistance={11} autoRotate={!paused} autoRotateSpeed={.28} target={[0,stage>4?.25:0,0]}/>
  </Canvas>;
}

export default function Home(){
  const [stage,setStage]=useState(0); const [paused,setPaused]=useState(false); const [wireframe,setWireframe]=useState(false); const [hotspot,setHotspot]=useState(true); const [detail,setDetail]=useState(false); const wheelLock=useRef(false);
  const current=stages[stage]; const progress=(stage/(stages.length-1))*100;
  const go=(next:number)=>{setStage(Math.max(0,Math.min(stages.length-1,next)));setDetail(false)};
  useEffect(()=>{const key=(e:KeyboardEvent)=>{if(e.key==="ArrowRight"||e.key===" "){e.preventDefault();go(stage+1)}if(e.key==="ArrowLeft"){e.preventDefault();go(stage-1)}};window.addEventListener("keydown",key);return()=>window.removeEventListener("keydown",key)},[stage]);
  useEffect(()=>{const wheel=(e:WheelEvent)=>{if(Math.abs(e.deltaY)<20||wheelLock.current)return;wheelLock.current=true;go(stage+(e.deltaY>0?1:-1));setTimeout(()=>wheelLock.current=false,650)};window.addEventListener("wheel",wheel,{passive:true});return()=>window.removeEventListener("wheel",wheel)},[stage]);

  return <main className="experience" style={{"--stage-accent":current.accent,"--stage-color":current.color} as React.CSSProperties}>
    <header>
      <a className="mark" href="#" onClick={e=>{e.preventDefault();go(0)}}>ORIGIN <span>/ 38</span></a>
      <div className="status"><i/> EVOLUTION EXPLORER <b>{String(stage+1).padStart(2,"0")}</b></div>
      <div className="header-actions"><button className={wireframe?"on":""} onClick={()=>setWireframe(!wireframe)} aria-pressed={wireframe}>结构视图</button><button onClick={()=>setPaused(!paused)}>{paused?"▶ 继续":"Ⅱ 暂停"}</button></div>
    </header>
    <section className="viewport">
      <Scene stage={stage} paused={paused} wireframe={wireframe} hotspot={hotspot} openHotspot={()=>setDetail(!detail)}/>
      <div className="hud hud-left">
        <div className="chapter"><span>{String(stage+1).padStart(2,"0")}</span><i/><b>{current.latin}</b></div>
        <h1 key={current.title}>{current.title}</h1>
        <div className="time"><strong>{current.time}</strong><span>{current.date}</span></div>
        <p className="brief">{current.fact}</p>
        <div className="evidence"><small>EVIDENCE</small>{current.evidence}</div>
      </div>
      <aside className={`hotspot-card ${detail?"open":""}`}>
        <button onClick={()=>setDetail(false)} aria-label="关闭结构说明">×</button><small>SELECTED TRAIT</small><h2>{current.hotspot}</h2><p>{current.hotspotDetail}</p>
      </aside>
      <div className="model-meta"><span>{current.environment}</span><b>CONCEPTUAL 3D RECONSTRUCTION</b><small>概念复原，非按比例化石扫描</small></div>
      <button className={`hotspot-toggle ${hotspot?"active":""}`} onClick={()=>{setHotspot(!hotspot);setDetail(false)}}><i/>{hotspot?"结构热点已开启":"开启结构热点"}</button>
      <div className="gesture"><span>↔</span> 拖拽旋转 <i/>滚轮推进 <i/>点击光点解剖</div>
      <button className="prev" onClick={()=>go(stage-1)} disabled={stage===0} aria-label="上一阶段">←</button><button className="next" onClick={()=>go(stage+1)} disabled={stage===stages.length-1} aria-label="下一阶段">→</button>
    </section>
    <footer className="timeline">
      <div className="scale"><span>≥ 3.7 Ga</span><div className="track"><i style={{width:`${progress}%`}}/><b style={{left:`${progress}%`}}/></div><span>NOW</span></div>
      <nav aria-label="演化阶段">{stages.map((s,i)=><button key={s.id} className={stage===i?"active":""} onClick={()=>go(i)} aria-current={stage===i?"step":undefined}><span>{String(i+1).padStart(2,"0")}</span><b>{s.short}</b><small>{s.time}</small></button>)}</nav>
    </footer>
  </main>;
}
