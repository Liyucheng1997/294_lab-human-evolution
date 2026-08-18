import * as THREE from "three";
import { StageModel, V3, std, glassy, sphere, ellipsoid, bone, cone, tube, disposeGroup, rng } from "../util";

/** 在一个椭球体表面撒“绒毛”（细小圆锥），模拟毛发 */
function fur(target: THREE.Group, rx: number, ry: number, rz: number, count: number, color: THREE.ColorRepresentation, seed: number, len = 0.16, offset = V3()) {
  const rand = rng(seed);
  const geo = new THREE.ConeGeometry(0.018, len, 4);
  geo.translate(0, len / 2, 0);
  const inst = new THREE.InstancedMesh(geo, std(color, { roughness: 1 }), count);
  const d = new THREE.Object3D();
  const up = V3(0, 1, 0);
  for (let i = 0; i < count; i++) {
    const u = rand() * Math.PI * 2;
    const v = Math.acos(2 * rand() - 1);
    const n = V3(Math.sin(v) * Math.cos(u), Math.cos(v), Math.sin(v) * Math.sin(u));
    d.position.set(n.x * rx, n.y * ry, n.z * rz).add(offset);
    const dir = n.clone().add(V3((rand() - 0.5) * 0.6, -0.35, (rand() - 0.5) * 0.6)).normalize();
    d.quaternion.setFromUnitVectors(up, dir);
    d.scale.setScalar(0.7 + rand() * 0.6);
    d.updateMatrix();
    inst.setMatrixAt(i, d.matrix);
  }
  inst.castShadow = true;
  target.add(inst);
  return inst;
}

