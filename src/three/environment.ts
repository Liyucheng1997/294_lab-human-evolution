import * as THREE from "three";
import type { EnvKind } from "../data/stages";
import { V3, std, glassy, sphere, ellipsoid, cone, cylinder, tube, fin, disposeGroup, rng } from "./util";

export interface EnvScene {
  group: THREE.Group;
  background: THREE.Color;
  fogColor: THREE.Color;
  fogNear: number;
  fogFar: number;
  hemiSky: THREE.Color;
  hemiGround: THREE.Color;
  hemiIntensity: number;
  sunColor: THREE.Color;
  sunIntensity: number;
  sunPosition: THREE.Vector3;
  update: (t: number, dt: number) => void;
  dispose: () => void;
}

type Partial_ = Partial<EnvScene>;

function base(group: THREE.Group, o: Partial_): EnvScene {
  return {
    group,
    background: new THREE.Color("#000"),
    fogColor: new THREE.Color("#000"),
    fogNear: 10,
    fogFar: 40,
    hemiSky: new THREE.Color("#fff"),
    hemiGround: new THREE.Color("#444"),
    hemiIntensity: 1,
    sunColor: new THREE.Color("#fff"),
    sunIntensity: 2,
    sunPosition: V3(6, 10, 6),
    update: () => {},
    dispose: () => disposeGroup(group),
    ...o,
  };
}

function ground(color: string, size = 80, noise = 0, seed = 1) {
  const geo = new THREE.PlaneGeometry(size, size, 60, 60);
  if (noise > 0) {
    const rand = rng(seed);
    const pos = geo.attributes.position as THREE.BufferAttribute;
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i), y = pos.getY(i);
      const d = Math.sqrt(x * x + y * y);
      const h = (Math.sin(x * 0.35) * Math.cos(y * 0.28) + Math.sin(x * 0.9 + y * 0.6) * 0.4 + (rand() - 0.5) * 0.3) * noise * Math.min(1, Math.max(0, (d - 3.5) / 6));
      pos.setZ(i, h);
    }
    geo.computeVertexNormals();
  }
  const m = new THREE.Mesh(geo, std(color, { roughness: 1 }));
  m.rotation.x = -Math.PI / 2;
  m.receiveShadow = true;
  return m;
}

