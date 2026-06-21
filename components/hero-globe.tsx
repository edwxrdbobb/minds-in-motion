"use client";

import { useRef, useMemo, useState, useEffect } from "react";
import { Canvas, useFrame, useLoader } from "@react-three/fiber";
import { Sphere, Line, useTexture } from "@react-three/drei";
import { OBJLoader } from "three/examples/jsm/loaders/OBJLoader.js";
import * as THREE from "three";
import { feature } from "topojson-client";
import { images } from "@/lib/cloudinary";

// Convert lat/lng (degrees) to 3D position on sphere
function latLngToVector3(
  lat: number,
  lng: number,
  radius: number
): [number, number, number] {
  const phi = (90 - lat) * (Math.PI / 180);
  const theta = (lng + 180) * (Math.PI / 180);
  const x = -(radius * Math.sin(phi) * Math.cos(theta));
  const y = radius * Math.cos(phi);
  const z = radius * Math.sin(phi) * Math.sin(theta);
  return [x, y, z];
}

// ---------- World Map data cache ----------
// Avoids re-fetching + re-parsing the ~200KB world atlas every time the globe
// remounts (SPA navigation) or the page reloads (persisted in localStorage).
type CountryLines = [number, number, number][][];

const WORLD_ATLAS_URL =
  "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json";
const WORLD_ATLAS_STORAGE_KEY = "mim-world-atlas-lines-v1";

let countryLinesMemoryCache: CountryLines | null = null;
let countryLinesPromise: Promise<CountryLines> | null = null;

function buildCountryLines(world: unknown, radius: number): CountryLines {
  const countries = feature(
    world as never,
    (world as { objects: { countries: never } }).objects.countries
  ) as unknown as GeoJSON.FeatureCollection;

  const lines: CountryLines = [];
  for (const feat of countries.features) {
    const geom = feat.geometry;
    let polygons: number[][][][] = [];

    if (geom.type === "Polygon") {
      polygons = [geom.coordinates as number[][][]];
    } else if (geom.type === "MultiPolygon") {
      polygons = geom.coordinates as number[][][][];
    }

    for (const polygon of polygons) {
      for (const ring of polygon) {
        const points: [number, number, number][] = [];
        for (const coord of ring) {
          points.push(latLngToVector3(coord[1], coord[0], radius + 0.01));
        }
        if (points.length > 1) lines.push(points);
      }
    }
  }
  return lines;
}

async function loadCountryLines(radius: number): Promise<CountryLines> {
  if (countryLinesMemoryCache) return countryLinesMemoryCache;
  if (countryLinesPromise) return countryLinesPromise;

  countryLinesPromise = (async () => {
    try {
      const cached = localStorage.getItem(WORLD_ATLAS_STORAGE_KEY);
      if (cached) {
        const parsed = JSON.parse(cached) as {
          radius: number;
          lines: CountryLines;
        };
        if (parsed.radius === radius) {
          countryLinesMemoryCache = parsed.lines;
          return parsed.lines;
        }
      }
    } catch {
      // localStorage unavailable (private mode, etc.) — fall through to fetch
    }

    const response = await fetch(WORLD_ATLAS_URL);
    const world = await response.json();
    const lines = buildCountryLines(world, radius);

    countryLinesMemoryCache = lines;
    try {
      localStorage.setItem(
        WORLD_ATLAS_STORAGE_KEY,
        JSON.stringify({ radius, lines })
      );
    } catch {
      // storage full/unavailable — in-memory cache still helps this session
    }
    return lines;
  })();

  return countryLinesPromise;
}

// ---------- World Map ----------
function WorldMap({ radius }: { radius: number }) {
  const [countryLines, setCountryLines] = useState<CountryLines>(
    () => countryLinesMemoryCache ?? []
  );

  useEffect(() => {
    if (countryLinesMemoryCache) return;
    let cancelled = false;
    loadCountryLines(radius)
      .then((lines) => {
        if (!cancelled) setCountryLines(lines);
      })
      .catch((error) => {
        console.error("Failed to load world data:", error);
      });
    return () => {
      cancelled = true;
    };
  }, [radius]);

  return (
    <group>
      {countryLines.map((points, i) => (
        <Line
          key={i}
          points={points}
          color="#ffffff"
          lineWidth={0.8}
          opacity={0.6}
          transparent
        />
      ))}
    </group>
  );
}

