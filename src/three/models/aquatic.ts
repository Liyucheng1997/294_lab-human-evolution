import * as THREE from "three";
import { StageModel, V3, std, glassy, sphere, ellipsoid, capsule, lathe, fin, bake, SwimDeformer, disposeGroup, rng } from "../util";

/** 4. 狄更逊水母：扁平椭圆、两列错开的“肋” */
export function buildDickinsonia(): StageModel {
  const g = new THREE.Group();
  const L = 2.6;
  const W = 1.5;
  const bodyMat = std("#d9a86a", { roughness: 0.85 });
  const ribMat = std("#e6b97c", { roughness: 0.8 });
  const ribs: THREE.Mesh[] = [];
  const n = 26;
  for (let side of [-1, 1]) {
    for (let i = 0; i < n; i++) {
      const s = (i + (side > 0 ? 0.5 : 0)) / n;
      const x = -L + s * 2 * L;
      const halfW = W * Math.sqrt(Math.max(0, 1 - (x / L) ** 2));
      if (halfW < 0.08) continue;
      const rib = ellipsoid(0.11 + halfW * 0.02, 0.09, halfW / 2, ribMat, 16);
      rib.position.set(x, 0.05, (side * halfW) / 2 + side * 0.03);
      rib.rotation.y = side * (x / L) * 0.25;
      g.add(rib);
      ribs.push(rib);
    }
  }
  const base = ellipsoid(L + 0.1, 0.06, W + 0.1, bodyMat, 40);
  base.position.y = 0.0;
  g.add(base);
  const axis = capsule(0.045, L * 1.9, std("#b98750"), 8);
  axis.rotation.z = Math.PI / 2;
  axis.position.y = 0.11;
  g.add(axis);

  // 身边的一小片微生物席（隆起的席）
  const matMat = std("#7c8f57", { roughness: 1 });
  const mat = new THREE.Mesh(new THREE.CircleGeometry(4.2, 40), matMat);
  mat.rotation.x = -Math.PI / 2;
  mat.position.y = -0.03;
  mat.receiveShadow = true;
  g.add(mat);
  // 移动留下的印痕
  for (let k = 0; k < 3; k++) {
    const trace = ellipsoid(L * 0.9, 0.02, W * 0.9, std("#6f8050", { roughness: 1 }), 30);
    trace.position.set(0.9 + k * 1.1, -0.01, 1.4 + k * 0.5);
    trace.rotation.y = -0.4;
    g.add(trace);
  }

  return {
    group: g,
    lift: 0.05,
    focus: V3(0, 0.1, 0),
    distance: 7.4,
    update(t) {
      ribs.forEach((r, i) => {
        r.position.y = 0.05 + Math.sin(t * 1.4 + i * 0.35) * 0.02;
      });
    },
    dispose: () => disposeGroup(g),
  };
}

