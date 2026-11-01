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
  const hemiLightRef = useRef<THREE.HemisphereLight | null>(null);

  // Initialize Three.js Scene
  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const width = container.clientWidth;
    const height = container.clientHeight;

    // 1. Scene with Fresh Crisp Daylight Sky
    const scene = new THREE.Scene();
    sceneRef.current = scene;
    scene.background = new THREE.Color(0xdff0f8);
    scene.fog = new THREE.FogExp2(0xdff0f8, 0.0015);

    // 2. Camera: Elevated Isometric Aerial Angle matching reference image
    const camera = new THREE.PerspectiveCamera(38, width / height, 1, 2500);
    camera.position.set(-20, 240, 310);
    cameraRef.current = camera;

    // 3. Renderer with Soft Shadows & Tone Mapping
    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance',
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    rendererRef.current = renderer;
    container.appendChild(renderer.domElement);

    // 4. OrbitControls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.maxPolarAngle = Math.PI / 2.15; // Keep above ground level
    controls.minDistance = 50;
    controls.maxDistance = 550;
    controls.target.set(0, 0, 15);
    controlsRef.current = controls;

    // 5. Lighting: Fresh Daylight Matching User Reference
    const hemiLight = new THREE.HemisphereLight(0xffffff, 0x445544, 0.75);
    hemiLight.position.set(0, 250, 0);
    scene.add(hemiLight);
    hemiLightRef.current = hemiLight;

    const dirLight = new THREE.DirectionalLight(0xfff6e5, 1.75);
    dirLight.position.set(150, 220, 120);
    dirLight.castShadow = true;
    dirLight.shadow.mapSize.width = 2048;
    dirLight.shadow.mapSize.height = 2048;
    dirLight.shadow.camera.near = 10;
    dirLight.shadow.camera.far = 700;
    const d = 260;
    dirLight.shadow.camera.left = -d;
    dirLight.shadow.camera.right = d;
    dirLight.shadow.camera.top = d;
    dirLight.shadow.camera.bottom = -d;
    dirLight.shadow.bias = -0.0002;
    scene.add(dirLight);
    dirLightRef.current = dirLight;

    // Soft Ambient fill light
    const ambientLight = new THREE.AmbientLight(0xffedd5, 0.5);
    scene.add(ambientLight);

    // 6. BUILD COMPLETE REALISTIC CIT CAMPUS ENVIRONMENT
    buildRealisticGround(scene);
    buildRoadNetworkAndEntrance(scene);
    buildSportsAndAthleticsComplex(scene);
    buildCentralLawnAndPlazas(scene);
    buildScenicLakeAndOAT(scene);
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

    // 9. Animation Loop with Badge Projection
    let animId: number;
    const tempVec = new THREE.Vector3();

    const animate = () => {
      animId = requestAnimationFrame(animate);
      controls.update();

      // Project 3D building coordinates to 2D screen positions for floating labels
      if (container && cameraRef.current) {
        const w = container.clientWidth;
        const h = container.clientHeight;
        const halfW = w / 2;
        const halfH = h / 2;

        const newBadges: ProjectedBadge[] = [];

        CAMPUS_BUILDINGS.forEach((bldg) => {
          tempVec.set(bldg.position[0], bldg.position[1] + 28, bldg.position[2]);
          tempVec.project(cameraRef.current!);

          // Check if behind camera or outside view
          const isVisible = tempVec.z < 1 && tempVec.x >= -1.1 && tempVec.x <= 1.1 && tempVec.y >= -1.1 && tempVec.y <= 1.1;

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

      // Gentle building highlight animation
      buildingGroupsRef.current.forEach((grp, id) => {
        const isHovered = hoveredBuildingRef.current?.id === id;
        const isSelected = selectedBuildingId === id;
        const highlightBox = grp.getObjectByName('highlightBox');
        if (highlightBox && highlightBox instanceof THREE.Mesh) {
          highlightBox.visible = isHovered || isSelected;
          if (highlightBox.visible) {
            highlightBox.material.opacity = isSelected ? 0.35 : 0.2;
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
  }, []);

  // Handle Day / Sunset / Night mode changes
  useEffect(() => {
    if (!sceneRef.current || !dirLightRef.current || !hemiLightRef.current) return;

    const scene = sceneRef.current;
    const dirLight = dirLightRef.current;
    const hemiLight = hemiLightRef.current;

    if (timeOfDay === 'day') {
      scene.background = new THREE.Color(0xdff0f8);
      scene.fog = new THREE.FogExp2(0xdff0f8, 0.0015);
      dirLight.color.setHex(0xfff6e5);
      dirLight.intensity = 1.7;
      dirLight.position.set(150, 220, 120);
      hemiLight.color.setHex(0xffffff);
      hemiLight.groundColor.setHex(0x445544);
      hemiLight.intensity = 0.7;
    } else if (timeOfDay === 'sunset') {
      scene.background = new THREE.Color(0xfb923c);
      scene.fog = new THREE.FogExp2(0xfdba74, 0.0018);
      dirLight.color.setHex(0xf97316);
      dirLight.intensity = 2.0;
      dirLight.position.set(-180, 110, -70);
      hemiLight.color.setHex(0xfed7aa);
      hemiLight.groundColor.setHex(0x7c2d12);
      hemiLight.intensity = 0.65;
    } else {
      // Night mode
      scene.background = new THREE.Color(0x060d1f);
      scene.fog = new THREE.FogExp2(0x0a1630, 0.0022);
      dirLight.color.setHex(0x38bdf8);
      dirLight.intensity = 0.45;
      dirLight.position.set(-80, 150, 100);
      hemiLight.color.setHex(0x1e3a8a);
      hemiLight.groundColor.setHex(0x030712);
      hemiLight.intensity = 0.35;
    }
  }, [timeOfDay]);

  // Focus and fly to selected building
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
        y: targetPos[1] + 50,
        z: targetPos[2] + 75,
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
   PROCEDURAL THREE.JS MESH BUILDERS — HIGH-DETAIL UNIVERSITY CAMPUS
========================================================================= */

// 1. Terrain & Main Campus Green Grounds
function buildRealisticGround(scene: THREE.Scene) {
  // Main Grass Ground Base Plane
  const groundGeo = new THREE.PlaneGeometry(650, 650, 48, 48);
  const groundMat = new THREE.MeshStandardMaterial({
    color: 0x3d742e,
    roughness: 0.85,
    metalness: 0.05,
  });
  const ground = new THREE.Mesh(groundGeo, groundMat);
  ground.rotation.x = -Math.PI / 2;
  ground.receiveShadow = true;
  scene.add(ground);

  // Outer Surrounding Landscape Ring (Darker Forest / Farmland edge)
  const outerRing = new THREE.Mesh(
    new THREE.RingGeometry(240, 320, 48),
    new THREE.MeshLambertMaterial({ color: 0x27491d })
  );
  outerRing.rotation.x = -Math.PI / 2;
  outerRing.position.y = 0.02;
  scene.add(outerRing);

  // Manicured Campus Green Lawn Pad (Front of Admin Building)
  const lawnGeo = new THREE.BoxGeometry(110, 1.2, 75);
  const lawnMat = new THREE.MeshStandardMaterial({ color: 0x4e933a, roughness: 0.8 });
  const lawn = new THREE.Mesh(lawnGeo, lawnMat);
  lawn.position.set(40, 0.6, 15);
  lawn.receiveShadow = true;
  scene.add(lawn);
}

// 2. Roads, Avenues, Perimeter Loop, and Grand Entrance Portal
function buildRoadNetworkAndEntrance(scene: THREE.Scene) {
  const roadMat = new THREE.MeshStandardMaterial({ color: 0x24282e, roughness: 0.85, metalness: 0.1 });
  const curbMat = new THREE.MeshLambertMaterial({ color: 0xd6cebe });
  const whiteMarkingMat = new THREE.MeshBasicMaterial({ color: 0xf8fafc });
  const yellowMarkingMat = new THREE.MeshBasicMaterial({ color: 0xfbbf24 });

  // Main Peripheral Ring Road (Asphalt Loop encircling campus)
  const ringRoad = new THREE.Mesh(new THREE.RingGeometry(205, 228, 64), roadMat);
  ringRoad.rotation.x = -Math.PI / 2;
  ringRoad.position.y = 0.08;
  ringRoad.receiveShadow = true;
  scene.add(ringRoad);

  // Road curbs on ring road
  const ringCurbInner = new THREE.Mesh(new THREE.RingGeometry(204.2, 205, 64), curbMat);
  ringCurbInner.rotation.x = -Math.PI / 2;
  ringCurbInner.position.y = 0.18;
  scene.add(ringCurbInner);

  // Grand Entrance Boulevard (South, from gate Z = 190 leading North to Z = 45)
  const boulevard = new THREE.Mesh(new THREE.PlaneGeometry(24, 150), roadMat);
  boulevard.rotation.x = -Math.PI / 2;
  boulevard.position.set(0, 0.1, 120);
  boulevard.receiveShadow = true;
  scene.add(boulevard);

  // Center landscaped median divider on boulevard with yellow curb markings
  const median = new THREE.Mesh(
    new THREE.BoxGeometry(3.5, 0.6, 130),
    new THREE.MeshLambertMaterial({ color: 0x4b873a })
  );
  median.position.set(0, 0.35, 125);
  scene.add(median);

  const yellowBorderL = new THREE.Mesh(new THREE.PlaneGeometry(0.35, 130), yellowMarkingMat);
  yellowBorderL.rotation.x = -Math.PI / 2;
  yellowBorderL.position.set(-1.8, 0.12, 125);
  scene.add(yellowBorderL);

  const yellowBorderR = new THREE.Mesh(new THREE.PlaneGeometry(0.35, 130), yellowMarkingMat);
  yellowBorderR.rotation.x = -Math.PI / 2;
  yellowBorderR.position.set(1.8, 0.12, 125);
  scene.add(yellowBorderR);

  // White lane markings
  for (let z = 60; z <= 180; z += 12) {
    const markL = new THREE.Mesh(new THREE.PlaneGeometry(0.4, 4), whiteMarkingMat);
    markL.rotation.x = -Math.PI / 2;
    markL.position.set(-5.5, 0.12, z);
    scene.add(markL);

    const markR = new THREE.Mesh(new THREE.PlaneGeometry(0.4, 4), whiteMarkingMat);
    markR.rotation.x = -Math.PI / 2;
    markR.position.set(5.5, 0.12, z);
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

  const gateStoneMat = new THREE.MeshStandardMaterial({ color: 0xc27a46, roughness: 0.6, metalness: 0.15 });
  const goldSignMat = new THREE.MeshStandardMaterial({ color: 0xf59e0b, metalness: 0.85, roughness: 0.2 });

  // Left & Right Monumental Pillars
  const pL = new THREE.Mesh(new THREE.BoxGeometry(5.5, 18, 5.5), gateStoneMat);
  pL.position.set(-18, 9, 0);
  pL.castShadow = true;
  gateGroup.add(pL);

  const pR = new THREE.Mesh(new THREE.BoxGeometry(5.5, 18, 5.5), gateStoneMat);
  pR.position.set(18, 9, 0);
  pR.castShadow = true;
  gateGroup.add(pR);

  // Monumental Overhead Gateway Header Arch
  const header = new THREE.Mesh(new THREE.BoxGeometry(42, 5, 4.5), gateStoneMat);
  header.position.set(0, 16.5, 0);
  header.castShadow = true;
  gateGroup.add(header);

  // Sign Board: "CIT - CHILIKA INSTITUTE OF TECHNOLOGY"
  const signBoard = new THREE.Mesh(new THREE.BoxGeometry(32, 2.8, 4.8), goldSignMat);
  signBoard.position.set(0, 16.5, 0.1);
  gateGroup.add(signBoard);

  // Central Security Checkpoint Guard Booth
  const guardBooth = new THREE.Mesh(
    new THREE.BoxGeometry(4.5, 4, 7),
    new THREE.MeshStandardMaterial({ color: 0xe2e8f0, roughness: 0.4 })
  );
  guardBooth.position.set(0, 2, 0);
  guardBooth.castShadow = true;
  gateGroup.add(guardBooth);

  // Pedestrian Zebra Crossing in front of gate
  for (let x = -13; x <= 13; x += 2.8) {
    const stripe = new THREE.Mesh(new THREE.PlaneGeometry(1.6, 6), whiteMarkingMat);
    stripe.rotation.x = -Math.PI / 2;
    stripe.position.set(x, 0.12, 192);
    scene.add(stripe);
  }

  scene.add(gateGroup);
}

// 3. Central Lawn, Roundabout, Plazas & Indian Tricolor Flag
function buildCentralLawnAndPlazas(scene: THREE.Scene) {
  const pavingMat = new THREE.MeshStandardMaterial({ color: 0xd8ceb8, roughness: 0.7 });
  const waterMat = new THREE.MeshStandardMaterial({
    color: 0x0ea5e9,
    roughness: 0.1,
    metalness: 0.8,
    transparent: true,
    opacity: 0.85,
  });

  // Central Roundabout Fountain at (0, 0, 45)
  const roundGeo = new THREE.CylinderGeometry(16, 17, 1.2, 36);
  const roundPlaza = new THREE.Mesh(roundGeo, pavingMat);
  roundPlaza.position.set(0, 0.6, 45);
  scene.add(roundPlaza);

  const fountainPool = new THREE.Mesh(new THREE.CylinderGeometry(8, 8, 0.6, 28), waterMat);
  fountainPool.position.set(0, 1.2, 45);
  scene.add(fountainPool);

  const fountainCenter = new THREE.Mesh(
    new THREE.CylinderGeometry(1.5, 2.5, 4, 16),
    new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.5 })
  );
  fountainCenter.position.set(0, 2.5, 45);
  scene.add(fountainCenter);

  // Flag Pole with Indian Flag in front of University Administration
  const pole = new THREE.Mesh(
    new THREE.CylinderGeometry(0.2, 0.3, 18, 12),
    new THREE.MeshStandardMaterial({ color: 0xe2e8f0, metalness: 0.8, roughness: 0.2 })
  );
  pole.position.set(0, 9, 8);
  scene.add(pole);

  // Flag Cloth (Tricolor)
  const flagGeo = new THREE.PlaneGeometry(4.5, 2.8);
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
  ctx.beginPath();
  ctx.arc(64, 40, 8, 0, Math.PI * 2);
  ctx.stroke();

  const flagTex = new THREE.CanvasTexture(canvas);
  const flagMat = new THREE.MeshBasicMaterial({ map: flagTex, side: THREE.DoubleSide });
  const flagMesh = new THREE.Mesh(flagGeo, flagMat);
  flagMesh.position.set(2.4, 16.5, 8);
  scene.add(flagMesh);

  // Stepped Concentric Circular Amphitheatre Plaza in front of SAC (Z = 125, X = 65)
  for (let i = 0; i < 4; i++) {
    const ringRadius = 24 - i * 4.5;
    const ringGeo = new THREE.RingGeometry(ringRadius - 3.5, ringRadius, 40);
    const ring = new THREE.Mesh(
      ringGeo,
      new THREE.MeshStandardMaterial({ color: i % 2 === 0 ? 0xcbc0ab : 0xb5a790, roughness: 0.75 })
    );
    ring.rotation.x = -Math.PI / 2;
    ring.position.set(65, 0.2 + i * 0.4, 128);
    scene.add(ring);
  }
}

// 4. Sports Complex: Olympic Running Track, Soccer Field, Tennis Courts
function buildSportsAndAthleticsComplex(scene: THREE.Scene) {
  const stadiumGroup = new THREE.Group();
  stadiumGroup.position.set(-155, 0, 70);

  // Red Synthetic 8-Lane Running Track (Oval)
  const trackGeo = new THREE.BoxGeometry(60, 0.8, 90);
  const trackMat = new THREE.MeshStandardMaterial({ color: 0xba2b20, roughness: 0.75 });
  const track = new THREE.Mesh(trackGeo, trackMat);
  track.position.y = 0.4;
  track.receiveShadow = true;
  stadiumGroup.add(track);

  // Semicircular curves on top and bottom of track
  const curveGeo = new THREE.CylinderGeometry(30, 30, 0.8, 32, 1, false, 0, Math.PI);
  const curveN = new THREE.Mesh(curveGeo, trackMat);
  curveN.position.set(0, 0.4, -45);
  curveN.rotation.y = Math.PI;
  stadiumGroup.add(curveN);

  const curveS = new THREE.Mesh(curveGeo, trackMat);
  curveS.position.set(0, 0.4, 45);
  stadiumGroup.add(curveS);

  // Lush Green Soccer Pitch inside running track
  const soccerGeo = new THREE.BoxGeometry(36, 1.0, 75);
  const soccerMat = new THREE.MeshStandardMaterial({ color: 0x2e852a, roughness: 0.85 });
  const soccerField = new THREE.Mesh(soccerGeo, soccerMat);
  soccerField.position.y = 0.55;
  stadiumGroup.add(soccerField);

  // White soccer markings
  const whiteMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
  const midLine = new THREE.Mesh(new THREE.PlaneGeometry(34, 0.5), whiteMat);
  midLine.rotation.x = -Math.PI / 2;
  midLine.position.y = 1.06;
  stadiumGroup.add(midLine);

  const centerCircle = new THREE.Mesh(new THREE.RingGeometry(5.5, 6, 24), whiteMat);
  centerCircle.rotation.x = -Math.PI / 2;
  centerCircle.position.y = 1.06;
  stadiumGroup.add(centerCircle);

  // Spectator Grandstand Bleachers on left side
  const bleachersGeo = new THREE.BoxGeometry(10, 8, 80);
  const bleachersMat = new THREE.MeshStandardMaterial({ color: 0xc4b5a2, roughness: 0.6 });
  const bleachers = new THREE.Mesh(bleachersGeo, bleachersMat);
  bleachers.position.set(-36, 4, 0);
  bleachers.castShadow = true;
  stadiumGroup.add(bleachers);

  // Stadium Floodlight Towers
  const floodlightPoleGeo = new THREE.CylinderGeometry(0.5, 0.8, 28, 12);
  const floodlightMat = new THREE.MeshStandardMaterial({ color: 0x64748b, metalness: 0.7 });
  for (const pos of [
    [-38, 14, -40],
    [-38, 14, 40],
    [36, 14, -40],
    [36, 14, 40],
  ]) {
    const p = new THREE.Mesh(floodlightPoleGeo, floodlightMat);
    p.position.set(pos[0], pos[1], pos[2]);
    p.castShadow = true;
    stadiumGroup.add(p);
  }

  // Adjacent Blue Outdoor Tennis & Basketball Courts (Z = 145, X = -155)
  const courtBase = new THREE.Mesh(
    new THREE.BoxGeometry(50, 0.6, 35),
    new THREE.MeshStandardMaterial({ color: 0x1d4ed8, roughness: 0.7 })
  );
  courtBase.position.set(-155, 0.3, 140);
  scene.add(courtBase);

  // Tennis court white lines
  const courtBorder = new THREE.Mesh(new THREE.PlaneGeometry(44, 28), whiteMat);
  courtBorder.rotation.x = -Math.PI / 2;
  courtBorder.position.set(-155, 0.62, 140);
  scene.add(courtBorder);

  scene.add(stadiumGroup);
}

// 5. Scenic Campus Lake, Fountains, and Open Air Theatre (OAT)
function buildScenicLakeAndOAT(scene: THREE.Scene) {
  const lakeGroup = new THREE.Group();
  lakeGroup.position.set(125, 0, -50);

  const waterMat = new THREE.MeshStandardMaterial({
    color: 0x0284c7,
    roughness: 0.05,
    metalness: 0.9,
    transparent: true,
    opacity: 0.88,
  });

  // Natural Winding Lake Body
  const lakeGeo = new THREE.CylinderGeometry(28, 34, 0.8, 36);
  const lake = new THREE.Mesh(lakeGeo, waterMat);
  lake.position.y = 0.4;
  lake.scale.set(1.4, 1, 0.9);
  lakeGroup.add(lake);

  // Stone Shoreline Border
  const borderGeo = new THREE.CylinderGeometry(29, 36, 0.7, 36);
  const borderMat = new THREE.MeshLambertMaterial({ color: 0x9ca3af });
  const border = new THREE.Mesh(borderGeo, borderMat);
  border.position.y = 0.35;
  border.scale.set(1.4, 1, 0.9);
  lakeGroup.add(border);

  // Aerating Lake Fountain Spout
  const fountain = new THREE.Mesh(
    new THREE.ConeGeometry(3, 6, 16),
    new THREE.MeshBasicMaterial({ color: 0xe0f2fe, transparent: true, opacity: 0.75 })
  );
  fountain.position.set(0, 3.5, 0);
  lakeGroup.add(fountain);

  scene.add(lakeGroup);

  // Open Air Theatre (OAT) with Tensile White Membrane Canopy (Z = -45, X = 105)
  const oatGroup = new THREE.Group();
  oatGroup.position.set(105, 0, -45);

  const stoneMat = new THREE.MeshStandardMaterial({ color: 0xd6cebe, roughness: 0.7 });
  const tensileMat = new THREE.MeshStandardMaterial({
    color: 0xf8fafc,
    roughness: 0.3,
    metalness: 0.1,
    side: THREE.DoubleSide,
  });

  // Tiered Semi-Circular Stepped Amphitheatre
  for (let r = 8; r <= 22; r += 3.5) {
    const tierGeo = new THREE.CylinderGeometry(r, r + 0.8, 1.2, 28, 1, false, 0, Math.PI);
    const tier = new THREE.Mesh(tierGeo, stoneMat);
    tier.position.y = (r - 8) * 0.4 + 0.6;
    tier.rotation.y = Math.PI / 2;
    tier.castShadow = true;
    oatGroup.add(tier);
  }

  // Tensile Membrane Canopy Roof
  const canopyGeo = new THREE.ConeGeometry(24, 8, 16, 1, true);
  const canopy = new THREE.Mesh(canopyGeo, tensileMat);
  canopy.position.set(0, 16, 0);
  canopy.rotation.x = Math.PI;
  canopy.castShadow = true;
  oatGroup.add(canopy);

  // Tensile Support Masts
  const mastMat = new THREE.MeshStandardMaterial({ color: 0x475569, metalness: 0.8 });
  for (const angle of [0, Math.PI / 2, Math.PI, (3 * Math.PI) / 2]) {
    const mast = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.5, 20, 8), mastMat);
    mast.position.set(Math.cos(angle) * 22, 10, Math.sin(angle) * 22);
    oatGroup.add(mast);
  }

  scene.add(oatGroup);
}

// 6. Detailed Architectural Buildings matching Reference Image
function buildAllRealisticBuildings(scene: THREE.Scene, buildingMap: Map<string, THREE.Group>) {
  // Common High-Quality Architectural Materials
  const sandstoneMat = new THREE.MeshStandardMaterial({ color: 0xede4d3, roughness: 0.6, metalness: 0.05 });
  const creamMat = new THREE.MeshStandardMaterial({ color: 0xf8f4ec, roughness: 0.55 });
  const terracottaBrickMat = new THREE.MeshStandardMaterial({ color: 0xb94a36, roughness: 0.7 });
  const darkRoofMat = new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.45, metalness: 0.2 });
  const bronzeDomeMat = new THREE.MeshStandardMaterial({ color: 0xd97706, roughness: 0.3, metalness: 0.75 });
  const blueGlassMat = new THREE.MeshStandardMaterial({
    color: 0x0284c7,
    roughness: 0.1,
    metalness: 0.9,
    transparent: true,
    opacity: 0.9,
  });

  CAMPUS_BUILDINGS.forEach((bldg) => {
    const grp = new THREE.Group();
    grp.position.set(bldg.position[0], bldg.position[1], bldg.position[2]);
    grp.userData = { buildingId: bldg.id, buildingName: bldg.name };

    switch (bldg.id) {
      case 'admin-complex': {
        // Grand University Administration Palace
        // Central Main Block
        const main = new THREE.Mesh(new THREE.BoxGeometry(54, 20, 32), sandstoneMat);
        main.position.y = 10;
        main.castShadow = true;
        grp.add(main);

        // Hipped Slate Roof
        const roof = new THREE.Mesh(new THREE.ConeGeometry(38, 7, 4), darkRoofMat);
        roof.position.y = 23.5;
        roof.rotation.y = Math.PI / 4;
        roof.scale.set(1.4, 1, 0.9);
        roof.castShadow = true;
        grp.add(roof);

        // Colonnade Front Portico Entrance
        for (let x = -16; x <= 16; x += 6.4) {
          const col = new THREE.Mesh(new THREE.CylinderGeometry(0.8, 1.0, 18, 12), creamMat);
          col.position.set(x, 9, 18);
          col.castShadow = true;
          grp.add(col);
        }

        // Portico Pediment Roof
        const pediment = new THREE.Mesh(new THREE.ConeGeometry(24, 5, 4), sandstoneMat);
        pediment.position.set(0, 19.5, 18);
        pediment.rotation.y = Math.PI / 4;
        grp.add(pediment);

        // Glass Curtain Atrium
        const glass = new THREE.Mesh(new THREE.PlaneGeometry(28, 14), blueGlassMat);
        glass.position.set(0, 10, 16.2);
        grp.add(glass);
        break;
      }

      case 'central-library': {
        // Grand Circular Library Base with Geodesic Bronze Dome
        const base = new THREE.Mesh(new THREE.CylinderGeometry(24, 26, 12, 36), sandstoneMat);
        base.position.y = 6;
        base.castShadow = true;
        grp.add(base);

        // Surrounding Entrance Columns
        for (let a = 0; a < Math.PI * 2; a += Math.PI / 8) {
          const c = new THREE.Mesh(new THREE.CylinderGeometry(0.6, 0.8, 10, 12), creamMat);
          c.position.set(Math.cos(a) * 25, 5, Math.sin(a) * 25);
          c.castShadow = true;
          grp.add(c);
        }

        // Tier 2 Drum
        const drum = new THREE.Mesh(new THREE.CylinderGeometry(20, 20, 6, 32), creamMat);
        drum.position.y = 15;
        grp.add(drum);

        // Magnificent Geodesic Bronze & Glass Dome
        const dome = new THREE.Mesh(
          new THREE.SphereGeometry(18, 28, 18, 0, Math.PI * 2, 0, Math.PI / 2),
          bronzeDomeMat
        );
        dome.position.y = 18;
        dome.castShadow = true;
        grp.add(dome);

        // Central Illuminated Skylight on Dome Apex
        const apex = new THREE.Mesh(
          new THREE.SphereGeometry(4, 16, 12),
          new THREE.MeshBasicMaterial({ color: 0x38bdf8 })
        );
        apex.position.y = 35;
        grp.add(apex);
        break;
      }

      case 'cit-indoor': {
        // Large Modern Indoor Sports Colosseum with Translucent Blue Skylight
        const arena = new THREE.Mesh(new THREE.BoxGeometry(62, 18, 48), creamMat);
        arena.position.y = 9;
        arena.castShadow = true;
        grp.add(arena);

        // Blue Glass Pitched Skylight
        const roof = new THREE.Mesh(new THREE.BoxGeometry(50, 4, 38), blueGlassMat);
        roof.position.y = 19;
        roof.castShadow = true;
        grp.add(roof);

        // Entrance Pylons
        const entrance = new THREE.Mesh(new THREE.BoxGeometry(22, 10, 8), sandstoneMat);
        entrance.position.set(0, 5, 26);
        grp.add(entrance);
        break;
      }

      case 'academic-a':
      case 'academic-b': {
        // 4-Story Collegiate Quadrangle with Cream Cladding & Dark Roof
        const wingL = new THREE.Mesh(new THREE.BoxGeometry(14, 18, 42), creamMat);
        wingL.position.set(-15, 9, 0);
        wingL.castShadow = true;
        grp.add(wingL);

        const wingR = new THREE.Mesh(new THREE.BoxGeometry(14, 18, 42), creamMat);
        wingR.position.set(15, 9, 0);
        wingR.castShadow = true;
        grp.add(wingR);

        const wingC = new THREE.Mesh(new THREE.BoxGeometry(44, 18, 14), creamMat);
        wingC.position.set(0, 9, -14);
        wingC.castShadow = true;
        grp.add(wingC);

        // Dark Hipped Roofs
        const rL = new THREE.Mesh(new THREE.ConeGeometry(16, 5, 4), darkRoofMat);
        rL.position.set(-15, 20.5, 0);
        rL.rotation.y = Math.PI / 4;
        grp.add(rL);

        const rR = new THREE.Mesh(new THREE.ConeGeometry(16, 5, 4), darkRoofMat);
        rR.position.set(15, 20.5, 0);
        rR.rotation.y = Math.PI / 4;
        grp.add(rR);

        // Internal Quad Grass Lawn
        const innerGarden = new THREE.Mesh(
          new THREE.BoxGeometry(20, 0.4, 22),
          new THREE.MeshLambertMaterial({ color: 0x4e933a })
        );
        innerGarden.position.set(0, 0.2, 3);
        grp.add(innerGarden);
        break;
      }

      case 'academic-c': {
        // Contemporary Research Block C with Multi-Wing Atrium
        const b = new THREE.Mesh(new THREE.BoxGeometry(48, 18, 36), creamMat);
        b.position.y = 9;
        b.castShadow = true;
        grp.add(b);

        const glassAtrium = new THREE.Mesh(new THREE.BoxGeometry(20, 20, 18), blueGlassMat);
        glassAtrium.position.set(0, 10, 0);
        grp.add(glassAtrium);
        break;
      }

      case 'auditorium': {
        // Classical Terracotta Brick Auditorium with Majestic Colonnades
        const hall = new THREE.Mesh(new THREE.BoxGeometry(46, 18, 38), terracottaBrickMat);
        hall.position.y = 9;
        hall.castShadow = true;
        grp.add(hall);

        // Grand Colonnade Portico
        for (let x = -16; x <= 16; x += 5.3) {
          const col = new THREE.Mesh(new THREE.CylinderGeometry(0.9, 1.1, 16, 12), creamMat);
          col.position.set(x, 8, 20);
          col.castShadow = true;
          grp.add(col);
        }

        // Roof Pediment
        const ped = new THREE.Mesh(new THREE.ConeGeometry(26, 6, 4), sandstoneMat);
        ped.position.set(0, 19, 18);
        ped.rotation.y = Math.PI / 4;
        grp.add(ped);

        const mainRoof = new THREE.Mesh(new THREE.ConeGeometry(36, 6, 4), darkRoofMat);
        mainRoof.position.set(0, 20, 0);
        mainRoof.rotation.y = Math.PI / 4;
        grp.add(mainRoof);
        break;
      }

      case 'design-innovation': {
        // Contemporary Multi-Tier Glass Innovation Center
        const base = new THREE.Mesh(new THREE.BoxGeometry(42, 8, 32), sandstoneMat);
        base.position.y = 4;
        base.castShadow = true;
        grp.add(base);

        const glassStorey = new THREE.Mesh(new THREE.BoxGeometry(38, 12, 28), blueGlassMat);
        glassStorey.position.y = 14;
        grp.add(glassStorey);

        // Rooftop Terrace with Sunshade
        const terrace = new THREE.Mesh(
          new THREE.BoxGeometry(36, 1, 26),
          new THREE.MeshStandardMaterial({ color: 0x475569 })
        );
        terrace.position.y = 20.5;
        grp.add(terrace);
        break;
      }

      case 'student-activity': {
        // Curved Glass Pavilion for SAC
        const curve = new THREE.Mesh(
          new THREE.CylinderGeometry(20, 22, 12, 28, 1, false, 0, Math.PI * 1.3),
          blueGlassMat
        );
        curve.position.y = 6;
        curve.castShadow = true;
        grp.add(curve);

        const roof = new THREE.Mesh(new THREE.CylinderGeometry(22, 22, 1.5, 28), sandstoneMat);
        roof.position.y = 12.5;
        grp.add(roof);
        break;
      }

      case 'hostel-block': {
        // Multi-Story Student Residential Quads
        const h = new THREE.Mesh(new THREE.BoxGeometry(42, 22, 26), creamMat);
        h.position.y = 11;
        h.castShadow = true;
        grp.add(h);

        const r = new THREE.Mesh(new THREE.ConeGeometry(32, 5, 4), darkRoofMat);
        r.position.y = 24.5;
        r.rotation.y = Math.PI / 4;
        grp.add(r);
        break;
      }

      default: {
        // Sports stadium mesh is built in buildSportsAndAthleticsComplex
        break;
      }
    }

    // Add invisible highlight box for raycasting & focus glow
    const boundingBoxGeo = new THREE.BoxGeometry(46, 26, 46);
    const highlightMat = new THREE.MeshBasicMaterial({
      color: 0x38bdf8,
      transparent: true,
      opacity: 0.25,
      wireframe: false,
    });
    const highlightBox = new THREE.Mesh(boundingBoxGeo, highlightMat);
    highlightBox.name = 'highlightBox';
    highlightBox.position.y = 13;
    highlightBox.visible = false;
    grp.add(highlightBox);

    scene.add(grp);
    buildingMap.set(bldg.id, grp);
  });

  // Connecting Skybridge between Block A and Block B
  const skybridge = new THREE.Mesh(
    new THREE.BoxGeometry(8, 4.5, 26),
    new THREE.MeshStandardMaterial({ color: 0x0284c7, metalness: 0.7, roughness: 0.2 })
  );
  skybridge.position.set(-60, 11, 95);
  skybridge.castShadow = true;
  scene.add(skybridge);
}

// 7. Dense Realistic Vegetation & Trees matching Reference Aerial
function buildDenseVegetation(scene: THREE.Scene) {
  // Tree Canopy Materials
  const deciduousMat = new THREE.MeshStandardMaterial({ color: 0x225d1e, roughness: 0.85 });
  const oliveMat = new THREE.MeshStandardMaterial({ color: 0x38782b, roughness: 0.8 });
  const pinkCherryMat = new THREE.MeshStandardMaterial({ color: 0xdb2777, roughness: 0.8 }); // Flowering Cherry/Gulmohar in photo
  const pineMat = new THREE.MeshStandardMaterial({ color: 0x144018, roughness: 0.9 });
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
      const foliage = new THREE.Mesh(new THREE.SphereGeometry(3.5 * scale, 12, 10), pinkCherryMat);
      foliage.position.set(x, 4.8 * scale, z);
      foliage.castShadow = true;
      treeGroup.add(foliage);
    } else if (type === 'pine') {
      const pine = new THREE.Mesh(new THREE.ConeGeometry(2.5 * scale, 7 * scale, 10), pineMat);
      pine.position.set(x, 5.5 * scale, z);
      pine.castShadow = true;
      treeGroup.add(pine);
    } else {
      const mat = Math.random() > 0.5 ? deciduousMat : oliveMat;
      const foliage = new THREE.Mesh(new THREE.SphereGeometry(3.8 * scale, 12, 10), mat);
      foliage.position.set(x, 5 * scale, z);
      foliage.scale.set(1, 0.9, 1);
      foliage.castShadow = true;
      treeGroup.add(foliage);
    }
  };

  // 1. Perimeter Tree Border encircling entire university campus
  for (let a = 0; a < Math.PI * 2; a += 0.08) {
    const r = 215 + (Math.sin(a * 8) * 6 + Math.cos(a * 5) * 4);
    const x = Math.cos(a) * r;
    const z = Math.sin(a) * r;
    const type = Math.random() < 0.2 ? 'pink' : Math.random() < 0.3 ? 'pine' : 'deciduous';
    plantTree(x, z, 0.9 + Math.random() * 0.4, type);
  }

  // 2. Central Boulevard & Entrance Avenues
  for (let z = 55; z <= 170; z += 12) {
    plantTree(-15, z, 1.1, 'pine');
    plantTree(15, z, 1.1, 'pine');
    // Pink flowering trees along the walkways
    if (z % 24 === 0) {
      plantTree(-22, z, 0.95, 'pink');
      plantTree(22, z, 0.95, 'pink');
    }
  }

  // 3. Central Lawn & Lakeside Clusters
  for (let i = 0; i < 35; i++) {
    const x = 30 + Math.random() * 55;
    const z = -20 - Math.random() * 50;
    const type = Math.random() < 0.35 ? 'pink' : 'deciduous';
    plantTree(x, z, 0.85 + Math.random() * 0.4, type);
  }

  // 4. Quad & Stadium Landscaping Trees
  for (let i = 0; i < 40; i++) {
    const x = -100 - Math.random() * 80;
    const z = 30 + Math.random() * 120;
    plantTree(x, z, 0.8 + Math.random() * 0.35, 'deciduous');
  }

  scene.add(treeGroup);
}

