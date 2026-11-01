import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import gsap from 'gsap';
import { CAMPUS_BUILDINGS, type CampusBuilding } from './campusData';
import {
  BookOpen,
  Building2,
  Trophy,
  GraduationCap,
  Sparkles,
  Users,
  Compass,
  Bed,
  Layers,
} from 'lucide-react';

interface Campus3DSceneProps {
  onSelectBuilding: (building: CampusBuilding | null) => void;
  selectedBuildingId: string | null;
  timeOfDay?: 'day' | 'sunset' | 'night';
}

interface ProjectedBadge {
  id: string;
  name: string;
  code: string;
  iconType: string;
  x: number;
  y: number;
  visible: boolean;
}

export const Campus3DScene: React.FC<Campus3DSceneProps> = ({
  onSelectBuilding,
  selectedBuildingId,
  timeOfDay = 'day',
}) => {
  const mountRef = useRef<HTMLDivElement | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);

  const buildingGroupsRef = useRef<Map<string, THREE.Group>>(new Map());
  const hoveredBuildingRef = useRef<CampusBuilding | null>(null);
  const [projectedBadges, setProjectedBadges] = useState<ProjectedBadge[]>([]);

  const dirLightRef = useRef<THREE.DirectionalLight | null>(null);
  const skyBounceLightRef = useRef<THREE.DirectionalLight | null>(null);
  const hemiLightRef = useRef<THREE.HemisphereLight | null>(null);
  const ambientLightRef = useRef<THREE.AmbientLight | null>(null);

  // Keep track of animated elements like water, flags, and fountain
  const waterMeshRef = useRef<THREE.Mesh | null>(null);
  const fountainParticlesRef = useRef<THREE.Points | null>(null);

  // Initialize Three.js Scene
  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const width = container.clientWidth;
    const height = container.clientHeight;

    // 1. Scene with Fresh Crisp Daylight Atmosphere
    const scene = new THREE.Scene();
    sceneRef.current = scene;
    scene.background = new THREE.Color(0xd9ebf6);
    scene.fog = new THREE.FogExp2(0xd9ebf6, 0.0014);

    // 2. Camera: Elevated Isometric Aerial Angle matching reference image
    const camera = new THREE.PerspectiveCamera(38, width / height, 1, 2600);
    camera.position.set(-20, 240, 310);
    cameraRef.current = camera;

    // 3. Renderer with High-Definition Soft Shadows & ACES Tone Mapping
    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance',
      stencil: false,
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;
    rendererRef.current = renderer;
    container.appendChild(renderer.domElement);

    // 4. OrbitControls with smooth damping and pitch bounds
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.06;
    controls.maxPolarAngle = Math.PI / 2.14; // Prevent going below ground
    controls.minDistance = 45;
    controls.maxDistance = 560;
    controls.target.set(0, 0, 15);
    controlsRef.current = controls;

    // 5. Photographic Lighting System:
    // A) Hemisphere ambient gradient (Sky soft blue to ground rich grass warm tone)
    const hemiLight = new THREE.HemisphereLight(0xffffff, 0x4a5d43, 0.82);
    hemiLight.position.set(0, 300, 0);
    scene.add(hemiLight);
    hemiLightRef.current = hemiLight;

    // B) Main Directional Sunlight (Crisp warm sunlight casting razor-sharp architectural shadows)
    const dirLight = new THREE.DirectionalLight(0xfff7e8, 1.85);
    dirLight.position.set(160, 240, 130);
    dirLight.castShadow = true;
    dirLight.shadow.mapSize.width = 4096;
    dirLight.shadow.mapSize.height = 4096;
    dirLight.shadow.camera.near = 10;
    dirLight.shadow.camera.far = 750;
    const d = 260;
    dirLight.shadow.camera.left = -d;
    dirLight.shadow.camera.right = d;
    dirLight.shadow.camera.top = d;
    dirLight.shadow.camera.bottom = -d;
    dirLight.shadow.bias = -0.00015;
    dirLight.shadow.normalBias = 0.02;
    scene.add(dirLight);
    dirLightRef.current = dirLight;

    // C) Sky Bounce Fill Light (Fills shadow recesses with natural atmospheric sky reflectance)
    const skyBounceLight = new THREE.DirectionalLight(0xa5c4e8, 0.55);
    skyBounceLight.position.set(-160, 180, -140);
    scene.add(skyBounceLight);
    skyBounceLightRef.current = skyBounceLight;

    // D) Soft Warm Ground Ambient
    const ambientLight = new THREE.AmbientLight(0xfff3df, 0.35);
    scene.add(ambientLight);
    ambientLightRef.current = ambientLight;

    // 6. BUILD COMPLETE PHOTOREALISTIC CIT UNIVERSITY CAMPUS
    buildPhotorealisticGround(scene);
    buildRoadNetworkAndEntrance(scene);
    buildPedestrianWalkwayNetwork(scene);
    buildSportsAndAthleticsComplex(scene);
    buildCentralLawnAndPlazas(scene);
    buildScenicLakeAndOAT(scene, waterMeshRef, fountainParticlesRef);
    buildAllRealisticBuildings(scene, buildingGroupsRef.current);
    buildDenseVegetation(scene);
    buildStreetFurnitureAndVehicles(scene);

    // 7. Raycasting for hover & selection
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    const handleMouseMove = (event: MouseEvent) => {
      const rect = renderer.domElement.getBoundingClientRect();
      mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);

      const interactiveMeshes: THREE.Object3D[] = [];
      buildingGroupsRef.current.forEach((grp) => {
        grp.traverse((child) => {
          if (child instanceof THREE.Mesh) {
            interactiveMeshes.push(child);
          }
        });
      });

      const intersects = raycaster.intersectObjects(interactiveMeshes, false);

      if (intersects.length > 0) {
        let rootGroup: THREE.Object3D | null = intersects[0].object;
        while (rootGroup && !rootGroup.userData.buildingId) {
          rootGroup = rootGroup.parent;
        }

        if (rootGroup && rootGroup.userData.buildingId) {
          const bldg = CAMPUS_BUILDINGS.find((b) => b.id === rootGroup!.userData.buildingId);
          if (bldg) {
            hoveredBuildingRef.current = bldg;
            container.style.cursor = 'pointer';
            return;
          }
        }
      }

      hoveredBuildingRef.current = null;
      container.style.cursor = 'default';
    };

    const handleClick = () => {
      if (hoveredBuildingRef.current) {
        selectAndFocusBuilding(hoveredBuildingRef.current);
      }
    };

    renderer.domElement.addEventListener('mousemove', handleMouseMove);
    renderer.domElement.addEventListener('click', handleClick);

    // 8. Resize Handler
    const handleResize = () => {
      if (!container || !rendererRef.current || !cameraRef.current) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      cameraRef.current.aspect = w / h;
      cameraRef.current.updateProjectionMatrix();
      rendererRef.current.setSize(w, h);
    };

    window.addEventListener('resize', handleResize);

    // 9. Animation Loop with Micro-Animations & Screen Projection
    let animId: number;
    let clock = new THREE.Clock();
    const tempVec = new THREE.Vector3();

    const animate = () => {
      animId = requestAnimationFrame(animate);
      const elapsedTime = clock.getElapsedTime();

      controls.update();

      // Subtle water shimmer animation
      if (waterMeshRef.current && waterMeshRef.current.material instanceof THREE.MeshStandardMaterial) {
        waterMeshRef.current.material.roughness = 0.08 + Math.sin(elapsedTime * 2.5) * 0.03;
      }

      // Animate fountain particles
      if (fountainParticlesRef.current) {
        const positions = fountainParticlesRef.current.geometry.attributes.position.array as Float32Array;
        for (let i = 1; i < positions.length; i += 3) {
          positions[i] = 1.5 + Math.abs(Math.sin(elapsedTime * 4 + i)) * 6.5;
        }
        fountainParticlesRef.current.geometry.attributes.position.needsUpdate = true;
      }

      // Project 3D building coordinates to 2D screen positions only for active selected building
      if (container && cameraRef.current) {
        const w = container.clientWidth;
        const h = container.clientHeight;
        const halfW = w / 2;
        const halfH = h / 2;

        const newBadges: ProjectedBadge[] = [];

        CAMPUS_BUILDINGS.forEach((bldg) => {
          tempVec.set(bldg.position[0], bldg.position[1] + 30, bldg.position[2]);
          tempVec.project(cameraRef.current!);

          const isVisible =
            tempVec.z < 1 &&
            tempVec.x >= -1.1 &&
            tempVec.x <= 1.1 &&
            tempVec.y >= -1.1 &&
            tempVec.y <= 1.1;

          newBadges.push({
            id: bldg.id,
            name: bldg.name,
            code: bldg.code,
            iconType: bldg.iconType,
            x: tempVec.x * halfW + halfW,
            y: -tempVec.y * halfH + halfH,
            visible: isVisible,
          });
        });

        setProjectedBadges(newBadges);
      }

      // Gentle building selection highlight
      buildingGroupsRef.current.forEach((grp, id) => {
        const isHovered = hoveredBuildingRef.current?.id === id;
        const isSelected = selectedBuildingId === id;
        const highlightBox = grp.getObjectByName('highlightBox');
        if (highlightBox && highlightBox instanceof THREE.Mesh) {
          highlightBox.visible = isHovered || isSelected;
          if (highlightBox.visible) {
            highlightBox.material.opacity = isSelected ? 0.35 : 0.18;
          }
        }
      });

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
      renderer.domElement.removeEventListener('mousemove', handleMouseMove);
      renderer.domElement.removeEventListener('click', handleClick);
      renderer.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [selectedBuildingId]);

  // Handle Day / Sunset / Night mode changes with rich atmospheric lighting
  useEffect(() => {
    if (
      !sceneRef.current ||
      !dirLightRef.current ||
      !skyBounceLightRef.current ||
      !hemiLightRef.current ||
      !ambientLightRef.current
    )
      return;

    const scene = sceneRef.current;
    const dirLight = dirLightRef.current;
    const skyBounce = skyBounceLightRef.current;
    const hemiLight = hemiLightRef.current;
    const ambientLight = ambientLightRef.current;

    if (timeOfDay === 'day') {
      scene.background = new THREE.Color(0xd9ebf6);
      scene.fog = new THREE.FogExp2(0xd9ebf6, 0.0014);
      dirLight.color.setHex(0xfff7e8);
      dirLight.intensity = 1.85;
      dirLight.position.set(160, 240, 130);
      skyBounce.color.setHex(0xa5c4e8);
      skyBounce.intensity = 0.55;
      hemiLight.color.setHex(0xffffff);
      hemiLight.groundColor.setHex(0x4a5d43);
      hemiLight.intensity = 0.82;
      ambientLight.color.setHex(0xfff3df);
      ambientLight.intensity = 0.35;
    } else if (timeOfDay === 'sunset') {
      scene.background = new THREE.Color(0xfba567);
      scene.fog = new THREE.FogExp2(0xfba567, 0.0017);
      dirLight.color.setHex(0xf97316);
      dirLight.intensity = 2.1;
      dirLight.position.set(-190, 110, -80);
      skyBounce.color.setHex(0xfb923c);
      skyBounce.intensity = 0.4;
      hemiLight.color.setHex(0xfed7aa);
      hemiLight.groundColor.setHex(0x7c2d12);
      hemiLight.intensity = 0.65;
      ambientLight.color.setHex(0xfdba74);
      ambientLight.intensity = 0.3;
    } else {
      // Night mode
      scene.background = new THREE.Color(0x060e20);
      scene.fog = new THREE.FogExp2(0x081329, 0.0022);
      dirLight.color.setHex(0x38bdf8);
      dirLight.intensity = 0.45;
      dirLight.position.set(-80, 150, 100);
      skyBounce.color.setHex(0x1e3a8a);
      skyBounce.intensity = 0.25;
      hemiLight.color.setHex(0x1e3a8a);
      hemiLight.groundColor.setHex(0x030712);
      hemiLight.intensity = 0.32;
      ambientLight.color.setHex(0x1e293b);
      ambientLight.intensity = 0.2;
    }
  }, [timeOfDay]);

  // Focus and fly smoothly to selected building
  const selectAndFocusBuilding = useCallback(
    (bldg: CampusBuilding) => {
      onSelectBuilding(bldg);
      if (!cameraRef.current || !controlsRef.current) return;

      const targetPos = bldg.position;
      gsap.to(controlsRef.current.target, {
        x: targetPos[0],
        y: targetPos[1] + 12,
        z: targetPos[2],
        duration: 1.3,
        ease: 'power2.out',
      });

      gsap.to(cameraRef.current.position, {
        x: targetPos[0] - 45,
        y: targetPos[1] + 52,
        z: targetPos[2] + 76,
        duration: 1.3,
        ease: 'power2.out',
      });
    },
    [onSelectBuilding]
  );

  // Smooth reset to Aerial Campus View
  const handleResetCamera = useCallback(() => {
    if (!cameraRef.current || !controlsRef.current) return;
    gsap.to(controlsRef.current.target, {
      x: 0,
      y: 0,
      z: 15,
      duration: 1.4,
      ease: 'power2.out',
    });
    gsap.to(cameraRef.current.position, {
      x: -20,
      y: 240,
      z: 310,
      duration: 1.4,
      ease: 'power2.out',
    });
  }, []);

  const getBadgeIcon = (type: string) => {
    switch (type) {
      case 'library':
        return <BookOpen className="w-3.5 h-3.5 text-cyan-300" />;
      case 'admin':
        return <Building2 className="w-3.5 h-3.5 text-amber-300" />;
      case 'indoor':
      case 'stadium':
        return <Trophy className="w-3.5 h-3.5 text-emerald-300" />;
      case 'academic':
        return <GraduationCap className="w-3.5 h-3.5 text-blue-300" />;
      case 'auditorium':
      case 'oat':
        return <Users className="w-3.5 h-3.5 text-purple-300" />;
      case 'innov':
        return <Sparkles className="w-3.5 h-3.5 text-cyan-300" />;
      case 'sac':
        return <Compass className="w-3.5 h-3.5 text-teal-300" />;
      case 'hostel':
        return <Bed className="w-3.5 h-3.5 text-indigo-300" />;
      default:
        return <Layers className="w-3.5 h-3.5 text-cyan-300" />;
    }
  };

  return (
    <div className="relative w-full h-full select-none overflow-hidden rounded-3xl">
      <div ref={mountRef} className="w-full h-full" />

      {/* Selected Building 3D Pin Beacon (Only appears when building is clicked) */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-20">
        {projectedBadges
          .filter((badge) => badge.visible && selectedBuildingId === badge.id)
          .map((badge) => (
            <div
              key={badge.id}
              style={{
                left: `${badge.x}px`,
                top: `${badge.y}px`,
                transform: 'translate(-50%, -100%)',
              }}
              className="absolute pointer-events-none flex flex-col items-center animate-fadeIn drop-shadow-[0_8px_24px_rgba(0,0,0,0.6)]"
            >
              <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-950/95 border border-cyan-400 text-white backdrop-blur-md shadow-2xl">
                <div className="p-1 rounded-full bg-cyan-500 text-slate-950 shrink-0">
                  {getBadgeIcon(badge.iconType)}
                </div>
                <div className="flex flex-col text-left">
                  <span className="text-[12px] font-extrabold tracking-tight text-white whitespace-nowrap">
                    {badge.name}
                  </span>
                  <span className="text-[9px] font-mono text-cyan-300 -mt-0.5">{badge.code}</span>
                </div>
              </div>
              {/* Pointer triangle & glowing beacon orb */}
              <div className="w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[8px] border-t-cyan-400 -mt-[1px]" />
              <div className="w-2.5 h-2.5 rounded-full bg-cyan-400 shadow-[0_0_12px_#22d3ee] animate-pulse -mt-1" />
            </div>
          ))}
      </div>

      {/* Quick Camera Reset Control */}
      <div className="absolute top-4 left-4 z-20 flex items-center gap-2">
        <button
          onClick={handleResetCamera}
          className="px-3.5 py-1.5 rounded-xl liquid-glass-navbar text-xs font-semibold text-white hover:border-cyan-400 shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
        >
          <Compass className="w-3.5 h-3.5 text-cyan-400" />
          <span>Full Aerial Campus</span>
        </button>
      </div>
    </div>
  );
};

