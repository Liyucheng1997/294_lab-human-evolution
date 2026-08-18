import "./styles.css";
import { stages, brainComparison, calendarDate, type Chapter, type Hotspot } from "./data/stages";
import { EvolutionApp } from "./three/app";
import { renderTree } from "./tree";

const $ = <T extends HTMLElement>(id: string) => document.getElementById(id) as T;

const canvas = $<HTMLCanvasElement>("scene");
const labelRoot = $("labels");
const veil = $("veil");
const panel = $("panel");
const hotspotCard = $("hotspot-card");
const treeModal = $("tree-modal");
const sourcesModal = $("sources-modal");

let current = 0;
let playing = false;
let playTimer: number | null = null;
const PLAY_INTERVAL = 11000;

// ---------- Three.js ----------
const app = new EvolutionApp({
  canvas,
  labelRoot,
  onHotspot: (h: Hotspot, i: number) => showHotspot(h, i),
});

// ---------- 章节导航 ----------
const chapters: Chapter[] = ["微观生命", "海洋时代", "登上陆地", "哺乳与灵长", "人族"];
const chapterNav = $("chapters");
chapters.forEach((c, i) => {
  const b = document.createElement("button");
  b.innerHTML = `<b>${["Ⅰ", "Ⅱ", "Ⅲ", "Ⅳ", "Ⅴ"][i]}</b>${c}`;
  b.addEventListener("click", () => goTo(stages.findIndex((s) => s.chapter === c)));
  chapterNav.appendChild(b);
});

// ---------- 时间轴（对数刻度） ----------
const LOG_MAX = Math.log10(4.0e9);
const LOG_MIN = Math.log10(1.0e5);
const toPct = (yearsAgo: number) => ((LOG_MAX - Math.log10(yearsAgo)) / (LOG_MAX - LOG_MIN)) * 100;

const ticks = $("ticks");
[
  [4e9, "40 亿"],
  [1e9, "10 亿"],
  [1e8, "1 亿"],
  [1e7, "1000 万"],
  [1e6, "100 万"],
  [1e5, "10 万"],
].forEach(([v, label]) => {
  const s = document.createElement("span");
  s.style.left = `${toPct(v as number)}%`;
  s.textContent = String(label);
  ticks.appendChild(s);
});
const markers = $("markers");
const markerEls: HTMLButtonElement[] = stages.map((s, i) => {
  const b = document.createElement("button");
  b.className = "marker";
  b.style.left = `${toPct(s.yearsAgo)}%`;
  b.innerHTML = `<i></i><span>${s.name}</span>`;
  b.title = `${s.name} · ${s.yearsLabel}`;
  b.addEventListener("click", () => goTo(i));
  markers.appendChild(b);
  return b;
});
const progress = $("progress");

// ---------- 面板渲染 ----------
function renderPanel(i: number) {
  const s = stages[i];
  document.documentElement.style.setProperty("--accent", s.accent);
  $("stage-index").textContent = `第 ${String(i + 1).padStart(2, "0")} 站 / ${stages.length}`;
  $("stage-chapter").textContent = s.chapter;
  $("stage-name").textContent = s.name;
  $("stage-organism").textContent = s.organism;
  $("stage-latin").textContent = s.latin;
  $("stage-years").textContent = s.yearsLabel;
  $("stage-era").textContent = s.era;
  $("stage-size").textContent = s.size;
  $("stage-innovation").textContent = s.innovation;
  $("stage-summary").textContent = s.summary;
  $("stage-metrics").innerHTML = s.metrics.map((m) => `<div><span>${m.value}</span><small>${m.label}</small></div>`).join("");
  $("stage-calendar").innerHTML = `如果把地球 46 亿年的历史压缩成一年，这一站发生在 <b>${calendarDate(s.yearsAgo)}</b>。`;
  $("stage-points").innerHTML = s.points.map((p) => `<li>${p}</li>`).join("");
  $("stage-evidence").textContent = s.evidence;
  $("stage-legacy").textContent = s.legacy;
  $("stage-habitat").textContent = s.habitat;

  const brainSec = $("brain-sec");
  if (s.brainCc) {
    brainSec.hidden = false;
    const max = 1600;
    const nameOf: Record<string, string> = { ardipithecus: "地猿", australopithecus: "南方古猿", habilis: "能人", erectus: "直立人", sapiens: "智人" };
    $("brain-chart").innerHTML = brainComparison
      .map((b) => `<div class="brain-row ${nameOf[s.id] === b.name ? "current" : ""}"><span>${b.name}</span><div class="bar"><i style="width:${(b.cc / max) * 100}%"></i></div><b>${b.cc}</b></div>`)
      .join("");
  } else {
    brainSec.hidden = true;
  }
  panel.querySelector(".panel-body")!.scrollTop = 0;

  // 章节高亮
  Array.from(chapterNav.children).forEach((c, k) => c.classList.toggle("active", chapters[k] === s.chapter));
  // 时间轴
  markerEls.forEach((m, k) => {
    m.classList.toggle("active", k === i);
    m.classList.toggle("done", k < i);
  });
  progress.style.width = `${toPct(s.yearsAgo)}%`;
  $<HTMLButtonElement>("btn-prev").disabled = i === 0;
  $<HTMLButtonElement>("btn-next").disabled = i === stages.length - 1;
  document.title = `${String(i + 1).padStart(2, "0")} ${s.name} · 人类的进化`;
}