// 8. Street Furniture, Vehicles, Lampposts, and Parking Lots
function buildStreetFurnitureAndVehicles(scene: THREE.Scene) {
  const furnitureGroup = new THREE.Group();

  // Parking Lots with Marked Bays
  const parkingMat = new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.85 });
  const whiteMat = new THREE.MeshBasicMaterial({ color: 0xffffff });

  // Main Administration Parking Lot (Z = 155, X = 45)
  const lot = new THREE.Mesh(new THREE.PlaneGeometry(60, 24), parkingMat);
  lot.rotation.x = -Math.PI / 2;
  lot.position.set(45, 0.11, 155);
  scene.add(lot);

  // Parking bay stripes
  for (let x = 20; x <= 70; x += 4.5) {
    const s = new THREE.Mesh(new THREE.PlaneGeometry(0.3, 8), whiteMat);
    s.rotation.x = -Math.PI / 2;
    s.position.set(x, 0.12, 155);
    scene.add(s);
  }

  // 3D Campus Shuttle Buses
  const busMat = new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.4 });
  const busGlass = new THREE.MeshStandardMaterial({ color: 0x0284c7, roughness: 0.1 });
  const wheelMat = new THREE.MeshBasicMaterial({ color: 0x111827 });

  const buildBus = (x: number, z: number, rotY = 0) => {
    const bus = new THREE.Group();
    bus.position.set(x, 0, z);
    bus.rotation.y = rotY;

    // Bus body
    const body = new THREE.Mesh(new THREE.BoxGeometry(4.5, 3.8, 12), busMat);
    body.position.y = 2.2;
    body.castShadow = true;
    bus.add(body);

    // Windows
    const win = new THREE.Mesh(new THREE.BoxGeometry(4.6, 1.4, 9.5), busGlass);
    win.position.y = 2.6;
    bus.add(win);

    // Wheels
    for (const wx of [-2.3, 2.3]) {
      for (const wz of [-4, 4]) {
        const w = new THREE.Mesh(new THREE.CylinderGeometry(0.7, 0.7, 0.6, 12), wheelMat);
        w.rotation.z = Math.PI / 2;
        w.position.set(wx, 0.7, wz);
        bus.add(w);
      }
    }
    furnitureGroup.add(bus);
  };

  buildBus(-8, 180, 0); // Shuttle arriving at gate
  buildBus(45, 155, Math.PI / 2); // Parked shuttle

  // 3D Cars parked in bays
  const carColors = [0xef4444, 0x3b82f6, 0xffffff, 0x10b981, 0x64748b, 0x000000];
  let colorIdx = 0;
  for (let x = 24; x <= 68; x += 9) {
    const carMat = new THREE.MeshStandardMaterial({ color: carColors[colorIdx % carColors.length], roughness: 0.4 });
    colorIdx++;
    const car = new THREE.Mesh(new THREE.BoxGeometry(2.8, 2.2, 5.5), carMat);
    car.position.set(x, 1.2, 155);
    car.castShadow = true;
    furnitureGroup.add(car);
  }

  // Streetlights along avenues (Poles with glowing warm orbs)
  const lampPoleMat = new THREE.MeshStandardMaterial({ color: 0x475569, metalness: 0.8 });
  const lampGlowMat = new THREE.MeshBasicMaterial({ color: 0xfef08a });

  for (let z = 50; z <= 170; z += 24) {
    for (const x of [-13, 13]) {
      const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.15, 0.25, 9, 8), lampPoleMat);
      pole.position.set(x, 4.5, z);
      furnitureGroup.add(pole);

      const orb = new THREE.Mesh(new THREE.SphereGeometry(0.6, 12, 12), lampGlowMat);
      orb.position.set(x, 9, z);
      furnitureGroup.add(orb);
    }
  }

  scene.add(furnitureGroup);
}