/* =========================================================================
   PROCEDURAL THREE.JS MESH BUILDERS — ULTRA-REALISTIC UNIVERSITY CAMPUS
========================================================================= */

// 1. Terrain & Manicured Fairway Lawn Base
function buildPhotorealisticGround(scene: THREE.Scene) {
  // Main Grass Ground Base Plane with Natural Green Color
  const groundGeo = new THREE.PlaneGeometry(680, 680, 32, 32);
  const groundMat = new THREE.MeshStandardMaterial({
    color: 0x3d702d,
    roughness: 0.88,
    metalness: 0.04,
  });
  const ground = new THREE.Mesh(groundGeo, groundMat);
  ground.rotation.x = -Math.PI / 2;
  ground.receiveShadow = true;
  scene.add(ground);

  // Mown Fairway Lawn Stripes across central campus (alternating light & dark grass)
  const stripeMatLight = new THREE.MeshStandardMaterial({
    color: 0x477d33,
    roughness: 0.85,
  });
  for (let z = -140; z <= 180; z += 18) {
    const stripe = new THREE.Mesh(new THREE.PlaneGeometry(360, 9), stripeMatLight);
    stripe.rotation.x = -Math.PI / 2;
    stripe.position.set(0, 0.02, z);
    stripe.receiveShadow = true;
    scene.add(stripe);
  }

  // Outer Surrounding Landscape Ring (Darker Forest / Regional tree line edge)
  const outerRing = new THREE.Mesh(
    new THREE.RingGeometry(245, 340, 48),
    new THREE.MeshLambertMaterial({ color: 0x224219 })
  );
  outerRing.rotation.x = -Math.PI / 2;
  outerRing.position.y = 0.03;
  scene.add(outerRing);

  // Manicured Campus Green Parterre Lawn Pad (Front of Admin Building)
  const lawnGeo = new THREE.BoxGeometry(116, 1.4, 82);
  const lawnMat = new THREE.MeshStandardMaterial({ color: 0x488a33, roughness: 0.78 });
  const lawn = new THREE.Mesh(lawnGeo, lawnMat);
  lawn.position.set(40, 0.7, 15);
  lawn.receiveShadow = true;
  scene.add(lawn);

  // Decorative Boxwood Hedgerow around the lawn
  const hedgeMat = new THREE.MeshStandardMaterial({ color: 0x1e461b, roughness: 0.9 });
  const hedgeBorder = new THREE.Mesh(new THREE.BoxGeometry(118, 2.2, 2.4), hedgeMat);
  hedgeBorder.position.set(40, 1.1, 56);
  hedgeBorder.castShadow = true;
  scene.add(hedgeBorder);
}

// Helper for high-definition architectural signage textures
function createSignTexture(
  title: string,
  subtitle?: string,
  primaryColor = '#fde047',
  bgColor = '#0a1128'
): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 160;
  const ctx = canvas.getContext('2d')!;

  // Background with subtle glossy bevel
  ctx.fillStyle = bgColor;
  ctx.fillRect(0, 0, 512, 160);

  // Outer polished gold border
  ctx.strokeStyle = primaryColor;
  ctx.lineWidth = 6;
  ctx.strokeRect(6, 6, 500, 148);

  // Inner decorative border
  ctx.lineWidth = 1.5;
  ctx.strokeRect(12, 12, 488, 136);

  // Main embossed text
  ctx.fillStyle = primaryColor;
  ctx.font = '900 82px "Outfit", "Inter", sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.shadowColor = 'rgba(0, 0, 0, 0.9)';
  ctx.shadowBlur = 12;
  ctx.shadowOffsetY = 4;
  ctx.fillText(title, 256, subtitle ? 62 : 80);

  // Subtitle
  if (subtitle) {
    ctx.shadowBlur = 0;
    ctx.shadowOffsetY = 0;
    ctx.font = '700 20px "Outfit", "Inter", sans-serif';
    ctx.fillStyle = '#f8fafc';
    ctx.letterSpacing = '2px';
    ctx.fillText(subtitle, 256, 118);
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.anisotropy = 8;
  return texture;
}

