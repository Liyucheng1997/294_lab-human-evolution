import { stages } from "./data/stages";

interface Branch {
  label: string;
  /** 已灭绝 */
  extinct?: boolean;
  side: "L" | "R";
}

/** 每一站在生命之树上分出去的“亲戚” */
const branches: Record<string, { note?: string; event?: boolean; list: Branch[] }> = {
  prokaryote: { list: [{ label: "细菌（含蓝细菌）", side: "L" }, { label: "其他古菌", side: "R" }] },
  cyanobacteria: {
    event: true,
    note: "事件节点：蓝细菌属于细菌一支，并非我们的直系祖先，但它改写了大气",
    list: [{ label: "蓝细菌 → 后来的叶绿体", side: "L" }],
  },
  eukaryote: { list: [{ label: "植物与藻类", side: "L" }, { label: "真菌", side: "R" }, { label: "变形虫等原生生物", side: "L" }] },
  ediacaran: {
    note: "狄更逊水母是早期动物的代表，未必是直系祖先",
    list: [{ label: "海绵", side: "L" }, { label: "刺胞动物（水母、珊瑚）", side: "R" }, { label: "原口动物（昆虫、软体动物、蠕虫）", side: "L" }, { label: "棘皮动物（海星）", side: "R" }],
  },
  chordate: { list: [{ label: "海鞘", side: "L" }, { label: "文昌鱼", side: "R" }, { label: "无颌类（七鳃鳗、盲鳗）", side: "L" }] },
  jawed: { list: [{ label: "盾皮鱼", extinct: true, side: "R" }, { label: "软骨鱼（鲨、鳐）", side: "L" }, { label: "辐鳍鱼（大多数现代鱼）", side: "R" }] },
  tetrapod: { list: [{ label: "腔棘鱼", side: "L" }, { label: "肺鱼", side: "R" }, { label: "两栖类（蛙、蝾螈）", side: "L" }] },
  amniote: { list: [{ label: "蜥形纲：爬行类、恐龙、鸟类", side: "R" }, { label: "早期合弓类（异齿龙等）", extinct: true, side: "L" }] },
  mammal: { list: [{ label: "单孔类（鸭嘴兽）", side: "L" }, { label: "有袋类", side: "R" }, { label: "多瘤齿兽", extinct: true, side: "L" }] },
  primate: { list: [{ label: "原猴（狐猴）", side: "L" }, { label: "眼镜猴", side: "R" }, { label: "新大陆猴 · 旧大陆猴", side: "L" }, { label: "长臂猿 · 猩猩 · 大猩猩", side: "R" }] },
  ardipithecus: {
    note: "更早的人族：乍得沙赫人（700 万年）、图根原人（600 万年）",
    list: [{ label: "黑猩猩 · 倭黑猩猩（约 700 万年前分离）", side: "L" }],
  },
  australopithecus: { list: [{ label: "傍人（粗壮型南猿）", extinct: true, side: "R" }, { label: "其他南方古猿种", extinct: true, side: "L" }] },
  habilis: { list: [{ label: "鲁道夫人", extinct: true, side: "R" }] },
  erectus: {
    list: [
      { label: "海德堡人 → 尼安德特人 · 丹尼索瓦人", extinct: true, side: "L" },
      { label: "弗洛勒斯人 · 纳莱迪人", extinct: true, side: "R" },
    ],
  },
  sapiens: { list: [{ label: "尼安德特人（与我们混血 1–2%）", extinct: true, side: "R" }, { label: "丹尼索瓦人", extinct: true, side: "L" }] },
};

export function renderTree(container: HTMLElement, current: number, onSelect: (i: number) => void) {
  const W = 960;
  const rowH = 78;
  const top = 40;
  const H = top + rowH * stages.length + 30;
  const cx = W / 2;
  const svgNS = "http://www.w3.org/2000/svg";
  const svg = document.createElementNS(svgNS, "svg");
  svg.setAttribute("viewBox", `0 0 ${W} ${H}`);
  svg.setAttribute("role", "img");
  svg.setAttribute("aria-label", "谱系树");

  const el = (name: string, attrs: Record<string, string | number>, text?: string) => {
    const e = document.createElementNS(svgNS, name);
    for (const k in attrs) e.setAttribute(k, String(attrs[k]));
    if (text !== undefined) e.textContent = text;
    return e;
  };

  // 主干
  const trunk = el("line", { x1: cx, y1: top, x2: cx, y2: top + rowH * (stages.length - 1), stroke: "rgba(243,237,228,0.35)", "stroke-width": 3 });
  svg.appendChild(trunk);
  // 已走过的主干高亮
  const done = el("line", { x1: cx, y1: top, x2: cx, y2: top + rowH * current, stroke: "var(--accent)", "stroke-width": 3 });
  svg.appendChild(done);

  stages.forEach((s, i) => {
    const y = top + rowH * i;
    const b = branches[s.id];
    // 侧枝
    b?.list.forEach((br, k) => {
      const dir = br.side === "L" ? -1 : 1;
      const len = 150 + (k % 2) * 40;
      const ex = cx + dir * len;
      const ey = y + 18 + k * 12;
      const path = el("path", {
        d: `M ${cx} ${y} C ${cx + dir * 40} ${y}, ${ex - dir * 40} ${ey}, ${ex} ${ey}`,
        fill: "none",
        stroke: br.extinct ? "rgba(243,237,228,0.22)" : "rgba(243,237,228,0.4)",
        "stroke-width": 1.5,
        "stroke-dasharray": br.extinct ? "4 4" : "",
      });
      svg.appendChild(path);
      svg.appendChild(el("circle", { cx: ex, cy: ey, r: 3, fill: br.extinct ? "rgba(243,237,228,0.3)" : "rgba(243,237,228,0.6)" }));
      const t = el("text", { x: ex + dir * 8, y: ey + 4, "text-anchor": dir < 0 ? "end" : "start", fill: br.extinct ? "rgba(243,237,228,0.5)" : "rgba(243,237,228,0.78)", "font-size": 12 }, (br.extinct ? "† " : "") + br.label);
      svg.appendChild(t);
    });
    // 节点
    const gN = el("g", { class: "tree-node" });
    gN.addEventListener("click", () => onSelect(i));
    const isCur = i === current;
    const isEvent = b?.event;
    gN.appendChild(
      el("circle", {
        cx,
        cy: y,
        r: isCur ? 11 : 8,
        fill: isEvent ? "rgba(24,20,17,1)" : i <= current ? "var(--accent)" : "#6f665c",
        stroke: isCur || isEvent ? "var(--accent)" : "rgba(24,20,17,1)",
        "stroke-width": isEvent ? 2.5 : 3,
      }),
    );
    gN.appendChild(el("text", { x: cx, y: y - 16, "text-anchor": "middle", fill: isCur ? "var(--accent)" : "rgba(243,237,228,0.9)", "font-size": isCur ? 15 : 13.5, "font-weight": 600 }, `${String(i + 1).padStart(2, "0")} ${s.name} · ${s.organism}`));
    gN.appendChild(el("text", { x: cx, y: y + 32 + (b?.list.length ?? 0) * 0, "text-anchor": "middle", fill: "rgba(243,237,228,0.5)", "font-size": 11 }, s.yearsLabel));
    if (b?.note) {
      gN.appendChild(el("text", { x: cx, y: y + 46, "text-anchor": "middle", fill: "rgba(243,237,228,0.42)", "font-size": 10.5, "font-style": "italic" }, b.note));
    }
    svg.appendChild(gN);
  });

  container.innerHTML = "";
  container.appendChild(svg);
}
