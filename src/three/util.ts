import * as THREE from "three";

export interface StageModel {
  group: THREE.Group;
  /** 每帧调用；t 为总秒数，dt 为帧间隔 */
  update: (t: number, dt: number) => void;
  dispose: () => void;
  /** 模型局部原点相对地面的抬升高度（让模型站在 y=0 的地面上） */
  lift: number;
  /** 建议相机看向的局部点 */
  focus: THREE.Vector3;
  /** 建议相机距离 */
  distance: number;
}

export type ModelBuilder = () => StageModel;

export const V3 = (x = 0, y = 0, z = 0) => new THREE.Vector3(x, y, z);

export function std(color: THREE.ColorRepresentation, opts: Partial<THREE.MeshStandardMaterialParameters> = {}) {
  return new THREE.MeshStandardMaterial({ color, roughness: 0.72, metalness: 0.02, ...opts });
}

export function glassy(color: THREE.ColorRepresentation, opacity = 0.5, opts: Partial<THREE.MeshPhysicalMaterialParameters> = {}) {
  return new THREE.MeshPhysicalMaterial({
    color,
    roughness: 0.25,
    metalness: 0,
    transparent: true,
    opacity,
    clearcoat: 0.6,
    clearcoatRoughness: 0.3,
    side: THREE.DoubleSide,
    depthWrite: false,
    ...opts,
  });
}

export function sphere(r: number, mat: THREE.Material, seg = 32) {
  const m = new THREE.Mesh(new THREE.SphereGeometry(r, seg, Math.max(8, seg / 2)), mat);
  m.castShadow = true;
  m.receiveShadow = true;
  return m;
}

export function ellipsoid(rx: number, ry: number, rz: number, mat: THREE.Material, seg = 32) {
  const m = sphere(1, mat, seg);
  m.scale.set(rx, ry, rz);
  return m;
}

export function capsule(r: number, len: number, mat: THREE.Material, seg = 12) {
  const m = new THREE.Mesh(new THREE.CapsuleGeometry(r, len, seg, seg * 2), mat);
  m.castShadow = true;
  m.receiveShadow = true;
  return m;
}

/** 从 a 到 b 的胶囊体（骨骼段） */
export function bone(a: THREE.Vector3, b: THREE.Vector3, r: number, mat: THREE.Material) {
  const dir = new THREE.Vector3().subVectors(b, a);
  const len = dir.length();
  const m = capsule(r, Math.max(0.001, len), mat);
  m.position.copy(a).addScaledVector(dir, 0.5);
  m.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir.clone().normalize());
  return m;
}

export function cone(r: number, h: number, mat: THREE.Material, seg = 16) {
  const m = new THREE.Mesh(new THREE.ConeGeometry(r, h, seg), mat);
  m.castShadow = true;
  return m;
}

export function cylinder(rt: number, rb: number, h: number, mat: THREE.Material, seg = 16) {
  const m = new THREE.Mesh(new THREE.CylinderGeometry(rt, rb, h, seg), mat);
  m.castShadow = true;
  m.receiveShadow = true;
  return m;
}

export function tube(points: THREE.Vector3[], r: number, mat: THREE.Material, seg = 64, closed = false) {
  const curve = new THREE.CatmullRomCurve3(points, closed);
  const m = new THREE.Mesh(new THREE.TubeGeometry(curve, seg, r, 10, closed), mat);
  m.castShadow = true;
  return m;
}

/** 由轮廓 [x(半径), y] 旋转生成的体（鱼身等），沿 x 轴放置 */
export function lathe(profile: Array<[number, number]>, mat: THREE.Material, seg = 32) {
  const pts = profile.map(([r, y]) => new THREE.Vector2(Math.max(0.0001, r), y));
  const geo = new THREE.LatheGeometry(pts, seg);
  const m = new THREE.Mesh(geo, mat);
  m.rotation.z = -Math.PI / 2; // 让 y 轴变成 x 轴方向
  m.castShadow = true;
  m.receiveShadow = true;
  return m;
}

/** 由二维轮廓拉出的薄片（鳍） */
export function fin(shapePts: Array<[number, number]>, thickness: number, mat: THREE.Material) {
  const shape = new THREE.Shape(shapePts.map(([x, y]) => new THREE.Vector2(x, y)));
  const geo = new THREE.ExtrudeGeometry(shape, { depth: thickness, bevelEnabled: true, bevelSize: thickness * 0.4, bevelThickness: thickness * 0.4, bevelSegments: 2 });
  geo.translate(0, 0, -thickness / 2);
  const m = new THREE.Mesh(geo, mat);
  m.castShadow = true;
  return m;
}

/** 把 mesh 的局部变换烘焙进几何体，之后可以统一做顶点变形 */
export function bake(mesh: THREE.Mesh) {
  mesh.updateMatrix();
  mesh.geometry.applyMatrix4(mesh.matrix);
  mesh.position.set(0, 0, 0);
  mesh.rotation.set(0, 0, 0);
  mesh.scale.set(1, 1, 1);
  mesh.updateMatrix();
  return mesh;
}

/**
 * 游泳变形器：把一组几何体沿 x 轴做正弦摆动（尾部摆幅更大）。
 * 所有几何体必须已 bake 到同一局部坐标系。
 */
export class SwimDeformer {
  private items: Array<{ geo: THREE.BufferGeometry; orig: Float32Array }> = [];
  constructor(
    meshes: THREE.Mesh[],
    private opts: { amp: number; k: number; speed: number; headX: number; tailX: number; axis?: "z" | "y" },
  ) {
    for (const m of meshes) {
      const geo = m.geometry as THREE.BufferGeometry;
      const pos = geo.attributes.position as THREE.BufferAttribute;
      this.items.push({ geo, orig: new Float32Array(pos.array as Float32Array) });
    }
  }
  update(t: number) {
    const { amp, k, speed, headX, tailX } = this.opts;
    const axisIdx = this.opts.axis === "y" ? 1 : 2;
    const span = tailX - headX;
    for (const { geo, orig } of this.items) {
      const pos = geo.attributes.position as THREE.BufferAttribute;
      const arr = pos.array as Float32Array;
      for (let i = 0; i < arr.length; i += 3) {
        const x = orig[i];
        const w = THREE.MathUtils.clamp((x - headX) / span, 0, 1);
        const env = w * w * 0.85 + 0.15 * w;
        arr[i] = x;
        arr[i + 1] = orig[i + 1];
        arr[i + 2] = orig[i + 2];
        arr[i + axisIdx] += Math.sin(x * k - t * speed) * amp * env;
      }
      pos.needsUpdate = true;
      geo.computeVertexNormals();
    }
  }
}

export function disposeGroup(group: THREE.Object3D) {
  group.traverse((o) => {
    const mesh = o as THREE.Mesh;
    if (mesh.geometry) mesh.geometry.dispose();
    const mat = (mesh as THREE.Mesh).material as THREE.Material | THREE.Material[] | undefined;
    if (Array.isArray(mat)) mat.forEach((m) => m.dispose());
    else if (mat) mat.dispose();
  });
}

/** 简单确定性伪随机，保证每次刷新模型形态一致 */
export function rng(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 4294967296;
  };
}

export function setWireframe(root: THREE.Object3D, on: boolean) {
  root.traverse((o) => {
    const mesh = o as THREE.Mesh;
    if (!mesh.isMesh) return;
    const mats = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
    for (const m of mats) {
      const mm = m as THREE.MeshStandardMaterial;
      if ("wireframe" in mm) mm.wireframe = on;
    }
  });
}