// ---------- Pawn 3D Object ----------
function PawnPiece() {
  const meshRef = useRef<THREE.Group>(null);
  const pawnObj = useLoader(OBJLoader, "/3D-objects/pawn-3d-object.obj");
  const elapsedRef = useRef(0);

  const geometry = useMemo(() => {
    let merged: THREE.BufferGeometry[] = [];
    pawnObj.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        const g = child.geometry.clone();
        g.applyMatrix4(child.matrix);
        merged.push(g);
      }
    });
    if (merged.length === 0) return null;
    const result = mergeBufferGeometries(merged);
    return result;
  }, [pawnObj]);

  useFrame((_, delta) => {
    elapsedRef.current += delta;
    if (meshRef.current) {
      const breathe = 1 + Math.sin(elapsedRef.current * 0.8) * 0.05;
      meshRef.current.scale.setScalar(breathe * 0.3);
      meshRef.current.rotation.y = elapsedRef.current * 0.2;
    }
  });

  if (!geometry) return null;

  return (
    <group ref={meshRef} position={[0, -0.15, 0]}>
      <pointLight position={[0.3, 0.5, 0.5]} intensity={8} color="#ffffff" distance={4} />
      <pointLight position={[-0.3, -0.2, -0.5]} intensity={5} color="#ffffff" distance={4} />
      <pointLight position={[0, 0.8, 0]} intensity={4} color="#ffffff" distance={3} />
      <mesh geometry={geometry} scale={[1, 1, 1]}>
        <meshStandardMaterial
          color="#000000"
          emissive="#222222"
          emissiveIntensity={0.3}
          metalness={0.3}
          roughness={0.6}
          side={THREE.DoubleSide}
        />
      </mesh>
    </group>
  );
}

function mergeBufferGeometries(
  geometries: THREE.BufferGeometry[]
): THREE.BufferGeometry {
  const totalVerts = geometries.reduce(
    (sum, g) => sum + g.getAttribute("position").count,
    0
  );
  const positions = new Float32Array(totalVerts * 3);
  const normals = new Float32Array(totalVerts * 3);
  const uvs = new Float32Array(totalVerts * 2);

  let offset = 0;
  for (const g of geometries) {
    const pos = g.getAttribute("position");
    positions.set(pos.array, offset * 3);
    const norm = g.getAttribute("normal");
    if (norm) normals.set(norm.array, offset * 3);
    const uv = g.getAttribute("uv");
    if (uv) uvs.set(uv.array, offset * 2);
    offset += pos.count;
  }

  const result = new THREE.BufferGeometry();
  result.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  result.setAttribute("normal", new THREE.BufferAttribute(normals, 3));
  result.setAttribute("uv", new THREE.BufferAttribute(uvs, 2));
  return result;
}

// ---------- Wireframe Hand ----------
function WireframeHand({ globeRadius }: { globeRadius: number }) {
  const handLines = useMemo(() => {
    const r = globeRadius;
    const lines: [number, number, number][][] = [];

    // Palm curve — cupping below the globe
    const palmPoints: [number, number, number][] = [];
    for (let i = 0; i <= 30; i++) {
      const t = (i / 30) * Math.PI;
      const x = Math.cos(t) * r * 1.15;
      const y = -Math.sin(t) * r * 0.5 - r * 0.85;
      const z = 0;
      palmPoints.push([x, y, z]);
    }
    lines.push(palmPoints);

    // Inner palm arc (slightly smaller)
    const innerPalm: [number, number, number][] = [];
    for (let i = 0; i <= 30; i++) {
      const t = (i / 30) * Math.PI;
      const x = Math.cos(t) * r * 0.95;
      const y = -Math.sin(t) * r * 0.35 - r * 0.95;
      const z = 0;
      innerPalm.push([x, y, z]);
    }
    lines.push(innerPalm);

    // Fingers extending from the palm edges
    const fingerConfigs = [
      { startT: 0.08, len: 0.55, curl: 0.4, side: 1 },   // thumb
      { startT: 0.2, len: 0.5, curl: 0.6, side: 1 },     // index
      { startT: 0.35, len: 0.55, curl: 0.65, side: 1 },   // middle
      { startT: 0.65, len: 0.5, curl: 0.65, side: -1 },   // ring
      { startT: 0.8, len: 0.4, curl: 0.6, side: -1 },     // pinky
    ];

    for (const finger of fingerConfigs) {
      const t0 = finger.startT * Math.PI;
      const baseX = Math.cos(t0) * r * 1.15;
      const baseY = -Math.sin(t0) * r * 0.5 - r * 0.85;

      const fingerPts: [number, number, number][] = [];
      const segments = 10;

      for (let j = 0; j <= segments; j++) {
        const frac = j / segments;
        const angle = t0 + frac * finger.curl * finger.side;
        const extensionR = r * 1.15 + frac * r * finger.len;
        const x = Math.cos(angle) * extensionR * (1 - frac * 0.15);
        const y =
          baseY +
          frac * r * finger.len * 0.8 * Math.sin(t0) +
          frac * frac * r * 0.1;
        const z = frac * 0.05;
        fingerPts.push([x, y, z]);
      }
      lines.push(fingerPts);
    }

    // Wrist lines
    const wristLeft: [number, number, number][] = [
      [r * 1.15, -r * 0.85, 0],
      [r * 1.1, -r * 1.5, 0],
      [r * 0.9, -r * 1.8, 0],
    ];
    const wristRight: [number, number, number][] = [
      [-r * 1.15, -r * 0.85, 0],
      [-r * 1.1, -r * 1.5, 0],
      [-r * 0.9, -r * 1.8, 0],
    ];
    lines.push(wristLeft);
    lines.push(wristRight);

    // Wrist connector
    const wristBottom: [number, number, number][] = [
      [r * 0.9, -r * 1.8, 0],
      [0, -r * 1.9, 0],
      [-r * 0.9, -r * 1.8, 0],
    ];
    lines.push(wristBottom);

    return lines;
  }, [globeRadius]);

  return (
    <group>
      {handLines.map((points, i) => (
        <Line
          key={`hand-${i}`}
          points={points}
          color="#ffffff"
          lineWidth={1}
          opacity={0.7}
          transparent
        />
      ))}
    </group>
  );
}

