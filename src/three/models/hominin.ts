import * as THREE from "three";
import { StageModel, V3, std, sphere, ellipsoid, capsule, bone, cylinder, disposeGroup, rng } from "../util";

export interface HomininParams {
  /** 整体缩放，1 ≈ 现代人 1.7 m */
  scale: number;
  legLen: number;
  armLen: number;
  shoulderW: number;
  hipW: number;
  headR: number;
  /** 0 = 低平颅顶，1 = 高圆颅顶 */
  cranium: number;
  brow: number;
  /** 面部前突 */
  prognathism: number;
  chin: number;
  /** 躯干前倾（弧度） */
  lean: number;
  kneeBend: number;
  /** 0 = 裸露皮肤，1 = 全身毛发 */
  fur: number;
  skin: string;
  furColor: string;
  hair: "none" | "cap";
  tool: "none" | "stone" | "handaxe" | "spear";
  divergentToe: boolean;
  clothing: boolean;
}

export const homininPresets: Record<string, HomininParams> = {
  ardipithecus: {
    scale: 0.74, legLen: 0.82, armLen: 1.28, shoulderW: 0.4, hipW: 0.36, headR: 0.36,
    cranium: 0.08, brow: 0.55, prognathism: 0.85, chin: 0, lean: 0.16, kneeBend: 0.18,
    fur: 0.95, skin: "#5a3a2a", furColor: "#3f2a1c", hair: "none", tool: "none", divergentToe: true, clothing: false,
  },
  australopithecus: {
    scale: 0.68, legLen: 0.88, armLen: 1.18, shoulderW: 0.4, hipW: 0.35, headR: 0.36,
    cranium: 0.15, brow: 0.6, prognathism: 0.78, chin: 0, lean: 0.06, kneeBend: 0.06,
    fur: 0.9, skin: "#5c3d2c", furColor: "#4a3222", hair: "none", tool: "none", divergentToe: false, clothing: false,
  },
  habilis: {
    scale: 0.76, legLen: 0.92, armLen: 1.1, shoulderW: 0.41, hipW: 0.32, headR: 0.38,
    cranium: 0.32, brow: 0.6, prognathism: 0.6, chin: 0, lean: 0.03, kneeBend: 0.03,
    fur: 0.75, skin: "#5a3a2a", furColor: "#4a3020", hair: "none", tool: "stone", divergentToe: false, clothing: false,
  },
  erectus: {
    scale: 0.98, legLen: 1.0, armLen: 1.0, shoulderW: 0.44, hipW: 0.28, headR: 0.4,
    cranium: 0.55, brow: 0.95, prognathism: 0.35, chin: 0.15, lean: 0.0, kneeBend: 0.0,
    fur: 0.15, skin: "#5b3b28", furColor: "#3a2618", hair: "cap", tool: "handaxe", divergentToe: false, clothing: false,
  },
  sapiens: {
    scale: 1.0, legLen: 1.03, armLen: 0.97, shoulderW: 0.44, hipW: 0.27, headR: 0.42,
    cranium: 1.0, brow: 0.12, prognathism: 0.05, chin: 1, lean: 0.0, kneeBend: 0.0,
    fur: 0, skin: "#8a5a3c", furColor: "#2a1a10", hair: "cap", tool: "spear", divergentToe: false, clothing: true,
  },
};

function furOn(target: THREE.Object3D, rx: number, ry: number, rz: number, count: number, color: string, seed: number, len: number, offset = V3()) {
  const rand = rng(seed);
  const geo = new THREE.ConeGeometry(0.014, len, 4);
  geo.translate(0, len / 2, 0);
  const inst = new THREE.InstancedMesh(geo, std(color, { roughness: 1 }), count);
  const d = new THREE.Object3D();
  const up = V3(0, 1, 0);
  for (let i = 0; i < count; i++) {
    const u = rand() * Math.PI * 2;
    const v = Math.acos(2 * rand() - 1);
    const n = V3(Math.sin(v) * Math.cos(u), Math.cos(v), Math.sin(v) * Math.sin(u));
    d.position.set(n.x * rx, n.y * ry, n.z * rz).add(offset);
    const dir = n.clone().add(V3((rand() - 0.5) * 0.5, -0.5, (rand() - 0.5) * 0.5)).normalize();
    d.quaternion.setFromUnitVectors(up, dir);
    d.scale.setScalar(0.7 + rand() * 0.6);
    d.updateMatrix();
    inst.setMatrixAt(i, d.matrix);
  }
  target.add(inst);
  return inst;
}

