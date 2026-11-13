"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { ContactShadows, Environment, Lightformer, Sparkles, useGLTF, useProgress } from "@react-three/drei";
import { Component, Suspense, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import {
  Box3,
  Color,
  Group,
  Material,
  Mesh,
  MeshBasicMaterial,
  MeshStandardMaterial,
  PerspectiveCamera,
  PointLight,
  Vector3,
} from "three";
import type { MotionValue } from "framer-motion";

type CarSceneProps = {
  progress: MotionValue<number>;
  rotating: boolean;
  reducedMotion: boolean;
  highlight?: string;
  framing?: "right" | "center";
};

/**
 * One keyframe per scroll chapter (5 feature chapters).
 * `side` is where the car sits on screen: +1 = right (copy is on the left),
 * -1 = left (copy is on the right). Chapter copy alternates left/right in
 * landing-page.tsx, so the car always moves into the open half of the screen.
 */
const chapterFrames = [
  { position: new Vector3(5.6, 1.9, 6.6), target: new Vector3(0, 0.1, 0), fov: 32, side: 1 },
  { position: new Vector3(0.6, 1.1, 7.4), target: new Vector3(0, 0.2, 0), fov: 30, side: -1 },
  { position: new Vector3(-5.9, 1.5, 5.3), target: new Vector3(0, 0.1, 0), fov: 30, side: 1 },
  { position: new Vector3(4.6, 3.9, 6.1), target: new Vector3(0, 0, 0), fov: 33, side: -1 },
  { position: new Vector3(-1.6, 0.9, 6.9), target: new Vector3(0, 0.15, 0), fov: 29, side: 1 },
];

const CHAPTERS = chapterFrames.length;
const SCREEN_SHIFT = 0.36; // fraction of the half-width the car is pushed off-centre
const ACCENT_PINK = "#f20c62";
const ACCENT_BLUE = "#1768f5";

const smooth = (t: number) => t * t * (3 - 2 * t);

/** Hold each chapter's framing, then ease into the next one near the chapter boundary. */
function sampleChapters(progress: number) {
  const scaled = Math.max(0, Math.min(0.9999, progress)) * CHAPTERS;
  const index = Math.floor(scaled);
  const fraction = scaled - index;
  const weight = smooth(Math.max(0, Math.min(1, (fraction - 0.62) / 0.38)));
  return { from: chapterFrames[index], to: chapterFrames[Math.min(index + 1, CHAPTERS - 1)], weight };
}

const right = new Vector3();
const direction = new Vector3();
const worldUp = new Vector3(0, 1, 0);

/**
 * Parts the specification page can zoom to. GLTFLoader turns spaces in node
 * names into underscores, so names are normalised back to spaces before matching.
 * `highlight` is what glows, `focus` (optional) is the subset the camera frames,
 * `view` is the camera direction relative to the car (f = forward, s = right side,
 * h = height) and `fit` scales the framing distance.
 */
type PartView = { highlight?: RegExp; focus?: RegExp; view: { f: number; s: number; h: number }; fit: number };
const normalizeName = (name: string) => name.replace(/_/g, " ");

export const partViews: Record<string, PartView> = {
  overview: { view: { f: 0.8, s: 1, h: 0.45 }, fit: 0.8 },
  ev: { view: { f: 0.8, s: 1, h: 0.45 }, fit: 0.8 },
  chassis: {
    highlight: /^(Monocoque|Monocoque CF|Rear Chassis|Undertray|Roll bar|Front hoop|Headrest)$/i,
    view: { f: 0.45, s: 1, h: 0.5 },
    fit: 0.8,
  },
  suspension: {
    highlight: /^(LF|RF|LR|RR) (ARB|Damper.*|Lower Wishbone|Upper Wishbone|Spring|Rocker|adjust|Hydraulic.*)$/i,
    focus: /^RF (ARB|Damper.*|Lower Wishbone|Upper Wishbone|Spring|Rocker|adjust|Hydraulic.*)$/i,
    view: { f: 0.75, s: 1, h: 0.45 },
    fit: 1.35,
  },
  controls: {
    highlight: /^(Dashboard|Display|Steering Wheel|SteerColumn|Steering support|ColumnEnd|Handle|ButtonR|ButtonW|QuickRelease|LED \d)$/i,
    view: { f: -0.35, s: 0.75, h: 1 },
    fit: 1.6,
  },
  wheels: {
    highlight: /^(Tyre |RIM (?!BLUR)|(LF|RF|LR|RR) (Brake|Hub|Lugs|Nuts))/i,
    focus: /^(Tyre RF|RIM RF|RF Brake|RF Hub|RF Lugs|RF Nuts)/i,
    view: { f: 0.4, s: 1, h: 0.12 },
    fit: 1.3,
  },
  frontAero: {
    highlight: /^(Nosecone|FW)/i,
    view: { f: 1, s: 0.75, h: 0.4 },
    fit: 1.1,
  },
  rearAero: {
    highlight: /^(RW|Sidepod)/i,
    focus: /^RW/i,
    view: { f: -1, s: 0.75, h: 0.45 },
    fit: 1.15,
  },
};

function unionBox(model: Group, test: RegExp) {
  const box = new Box3();
  const part = new Box3();
  model.traverse((object) => {
    if (object instanceof Mesh && test.test(normalizeName(object.name))) {
      part.setFromObject(object);
      box.union(part);
    }
  });
  return box;
}

function VehicleModel({
  progress,
  rotating,
  reducedMotion,
  onReady,
  onEmpty,
  highlight,
  framing,
}: {
  progress: MotionValue<number>;
  rotating: boolean;
  reducedMotion: boolean;
  onReady: () => void;
  onEmpty: () => void;
  highlight?: string;
  framing?: "right" | "center";
}) {
  const { scene: source } = useGLTF("/assets/car.glb");
  const rig = useRef<Group>(null);
  const floor = useRef<Group>(null);
  const rimLight = useRef<PointLight>(null);
  const cameraGoal = useRef(new Vector3());
  const targetGoal = useRef(new Vector3());

  const prepared = useMemo(() => {
    const clone = source.clone(true);
    let meshCount = 0;
    clone.traverse((object) => {
      if (object instanceof Mesh) {
        meshCount += 1;
        object.castShadow = true;
        object.receiveShadow = true;
      }
    });

    if (meshCount === 0) return null;

    const bounds = new Box3().setFromObject(clone);
    const center = bounds.getCenter(new Vector3());
    const size = bounds.getSize(new Vector3());
    const largestDimension = Math.max(size.x, size.y, size.z);

    if (!Number.isFinite(largestDimension) || largestDimension <= 0) return null;

    const scale = 4.1 / largestDimension;
    const normalized = new Group();
    clone.position.sub(center);
    normalized.add(clone);
    normalized.scale.setScalar(scale);
    return { model: normalized, floorY: (-size.y / 2) * scale };
  }, [source]);

  const model = prepared?.model ?? null;
  const floorY = prepared?.floorY ?? -0.5;
  const lookCurrent = useRef(new Vector3());

  // Where the camera should go for the selected part (specification page only).
  const focusPlan = useMemo(() => {
    if (!model || framing !== "center") return null;
    model.updateMatrixWorld(true);
    const whole = new Box3().setFromObject(model);
    const centerOf = (test: RegExp) => {
      const box = unionBox(model, test);
      return box.isEmpty() ? null : box.getCenter(new Vector3());
    };
    const front = centerOf(/^(FW|Nosecone)/i);
    const back = centerOf(/^RW/i);
    const rightWheel = centerOf(/^RF /i);
    const leftWheel = centerOf(/^LF /i);
    const forward = front && back ? front.sub(back).setY(0) : new Vector3(0, 0, 1);
    const side = rightWheel && leftWheel ? rightWheel.sub(leftWheel).setY(0) : new Vector3(1, 0, 0);
    forward.normalize();
    side.normalize();

    const def = partViews[highlight ?? "overview"] ?? partViews.overview;
    const test = def.focus ?? def.highlight;
    let box = test ? unionBox(model, test) : whole;
    if (box.isEmpty()) box = whole;
    const center = box.getCenter(new Vector3());
    const radius = box.getSize(new Vector3()).length() / 2;
    const direction = new Vector3()
      .addScaledVector(forward, def.view.f)
      .addScaledVector(side, def.view.s)
      .addScaledVector(worldUp, def.view.h)
      .normalize();
    return { center, radius, direction, fit: def.fit };
  }, [model, highlight, framing]);

  useEffect(() => {
    if (model) onReady();
    else onEmpty();
  }, [model, onEmpty, onReady]);

  useEffect(() => {
    const pattern = highlight ? partViews[highlight]?.highlight : undefined;
    if (!model || !pattern) return;
    const restore: Array<() => void> = [];

    model.traverse((object) => {
      if (!(object instanceof Mesh) || !pattern.test(normalizeName(object.name))) return;
      const original = object.material;
      const brighten = (material: Material) => {
        const copy = material.clone();
        if (copy instanceof MeshStandardMaterial) {
          copy.emissive = new Color("#428bff");
          copy.emissiveIntensity = 1.15;
        } else if (copy instanceof MeshBasicMaterial) {
          copy.color.lerp(new Color("#428bff"), 0.72);
        }
        return copy;
      };
      const highlighted = Array.isArray(original) ? original.map(brighten) : brighten(original);
      object.material = highlighted;
      restore.push(() => {
        object.material = original;
        if (Array.isArray(highlighted)) highlighted.forEach((material) => material.dispose());
        else highlighted.dispose();
      });
    });

    return () => restore.forEach((restoreMaterial) => restoreMaterial());
  }, [highlight, model]);

  useFrame(({ camera, clock, size }, delta) => {
    // Specification page: fly to the selected part and frame it.
    if (framing === "center") {
      if (!focusPlan || !(camera instanceof PerspectiveCamera)) return;
      const t = clock.elapsedTime;
      const fov = 30;
      const aspect = size.width / size.height;
      const halfV = (fov * Math.PI) / 360;
      const halfH = Math.atan(Math.tan(halfV) * aspect);
      const distance = Math.max(1.5, (focusPlan.radius / Math.sin(Math.min(halfV, halfH))) * focusPlan.fit);
      const drift = reducedMotion ? 0 : Math.sin(t * 0.35) * 0.22;
      direction.copy(focusPlan.direction).applyAxisAngle(worldUp, drift);
      cameraGoal.current.copy(focusPlan.center).addScaledVector(direction, distance);
      const blend = 1 - Math.exp(-delta * 3.2);
      if (lookCurrent.current.lengthSq() === 0) {
        lookCurrent.current.copy(focusPlan.center);
        camera.position.copy(cameraGoal.current);
      }
      camera.position.lerp(cameraGoal.current, blend);
      lookCurrent.current.lerp(focusPlan.center, blend);
      camera.lookAt(lookCurrent.current);
      if (Math.abs(camera.fov - fov) > 0.02) {
        camera.fov += (fov - camera.fov) * blend;
        camera.updateProjectionMatrix();
      }
      if (rig.current) {
        rig.current.rotation.y = 0;
        rig.current.position.y = 0;
      }
      if (floor.current && !reducedMotion) floor.current.rotation.z = -t * 0.12;
      if (rimLight.current && !reducedMotion) rimLight.current.intensity = 30 + Math.sin(t * 1.4) * 10;
      return;
    }

    const compact = size.width < 700;
    const centered = compact;
    const aspect = size.width / size.height;
    const scrollProgress = reducedMotion ? 0 : progress.get();
    const { from, to, weight } = sampleChapters(scrollProgress);
    const blend = 1 - Math.exp(-delta * 2.6);

    const goalPosition = cameraGoal.current.lerpVectors(from.position, to.position, weight);
    const goalTarget = targetGoal.current.lerpVectors(from.target, to.target, weight);
    let fov = from.fov + (to.fov - from.fov) * weight;
    let side = from.side + (to.side - from.side) * weight;

    // Narrower screens need more distance to keep the whole car in frame.
    if (aspect < 1.5) {
      const pushBack = Math.pow(1.5 / Math.max(aspect, 0.4), 0.7);
      goalPosition.sub(goalTarget).multiplyScalar(pushBack).add(goalTarget);
    }
    if (compact) {
      side = 0;
      goalTarget.y -= 0.7; // lifts the car above the copy card at the bottom
      fov += 6;
    }

    // Shift the car sideways on screen without changing the viewing angle.
    direction.subVectors(goalTarget, goalPosition);
    const distance = direction.length();
    right.crossVectors(direction.normalize(), worldUp).normalize();
    const halfWidth = distance * Math.tan((fov * Math.PI) / 360) * aspect;
    const shift = centered ? 0 : side * SCREEN_SHIFT * halfWidth;
    goalPosition.addScaledVector(right, -shift);
    goalTarget.addScaledVector(right, -shift);

    camera.position.lerp(goalPosition, blend);
    camera.lookAt(goalTarget);
    if (camera instanceof PerspectiveCamera && Math.abs(camera.fov - fov) > 0.02) {
      camera.fov += (fov - camera.fov) * blend;
      camera.updateProjectionMatrix();
    }

    const t = clock.elapsedTime;
    if (rig.current) {
      const sway = rotating && !reducedMotion ? Math.sin(t * 0.32) * 0.14 : 0;
      rig.current.rotation.y = scrollProgress * 0.5 - 0.1 + sway;
      rig.current.position.y = reducedMotion ? 0 : Math.sin(t * 0.9) * 0.018;
    }
    if (floor.current && !reducedMotion) floor.current.rotation.z = -t * 0.12;
    if (rimLight.current && !reducedMotion) {
      rimLight.current.intensity = 30 + Math.sin(t * 1.4) * 10;
      rimLight.current.position.x = Math.sin(t * 0.4) * 5;
    }
  });

  if (!model) return null;

  return (
    <>
      <group ref={rig}>
        <primitive object={model} dispose={null} />
      </group>
      {/* Polished showroom floor: reflects the car and fades into darkness with the fog. */}
      <mesh position={[0, floorY - 0.004, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <circleGeometry args={[45, 48]} />
        <meshStandardMaterial color="#14171c" roughness={0.38} metalness={0.6} envMapIntensity={0.7} />
      </mesh>
      {/* A thin, quiet light line on the floor marks the presentation spot. */}
      <group ref={floor} position={[0, floorY + 0.004, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <mesh>
          <ringGeometry args={[3.3, 3.32, 128]} />
          <meshBasicMaterial color="#9ebcff" transparent opacity={0.35} />
        </mesh>
        <mesh>
          <ringGeometry args={[3.3, 3.34, 128, 1, 0, Math.PI * 0.45]} />
          <meshBasicMaterial color={ACCENT_PINK} transparent opacity={0.95} />
        </mesh>
      </group>
      <ContactShadows position={[0, floorY + 0.002, 0]} opacity={0.65} scale={9} blur={2.2} far={1.6} resolution={256} color="#000000" />
      <pointLight ref={rimLight} position={[-4, 1.4, -3]} color={ACCENT_PINK} intensity={22} distance={14} />
      {!reducedMotion && (
        <Sparkles count={28} scale={[10, 3, 6]} position={[0, 0.8, 0]} size={1.4} speed={0.25} opacity={0.35} color="#dfe8ff" />
      )}
    </>
  );
}

class SceneErrorBoundary extends Component<
  { children: ReactNode; onError: (error: Error) => void },
  { hasError: boolean }
> {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: Error) {
    console.error("The Anargya vehicle scene could not be rendered.", error);
    this.props.onError(error);
  }

  render() {
    return this.state.hasError ? null : this.props.children;
  }
}

function SceneLoadingStatus() {
  const { progress } = useProgress();
  return (
    <span role="status">
      Loading 3D vehicle / {Math.round(progress)}%
    </span>
  );
}

export function CarScene({ progress, rotating, reducedMotion, highlight, framing }: CarSceneProps) {
  const [loaded, setLoaded] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [attempt, setAttempt] = useState(0);
  const holder = useRef<HTMLSpanElement>(null);
  const [visible, setVisible] = useState(true);
  // Stop drawing frames while the scene is scrolled out of view.
  useEffect(() => {
    const target = holder.current?.parentElement;
    if (!target) return;
    const observer = new IntersectionObserver(([entry]) => setVisible(entry.isIntersecting), { rootMargin: "120px" });
    observer.observe(target);
    return () => observer.disconnect();
  }, []);

  const markReady = useMemo(() => () => {
    setLoadError(null);
    setLoaded(true);
  }, []);

  const markEmpty = useMemo(() => () => {
    setLoadError("The 3D vehicle model contains no displayable components.");
  }, []);

  function retry() {
    setLoaded(false);
    setLoadError(null);
    setAttempt((value) => value + 1);
  }

  return (
    <>
      <span ref={holder} style={{ display: "none" }} aria-hidden="true" />
      <Canvas
        className="scene-canvas"
        frameloop={visible ? "always" : "never"}
        aria-hidden="true"
        dpr={[1, 1.25]}
        shadows="percentage"
        camera={{ position: [5.6, 1.9, 6.6], fov: 32, near: 0.1, far: 100 }}
        gl={{ antialias: true, alpha: false }}
        fallback={<p>This browser cannot display the 3D vehicle.</p>}
      >
        <color attach="background" args={["#07090c"]} />
        <fog attach="fog" args={["#07090c", 11, 26]} />
        <ambientLight intensity={0.35} />
        <directionalLight
          position={[5, 8, 5]}
          intensity={2.4}
          castShadow
          shadow-mapSize={[1024, 1024]}
          shadow-camera-left={-6}
          shadow-camera-right={6}
          shadow-camera-top={6}
          shadow-camera-bottom={-6}
          shadow-bias={-0.0004}
        />
        <spotLight position={[0, 9, 0]} angle={0.5} penumbra={1} intensity={30} color="#f0f3ff" />
        {/* Studio softboxes: they are never visible, but they are what paints the car's reflections. */}
        <Environment resolution={128} environmentIntensity={0.9}>
          <Lightformer form="rect" color="#ffffff" intensity={4} position={[0, 6, 0]} rotation={[Math.PI / 2, 0, 0]} scale={[12, 6, 1]} />
          <Lightformer form="rect" color="#f4f7ff" intensity={2.6} position={[-7, 2.5, 1]} rotation={[0, Math.PI / 2, 0]} scale={[9, 1.6, 1]} />
          <Lightformer form="rect" color="#f4f7ff" intensity={2.6} position={[7, 2.5, 1]} rotation={[0, -Math.PI / 2, 0]} scale={[9, 1.6, 1]} />
          <Lightformer form="rect" color="#dfe8ff" intensity={2} position={[0, 2, -8]} scale={[10, 2, 1]} />
          <Lightformer form="rect" color={ACCENT_BLUE} intensity={2.2} position={[-6, 0.8, -4]} rotation={[0, Math.PI / 3, 0]} scale={[6, 1, 1]} />
          <Lightformer form="rect" color={ACCENT_PINK} intensity={1.8} position={[6, 0.8, -4]} rotation={[0, -Math.PI / 3, 0]} scale={[6, 1, 1]} />
          <Lightformer form="rect" color="#aab4c4" intensity={0.6} position={[0, -1, 0]} rotation={[-Math.PI / 2, 0, 0]} scale={[14, 14, 1]} />
        </Environment>
        <Suspense fallback={null}>
          <SceneErrorBoundary key={attempt} onError={(error) => {
            setLoaded(false);
            console.error("The Anargya vehicle model failed to load.", error);
            setLoadError("The 3D vehicle model could not be loaded. Try again.");
          }}>
            <VehicleModel
              progress={progress}
              rotating={rotating}
              reducedMotion={reducedMotion}
              onReady={markReady}
              onEmpty={markEmpty}
              highlight={highlight}
              framing={framing}
            />
          </SceneErrorBoundary>
        </Suspense>
      </Canvas>

      {!loaded && <div className="scene-status">
        {loadError ? (
          <>
            <span role="alert">{loadError}</span>
            <button type="button" onClick={retry}>Try again</button>
          </>
        ) : (
          <SceneLoadingStatus />
        )}
      </div>}
    </>
  );
}