// Helper to construct 3D metallic relief letters 'C I T'
function create3DLettersCIT(goldMat: THREE.Material): THREE.Group {
  const lettersGroup = new THREE.Group();

  // Letter C (at x = -4.2)
  const cGroup = new THREE.Group();
  cGroup.position.set(-4.2, 0, 0);
  const cSpine = new THREE.Mesh(new THREE.BoxGeometry(0.7, 3.4, 0.5), goldMat);
  cSpine.position.set(-1.0, 1.7, 0);
  cSpine.castShadow = true;
  cGroup.add(cSpine);

  const cTop = new THREE.Mesh(new THREE.BoxGeometry(2.3, 0.7, 0.5), goldMat);
  cTop.position.set(0.1, 3.05, 0);
  cTop.castShadow = true;
  cGroup.add(cTop);

  const cBottom = new THREE.Mesh(new THREE.BoxGeometry(2.3, 0.7, 0.5), goldMat);
  cBottom.position.set(0.1, 0.35, 0);
  cBottom.castShadow = true;
  cGroup.add(cBottom);
  lettersGroup.add(cGroup);

  // Letter I (at x = 0)
  const iGroup = new THREE.Group();
  iGroup.position.set(0, 0, 0);
  const iSpine = new THREE.Mesh(new THREE.BoxGeometry(0.8, 3.4, 0.5), goldMat);
  iSpine.position.set(0, 1.7, 0);
  iSpine.castShadow = true;
  iGroup.add(iSpine);

  const iTop = new THREE.Mesh(new THREE.BoxGeometry(2.2, 0.6, 0.5), goldMat);
  iTop.position.set(0, 3.1, 0);
  iTop.castShadow = true;
  iGroup.add(iTop);

  const iBottom = new THREE.Mesh(new THREE.BoxGeometry(2.2, 0.6, 0.5), goldMat);
  iBottom.position.set(0, 0.3, 0);
  iBottom.castShadow = true;
  iGroup.add(iBottom);
  lettersGroup.add(iGroup);

  // Letter T (at x = 4.2)
  const tGroup = new THREE.Group();
  tGroup.position.set(4.2, 0, 0);
  const tSpine = new THREE.Mesh(new THREE.BoxGeometry(0.8, 2.8, 0.5), goldMat);
  tSpine.position.set(0, 1.4, 0);
  tSpine.castShadow = true;
  tGroup.add(tSpine);

  const tTop = new THREE.Mesh(new THREE.BoxGeometry(3.0, 0.7, 0.5), goldMat);
  tTop.position.set(0, 3.05, 0);
  tTop.castShadow = true;
  tGroup.add(tTop);
  lettersGroup.add(tGroup);

  return lettersGroup;
}

// 2. Asphalt Roads, Avenues, Curbs, and Grand CIT Entrance Portal
function buildRoadNetworkAndEntrance(scene: THREE.Scene) {
  const roadMat = new THREE.MeshStandardMaterial({
    color: 0x22262c,
    roughness: 0.82,
    metalness: 0.12,
  });
  const curbMat = new THREE.MeshStandardMaterial({
    color: 0xd4cdc0,
    roughness: 0.75,
  });
  const whiteMarkingMat = new THREE.MeshBasicMaterial({ color: 0xf8fafc });
  const yellowMarkingMat = new THREE.MeshBasicMaterial({ color: 0xfbbf24 });

  // Main Peripheral Ring Road (Asphalt Loop encircling campus)
  const ringRoad = new THREE.Mesh(new THREE.RingGeometry(204, 230, 64), roadMat);
  ringRoad.rotation.x = -Math.PI / 2;
  ringRoad.position.y = 0.08;
  ringRoad.receiveShadow = true;
  scene.add(ringRoad);

  // Curbs on Ring Road
  const ringCurbInner = new THREE.Mesh(new THREE.RingGeometry(203, 204, 64), curbMat);
  ringCurbInner.rotation.x = -Math.PI / 2;
  ringCurbInner.position.y = 0.18;
  scene.add(ringCurbInner);

  const ringCurbOuter = new THREE.Mesh(new THREE.RingGeometry(230, 231, 64), curbMat);
  ringCurbOuter.rotation.x = -Math.PI / 2;
  ringCurbOuter.position.y = 0.18;
  scene.add(ringCurbOuter);

  // Grand Entrance Boulevard (South, from gate Z = 190 leading North to Z = 45)
  const boulevard = new THREE.Mesh(new THREE.PlaneGeometry(26, 150), roadMat);
  boulevard.rotation.x = -Math.PI / 2;
  boulevard.position.set(0, 0.1, 120);
  boulevard.receiveShadow = true;
  scene.add(boulevard);

  // Center Landscaped Median with yellow curb borders and palm trees
  const median = new THREE.Mesh(
    new THREE.BoxGeometry(4.0, 0.7, 130),
    new THREE.MeshLambertMaterial({ color: 0x3d702d })
  );
  median.position.set(0, 0.4, 125);
  scene.add(median);

  const yellowBorderL = new THREE.Mesh(new THREE.PlaneGeometry(0.35, 130), yellowMarkingMat);
  yellowBorderL.rotation.x = -Math.PI / 2;
  yellowBorderL.position.set(-2.0, 0.14, 125);
  scene.add(yellowBorderL);

  const yellowBorderR = new THREE.Mesh(new THREE.PlaneGeometry(0.35, 130), yellowMarkingMat);
  yellowBorderR.rotation.x = -Math.PI / 2;
  yellowBorderR.position.set(2.0, 0.14, 125);
  scene.add(yellowBorderR);

  // White Lane Markings along Boulevard
  for (let z = 60; z <= 180; z += 12) {
    const markL = new THREE.Mesh(new THREE.PlaneGeometry(0.45, 4.5), whiteMarkingMat);
    markL.rotation.x = -Math.PI / 2;
    markL.position.set(-6.5, 0.13, z);
    scene.add(markL);

    const markR = new THREE.Mesh(new THREE.PlaneGeometry(0.45, 4.5), whiteMarkingMat);
    markR.rotation.x = -Math.PI / 2;
    markR.position.set(6.5, 0.13, z);
    scene.add(markR);
  }

  // Cross-Campus Primary Cross-Roads
  // East-West cross road behind Entrance
  const crossRoadS = new THREE.Mesh(new THREE.PlaneGeometry(360, 16), roadMat);
  crossRoadS.rotation.x = -Math.PI / 2;
  crossRoadS.position.set(0, 0.09, 175);
  scene.add(crossRoadS);

  // North-South Academic Quad Access Road
  const roadWest = new THREE.Mesh(new THREE.PlaneGeometry(16, 280), roadMat);
  roadWest.rotation.x = -Math.PI / 2;
  roadWest.position.set(-110, 0.09, 45);
  scene.add(roadWest);

  // East Event Access Road
  const roadEast = new THREE.Mesh(new THREE.PlaneGeometry(16, 260), roadMat);
  roadEast.rotation.x = -Math.PI / 2;
  roadEast.position.set(135, 0.09, 25);
  scene.add(roadEast);

  // --- GRAND MONUMENTAL CIT ENTRANCE GATE (Bottom Center Z = 185) ---
  const gateGroup = new THREE.Group();
  gateGroup.position.set(0, 0, 185);

  const gateStoneMat = new THREE.MeshStandardMaterial({
    color: 0xbe6e3a,
    roughness: 0.6,
    metalness: 0.15,
  });

  // Left & Right Monumental Stone Pylons
  const pL = new THREE.Mesh(new THREE.BoxGeometry(6.0, 19, 6.0), gateStoneMat);
  pL.position.set(-19, 9.5, 0);
  pL.castShadow = true;
  gateGroup.add(pL);

  const pR = new THREE.Mesh(new THREE.BoxGeometry(6.0, 19, 6.0), gateStoneMat);
  pR.position.set(19, 9.5, 0);
  pR.castShadow = true;
  gateGroup.add(pR);

  // Monumental Overhead Gateway Header Arch
  const header = new THREE.Mesh(new THREE.BoxGeometry(44, 5.5, 4.8), gateStoneMat);
  header.position.set(0, 17.5, 0);
  header.castShadow = true;
  gateGroup.add(header);

  // Sign Board with crisp texture: "CIT - CHILIKA INSTITUTE OF TECHNOLOGY"
  const gateSignTex = createSignTexture('CIT', 'CHILIKA INSTITUTE OF TECHNOLOGY');
  const gateSignMat = new THREE.MeshStandardMaterial({
    map: gateSignTex,
    metalness: 0.4,
    roughness: 0.28,
  });
  const signBoard = new THREE.Mesh(new THREE.BoxGeometry(34, 3.6, 5.2), gateSignMat);
  signBoard.position.set(0, 17.5, 0.1);
  gateGroup.add(signBoard);

  // Central Security Checkpoint Guard Booth with glass booth windows
  const guardBooth = new THREE.Mesh(
    new THREE.BoxGeometry(5.0, 4.5, 8.0),
    new THREE.MeshStandardMaterial({ color: 0xe2e8f0, roughness: 0.35 })
  );
  guardBooth.position.set(0, 2.25, 0);
  guardBooth.castShadow = true;
  gateGroup.add(guardBooth);

  const guardGlass = new THREE.Mesh(
    new THREE.BoxGeometry(5.2, 1.6, 6.0),
    new THREE.MeshStandardMaterial({ color: 0x0f2942, roughness: 0.1, metalness: 0.9 })
  );
  guardGlass.position.set(0, 2.6, 0);
  gateGroup.add(guardGlass);

  // Pedestrian Zebra Crossing in front of gate
  for (let x = -14; x <= 14; x += 3.0) {
    const stripe = new THREE.Mesh(new THREE.PlaneGeometry(1.8, 6.5), whiteMarkingMat);
    stripe.rotation.x = -Math.PI / 2;
    stripe.position.set(x, 0.13, 192);
    scene.add(stripe);
  }

  scene.add(gateGroup);
}

