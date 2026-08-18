"use client";

import { useEffect, useMemo, useState } from "react";

type Era = "全部" | "细胞世界" | "复杂生命" | "脱水登陆" | "人族演化";

const milestones = [
  { era: "细胞世界", time: "≥3.7 Ga", ago: "至少 37 亿年前", title: "早期生命的证据", tag: "高不确定性", text: "古老岩石中的同位素信号、微体化石与叠层石提示：简单细胞已经存在。它们不等于“第一个生命”，生命起源的时间与路径仍未定论。", note: "证据：地球化学·微体化石" },
  { era: "细胞世界", time: "≈3.5 Ga", ago: "约 35 亿年前", title: "细菌与古菌的深层分化", tag: "共同祖先", text: "所有现生细胞生命共用遗传密码、核糖体等核心系统，指向“最后普遍共同祖先”（LUCA）。LUCA 是一个祖先种群，不是地球第一个生命。", note: "证据：比较基因组·系统发育" },
  { era: "细胞世界", time: "≈2.7 Ga", ago: "至少 27 亿年前", title: "产氧光合作用演化", tag: "生态工程", text: "蓝细菌的祖先利用光能分解水并释放氧。最初的氧被海洋中还原性物质消耗，之后才开始在大气中累积。", note: "证据：叠层石·铁同位素" },
  { era: "细胞世界", time: "2.4–2.1 Ga", ago: "24–21 亿年前", title: "大氧化事件", tag: "行星转折", text: "大气中氧气持久上升，让许多厌氧生物衰退，也为高效的有氧呼吸创造条件。演化没有“进步”义务；环境改变只是重写适应度地形。", note: "证据：硫同位素·条带状铁建造" },
  { era: "细胞世界", time: "1.8–2.7 Ga", ago: "约 27–18 亿年前", title: "真核细胞：一场深度共生", tag: "内共生", text: "一个古菌谱系的宿主与α-变形菌建立内共生，后者成为线粒体。真核细胞的精确形成顺序仍在激烈研究中。", note: "证据：线粒体 DNA·分子系统树" },
  { era: "复杂生命", time: "≈1.0 Ga", ago: "约 10 亿年前", title: "多细胞性反复出现", tag: "多次独立", text: "细胞粘附、分工与通信在植物、真菌、动物及多个藻类谱系中独立演化。“多细胞”不是一次性发明。", note: "证据：化石·发育基因组" },
  { era: "复杂生命", time: "635–541 Ma", ago: "6.35–5.41 亿年前", title: "埃迪卡拉生物群", tag: "最早大型生命", text: "海床上出现了软体、叶状与分形形态的大型生物。其中哪些属于动物的干群仍存争议。", note: "证据：压印化石·生物标志物" },
  { era: "复杂生命", time: "≈541 Ma", ago: "约 5.41 亿年前", title: "寒武纪生态系统重组", tag: "快速辐射", text: "在地质尺度上的数千万年内，多个动物门的可识别身体构型出现，捕食、感觉与硬骨骼推动生态军备竞赛。它并非生命突然从无到有。", note: "证据：软躯体化石库·遗迹化石" },
  { era: "脱水登陆", time: "≈470 Ma", ago: "约 4.7 亿年前", title: "植物与真菌改造陆地", tag: "共生拓荒", text: "早期陆生植物与真菌互利共生，促进土壤形成与碳循环改变；节肢动物随后在新生态空间中多样化。", note: "证据：孢子化石·分子钟" },
  { era: "脱水登陆", time: "≈375 Ma", ago: "约 3.75 亿年前", title: "四足动物的水陆过渡", tag: "现有结构改造", text: "肉鳍鱼的鳍内骨骼、肺样器官与头颈结构在浅水环境中被逐步改造。登陆不是某条鱼的一次“决定”。", note: "证据：Tiktaalik 等过渡化石" },
  { era: "脱水登陆", time: "≈312 Ma", ago: "约 3.12 亿年前", title: "羊膜卵解锁干燥内陆", tag: "生殖创新", text: "包含羊膜等胚外膜的卵让脊椎动物生殖摆脱开放水体，羊膜动物随后分化为合弓类（通往哺乳类）与蜥形类（包含爬行类与鸟类）。", note: "证据：胚胎学·骨骼形态" },
  { era: "脱水登陆", time: "≈225 Ma", ago: "约 2.25 亿年前", title: "最早哺乳类", tag: "夜行小型化", text: "最早哺乳类与恐龙长期共存。毛发、泌乳、高代谢与中耳骨等特征在哺乳形类演化中逐步拼合。", note: "证据：牙齿·颚骨·软组织印痕" },
  { era: "人族演化", time: "≈66 Ma", ago: "约 6600 万年前", title: "大灭绝后，哺乳类辐射", tag: "机会与约束", text: "非鸟恐龙灭绝后，多个哺乳类支系进入空缺生态位。灵长类在随后数百万年出现，发展出抓握手、立体视觉与灵活行为。", note: "证据：化石序列·系统发育" },
  { era: "人族演化", time: "7–6 Ma", ago: "700–600 万年前", title: "人族与黑猩猩谱系分开", tag: "不是从黑猩猩变来", text: "人类与现生黑猩猩共享一个已灭绝的共同祖先种群。分化不是一个瞬间，而是可能伴随有限基因交流的种群过程。", note: "证据：分子钟·早期人族化石" },
  { era: "人族演化", time: "≥4.2 Ma", ago: "约 420 万年前起", title: "南方古猿：双足先于大脑", tag: "特征镶嵌", text: "骨盆、股骨和足迹证明稳定双足行走已出现，但脑容量仍接近类人猿。人类特征是在不同时间组合起来的。", note: "证据：Laetoli 足迹·骨盆化石" },
  { era: "人族演化", time: "≈2.8 Ma", ago: "约 280 万年前", title: "Homo 属出现", tag: "分支丛林", text: "最早的人属化石出现于非洲。随后 Homo erectus 等支系具有更现代的身体比例，并约在 180 万年前已走出非洲。", note: "证据：下颌化石·石器·古地磁" },
  { era: "人族演化", time: "≈300 ka", ago: "约 30 万年前", title: "Homo sapiens 在非洲演化", tag: "网络化起源", text: "智人的解剖特征可能在非洲多个相互联系的种群中逐步拼合，不必来自一个孤立地点的单一小群体。", note: "证据：Jebel Irhoud 化石·全基因组" },
  { era: "人族演化", time: "70–40 ka", ago: "7–4 万年前", title: "扩散、相遇与混血", tag: "网，不只是树", text: "智人群体扩散到非洲以外，与尼安德特人、丹尼索瓦人等古人类谱系相遇并发生基因交流。它们不是通往我们的“失败台阶”。", note: "证据：古 DNA·考古遗址" },
  { era: "人族演化", time: "≈12 ka", ago: "约 1.2 万年前", title: "文化进入快速反馈回路", tag: "基因—文化共演化", text: "农业在多地独立出现，改变人口、疾病与食物结构，并对乳糖耐受、免疫等遗传变异产生新选择压力。人类仍在演化。", note: "证据：古 DNA·同位素·考古学" },
] as const;

