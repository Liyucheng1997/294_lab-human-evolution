import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { CSS2DRenderer, CSS2DObject } from "three/examples/jsm/renderers/CSS2DRenderer.js";
import type { Stage, Hotspot } from "../data/stages";
import { modelBuilders } from "./models";
import { buildEnvironment, type EnvScene } from "./environment";
import { setWireframe, type StageModel } from "./util";

export interface AppOptions {
  canvas: HTMLCanvasElement;
  labelRoot: HTMLElement;
  onHotspot: (h: Hotspot, index: number) => void;
}

const easeInOut = (x: number) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);

export class EvolutionApp {
  renderer: THREE.WebGLRenderer;
  labelRenderer: CSS2DRenderer;
  scene = new THREE.Scene();
  camera: THREE.PerspectiveCamera;
  controls: OrbitControls;
  hemi: THREE.HemisphereLight;
  sun: THREE.DirectionalLight;
  fill: THREE.DirectionalLight;
  fog: THREE.Fog;

  private model: StageModel | null = null;
  private outgoing: Array<{ model: StageModel; t: number }> = [];
  private env: EnvScene | null = null;
  private envTarget: EnvScene | null = null;
  private envBlend = 1;
  private lightFrom = { bg: new THREE.Color(), fog: new THREE.Color(), sky: new THREE.Color(), gnd: new THREE.Color(), sun: new THREE.Color(), hemiI: 1, sunI: 2, near: 10, far: 40, sunPos: new THREE.Vector3(6, 10, 6) };
  private modelIn = 1;
  private clock = new THREE.Clock();
  private elapsed = 0;
  private camAnim: { from: THREE.Vector3; to: THREE.Vector3; tFrom: THREE.Vector3; tTo: THREE.Vector3; t: number } | null = null;
  private labels: CSS2DObject[] = [];
  private currentStage: Stage | null = null;
  paused = false;
  wireframe = false;
  showHotspots = true;
  private opts: AppOptions;
  private defaultAzimuth = 0.55;

  constructor(opts: AppOptions) {
    this.opts = opts;
    this.renderer = new THREE.WebGLRenderer({ canvas: opts.canvas, antialias: true, powerPreference: "high-performance" });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.05;
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;

    this.labelRenderer = new CSS2DRenderer({ element: opts.labelRoot });
    this.camera = new THREE.PerspectiveCamera(42, 1, 0.1, 400);
    this.camera.position.set(4, 3, 8);

    this.controls = new OrbitControls(this.camera, opts.labelRoot);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.08;
    this.controls.enablePan = false;
    this.controls.minDistance = 2.5;
    this.controls.maxDistance = 30;
    this.controls.maxPolarAngle = Math.PI * 0.52;
    this.controls.autoRotate = true;
    this.controls.autoRotateSpeed = 0.5;

    this.fog = new THREE.Fog("#000", 10, 40);
    this.scene.fog = this.fog;
    this.hemi = new THREE.HemisphereLight("#fff", "#444", 1);
    this.scene.add(this.hemi);
    this.sun = new THREE.DirectionalLight("#fff", 2);
    this.sun.castShadow = true;
    this.sun.shadow.mapSize.set(2048, 2048);
    this.sun.shadow.camera.near = 1;
    this.sun.shadow.camera.far = 60;
    const s = 12;
    this.sun.shadow.camera.left = -s;
    this.sun.shadow.camera.right = s;
    this.sun.shadow.camera.top = s;
    this.sun.shadow.camera.bottom = -s;
    this.sun.shadow.bias = -0.0008;
    this.sun.shadow.normalBias = 0.02;
    this.scene.add(this.sun, this.sun.target);
    this.fill = new THREE.DirectionalLight("#cfe0ff", 0.6);
    this.fill.position.set(-6, 3, -8);
    this.scene.add(this.fill);

    window.addEventListener("resize", () => this.resize());
    this.resize();
    this.renderer.setAnimationLoop(() => this.frame());
  }

