import * as THREE from "three";
import { StageModel, V3, std, glassy, sphere, capsule, tube, disposeGroup, rng } from "../util";

/** 1. 原核细胞：胶囊状菌体 + 拟核 + 核糖体 + 旋转鞭毛 + 菌毛 */
export function buildProkaryote(): StageModel {
  const g = new THREE.Group();
  const rand = rng(11);

  const membrane = capsule(1.05, 2.6, glassy("#8be36a", 0.42, { emissive: "#173a12", emissiveIntensity: 0.25 }), 24);
  membrane.rotation.z = Math.PI / 2;
  membrane.renderOrder = 2;
  g.add(membrane);

  // 细胞壁：稍大的一层薄壳
  const wall = capsule(1.14, 2.6, glassy("#cfff9a", 0.14), 24);
  wall.rotation.z = Math.PI / 2;
  wall.renderOrder = 3;
  g.add(wall);

  // 拟核：缠绕的环状 DNA
  const pts: THREE.Vector3[] = [];
  for (let i = 0; i < 40; i++) {
    const a = (i / 40) * Math.PI * 2;
    pts.push(V3(Math.cos(a) * 0.9 + Math.sin(a * 3) * 0.25, Math.sin(a * 2) * 0.35, Math.sin(a) * 0.45 + Math.cos(a * 4) * 0.15));
  }
  const dna = tube(pts, 0.05, std("#e8ffb0", { emissive: "#7fbf3a", emissiveIntensity: 0.6 }), 200, true);
  g.add(dna);

  // 核糖体
  const riboGeo = new THREE.SphereGeometry(0.06, 8, 6);
  const ribo = new THREE.InstancedMesh(riboGeo, std("#ffb36b", { roughness: 0.5 }), 90);
  const dummy = new THREE.Object3D();
  for (let i = 0; i < 90; i++) {
    const x = (rand() - 0.5) * 2.7;
    const r = Math.sqrt(rand()) * 0.85;
    const a = rand() * Math.PI * 2;
    dummy.position.set(x, Math.cos(a) * r, Math.sin(a) * r);
    dummy.updateMatrix();
    ribo.setMatrixAt(i, dummy.matrix);
  }
  g.add(ribo);

  // 鞭毛：螺旋，绕自身轴旋转即模拟"马达"驱动
  const flag = new THREE.Group();
  const helix: THREE.Vector3[] = [];
  for (let i = 0; i <= 60; i++) {
    const s = i / 60;
    const x = -s * 3.2;
    const r = 0.06 + s * 0.22;
    helix.push(V3(x, Math.cos(s * Math.PI * 6) * r, Math.sin(s * Math.PI * 6) * r));
  }
  const flagMesh = tube(helix, 0.035, std("#d9f7c4", { emissive: "#79c86e", emissiveIntensity: 0.3 }), 120);
  flag.add(flagMesh);
  flag.position.set(-2.35, 0, 0);
  g.add(flag);

  // 菌毛
  const pili = new THREE.Group();
  for (let i = 0; i < 26; i++) {
    const a = rand() * Math.PI * 2;
    const x = (rand() - 0.5) * 2.4;
    const dir = V3(0, Math.cos(a), Math.sin(a));
    const start = V3(x, 0, 0).addScaledVector(dir, 1.1);
    const end = start.clone().addScaledVector(dir, 0.35 + rand() * 0.4);
    end.x += (rand() - 0.5) * 0.3;
    const p = tube([start, start.clone().lerp(end, 0.5).add(V3(0, (rand() - 0.5) * 0.1, (rand() - 0.5) * 0.1)), end], 0.012, std("#e6ffd0"), 8);
    pili.add(p);
  }
  g.add(pili);

  return {
    group: g,
    lift: 1.6,
    focus: V3(0, 0, 0),
    distance: 7.5,
    update(t) {
      flag.rotation.x = t * 9;
      dna.rotation.x = Math.sin(t * 0.3) * 0.2;
      g.position.y = Math.sin(t * 0.8) * 0.08;
      g.rotation.z = Math.sin(t * 0.5) * 0.06;
    },
    dispose: () => disposeGroup(g),
  };
}