const branches = [
  { name: "南方古猿类", range: "420–200 万年前", status: "多个并存支系", x: 8, w: 29, y: 18 },
  { name: "傍人类", range: "270–120 万年前", status: "灭绝的专门化旁支", x: 20, w: 20, y: 40 },
  { name: "早期 Homo", range: "280–150 万年前", status: "分类仍有争议", x: 31, w: 28, y: 62 },
  { name: "H. erectus 广义群", range: "190–11 万年前", status: "首次广泛走出非洲", x: 49, w: 37, y: 28 },
  { name: "尼安德特人", range: "40–4 万年前", status: "与智人有基因交流", x: 72, w: 18, y: 50 },
  { name: "Homo sapiens", range: "30 万年前—现在", status: "今天唯一存活人类", x: 76, w: 24, y: 72 },
] as const;

const mechanisms = [
  ["变异与重组", "制造可遗传差异，不预知环境需要。"],
  ["自然选择", "影响繁殖成功的变异，在种群中频率改变。"],
  ["遗传漂变", "有限种群中的随机抽样，也能大幅改变基因频率。"],
  ["基因流", "个体迁移与杂交让遗传变异在种群间移动。"],
  ["约束与偶然", "历史路径、发育结构与大灭绝限制了演化可走的路。"],
  ["共生与水平转移", "线粒体、叶绿体与微生物基因交换让生命史也呈网状。"],
] as const;