// ---------- 切换阶段 ----------
let switching = false;
function goTo(i: number, opts: { instant?: boolean } = {}) {
  i = Math.max(0, Math.min(stages.length - 1, i));
  if (i === current && !opts.instant) return;
  if (switching) return;
  const envChanges = stages[i].env !== stages[current].env;
  hideHotspot();
  if (envChanges && !opts.instant) {
    switching = true;
    veil.classList.add("on");
    window.setTimeout(() => {
      current = i;
      app.setStage(stages[i], { animateCamera: false });
      renderPanel(i);
      window.setTimeout(() => {
        veil.classList.remove("on");
        switching = false;
      }, 120);
    }, 340);
  } else {
    current = i;
    app.setStage(stages[i], { animateCamera: !opts.instant });
    renderPanel(i);
  }
  location.hash = stages[i].id;
  if (playing) schedulePlay();
}

function schedulePlay() {
  if (playTimer) window.clearTimeout(playTimer);
  playTimer = window.setTimeout(() => {
    if (!playing) return;
    if (current >= stages.length - 1) {
      setPlaying(false);
      return;
    }
    goTo(current + 1);
  }, PLAY_INTERVAL);
}
function setPlaying(on: boolean) {
  playing = on;
  const b = $("btn-play");
  b.classList.toggle("playing", on);
  b.innerHTML = on ? `<span class="ico">❚❚</span><span>暂停</span>` : `<span class="ico">▶</span><span>自动播放</span>`;
  if (on) {
    if (current >= stages.length - 1) goTo(0);
    schedulePlay();
  } else if (playTimer) {
    window.clearTimeout(playTimer);
    playTimer = null;
  }
}

// ---------- 热点卡片 ----------
function showHotspot(h: Hotspot, i: number) {
  $("hotspot-num").textContent = String(i + 1);
  $("hotspot-title").textContent = h.label;
  $("hotspot-detail").textContent = h.detail;
  hotspotCard.hidden = false;
}
function hideHotspot() {
  hotspotCard.hidden = true;
}
$("hotspot-close").addEventListener("click", hideHotspot);

// ---------- 按钮 ----------
$("btn-prev").addEventListener("click", () => goTo(current - 1));
$("btn-next").addEventListener("click", () => goTo(current + 1));
$("btn-play").addEventListener("click", () => setPlaying(!playing));
$("btn-rotate").addEventListener("click", (e) => {
  const b = e.currentTarget as HTMLElement;
  b.classList.toggle("active");
  app.setAutoRotate(b.classList.contains("active"));
});
$("btn-hotspots").addEventListener("click", (e) => {
  const b = e.currentTarget as HTMLElement;
  b.classList.toggle("active");
  app.setHotspotsVisible(b.classList.contains("active"));
  if (!b.classList.contains("active")) hideHotspot();
});
$("btn-wire").addEventListener("click", (e) => {
  const b = e.currentTarget as HTMLElement;
  b.classList.toggle("active");
  app.setWireframe(b.classList.contains("active"));
});
$("btn-reset").addEventListener("click", () => app.resetCamera());
$("btn-collapse").addEventListener("click", () => panel.classList.toggle("collapsed"));
$("btn-tree").addEventListener("click", () => {
  renderTree($("tree"), current, (i) => {
    treeModal.hidden = true;
    goTo(i);
  });
  treeModal.hidden = false;
});
$("tree-close").addEventListener("click", () => (treeModal.hidden = true));
treeModal.addEventListener("click", (e) => {
  if (e.target === treeModal) treeModal.hidden = true;
});
$("btn-sources").addEventListener("click", () => (sourcesModal.hidden = false));
$("sources-close").addEventListener("click", () => (sourcesModal.hidden = true));
sourcesModal.addEventListener("click", (e) => {
  if (e.target === sourcesModal) sourcesModal.hidden = true;
});

// 键盘
window.addEventListener("keydown", (e) => {
  if ((e.target as HTMLElement)?.tagName === "INPUT") return;
  if (e.key === "ArrowRight" || e.key === "PageDown") {
    e.preventDefault();
    goTo(current + 1);
  } else if (e.key === "ArrowLeft" || e.key === "PageUp") {
    e.preventDefault();
    goTo(current - 1);
  } else if (e.key === " ") {
    e.preventDefault();
    setPlaying(!playing);
  } else if (e.key === "Escape") {
    treeModal.hidden = true;
    sourcesModal.hidden = true;
    hideHotspot();
  } else if (e.key === "Home") {
    goTo(0);
  } else if (e.key === "End") {
    goTo(stages.length - 1);
  }
});

// 提示淡出
window.setTimeout(() => $("hint").classList.add("fade"), 9000);
labelRoot.addEventListener("pointerdown", () => $("hint").classList.add("fade"), { once: true });

// ---------- 启动 ----------
const startId = location.hash.replace("#", "");
const startIndex = Math.max(0, stages.findIndex((s) => s.id === startId));
current = startIndex;
app.setStage(stages[startIndex], { animateCamera: false });
renderPanel(startIndex);