// 3. Interlocking Pedestrian Walkway Network Connecting All Facilities
function buildPedestrianWalkwayNetwork(scene: THREE.Scene) {
  const paverMat = new THREE.MeshStandardMaterial({
    color: 0xded6c7,
    roughness: 0.72,
    metalness: 0.05,
  });

  const createPath = (x: number, z: number, w: number, d: number, rotY = 0) => {
    const path = new THREE.Mesh(new THREE.PlaneGeometry(w, d), paverMat);
    path.rotation.x = -Math.PI / 2;
    path.rotation.z = rotY;
    path.position.set(x, 0.11, z);
    path.receiveShadow = true;
    scene.add(path);
  };

  // Walkway from Roundabout to Administration Portico
  createPath(0, 15, 12, 45);

  // Walkway from Roundabout to Central Library Plaza
  createPath(-45, 30, 8, 70, 0.45);

  // Walkway from Roundabout to Academic Quad Block A & B
  createPath(-35, 75, 7, 75, -0.3);

  // Walkway from Roundabout to Auditorium & OAT
  createPath(45, 35, 8, 65, -0.4);

  // Promenade along the Lake Shoreline
  createPath(95, -50, 7, 65, 0.2);

  // Cross-walk connecting SAC and Hostel Block
  createPath(-45, 125, 6, 120, Math.PI / 2);
}

// 4. Central Lawn, Roundabout, Plazas & Indian Tricolor Flag
function buildCentralLawnAndPlazas(scene: THREE.Scene) {
  const pavingMat = new THREE.MeshStandardMaterial({ color: 0xd6ccb6, roughness: 0.68 });
  const waterMat = new THREE.MeshStandardMaterial({
    color: 0x0284c7,
    roughness: 0.08,
    metalness: 0.88,
    transparent: true,
    opacity: 0.85,
  });

  // Central Roundabout Plaza at (0, 0, 45)
  const roundGeo = new THREE.CylinderGeometry(18, 19, 1.4, 40);
  const roundPlaza = new THREE.Mesh(roundGeo, pavingMat);
  roundPlaza.position.set(0, 0.7, 45);
  roundPlaza.receiveShadow = true;
  scene.add(roundPlaza);

  const fountainPool = new THREE.Mesh(new THREE.CylinderGeometry(9, 9, 0.7, 32), waterMat);
  fountainPool.position.set(0, 1.4, 45);
  scene.add(fountainPool);

  const fountainCenter = new THREE.Mesh(
    new THREE.CylinderGeometry(1.6, 2.6, 4.5, 18),
    new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.6 })
  );
  fountainCenter.position.set(0, 2.8, 45);
  fountainCenter.castShadow = true;
  scene.add(fountainCenter);

  // Flag Pole with Indian Flag in front of University Administration
  const pole = new THREE.Mesh(
    new THREE.CylinderGeometry(0.22, 0.35, 20, 16),
    new THREE.MeshStandardMaterial({ color: 0xe2e8f0, metalness: 0.85, roughness: 0.15 })
  );
  pole.position.set(0, 10, 8);
  pole.castShadow = true;
  scene.add(pole);

  // Flag Cloth (Tricolor)
  const flagGeo = new THREE.PlaneGeometry(5.0, 3.2);
  const canvas = document.createElement('canvas');
  canvas.width = 128;
  canvas.height = 80;
  const ctx = canvas.getContext('2d')!;
  ctx.fillStyle = '#ff9933'; // Saffron
  ctx.fillRect(0, 0, 128, 27);
  ctx.fillStyle = '#ffffff'; // White
  ctx.fillRect(0, 27, 128, 26);
  ctx.fillStyle = '#138808'; // Green
  ctx.fillRect(0, 53, 128, 27);
  ctx.strokeStyle = '#000080'; // Navy Chakra
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.arc(64, 40, 9, 0, Math.PI * 2);
  ctx.stroke();

  const flagTex = new THREE.CanvasTexture(canvas);
  const flagMat = new THREE.MeshBasicMaterial({ map: flagTex, side: THREE.DoubleSide });
  const flagMesh = new THREE.Mesh(flagGeo, flagMat);
  flagMesh.position.set(2.7, 18.2, 8);
  scene.add(flagMesh);

  // Stepped Concentric Circular Amphitheatre Plaza in front of SAC (Z = 125, X = 65)
  for (let i = 0; i < 4; i++) {
    const ringRadius = 25 - i * 4.6;
    const ringGeo = new THREE.RingGeometry(ringRadius - 3.6, ringRadius, 40);
    const ring = new THREE.Mesh(
      ringGeo,
      new THREE.MeshStandardMaterial({
        color: i % 2 === 0 ? 0xcbc0ab : 0xb5a790,
        roughness: 0.72,
      })
    );
    ring.rotation.x = -Math.PI / 2;
    ring.position.set(65, 0.2 + i * 0.45, 128);
    ring.receiveShadow = true;
    scene.add(ring);
  }
}