export function buildHominin(p: HomininParams): StageModel {
  const g = new THREE.Group();
  const s = p.scale;
  const skinMat = std(p.skin, { roughness: 0.85 });
  const limbMat = std(p.fur > 0.5 ? p.furColor : p.skin, { roughness: 0.9 });
  const darkMat = std("#1a1410", { roughness: 0.4 });

  const body = new THREE.Group();

  // ---------- 躯干 ----------
  const torso = new THREE.Group();
  const pelvis = ellipsoid(p.hipW * 1.15, 0.26, 0.24, skinMat, 20);
  torso.add(pelvis);
  const abdomen = ellipsoid((p.hipW + p.shoulderW) * 0.55, 0.42, 0.27, skinMat, 22);
  abdomen.position.y = 0.42;
  torso.add(abdomen);
  const chest = ellipsoid(p.shoulderW, 0.6, 0.31, skinMat, 24);
  chest.position.y = 0.92;
  torso.add(chest);
  if (p.fur > 0.05) {
    const count = Math.round(1400 * p.fur);
    furOn(torso, p.shoulderW, 0.6, 0.31, Math.round(count * 0.5), p.furColor, 61, 0.14, V3(0, 0.92, 0));
    furOn(torso, (p.hipW + p.shoulderW) * 0.55, 0.42, 0.27, Math.round(count * 0.35), p.furColor, 62, 0.14, V3(0, 0.42, 0));
    furOn(torso, p.hipW * 1.15, 0.26, 0.24, Math.round(count * 0.15), p.furColor, 63, 0.13);
  }
  // 兽皮衣物
  if (p.clothing) {
    const hideMat = std("#a9865a", { roughness: 1 });
    const skirt = new THREE.Mesh(new THREE.CylinderGeometry(p.hipW * 1.25, p.hipW * 1.4, 0.55, 18, 1, true), hideMat);
    skirt.material.side = THREE.DoubleSide;
    skirt.position.y = -0.1;
    torso.add(skirt);
    const strap = new THREE.Mesh(new THREE.TorusGeometry(0.5, 0.06, 8, 30, Math.PI * 1.1), hideMat);
    strap.position.set(0, 0.95, 0);
    strap.rotation.set(0, 0.2, Math.PI * 0.6);
    torso.add(strap);
  }
  torso.rotation.x = p.lean;
  body.add(torso);

  // ---------- 头 ----------
  const R = p.headR;
  const neckTop = V3(0, 1.45, 0);
  const neck = capsule(0.11, 0.2, skinMat, 10);
  neck.position.set(0, 1.4, 0.02);
  torso.add(neck);
  const head = new THREE.Group();
  const craniumMesh = sphere(R, skinMat, 32);
  craniumMesh.scale.set(1, 0.86 + p.cranium * 0.28, 1.02 + (1 - p.cranium) * 0.12);
  craniumMesh.position.set(0, R * (0.02 + p.cranium * 0.16), -R * (0.22 - p.cranium * 0.2));
  head.add(craniumMesh);
  // 面部
  const face = ellipsoid(R * 0.72, R * 0.62, R * 0.45, skinMat, 20);
  face.position.set(0, -R * 0.28, R * 0.42);
  head.add(face);
  // 前突的口鼻部
  const muzzle = ellipsoid(R * 0.48, R * 0.36, R * (0.32 + p.prognathism * 0.36), skinMat, 18);
  muzzle.position.set(0, -R * 0.42, R * (0.55 + p.prognathism * 0.32));
  head.add(muzzle);
  // 眉脊
  const brow = ellipsoid(R * 0.78, R * (0.06 + p.brow * 0.12), R * 0.22, skinMat, 14);
  brow.position.set(0, R * 0.08, R * (0.78 + p.prognathism * 0.05));
  head.add(brow);
  // 眼睛
  for (const side of [-1, 1]) {
    const socket = sphere(R * 0.15, darkMat, 12);
    socket.position.set(side * R * 0.3, -R * 0.06, R * (0.8 + p.prognathism * 0.03));
    head.add(socket);
    const white = sphere(R * 0.09, std("#f1e9dc", { roughness: 0.3 }), 10);
    white.position.set(side * R * 0.3, -R * 0.06, R * (0.9 + p.prognathism * 0.03));
    head.add(white);
    const pupil = sphere(R * 0.045, darkMat, 8);
    pupil.position.set(side * R * 0.3, -R * 0.06, R * (0.98 + p.prognathism * 0.03));
    head.add(pupil);
    const ear = ellipsoid(R * 0.08, R * 0.16, R * 0.1, skinMat, 10);
    ear.position.set(side * R * 0.98, -R * 0.05, 0);
    head.add(ear);
  }
  // 鼻
  const nose = ellipsoid(R * 0.14, R * 0.2, R * (0.14 + (1 - p.prognathism) * 0.1), skinMat, 10);
  nose.position.set(0, -R * 0.3, R * (0.86 + p.prognathism * 0.32));
  head.add(nose);
  // 下巴
  if (p.chin > 0.05) {
    const chin = ellipsoid(R * 0.26, R * 0.16, R * 0.16 * p.chin, skinMat, 10);
    chin.position.set(0, -R * 0.78, R * 0.66);
    head.add(chin);
  }
  // 头发 / 头部毛
  if (p.hair === "cap") {
    const hairMat = std("#1f1610", { roughness: 1 });
    const cap = new THREE.Mesh(new THREE.SphereGeometry(R * 1.05, 28, 16, 0, Math.PI * 2, 0, Math.PI * 0.6), hairMat);
    cap.scale.copy(craniumMesh.scale);
    cap.position.copy(craniumMesh.position);
    cap.rotation.x = -0.15;
    head.add(cap);
  } else if (p.fur > 0.05) {
    furOn(head, R, R * (0.86 + p.cranium * 0.28), R * 1.05, Math.round(320 * p.fur), p.furColor, 64, 0.11, craniumMesh.position);
  }
  head.position.copy(neckTop).add(V3(0, R * 0.55, 0.05));
  head.rotation.x = -p.lean * 0.7;
  torso.add(head);

  // ---------- 手臂 ----------
  const upperArm = 0.7 * p.armLen;
  const foreArm = 0.66 * p.armLen;
  const arms: THREE.Group[] = [];
  const makeArm = (side: number, holding: boolean) => {
    const A = new THREE.Group();
    const sh = V3(side * (p.shoulderW + 0.05), 1.3, 0);
    // 持物的手臂：前臂抬起
    const el = holding
      ? sh.clone().add(V3(side * 0.12, -upperArm * 0.9, 0.35 * upperArm))
      : sh.clone().add(V3(side * 0.16, -upperArm * 0.98, 0.05));
    const wr = holding
      ? el.clone().add(V3(-side * 0.08, foreArm * 0.35, foreArm * 0.85))
      : el.clone().add(V3(side * 0.05, -foreArm * 0.98, 0.1));
    A.add(bone(sh, el, 0.11, limbMat), bone(el, wr, 0.09, limbMat));
    const shoulder = sphere(0.14, limbMat, 12);
    shoulder.position.copy(sh);
    A.add(shoulder);
    const elbow = sphere(0.1, limbMat, 10);
    elbow.position.copy(el);
    A.add(elbow);
    // 手
    const hand = new THREE.Group();
    const palm = ellipsoid(0.09, 0.13, 0.05, skinMat, 10);
    hand.add(palm);
    for (let k = 0; k < 5; k++) {
      const isThumb = k === 0;
      const dir = isThumb ? V3(-side * 0.11, -0.05, 0.06) : V3((k - 2.5) * 0.035, -0.19, 0);
      hand.add(bone(V3(0, isThumb ? -0.02 : -0.1, 0), V3(0, isThumb ? -0.02 : -0.1, 0).add(dir), 0.02, skinMat));
    }
    hand.position.copy(wr);
    hand.lookAt(wr.clone().add(new THREE.Vector3().subVectors(wr, el)));
    if (holding) hand.rotation.z += Math.PI / 2;
    A.add(hand);
    A.userData.wrist = wr;
    A.userData.holding = holding;
    arms.push(A);
    return A;
  };
  const rightHolds = p.tool !== "none";
  const leftHolds = p.tool === "stone";
  torso.add(makeArm(1, rightHolds), makeArm(-1, leftHolds));

  // ---------- 工具 ----------
  const toolGroup = new THREE.Group();
  const stoneMat = std("#8d867a", { roughness: 0.75 });
  if (p.tool === "spear") {
    const wr = arms[0].userData.wrist as THREE.Vector3;
    const shaft = cylinder(0.025, 0.03, 3.6, std("#6b4d2e", { roughness: 0.9 }), 8);
    shaft.position.set(wr.x + 0.05, wr.y + 0.4, wr.z + 0.15);
    const tip = new THREE.Mesh(new THREE.ConeGeometry(0.06, 0.4, 5), stoneMat);
    tip.position.set(shaft.position.x, shaft.position.y + 1.95, shaft.position.z);
    toolGroup.add(shaft, tip);
  } else if (p.tool === "handaxe") {
    const wr = arms[0].userData.wrist as THREE.Vector3;
    const axe = new THREE.Mesh(new THREE.LatheGeometry([new THREE.Vector2(0.001, -0.3), new THREE.Vector2(0.14, -0.15), new THREE.Vector2(0.17, 0.05), new THREE.Vector2(0.09, 0.28), new THREE.Vector2(0.001, 0.4)], 10), stoneMat);
    axe.scale.set(1, 1, 0.42);
    axe.position.set(wr.x - 0.05, wr.y + 0.05, wr.z + 0.16);
    axe.rotation.set(0.3, 0.2, 0.15);
    axe.castShadow = true;
    toolGroup.add(axe);
  } else if (p.tool === "stone") {
    const wrR = arms[0].userData.wrist as THREE.Vector3;
    const wrL = arms[1].userData.wrist as THREE.Vector3;
    const hammer = sphere(0.11, stoneMat, 10);
    hammer.scale.set(1, 0.85, 1);
    hammer.position.set(wrR.x - 0.02, wrR.y - 0.02, wrR.z + 0.14);
    const core = new THREE.Mesh(new THREE.IcosahedronGeometry(0.16, 0), std("#6f6a60", { roughness: 0.7, flatShading: true }));
    core.scale.set(1, 0.7, 1);
    core.position.set(wrL.x + 0.02, wrL.y - 0.02, wrL.z + 0.14);
    toolGroup.add(hammer, core);
  }
  torso.add(toolGroup);

  // ---------- 腿 ----------
  const thigh = 0.92 * p.legLen;
  const shin = 0.86 * p.legLen;
  const legs: THREE.Group[] = [];
  const makeLeg = (side: number) => {
    const L = new THREE.Group();
    const hip = V3(side * p.hipW * 0.75, -0.12, 0);
    const knee = hip.clone().add(V3(-side * p.hipW * 0.25 * (1 - p.kneeBend), -thigh * Math.cos(p.kneeBend), thigh * Math.sin(p.kneeBend) * 1.4));
    const ankle = knee.clone().add(V3(0, -shin * Math.cos(p.kneeBend * 0.6), -shin * Math.sin(p.kneeBend * 0.6) * 0.8));
    L.add(bone(hip, knee, 0.15, limbMat), bone(knee, ankle, 0.11, limbMat));
    const kneeCap = sphere(0.13, limbMat, 10);
    kneeCap.position.copy(knee);
    L.add(kneeCap);
    // 脚
    const foot = new THREE.Group();
    const sole = ellipsoid(0.11, 0.06, 0.24, skinMat, 12);
    sole.position.set(0, -0.06, 0.1);
    foot.add(sole);
    const heel = sphere(0.09, skinMat, 10);
    heel.position.set(0, -0.05, -0.08);
    foot.add(heel);
    for (let k = 0; k < 5; k++) {
      const big = k === 0;
      const base = V3(-side * (0.07 - k * 0.035), -0.08, 0.3);
      const dir = big && p.divergentToe ? V3(-side * 0.16, 0, 0.06) : V3(0, 0, big ? 0.11 : 0.08);
      foot.add(bone(base, base.clone().add(dir), big ? 0.03 : 0.02, skinMat));
    }
    foot.position.copy(ankle);
    L.add(foot);
    L.userData.ankleY = ankle.y - 0.12;
    legs.push(L);
    return L;
  };
  body.add(makeLeg(1), makeLeg(-1));

  const feetY = legs[0].userData.ankleY as number;
  body.scale.setScalar(s);
  g.add(body);

  // 一块石头供能人打制（放在脚边）
  if (p.tool === "stone") {
    const flakes = new THREE.Group();
    const rand = rng(9);
    for (let i = 0; i < 6; i++) {
      const f = new THREE.Mesh(new THREE.TetrahedronGeometry(0.06 + rand() * 0.05, 0), std("#8d867a", { flatShading: true }));
      f.position.set(0.3 + rand() * 0.6, feetY * s + 0.03, 0.4 + rand() * 0.5);
      f.rotation.set(rand() * 3, rand() * 3, 0);
      flakes.add(f);
    }
    g.add(flakes);
  }

  const lift = -feetY * s;
  const total = (2.05 + R * 1.3) * s;
  return {
    group: g,
    lift,
    focus: V3(0, total * 0.5 - lift * 0.9, 0),
    distance: 6.2 + total * 0.6,
    update(t) {
      chest.scale.y = 0.6 * (1 + Math.sin(t * 1.6) * 0.02);
      body.rotation.y = Math.sin(t * 0.35) * 0.08;
      head.rotation.y = Math.sin(t * 0.55) * 0.22;
      head.rotation.x = -p.lean * 0.7 + Math.sin(t * 1.1) * 0.03;
      arms.forEach((a, i) => {
        if (!a.userData.holding) a.rotation.x = Math.sin(t * 1.2 + i) * 0.04;
      });
    },
    dispose: () => disposeGroup(g),
  };
}