// ---------- Flag Marker ----------
interface FlagMarkerProps {
  lat: number;
  lng: number;
  country: "nepal" | "ghana";
  globeRadius: number;
}

const flagTexturePaths: Record<string, string> = {
  nepal: images.flagNepal,
  ghana: images.flagGhana,
};

function FlagMarker({ lat, lng, country, globeRadius }: FlagMarkerProps) {
  const groupRef = useRef<THREE.Group>(null);
  const flagRef = useRef<THREE.Group>(null);
  const texture = useTexture(flagTexturePaths[country]);
  const elapsedRef = useRef(0);

  const surfacePos = useMemo(
    () => latLngToVector3(lat, lng, globeRadius + 0.05),
    [lat, lng, globeRadius]
  );

  const flagPos = useMemo(() => {
    const v = new THREE.Vector3(...surfacePos).normalize();
    return v.multiplyScalar(globeRadius + 0.8).toArray() as [
      number,
      number,
      number,
    ];
  }, [surfacePos, globeRadius]);

  const linePoints = useMemo(
    () => [surfacePos, flagPos] as [number, number, number][],
    [surfacePos, flagPos]
  );

  const visualRef = useRef<THREE.Group>(null);

  useFrame((_, delta) => {
    elapsedRef.current += delta;
    if (flagRef.current && groupRef.current && visualRef.current) {
      flagRef.current.rotation.z =
        Math.sin(
          elapsedRef.current * 2 +
            (country === "nepal" ? 0 : Math.PI)
        ) * 0.05;

      const worldPos = new THREE.Vector3();
      groupRef.current.getWorldPosition(worldPos);
      const zDepth = -worldPos.z;
      const scale = 0.7 + Math.max(0, zDepth) * 0.4;
      visualRef.current.scale.setScalar(scale);
    }
  });

  return (
    <group ref={groupRef}>
      <Line
        points={linePoints}
        color="#cccccc"
        lineWidth={1}
        opacity={0.6}
        transparent
      />
      <group position={flagPos}>
        <group ref={visualRef}>
          <group ref={flagRef}>
            <mesh>
              <planeGeometry args={[0.45, 0.3]} />
              <meshStandardMaterial
                map={texture}
                side={THREE.DoubleSide}
                toneMapped={false}
              />
            </mesh>
            <mesh position={[-0.24, 0, 0]}>
              <cylinderGeometry args={[0.015, 0.015, 0.45, 8]} />
              <meshStandardMaterial
                color="#888"
                metalness={0.8}
                roughness={0.3}
              />
            </mesh>
          </group>
        </group>
      </group>
    </group>
  );
}