// 5. Sports Complex: Olympic 8-Lane Running Track, Regulation Soccer Pitch, Tennis Courts
function buildSportsAndAthleticsComplex(scene: THREE.Scene) {
  const stadiumGroup = new THREE.Group();
  stadiumGroup.position.set(-155, 0, 70);

  // Red Synthetic Polyurethane 8-Lane Running Track (Oval)
  const trackMat = new THREE.MeshStandardMaterial({ color: 0xba2b20, roughness: 0.78 });
  const trackGeo = new THREE.BoxGeometry(62, 0.8, 92);
  const track = new THREE.Mesh(trackGeo, trackMat);
  track.position.y = 0.4;
  track.receiveShadow = true;
  stadiumGroup.add(track);

  // Semicircular curves on top and bottom of track
  const curveGeo = new THREE.CylinderGeometry(31, 31, 0.8, 36, 1, false, 0, Math.PI);
  const curveN = new THREE.Mesh(curveGeo, trackMat);
  curveN.position.set(0, 0.4, -46);
  curveN.rotation.y = Math.PI;
  stadiumGroup.add(curveN);

  const curveS = new THREE.Mesh(curveGeo, trackMat);
  curveS.position.set(0, 0.4, 46);
  stadiumGroup.add(curveS);

  // 8 White Concentric Lane Stripings
  const whiteLaneMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
  for (let lane = 1; lane <= 7; lane++) {
    const laneOffset = 18 + lane * 1.7;
    // Straightaways
    const lineL = new THREE.Mesh(new THREE.PlaneGeometry(0.25, 92), whiteLaneMat);
    lineL.rotation.x = -Math.PI / 2;
    lineL.position.set(-laneOffset, 0.82, 0);
    stadiumGroup.add(lineL);

    const lineR = new THREE.Mesh(new THREE.PlaneGeometry(0.25, 92), whiteLaneMat);
    lineR.rotation.x = -Math.PI / 2;
    lineR.position.set(laneOffset, 0.82, 0);
    stadiumGroup.add(lineR);

    // Turn curves
    const turnGeoN = new THREE.RingGeometry(laneOffset - 0.12, laneOffset + 0.12, 36, 1, 0, Math.PI);
    const turnN = new THREE.Mesh(turnGeoN, whiteLaneMat);
    turnN.rotation.x = -Math.PI / 2;
    turnN.position.set(0, 0.82, -46);
    stadiumGroup.add(turnN);

    const turnGeoS = new THREE.RingGeometry(laneOffset - 0.12, laneOffset + 0.12, 36, 1, Math.PI, Math.PI);
    const turnS = new THREE.Mesh(turnGeoS, whiteLaneMat);
    turnS.rotation.x = -Math.PI / 2;
    turnS.position.set(0, 0.82, 46);
    stadiumGroup.add(turnS);
  }

  // Two-Tone Striped Turf Soccer Pitch
  const soccerPitchGeo = new THREE.BoxGeometry(34, 1.0, 78);
  const soccerPitchMat = new THREE.MeshStandardMaterial({ color: 0x2b8026, roughness: 0.85 });
  const soccerField = new THREE.Mesh(soccerPitchGeo, soccerPitchMat);
  soccerField.position.y = 0.55;
  soccerField.receiveShadow = true;
  stadiumGroup.add(soccerField);

  // Mown field stripes
  const turfStripeMat = new THREE.MeshStandardMaterial({ color: 0x338f2e, roughness: 0.85 });
  for (let z = -32; z <= 32; z += 12) {
    const stripe = new THREE.Mesh(new THREE.PlaneGeometry(33, 6), turfStripeMat);
    stripe.rotation.x = -Math.PI / 2;
    stripe.position.set(0, 1.06, z);
    stadiumGroup.add(stripe);
  }

  // Soccer field white line markings
  const whiteMat = new THREE.MeshBasicMaterial({ color: 0xffffff });

  // Perimeter touch lines
  const touchL = new THREE.Mesh(new THREE.PlaneGeometry(0.4, 76), whiteMat);
  touchL.rotation.x = -Math.PI / 2;
  touchL.position.set(-16.5, 1.08, 0);
  stadiumGroup.add(touchL);

  const touchR = new THREE.Mesh(new THREE.PlaneGeometry(0.4, 76), whiteMat);
  touchR.rotation.x = -Math.PI / 2;
  touchR.position.set(16.5, 1.08, 0);
  stadiumGroup.add(touchR);

  // Halfway line & center circle
  const midLine = new THREE.Mesh(new THREE.PlaneGeometry(33, 0.4), whiteMat);
  midLine.rotation.x = -Math.PI / 2;
  midLine.position.set(0, 1.08, 0);
  stadiumGroup.add(midLine);

  const centerCircle = new THREE.Mesh(new THREE.RingGeometry(5.8, 6.2, 28), whiteMat);
  centerCircle.rotation.x = -Math.PI / 2;
  centerCircle.position.set(0, 1.08, 0);
  stadiumGroup.add(centerCircle);

  // 18-Yard Penalty Boxes at each end
  for (const pz of [-31, 31]) {
    const box = new THREE.Mesh(new THREE.PlaneGeometry(18, 12), whiteMat);
    box.rotation.x = -Math.PI / 2;
    box.position.set(0, 1.07, pz);
    // Render penalty box perimeter outline
    const penaltyPerimeter = new THREE.Mesh(
      new THREE.RingGeometry(7.8, 8.2, 4),
      whiteMat
    );
    penaltyPerimeter.rotation.x = -Math.PI / 2;
    penaltyPerimeter.rotation.z = Math.PI / 4;
    penaltyPerimeter.position.set(0, 1.08, pz);
    stadiumGroup.add(penaltyPerimeter);
  }

  // 3D Realistic White Goalposts at both ends
  const goalFrameMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.3 });
  for (const gz of [-38, 38]) {
    const postL = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.18, 4.5, 8), goalFrameMat);
    postL.position.set(-4.5, 3.2, gz);
    stadiumGroup.add(postL);

    const postR = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.18, 4.5, 8), goalFrameMat);
    postR.position.set(4.5, 3.2, gz);
    stadiumGroup.add(postR);

    const crossbar = new THREE.Mesh(new THREE.BoxGeometry(9.3, 0.3, 0.3), goalFrameMat);
    crossbar.position.set(0, 5.4, gz);
    stadiumGroup.add(crossbar);
  }

  // Spectator Grandstand Bleachers with red/blue individual seat rows
  const bleachersGeo = new THREE.BoxGeometry(12, 9, 84);
  const bleachersMat = new THREE.MeshStandardMaterial({ color: 0xc4b5a2, roughness: 0.6 });
  const bleachers = new THREE.Mesh(bleachersGeo, bleachersMat);
  bleachers.position.set(-38, 4.5, 0);
  bleachers.castShadow = true;
  stadiumGroup.add(bleachers);

  // Bleacher Overhead Canopy
  const canopyGeo = new THREE.BoxGeometry(16, 1.2, 86);
  const canopyMat = new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.4 });
  const bleacherCanopy = new THREE.Mesh(canopyGeo, canopyMat);
  bleacherCanopy.position.set(-37, 10.5, 0);
  bleacherCanopy.castShadow = true;
  stadiumGroup.add(bleacherCanopy);

  // Stadium Floodlight Towers
  const floodlightPoleGeo = new THREE.CylinderGeometry(0.5, 0.85, 32, 12);
  const floodlightMat = new THREE.MeshStandardMaterial({ color: 0x64748b, metalness: 0.75 });
  for (const pos of [
    [-40, 16, -42],
    [-40, 16, 42],
    [38, 16, -42],
    [38, 16, 42],
  ]) {
    const p = new THREE.Mesh(floodlightPoleGeo, floodlightMat);
    p.position.set(pos[0], pos[1], pos[2]);
    p.castShadow = true;
    stadiumGroup.add(p);

    // Floodlight lamp array
    const lampBank = new THREE.Mesh(
      new THREE.BoxGeometry(4.5, 2.5, 1.2),
      new THREE.MeshBasicMaterial({ color: 0xfef08a })
    );
    lampBank.position.set(pos[0], 32, pos[2]);
    stadiumGroup.add(lampBank);
  }

  // Adjacent Blue Outdoor Tennis & Basketball Courts (Z = 145, X = -155)
  const courtBase = new THREE.Mesh(
    new THREE.BoxGeometry(54, 0.6, 38),
    new THREE.MeshStandardMaterial({ color: 0x1d4ed8, roughness: 0.72 })
  );
  courtBase.position.set(-155, 0.3, 140);
  courtBase.receiveShadow = true;
  scene.add(courtBase);

  // Tennis court boundary & net
  const courtBorder = new THREE.Mesh(new THREE.PlaneGeometry(48, 32), whiteMat);
  courtBorder.rotation.x = -Math.PI / 2;
  courtBorder.position.set(-155, 0.62, 140);
  scene.add(courtBorder);

  // Tennis Center Net
  const netMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.5 });
  const net = new THREE.Mesh(new THREE.BoxGeometry(0.3, 2.2, 32), netMat);
  net.position.set(-155, 1.7, 140);
  net.castShadow = true;
  scene.add(net);

  scene.add(stadiumGroup);
}

// 6. Scenic Campus Lake, Animated Fountains, and Open Air Theatre (OAT)
function buildScenicLakeAndOAT(
  scene: THREE.Scene,
  waterRef: React.MutableRefObject<THREE.Mesh | null>,
  fountainRef: React.MutableRefObject<THREE.Points | null>
) {
  const lakeGroup = new THREE.Group();
  lakeGroup.position.set(125, 0, -50);

  const waterMat = new THREE.MeshStandardMaterial({
    color: 0x0284c7,
    roughness: 0.08,
    metalness: 0.92,
    transparent: true,
    opacity: 0.88,
  });

  // Natural Winding Lake Body
  const lakeGeo = new THREE.CylinderGeometry(30, 36, 0.8, 40);
  const lake = new THREE.Mesh(lakeGeo, waterMat);
  lake.position.y = 0.4;
  lake.scale.set(1.45, 1, 0.92);
  lakeGroup.add(lake);
  waterRef.current = lake;

  // Stone Shoreline Border
  const borderGeo = new THREE.CylinderGeometry(31, 38, 0.7, 40);
  const borderMat = new THREE.MeshStandardMaterial({ color: 0x9ca3af, roughness: 0.75 });
  const border = new THREE.Mesh(borderGeo, borderMat);
  border.position.y = 0.35;
  border.scale.set(1.45, 1, 0.92);
  lakeGroup.add(border);

  // Aerating Lake Fountain Geyser Jet
  const fountain = new THREE.Mesh(
    new THREE.ConeGeometry(3.2, 8.5, 18),
    new THREE.MeshBasicMaterial({ color: 0xe0f2fe, transparent: true, opacity: 0.8 })
  );
  fountain.position.set(0, 4.5, 0);
  lakeGroup.add(fountain);

  // Dynamic Fountain Particle Spray Points
  const particleCount = 48;
  const particleGeo = new THREE.BufferGeometry();
  const particlePos = new Float32Array(particleCount * 3);
  for (let i = 0; i < particleCount; i++) {
    const angle = (i / particleCount) * Math.PI * 2;
    const r = Math.random() * 4.5;
    particlePos[i * 3] = Math.cos(angle) * r;
    particlePos[i * 3 + 1] = 1.5 + Math.random() * 6;
    particlePos[i * 3 + 2] = Math.sin(angle) * r;
  }
  particleGeo.setAttribute('position', new THREE.BufferAttribute(particlePos, 3));
  const particleMat = new THREE.PointsMaterial({
    color: 0xbae6fd,
    size: 1.2,
    transparent: true,
    opacity: 0.85,
  });
  const fountainParticles = new THREE.Points(particleGeo, particleMat);
  lakeGroup.add(fountainParticles);
  fountainRef.current = fountainParticles;

  scene.add(lakeGroup);

  // Open Air Theatre (OAT) with Tensile White Membrane Canopy (Z = -45, X = 105)
  const oatGroup = new THREE.Group();
  oatGroup.position.set(105, 0, -45);

  const stoneMat = new THREE.MeshStandardMaterial({ color: 0xd6cebe, roughness: 0.7 });
  const tensileMat = new THREE.MeshStandardMaterial({
    color: 0xf8fafc,
    roughness: 0.28,
    metalness: 0.08,
    side: THREE.DoubleSide,
  });

  // Tiered Semi-Circular Stepped Amphitheatre
  for (let r = 9; r <= 24; r += 3.6) {
    const tierGeo = new THREE.CylinderGeometry(r, r + 0.9, 1.3, 32, 1, false, 0, Math.PI);
    const tier = new THREE.Mesh(tierGeo, stoneMat);
    tier.position.y = (r - 9) * 0.42 + 0.65;
    tier.rotation.y = Math.PI / 2;
    tier.castShadow = true;
    tier.receiveShadow = true;
    oatGroup.add(tier);
  }

  // Tensile Membrane Canopy Roof
  const canopyGeo = new THREE.ConeGeometry(26, 9, 18, 1, true);
  const canopy = new THREE.Mesh(canopyGeo, tensileMat);
  canopy.position.set(0, 17, 0);
  canopy.rotation.x = Math.PI;
  canopy.castShadow = true;
  oatGroup.add(canopy);

  // Tensile Support Masts
  const mastMat = new THREE.MeshStandardMaterial({ color: 0x475569, metalness: 0.85 });
  for (const angle of [0, Math.PI / 2, Math.PI, (3 * Math.PI) / 2]) {
    const mast = new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.55, 22, 10), mastMat);
    mast.position.set(Math.cos(angle) * 24, 11, Math.sin(angle) * 24);
    mast.castShadow = true;
    oatGroup.add(mast);
  }

  scene.add(oatGroup);
}