/** 8. 林蜥 + 羊膜卵 */
export function buildHylonomus(): StageModel {
  const g = new THREE.Group();
  const skin = std("#7a8f3e", { roughness: 0.75 });
  const belly = std("#c9c98a", { roughness: 0.8 });
  const dark = std("#4e5e2a", { roughness: 0.8 });

  const lizard = new THREE.Group();
  const body = ellipsoid(1.15, 0.36, 0.42, skin, 28);
  lizard.add(body);
  const bellyM = ellipsoid(1.0, 0.24, 0.36, belly, 24);
  bellyM.position.y = -0.14;
  lizard.add(bellyM);
  // 背部鳞片条纹
  for (let i = 0; i < 12; i++) {
    const s = ellipsoid(0.08, 0.05, 0.28, dark, 10);
    s.position.set(-0.95 + i * 0.17, 0.3, 0);
    lizard.add(s);
  }
  // 头
  const head = new THREE.Group();
  const skull = ellipsoid(0.5, 0.28, 0.32, skin, 24);
  head.add(skull);
  const snout = ellipsoid(0.36, 0.18, 0.22, skin, 16);
  snout.position.set(-0.4, -0.04, 0);
  head.add(snout);
  for (const side of [-1, 1]) {
    const eye = sphere(0.09, std("#141a0c", { roughness: 0.2 }), 12);
    eye.position.set(-0.12, 0.13, side * 0.26);
    head.add(eye);
    const nostril = sphere(0.025, dark, 6);
    nostril.position.set(-0.72, 0.05, side * 0.08);
    head.add(nostril);
  }
  head.position.set(-1.35, 0.1, 0);
  lizard.add(head);
  // 尾巴
  const tailPts = Array.from({ length: 8 }, (_, i) => {
    const s = i / 7;
    return V3(1.0 + s * 2.4, -0.05 - s * 0.1, Math.sin(s * 2.4) * 0.6);
  });
  const tail = new THREE.Group();
  const tailMesh = new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(tailPts), 40, 0.16, 10), skin);
  // 让尾巴逐渐变细：缩放顶点
  {
    const pos = tailMesh.geometry.attributes.position as THREE.BufferAttribute;
    const curve = new THREE.CatmullRomCurve3(tailPts);
    const pt = new THREE.Vector3();
    for (let i = 0; i < pos.count; i++) {
      const seg = Math.floor(i / 11); // 每环 11 个顶点(radialSegments 10 + 1)
      const s = Math.min(1, seg / 40);
      curve.getPoint(s, pt);
      const x = pos.getX(i), y = pos.getY(i), z = pos.getZ(i);
      const k = 1 - s * 0.85;
      pos.setXYZ(i, pt.x + (x - pt.x) * k, pt.y + (y - pt.y) * k, pt.z + (z - pt.z) * k);
    }
    pos.needsUpdate = true;
    tailMesh.geometry.computeVertexNormals();
  }
  tailMesh.castShadow = true;
  tail.add(tailMesh);
  lizard.add(tail);
  // 四条侧伸的腿
  const legs: THREE.Group[] = [];
  const leg = (x: number, side: number, front: boolean) => {
    const L = new THREE.Group();
    const hip = V3(0, 0, 0);
    const knee = V3(front ? -0.15 : 0.15, 0.05, side * 0.55);
    const foot = V3(front ? -0.25 : 0.3, -0.5, side * 0.62);
    L.add(bone(hip, knee, 0.09, skin), bone(knee, foot, 0.07, skin));
    // 脚趾
    for (let k = 0; k < 5; k++) {
      const a = (k - 2) * 0.32;
      const toe = bone(foot, foot.clone().add(V3(Math.cos(a) * -0.22 * (front ? 1 : -1), -0.02, Math.sin(a) * 0.15 * side)), 0.025, dark);
      L.add(toe);
    }
    L.position.set(x, -0.15, side * 0.28);
    return L;
  };
  legs.push(leg(-0.7, 1, true), leg(-0.7, -1, true), leg(0.75, 1, false), leg(0.75, -1, false));
  legs.forEach((l) => lizard.add(l));
  lizard.position.y = 0.55;
  lizard.rotation.y = 0.35;
  g.add(lizard);

  // 羊膜卵：半透明蛋壳里的胚胎
  const eggs = new THREE.Group();
  const makeEgg = (x: number, z: number, rot: number, showInside: boolean) => {
    const e = new THREE.Group();
    const shell = ellipsoid(0.34, 0.46, 0.34, showInside ? glassy("#f4e9c8", 0.42, { emissive: "#6b5a30", emissiveIntensity: 0.15 }) : std("#efe4c4", { roughness: 0.6 }), 28);
    shell.renderOrder = 4;
    e.add(shell);
    if (showInside) {
      // 羊膜囊
      const amnion = sphere(0.2, glassy("#bfe6ff", 0.35), 20);
      amnion.position.set(0, 0.06, 0);
      e.add(amnion);
      // 蜷缩的胚胎
      const emb = new THREE.Group();
      const embBody = tube([V3(-0.1, 0.02, 0), V3(0.02, 0.1, 0.02), V3(0.12, 0.02, 0), V3(0.05, -0.08, -0.03)], 0.045, std("#e08a80", { emissive: "#7a3030", emissiveIntensity: 0.3 }), 24);
      emb.add(embBody);
      const embHead = sphere(0.075, std("#e89a90", { emissive: "#7a3030", emissiveIntensity: 0.3 }), 14);
      embHead.position.set(-0.12, 0.05, 0);
      emb.add(embHead);
      emb.position.set(0, 0.07, 0);
      e.add(emb);
      // 卵黄囊
      const yolk = sphere(0.13, glassy("#ffcf5a", 0.8, { emissive: "#a67c1a", emissiveIntensity: 0.4 }), 18);
      yolk.position.set(0.02, -0.2, 0.02);
      e.add(yolk);
      // 尿囊
      const allantois = sphere(0.09, glassy("#c9a7ff", 0.6), 14);
      allantois.position.set(-0.16, -0.14, -0.05);
      e.add(allantois);
    }
    e.position.set(x, 0.46, z);
    e.rotation.z = rot;
    return e;
  };
  eggs.add(makeEgg(1.9, 0.6, 0.15, true), makeEgg(2.45, 0.95, -0.2, false), makeEgg(2.35, 0.2, 0.3, false));
  g.add(eggs);
  // 落叶层
  const litter = std("#5c4a2c", { roughness: 1 });
  const rand = rng(5);
  for (let i = 0; i < 18; i++) {
    const leaf = ellipsoid(0.25 + rand() * 0.2, 0.02, 0.09 + rand() * 0.06, litter, 8);
    leaf.position.set((rand() - 0.5) * 6, 0.02, (rand() - 0.5) * 4);
    leaf.rotation.y = rand() * Math.PI;
    g.add(leaf);
  }

  return {
    group: g,
    lift: 0,
    focus: V3(0.4, 0.5, 0),
    distance: 7.4,
    update(t) {
      head.rotation.y = Math.sin(t * 0.8) * 0.25;
      head.rotation.z = Math.sin(t * 1.7) * 0.05;
      tail.rotation.y = Math.sin(t * 1.1) * 0.12;
      lizard.position.y = 0.55 + Math.sin(t * 2.5) * 0.015; // 呼吸
    },
    dispose: () => disposeGroup(g),
  };
}

