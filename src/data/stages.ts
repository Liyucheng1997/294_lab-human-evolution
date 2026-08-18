/**
 * 人类演化 15 站：从最早的原核细胞到智人。
 * 年代取学界常见的代表值；同一事件在文献里往往有几千万年的浮动，
 * 页面上统一用“约”表达。
 */

export type EnvKind =
  | "micro" // 微观：显微镜下的水体
  | "ocean" // 开阔浅海
  | "seafloor" // 海底与微生物席
  | "shore" // 浅水河口 / 泥岸
  | "swamp" // 石炭纪煤炭森林
  | "night" // 三叠纪夜晚林地
  | "canopy" // 热带雨林树冠
  | "woodland" // 疏林
  | "savanna" // 稀树草原
  | "cave"; // 旧石器时代营地

export type Chapter = "微观生命" | "海洋时代" | "登上陆地" | "哺乳与灵长" | "人族";

export interface Hotspot {
  /** 相对模型原点的位置 */
  position: [number, number, number];
  label: string;
  detail: string;
}

export interface Metric {
  label: string;
  value: string;
}

export interface Stage {
  id: string;
  chapter: Chapter;
  /** 阶段名 */
  name: string;
  /** 代表生物 */
  organism: string;
  latin: string;
  /** 距今年数 */
  yearsAgo: number;
  yearsLabel: string;
  era: string;
  habitat: string;
  size: string;
  /** 一句话概括这一步演化的关键创新 */
  innovation: string;
  summary: string;
  points: string[];
  evidence: string;
  /** 这一站留在今天人体里的痕迹 */
  legacy: string;
  metrics: Metric[];
  env: EnvKind;
  accent: string;
  hotspots: Hotspot[];
  /** 人族阶段的脑容量 (cc)，用于对比图 */
  brainCc?: number;
  heightCm?: number;
}