// 7. Architectural Procedural Helpers (Windows, Facade Details, Rooftop Systems)
function addFacadeWindows(
  parent: THREE.Group,
  centerPos: [number, number, number],
  face: 'north' | 'south' | 'east' | 'west',
  width: number,
  height: number,
  floors: number,
  cols: number,
  glassMat: THREE.Material,
  frameMat: THREE.Material
) {
  const windowGroup = new THREE.Group();
  windowGroup.position.set(centerPos[0], centerPos[1], centerPos[2]);

  const cellW = width / cols;
  const cellH = height / floors;
  const winW = cellW * 0.68;
  const winH = cellH * 0.65;

  const winGeo = new THREE.PlaneGeometry(winW, winH);
  const sillGeo = new THREE.BoxGeometry(winW + 0.4, 0.35, 0.6);

  for (let f = 0; f < floors; f++) {
    const y = (f - floors / 2 + 0.5) * cellH;
    for (let c = 0; c < cols; c++) {
      const u = (c - cols / 2 + 0.5) * cellW;

      const win = new THREE.Mesh(winGeo, glassMat);
      const sill = new THREE.Mesh(sillGeo, frameMat);

      if (face === 'south') {
        win.position.set(u, y, 0.1);
        sill.position.set(u, y - winH / 2, 0.25);
      } else if (face === 'north') {
        win.rotation.y = Math.PI;
        win.position.set(u, y, -0.1);
        sill.position.set(u, y - winH / 2, -0.25);
      } else if (face === 'east') {
        win.rotation.y = Math.PI / 2;
        win.position.set(0.1, y, u);
        sill.rotation.y = Math.PI / 2;
        sill.position.set(0.25, y - winH / 2, u);
      } else {
        // west
        win.rotation.y = -Math.PI / 2;
        win.position.set(-0.1, y, u);
        sill.rotation.y = -Math.PI / 2;
        sill.position.set(-0.25, y - winH / 2, u);
      }

      windowGroup.add(win);
      windowGroup.add(sill);
    }
  }

  parent.add(windowGroup);
}

function addRooftopEquipment(
  parent: THREE.Group,
  centerPos: [number, number, number],
  width: number,
  depth: number,
  hasSolar = false
) {
  const roofGroup = new THREE.Group();
  roofGroup.position.set(centerPos[0], centerPos[1], centerPos[2]);

  const hvacMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.6, roughness: 0.4 });
  const solarMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.15, metalness: 0.85 });

  // 1. Elevator & Stairwell Penthouse Box
  const penthouse = new THREE.Mesh(new THREE.BoxGeometry(width * 0.28, 4.2, depth * 0.28), hvacMat);
  penthouse.position.set(-width * 0.15, 2.1, -depth * 0.15);
  penthouse.castShadow = true;
  roofGroup.add(penthouse);

  // 2. Industrial Chiller / HVAC Units with Cylindrical Exhaust Fans
  for (let i = 0; i < 2; i++) {
    const hvac = new THREE.Mesh(new THREE.BoxGeometry(4.2, 2.8, 3.2), hvacMat);
    hvac.position.set(width * 0.2, 1.4, (i - 0.5) * 6.5);
    hvac.castShadow = true;
    roofGroup.add(hvac);

    const fan = new THREE.Mesh(
      new THREE.CylinderGeometry(1.0, 1.0, 0.4, 12),
      new THREE.MeshStandardMaterial({ color: 0x334155, metalness: 0.8 })
    );
    fan.position.set(width * 0.2, 2.9, (i - 0.5) * 6.5);
    roofGroup.add(fan);
  }

  // 3. Optional Photovoltaic Solar Panel Array
  if (hasSolar) {
    const panelGeo = new THREE.BoxGeometry(width * 0.18, 0.3, 2.4);
    for (let r = 0; r < 3; r++) {
      const panel = new THREE.Mesh(panelGeo, solarMat);
      panel.position.set(-width * 0.15, 1.2, depth * 0.15 + (r - 1) * 3.4);
      panel.rotation.x = 0.35; // Tilted toward south
      panel.castShadow = true;
      roofGroup.add(panel);
    }
  }

  parent.add(roofGroup);
}