/** 2. 蓝细菌丝状体 + 异形胞 + 类囊体 + 上升的氧气泡 */
export function buildCyanobacteria(): StageModel {
  const g = new THREE.Group();
  const rand = rng(23);
  const cellMat = glassy("#3fd0b8", 0.55, { emissive: "#0d4a44", emissiveIntensity: 0.35 });
  const thyMat = std("#22b38a", { emissive: "#1c8a6b", emissiveIntensity: 0.6, roughness: 0.4 });

  const n = 11;
  const chain = new THREE.Group();
  for (let i = 0; i < n; i++) {
    const s = i / (n - 1);
    const x = (s - 0.5) * 5.4;
    const y = Math.sin(s * Math.PI * 1.3) * 0.5;
    const isHetero = i === 3;
    const cell = new THREE.Group();
    const body = sphere(isHetero ? 0.5 : 0.42, isHetero ? glassy("#c8e6a0", 0.6, { emissive: "#4d5f2b", emissiveIntensity: 0.3 }) : cellMat, 24);
    body.scale.set(0.62, 1, 1);
    cell.add(body);
    if (!isHetero) {
      // 类囊体：几圈同心环
      for (let k = 0; k < 3; k++) {
        const ring = new THREE.Mesh(new THREE.TorusGeometry(0.16 + k * 0.08, 0.02, 8, 32), thyMat);
        ring.rotation.y = Math.PI / 2;
        cell.add(ring);
      }
    } else {
      const core = sphere(0.18, std("#f4f1c1", { emissive: "#c9c07a", emissiveIntensity: 0.4 }));
      cell.add(core);
    }
    cell.position.set(x, y, 0);
    cell.rotation.z = Math.cos(s * Math.PI * 1.3) * 0.35;
    chain.add(cell);
  }
  // 包裹丝状体的胶鞘
  const sheathPts = Array.from({ length: 12 }, (_, i) => {
    const s = i / 11;
    return V3((s - 0.5) * 5.9, Math.sin(s * Math.PI * 1.3) * 0.5, 0);
  });
  const sheath = tube(sheathPts, 0.5, glassy("#9ff0e0", 0.12), 60);
  chain.add(sheath);
  g.add(chain);

  // 氧气泡
  const bubbleGeo = new THREE.SphereGeometry(1, 12, 10);
  const bubbleMat = glassy("#e8fffb", 0.5, { emissive: "#7fd", emissiveIntensity: 0.15 });
  const bubbles = new THREE.InstancedMesh(bubbleGeo, bubbleMat, 40);
  const bData = Array.from({ length: 40 }, () => ({
    x: (rand() - 0.5) * 6,
    y: rand() * 4,
    z: (rand() - 0.5) * 1.5,
    r: 0.03 + rand() * 0.07,
    v: 0.25 + rand() * 0.4,
    ph: rand() * 6.28,
  }));
  g.add(bubbles);
  const dummy = new THREE.Object3D();

  return {
    group: g,
    lift: 1.4,
    focus: V3(0, 0.6, 0),
    distance: 8.5,
    update(t, dt) {
      chain.rotation.x = Math.sin(t * 0.25) * 0.25;
      chain.position.y = Math.sin(t * 0.7) * 0.06;
      bData.forEach((b, i) => {
        b.y += b.v * dt;
        if (b.y > 4.2) {
          b.y = -0.5;
          b.x = (rand() - 0.5) * 6;
        }
        dummy.position.set(b.x + Math.sin(t * 2 + b.ph) * 0.08, b.y - 0.6, b.z);
        dummy.scale.setScalar(b.r);
        dummy.updateMatrix();
        bubbles.setMatrixAt(i, dummy.matrix);
      });
      bubbles.instanceMatrix.needsUpdate = true;
    },
    dispose: () => disposeGroup(g),
  };
}