/** 9. 摩尔根兽：毛茸茸的夜行小兽 */
export function buildMorganucodon(): StageModel {
  const g = new THREE.Group();
  const furColor = "#7d5a3c";
  const skin = std("#6b4a30", { roughness: 0.9 });
  const pale = std("#b08a68", { roughness: 0.9 });
  const beast = new THREE.Group();

  const body = ellipsoid(1.05, 0.55, 0.55, skin, 28);
  beast.add(body);
  fur(beast, 1.05, 0.55, 0.55, 700, furColor, 21, 0.18);
  const bellyM = ellipsoid(0.85, 0.35, 0.45, pale, 20);
  bellyM.position.y = -0.22;
  beast.add(bellyM);

  const head = new THREE.Group();
  const skull = ellipsoid(0.55, 0.42, 0.42, skin, 24);
  head.add(skull);
  fur(head, 0.55, 0.42, 0.42, 260, furColor, 22, 0.14);
  const snout = cone(0.26, 0.75, skin, 14);
  snout.rotation.z = Math.PI / 2;
  snout.position.set(-0.6, -0.08, 0);
  head.add(snout);
  const nose = sphere(0.07, std("#2a1a12", { roughness: 0.3 }), 10);
  nose.position.set(-0.98, -0.06, 0);
  head.add(nose);
  for (const side of [-1, 1]) {
    const eye = sphere(0.11, std("#0e0c0a", { roughness: 0.15 }), 14);
    eye.position.set(-0.28, 0.12, side * 0.3);
    head.add(eye);
    const glint = sphere(0.03, std("#ffffff", { emissive: "#ffffff", emissiveIntensity: 1 }), 6);
    glint.position.set(-0.36, 0.16, side * 0.32);
    head.add(glint);
    const ear = ellipsoid(0.12, 0.16, 0.05, pale, 12);
    ear.position.set(0.1, 0.4, side * 0.3);
    ear.rotation.x = side * 0.5;
    head.add(ear);
    // 胡须
    for (let k = 0; k < 4; k++) {
      const w = bone(V3(-0.75, -0.06, side * 0.16), V3(-0.85 - k * 0.05, -0.15 + k * 0.1, side * (0.55 + k * 0.05)), 0.006, std("#e8e0d0"));
      head.add(w);
    }
  }
  head.position.set(-1.05, 0.15, 0);
  beast.add(head);

  // 四肢
  const leg = (x: number, side: number, front: boolean) => {
    const L = new THREE.Group();
    const knee = V3(front ? 0.1 : -0.15, -0.35, side * 0.12);
    const foot = V3(front ? -0.05 : 0.15, -0.72, side * 0.14);
    L.add(bone(V3(), knee, 0.09, skin), bone(knee, foot, 0.06, skin));
    for (let k = 0; k < 4; k++) {
      L.add(bone(foot, foot.clone().add(V3(-0.16, -0.02, (k - 1.5) * 0.06)), 0.02, pale));
    }
    L.position.set(x, -0.25, side * 0.36);
    return L;
  };
  [leg(-0.6, 1, true), leg(-0.6, -1, true), leg(0.7, 1, false), leg(0.7, -1, false)].forEach((l) => beast.add(l));
  // 尾巴
  const tail = new THREE.Group();
  const tailPts = Array.from({ length: 6 }, (_, i) => {
    const s = i / 5;
    return V3(0.9 + s * 1.6, -0.1 + Math.sin(s * 2) * 0.35, Math.sin(s * 1.5) * 0.4);
  });
  const tailMesh = tube(tailPts, 0.07, skin, 40);
  tail.add(tailMesh);
  beast.add(tail);
  beast.position.y = 0.95;
  beast.rotation.y = 0.4;
  g.add(beast);

  // 猎物：一只甲虫
  const beetle = new THREE.Group();
  beetle.add(ellipsoid(0.16, 0.08, 0.11, std("#2b2b1e", { roughness: 0.3, metalness: 0.4 }), 12));
  const bh = sphere(0.06, std("#1a1a12"), 8);
  bh.position.x = -0.18;
  beetle.add(bh);
  for (let k = 0; k < 3; k++) for (const s of [-1, 1]) beetle.add(bone(V3(-0.1 + k * 0.1, 0, s * 0.08), V3(-0.14 + k * 0.12, -0.08, s * 0.2), 0.012, std("#1a1a12")));
  beetle.position.set(-2.4, 0.08, 0.5);
  g.add(beetle);

  return {
    group: g,
    lift: 0,
    focus: V3(0, 0.7, 0),
    distance: 6.4,
    update(t) {
      head.rotation.y = Math.sin(t * 1.3) * 0.2;
      head.rotation.x = Math.sin(t * 2.7) * 0.05;
      head.position.y = 0.15 + Math.sin(t * 5) * 0.01;
      tail.rotation.y = Math.sin(t * 1.5) * 0.15;
      beast.position.y = 0.95 + Math.sin(t * 4) * 0.012;
      beetle.position.x = -2.4 + Math.sin(t * 0.6) * 0.3;
    },
    dispose: () => disposeGroup(g),
  };
}