/** 5. 昆明鱼：半透明身体，可见脊索与 V 形肌节 */
export function buildChordate(): StageModel {
  const g = new THREE.Group();
  const bodyMat = glassy("#f0a35e", 0.55, { emissive: "#5a2e0c", emissiveIntensity: 0.25 });
  const body = lathe(
    [
      [0.02, -2.6],
      [0.2, -2.3],
      [0.42, -1.7],
      [0.5, -0.9],
      [0.48, 0],
      [0.4, 0.9],
      [0.28, 1.7],
      [0.12, 2.3],
      [0.02, 2.6],
    ],
    bodyMat,
    28,
  );
  body.scale.set(1, 1, 0.75);
  body.renderOrder = 2;
  bake(body);
  g.add(body);

  // 脊索
  const noto = capsule(0.07, 4.6, std("#fff0c8", { emissive: "#e0b070", emissiveIntensity: 0.6 }), 8);
  noto.rotation.z = Math.PI / 2;
  noto.position.y = 0.08;
  bake(noto);
  g.add(noto);
  // 神经索
  const nerve = capsule(0.035, 4.2, std("#ffe4ff", { emissive: "#c890d0", emissiveIntensity: 0.6 }), 8);
  nerve.rotation.z = Math.PI / 2;
  nerve.position.y = 0.2;
  bake(nerve);
  g.add(nerve);

  // V 形肌节
  const myoMat = std("#d97e3c", { emissive: "#6b3812", emissiveIntensity: 0.3 });
  const deformables: THREE.Mesh[] = [body, noto, nerve];
  for (let i = 0; i < 16; i++) {
    const x = -1.5 + i * 0.24;
    for (const side of [-1, 1]) {
      const up = new THREE.Mesh(new THREE.BoxGeometry(0.03, 0.4, 0.05), myoMat);
      up.position.set(x, 0.24, side * 0.22);
      up.rotation.z = -0.5;
      bake(up);
      g.add(up);
      const dn = new THREE.Mesh(new THREE.BoxGeometry(0.03, 0.4, 0.05), myoMat);
      dn.position.set(x, -0.16, side * 0.22);
      dn.rotation.z = 0.5;
      bake(dn);
      g.add(dn);
      deformables.push(up, dn);
    }
  }

  // 背鳍、腹鳍、尾鳍
  const finMat = glassy("#ffcf95", 0.6, { emissive: "#7a4a1a", emissiveIntensity: 0.2 });
  const dorsal = fin(
    [
      [-1.6, 0.4],
      [-0.6, 0.72],
      [0.6, 0.78],
      [1.8, 0.62],
      [2.4, 0.4],
      [2.4, 0.2],
      [-1.6, 0.35],
    ],
    0.03,
    finMat,
  );
  bake(dorsal);
  const ventral = fin(
    [
      [0.2, -0.36],
      [1.2, -0.62],
      [2.4, -0.4],
      [2.4, -0.15],
      [0.2, -0.3],
    ],
    0.03,
    finMat,
  );
  bake(ventral);
  g.add(dorsal, ventral);
  deformables.push(dorsal, ventral);

  // 头部：眼睛、鳃囊
  const eyeMat = std("#1a1a1a", { roughness: 0.3 });
  for (const side of [-1, 1]) {
    const eye = sphere(0.07, eyeMat, 12);
    eye.position.set(-2.15, 0.12, side * 0.3);
    bake(eye);
    g.add(eye);
    deformables.push(eye);
    for (let k = 0; k < 6; k++) {
      const gill = ellipsoid(0.05, 0.14, 0.03, std("#c94a3a", { emissive: "#7a2010", emissiveIntensity: 0.4 }), 10);
      gill.position.set(-1.9 + k * 0.17, -0.1, side * 0.4);
      bake(gill);
      g.add(gill);
      deformables.push(gill);
    }
  }

  const swim = new SwimDeformer(deformables, { amp: 0.22, k: 1.6, speed: 5.5, headX: -2.6, tailX: 2.6 });
  return {
    group: g,
    lift: 1.7,
    focus: V3(0, 0, 0),
    distance: 7.6,
    update(t) {
      swim.update(t);
      g.position.y = 1.7 + Math.sin(t * 1.3) * 0.12;
      g.rotation.y = Math.sin(t * 0.3) * 0.15 - 0.2;
    },
    dispose: () => disposeGroup(g),
  };
}