// 8. Detailed Architectural Buildings matching Reference Image
function buildAllRealisticBuildings(scene: THREE.Scene, buildingMap: Map<string, THREE.Group>) {
  // Common High-Quality Architectural Materials
  const sandstoneMat = new THREE.MeshStandardMaterial({
    color: 0xede4d3,
    roughness: 0.58,
    metalness: 0.06,
  });
  const creamMat = new THREE.MeshStandardMaterial({
    color: 0xf8f4ec,
    roughness: 0.52,
  });
  const terracottaBrickMat = new THREE.MeshStandardMaterial({
    color: 0xb84b35,
    roughness: 0.68,
  });
  const darkRoofMat = new THREE.MeshStandardMaterial({
    color: 0x2e3846,
    roughness: 0.42,
    metalness: 0.25,
  });
  const bronzeDomeMat = new THREE.MeshStandardMaterial({
    color: 0xd97706,
    roughness: 0.26,
    metalness: 0.78,
  });
  const blueGlassMat = new THREE.MeshStandardMaterial({
    color: 0x0f2f4e,
    roughness: 0.12,
    metalness: 0.88,
    transparent: true,
    opacity: 0.92,
  });
  const frameMat = new THREE.MeshStandardMaterial({
    color: 0x334155,
    roughness: 0.5,
  });

  CAMPUS_BUILDINGS.forEach((bldg) => {
    const grp = new THREE.Group();
    grp.position.set(bldg.position[0], bldg.position[1], bldg.position[2]);
    grp.userData = { buildingId: bldg.id, buildingName: bldg.name };

    switch (bldg.id) {
      case 'admin-complex': {
        // Grand University Administration Palace
        // Central Main Block
        const main = new THREE.Mesh(new THREE.BoxGeometry(56, 22, 34), sandstoneMat);
        main.position.y = 11;
        main.castShadow = true;
        main.receiveShadow = true;
        grp.add(main);

        // Hipped Slate Roof
        const roof = new THREE.Mesh(new THREE.ConeGeometry(40, 7.5, 4), darkRoofMat);
        roof.position.y = 25.5;
        roof.rotation.y = Math.PI / 4;
        roof.scale.set(1.42, 1, 0.92);
        roof.castShadow = true;
        grp.add(roof);

        // Colonnade Front Portico Entrance
        for (let x = -16; x <= 16; x += 6.4) {
          const col = new THREE.Mesh(new THREE.CylinderGeometry(0.85, 1.05, 19, 14), creamMat);
          col.position.set(x, 9.5, 19);
          col.castShadow = true;
          grp.add(col);
        }

        // Portico Pediment Roof
        const pediment = new THREE.Mesh(new THREE.ConeGeometry(25, 5.5, 4), sandstoneMat);
        pediment.position.set(0, 20.5, 19);
        pediment.rotation.y = Math.PI / 4;
        grp.add(pediment);

        // Monumental Portico Frieze Signboard with "CIT" in Bright Yellow
        const adminSignTex = createSignTexture('CIT', 'CHILIKA INSTITUTE OF TECHNOLOGY', '#fde047', '#0a1128');
        const adminSignMat = new THREE.MeshStandardMaterial({
          map: adminSignTex,
          roughness: 0.25,
          metalness: 0.2,
        });
        const adminSignBoard = new THREE.Mesh(new THREE.BoxGeometry(24, 4.4, 0.7), adminSignMat);
        adminSignBoard.position.set(0, 19.3, 20.1);
        adminSignBoard.castShadow = true;
        grp.add(adminSignBoard);

        // 3D Vivid Yellow Relief Lettering "CIT" on Pediment Cornice
        const yellowLetterMat = new THREE.MeshStandardMaterial({
          color: 0xfde047, // Vivid bright architectural yellow
          emissive: 0x423802, // Subtle warm illumination
          roughness: 0.22,
          metalness: 0.45,
        });
        const cit3DLetters = create3DLettersCIT(yellowLetterMat);
        cit3DLetters.position.set(0, 21.6, 20.4);
        cit3DLetters.scale.set(0.95, 0.95, 0.95);
        grp.add(cit3DLetters);

        // Rooftop Monumental "CIT" Sign in Vivid Yellow (Tilted for clear elevated aerial camera visibility)
        const roofCitTex = createSignTexture('CIT', 'UNIVERSITY HEADQUARTERS', '#fde047', '#0f172a');
        const roofCitMat = new THREE.MeshStandardMaterial({
          map: roofCitTex,
          roughness: 0.22,
          metalness: 0.25,
        });
        const roofCitSign = new THREE.Mesh(new THREE.BoxGeometry(20, 5.0, 1.2), roofCitMat);
        roofCitSign.position.set(0, 27.5, 12);
        roofCitSign.rotation.x = -0.28;
        roofCitSign.castShadow = true;
        grp.add(roofCitSign);

        const roof3DLetters = create3DLettersCIT(yellowLetterMat);
        roof3DLetters.position.set(0, 27.5, 12.8);
        roof3DLetters.rotation.x = -0.28;
        roof3DLetters.scale.set(1.15, 1.15, 1.15);
        grp.add(roof3DLetters);

        // Symmetrical Facade Multi-Tier Windows on Front
        addFacadeWindows(grp, [-18, 12, 17], 'south', 16, 14, 4, 3, blueGlassMat, frameMat);
        addFacadeWindows(grp, [18, 12, 17], 'south', 16, 14, 4, 3, blueGlassMat, frameMat);
        addFacadeWindows(grp, [0, 12, -17], 'north', 48, 14, 4, 7, blueGlassMat, frameMat);

        // Grand Glass Atrium in Center Portico
        const glass = new THREE.Mesh(new THREE.PlaneGeometry(16, 15), blueGlassMat);
        glass.position.set(0, 10.5, 17.1);
        grp.add(glass);

        // Entrance Steps
        for (let s = 0; s < 4; s++) {
          const step = new THREE.Mesh(new THREE.BoxGeometry(36 - s * 2, 0.5, 2 + s * 1.5), sandstoneMat);
          step.position.set(0, 0.25 + s * 0.5, 19.5 + (3 - s) * 0.7);
          step.receiveShadow = true;
          grp.add(step);
        }

        // Rooftop HVAC & Communications Tower
        addRooftopEquipment(grp, [0, 22, 0], 48, 28, true);
        break;
      }

      case 'central-library': {
        // Grand Circular Library Base with Geodesic Bronze Dome
        const base = new THREE.Mesh(new THREE.CylinderGeometry(25, 27, 13, 40), sandstoneMat);
        base.position.y = 6.5;
        base.castShadow = true;
        base.receiveShadow = true;
        grp.add(base);

        // Surrounding Classical Entrance Columns
        for (let a = 0; a < Math.PI * 2; a += Math.PI / 8) {
          const c = new THREE.Mesh(new THREE.CylinderGeometry(0.65, 0.85, 11, 14), creamMat);
          c.position.set(Math.cos(a) * 26, 5.5, Math.sin(a) * 26);
          c.castShadow = true;
          grp.add(c);
        }

        // Tier 2 Drum with Arched Research Windows
        const drum = new THREE.Mesh(new THREE.CylinderGeometry(21, 21, 6.5, 36), creamMat);
        drum.position.y = 16;
        drum.castShadow = true;
        grp.add(drum);

        // Circular window band around drum
        const drumWindowBand = new THREE.Mesh(
          new THREE.CylinderGeometry(21.2, 21.2, 3.2, 36, 1, true),
          blueGlassMat
        );
        drumWindowBand.position.y = 16;
        grp.add(drumWindowBand);

        // Magnificent Geodesic Bronze & Glass Dome
        const dome = new THREE.Mesh(
          new THREE.SphereGeometry(19, 32, 20, 0, Math.PI * 2, 0, Math.PI / 2),
          bronzeDomeMat
        );
        dome.position.y = 19;
        dome.castShadow = true;
        grp.add(dome);

        // Central Illuminated Skylight on Dome Apex
        const apex = new THREE.Mesh(
          new THREE.SphereGeometry(4.2, 18, 14),
          new THREE.MeshBasicMaterial({ color: 0x38bdf8 })
        );
        apex.position.y = 37.5;
        grp.add(apex);
        break;
      }

      case 'cit-indoor': {
        // Large Modern Indoor Sports Colosseum with Translucent Blue Skylight
        const arena = new THREE.Mesh(new THREE.BoxGeometry(64, 19, 50), creamMat);
        arena.position.y = 9.5;
        arena.castShadow = true;
        arena.receiveShadow = true;
        grp.add(arena);

        // Architectural Louvers / Horizontal Ribs
        const ribMat = new THREE.MeshStandardMaterial({ color: 0x64748b, roughness: 0.4 });
        for (let y = 4; y <= 16; y += 3) {
          const ribF = new THREE.Mesh(new THREE.BoxGeometry(64.5, 0.6, 0.8), ribMat);
          ribF.position.set(0, y, 25.2);
          grp.add(ribF);

          const ribB = new THREE.Mesh(new THREE.BoxGeometry(64.5, 0.6, 0.8), ribMat);
          ribB.position.set(0, y, -25.2);
          grp.add(ribB);
        }

        // Blue Glass Pitched Skylight
        const roof = new THREE.Mesh(new THREE.BoxGeometry(52, 4.5, 40), blueGlassMat);
        roof.position.y = 20.5;
        roof.castShadow = true;
        grp.add(roof);

        // Entrance Pylons
        const entrance = new THREE.Mesh(new THREE.BoxGeometry(24, 11, 9), sandstoneMat);
        entrance.position.set(0, 5.5, 27);
        entrance.castShadow = true;
        grp.add(entrance);
        break;
      }

      case 'academic-a':
      case 'academic-b': {
        // 4-Story Collegiate Quadrangle with Cream Sandstone & Multi-Tier Windows
        const wingL = new THREE.Mesh(new THREE.BoxGeometry(15, 19, 44), creamMat);
        wingL.position.set(-15, 9.5, 0);
        wingL.castShadow = true;
        wingL.receiveShadow = true;
        grp.add(wingL);

        const wingR = new THREE.Mesh(new THREE.BoxGeometry(15, 19, 44), creamMat);
        wingR.position.set(15, 9.5, 0);
        wingR.castShadow = true;
        wingR.receiveShadow = true;
        grp.add(wingR);

        const wingC = new THREE.Mesh(new THREE.BoxGeometry(46, 19, 15), creamMat);
        wingC.position.set(0, 9.5, -14.5);
        wingC.castShadow = true;
        wingC.receiveShadow = true;
        grp.add(wingC);

        // Facade Windows for Academic Wings
        addFacadeWindows(grp, [-22.6, 9.5, 0], 'west', 40, 14, 4, 6, blueGlassMat, frameMat);
        addFacadeWindows(grp, [22.6, 9.5, 0], 'east', 40, 14, 4, 6, blueGlassMat, frameMat);
        addFacadeWindows(grp, [0, 9.5, -22.1], 'north', 42, 14, 4, 6, blueGlassMat, frameMat);

        // Dark Hipped Slate Roofs
        const rL = new THREE.Mesh(new THREE.ConeGeometry(17, 5.5, 4), darkRoofMat);
        rL.position.set(-15, 21.5, 0);
        rL.rotation.y = Math.PI / 4;
        grp.add(rL);

        const rR = new THREE.Mesh(new THREE.ConeGeometry(17, 5.5, 4), darkRoofMat);
        rR.position.set(15, 21.5, 0);
        rR.rotation.y = Math.PI / 4;
        grp.add(rR);

        // Internal Quad Grass Lawn & Pathways
        const innerGarden = new THREE.Mesh(
          new THREE.BoxGeometry(20, 0.4, 24),
          new THREE.MeshLambertMaterial({ color: 0x488a33 })
        );
        innerGarden.position.set(0, 0.25, 3.5);
        grp.add(innerGarden);

        // Rooftop HVAC units
        addRooftopEquipment(grp, [0, 19, -14.5], 26, 12, true);
        break;
      }

      case 'academic-c': {
        // Contemporary Research Sciences Block with Ribbon Windows
        const b = new THREE.Mesh(new THREE.BoxGeometry(50, 19, 38), creamMat);
        b.position.y = 9.5;
        b.castShadow = true;
        b.receiveShadow = true;
        grp.add(b);

        // Multi-tier ribbon glass curtain windows
        addFacadeWindows(grp, [0, 9.5, 19.1], 'south', 46, 14, 4, 7, blueGlassMat, frameMat);
        addFacadeWindows(grp, [0, 9.5, -19.1], 'north', 46, 14, 4, 7, blueGlassMat, frameMat);
        addFacadeWindows(grp, [25.1, 9.5, 0], 'east', 34, 14, 4, 5, blueGlassMat, frameMat);

        const glassAtrium = new THREE.Mesh(new THREE.BoxGeometry(22, 21, 20), blueGlassMat);
        glassAtrium.position.set(0, 10.5, 0);
        grp.add(glassAtrium);

        // Rooftop Weather Radar / Communications Mast
        const mast = new THREE.Mesh(
          new THREE.CylinderGeometry(0.2, 0.4, 16, 8),
          new THREE.MeshStandardMaterial({ color: 0x64748b, metalness: 0.9 })
        );
        mast.position.set(-14, 26, -10);
        grp.add(mast);
        break;
      }

      case 'auditorium': {
        // Classical Terracotta Brick Auditorium with Majestic Colonnades
        const hall = new THREE.Mesh(new THREE.BoxGeometry(48, 19, 40), terracottaBrickMat);
        hall.position.y = 9.5;
        hall.castShadow = true;
        hall.receiveShadow = true;
        grp.add(hall);

        // Grand Colonnade Portico
        for (let x = -17; x <= 17; x += 5.6) {
          const col = new THREE.Mesh(new THREE.CylinderGeometry(0.95, 1.15, 17, 14), creamMat);
          col.position.set(x, 8.5, 21.5);
          col.castShadow = true;
          grp.add(col);
        }

        // Roof Pediment
        const ped = new THREE.Mesh(new THREE.ConeGeometry(28, 6.5, 4), sandstoneMat);
        ped.position.set(0, 20, 20);
        ped.rotation.y = Math.PI / 4;
        grp.add(ped);

        const mainRoof = new THREE.Mesh(new THREE.ConeGeometry(38, 6.5, 4), darkRoofMat);
        mainRoof.position.set(0, 21.5, 0);
        mainRoof.rotation.y = Math.PI / 4;
        grp.add(mainRoof);
        break;
      }

      case 'design-innovation': {
        // Contemporary Multi-Tier Glass MakerSpace Innovation Center
        const base = new THREE.Mesh(new THREE.BoxGeometry(44, 8.5, 34), sandstoneMat);
        base.position.y = 4.25;
        base.castShadow = true;
        grp.add(base);

        const glassStorey = new THREE.Mesh(new THREE.BoxGeometry(40, 13, 30), blueGlassMat);
        glassStorey.position.y = 15;
        grp.add(glassStorey);

        // Architectural Floor Slabs Visible inside Glass
        const slabMat = new THREE.MeshStandardMaterial({ color: 0xe2e8f0, roughness: 0.5 });
        const slab = new THREE.Mesh(new THREE.BoxGeometry(39.5, 0.6, 29.5), slabMat);
        slab.position.y = 14;
        grp.add(slab);

        // Rooftop Terrace with Sunshade Pergola
        const terrace = new THREE.Mesh(
          new THREE.BoxGeometry(38, 1.2, 28),
          new THREE.MeshStandardMaterial({ color: 0x334155 })
        );
        terrace.position.y = 22;
        grp.add(terrace);
        break;
      }

      case 'student-activity': {
        // Curved Glass Pavilion for SAC
        const curve = new THREE.Mesh(
          new THREE.CylinderGeometry(21, 23, 13, 32, 1, false, 0, Math.PI * 1.35),
          blueGlassMat
        );
        curve.position.y = 6.5;
        curve.castShadow = true;
        grp.add(curve);

        const roof = new THREE.Mesh(new THREE.CylinderGeometry(23, 23, 1.6, 32), sandstoneMat);
        roof.position.y = 13.5;
        grp.add(roof);
        break;
      }

      case 'hostel-block': {
        // Multi-Story Student Residential Quads with 5 Floors of Windows
        const h = new THREE.Mesh(new THREE.BoxGeometry(44, 23, 28), creamMat);
        h.position.y = 11.5;
        h.castShadow = true;
        h.receiveShadow = true;
        grp.add(h);

        // 5 Stories of Student Room Windows
        addFacadeWindows(grp, [0, 11.5, 14.1], 'south', 40, 18, 5, 6, blueGlassMat, frameMat);
        addFacadeWindows(grp, [0, 11.5, -14.1], 'north', 40, 18, 5, 6, blueGlassMat, frameMat);

        const r = new THREE.Mesh(new THREE.ConeGeometry(34, 5.5, 4), darkRoofMat);
        r.position.y = 25.5;
        r.rotation.y = Math.PI / 4;
        grp.add(r);

        // Rooftop Water Tanks
        const tank = new THREE.Mesh(
          new THREE.CylinderGeometry(2.5, 2.5, 4, 16),
          new THREE.MeshStandardMaterial({ color: 0x64748b, metalness: 0.8 })
        );
        tank.position.set(12, 26, 0);
        grp.add(tank);
        break;
      }

      default: {
        // Sports stadium mesh is built in buildSportsAndAthleticsComplex
        break;
      }
    }

    // Add invisible highlight box for raycasting & focus glow
    const boundingBoxGeo = new THREE.BoxGeometry(48, 28, 48);
    const highlightMat = new THREE.MeshBasicMaterial({
      color: 0x38bdf8,
      transparent: true,
      opacity: 0.25,
      wireframe: false,
    });
    const highlightBox = new THREE.Mesh(boundingBoxGeo, highlightMat);
    highlightBox.name = 'highlightBox';
    highlightBox.position.y = 14;
    highlightBox.visible = false;
    grp.add(highlightBox);

    scene.add(grp);
    buildingMap.set(bldg.id, grp);
  });

  // Connecting Skybridge between Block A and Block B
  const skybridge = new THREE.Mesh(
    new THREE.BoxGeometry(8, 4.5, 26),
    new THREE.MeshStandardMaterial({ color: 0x0284c7, metalness: 0.75, roughness: 0.18 })
  );
  skybridge.position.set(-60, 11.5, 95);
  skybridge.castShadow = true;
  scene.add(skybridge);
}