  resize() {
    const el = this.opts.canvas.parentElement!;
    const w = el.clientWidth, h = el.clientHeight;
    this.renderer.setSize(w, h, false);
    this.labelRenderer.setSize(w, h);
    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();
  }

  /** 切换到某个阶段 */
  setStage(stage: Stage, opts: { animateCamera?: boolean } = {}) {
    const animateCamera = opts.animateCamera ?? true;
    const prevStage = this.currentStage;
    this.currentStage = stage;

    // 旧模型淡出
    if (this.model) {
      this.outgoing.push({ model: this.model, t: 0 });
      this.clearLabels();
    }
    const model = modelBuilders[stage.id]();
    model.group.position.y += model.lift;
    model.group.userData.baseY = model.group.position.y;
    setWireframe(model.group, this.wireframe);
    this.scene.add(model.group);
    this.model = model;
    this.modelIn = 0;
    model.group.scale.setScalar(0.001);
    this.addLabels(stage, model);

    // 环境
    if (!prevStage || prevStage.env !== stage.env) {
      const next = buildEnvironment(stage.env);
      if (this.env) {
        this.scene.remove(this.env.group);
        this.env.dispose();
      }
      this.captureLightState();
      this.env = next;
      this.envTarget = next;
      this.envBlend = prevStage ? 0 : 1;
      this.scene.add(next.group);
      if (!prevStage) this.applyEnv(next, 1);
    }

    // 相机
    const focus = model.focus.clone().add(new THREE.Vector3(0, model.lift, 0));
    const az = this.defaultAzimuth;
    const dist = model.distance;
    const pos = new THREE.Vector3(Math.sin(az) * dist, focus.y + dist * 0.32, Math.cos(az) * dist).add(new THREE.Vector3(0, 0, 0));
    pos.y = Math.max(pos.y, 0.6);
    if (animateCamera && prevStage) {
      this.camAnim = { from: this.camera.position.clone(), to: pos, tFrom: this.controls.target.clone(), tTo: focus, t: 0 };
    } else {
      this.camera.position.copy(pos);
      this.controls.target.copy(focus);
      this.camAnim = null;
    }
    this.controls.minDistance = Math.max(2, dist * 0.35);
    this.controls.maxDistance = dist * 3;
    this.sun.target.position.copy(focus);
  }

  resetCamera() {
    if (!this.model) return;
    const focus = this.model.focus.clone().add(new THREE.Vector3(0, this.model.lift, 0));
    const dist = this.model.distance;
    const az = this.defaultAzimuth;
    const pos = new THREE.Vector3(Math.sin(az) * dist, focus.y + dist * 0.32, Math.cos(az) * dist);
    this.camAnim = { from: this.camera.position.clone(), to: pos, tFrom: this.controls.target.clone(), tTo: focus, t: 0 };
  }

  /** 拉近看细节 */
  zoomTo(distanceFactor: number) {
    if (!this.model) return;
    const focus = this.controls.target.clone();
    const dir = this.camera.position.clone().sub(focus).normalize();
    const pos = focus.clone().addScaledVector(dir, this.model.distance * distanceFactor);
    this.camAnim = { from: this.camera.position.clone(), to: pos, tFrom: focus, tTo: focus, t: 0 };
  }

  setWireframe(on: boolean) {
    this.wireframe = on;
    if (this.model) setWireframe(this.model.group, on);
  }

  setHotspotsVisible(on: boolean) {
    this.showHotspots = on;
    this.labels.forEach((l) => (l.visible = on));
  }

  setAutoRotate(on: boolean) {
    this.controls.autoRotate = on;
  }