/** 6. 初始全颌鱼：带头甲的有颌鱼，下颌可开合 */
export function buildJawedFish(): StageModel {
  const g = new THREE.Group();
  const bodyMat = std("#6f8fb8", { roughness: 0.55 });
  const bellyMat = std("#c8d6e6", { roughness: 0.6 });
  const armorMat = std("#4d5f78", { roughness: 0.4, metalness: 0.15 });
  const finMat = std("#7f9dc0", { roughness: 0.6, side: THREE.DoubleSide });

  const body = lathe(
    [
      [0.02, -2.4],
      [0.45, -2.0],
      [0.62, -1.2],
      [0.6, -0.2],
      [0.5, 0.7],
      [0.32, 1.5],
      [0.16, 2.1],
      [0.03, 2.5],
    ],
    bodyMat,
    30,
  );
  body.scale.set(1, 1.05, 0.72);
  bake(body);
  g.add(body);
  const belly = lathe(
    [
      [0.02, -2.0],
      [0.4, -1.5],
      [0.44, -0.3],
      [0.3, 0.8],
      [0.05, 1.5],
    ],
    bellyMat,
    24,
  );
  belly.scale.set(1, 0.7, 0.55);
  belly.position.y = -0.3;
  bake(belly);
  g.add(belly);

  const deformables: THREE.Mesh[] = [body, belly];

  // 头甲：几块板
  const plates: Array<[number, number, number, number, number, number]> = [
    [-1.55, 0.35, 0, 1.0, 0.25, 0.9],
    [-1.05, 0.55, 0, 0.6, 0.2, 0.7],
    [-1.4, 0.05, 0.42, 0.9, 0.35, 0.16],
    [-1.4, 0.05, -0.42, 0.9, 0.35, 0.16],
  ];
  for (const [x, y, z, sx, sy, sz] of plates) {
    const p = new THREE.Mesh(new THREE.BoxGeometry(sx, sy, sz, 2, 2, 2), armorMat);
    p.position.set(x, y, z);
    p.castShadow = true;
    bake(p);
    g.add(p);
    deformables.push(p);
  }
  // 眼睛与眶环
  for (const side of [-1, 1]) {
    const orbit = new THREE.Mesh(new THREE.TorusGeometry(0.16, 0.035, 8, 20), armorMat);
    orbit.position.set(-1.7, 0.2, side * 0.45);
    orbit.rotation.y = Math.PI / 2;
    bake(orbit);
    const eye = sphere(0.12, std("#101418", { roughness: 0.2 }), 14);
    eye.position.set(-1.7, 0.2, side * 0.44);
    bake(eye);
    g.add(orbit, eye);
    deformables.push(orbit, eye);
  }
  // 上颌（固定）与下颌（可动，不参与游泳变形）
  const upperJaw = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.16, 0.5), std("#9fb3cc"));
  upperJaw.position.set(-2.1, -0.08, 0);
  bake(upperJaw);
  g.add(upperJaw);
  const jaw = new THREE.Group();
  const lower = new THREE.Mesh(new THREE.BoxGeometry(0.72, 0.14, 0.44), std("#95a8c2"));
  lower.position.set(-0.36, -0.07, 0);
  lower.castShadow = true;
  jaw.add(lower);
  // 牙板
  for (let i = 0; i < 5; i++) {
    const tooth = new THREE.Mesh(new THREE.ConeGeometry(0.03, 0.09, 6), std("#eef2f6"));
    tooth.position.set(-0.68 + i * 0.13, 0.02, 0.18);
    jaw.add(tooth);
    const t2 = tooth.clone();
    t2.position.z = -0.18;
    jaw.add(t2);
  }
  jaw.position.set(-1.75, -0.22, 0);
  g.add(jaw);

  // 鳍
  const pectoral = (side: number) => {
    const f = fin(
      [
        [0, 0],
        [0.9, -0.55],
        [1.35, -0.4],
        [1.1, 0.05],
        [0.4, 0.15],
      ],
      0.035,
      finMat,
    );
    f.rotation.set(0, side * 0.6, -0.5);
    f.position.set(-0.85, -0.35, side * 0.5);
    f.rotation.x = side * 0.9;
    bake(f);
    return f;
  };
  const pelvic = (side: number) => {
    const f = fin(
      [
        [0, 0],
        [0.5, -0.35],
        [0.7, -0.25],
        [0.35, 0.05],
      ],
      0.03,
      finMat,
    );
    f.position.set(0.5, -0.4, side * 0.3);
    f.rotation.x = side * 1.1;
    bake(f);
    return f;
  };
  const dorsal = fin(
    [
      [-0.5, 0.55],
      [0.2, 1.05],
      [0.9, 0.9],
      [1.0, 0.45],
    ],
    0.035,
    finMat,
  );
  bake(dorsal);
  const tail = fin(
    [
      [2.0, 0.1],
      [2.9, 0.95],
      [3.2, 0.7],
      [2.6, -0.05],
      [2.9, -0.55],
      [2.6, -0.6],
      [2.0, -0.15],
    ],
    0.035,
    finMat,
  );
  bake(tail);
  const anal = fin(
    [
      [1.1, -0.35],
      [1.5, -0.7],
      [1.8, -0.55],
      [1.7, -0.25],
    ],
    0.03,
    finMat,
  );
  bake(anal);
  const fins = [pectoral(1), pectoral(-1), pelvic(1), pelvic(-1), dorsal, tail, anal];
  fins.forEach((f) => g.add(f));
  deformables.push(...fins);

  const swim = new SwimDeformer(deformables, { amp: 0.28, k: 1.3, speed: 4.2, headX: -2.4, tailX: 3.2 });
  return {
    group: g,
    lift: 1.8,
    focus: V3(0, 0, 0),
    distance: 8.4,
    update(t) {
      swim.update(t);
      jaw.rotation.z = -Math.max(0, Math.sin(t * 1.4)) * 0.45;
      g.position.y = 1.8 + Math.sin(t * 0.9) * 0.1;
      g.rotation.y = -0.25 + Math.sin(t * 0.25) * 0.12;
    },
    dispose: () => disposeGroup(g),
  };
}