// 9. Dense Realistic Vegetation & Trees matching Reference Aerial
function buildDenseVegetation(scene: THREE.Scene) {
  // Tree Canopy Materials
  const deciduousMat = new THREE.MeshStandardMaterial({ color: 0x225d1e, roughness: 0.85 });
  const oliveMat = new THREE.MeshStandardMaterial({ color: 0x36762a, roughness: 0.82 });
  const pinkCherryMat = new THREE.MeshStandardMaterial({ color: 0xd92676, roughness: 0.78 }); // Flowering Cherry/Gulmohar in photo
  const pineMat = new THREE.MeshStandardMaterial({ color: 0x133e17, roughness: 0.92 });
  const trunkMat = new THREE.MeshLambertMaterial({ color: 0x4a3728 });

  const treeGroup = new THREE.Group();

  // Helper for single tree
  const plantTree = (x: number, z: number, scale = 1.0, type: 'deciduous' | 'pink' | 'pine' = 'deciduous') => {
    // Trunk
    const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.3 * scale, 0.5 * scale, 4 * scale, 8), trunkMat);
    trunk.position.set(x, 2 * scale, z);
    trunk.castShadow = true;
    treeGroup.add(trunk);

    // Foliage Canopy
    if (type === 'pink') {
      const foliage = new THREE.Mesh(new THREE.SphereGeometry(3.6 * scale, 12, 10), pinkCherryMat);
      foliage.position.set(x, 4.9 * scale, z);
      foliage.castShadow = true;
      treeGroup.add(foliage);
    } else if (type === 'pine') {
      const pine = new THREE.Mesh(new THREE.ConeGeometry(2.6 * scale, 7.5 * scale, 10), pineMat);
      pine.position.set(x, 5.8 * scale, z);
      pine.castShadow = true;
      treeGroup.add(pine);
    } else {
      const mat = Math.random() > 0.5 ? deciduousMat : oliveMat;
      const foliage = new THREE.Mesh(new THREE.SphereGeometry(3.9 * scale, 12, 10), mat);
      foliage.position.set(x, 5.2 * scale, z);
      foliage.scale.set(1, 0.9, 1);
      foliage.castShadow = true;
      treeGroup.add(foliage);
    }
  };

  // 1. Perimeter Tree Border encircling entire university campus
  for (let a = 0; a < Math.PI * 2; a += 0.075) {
    const r = 216 + (Math.sin(a * 8) * 6 + Math.cos(a * 5) * 4);
    const x = Math.cos(a) * r;
    const z = Math.sin(a) * r;
    const type = Math.random() < 0.22 ? 'pink' : Math.random() < 0.32 ? 'pine' : 'deciduous';
    plantTree(x, z, 0.95 + Math.random() * 0.45, type);
  }

  // 2. Central Boulevard & Entrance Avenues
  for (let z = 55; z <= 170; z += 12) {
    plantTree(-15, z, 1.15, 'pine');
    plantTree(15, z, 1.15, 'pine');
    // Pink flowering trees along the walkways
    if (z % 24 === 0) {
      plantTree(-22, z, 1.0, 'pink');
      plantTree(22, z, 1.0, 'pink');
    }
  }

  // 3. Central Lawn & Lakeside Clusters
  for (let i = 0; i < 38; i++) {
    const x = 30 + Math.random() * 55;
    const z = -20 - Math.random() * 50;
    const type = Math.random() < 0.35 ? 'pink' : 'deciduous';
    plantTree(x, z, 0.88 + Math.random() * 0.42, type);
  }

  // 4. Quad & Stadium Landscaping Trees
  for (let i = 0; i < 42; i++) {
    const x = -100 - Math.random() * 80;
    const z = 30 + Math.random() * 120;
    plantTree(x, z, 0.85 + Math.random() * 0.38, 'deciduous');
  }

  scene.add(treeGroup);
}

// 10. Street Furniture, Vehicles, Lampposts, and Parking Lots
function buildStreetFurnitureAndVehicles(scene: THREE.Scene) {
  const furnitureGroup = new THREE.Group();

  // Parking Lots with Marked Bays
  const parkingMat = new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.85 });
  const whiteMat = new THREE.MeshBasicMaterial({ color: 0xffffff });

  // Main Administration Parking Lot (Z = 155, X = 45)
  const lot = new THREE.Mesh(new THREE.PlaneGeometry(64, 26), parkingMat);
  lot.rotation.x = -Math.PI / 2;
  lot.position.set(45, 0.11, 155);
  scene.add(lot);

  // Parking bay stripes
  for (let x = 18; x <= 72; x += 4.5) {
    const s = new THREE.Mesh(new THREE.PlaneGeometry(0.3, 8.5), whiteMat);
    s.rotation.x = -Math.PI / 2;
    s.position.set(x, 0.12, 155);
    scene.add(s);
  }

  // 3D Campus Shuttle Buses
  const busMat = new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.35 });
  const busGlass = new THREE.MeshStandardMaterial({ color: 0x0f2942, roughness: 0.1, metalness: 0.9 });
  const wheelMat = new THREE.MeshBasicMaterial({ color: 0x111827 });

  const buildBus = (x: number, z: number, rotY = 0) => {
    const bus = new THREE.Group();
    bus.position.set(x, 0, z);
    bus.rotation.y = rotY;

    // Bus body
    const body = new THREE.Mesh(new THREE.BoxGeometry(4.6, 4.0, 13), busMat);
    body.position.y = 2.3;
    body.castShadow = true;
    bus.add(body);

    // Front & Side Windows
    const win = new THREE.Mesh(new THREE.BoxGeometry(4.7, 1.5, 10.5), busGlass);
    win.position.y = 2.7;
    bus.add(win);

    // Wheels
    for (const wx of [-2.35, 2.35]) {
      for (const wz of [-4.2, 4.2]) {
        const w = new THREE.Mesh(new THREE.CylinderGeometry(0.75, 0.75, 0.6, 12), wheelMat);
        w.rotation.z = Math.PI / 2;
        w.position.set(wx, 0.75, wz);
        bus.add(w);
      }
    }
    furnitureGroup.add(bus);
  };

  buildBus(-8, 180, 0); // Shuttle arriving at gate
  buildBus(45, 155, Math.PI / 2); // Parked shuttle

  // 3D Cars parked in bays
  const carColors = [0xef4444, 0x3b82f6, 0xf8fafc, 0x10b981, 0x475569, 0x111827];
  let colorIdx = 0;
  for (let x = 22; x <= 68; x += 9) {
    const carMat = new THREE.MeshStandardMaterial({
      color: carColors[colorIdx % carColors.length],
      roughness: 0.35,
    });
    colorIdx++;
    const car = new THREE.Mesh(new THREE.BoxGeometry(2.9, 2.3, 5.8), carMat);
    car.position.set(x, 1.25, 155);
    car.castShadow = true;
    furnitureGroup.add(car);
  }

  // Streetlights along avenues (Poles with glowing warm orbs)
  const lampPoleMat = new THREE.MeshStandardMaterial({ color: 0x475569, metalness: 0.85 });
  const lampGlowMat = new THREE.MeshBasicMaterial({ color: 0xfef08a });

  for (let z = 50; z <= 170; z += 24) {
    for (const x of [-13, 13]) {
      const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.26, 9.5, 8), lampPoleMat);
      pole.position.set(x, 4.75, z);
      furnitureGroup.add(pole);

      const orb = new THREE.Mesh(new THREE.SphereGeometry(0.65, 12, 12), lampGlowMat);
      orb.position.set(x, 9.5, z);
      furnitureGroup.add(orb);
    }
  }

  scene.add(furnitureGroup);
}