// ---------- Globe ----------
function Globe({
  mousePosition,
}: {
  mousePosition: { x: number; y: number };
}) {
  const globeRef = useRef<THREE.Group>(null);
  const gridRef = useRef<THREE.Group>(null);
  const elapsedRef = useRef(0);

  const globeRadius = 1.5;

  const gridLines = useMemo(() => {
    const lines: { start: THREE.Vector3; end: THREE.Vector3 }[] = [];
    const segments = 12;

    for (let i = 1; i < segments; i++) {
      const phi = (i / segments) * Math.PI;
      const y = Math.cos(phi) * globeRadius;
      const ringRadius = Math.sin(phi) * globeRadius;

      for (let j = 0; j < 32; j++) {
        const theta1 = (j / 32) * Math.PI * 2;
        const theta2 = ((j + 1) / 32) * Math.PI * 2;

        lines.push({
          start: new THREE.Vector3(
            Math.cos(theta1) * ringRadius,
            y,
            Math.sin(theta1) * ringRadius
          ),
          end: new THREE.Vector3(
            Math.cos(theta2) * ringRadius,
            y,
            Math.sin(theta2) * ringRadius
          ),
        });
      }
    }

    for (let i = 0; i < segments; i++) {
      const theta = (i / segments) * Math.PI * 2;

      for (let j = 0; j < 16; j++) {
        const phi1 = (j / 16) * Math.PI;
        const phi2 = ((j + 1) / 16) * Math.PI;

        lines.push({
          start: new THREE.Vector3(
            Math.sin(phi1) * Math.cos(theta) * globeRadius,
            Math.cos(phi1) * globeRadius,
            Math.sin(phi1) * Math.sin(theta) * globeRadius
          ),
          end: new THREE.Vector3(
            Math.sin(phi2) * Math.cos(theta) * globeRadius,
            Math.cos(phi2) * globeRadius,
            Math.sin(phi2) * Math.sin(theta) * globeRadius
          ),
        });
      }
    }

    return lines;
  }, [globeRadius]);

  useFrame((_, delta) => {
    elapsedRef.current += delta;
    if (globeRef.current) {
      globeRef.current.rotation.y = elapsedRef.current * 0.035;

      const targetRotationX = mousePosition.y * 0.1;
      const targetRotationZ = mousePosition.x * 0.05;

      globeRef.current.rotation.x +=
        (targetRotationX - globeRef.current.rotation.x) * 0.03;
      globeRef.current.rotation.z +=
        (targetRotationZ - globeRef.current.rotation.z) * 0.03;
    }
  });

  return (
    <group ref={globeRef}>
      {/* Main globe sphere — nearly transparent */}
      <Sphere args={[globeRadius, 64, 64]}>
        <meshStandardMaterial
          color="#1a1a1a"
          transparent
          opacity={0.1}
          wireframe={false}
        />
      </Sphere>

      {/* Lat/lng grid lines */}
      <group ref={gridRef}>
        {gridLines.map((line, i) => (
          <Line
            key={i}
            points={[
              line.start.toArray() as [number, number, number],
              line.end.toArray() as [number, number, number],
            ]}
            color="#ffffff"
            lineWidth={0.5}
            opacity={1}
            transparent={false}
          />
        ))}
      </group>

      {/* World map country outlines */}
      <WorldMap radius={globeRadius} />

      {/* Outer glow sphere */}
      <Sphere args={[globeRadius + 0.05, 32, 32]}>
        <meshStandardMaterial
          color="#ffffff"
          transparent
          opacity={0.05}
          side={THREE.BackSide}
        />
      </Sphere>

      {/* Flag markers at exact geographic positions */}
      <FlagMarker lat={28.3949} lng={84.124} country="nepal" globeRadius={globeRadius} />
      <FlagMarker lat={7.9465} lng={-1.0232} country="ghana" globeRadius={globeRadius} />

      {/* Chess pawn 3D object */}
      <PawnPiece />
    </group>
  );
}

// ---------- Main Export ----------
export function HeroGlobe() {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width - 0.5) * 2;
    const y = ((e.clientY - rect.top) / rect.height - 0.5) * 2;
    setMousePosition({ x, y });
  };

  return (
    <div
      className="w-full h-full min-h-[400px] md:min-h-[500px]"
      onMouseMove={handleMouseMove}
    >
      <Canvas
        camera={{ position: [0, 0, 5], fov: 45 }}
        dpr={[1, 1.5]}
        gl={{ antialias: true, alpha: true }}
        onCreated={() => window.dispatchEvent(new Event("globe-ready"))}
      >
        <ambientLight intensity={1.2} />
        <pointLight position={[10, 10, 10]} intensity={1.5} color="#fff" />
        <pointLight position={[-10, -10, -10]} intensity={0.8} color="#ffffff" />
        <spotLight
          position={[0, 5, 5]}
          angle={0.3}
          penumbra={1}
          intensity={1}
          color="#fff"
        />
        <Globe mousePosition={mousePosition} />
        {/* Wireframe hand sits below the globe, outside the rotating group */}
        <WireframeHand globeRadius={1.5} />
      </Canvas>
    </div>
  );
}