/** 7. 提塔利克鱼：扁平头部、可动颈部、带内骨骼的鳍肢 */
export function buildTiktaalik(): StageModel {
  const g = new THREE.Group();
  const rand = rng(77);
  const skinMat = std("#8a9a4a", { roughness: 0.8 });
  const bellyMat = std("#d8d3a0", { roughness: 0.85 });
  const finMat = glassy("#a9b86a", 0.72, { emissive: "#2f3a12", emissiveIntensity: 0.2 });
  const boneMat = std("#f4efdc", { emissive: "#c9bfa0", emissiveIntensity: 0.35 });

  // 身体（背腹扁平）
  const body = lathe(
    [
      [0.05, -1.4],
      [0.6, -1.0],
      [0.72, -0.2],
      [0.66, 0.8],
      [0.5, 1.7],
      [0.28, 2.6],
      [0.05, 3.1],
    ],
    skinMat,
    30,
  );
  body.scale.set(1, 0.62, 1.15);
  bake(body);
  const belly = lathe(
    [
      [0.05, -1.3],
      [0.5, -0.9],
      [0.55, 0.3],
      [0.35, 1.5],
      [0.05, 2.4],
    ],
    bellyMat,
    24,
  );
  belly.scale.set(1, 0.4, 1.0);
  belly.position.y = -0.2;
  bake(belly);
  g.add(body, belly);
  const deformables: THREE.Mesh[] = [body, belly];

  // 鳞片纹理：一排排小凸起
  const scaleGeo = new THREE.SphereGeometry(0.06, 6, 5);
  const scales = new THREE.InstancedMesh(scaleGeo, std("#75843c", { roughness: 0.9 }), 160);
  const dummy = new THREE.Object3D();
  for (let i = 0; i < 160; i++) {
    const x = -0.9 + rand() * 3.4;
    const a = (rand() - 0.5) * Math.PI * 1.2;
    const rY = 0.62 * (0.7 - Math.abs(x - 0.4) * 0.14);
    const rZ = 1.15 * (0.7 - Math.abs(x - 0.4) * 0.14);
    dummy.position.set(x, Math.cos(a) * rY, Math.sin(a) * rZ);
    dummy.scale.set(1, 0.5, 1.4);
    dummy.updateMatrix();
    scales.setMatrixAt(i, dummy.matrix);
  }
  g.add(scales);

  // 扁平的三角形头
  const head = new THREE.Group();
  const skull = ellipsoid(1.05, 0.32, 0.9, skinMat, 32);
  skull.scale.x = 1.15;
  head.add(skull);
  const snout = ellipsoid(0.7, 0.22, 0.65, skinMat, 24);
  snout.position.set(-0.85, -0.05, 0);
  head.add(snout);
  for (const side of [-1, 1]) {
    const eye = sphere(0.14, std("#1c1a12", { roughness: 0.25 }), 14);
    eye.position.set(-0.25, 0.28, side * 0.42);
    head.add(eye);
    const lid = ellipsoid(0.2, 0.08, 0.2, skinMat, 12);
    lid.position.set(-0.25, 0.32, side * 0.42);
    head.add(lid);
    // 呼吸孔
    const spir = sphere(0.06, std("#2a2a1a"), 8);
    spir.position.set(0.15, 0.3, side * 0.32);
    head.add(spir);
  }
  const mouth = new THREE.Mesh(new THREE.TorusGeometry(0.62, 0.03, 6, 30, Math.PI), std("#3a3320"));
  mouth.rotation.set(Math.PI / 2, 0, Math.PI);
  mouth.position.set(-0.9, -0.2, 0);
  head.add(mouth);
  head.position.set(-1.9, 0.05, 0);
  g.add(head);

  // 肋骨（沿躯干的一排环）
  for (let i = 0; i < 9; i++) {
    const rib = new THREE.Mesh(new THREE.TorusGeometry(0.42 - i * 0.02, 0.025, 6, 20, Math.PI * 1.2), boneMat);
    rib.position.set(-0.7 + i * 0.32, 0.05, 0);
    rib.rotation.set(0, Math.PI / 2, -Math.PI * 0.1);
    rib.scale.set(1, 1, 1.4);
    bake(rib);
    g.add(rib);
    deformables.push(rib);
  }

  // 鳍肢：半透明鳍 + 内部骨骼（肱骨-桡尺-腕骨-鳍条）
  const limb = (x: number, side: number, front: boolean) => {
    const L = new THREE.Group();
    const scale = front ? 1 : 0.75;
    const humerus = capsule(0.09 * scale, 0.42 * scale, boneMat, 8);
    humerus.rotation.z = Math.PI / 2;
    humerus.position.set(0.25 * scale, 0, 0);
    L.add(humerus);
    for (const off of [-0.09, 0.09]) {
      const bone2 = capsule(0.06 * scale, 0.36 * scale, boneMat, 8);
      bone2.rotation.z = Math.PI / 2;
      bone2.position.set(0.68 * scale, off * scale, 0);
      L.add(bone2);
    }
    for (let k = 0; k < 4; k++) {
      const wrist = sphere(0.06 * scale, boneMat, 8);
      wrist.position.set(0.95 * scale, (k - 1.5) * 0.09 * scale, 0);
      L.add(wrist);
    }
    for (let k = 0; k < 6; k++) {
      const ray = capsule(0.02 * scale, 0.5 * scale, boneMat, 6);
      ray.rotation.z = Math.PI / 2 - (k - 2.5) * 0.18;
      ray.position.set(1.32 * scale, (k - 2.5) * 0.11 * scale, 0);
      L.add(ray);
    }
    const web = fin(
      [
        [0, -0.25],
        [1.0, -0.42],
        [1.65, -0.25],
        [1.75, 0.1],
        [1.3, 0.4],
        [0.5, 0.35],
        [0, 0.25],
      ],
      0.06,
      finMat,
    );
    web.scale.setScalar(scale);
    L.add(web);
    L.position.set(x, -0.28, side * 0.9);
    // 鳍肢局部 +x 指向外侧：右侧(side=1)绕 y 转 -π/2.4，左侧镜像；再稍向下撑地
    L.rotation.set(0, side > 0 ? -Math.PI / 2.4 : Math.PI / 2.4, front ? -0.4 : -0.3);
    return L;
  };
  const limbs = [limb(-1.05, 1, true), limb(-1.05, -1, true), limb(1.15, 1, false), limb(1.15, -1, false)];
  limbs.forEach((l) => g.add(l));

  // 尾鳍：上下鳍褶
  const tailFin = fin(
    [
      [1.7, 0.25],
      [2.6, 0.55],
      [3.25, 0.35],
      [3.25, -0.3],
      [2.6, -0.5],
      [1.7, -0.25],
    ],
    0.05,
    finMat,
  );
  bake(tailFin);
  g.add(tailFin);
  deformables.push(tailFin);

  const swim = new SwimDeformer(deformables, { amp: 0.14, k: 1.1, speed: 2.2, headX: -1.4, tailX: 3.3 });
  return {
    group: g,
    lift: 0.62,
    focus: V3(0, 0, 0),
    distance: 8.6,
    update(t) {
      swim.update(t);
      head.rotation.y = Math.sin(t * 0.7) * 0.18; // 可以转动的脖子
      head.rotation.z = Math.max(0, Math.sin(t * 0.5)) * 0.15;
      limbs[0].rotation.z = -0.4 + Math.sin(t * 2.2) * 0.08;
      limbs[1].rotation.z = -0.4 + Math.sin(t * 2.2 + Math.PI) * 0.08;
    },
    dispose: () => disposeGroup(g),
  };
}

