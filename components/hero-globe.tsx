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
// Each country ring used to render as its own drei <Line> (its own draw
// call, its own fat-line shader instance) — with ~600+ rings in the 110m
// atlas that was 600+ draw calls every frame just for borders. Flattening
// every ring into one disconnected-segment list lets a single merged
// LineSegments2 draw the whole map in one call.
function ringsToSegments(rings: CountryLines): [number, number, number][] {
  const segments: [number, number, number][] = [];
  for (const ring of rings) {
    for (let i = 0; i < ring.length - 1; i++) {
      segments.push(ring[i], ring[i + 1]);
    }
  }
  return segments;
}

function WorldMap({
  radius,
  onLoaded,
}: {
  radius: number;
  onLoaded?: () => void;
}) {
  const [countryLines, setCountryLines] = useState<CountryLines>(
    () => countryLinesMemoryCache ?? []
  );
  const onLoadedRef = useRef(onLoaded);
  onLoadedRef.current = onLoaded;

  useEffect(() => {
    if (countryLinesMemoryCache) {
      onLoadedRef.current?.();
      return;
    }
    let cancelled = false;
    loadCountryLines(radius)
      .then((lines) => {
        if (!cancelled) setCountryLines(lines);
      })
      .catch((error) => {
        console.error("Failed to load world data:", error);
      })
      .finally(() => {
        if (!cancelled) onLoadedRef.current?.();
      });
    return () => {
      cancelled = true;
    };
  }, [radius]);

  const segments = useMemo(() => ringsToSegments(countryLines), [countryLines]);

  if (segments.length === 0) return null;

  return (
    <Line
      segments
      points={segments}
      color="#ffffff"
      lineWidth={0.8}
      opacity={0.6}
      transparent
    />
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
  onWorldMapLoaded,
}: {
  mousePosition: { x: number; y: number };
  onWorldMapLoaded?: () => void;
}) {
  const globeRef = useRef<THREE.Group>(null);
  const gridRef = useRef<THREE.Group>(null);
  const elapsedRef = useRef(0);

  const globeRadius = 1.5;

  // Flat [start, end, start, end, ...] segment list so the whole grid (was
  // 576 separate <Line> draw calls) renders as one merged LineSegments2.
  const gridSegments = useMemo(() => {
    const points: [number, number, number][] = [];
    const segments = 12;

    for (let i = 1; i < segments; i++) {
      const phi = (i / segments) * Math.PI;
      const y = Math.cos(phi) * globeRadius;
      const ringRadius = Math.sin(phi) * globeRadius;

      for (let j = 0; j < 32; j++) {
        const theta1 = (j / 32) * Math.PI * 2;
        const theta2 = ((j + 1) / 32) * Math.PI * 2;

        points.push(
          [
            Math.cos(theta1) * ringRadius,
            y,
            Math.sin(theta1) * ringRadius,
          ],
          [
            Math.cos(theta2) * ringRadius,
            y,
            Math.sin(theta2) * ringRadius,
          ]
        );
      }
    }

    for (let i = 0; i < segments; i++) {
      const theta = (i / segments) * Math.PI * 2;

      for (let j = 0; j < 16; j++) {
        const phi1 = (j / 16) * Math.PI;
        const phi2 = ((j + 1) / 16) * Math.PI;

        points.push(
          [
            Math.sin(phi1) * Math.cos(theta) * globeRadius,
            Math.cos(phi1) * globeRadius,
            Math.sin(phi1) * Math.sin(theta) * globeRadius,
          ],
          [
            Math.sin(phi2) * Math.cos(theta) * globeRadius,
            Math.cos(phi2) * globeRadius,
            Math.sin(phi2) * Math.sin(theta) * globeRadius,
          ]
        );
      }
    }

    return points;
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
        <Line
          segments
          points={gridSegments}
          color="#ffffff"
          lineWidth={0.5}
          opacity={1}
          transparent={false}
        />
      </group>

      {/* World map country outlines */}
      <WorldMap radius={globeRadius} onLoaded={onWorldMapLoaded} />

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

// Mounts only once every Suspense-blocking resource inside the Canvas
// (pawn OBJ, flag textures) has resolved — Canvas wraps its children in a
// single shared <Suspense>, so this sibling's effect can't fire any earlier.
function SuspenseReadySignal({ onReady }: { onReady: () => void }) {
  useEffect(() => {
    onReady();
  }, [onReady]);
  return null;
}

// ---------- Main Export ----------
export function HeroGlobe() {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const suspenseReadyRef = useRef(false);
  const worldMapReadyRef = useRef(false);
  const signalledRef = useRef(false);
  const containerRef = useRef<HTMLDivElement>(null);
  // Globe keeps rotating + rendering even once the user has scrolled past
  // it, burning a draw call budget on every frame for nothing visible.
  // Stop the Canvas's frameloop entirely while it's off-screen.
  const [isVisible, setIsVisible] = useState(true);
  // Only mount the Canvas after the component has mounted on the client, so
  // react-three-fiber measures the container once it's actually laid out
  // (and not mid-entrance-animation). Avoids the "loads small/offset then
  // snaps to the right size/position a few seconds later" glitch.
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const el = containerRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => setIsVisible(entry.isIntersecting),
      { threshold: 0 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const maybeSignalReady = () => {
    if (signalledRef.current) return;
    if (suspenseReadyRef.current && worldMapReadyRef.current) {
      signalledRef.current = true;
      window.dispatchEvent(new Event("globe-ready"));
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width - 0.5) * 2;
    const y = ((e.clientY - rect.top) / rect.height - 0.5) * 2;
    setMousePosition({ x, y });
  };

  return (
    <div
      ref={containerRef}
      className="w-full h-full"
      onMouseMove={handleMouseMove}
    >
      {mounted && (
      <Canvas
        camera={{ position: [0, 0, 5], fov: 45 }}
        dpr={[1, 1.5]}
        gl={{ antialias: true, alpha: true }}
        frameloop={isVisible ? "always" : "never"}
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
        <Globe
          mousePosition={mousePosition}
          onWorldMapLoaded={() => {
            worldMapReadyRef.current = true;
            maybeSignalReady();
          }}
        />
        <SuspenseReadySignal
          onReady={() => {
            suspenseReadyRef.current = true;
            maybeSignalReady();
          }}
        />
      </Canvas>
      )}
    </div>
  );
}