export const stages: Stage[] = [
  {
    id: "prokaryote",
    chapter: "微观生命",
    name: "早期细胞",
    organism: "早期原核生命概念模型",
    latin: "Early cellular life · LUCA concept",
    yearsAgo: 3.8e9,
    yearsLabel: "约 38 亿年前",
    era: "冥古宙末 – 太古宙早期",
    habitat: "深海热液喷口 / 温暖浅海",
    size: "1 – 2 μm",
    innovation: "可遗传的信息、代谢网络与细胞边界被结合在一起。",
    summary:
      "37–35 亿年前的碳同位素、叠层石与微体化石提示，当时已存在简单细胞生命。这些证据不等于“第一个细胞”；生命起源的时间、地点和途径仍未定论。比较基因组学显示，今天所有细胞生命共享一个被称为 LUCA 的祖先种群；LUCA 并不是地球上的第一个生命。",
    points: [
      "近乎普遍的遗传密码、核糖体和 ATP 供能系统，是共同祖先的强证据。",
      "核糖体、ATP 供能、DNA→RNA→蛋白质的流程，都在这一站定型。",
      "早期大气几乎没有游离氧；无氧代谢与化能营养是候选的早期生存方式。",
      "生命起源的确切地点仍有争论：热液喷口、陆地温泉池都是候选。",
    ],
    evidence:
      "西澳大利亚 Pilbara 34.8 亿年前叠层石；Strelley Pool 34.3 亿年前微体化石；格陵兰 Isua 岩系中的碳同位素信号（37 亿年）。",
    legacy: "你身体的每个细胞仍在用 38 亿年前定下的那套遗传密码和 ATP 能量货币。",
    metrics: [
      { label: "尺度", value: "1–2 μm" },
      { label: "细胞核", value: "无（拟核）" },
      { label: "能量来源", value: "化学能" },
    ],
    env: "micro",
    accent: "#8be36a",
    hotspots: [
      { position: [0, 0.05, 0.6], label: "拟核", detail: "环状 DNA 直接漂在细胞质中，没有核膜包裹。" },
      { position: [-2.4, 0.3, 0], label: "鞭毛概念结构", detail: "现生细菌的鞭毛由蛋白质马达驱动旋转；最早细胞是否已具有它并不确定。" },
      { position: [0.9, -0.55, 0.7], label: "细胞膜与细胞壁", detail: "脂双层膜隔开内外环境，是“生命体”的边界。" },
    ],
  },
  {
    id: "cyanobacteria",
    chapter: "微观生命",
    name: "大氧化事件",
    organism: "蓝细菌",
    latin: "Cyanobacteria",
    yearsAgo: 2.4e9,
    yearsLabel: "约 24 亿年前",
    era: "古元古代 · 成铁纪",
    habitat: "阳光充足的浅海与潮间带",
    size: "单个细胞 3 – 10 μm，丝状体可达毫米级",
    innovation: "产氧光合作用：用阳光把水劈开，把氧气当废物排进大气。",
    summary:
      "蓝细菌学会了用阳光分解水分子获取电子，副产品是氧气。经过几亿年的积累，氧气先氧化了海水里的铁，形成全球的条带状铁建造，随后溢入大气。这场“大氧化事件”是地球史上最大的一次环境污染，也为后来高耗能的复杂生命铺平了道路。",
    points: [
      "氧气对当时的厌氧生物是剧毒，大量物种灭绝或退缩到无氧角落。",
      "臭氧层随之形成，紫外线被挡住，生命才有可能走向陆地。",
      "叠层石就是蓝细菌席一层层裹住沉积物形成的，是最常见的早期生命证据。",
      "后来所有植物的叶绿体，都是被真核细胞吞下的蓝细菌后代。",
    ],
    evidence:
      "全球条带状铁建造（BIF）在 24 亿年前后达到峰值；硫同位素非质量分馏信号在 23–24 亿年前消失，标志大气中出现氧气。",
    legacy: "你每一次呼吸吸入的氧气，源头都是蓝细菌及其后代（叶绿体）的光合作用。",
    metrics: [
      { label: "尺度", value: "3–10 μm" },
      { label: "大气氧含量", value: "0 → ~1%" },
      { label: "能量来源", value: "阳光" },
    ],
    env: "micro",
    accent: "#4fd1c5",
    hotspots: [
      { position: [0, 0.75, 0.2], label: "类囊体膜", detail: "光合作用发生的膜结构，后来被植物的叶绿体继承。" },
      { position: [-2.2, 0.2, 0.4], label: "异形胞", detail: "部分蓝细菌能分化出固氮的特殊细胞——多细胞分工的雏形。" },
      { position: [1.6, 1.4, 0], label: "氧气泡", detail: "光合作用释放的氧气。数亿年后大气中才积累到可观浓度。" },
    ],
  },
  {
    id: "eukaryote",
    chapter: "微观生命",
    name: "真核细胞",
    organism: "最早的真核生物",
    latin: "Eukaryota",
    yearsAgo: 1.8e9,
    yearsLabel: "约 18 亿年前",
    era: "古元古代 · 固结纪",
    habitat: "含氧的浅海",
    size: "10 – 100 μm",
    innovation: "一个古菌吞下一个细菌却没有消化它，后者变成了线粒体——细胞有了发电厂。",
    summary:
      "真核细胞把 DNA 装进细胞核，把产能外包给内共生的线粒体，用细胞骨架把体积撑大成千上万倍。有了充足的能量预算，基因组可以变得庞大，细胞可以分化出各种细胞器。这是通往一切复杂生命的门槛。",
    points: [
      "2015 年发现的阿斯加德古菌，是与真核生物关系最近的现生原核生物。",
      "线粒体至今保留着自己的环状 DNA（人类中含 37 个基因）和细菌式的双层膜。",
      "有性生殖（减数分裂与基因重组）大约也在这一时期出现。",
      "多数早期真核化石是几十微米的疑源类和藻类，最古老的可靠记录约 16–18 亿年。",
    ],
    evidence:
      "华北长城系（约 16.5 亿年）中的大型真核化石；北美 Negaunee 铁建造中的 Grypania（约 18.7 亿年，归属有争议）；甾烷生物标志物。",
    legacy: "你的线粒体 DNA 只从母亲那里继承，是追溯母系祖先的分子时钟。",
    metrics: [
      { label: "尺度", value: "10–100 μm" },
      { label: "线粒体 DNA", value: "37 个基因" },
      { label: "体积 vs 原核", value: "×1000+" },
    ],
    env: "micro",
    accent: "#63b3ff",
    hotspots: [
      { position: [-0.4, 0.3, 1.1], label: "细胞核", detail: "双层核膜把 DNA 与细胞质隔开，转录与翻译得以分步进行。" },
      { position: [1.35, 0.6, 0.6], label: "线粒体", detail: "内共生细菌的后代，负责有氧呼吸产生 ATP。" },
      { position: [0.9, -1.1, 0.5], label: "内质网 / 高尔基体", detail: "内膜系统负责蛋白质加工与运输。" },
    ],
  },
  {
    id: "ediacaran",
    chapter: "海洋时代",
    name: "多细胞动物",
    organism: "狄更逊水母",
    latin: "Dickinsonia",
    yearsAgo: 5.6e8,
    yearsLabel: "约 5.6 亿年前",
    era: "新元古代 · 埃迪卡拉纪",
    habitat: "浅海海底的微生物席上",
    size: "常见几厘米，最大可达 1.4 m",
    innovation: "细胞组成有前后、有分工的身体——动物出现了。",
    summary:
      "在埃迪卡拉纪的海底，出现了一批柔软、扁平、没有嘴和消化道的奇怪生物。狄更逊水母是其中的明星：椭圆形身体由许多“肋”排列而成，可能靠腹面吸收微生物席上的养分。2018 年在其化石中检出胆固醇分子，证实它是动物而不是巨型单细胞或地衣。",
    points: [
      "动物起源可能更早（约 7–8 亿年，海绵类），但可靠的宏体化石从埃迪卡拉纪开始。",
      "多细胞需要细胞间黏附分子（如钙黏蛋白）与信号通路，这些基因今天仍在你体内工作。",
      "中国瓮安生物群（约 6.1 亿年）保存了疑似动物胚胎的细胞分裂过程。",
      "埃迪卡拉生物大多在寒武纪前消失，是否为现代动物门类的直系祖先仍在争论。",
    ],
    evidence:
      "澳大利亚 Ediacara 山、俄罗斯白海沿岸的印痕化石；中国安徽蓝田生物群、贵州瓮安生物群。",
    legacy: "你体内 200 多种细胞能黏在一起、彼此通讯，靠的就是这一站定型的分子工具箱。",
    metrics: [
      { label: "尺度", value: "1 cm – 1.4 m" },
      { label: "身体对称", value: "两侧滑移对称" },
      { label: "消化道", value: "无" },
    ],
    env: "seafloor",
    accent: "#e6b566",
    hotspots: [
      { position: [0, 0.35, 0], label: "中轴", detail: "身体沿中轴分成左右两列“肋”，两侧略微错开——一种早期的对称方式。" },
      { position: [-1.9, 0.3, 0.6], label: "分节的“肋”", detail: "新的节段从后端不断加入，说明它是持续生长的。" },
      { position: [1.5, -0.1, 0.9], label: "微生物席", detail: "狄更逊水母可能趴在席上“吸食”，化石旁常留下它移动过的痕迹。" },
    ],
  },
  {
    id: "chordate",
    chapter: "海洋时代",
    name: "最早的脊椎动物",
    organism: "昆明鱼",
    latin: "Myllokunmingia fengjiaoa",
    yearsAgo: 5.18e8,
    yearsLabel: "约 5.18 亿年前",
    era: "古生代 · 寒武纪早期",
    habitat: "温暖的陆缘浅海",
    size: "约 2.8 cm",
    innovation: "一根脊索撑起身体，头部集中了感官——脊椎动物的基本蓝图诞生。",
    summary:
      "寒武纪大爆发在几千万年里“一口气”产生了几乎所有现代动物门类。云南澄江生物群里的昆明鱼和海口鱼是已知最早的脊椎动物：有明确的头、成对眼睛、鳃囊、V 形肌节和一根纵贯全身的脊索，可能已经有了软骨质的原始脊椎。",
    points: [
      "澄江生物群 1984 年由侯先光发现，是理解寒武纪大爆发最重要的化石库之一。",
      "脊索是脊柱的前身；文昌鱼至今仍保留着这一原始形态。",
      "成对的眼睛、鼻和耳的前身在头部集中，是“头化”（cephalization）的开端。",
      "同一时期的皮卡虫（加拿大布尔吉斯页岩）也是早期脊索动物的代表。",
    ],
    evidence:
      "云南澄江帽天山页岩中的软躯体化石（昆明鱼、海口鱼、钟健鱼）；加拿大布尔吉斯页岩皮卡虫。",
    legacy: "你的脊柱、颅骨、成对的眼睛与分节的躯干肌，都是从这里开始的。",
    metrics: [
      { label: "体长", value: "~2.8 cm" },
      { label: "脊索", value: "有" },
      { label: "颌", value: "无" },
    ],
    env: "ocean",
    accent: "#f0a35e",
    hotspots: [
      { position: [0.2, 0.55, 0.3], label: "脊索", detail: "弹性的纵向支撑杆，肌肉靠它发力摆动身体。" },
      { position: [-2.3, 0.4, 0.4], label: "头部与眼睛", detail: "成对眼睛与鳃囊集中在前端，是最早的“头”。" },
      { position: [0.9, -0.15, 0.55], label: "V 形肌节", detail: "分节的肌肉块，今天鱼肉上一层层的纹理就是它。" },
    ],
  },
  {
    id: "jawed",
    chapter: "海洋时代",
    name: "长出下巴",
    organism: "初始全颌鱼",
    latin: "Entelognathus primordialis",
    yearsAgo: 4.19e8,
    yearsLabel: "约 4.19 亿年前",
    era: "古生代 · 志留纪晚期",
    habitat: "近岸浅海",
    size: "约 20 cm",
    innovation: "鳃弓变成了上下颌——从被动过滤到主动捕食。",
    summary:
      "颌是脊椎动物历史上最重要的发明之一。它由最前面的一对鳃弓演化而来，让鱼类可以咬、撕、嚼。2013 年在云南曲靖发现的全颌鱼，是最早拥有硬骨鱼式面部骨骼（前上颌骨、上颌骨、齿骨）的鱼，把盾皮鱼与硬骨鱼连了起来——包括人类在内的所有有颌脊椎动物的面孔，都能在它身上找到原型。",
    points: [
      "有颌类还演化出成对的胸鳍和腹鳍，为四肢奠定基础。",
      "泥盆纪的邓氏鱼体长可达 8–10 m，是当时海洋的顶级掠食者。",
      "颌与牙齿的出现推动了捕食者与猎物之间的“军备竞赛”。",
      "适应性免疫系统（抗体、T 细胞）也大约在有颌类中出现。",
    ],
    evidence:
      "云南曲靖潇湘动物群（全颌鱼、麒麟鱼、梦幻鬼鱼）；全球志留纪–泥盆纪盾皮鱼与棘鱼化石。",
    legacy: "你的上颌骨、下颌骨、面部的基本骨骼布局，以及免疫系统里的抗体，都源自这里。",
    metrics: [
      { label: "体长", value: "~20 cm" },
      { label: "颌", value: "有" },
      { label: "成对附肢", value: "胸鳍 + 腹鳍" },
    ],
    env: "ocean",
    accent: "#8fb8ff",
    hotspots: [
      { position: [-2.4, -0.2, 0.55], label: "上下颌", detail: "由第一对鳃弓演化而来，全颌鱼已经有硬骨鱼式的颌骨。" },
      { position: [-1.5, 0.75, 0.3], label: "头甲", detail: "盾皮鱼类特有的骨质护甲，覆盖头部和躯干前部。" },
      { position: [-0.6, -0.9, 0.5], label: "成对胸鳍", detail: "成对附肢的雏形——它们的内骨骼后来变成了四肢。" },
    ],
  },
  {
    id: "tetrapod",
    chapter: "登上陆地",
    name: "登陆",
    organism: "提塔利克鱼",
    latin: "Tiktaalik roseae",
    yearsAgo: 3.75e8,
    yearsLabel: "约 3.75 亿年前",
    era: "古生代 · 泥盆纪晚期",
    habitat: "热带河口的浅水与泥滩",
    size: "1.2 – 2.7 m",
    innovation: "鳍里长出了肩、肘、腕——鱼开始用鳍撑起身体。",
    summary:
      "提塔利克鱼是“鱼”与“四足动物”之间的教科书式过渡：它有鳞片、鳍条和鳃，同时又有可以转动的脖子、加固的肋骨、原始的肺，鳍的内部有肱骨、桡骨、尺骨和腕骨。它可能像今天的弹涂鱼一样，在浅水中用鳍撑起前身、探出头呼吸。",
    points: [
      "2004 年由 Neil Shubin 团队在加拿大埃尔斯米尔岛按预测的地层年代找到，是“预言式”发现的范例。",
      "稍晚的棘螈（Acanthostega，3.65 亿年）已有明确的指头——每只有 8 根。",
      "登陆不是一次跳跃，而是在浅水边缘经历几千万年的渐变。",
      "四肢的“一根骨—两根骨—许多小骨—指头”模式，被所有陆生脊椎动物继承。",
    ],
    evidence:
      "加拿大努纳武特埃尔斯米尔岛的提塔利克鱼化石；格陵兰的棘螈与鱼石螈；波兰 3.95 亿年前的四足动物足迹。",
    legacy: "你的上臂一根骨、前臂两根骨、腕部一堆小骨、五根手指——这个方案在这里定型。",
    metrics: [
      { label: "体长", value: "1.2–2.7 m" },
      { label: "颈部", value: "可活动" },
      { label: "呼吸", value: "鳃 + 原始肺" },
    ],
    env: "shore",
    accent: "#b6c95a",
    hotspots: [
      { position: [-2.7, 0.55, 0.3], label: "扁平头部与颈", detail: "眼睛长在头顶，颈部可以独立于躯干转动——鱼类没有脖子。" },
      { position: [-1.4, -0.35, 0.95], label: "鳍肢", detail: "鳍内已有肱骨、桡骨、尺骨与腕骨，可以撑起身体。" },
      { position: [0.3, 0.6, 0.6], label: "肋骨", detail: "加粗的肋骨用于在没有水的浮力时支撑内脏。" },
    ],
  },
  {
    id: "amniote",
    chapter: "登上陆地",
    name: "羊膜卵",
    organism: "林蜥",
    latin: "Hylonomus lyelli",
    yearsAgo: 3.12e8,
    yearsLabel: "约 3.12 亿年前",
    era: "古生代 · 石炭纪晚期",
    habitat: "赤道附近的煤炭沼泽森林",
    size: "约 20 cm",
    innovation: "把“池塘”装进蛋壳里——繁殖终于摆脱了水。",
    summary:
      "两栖类必须回到水里产卵。羊膜卵用羊膜、绒毛膜、尿囊三层胚膜和一个防水的壳，为胚胎自带水环境、气体交换和废物储存，让脊椎动物第一次真正征服内陆。林蜥是已知最早的羊膜动物之一，长得像今天的蜥蜴，在石炭纪的鳞木森林里捕食昆虫。",
    points: [
      "羊膜动物很快分成两支：合弓纲（通向哺乳类）和蜥形纲（通向爬行类、恐龙和鸟类）。",
      "石炭纪大气含氧量高达 30% 以上，出现了翼展 70 cm 的巨型蜻蜓。",
      "防水的角质皮肤与更高效的肺同时演化，减少了对潮湿环境的依赖。",
      "石炭纪的煤炭森林被埋藏后，成为今天燃烧的煤。",
    ],
    evidence:
      "加拿大新斯科舍 Joggins 化石崖中保存在树桩内的林蜥骨骼；全球石炭纪合弓类与蜥形类化石。",
    legacy: "你在子宫里被羊膜囊和羊水包裹；胎盘由绒毛膜和尿囊发育而来——都是羊膜卵的遗产。",
    metrics: [
      { label: "体长", value: "~20 cm" },
      { label: "繁殖", value: "陆地产卵" },
      { label: "皮肤", value: "角质防水" },
    ],
    env: "swamp",
    accent: "#9dd06d",
    hotspots: [
      { position: [1.9, 0.5, 0.6], label: "羊膜卵", detail: "壳内有羊膜、绒毛膜与尿囊，胚胎在自带的“小池塘”里发育。" },
      { position: [-1.7, 0.45, 0.4], label: "角质皮肤", detail: "鳞片状的角质层防止水分蒸发。" },
      { position: [-0.4, -0.05, 0.9], label: "四肢与爪", detail: "四肢从躯干侧面伸出，与今天的蜥蜴相似。" },
    ],
  },
  {
    id: "mammal",
    chapter: "哺乳与灵长",
    name: "哺乳类的黎明",
    organism: "摩尔根兽",
    latin: "Morganucodon",
    yearsAgo: 2.05e8,
    yearsLabel: "约 2.05 亿年前",
    era: "中生代 · 三叠纪末 – 侏罗纪初",
    habitat: "恐龙时代的林地，夜间活动",
    size: "约 10 cm，体重 20–30 g",
    innovation: "毛发、恒温、哺乳、三块听小骨——哺乳类在恐龙脚下的夜色中成形。",
    summary:
      "在恐龙统治的白天之外，一支小型合弓类走向了夜生活。为了在寒冷的夜里活动，它们演化出毛发保暖和高代谢的恒温；为了在黑暗中捕虫，听觉和嗅觉高度发达；原本属于颌关节的两块骨头挪进了中耳，变成砧骨和锤骨。摩尔根兽是这类“哺乳形类”的代表，已经拥有乳齿与恒齿两套牙齿。",
    points: [
      "颌关节从“关节骨–方骨”变成“齿骨–鳞骨”，旧关节骨转岗成听小骨，是演化“废物利用”的经典案例。",
      "两套牙齿（乳齿、恒齿）说明幼崽早期靠吮乳而非咀嚼——哺乳行为的间接证据。",
      "6600 万年前小行星撞击结束恐龙时代后，哺乳类才迅速占据各种生态位。",
      "中国云南禄丰是摩尔根兽的重要产地之一。",
    ],
    evidence:
      "英国威尔士格拉摩根裂隙沉积中的大量摩尔根兽骨骼；中国云南禄丰盆地；辽宁热河生物群中保存毛发的早期哺乳类。",
    legacy: "你中耳里的锤骨与砧骨，你的乳牙与恒牙，你 37℃ 的体温与母乳喂养——都来自这一站。",
    metrics: [
      { label: "体长", value: "~10 cm" },
      { label: "听小骨", value: "3 块" },
      { label: "体温", value: "恒温" },
    ],
    env: "night",
    accent: "#e79b6c",
    hotspots: [
      { position: [-1.75, 0.55, 0.45], label: "中耳听小骨", detail: "锤骨、砧骨由原来的颌关节骨转化而来，让哺乳类听得到高频声音。" },
      { position: [-2.05, 0.15, 0.55], label: "胡须与鼻", detail: "夜行生活依赖触须与嗅觉，脑中处理嗅觉的区域相应扩大。" },
      { position: [0.3, 0.55, 0.7], label: "毛发", detail: "保温层，是恒温代谢的前提。" },
    ],
  },
  {
    id: "primate",
    chapter: "哺乳与灵长",
    name: "灵长类起源",
    organism: "阿喀琉斯基猴",
    latin: "Archicebus achilles",
    yearsAgo: 5.5e7,
    yearsLabel: "约 5500 万年前",
    era: "新生代 · 始新世早期",
    habitat: "热带雨林树冠",
    size: "体长约 7 cm（不含尾），体重 20–30 g",
    innovation: "抓握的手脚、朝前的双眼——为树冠生活量身定制的身体。",
    summary:
      "恐龙灭绝之后不久，一支小型哺乳动物钻进了开花植物形成的茂密树冠。它们的拇指能与其他手指对握，指端的爪变成扁平的指甲，眼睛移到脸的正前方以获得立体视觉，方便在枝头精准跳跃、抓取昆虫和果实。2013 年在湖北荆州发现的阿喀琉斯基猴，是已知最古老、最完整的灵长类骨架之一。",
    points: [
      "阿喀琉斯基猴处在眼镜猴与类人猿分道扬镳的位置附近，说明我们的祖先起初非常小。",
      "灵长类的大脑相对体重明显偏大，视觉皮层尤其发达。",
      "约 3000 万年前旧大陆猴类获得三色视觉，能分辨成熟果实。",
      "约 2500–3000 万年前，猿类（无尾）与猴类分开；约 1400 万年前大猩猩、之后黑猩猩相继与人类祖先分离。",
    ],
    evidence:
      "湖北荆州始新世湖相地层中的阿喀琉斯基猴骨架；北美与欧洲的始新世灵长类（假熊猴、兔猴类）。",
    legacy: "你的对生拇指、指甲、立体视觉与三色色觉，都是在树上生活时得到的。",
    metrics: [
      { label: "体长", value: "~7 cm" },
      { label: "体重", value: "20–30 g" },
      { label: "视觉", value: "双眼立体" },
    ],
    env: "canopy",
    accent: "#8ed08a",
    hotspots: [
      { position: [-1.35, 1.35, 0.5], label: "前视的双眼", detail: "双眼视野重叠产生深度感，是在树枝间跳跃的必需品。" },
      { position: [-0.7, 0.35, 0.9], label: "抓握的手", detail: "拇指对握、指甲代替爪，可以牢牢握住细枝。" },
      { position: [1.9, 1.0, 0.2], label: "长尾", detail: "跳跃时用于平衡。类人猿后来失去了尾巴。" },
    ],
  },
  {
    id: "ardipithecus",
    chapter: "人族",
    name: "分道扬镳",
    organism: "地猿始祖种“阿尔迪”",
    latin: "Ardipithecus ramidus",
    yearsAgo: 4.4e6,
    yearsLabel: "约 440 万年前",
    era: "新生代 · 上新世早期",
    habitat: "非洲的林地与河畔森林",
    size: "身高约 1.2 m，体重约 50 kg",
    innovation: "在地面开始用两条腿走路，同时还没放弃树上的生活。",
    summary:
      "人类与黑猩猩的最后共同祖先生活在大约 600–700 万年前的非洲。乍得沙赫人（700 万年）、图根原人（600 万年）与地猿是分离之后最早的人族成员。1994 年发现的“阿尔迪”骨架保存了近半，显示她在地面时用两腿行走，脚上却仍有可以对握的大脚趾用于爬树，犬齿明显小于黑猩猩——社会行为可能已经改变。",
    points: [
      "人类与黑猩猩基因组差异约 1.2%，分离时间据分子钟估计为 600–800 万年前。",
      "双足行走的选择压力有多种假说：解放双手搬运食物、减少烈日照射面积、行走更省能。",
      "阿尔迪的骨盆兼具行走与攀爬特征，说明双足行走起源于林地而非开阔草原。",
      "人族早期脑容量与黑猩猩相当（300–350 cc），大脑增大是很晚才发生的事。",
    ],
    evidence:
      "埃塞俄比亚阿法尔地区 Aramis 出土的阿尔迪骨架（1994 年发现，2009 年发表）；乍得 Toros-Menalla 的沙赫人头骨“图迈”。",
    legacy: "你直立行走的骨盆和脊柱 S 形弯曲，最早的雏形在这里；犬齿变小则改变了我们的脸。",
    metrics: [
      { label: "身高", value: "~1.2 m" },
      { label: "脑容量", value: "300–350 cc" },
      { label: "行走", value: "兼职双足" },
    ],
    env: "woodland",
    accent: "#d9a06b",
    brainCc: 325,
    heightCm: 120,
    hotspots: [
      { position: [0.05, 0.75, 0.55], label: "骨盆", detail: "髂骨变短变宽，可以在单腿支撑时稳住躯干——双足行走的关键。" },
      { position: [-0.55, -1.7, 0.4], label: "可对握的大脚趾", detail: "脚趾仍能像手一样抓握树枝，说明还常在树上活动。" },
      { position: [0.15, 2.05, 0.55], label: "缩小的犬齿", detail: "雄性犬齿不再像黑猩猩那样锋利，可能与更少的雄性争斗有关。" },
    ],
  },
  {
    id: "australopithecus",
    chapter: "人族",
    name: "站直了",
    organism: "阿法南方古猿“露西”",
    latin: "Australopithecus afarensis",
    yearsAgo: 3.2e6,
    yearsLabel: "约 320 万年前",
    era: "新生代 · 上新世",
    habitat: "东非疏林与草原镶嵌带",
    size: "身高 1.05–1.5 m，体重 29–45 kg",
    innovation: "稳定的直立行走已经成熟，而大脑仍只有黑猩猩大小——先走路，后长脑。",
    summary:
      "1974 年在埃塞俄比亚哈达尔出土的“露西”是最著名的人类化石之一：40% 的骨架保存了下来。她的膝关节、骨盆和股骨角度都表明她是习惯性的直立行走者，但手臂较长、指骨弯曲，仍保留攀爬能力。坦桑尼亚莱托里 366 万年前的火山灰上，还留着一串与现代人几乎相同的足迹。",
    points: [
      "脑容量约 400–500 cc，与黑猩猩相当，说明直立行走远早于大脑膨大。",
      "肯尼亚洛美奎 330 万年前的石器（Lomekwian）可能是南方古猿制造的，比人属还早。",
      "南方古猿分化出多个物种，包括以粗壮咀嚼器官著称的傍人（Paranthropus），后来灭绝。",
      "非洲气候在这一时期逐渐变干、变冷，森林退缩为草原。",
    ],
    evidence:
      "埃塞俄比亚哈达尔的“露西”（AL 288-1）；坦桑尼亚莱托里足迹；南非斯泰克方丹的“小脚”骨架；埃塞俄比亚 Dikika 的“塞拉姆”幼儿骨架。",
    legacy: "你的脚弓、内收的膝盖、朝下的枕骨大孔——直立行走的全套装备在这里定型。",
    metrics: [
      { label: "身高", value: "1.05–1.5 m" },
      { label: "脑容量", value: "~450 cc" },
      { label: "行走", value: "习惯性直立" },
    ],
    env: "savanna",
    accent: "#e2b170",
    brainCc: 450,
    heightCm: 110,
    hotspots: [
      { position: [0.15, 0.1, 0.55], label: "内收的膝盖", detail: "股骨向内倾斜，让脚落在身体重心下方，走路不再左右摇摆。" },
      { position: [-0.55, -1.75, 0.5], label: "足弓", detail: "莱托里足迹显示大脚趾已并拢，足弓开始出现。" },
      { position: [0.55, 1.35, 0.5], label: "长臂与弯曲的指骨", detail: "仍保留攀爬能力，晚上可能上树躲避掠食者。" },
    ],
  },
  {
    id: "habilis",
    chapter: "人族",
    name: "人属登场",
    organism: "能人",
    latin: "Homo habilis",
    yearsAgo: 2.4e6,
    yearsLabel: "约 240 万年前",
    era: "新生代 · 更新世早期",
    habitat: "东非裂谷的湖畔与草原",
    size: "身高 1.0–1.35 m，体重 30–40 kg",
    innovation: "系统地打制石器，用工具切肉敲骨——高热量饮食为大脑扩张付账。",
    summary:
      "“能人”意为“手巧的人”，因发现时与奥杜威石器伴生而得名。他们的脑容量比南方古猿大约三分之一，臼齿变小、面部缩短，说明饮食里加入了更多的肉类和骨髓——用石片割下动物尸体上的肉，用石锤砸开骨头。这一步让脑（一个极其耗能的器官）的进一步增大成为可能。",
    points: [
      "奥杜威石器（Oldowan）：用石锤敲击砾石得到锋利石片，最早约 260 万年前。",
      "能人与鲁道夫人、直立人在 200 万年前左右的东非可能共存过。",
      "人属的定义标准（脑容量、工具、体型）至今仍有争议，能人是否应归入人属也有不同意见。",
      "带切痕的动物骨骼是判断“用石器切肉”的直接证据。",
    ],
    evidence:
      "坦桑尼亚奥杜威峡谷 OH 7（模式标本，Leakey 夫妇 1960 年发现）；肯尼亚库彼福勒 KNM-ER 1813 头骨；埃塞俄比亚 Ledi-Geraru 280 万年前的人属下颌。",
    legacy: "你灵巧而有力的“精确抓握”和不断扩张的前额叶，在这里迈出了第一步。",
    metrics: [
      { label: "身高", value: "1.0–1.35 m" },
      { label: "脑容量", value: "~610 cc" },
      { label: "工具", value: "奥杜威石器" },
    ],
    env: "savanna",
    accent: "#d6a15f",
    brainCc: 610,
    heightCm: 125,
    hotspots: [
      { position: [0.7, 0.55, 0.65], label: "石片与石锤", detail: "用石锤敲击石核剥落锋利石片，是最早的系统性工具制造。" },
      { position: [0.15, 2.25, 0.5], label: "扩大的颅腔", detail: "脑容量增至约 600 cc，前额略微鼓起。" },
      { position: [0.05, 1.85, 0.6], label: "缩小的臼齿", detail: "肉食与工具加工使咀嚼器官不必再那么粗壮。" },
    ],
  },
  {
    id: "erectus",
    chapter: "人族",
    name: "走出非洲",
    organism: "直立人",
    latin: "Homo erectus",
    yearsAgo: 1.9e6,
    yearsLabel: "约 190 万年前",
    era: "新生代 · 更新世",
    habitat: "非洲草原，随后扩散到欧亚大陆",
    size: "身高 1.5–1.85 m，体重 40–70 kg",
    innovation: "现代的身体比例、长跑与出汗、控制火、手斧——第一个走出非洲的人类。",
    summary:
      "直立人拥有和我们几乎一样的身体：长腿、短臂、窄骨盆、桶状胸，脑容量增至 850–1100 cc。他们能在烈日下长距离追逐猎物直到猎物中暑倒下，用对称精美的阿舍利手斧屠宰动物，并很可能已经用火烹饪。他们是第一个离开非洲的人类物种，足迹从格鲁吉亚德马尼西到中国周口店、印尼爪哇。",
    points: [
      "格鲁吉亚德马尼西的直立人化石约 185 万年前，是非洲之外最早的人类。",
      "中国元谋人（约 170 万年）、蓝田人、北京猿人（78–40 万年）都属于直立人。",
      "以色列 Gesher Benot Ya'aqov 遗址保存了约 79 万年前的用火证据；南非 Wonderwerk 洞穴可能早至 100 万年。",
      "烹饪软化食物、提高热量吸收，被认为是脑容量持续增大的重要推手。",
    ],
    evidence:
      "肯尼亚“图尔卡纳男孩”（KNM-WT 15000，约 160 万年，骨架近乎完整）；印尼爪哇的“爪哇人”；中国周口店的北京猿人；格鲁吉亚德马尼西头骨。",
    legacy: "你的长腿、汗腺密布的少毛皮肤、依赖烹饪的小肠胃与小牙齿，都是直立人的遗产。",
    metrics: [
      { label: "身高", value: "1.5–1.85 m" },
      { label: "脑容量", value: "~950 cc" },
      { label: "工具", value: "阿舍利手斧 · 火" },
    ],
    env: "savanna",
    accent: "#e59a5c",
    brainCc: 950,
    heightCm: 170,
    hotspots: [
      { position: [0.8, 0.85, 0.7], label: "阿舍利手斧", detail: "两面打制、左右对称的泪滴形石器，延续使用了 100 多万年。" },
      { position: [-0.55, -1.2, 0.5], label: "长腿", detail: "下肢比例接近现代人，适合长距离行走与奔跑。" },
      { position: [0.15, 2.5, 0.55], label: "粗壮的眉脊与低平的颅顶", detail: "脑容量已近现代人的 2/3，但颅骨仍长而低。" },
    ],
  },
  {
    id: "sapiens",
    chapter: "人族",
    name: "智人",
    organism: "智人",
    latin: "Homo sapiens",
    yearsAgo: 3e5,
    yearsLabel: "约 30 万年前 – 今天",
    era: "更新世中期 – 全新世",
    habitat: "起源于非洲，约 6–7 万年前扩散至全球",
    size: "身高 1.5–1.85 m",
    innovation: "高保真学习与累积文化加速了技术、语言和社会适应。",
    summary:
      "摩洛哥 Jebel Irhoud 约 31.5 万年前的化石展示了早期智人特征。当前证据更支持智人的特征在非洲多个相互联系的种群中逐步组合，而非起源于单一孤立地点。智人曾多次离开非洲，后来的扩散种群与尼安德特人、丹尼索瓦人发生了基因交流。累积文化改变了选择压力，但生物演化并未停止。",
    points: [
      "非洲之外的现代人携带约 1–2% 尼安德特人 DNA；美拉尼西亚人还携带 3–5% 丹尼索瓦人 DNA。",
      "尼安德特人脑容量平均 1500 cc，比智人还大；他们于约 4 万年前消失。",
      "南非布隆伯斯洞穴 7.3 万年前的赭石刻画、印尼苏拉威西 5.1 万年前的洞穴壁画，是象征思维的证据。",
      "演化仍在进行：乳糖耐受、藏族的高原适应基因 EPAS1（源自丹尼索瓦人）都是近一万年内的变化。",
    ],
    evidence:
      "摩洛哥 Jebel Irhoud（31.5 万年）；埃塞俄比亚 Omo Kibish（23 万年）与 Herto（16 万年）；古 DNA 全基因组测序（尼安德特人 2010、丹尼索瓦人 2010）。",
    legacy: "这不是终点。你的基因组里叠着这条 38 亿年长路上每一站的痕迹，而你正把它带向下一站。",
    metrics: [
      { label: "身高", value: "1.5–1.85 m" },
      { label: "脑容量", value: "~1350 cc" },
      { label: "全球人口", value: "> 80 亿" },
    ],
    env: "cave",
    accent: "#f2d9b0",
    brainCc: 1350,
    heightCm: 170,
    hotspots: [
      { position: [0.15, 2.55, 0.55], label: "高圆的颅骨", detail: "额头竖直、颅顶高圆，眉脊几乎消失；脑不只是更大，顶叶等区域也重组了。" },
      { position: [0.15, 1.95, 0.7], label: "突出的下巴", detail: "颏隆突是智人独有的特征，尼安德特人也没有。" },
      { position: [0.9, 1.1, 0.6], label: "投掷用的长矛", detail: "复合工具、远程武器与语言协作，是智人扩张的技术基础。" },
    ],
  },
];