function particles(count: number, spread: THREE.Vector3, color: string, size: number, seed: number, opacity = 0.7) {
  const rand = rng(seed);
  const pos = new Float32Array(count * 3);
  for (let i = 0; i < count; i++) {
    pos[i * 3] = (rand() - 0.5) * spread.x;
    pos[i * 3 + 1] = rand() * spread.y;
    pos[i * 3 + 2] = (rand() - 0.5) * spread.z;
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
  const mat = new THREE.PointsMaterial({ color, size, transparent: true, opacity, depthWrite: false, sizeAttenuation: true });
  const pts = new THREE.Points(geo, mat);
  return { pts, pos, spread };
}

/** 简单树：树干 + 若干球形树冠 */
function roundTree(h: number, r: number, trunkColor: string, leafColor: string, seed: number) {
  const t = new THREE.Group();
  const rand = rng(seed);
  const trunk = cylinder(r * 0.12, r * 0.18, h, std(trunkColor, { roughness: 1 }), 8);
  trunk.position.y = h / 2;
  t.add(trunk);
  const leafMat = std(leafColor, { roughness: 0.9 });
  for (let i = 0; i < 5; i++) {
    const s = sphere(r * (0.55 + rand() * 0.4), leafMat, 12);
    s.position.set((rand() - 0.5) * r * 1.2, h + (rand() - 0.3) * r * 0.8, (rand() - 0.5) * r * 1.2);
    t.add(s);
  }
  return t;
}

function acacia(h: number, seed: number) {
  const t = new THREE.Group();
  const rand = rng(seed);
  const barkMat = std("#5b4634", { roughness: 1 });
  const trunk = tube([V3(0, 0, 0), V3(0.2, h * 0.5, 0.1), V3(0.35, h, -0.1)], 0.22, barkMat, 12);
  t.add(trunk);
  for (let i = 0; i < 4; i++) {
    const a = rand() * Math.PI * 2;
    const br = tube([V3(0.35, h, -0.1), V3(0.35 + Math.cos(a) * 1.2, h + 0.7, -0.1 + Math.sin(a) * 1.2), V3(0.35 + Math.cos(a) * 2.2, h + 1.0, -0.1 + Math.sin(a) * 2.2)], 0.09, barkMat, 8);
    t.add(br);
  }
  const canopy = ellipsoid(3.2, 0.55, 3.2, std("#5f7a3a", { roughness: 0.9 }), 20);
  canopy.position.set(0.35, h + 1.1, -0.1);
  t.add(canopy);
  const canopy2 = ellipsoid(2.2, 0.4, 2.2, std("#6c8a44", { roughness: 0.9 }), 16);
  canopy2.position.set(0.9, h + 1.5, 0.3);
  t.add(canopy2);
  return t;
}

function conifer(h: number, seed: number) {
  const t = new THREE.Group();
  const rand = rng(seed);
  const trunk = cylinder(0.12, 0.25, h * 0.4, std("#3b2c1e", { roughness: 1 }), 8);
  trunk.position.y = h * 0.2;
  t.add(trunk);
  const leafMat = std("#1f3a24", { roughness: 1 });
  for (let i = 0; i < 4; i++) {
    const c = cone(h * (0.22 - i * 0.04) * (0.9 + rand() * 0.2), h * 0.32, leafMat, 10);
    c.position.y = h * 0.35 + i * h * 0.19;
    t.add(c);
  }
  return t;
}

/** 石炭纪鳞木：高大笔直的树干、顶端二叉分枝、带状叶 */
function lycopod(h: number, seed: number) {
  const t = new THREE.Group();
  const rand = rng(seed);
  const barkMat = std("#4a4a2c", { roughness: 1 });
  const trunk = cylinder(0.28, 0.5, h, barkMat, 10);
  trunk.position.y = h / 2;
  t.add(trunk);
  // 叶痕：菱形小凸起
  const scarGeo = new THREE.SphereGeometry(0.06, 5, 4);
  const scars = new THREE.InstancedMesh(scarGeo, std("#5c5c38", { roughness: 1 }), 220);
  const d = new THREE.Object3D();
  for (let i = 0; i < 220; i++) {
    const y = rand() * h;
    const a = rand() * Math.PI * 2;
    const r = 0.5 - (y / h) * 0.22;
    d.position.set(Math.cos(a) * r, y, Math.sin(a) * r);
    d.scale.set(1, 1.6, 1);
    d.updateMatrix();
    scars.setMatrixAt(i, d.matrix);
  }
  t.add(scars);
  const leafMat = std("#5f7f3a", { roughness: 0.9, side: THREE.DoubleSide });
  const branch = (from: THREE.Vector3, dir: THREE.Vector3, len: number, depth: number) => {
    const to = from.clone().addScaledVector(dir, len);
    t.add(tube([from, to], 0.12 * (depth + 1) * 0.5, barkMat, 4));
    if (depth === 0) {
      for (let k = 0; k < 10; k++) {
        const leaf = fin([[0, 0], [0.05, -0.6], [0.02, -1.6], [-0.05, -0.6]], 0.02, leafMat);
        leaf.position.copy(to).add(V3((rand() - 0.5) * 0.4, 0, (rand() - 0.5) * 0.4));
        leaf.rotation.set((rand() - 0.5) * 0.7, rand() * Math.PI, (rand() - 0.5) * 0.7);
        t.add(leaf);
      }
      return;
    }
    const a = rand() * Math.PI * 2;
    const d1 = dir.clone().add(V3(Math.cos(a) * 0.7, 0.2, Math.sin(a) * 0.7)).normalize();
    const d2 = dir.clone().add(V3(-Math.cos(a) * 0.7, 0.2, -Math.sin(a) * 0.7)).normalize();
    branch(to, d1, len * 0.7, depth - 1);
    branch(to, d2, len * 0.7, depth - 1);
  };
  branch(V3(0, h, 0), V3(0, 1, 0), 1.6, 3);
  return t;
}

function fern(seed: number, scale = 1) {
  const f = new THREE.Group();
  const rand = rng(seed);
  const leafMat = std("#4b7d35", { roughness: 0.9, side: THREE.DoubleSide });
  for (let i = 0; i < 7; i++) {
    const a = (i / 7) * Math.PI * 2 + rand() * 0.4;
    const frond = fin([[0, 0], [0.12, 0.5], [0.16, 1.1], [0.05, 1.7], [-0.05, 1.7], [-0.16, 1.1], [-0.12, 0.5]], 0.02, leafMat);
    frond.rotation.set(-0.9 - rand() * 0.3, a, 0, "YXZ");
    frond.scale.setScalar(scale * (0.8 + rand() * 0.4));
    f.add(frond);
  }
  return f;
}

/** 石炭纪芦木：竹节状茎干 + 轮生细叶 */
function calamites(h: number, seed: number) {
  const c = new THREE.Group();
  const rand = rng(seed);
  const stemMat = std("#7f8f4a", { roughness: 0.9 });
  const leafMat = std("#8fae55", { roughness: 0.9 });
  const n = Math.round(h / 0.6);
  for (let i = 0; i < n; i++) {
    const seg = cylinder(0.08, 0.09, 0.56, stemMat, 8);
    seg.position.y = i * 0.6 + 0.3;
    c.add(seg);
    const ring = new THREE.Mesh(new THREE.TorusGeometry(0.09, 0.02, 6, 12), stemMat);
    ring.rotation.x = Math.PI / 2;
    ring.position.y = i * 0.6;
    c.add(ring);
    if (i > 0) {
      for (let k = 0; k < 8; k++) {
        const a = (k / 8) * Math.PI * 2 + rand() * 0.3;
        const leaf = cylinder(0.008, 0.02, 0.5, leafMat, 4);
        leaf.position.set(Math.cos(a) * 0.3, i * 0.6 + 0.12, Math.sin(a) * 0.3);
        leaf.rotation.set(Math.sin(a) * 1.0, 0, -Math.cos(a) * 1.0);
        c.add(leaf);
      }
    }
  }
  return c;
}

function grassTufts(count: number, radiusMin: number, radiusMax: number, color: string, seed: number, h = 0.5) {
  const rand = rng(seed);
  const geo = new THREE.ConeGeometry(0.05, h, 4);
  geo.translate(0, h / 2, 0);
  const inst = new THREE.InstancedMesh(geo, std(color, { roughness: 1 }), count);
  const d = new THREE.Object3D();
  for (let i = 0; i < count; i++) {
    const a = rand() * Math.PI * 2;
    const r = radiusMin + Math.sqrt(rand()) * (radiusMax - radiusMin);
    d.position.set(Math.cos(a) * r, 0, Math.sin(a) * r);
    d.rotation.set((rand() - 0.5) * 0.5, rand() * Math.PI, (rand() - 0.5) * 0.5);
    d.scale.set(1, 0.6 + rand() * 0.9, 1);
    d.updateMatrix();
    inst.setMatrixAt(i, d.matrix);
  }
  inst.receiveShadow = true;
  return inst;
}

function rock(r: number, color: string, seed: number) {
  const m = new THREE.Mesh(new THREE.DodecahedronGeometry(r, 1), std(color, { roughness: 1, flatShading: true }));
  const rand = rng(seed);
  m.scale.set(1 + rand() * 0.5, 0.6 + rand() * 0.4, 1 + rand() * 0.5);
  m.rotation.y = rand() * Math.PI;
  m.castShadow = true;
  m.receiveShadow = true;
  return m;
}

// ---------------------------------------------------------------------------

export function buildEnvironment(kind: EnvKind): EnvScene {
  const g = new THREE.Group();
  const rand = rng(kind.length * 31 + 7);

  switch (kind) {
    case "micro": {
      const p = particles(900, V3(40, 24, 40), "#9fe0ff", 0.07, 3, 0.55);
      p.pts.position.y = -6;
      g.add(p.pts);
      const p2 = particles(120, V3(30, 20, 30), "#e0ffd0", 0.18, 4, 0.35);
      p2.pts.position.y = -6;
      g.add(p2.pts);
      // 远处的其他微生物剪影
      for (let i = 0; i < 14; i++) {
        const blob = ellipsoid(0.5 + rand() * 0.8, 0.3 + rand() * 0.4, 0.4, glassy("#7fc0d0", 0.18), 12);
        blob.position.set((rand() - 0.5) * 30, (rand() - 0.5) * 14 + 1, -8 - rand() * 14);
        blob.rotation.z = rand() * Math.PI;
        g.add(blob);
      }
      return base(g, {
        background: new THREE.Color("#07182a"),
        fogColor: new THREE.Color("#07182a"),
        fogNear: 9,
        fogFar: 34,
        hemiSky: new THREE.Color("#5fb3d6"),
        hemiGround: new THREE.Color("#0b2540"),
        hemiIntensity: 1.3,
        sunColor: new THREE.Color("#dff6ff"),
        sunIntensity: 2.4,
        sunPosition: V3(5, 8, 7),
        update(t) {
          const arr = p.pos;
          const pa = p.pts.geometry.attributes.position as THREE.BufferAttribute;
          for (let i = 0; i < arr.length; i += 3) {
            pa.setXYZ(i / 3, arr[i] + Math.sin(t * 0.3 + i) * 0.4, arr[i + 1] + Math.sin(t * 0.2 + i * 0.7) * 0.4, arr[i + 2]);
          }
          pa.needsUpdate = true;
          p2.pts.rotation.y = t * 0.01;
        },
      });
    }

    case "seafloor":
    case "ocean": {
      const isFloor = kind === "seafloor";
      const gnd = ground(isFloor ? "#6d7a4e" : "#7d8a66", 90, 0.9, 5);
      gnd.position.y = isFloor ? -0.02 : -0.4;
      g.add(gnd);
      // 岩石与海藻/叶状体
      for (let i = 0; i < 12; i++) {
        const a = rand() * Math.PI * 2;
        const r = 4 + rand() * 12;
        const rk = rock(0.4 + rand() * 0.9, "#5b6650", i);
        rk.position.set(Math.cos(a) * r, gnd.position.y + 0.1, Math.sin(a) * r);
        g.add(rk);
      }
      const fronds: THREE.Group[] = [];
      const frondMat = std(isFloor ? "#a89060" : "#3f8a5a", { roughness: 0.9, side: THREE.DoubleSide });
      for (let i = 0; i < (isFloor ? 10 : 16); i++) {
        const a = rand() * Math.PI * 2;
        const r = 3.5 + rand() * 9;
        const f = new THREE.Group();
        const h = 1.5 + rand() * 2.5;
        if (isFloor) {
          // 埃迪卡拉纪的叶状体（Charnia）
          const leaf = fin([[0, 0], [0.22, h * 0.3], [0.28, h * 0.6], [0.12, h], [-0.12, h], [-0.28, h * 0.6], [-0.22, h * 0.3]], 0.03, frondMat);
          f.add(leaf);
          for (let k = 1; k < 8; k++) {
            const rib = ellipsoid(0.26, 0.03, 0.02, std("#8f7848"), 6);
            rib.position.y = (h * k) / 8;
            f.add(rib);
          }
          const stalk = cylinder(0.04, 0.06, 0.4, std("#8f7848"), 6);
          stalk.position.y = 0.2;
          f.add(stalk);
        } else {
          for (let k = 0; k < 3; k++) {
            const strand = tube([V3(0, 0, 0), V3(0.2 * k, h * 0.5, 0.1), V3(-0.1, h, 0.2 * k)], 0.05, frondMat, 10);
            f.add(strand);
          }
        }
        f.position.set(Math.cos(a) * r, gnd.position.y, Math.sin(a) * r);
        f.rotation.y = rand() * Math.PI;
        g.add(f);
        fronds.push(f);
      }
      const snow = particles(700, V3(50, 24, 50), "#dff4ff", 0.06, 6, 0.5);
      g.add(snow.pts);
      // 水面透下来的光柱
      const rays = new THREE.Group();
      for (let i = 0; i < 6; i++) {
        const ray = new THREE.Mesh(new THREE.PlaneGeometry(1.2 + rand() * 1.5, 30), new THREE.MeshBasicMaterial({ color: "#bfe9ff", transparent: true, opacity: 0.05, depthWrite: false, side: THREE.DoubleSide, blending: THREE.AdditiveBlending }));
        ray.position.set((rand() - 0.5) * 24, 10, -6 - rand() * 10);
        ray.rotation.set(0, rand() * Math.PI, 0.25 + rand() * 0.2);
        rays.add(ray);
      }
      g.add(rays);
      return base(g, {
        background: new THREE.Color(isFloor ? "#0d3d52" : "#0f4a6a"),
        fogColor: new THREE.Color(isFloor ? "#0d3d52" : "#0f4a6a"),
        fogNear: 8,
        fogFar: 34,
        hemiSky: new THREE.Color("#7fd0e8"),
        hemiGround: new THREE.Color("#0f3040"),
        hemiIntensity: 1.2,
        sunColor: new THREE.Color("#cfefff"),
        sunIntensity: 2.6,
        sunPosition: V3(-4, 12, 5),
        update(t) {
          fronds.forEach((f, i) => (f.rotation.z = Math.sin(t * 0.8 + i) * 0.08));
          const pa = snow.pts.geometry.attributes.position as THREE.BufferAttribute;
          for (let i = 0; i < pa.count; i++) {
            let y = pa.getY(i) - 0.15 * (1 / 60);
            if (y < 0) y = 24;
            pa.setY(i, y);
            pa.setX(i, snow.pos[i * 3] + Math.sin(t * 0.4 + i) * 0.5);
          }
          pa.needsUpdate = true;
          rays.children.forEach((r, i) => ((r as THREE.Mesh).material as THREE.MeshBasicMaterial).opacity = 0.035 + Math.sin(t * 0.7 + i) * 0.02);
        },
      });
    }

    case "shore": {
      const gnd = ground("#a48b5c", 90, 0.5, 8);
      g.add(gnd);
      const mud = new THREE.Mesh(new THREE.CircleGeometry(6, 40), std("#6f5a3e", { roughness: 1 }));
      mud.rotation.x = -Math.PI / 2;
      mud.position.y = 0.01;
      mud.receiveShadow = true;
      g.add(mud);
      const waterGeo = new THREE.PlaneGeometry(90, 90, 40, 40);
      const water = new THREE.Mesh(waterGeo, glassy("#5aa39c", 0.55, { emissive: "#0d3a38", emissiveIntensity: 0.3, roughness: 0.15 }));
      water.rotation.x = -Math.PI / 2;
      water.position.y = 0.34;
      g.add(water);
      const wpos = waterGeo.attributes.position as THREE.BufferAttribute;
      const worig = new Float32Array(wpos.array as Float32Array);
      // 芦木与蕨类
      for (let i = 0; i < 10; i++) {
        const a = rand() * Math.PI * 2;
        const r = 6 + rand() * 12;
        const c = calamites(3 + rand() * 3, i);
        c.position.set(Math.cos(a) * r, 0, Math.sin(a) * r);
        g.add(c);
      }
      for (let i = 0; i < 12; i++) {
        const a = rand() * Math.PI * 2;
        const r = 4.5 + rand() * 10;
        const f = fern(i + 20, 0.9);
        f.position.set(Math.cos(a) * r, 0.1, Math.sin(a) * r);
        g.add(f);
      }
      for (let i = 0; i < 6; i++) {
        const rk = rock(0.4 + rand() * 0.6, "#7d6a4e", i + 40);
        const a = rand() * Math.PI * 2;
        rk.position.set(Math.cos(a) * (3 + rand() * 4), 0.1, Math.sin(a) * (3 + rand() * 4));
        g.add(rk);
      }
      return base(g, {
        background: new THREE.Color("#d9c39a"),
        fogColor: new THREE.Color("#d9c39a"),
        fogNear: 14,
        fogFar: 48,
        hemiSky: new THREE.Color("#ffe8c0"),
        hemiGround: new THREE.Color("#5c5030"),
        hemiIntensity: 1.1,
        sunColor: new THREE.Color("#fff0d0"),
        sunIntensity: 3.0,
        sunPosition: V3(-8, 9, 6),
        update(t) {
          for (let i = 0; i < wpos.count; i++) {
            const x = worig[i * 3], y = worig[i * 3 + 1];
            wpos.setZ(i, Math.sin(x * 0.6 + t * 1.2) * 0.05 + Math.cos(y * 0.5 + t * 0.9) * 0.05);
          }
          wpos.needsUpdate = true;
        },
      });
    }

    case "swamp": {
      const gnd = ground("#2f3a22", 90, 0.4, 9);
      g.add(gnd);
      for (let i = 0; i < 5; i++) {
        const pool = new THREE.Mesh(new THREE.CircleGeometry(1.5 + rand() * 2, 24), glassy("#2a4a3a", 0.75, { roughness: 0.1 }));
        pool.rotation.x = -Math.PI / 2;
        const a = rand() * Math.PI * 2;
        pool.position.set(Math.cos(a) * (6 + rand() * 8), 0.02, Math.sin(a) * (6 + rand() * 8));
        g.add(pool);
      }
      for (let i = 0; i < 9; i++) {
        const a = rand() * Math.PI * 2;
        const r = 6 + rand() * 12;
        const tr = lycopod(9 + rand() * 6, i);
        tr.position.set(Math.cos(a) * r, 0, Math.sin(a) * r);
        g.add(tr);
      }
      for (let i = 0; i < 16; i++) {
        const a = rand() * Math.PI * 2;
        const r = 3.5 + rand() * 12;
        const f = fern(i + 60, 1.1 + rand() * 0.6);
        f.position.set(Math.cos(a) * r, 0.05, Math.sin(a) * r);
        g.add(f);
      }
      for (let i = 0; i < 6; i++) {
        const a = rand() * Math.PI * 2;
        const r = 5 + rand() * 8;
        const c = calamites(4 + rand() * 3, i + 80);
        c.position.set(Math.cos(a) * r, 0, Math.sin(a) * r);
        g.add(c);
      }
      // 巨脉蜻蜓
      const dragonfly = new THREE.Group();
      dragonfly.add(new THREE.Mesh(new THREE.CapsuleGeometry(0.06, 1.1, 6, 10), std("#3a4a2a")).rotateZ(Math.PI / 2));
      const wingMat = glassy("#d0e8f0", 0.4);
      const wings: THREE.Mesh[] = [];
      for (const [x, s] of [[-0.25, 1], [-0.25, -1], [0.15, 1], [0.15, -1]] as Array<[number, number]>) {
        const w = fin([[0, 0], [0.9, 0.12], [1.3, 0.05], [1.2, -0.08], [0.6, -0.12]], 0.01, wingMat);
        w.position.set(x, 0.05, 0);
        w.rotation.set(0, s > 0 ? -Math.PI / 2 : Math.PI / 2, 0);
        w.userData.side = s;
        dragonfly.add(w);
        wings.push(w);
      }
      g.add(dragonfly);
      const spores = particles(300, V3(30, 12, 30), "#d8e8a0", 0.08, 11, 0.4);
      g.add(spores.pts);
      return base(g, {
        background: new THREE.Color("#22301c"),
        fogColor: new THREE.Color("#22301c"),
        fogNear: 6,
        fogFar: 30,
        hemiSky: new THREE.Color("#a8c890"),
        hemiGround: new THREE.Color("#1a2412"),
        hemiIntensity: 1.0,
        sunColor: new THREE.Color("#e8f0c0"),
        sunIntensity: 2.6,
        sunPosition: V3(4, 14, -3),
        update(t) {
          dragonfly.position.set(Math.sin(t * 0.5) * 5, 3.2 + Math.sin(t * 1.3) * 0.5, -3 + Math.cos(t * 0.5) * 4);
          dragonfly.rotation.y = -t * 0.5 + Math.PI / 2;
          wings.forEach((w) => (w.rotation.x = Math.sin(t * 40) * 0.5 * (w.userData.side as number)));
          spores.pts.position.y = Math.sin(t * 0.2) * 0.5;
        },
      });
    }

    case "night": {
      const gnd = ground("#1a2216", 90, 0.5, 12);
      g.add(gnd);
      for (let i = 0; i < 14; i++) {
        const a = rand() * Math.PI * 2;
        const r = 6 + rand() * 14;
        const tr = conifer(6 + rand() * 6, i);
        tr.position.set(Math.cos(a) * r, 0, Math.sin(a) * r);
        g.add(tr);
      }
      for (let i = 0; i < 10; i++) {
        const f = fern(i + 90, 0.8);
        const a = rand() * Math.PI * 2;
        f.position.set(Math.cos(a) * (3 + rand() * 6), 0.05, Math.sin(a) * (3 + rand() * 6));
        g.add(f);
      }
      // 倒木
      const log = cylinder(0.35, 0.4, 5, std("#3a2c1e", { roughness: 1 }), 10);
      log.rotation.z = Math.PI / 2;
      log.position.set(-1, 0.35, -3.5);
      log.rotation.y = 0.5;
      g.add(log);
      // 星空与月亮
      const stars = particles(1200, V3(160, 80, 160), "#ffffff", 0.16, 13, 0.9);
      stars.pts.position.y = 10;
      g.add(stars.pts);
      const moon = sphere(2.2, new THREE.MeshBasicMaterial({ color: "#f5f0d8" }), 24);
      moon.position.set(-22, 20, -40);
      g.add(moon);
      const glow = sphere(3.4, new THREE.MeshBasicMaterial({ color: "#f5f0d8", transparent: true, opacity: 0.12 }), 24);
      glow.position.copy(moon.position);
      g.add(glow);
      // 萤火虫
      const flies = new THREE.InstancedMesh(new THREE.SphereGeometry(0.05, 6, 6), new THREE.MeshBasicMaterial({ color: "#d8ff80" }), 40);
      const flyData = Array.from({ length: 40 }, () => ({ x: (rand() - 0.5) * 16, y: 0.5 + rand() * 3, z: (rand() - 0.5) * 16, ph: rand() * 6.28 }));
      g.add(flies);
      const d = new THREE.Object3D();
      return base(g, {
        background: new THREE.Color("#070b16"),
        fogColor: new THREE.Color("#070b16"),
        fogNear: 10,
        fogFar: 45,
        hemiSky: new THREE.Color("#3a4a7a"),
        hemiGround: new THREE.Color("#0a0d0a"),
        hemiIntensity: 0.9,
        sunColor: new THREE.Color("#9fb4ff"),
        sunIntensity: 1.6,
        sunPosition: V3(-8, 12, -10),
        update(t) {
          flyData.forEach((f, i) => {
            const on = (Math.sin(t * 2 + f.ph) + 1) * 0.5;
            d.position.set(f.x + Math.sin(t * 0.5 + f.ph) * 0.8, f.y + Math.sin(t * 0.8 + f.ph * 2) * 0.4, f.z + Math.cos(t * 0.4 + f.ph) * 0.8);
            d.scale.setScalar(on > 0.6 ? 1 : 0.001);
            d.updateMatrix();
            flies.setMatrixAt(i, d.matrix);
          });
          flies.instanceMatrix.needsUpdate = true;
        },
      });
    }

    case "canopy": {
      const gnd = ground("#1e2e18", 90);
      gnd.position.y = -9;
      g.add(gnd);
      const barkMat = std("#5a4530", { roughness: 1 });
      const leafMat = std("#4f8a3a", { roughness: 0.85 });
      const leafGeo = new THREE.SphereGeometry(1, 8, 6);
      leafGeo.scale(0.5, 0.05, 0.22);
      const leaves = new THREE.InstancedMesh(leafGeo, leafMat, 1600);
      const d = new THREE.Object3D();
      let li = 0;
      const branchList: THREE.Vector3[][] = [];
      for (let i = 0; i < 9; i++) {
        const a = rand() * Math.PI * 2;
        const r = 5 + rand() * 6;
        const y = -3 + rand() * 7;
        const pts = [V3(Math.cos(a) * (r + 10), y - 2 + rand() * 2, Math.sin(a) * (r + 10)), V3(Math.cos(a) * r, y, Math.sin(a) * r), V3(Math.cos(a + 0.8) * (r - 2), y + 1, Math.sin(a + 0.8) * (r - 2))];
        g.add(tube(pts, 0.25 + rand() * 0.2, barkMat, 20));
        branchList.push(pts);
      }
      // 几根大树干
      for (let i = 0; i < 6; i++) {
        const a = rand() * Math.PI * 2;
        const r = 9 + rand() * 8;
        const trunk = cylinder(0.6, 0.9, 30, barkMat, 10);
        trunk.position.set(Math.cos(a) * r, 5, Math.sin(a) * r);
        g.add(trunk);
      }
      for (const pts of branchList) {
        const curve = new THREE.CatmullRomCurve3(pts);
        for (let k = 0; k < 170 && li < 1600; k++, li++) {
          const p = curve.getPoint(rand());
          d.position.copy(p).add(V3((rand() - 0.5) * 1.6, 0.2 + rand() * 1.2, (rand() - 0.5) * 1.6));
          d.rotation.set((rand() - 0.5), rand() * Math.PI, (rand() - 0.5));
          d.scale.setScalar(0.7 + rand() * 0.8);
          d.updateMatrix();
          leaves.setMatrixAt(li, d.matrix);
        }
      }
      leaves.count = li;
      g.add(leaves);
      const pollen = particles(300, V3(24, 12, 24), "#f0ffb0", 0.07, 17, 0.5);
      pollen.pts.position.y = -3;
      g.add(pollen.pts);
      return base(g, {
        background: new THREE.Color("#3a6a34"),
        fogColor: new THREE.Color("#3a6a34"),
        fogNear: 8,
        fogFar: 34,
        hemiSky: new THREE.Color("#d8f0a0"),
        hemiGround: new THREE.Color("#1c3016"),
        hemiIntensity: 1.2,
        sunColor: new THREE.Color("#fff6c8"),
        sunIntensity: 3.0,
        sunPosition: V3(6, 14, 4),
        update(t) {
          pollen.pts.rotation.y = t * 0.02;
          pollen.pts.position.y = -3 + Math.sin(t * 0.3) * 0.4;
        },
      });
    }

    case "woodland": {
      const gnd = ground("#8c9a55", 100, 0.6, 21);
      g.add(gnd);
      g.add(grassTufts(1600, 3, 30, "#9fae5c", 22, 0.45));
      for (let i = 0; i < 16; i++) {
        const a = rand() * Math.PI * 2;
        const r = 7 + rand() * 20;
        const tr = roundTree(3 + rand() * 3, 2 + rand() * 1.5, "#5a4632", i % 2 ? "#5f8a3c" : "#7a9a44", i);
        tr.position.set(Math.cos(a) * r, 0, Math.sin(a) * r);
        g.add(tr);
      }
      for (let i = 0; i < 5; i++) {
        const rk = rock(0.5 + rand() * 0.8, "#8f8570", i + 30);
        const a = rand() * Math.PI * 2;
        rk.position.set(Math.cos(a) * (4 + rand() * 6), 0.1, Math.sin(a) * (4 + rand() * 6));
        g.add(rk);
      }
      return base(g, {
        background: new THREE.Color("#dfe6c0"),
        fogColor: new THREE.Color("#dfe6c0"),
        fogNear: 16,
        fogFar: 60,
        hemiSky: new THREE.Color("#fff8e0"),
        hemiGround: new THREE.Color("#4a5a2a"),
        hemiIntensity: 1.2,
        sunColor: new THREE.Color("#fff3d8"),
        sunIntensity: 3.0,
        sunPosition: V3(-8, 12, 8),
      });
    }

    case "savanna": {
      const gnd = ground("#c4a65c", 120, 0.6, 31);
      g.add(gnd);
      g.add(grassTufts(2200, 2.5, 40, "#d3b86a", 32, 0.6));
      for (let i = 0; i < 9; i++) {
        const a = rand() * Math.PI * 2;
        const r = 9 + rand() * 30;
        const tr = acacia(3.5 + rand() * 2, i);
        tr.position.set(Math.cos(a) * r, 0, Math.sin(a) * r);
        g.add(tr);
      }
      // 远山
      for (let i = 0; i < 6; i++) {
        const hill = ellipsoid(18 + rand() * 14, 4 + rand() * 4, 10, std("#b89a6a", { roughness: 1 }), 20);
        const a = rand() * Math.PI * 2;
        hill.position.set(Math.cos(a) * 55, -1, Math.sin(a) * 55);
        g.add(hill);
      }
      for (let i = 0; i < 6; i++) {
        const rk = rock(0.4 + rand() * 0.9, "#a08a66", i + 50);
        const a = rand() * Math.PI * 2;
        rk.position.set(Math.cos(a) * (3.5 + rand() * 6), 0.1, Math.sin(a) * (3.5 + rand() * 6));
        g.add(rk);
      }
      const dust = particles(250, V3(40, 6, 40), "#f0dca0", 0.08, 33, 0.35);
      g.add(dust.pts);
      return base(g, {
        background: new THREE.Color("#e6c48c"),
        fogColor: new THREE.Color("#e6c48c"),
        fogNear: 14,
        fogFar: 70,
        hemiSky: new THREE.Color("#ffe6b0"),
        hemiGround: new THREE.Color("#6a4c22"),
        hemiIntensity: 1.1,
        sunColor: new THREE.Color("#ffd9a0"),
        sunIntensity: 3.4,
        sunPosition: V3(-14, 7, 6),
        update(t) {
          dust.pts.position.x = Math.sin(t * 0.1) * 2;
        },
      });
    }

    case "cave": {
      const gnd = ground("#4a3f35", 90, 0.5, 41);
      g.add(gnd);
      // 洞壁：内表面的大球
      const wall = new THREE.Mesh(new THREE.SphereGeometry(22, 32, 20, 0, Math.PI * 2, 0, Math.PI * 0.55), std("#4b3b30", { roughness: 1, side: THREE.BackSide }));
      wall.position.y = -2;
      g.add(wall);
      // 洞口：远处一片亮
      const opening = new THREE.Mesh(new THREE.CircleGeometry(5, 32), new THREE.MeshBasicMaterial({ color: "#8fb8d8" }));
      opening.position.set(-12, 6, -17);
      opening.lookAt(0, 3, 0);
      g.add(opening);
      // 赭石手印
      const ochre = new THREE.MeshBasicMaterial({ color: "#a1432a" });
      for (let i = 0; i < 7; i++) {
        const hand = new THREE.Group();
        const palm = new THREE.Mesh(new THREE.CircleGeometry(0.28, 12), ochre);
        hand.add(palm);
        for (let k = 0; k < 5; k++) {
          const a = -0.55 + k * 0.28;
          const f = new THREE.Mesh(new THREE.CapsuleGeometry(0.06, k === 0 ? 0.3 : 0.45, 4, 6), ochre);
          f.position.set(Math.sin(a) * 0.5, Math.cos(a) * 0.5, 0);
          f.rotation.z = -a;
          hand.add(f);
        }
        const a = 0.9 + i * 0.22;
        hand.position.set(Math.cos(a) * 21.5, 3 + (i % 3) * 1.4, Math.sin(a) * 21.5 - 2);
        hand.lookAt(0, hand.position.y, 0);
        hand.scale.setScalar(1.6);
        g.add(hand);
      }
      // 壁画：一头简笔画的动物（几条线）
      const paintMat = new THREE.MeshBasicMaterial({ color: "#3a2a20" });
      const animal = new THREE.Group();
      animal.add(new THREE.Mesh(new THREE.TorusGeometry(1.4, 0.06, 6, 24, Math.PI), paintMat));
      const legMesh = new THREE.Mesh(new THREE.CapsuleGeometry(0.05, 1.0, 4, 6), paintMat);
      for (const x of [-0.9, -0.3, 0.4, 1.0]) {
        const l = legMesh.clone();
        l.position.set(x, -0.6, 0);
        animal.add(l);
      }
      const hd = new THREE.Mesh(new THREE.CapsuleGeometry(0.06, 0.9, 4, 6), paintMat);
      hd.position.set(1.7, 0.4, 0);
      hd.rotation.z = -0.9;
      animal.add(hd);
      animal.position.set(Math.cos(2.4) * 21.4, 5.5, Math.sin(2.4) * 21.4 - 2);
      animal.lookAt(0, 5.5, 0);
      animal.scale.setScalar(1.8);
      g.add(animal);
      // 篝火
      const fire = new THREE.Group();
      const logMat = std("#3a2618", { roughness: 1 });
      for (let i = 0; i < 4; i++) {
        const l = cylinder(0.08, 0.1, 1.2, logMat, 6);
        l.rotation.set(Math.PI / 2 - 0.35, 0, (i / 4) * Math.PI * 2);
        l.position.y = 0.15;
        fire.add(l);
      }
      const flameMat = new THREE.MeshBasicMaterial({ color: "#ff9a3c", transparent: true, opacity: 0.85 });
      const flames: THREE.Mesh[] = [];
      for (let i = 0; i < 6; i++) {
        const f = cone(0.18 - i * 0.02, 0.7 + (i % 3) * 0.2, i < 3 ? flameMat : new THREE.MeshBasicMaterial({ color: "#ffd36a", transparent: true, opacity: 0.8 }), 8);
        f.position.set((rand() - 0.5) * 0.4, 0.5, (rand() - 0.5) * 0.4);
        fire.add(f);
        flames.push(f);
      }
      const embers = particles(60, V3(1, 3, 1), "#ffb060", 0.06, 43, 0.9);
      fire.add(embers.pts);
      const light = new THREE.PointLight("#ff9a3c", 30, 22, 1.6);
      light.position.y = 1.0;
      light.castShadow = true;
      light.shadow.mapSize.set(512, 512);
      fire.add(light);
      const stones = new THREE.Group();
      for (let i = 0; i < 10; i++) {
        const a = (i / 10) * Math.PI * 2;
        const st = rock(0.16, "#6a5c50", i + 70);
        st.position.set(Math.cos(a) * 0.75, 0.05, Math.sin(a) * 0.75);
        stones.add(st);
      }
      fire.add(stones);
      fire.position.set(2.6, 0, 1.4);
      g.add(fire);
      for (let i = 0; i < 6; i++) {
        const rk = rock(0.6 + rand() * 1.0, "#5b4d42", i + 90);
        const a = rand() * Math.PI * 2;
        rk.position.set(Math.cos(a) * (5 + rand() * 6), 0.1, Math.sin(a) * (5 + rand() * 6));
        g.add(rk);
      }
      return base(g, {
        background: new THREE.Color("#120d0a"),
        fogColor: new THREE.Color("#120d0a"),
        fogNear: 8,
        fogFar: 34,
        hemiSky: new THREE.Color("#6a5a70"),
        hemiGround: new THREE.Color("#1a1210"),
        hemiIntensity: 0.55,
        sunColor: new THREE.Color("#9fb8d8"),
        sunIntensity: 0.9,
        sunPosition: V3(-12, 8, -14),
        update(t) {
          flames.forEach((f, i) => {
            f.scale.set(1 + Math.sin(t * 9 + i) * 0.15, 1 + Math.sin(t * 13 + i * 2) * 0.25, 1 + Math.cos(t * 11 + i) * 0.15);
            f.rotation.y = t * 2 + i;
          });
          light.intensity = 26 + Math.sin(t * 12) * 3 + Math.sin(t * 31) * 2;
          const pa = embers.pts.geometry.attributes.position as THREE.BufferAttribute;
          for (let i = 0; i < pa.count; i++) {
            let y = pa.getY(i) + 0.02 + (i % 3) * 0.006;
            if (y > 3) y = 0.3;
            pa.setY(i, y);
            pa.setX(i, embers.pos[i * 3] + Math.sin(t * 3 + i) * 0.15);
          }
          pa.needsUpdate = true;
        },
      });
    }
  }
}