/** 10. 阿喀琉斯基猴：树枝上的小型灵长类 */
export function buildArchicebus(): StageModel {
  const g = new THREE.Group();
  const furColor = "#8b6a3e";
  const skin = std("#6f5230", { roughness: 0.9 });
  const pale = std("#c8a883", { roughness: 0.9 });
  const barkMat = std("#5a4530", { roughness: 1 });
  const leafMat = std("#4f8a3a", { roughness: 0.8, side: THREE.DoubleSide });

  // 树枝
  const branchPts = [V3(-4, -0.9, 0.6), V3(-2, -0.4, 0.2), V3(0, -0.2, 0), V3(2, -0.1, -0.3), V3(4.2, 0.35, -0.6)];
  g.add(tube(branchPts, 0.22, barkMat, 60));
  const twig = tube([V3(1.2, -0.15, -0.15), V3(1.8, 0.7, 0.4), V3(2.2, 1.6, 0.9)], 0.06, barkMat, 20);
  g.add(twig);
  const rand = rng(31);
  for (let i = 0; i < 26; i++) {
    const s = rand();
    const p = new THREE.CatmullRomCurve3(branchPts).getPoint(s);
    const leaf = ellipsoid(0.42, 0.02, 0.16, leafMat, 10);
    leaf.position.copy(p).add(V3((rand() - 0.5) * 0.4, 0.15 + rand() * 0.6, (rand() - 0.5) * 0.9));
    leaf.rotation.set((rand() - 0.5) * 0.8, rand() * Math.PI, (rand() - 0.5) * 0.6);
    g.add(leaf);
  }
  for (let i = 0; i < 8; i++) {
    const p = new THREE.CatmullRomCurve3([V3(1.2, -0.15, -0.15), V3(1.8, 0.7, 0.4), V3(2.2, 1.6, 0.9)]).getPoint(0.3 + i * 0.09);
    const leaf = ellipsoid(0.34, 0.02, 0.13, leafMat, 10);
    leaf.position.copy(p).add(V3((rand() - 0.5) * 0.3, 0.05, (rand() - 0.5) * 0.3));
    leaf.rotation.set((rand() - 0.5) * 0.8, rand() * Math.PI, (rand() - 0.5) * 0.6);
    g.add(leaf);
  }

  // 小猴：蹲坐在树枝上，面朝观众略偏
  const monkey = new THREE.Group();
  const torso = ellipsoid(0.55, 0.75, 0.5, skin, 24);
  torso.position.y = 0.75;
  monkey.add(torso);
  fur(monkey, 0.55, 0.75, 0.5, 520, furColor, 41, 0.15, V3(0, 0.75, 0));
  const chest = ellipsoid(0.38, 0.5, 0.3, pale, 16);
  chest.position.set(0, 0.6, 0.28);
  monkey.add(chest);

  const head = new THREE.Group();
  const skull = sphere(0.48, skin, 24);
  head.add(skull);
  fur(head, 0.48, 0.48, 0.48, 240, furColor, 42, 0.12);
  const face = ellipsoid(0.3, 0.32, 0.22, pale, 16);
  face.position.set(0, -0.06, 0.32);
  head.add(face);
  for (const side of [-1, 1]) {
    // 前视的大眼睛
    const eye = sphere(0.14, std("#f2ead6", { roughness: 0.3 }), 16);
    eye.position.set(side * 0.16, 0.05, 0.4);
    head.add(eye);
    const iris = sphere(0.09, std("#3a2510", { roughness: 0.2 }), 12);
    iris.position.set(side * 0.16, 0.05, 0.5);
    head.add(iris);
    const pupil = sphere(0.05, std("#050505"), 8);
    pupil.position.set(side * 0.16, 0.05, 0.56);
    head.add(pupil);
    const ear = ellipsoid(0.1, 0.13, 0.05, pale, 10);
    ear.position.set(side * 0.44, 0.15, 0);
    head.add(ear);
  }
  const nose = ellipsoid(0.06, 0.04, 0.05, std("#3a2510"), 8);
  nose.position.set(0, -0.12, 0.54);
  head.add(nose);
  head.position.set(0, 1.55, 0.1);
  monkey.add(head);

  // 抓握树枝的四肢
  const arm = (side: number) => {
    const A = new THREE.Group();
    const sh = V3(side * 0.5, 1.15, 0.15);
    const el = V3(side * 0.62, 0.55, 0.45);
    const hand = V3(side * 0.42, -0.02, 0.5);
    A.add(bone(sh, el, 0.09, skin), bone(el, hand, 0.075, skin));
    for (let k = 0; k < 5; k++) {
      const a = k === 0 ? Math.PI * 0.75 : -0.35 + k * 0.22; // 对握拇指
      const tip = hand.clone().add(V3(Math.cos(a) * 0.14 * side, -0.16, Math.sin(a) * 0.1));
      A.add(bone(hand, tip, 0.022, pale));
    }
    return A;
  };
  const legB = (side: number) => {
    const L = new THREE.Group();
    const hip = V3(side * 0.35, 0.25, 0);
    const knee = V3(side * 0.7, 0.75, 0.35);
    const ankle = V3(side * 0.55, -0.02, 0.35);
    L.add(bone(hip, knee, 0.11, skin), bone(knee, ankle, 0.085, skin));
    for (let k = 0; k < 5; k++) {
      const a = k === 0 ? Math.PI * 0.75 : -0.35 + k * 0.22;
      L.add(bone(ankle, ankle.clone().add(V3(Math.cos(a) * 0.16 * side, -0.16, Math.sin(a) * 0.14)), 0.024, pale));
    }
    return L;
  };
  monkey.add(arm(1), arm(-1), legB(1), legB(-1));
  // 长尾
  const tail = new THREE.Group();
  tail.add(tube([V3(0, 0.3, -0.35), V3(0.4, -0.1, -0.9), V3(1.4, -0.35, -1.0), V3(2.3, 0.15, -0.6), V3(2.6, 0.7, -0.2)], 0.06, skin, 50));
  monkey.add(tail);
  monkey.position.set(0.1, 0.05, 0);
  monkey.rotation.y = -0.35;
  g.add(monkey);

  // 一只飞虫（猎物）
  const bug = sphere(0.05, std("#e0e0c0", { emissive: "#c0c090", emissiveIntensity: 0.6 }), 8);
  g.add(bug);

  return {
    group: g,
    lift: 1.0,
    focus: V3(0.2, 0.9, 0),
    distance: 6.6,
    update(t) {
      head.rotation.y = Math.sin(t * 0.9) * 0.35;
      head.rotation.x = Math.sin(t * 1.9) * 0.08;
      tail.rotation.x = Math.sin(t * 1.2) * 0.1;
      monkey.position.y = 0.05 + Math.sin(t * 3) * 0.01;
      bug.position.set(1.6 + Math.sin(t * 1.7) * 0.8, 1.9 + Math.sin(t * 3.1) * 0.3, 0.6 + Math.cos(t * 1.3) * 0.5);
    },
    dispose: () => disposeGroup(g),
  };
}