export const brainComparison = [
  { name: "黑猩猩", cc: 390 },
  { name: "地猿", cc: 325 },
  { name: "南方古猿", cc: 450 },
  { name: "能人", cc: 610 },
  { name: "直立人", cc: 950 },
  { name: "尼安德特人", cc: 1500 },
  { name: "智人", cc: 1350 },
];

/** 把“距今年数”映射到“地球 46 亿年压缩为一年”的日历。 */
export function calendarDate(yearsAgo: number): string {
  const earthAge = 4.6e9;
  const dayOfYear = Math.min(365, Math.max(1, Math.round((1 - yearsAgo / earthAge) * 365)));
  const monthDays = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  let d = dayOfYear;
  let m = 0;
  while (m < 11 && d > monthDays[m]) {
    d -= monthDays[m];
    m += 1;
  }
  if (yearsAgo < 1e6) {
    const minutesBefore = (yearsAgo / earthAge) * 365 * 24 * 60;
    if (minutesBefore < 60) return `12 月 31 日 · 午夜前 ${Math.max(1, Math.round(minutesBefore))} 分钟`;
    return `12 月 31 日 · 午夜前 ${(minutesBefore / 60).toFixed(1)} 小时`;
  }
  return `${m + 1} 月 ${d} 日`;
}

export function formatYears(yearsAgo: number): string {
  if (yearsAgo >= 1e8) return `${(yearsAgo / 1e8).toFixed(yearsAgo % 1e8 === 0 ? 0 : 1)} 亿年前`;
  if (yearsAgo >= 1e4) return `${Math.round(yearsAgo / 1e4)} 万年前`;
  return `${Math.round(yearsAgo)} 年前`;
}