export default function Home() {
  const [era, setEra] = useState<Era>("全部");
  const [active, setActive] = useState(0);
  const [progress, setProgress] = useState(0);
  const eras: Era[] = ["全部", "细胞世界", "复杂生命", "脱水登陆", "人族演化"];
  const filtered = useMemo(() => era === "全部" ? milestones : milestones.filter(m => m.era === era), [era]);

  useEffect(() => {
    const onScroll = () => {
      const max = document.documentElement.scrollHeight - innerHeight;
      setProgress(max > 0 ? scrollY / max : 0);
    };
    onScroll(); window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => setActive(0), [era]);

  return (
    <main>
      <div className="read-progress" style={{ transform: `scaleX(${progress})` }} />
      <section className="hero" id="top">
        <nav>
          <a className="brand" href="#top">生命长河</a>
          <div className="navlinks"><a href="#timeline">深时间</a><a href="#humans">人族丛林</a><a href="#mechanism">演化机制</a></div>
          <span className="edition">SCIENCE EDITION · 2026</span>
        </nav>
        <div className="hero-copy">
          <p className="eyebrow">3,800,000,000 YEARS · ONE UNBROKEN LINEAGE</p>
          <h1>从一枚细胞<br />到会追问来处的人</h1>
          <p className="dek">这不是一架通往人类的梯子，而是一棵枝繁叶茂、绝大多数枝条已消失的生命之树。</p>
          <a className="primary" href="#timeline">开始 38 亿年的旅程 <span>↘</span></a>
        </div>
        <div className="cell-orbit" aria-hidden="true"><i></i><i></i><i></i><b></b></div>
        <div className="hero-scale"><span>地球形成</span><i></i><span>今天</span></div>
      </section>

      <section className="premise section-pad">
        <p className="chapter">00 · 阅读这棵树</p>
        <div className="premise-grid"><h2>演化没有剧本。<br /><em>只有分叉、筛选与幸存。</em></h2><div><p>现代演化理论是一个可检验的科学框架：种群中可遗传的变异，在自然选择、遗传漂变、基因流等作用下世代累积。</p><p>它纳入了达尔文的自然选择、孟德尔遗传学、种群遗传学、中性演化、发育生物学、基因组学与内共生。科学界会争论时间、分支和机制的细节，但共同祖先与种群演化的核心证据极为坚实。</p></div></div>
        <div className="truth-strip"><span>✕ 不是个体在一生中进化</span><span>✕ 不是向着更高级前进</span><span>✕ 人类不是预定终点</span></div>
      </section>

      <section className="timeline-section section-pad" id="timeline">
        <div className="section-head"><div><p className="chapter">01 · DEEP TIME</p><h2>把 38 亿年<br />装进一条时间轴</h2></div><p className="section-intro">点选时代，再选中一个节点。“Ga”表示十亿年前，“Ma”表示百万年前，“ka”表示千年前。</p></div>
        <div className="era-tabs" role="tablist" aria-label="按演化阶段筛选">
          {eras.map(e => <button role="tab" aria-selected={era === e} key={e} onClick={() => setEra(e)}>{e}<small>{e === "全部" ? milestones.length : milestones.filter(m => m.era === e).length}</small></button>)}
        </div>
        <div className="explorer">
          <div className="event-list" role="tablist" aria-label="演化节点">
            {filtered.map((m, i) => <button role="tab" aria-selected={active === i} key={m.title} onClick={() => setActive(i)}><span>{m.time}</span><b>{m.title}</b><i>→</i></button>)}
          </div>
          <article className="event-detail" aria-live="polite">
            <div className="event-visual" aria-hidden="true"><div className={`organism organism-${active % 4}`}><i></i><i></i><b></b></div><span>{String(active + 1).padStart(2,"0")}</span></div>
            <div className="event-copy"><span className="confidence">{filtered[active]?.tag}</span><p className="event-time">{filtered[active]?.ago}</p><h3>{filtered[active]?.title}</h3><p>{filtered[active]?.text}</p><footer>{filtered[active]?.note}</footer></div>
          </article>
        </div>
        <p className="scale-note"><b>深时间提示</b> 如果把地球 45.4 亿年压缩成 24 小时，智人大约在最后 6 秒才出现，农业则只占最后约 0.23 秒。</p>
      </section>

      <section className="humans section-pad" id="humans">
        <div className="section-head"><div><p className="chapter">02 · THE HUMAN THICKET</p><h2>不是队列，<br />是一片灌木丛</h2></div><p className="section-intro">过去 700 万年中，多种人族常常同时存在。这个简化图只表示时间重叠，不声称已解决每一条直接祖先关系。</p></div>
        <div className="branch-chart">
          <div className="chart-axis"><span>700 万年前</span><span>500 万</span><span>300 万</span><span>100 万</span><span>现在</span></div>
          <div className="branch-field">
            <div className="grid-lines" aria-hidden="true"><i></i><i></i><i></i><i></i></div>
            {branches.map(b => <div className="branch" key={b.name} style={{ left:`${b.x}%`, width:`${b.w}%`, top:`${b.y}%` }}><b>{b.name}</b><span>{b.range}</span><small>{b.status}</small></div>)}
            <svg viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true"><path d="M5,26 C25,26 20,70 40,70 S50,36 68,36 S72,80 99,80"/><path d="M28,26 C35,26 35,48 46,48"/><path d="M65,36 C75,36 70,58 83,58"/></svg>
          </div>
        </div>
        <div className="dna-callout"><span>DNA 改写了家谱</span><p>多数非洲以外现代人群的基因组中含有尼安德特人祖源成分；丹尼索瓦人祖源在大洋洲及部分亚洲人群中更显著。这说明人类演化同时具有分支和再次汇合。</p></div>
      </section>

      <section className="mechanism section-pad" id="mechanism">
        <div className="section-head"><div><p className="chapter">03 · HOW EVOLUTION WORKS</p><h2>不只是<br />“适者生存”</h2></div><p className="section-intro">适应度不是力量或聪明程度，而是在特定环境中把基因传向后代的相对成功率。</p></div>
        <div className="mechanism-grid">{mechanisms.map((m,i) => <article key={m[0]}><span>{String(i+1).padStart(2,"0")}</span><h3>{m[0]}</h3><p>{m[1]}</p></article>)}</div>
      </section>

      <section className="evidence section-pad">
        <p className="chapter">04 · EVIDENCE, NOT A LADDER</p><h2>我们怎么知道？</h2>
        <div className="evidence-row"><div><b>01</b><h3>化石与地层</h3><p>解剖变化、过渡形态与出现顺序。</p></div><div><b>02</b><h3>年代测定</h3><p>放射性同位素为岩层和化石提供时间标尺。</p></div><div><b>03</b><h3>基因组</h3><p>DNA 序列保留共同祖先、分支与混血的痕迹。</p></div><div><b>04</b><h3>现场观察</h3><p>抗药性、病毒与野外种群让演化在当下可观测。</p></div></div>
      </section>

      <section className="sources section-pad">
        <div><p className="chapter">SOURCES & SCOPE</p><h2>科学是一张<br />不断更新的地图</h2></div>
        <div className="source-copy"><p>页面时间为当前证据支持的约数或范围，并对起源生命、真核细胞形成、早期人族分类等存在争议的问题保留不确定性。主要参考：</p>
          <a href="https://humanorigins.si.edu/education/introduction-human-evolution" target="_blank" rel="noreferrer">史密森学会·人类起源计划 <span>↗</span></a>
          <a href="https://astrobiology.nasa.gov/education/alp/first-cells-arise/" target="_blank" rel="noreferrer">NASA Astrobiology·早期细胞与大氧化 <span>↗</span></a>
          <a href="https://www.nature.com/articles/s41586-024-07677-6" target="_blank" rel="noreferrer">Nature·真核细胞起源综述 <span>↗</span></a>
          <a href="https://www.nhm.ac.uk/discover/origin-of-life-on-earth.html" target="_blank" rel="noreferrer">英国自然历史博物馆·生命史 <span>↗</span></a>
          <a href="https://www.nature.com/articles/s41576-023-00643-4" target="_blank" rel="noreferrer">Nature Reviews Genetics·丹尼索瓦人 <span>↗</span></a>
        </div>
      </section>

      <footer className="site-footer"><a href="#top" className="brand">生命长河</a><p>你不是演化的终点。<br />你是 38 亿年未曾中断的延续。</p><a href="#top" className="back-top">回到起点 ↑</a></footer>
    </main>
  );
}