/** 3. 真核细胞：细胞核、线粒体、内质网、高尔基体、囊泡 */
export function buildEukaryote(): StageModel {
  const g = new THREE.Group();
  const rand = rng(37);

  const outer = sphere(2.25, glassy("#5aa9ff", 0.28, { emissive: "#0d2a55", emissiveIntensity: 0.3 }), 48);
  outer.renderOrder = 3;
  g.add(outer);

  // 细胞核 + 核仁
  const nucleus = new THREE.Group();
  nucleus.add(sphere(0.85, glassy("#a7c6ff", 0.7, { emissive: "#2b4a8c", emissiveIntensity: 0.4 }), 40));
  const nucleolus = sphere(0.3, std("#f0d27a", { emissive: "#a8862a", emissiveIntensity: 0.5 }));
  nucleolus.position.set(0.25, 0.15, 0.2);
  nucleus.add(nucleolus);
  // 染色质
  for (let k = 0; k < 4; k++) {
    const pts: THREE.Vector3[] = [];
    for (let i = 0; i < 14; i++) {
      const a = (i / 14) * Math.PI * 2;
      const r = 0.55;
      pts.push(V3(Math.cos(a + k) * r * (0.6 + 0.4 * rand()), Math.sin(a * 2 + k) * 0.5, Math.sin(a + k) * r * (0.6 + 0.4 * rand())));
    }
    nucleus.add(tube(pts, 0.03, std("#dbe6ff", { emissive: "#7f9fe0", emissiveIntensity: 0.4 }), 80, true));
  }
  nucleus.position.set(-0.4, 0.3, 0.1);
  g.add(nucleus);

  // 线粒体
  const mitoMat = glassy("#ff9a5c", 0.85, { emissive: "#7a2e0e", emissiveIntensity: 0.4 });
  const cristaeMat = std("#ffd0a8", { emissive: "#c9784a", emissiveIntensity: 0.4 });
  const mitos: THREE.Group[] = [];
  const mitoPos: Array<[number, number, number, number]> = [
    [1.35, 0.6, 0.6, 0.4],
    [0.9, -1.2, -0.4, -0.7],
    [-1.3, -0.9, 0.7, 1.1],
    [-0.2, 1.4, -0.9, 0.2],
    [1.2, 0.2, -1.2, -1.3],
  ];
  for (const [x, y, z, rot] of mitoPos) {
    const m = new THREE.Group();
    m.add(capsule(0.22, 0.6, mitoMat, 14));
    for (let k = 0; k < 5; k++) {
      const disc = new THREE.Mesh(new THREE.TorusGeometry(0.13, 0.03, 8, 20), cristaeMat);
      disc.rotation.x = Math.PI / 2;
      disc.position.y = -0.3 + k * 0.15;
      m.add(disc);
    }
    m.position.set(x, y, z);
    m.rotation.set(rot, rot * 0.7, rot * 1.3);
    g.add(m);
    mitos.push(m);
  }

  // 内质网：围绕核的褶皱带
  const erMat = glassy("#8fd3ff", 0.6, { emissive: "#1e5c86", emissiveIntensity: 0.4 });
  for (let k = 0; k < 3; k++) {
    const pts: THREE.Vector3[] = [];
    for (let i = 0; i <= 16; i++) {
      const a = (i / 16) * Math.PI * 1.4 - 0.4 + k * 0.6;
      const r = 1.15 + k * 0.18;
      pts.push(V3(-0.4 + Math.cos(a) * r, 0.3 + Math.sin(i * 1.7 + k) * 0.18 - k * 0.15, 0.1 + Math.sin(a) * r * 0.75));
    }
    g.add(tube(pts, 0.05, erMat, 90));
  }

  // 高尔基体：一叠弯曲的扁盘
  const golgi = new THREE.Group();
  const golgiMat = glassy("#ffe38a", 0.8, { emissive: "#8a6a1a", emissiveIntensity: 0.35 });
  for (let k = 0; k < 5; k++) {
    const disc = new THREE.Mesh(new THREE.TorusGeometry(0.34 - k * 0.03, 0.045, 8, 28, Math.PI * 1.35), golgiMat);
    disc.position.set(0, k * 0.11, 0);
    disc.rotation.set(Math.PI / 2, 0, 0.2);
    golgi.add(disc);
  }
  golgi.position.set(0.9, -1.15, 0.5);
  golgi.rotation.set(0.5, 0.4, 0);
  g.add(golgi);

  // 囊泡 & 核糖体
  const vesGeo = new THREE.SphereGeometry(1, 10, 8);
  const ves = new THREE.InstancedMesh(vesGeo, std("#cfe8ff", { emissive: "#7fb0e0", emissiveIntensity: 0.3 }), 60);
  const dummy = new THREE.Object3D();
  for (let i = 0; i < 60; i++) {
    const v = V3(rand() - 0.5, rand() - 0.5, rand() - 0.5).normalize().multiplyScalar(0.9 + rand() * 1.15);
    dummy.position.copy(v);
    dummy.scale.setScalar(0.03 + rand() * 0.06);
    dummy.updateMatrix();
    ves.setMatrixAt(i, dummy.matrix);
  }
  g.add(ves);

  return {
    group: g,
    lift: 2.4,
    focus: V3(0, 0, 0),
    distance: 8.4,
    update(t) {
      g.rotation.y = t * 0.06;
      nucleus.rotation.y = -t * 0.15;
      mitos.forEach((m, i) => (m.rotation.z += 0.002 * (i % 2 ? 1 : -1)));
      outer.scale.setScalar(1 + Math.sin(t * 1.1) * 0.012);
    },
    dispose: () => disposeGroup(g),
  };
}