  private addLabels(stage: Stage, model: StageModel) {
    stage.hotspots.forEach((h, i) => {
      const el = document.createElement("button");
      el.className = "hotspot";
      el.type = "button";
      el.innerHTML = `<span class="hotspot-dot">${i + 1}</span><span class="hotspot-text">${h.label}</span>`;
      el.addEventListener("pointerdown", (e) => e.stopPropagation());
      el.addEventListener("click", (e) => {
        e.stopPropagation();
        this.opts.onHotspot(h, i);
      });
      const obj = new CSS2DObject(el);
      obj.position.set(h.position[0], h.position[1], h.position[2]);
      obj.visible = this.showHotspots;
      model.group.add(obj);
      this.labels.push(obj);
    });
  }

  private clearLabels() {
    for (const l of this.labels) {
      l.removeFromParent();
      l.element.remove();
    }
    this.labels = [];
  }

  private captureLightState() {
    const L = this.lightFrom;
    L.bg.copy(this.scene.background instanceof THREE.Color ? this.scene.background : new THREE.Color("#000"));
    L.fog.copy(this.fog.color);
    L.near = this.fog.near;
    L.far = this.fog.far;
    L.sky.copy(this.hemi.color);
    L.gnd.copy(this.hemi.groundColor);
    L.hemiI = this.hemi.intensity;
    L.sun.copy(this.sun.color);
    L.sunI = this.sun.intensity;
    L.sunPos.copy(this.sun.position);
  }

  private applyEnv(env: EnvScene, k: number) {
    const L = this.lightFrom;
    const bg = L.bg.clone().lerp(env.background, k);
    this.scene.background = bg;
    this.fog.color.copy(L.fog.clone().lerp(env.fogColor, k));
    this.fog.near = THREE.MathUtils.lerp(L.near, env.fogNear, k);
    this.fog.far = THREE.MathUtils.lerp(L.far, env.fogFar, k);
    this.hemi.color.copy(L.sky.clone().lerp(env.hemiSky, k));
    this.hemi.groundColor.copy(L.gnd.clone().lerp(env.hemiGround, k));
    this.hemi.intensity = THREE.MathUtils.lerp(L.hemiI, env.hemiIntensity, k);
    this.sun.color.copy(L.sun.clone().lerp(env.sunColor, k));
    this.sun.intensity = THREE.MathUtils.lerp(L.sunI, env.sunIntensity, k);
    this.sun.position.copy(L.sunPos.clone().lerp(env.sunPosition, k));
  }

  private frame() {
    const dt = Math.min(0.05, this.clock.getDelta());
    if (!this.paused) this.elapsed += dt;
    const t = this.elapsed;

    // 环境过渡
    if (this.envTarget && this.envBlend < 1) {
      this.envBlend = Math.min(1, this.envBlend + dt * 1.2);
      this.applyEnv(this.envTarget, easeInOut(this.envBlend));
    }
    this.env?.update(t, dt);

    // 模型进入 / 退出
    if (this.model) {
      if (this.modelIn < 1) {
        this.modelIn = Math.min(1, this.modelIn + dt * 1.6);
        const k = easeInOut(this.modelIn);
        this.model.group.scale.setScalar(0.001 + k * 0.999);
      }
      this.model.update(t, this.paused ? 0 : dt);
    }
    for (const o of this.outgoing) {
      o.t += dt * 2.2;
      const k = 1 - easeInOut(Math.min(1, o.t));
      o.model.group.scale.setScalar(Math.max(0.001, k));
      o.model.update(t, dt);
      if (o.t >= 1) {
        this.scene.remove(o.model.group);
        o.model.dispose();
      }
    }
    this.outgoing = this.outgoing.filter((o) => o.t < 1);

    // 相机动画
    if (this.camAnim) {
      const a = this.camAnim;
      a.t = Math.min(1, a.t + dt * 1.1);
      const k = easeInOut(a.t);
      this.camera.position.lerpVectors(a.from, a.to, k);
      this.controls.target.lerpVectors(a.tFrom, a.tTo, k);
      if (a.t >= 1) this.camAnim = null;
    }
    this.controls.update();
    this.renderer.render(this.scene, this.camera);
    this.labelRenderer.render(this.scene, this.camera);
  }
}
