import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import gsap from 'gsap';
import { CAMPUS_BUILDINGS, CampusBuilding } from './campusData';

interface Campus3DSceneProps {
  onSelectBuilding: (building: CampusBuilding | null) => void;
  selectedBuildingId: string | null;
  timeOfDay?: 'day' | 'sunset' | 'night';
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
  const [hoveredName, setHoveredName] = useState<string | null>(null);
  const [tooltipPos, setTooltipPos] = useState<{ x: number; y: number } | null>(null);

  const dirLightRef = useRef<THREE.DirectionalLight | null>(null);
  const hemiLightRef = useRef<THREE.HemisphereLight | null>(null);

  // Initialize Three.js Scene
  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const width = container.clientWidth;
    const height = container.clientHeight;

    // 1. Scene
    const scene = new THREE.Scene();
    sceneRef.current = scene;
    scene.background = new THREE.Color(0xdff0f8);
    scene.fog = new THREE.FogExp2(0xdff0f8, 0.0016);

    // 2. Camera: Isometric-like high aerial angle matching reference photo
    const camera = new THREE.PerspectiveCamera(40, width / height, 1, 2000);
    camera.position.set(-180, 160, 220);
    cameraRef.current = camera;

    // 3. Renderer with soft shadows
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.05;
    rendererRef.current = renderer;
    container.appendChild(renderer.domElement);

    // 4. OrbitControls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.maxPolarAngle = Math.PI / 2.15; // Don't go below ground
    controls.minDistance = 40;
    controls.maxDistance = 450;
    controls.target.set(0, 0, 20); // Center on central campus
    controlsRef.current = controls;

    // 5. Lighting
    const hemiLight = new THREE.HemisphereLight(0xffffff, 0x445544, 0.7);
    hemiLight.position.set(0, 200, 0);
    scene.add(hemiLight);
    hemiLightRef.current = hemiLight;

    const dirLight = new THREE.DirectionalLight(0xfff6e5, 1.6);
    dirLight.position.set(150, 220, 120);
    dirLight.castShadow = true;
    dirLight.shadow.mapSize.width = 2048;
    dirLight.shadow.mapSize.height = 2048;
    dirLight.shadow.camera.near = 10;
    dirLight.shadow.camera.far = 600;
    const d = 220;
    dirLight.shadow.camera.left = -d;
    dirLight.shadow.camera.right = d;
    dirLight.shadow.camera.top = d;
    dirLight.shadow.camera.bottom = -d;
    dirLight.shadow.bias = -0.0002;
    scene.add(dirLight);
    dirLightRef.current = dirLight;

    // 6. BUILD COMPLETE PROCEDURAL CAMPUS ENVIRONMENT MATCHING AERIAL PHOTO
    buildCampusGroundAndTerrain(scene);
    buildAllBuildings(scene, buildingGroupsRef.current);
    buildRoadsAndPaths(scene);
    buildSportsComplex(scene);
    buildPlazasAndWater(scene);
    buildFoliageTrees(scene);

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
            setHoveredName(bldg.name);
            setTooltipPos({ x: event.clientX, y: event.clientY });
            container.style.cursor = 'pointer';
            return;
          }
        }
      }

      hoveredBuildingRef.current = null;
      setHoveredName(null);
      setTooltipPos(null);
      container.style.cursor = 'default';
    };

    const handleClick = () => {
      if (hoveredBuildingRef.current) {
        onSelectBuilding(hoveredBuildingRef.current);

        // Smooth camera glide to selected building
        const targetPos = hoveredBuildingRef.current.position;
        gsap.to(controls.target, {
          x: targetPos[0],
          y: targetPos[1] + 10,
          z: targetPos[2],
          duration: 1.2,
          ease: 'power2.out',
        });

        gsap.to(camera.position, {
          x: targetPos[0] - 50,
          y: targetPos[1] + 45,
          z: targetPos[2] + 70,
          duration: 1.2,
          ease: 'power2.out',
        });
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

    // 9. Animation Loop
    let animId: number;
    const animate = () => {
      animId = requestAnimationFrame(animate);
      controls.update();

      // Gentle building highlight animation
      buildingGroupsRef.current.forEach((grp, id) => {
        const isHovered = hoveredBuildingRef.current?.id === id;
        const isSelected = selectedBuildingId === id;
        const highlightBox = grp.getObjectByName('highlightBox');
        if (highlightBox && highlightBox instanceof THREE.Mesh) {
          highlightBox.visible = isHovered || isSelected;
          if (highlightBox.visible) {
            const time = performance.now() * 0.003;
            highlightBox.material.opacity = isSelected ? 0.45 + Math.sin(time) * 0.15 : 0.25;
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
      if (renderer.domElement.parentNode) {
        renderer.domElement.parentNode.removeChild(renderer.domElement);
      }
    };
  }, [onSelectBuilding, selectedBuildingId]);

  // Handle Day / Sunset / Night mode
  useEffect(() => {
    if (!sceneRef.current || !dirLightRef.current || !hemiLightRef.current) return;

    const scene = sceneRef.current;
    const dirLight = dirLightRef.current;
    const hemiLight = hemiLightRef.current;

    if (timeOfDay === 'day') {
      scene.background = new THREE.Color(0xdff0f8);
      scene.fog = new THREE.FogExp2(0xdff0f8, 0.0016);
      dirLight.color.setHex(0xfff6e5);
      dirLight.intensity = 1.6;
      dirLight.position.set(150, 220, 120);
      hemiLight.color.setHex(0xffffff);
      hemiLight.groundColor.setHex(0x445544);
      hemiLight.intensity = 0.7;
    } else if (timeOfDay === 'sunset') {
      scene.background = new THREE.Color(0xfb923c);
      scene.fog = new THREE.FogExp2(0xfdba74, 0.002);
      dirLight.color.setHex(0xf97316);
      dirLight.intensity = 1.8;
      dirLight.position.set(-180, 70, -80);
      hemiLight.color.setHex(0xfed7aa);
      hemiLight.groundColor.setHex(0x7c2d12);
      hemiLight.intensity = 0.6;
    } else {
      // Night mode
      scene.background = new THREE.Color(0x060d1f);
      scene.fog = new THREE.FogExp2(0x0a1630, 0.0025);
      dirLight.color.setHex(0x38bdf8);
      dirLight.intensity = 0.45;
      dirLight.position.set(-80, 150, 100);
      hemiLight.color.setHex(0x1e3a8a);
      hemiLight.groundColor.setHex(0x030712);
      hemiLight.intensity = 0.35;
    }
  }, [timeOfDay]);

  // Reset Camera View
  const handleResetCamera = useCallback(() => {
    if (!cameraRef.current || !controlsRef.current) return;
    gsap.to(controlsRef.current.target, { x: 0, y: 0, z: 20, duration: 1.2, ease: 'power2.inOut' });
    gsap.to(cameraRef.current.position, { x: -180, y: 160, z: 220, duration: 1.2, ease: 'power2.inOut' });
  }, []);

  return (
    <div className="relative w-full h-full select-none overflow-hidden rounded-3xl">
      <div ref={mountRef} className="w-full h-full" />

      {/* Floating Tooltip when hovering over a 3D building */}
      {hoveredName && tooltipPos && (
        <div
          className="fixed pointer-events-none z-50 transform -translate-x-1/2 -translate-y-full px-3 py-1.5 rounded-xl bg-slate-900/90 border border-cyan-400/50 backdrop-blur-md shadow-2xl text-xs font-bold text-white flex items-center gap-1.5 animate-fadeIn"
          style={{ left: tooltipPos.x, top: tooltipPos.y - 12 }}
        >
          <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
          <span>{hoveredName}</span>
          <span className="text-[10px] text-cyan-300 font-normal">(Click to inspect)</span>
        </div>
      )}

      {/* Quick Camera Navigation Overlay */}
      <div className="absolute top-4 left-4 z-20 flex items-center gap-2">
        <button
          onClick={handleResetCamera}
          className="px-3.5 py-1.5 rounded-xl liquid-glass-navbar text-xs font-semibold text-white hover:border-cyan-400 shadow-md transition-all flex items-center gap-1.5"
        >
          <span>Aerial Campus View</span>
        </button>
      </div>
    </div>
  );
};

/* =========================================================================
   PROCEDURAL THREE.JS MESH BUILDERS MATCHING CIT AERIAL PHOTO
========================================================================= */

// 1. Terrain & Main Green Ground
function buildCampusGroundAndTerrain(scene: THREE.Scene) {
  // Main Grass Ground Plane
  const groundGeo = new THREE.PlaneGeometry(550, 550, 40, 40);
  const groundMat = new THREE.MeshLambertMaterial({ color: 0x4b873a });
  const ground = new THREE.Mesh(groundGeo, groundMat);
  ground.rotation.x = -Math.PI / 2;
  ground.receiveShadow = true;
  scene.add(ground);

  // Central Landscaped Green Mound / Hill (matching central-right rolling lawn in photo)
  const hillGeo = new THREE.CylinderGeometry(55, 75, 4, 32);
  const hillMat = new THREE.MeshLambertMaterial({ color: 0x5ba044 });
  const hill = new THREE.Mesh(hillGeo, hillMat);
  hill.position.set(45, 1.2, 35);
  hill.receiveShadow = true;
  scene.add(hill);

  // Secondary gentle lawn patches
  const patch1 = new THREE.Mesh(new THREE.CylinderGeometry(30, 40, 2, 24), new THREE.MeshLambertMaterial({ color: 0x549b3e }));
  patch1.position.set(-40, 0.8, -45);
  scene.add(patch1);
}

// 2. Roads, Avenues, and Limestone Pedestrian Pathways
function buildRoadsAndPaths(scene: THREE.Scene) {
  const roadMat = new THREE.MeshLambertMaterial({ color: 0x272b30 });
  const pathMat = new THREE.MeshLambertMaterial({ color: 0xe5dfcf });

  // Main Peripheral Ring Road (Asphalt)
  const ringRoadGeo = new THREE.RingGeometry(180, 202, 48);
  const ringRoad = new THREE.Mesh(ringRoadGeo, roadMat);
  ringRoad.rotation.x = -Math.PI / 2;
  ringRoad.position.y = 0.05;
  ringRoad.receiveShadow = true;
  scene.add(ringRoad);

  // Cross-Campus Primary Avenues
  // North-South Avenue
  const roadNS = new THREE.Mesh(new THREE.PlaneGeometry(16, 380), roadMat);
  roadNS.rotation.x = -Math.PI / 2;
  roadNS.position.set(-60, 0.06, 0);
  roadNS.receiveShadow = true;
  scene.add(roadNS);

  // East-West Main Boulevard
  const roadEW = new THREE.Mesh(new THREE.PlaneGeometry(380, 16), roadMat);
  roadEW.rotation.x = -Math.PI / 2;
  roadEW.position.set(0, 0.06, 50);
  roadEW.receiveShadow = true;
  scene.add(roadEW);

  // Limestone Pedestrian Promenades connecting all buildings
  const mainPromenade = new THREE.Mesh(new THREE.PlaneGeometry(24, 180), pathMat);
  mainPromenade.rotation.x = -Math.PI / 2;
  mainPromenade.position.set(0, 0.08, 45);
  mainPromenade.receiveShadow = true;
  scene.add(mainPromenade);

  // Diagonal connecting walkways
  const diag1 = new THREE.Mesh(new THREE.PlaneGeometry(10, 160), pathMat);
  diag1.rotation.x = -Math.PI / 2;
  diag1.rotation.z = Math.PI / 4;
  diag1.position.set(40, 0.07, -10);
  diag1.receiveShadow = true;
  scene.add(diag1);

  const diag2 = new THREE.Mesh(new THREE.PlaneGeometry(10, 140), pathMat);
  diag2.rotation.x = -Math.PI / 2;
  diag2.rotation.z = -Math.PI / 4;
  diag2.position.set(-30, 0.07, 30);
  diag2.receiveShadow = true;
  scene.add(diag2);
}

// 3. Plazas and Water Features
function buildPlazasAndWater(scene: THREE.Scene) {
  const waterMat = new THREE.MeshStandardMaterial({
    color: 0x1d9bf0,
    roughness: 0.1,
    metalness: 0.8,
    transparent: true,
    opacity: 0.85,
  });

  // Grand Ceremonial Circular Plaza in Foreground (matching photo)
  const plazaMat = new THREE.MeshLambertMaterial({ color: 0xddd6c5 });
  const plazaGeo = new THREE.CylinderGeometry(38, 42, 1.2, 48);
  const mainPlaza = new THREE.Mesh(plazaGeo, plazaMat);
  mainPlaza.position.set(50, 0.6, 130);
  mainPlaza.receiveShadow = true;
  scene.add(mainPlaza);

  // Concentric Rings inside the Plaza
  for (let r = 8; r <= 28; r += 7) {
    const ring = new THREE.Mesh(new THREE.RingGeometry(r, r + 1.2, 36), new THREE.MeshBasicMaterial({ color: 0xb5ad9a }));
    ring.rotation.x = -Math.PI / 2;
    ring.position.set(50, 1.22, 130);
    scene.add(ring);
  }

  // Central Water Pool in Plaza
  const plazaWater = new THREE.Mesh(new THREE.CylinderGeometry(5.5, 5.5, 0.4, 32), waterMat);
  plazaWater.position.set(50, 1.2, 130);
  scene.add(plazaWater);

  // Upper Circular Garden Plaza (matching upper left of center in photo)
  const upperPlaza = new THREE.Mesh(new THREE.CylinderGeometry(26, 28, 1, 36), plazaMat);
  upperPlaza.position.set(-20, 0.5, -95);
  upperPlaza.receiveShadow = true;
  scene.add(upperPlaza);

  // Reflecting Water Basin in front of Central Landmark Building
  const basinGeo = new THREE.BoxGeometry(45, 1, 18);
  const basin = new THREE.Mesh(basinGeo, waterMat);
  basin.position.set(0, 0.55, 20);
  scene.add(basin);

  const basinBorder = new THREE.Mesh(
    new THREE.BoxGeometry(47, 1.2, 20),
    new THREE.MeshLambertMaterial({ color: 0xe5e0d4 })
  );
  basinBorder.position.set(0, 0.5, 20);
  scene.add(basinBorder);

  // Natural Winding Lake / Pond in the Green Park
  const lake = new THREE.Mesh(new THREE.CylinderGeometry(18, 24, 0.5, 24), waterMat);
  lake.position.set(30, 0.3, -40);
  lake.scale.set(1.4, 1, 0.7);
  scene.add(lake);
}

// 4. Sports Complex (Running Track, Soccer Pitch, Courts)
function buildSportsComplex(scene: THREE.Scene) {
  // Red All-Weather Running Track on Left (matching photo)
  const trackGeo = new THREE.BoxGeometry(60, 0.8, 100);
  const trackMat = new THREE.MeshLambertMaterial({ color: 0xb83a2b });
  const track = new THREE.Mesh(trackGeo, trackMat);
  track.position.set(-145, 0.4, 85);
  track.receiveShadow = true;
  scene.add(track);

  // Curved Track Ends (Half Cylinders)
  const capGeo = new THREE.CylinderGeometry(30, 30, 0.8, 32, 1, false, 0, Math.PI);
  const cap1 = new THREE.Mesh(capGeo, trackMat);
  cap1.position.set(-145, 0.4, 35);
  cap1.rotation.y = Math.PI;
  scene.add(cap1);

  const cap2 = new THREE.Mesh(capGeo, trackMat);
  cap2.position.set(-145, 0.4, 135);
  scene.add(cap2);

  // Inner Green Soccer Pitch
  const pitchGeo = new THREE.BoxGeometry(36, 0.9, 70);
  const pitchMat = new THREE.MeshLambertMaterial({ color: 0x2e7d32 });
  const pitch = new THREE.Mesh(pitchGeo, pitchMat);
  pitch.position.set(-145, 0.45, 85);
  scene.add(pitch);

  // White Field Markings
  const centerCircle = new THREE.Mesh(new THREE.RingGeometry(6, 6.5, 24), new THREE.MeshBasicMaterial({ color: 0xffffff }));
  centerCircle.rotation.x = -Math.PI / 2;
  centerCircle.position.set(-145, 0.92, 85);
  scene.add(centerCircle);

  // Hardcourt Tennis / Basketball Courts
  const court = new THREE.Mesh(
    new THREE.BoxGeometry(28, 0.7, 45),
    new THREE.MeshLambertMaterial({ color: 0x1e88e5 })
  );
  court.position.set(-145, 0.35, 175);
  scene.add(court);
}

// 5. Build All Specific Buildings Matching Aerial Photo
function buildAllBuildings(scene: THREE.Scene, buildingMap: Map<string, THREE.Group>) {
  CAMPUS_BUILDINGS.forEach((bldg) => {
    const grp = new THREE.Group();
    grp.userData = { buildingId: bldg.id };
    grp.position.set(...bldg.position);

    switch (bldg.id) {
      case 'central-atrium':
        buildCentralAtriumMesh(grp);
        break;
      case 'circular-arena':
        buildCircularArenaMesh(grp);
        break;
      case 'crystal-pavilion':
        buildCrystalPavilionMesh(grp);
        break;
      case 'main-auditorium':
        buildMainAuditoriumMesh(grp);
        break;
      case 'quad-engineering':
      case 'quad-electronics':
      case 'quad-sciences':
        buildQuadrangleMesh(grp, bldg.name);
        break;
      case 'admin-complex':
        buildAdminComplexMesh(grp);
        break;
      case 'student-center':
        buildStudentCenterMesh(grp);
        break;
      default:
        buildGenericPavilionMesh(grp, bldg);
    }

    // Add invisible/translucent highlight box for raycasting & focus glow
    const boundingBoxGeo = new THREE.BoxGeometry(38, 25, 38);
    const highlightMat = new THREE.MeshBasicMaterial({
      color: 0x38bdf8,
      transparent: true,
      opacity: 0.25,
      wireframe: false,
    });
    const highlightBox = new THREE.Mesh(boundingBoxGeo, highlightMat);
    highlightBox.name = 'highlightBox';
    highlightBox.position.y = 12;
    highlightBox.visible = false;
    grp.add(highlightBox);

    scene.add(grp);
    buildingMap.set(bldg.id, grp);
  });

  // Connecting Skybridge between Engineering Block A and Electronics Block B
  const skybridge = new THREE.Mesh(
    new THREE.BoxGeometry(8, 5, 25),
    new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.5, roughness: 0.2 })
  );
  skybridge.position.set(-75, 12, 98);
  skybridge.castShadow = true;
  scene.add(skybridge);
}

// A. Central Stepped Atrium & Library (The monumental core building in photo)
function buildCentralAtriumMesh(group: THREE.Group) {
  const stoneMat = new THREE.MeshStandardMaterial({ color: 0xe8dfce, roughness: 0.7 });
  const darkGlassMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.8, roughness: 0.2 });
  const greenTerraceMat = new THREE.MeshLambertMaterial({ color: 0x4d883c });

  // Tier 1 Base Podium
  const t1 = new THREE.Mesh(new THREE.BoxGeometry(56, 8, 56), stoneMat);
  t1.position.y = 4;
  t1.castShadow = true;
  t1.receiveShadow = true;
  group.add(t1);

  // Grand Entrance Steps
  const steps = new THREE.Mesh(new THREE.BoxGeometry(24, 3, 14), stoneMat);
  steps.position.set(0, 1.5, 32);
  steps.castShadow = true;
  group.add(steps);

  // Tier 2 Middle Core with dark glass strip
  const t2 = new THREE.Mesh(new THREE.BoxGeometry(46, 12, 46), stoneMat);
  t2.position.y = 14;
  t2.castShadow = true;
  group.add(t2);

  const glassStrip = new THREE.Mesh(new THREE.BoxGeometry(47, 4, 47), darkGlassMat);
  glassStrip.position.y = 14;
  group.add(glassStrip);

  // Tier 3 Upper Level
  const t3 = new THREE.Mesh(new THREE.BoxGeometry(36, 8, 36), stoneMat);
  t3.position.y = 24;
  t3.castShadow = true;
  group.add(t3);

  // Rooftop Garden Deck
  const roofGarden = new THREE.Mesh(new THREE.BoxGeometry(34, 1, 34), greenTerraceMat);
  roofGarden.position.y = 28.5;
  group.add(roofGarden);

  // Central Glass Skylight Cube atop roof
  const skylight = new THREE.Mesh(
    new THREE.BoxGeometry(16, 4, 16),
    new THREE.MeshStandardMaterial({ color: 0x38bdf8, metalness: 0.9, roughness: 0.1, transparent: true, opacity: 0.8 })
  );
  skylight.position.y = 30;
  group.add(skylight);
}

// B. Circular Colosseum & Dome Sports Arena (Left of campus)
function buildCircularArenaMesh(group: THREE.Group) {
  const wallMat = new THREE.MeshStandardMaterial({ color: 0xe2e8f0, roughness: 0.5 });
  const domeMat = new THREE.MeshStandardMaterial({ color: 0xa0aec0, metalness: 0.6, roughness: 0.3 });

  // Outer Tier 1 Cylinder Wall
  const baseCyl = new THREE.Mesh(new THREE.CylinderGeometry(28, 30, 8, 36), wallMat);
  baseCyl.position.y = 4;
  baseCyl.castShadow = true;
  baseCyl.receiveShadow = true;
  group.add(baseCyl);

  // Tier 2 Cylinder Wall
  const midCyl = new THREE.Mesh(new THREE.CylinderGeometry(24, 25, 7, 36), wallMat);
  midCyl.position.y = 11.5;
  midCyl.castShadow = true;
  group.add(midCyl);

  // Outer Ribbed Colonnade ring
  for (let i = 0; i < 16; i++) {
    const angle = (i / 16) * Math.PI * 2;
    const col = new THREE.Mesh(new THREE.CylinderGeometry(0.8, 0.8, 14, 8), wallMat);
    col.position.set(Math.cos(angle) * 27, 7, Math.sin(angle) * 27);
    col.castShadow = true;
    group.add(col);
  }

  // Metallic Ribbed Dome Roof
  const dome = new THREE.Mesh(new THREE.SphereGeometry(21, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2), domeMat);
  dome.position.y = 15;
  dome.castShadow = true;
  group.add(dome);

  // Top Sky Lantern
  const crown = new THREE.Mesh(new THREE.CylinderGeometry(6, 6, 2, 18), wallMat);
  crown.position.y = 26;
  group.add(crown);
}

// C. Design & Innovation Crystal Pavilion (Geometric faceted architecture)
function buildCrystalPavilionMesh(group: THREE.Group) {
  const whiteMat = new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.3 });
  const glassMat = new THREE.MeshStandardMaterial({ color: 0x38bdf8, metalness: 0.8, roughness: 0.1 });

  // Faceted Polyhedral Base
  const geom = new THREE.DodecahedronGeometry(16, 0);
  const crystal = new THREE.Mesh(geom, whiteMat);
  crystal.scale.set(1.4, 0.85, 1.1);
  crystal.position.y = 10;
  crystal.castShadow = true;
  crystal.receiveShadow = true;
  group.add(crystal);

  // Glass Inset Facets
  const innerGlass = new THREE.Mesh(new THREE.IcosahedronGeometry(11, 0), glassMat);
  innerGlass.position.y = 11;
  group.add(innerGlass);
}

// D. Main University Auditorium (Terracotta classical building with louvers)
function buildMainAuditoriumMesh(group: THREE.Group) {
  const terracottaMat = new THREE.MeshStandardMaterial({ color: 0xc2644e, roughness: 0.6 });
  const roofMat = new THREE.MeshStandardMaterial({ color: 0xecd9ca, roughness: 0.5 });

  // Main Auditorium Body
  const body = new THREE.Mesh(new THREE.BoxGeometry(40, 15, 26), terracottaMat);
  body.position.y = 7.5;
  body.castShadow = true;
  body.receiveShadow = true;
  group.add(body);

  // Tall Stage Fly Tower at Back
  const flyTower = new THREE.Mesh(new THREE.BoxGeometry(26, 23, 14), terracottaMat);
  flyTower.position.set(-5, 11.5, -6);
  flyTower.castShadow = true;
  group.add(flyTower);

  // Front Facade Vertical Columns / Ribs
  for (let x = -16; x <= 16; x += 4) {
    const column = new THREE.Mesh(new THREE.BoxGeometry(1.2, 13, 2), roofMat);
    column.position.set(x, 6.5, 14);
    column.castShadow = true;
    group.add(column);
  }

  // Stepped Entrance Portico
  const portico = new THREE.Mesh(new THREE.BoxGeometry(36, 2, 6), roofMat);
  portico.position.set(0, 1, 15);
  group.add(portico);
}

// E. Academic Quadrangle Blocks (U-shaped with courtyards and windows)
function buildQuadrangleMesh(group: THREE.Group, _title: string) {
  const wallMat = new THREE.MeshStandardMaterial({ color: 0xe6decd, roughness: 0.7 });
  const roofMat = new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.4 });
  const grassMat = new THREE.MeshLambertMaterial({ color: 0x488339 });

  // Main Wing
  const mainWing = new THREE.Mesh(new THREE.BoxGeometry(42, 14, 12), wallMat);
  mainWing.position.set(0, 7, -12);
  mainWing.castShadow = true;
  group.add(mainWing);

  // Left Wing
  const leftWing = new THREE.Mesh(new THREE.BoxGeometry(12, 14, 30), wallMat);
  leftWing.position.set(-15, 7, 3);
  leftWing.castShadow = true;
  group.add(leftWing);

  // Right Wing
  const rightWing = new THREE.Mesh(new THREE.BoxGeometry(12, 14, 30), wallMat);
  rightWing.position.set(15, 7, 3);
  rightWing.castShadow = true;
  group.add(rightWing);

  // Dark Pitched Roof Caps
  const roofMain = new THREE.Mesh(new THREE.BoxGeometry(44, 2, 14), roofMat);
  roofMain.position.set(0, 15, -12);
  group.add(roofMain);

  const roofLeft = new THREE.Mesh(new THREE.BoxGeometry(14, 2, 32), roofMat);
  roofLeft.position.set(-15, 15, 3);
  group.add(roofLeft);

  const roofRight = new THREE.Mesh(new THREE.BoxGeometry(14, 2, 32), roofMat);
  roofRight.position.set(15, 15, 3);
  group.add(roofRight);

  // Inner Courtyard Green Garden
  const courtyard = new THREE.Mesh(new THREE.BoxGeometry(18, 0.5, 20), grassMat);
  courtyard.position.set(0, 0.3, 3);
  group.add(courtyard);
}

// F. Admin Complex
function buildAdminComplexMesh(group: THREE.Group) {
  const adminMat = new THREE.MeshStandardMaterial({ color: 0xefebe0, roughness: 0.6 });
  const glassMat = new THREE.MeshStandardMaterial({ color: 0x1e3a8a, metalness: 0.8, roughness: 0.2 });

  const b1 = new THREE.Mesh(new THREE.BoxGeometry(32, 15, 20), adminMat);
  b1.position.y = 7.5;
  b1.castShadow = true;
  group.add(b1);

  const bGlass = new THREE.Mesh(new THREE.BoxGeometry(18, 16, 21), glassMat);
  bGlass.position.y = 8;
  group.add(bGlass);
}

// G. Student Activity Center (SAC)
function buildStudentCenterMesh(group: THREE.Group) {
  const sacMat = new THREE.MeshStandardMaterial({ color: 0xded8c8, roughness: 0.5 });
  const greenRoof = new THREE.MeshLambertMaterial({ color: 0x4d8b3b });

  const b = new THREE.Mesh(new THREE.BoxGeometry(32, 9, 22), sacMat);
  b.position.y = 4.5;
  b.castShadow = true;
  group.add(b);

  const roof = new THREE.Mesh(new THREE.BoxGeometry(34, 1.5, 24), greenRoof);
  roof.position.y = 9.5;
  group.add(roof);
}

// H. Generic Pavilion
function buildGenericPavilionMesh(group: THREE.Group, _b: CampusBuilding) {
  const mat = new THREE.MeshStandardMaterial({ color: 0xe2dcd0, roughness: 0.6 });
  const mesh = new THREE.Mesh(new THREE.BoxGeometry(26, 11, 20), mat);
  mesh.position.y = 5.5;
  mesh.castShadow = true;
  group.add(mesh);
}

// 6. Procedural Foliage Trees (Hundreds of trees distributed across campus avenues and gardens)
function buildFoliageTrees(scene: THREE.Scene) {
  const trunkMat = new THREE.MeshLambertMaterial({ color: 0x5c4033 });
  const foliageColors = [0x2e6629, 0x3d7b32, 0x4d8b3b, 0x609942, 0x245520];

  const treeGeoCone = new THREE.ConeGeometry(2.4, 5.5, 7);
  const treeGeoSphere = new THREE.SphereGeometry(2.6, 7, 6);
  const trunkGeo = new THREE.CylinderGeometry(0.4, 0.6, 3, 6);

  // Group for instanced or batch trees
  const treeCoords: [number, number][] = [];

  // Trees along North-South avenue
  for (let z = -140; z <= 150; z += 14) {
    treeCoords.push([-68, z]);
    treeCoords.push([-52, z]);
  }

  // Trees along East-West boulevard
  for (let x = -130; x <= 140; x += 15) {
    treeCoords.push([x, 42]);
    treeCoords.push([x, 58]);
  }

  // Trees encircling the grand circular plaza
  for (let a = 0; a < Math.PI * 2; a += Math.PI / 8) {
    treeCoords.push([50 + Math.cos(a) * 36, 130 + Math.sin(a) * 36]);
  }

  // Trees scattering in the central green park
  const parkTrees: [number, number][] = [
    [25, 10], [35, 20], [55, 15], [30, -15], [45, -25], [60, -10],
    [15, -35], [25, -50], [50, -45], [70, -30], [80, 5], [75, 40],
    [-20, 25], [-15, 60], [-30, 80], [-10, 100], [10, 85]
  ];
  treeCoords.push(...parkTrees);

  // Perimeter tree groves
  for (let i = 0; i < 40; i++) {
    const angle = (i / 40) * Math.PI * 2;
    treeCoords.push([Math.cos(angle) * 165, Math.sin(angle) * 165]);
  }

  treeCoords.forEach(([x, z], idx) => {
    const treeGroup = new THREE.Group();
    treeGroup.position.set(x, 0, z);

    // Trunk
    const trunk = new THREE.Mesh(trunkGeo, trunkMat);
    trunk.position.y = 1.5;
    trunk.castShadow = true;
    treeGroup.add(trunk);

    // Foliage (alternate between cone and sphere canopy)
    const color = foliageColors[idx % foliageColors.length];
    const foliageMat = new THREE.MeshLambertMaterial({ color });

    if (idx % 2 === 0) {
      const cone1 = new THREE.Mesh(treeGeoCone, foliageMat);
      cone1.position.y = 4.8;
      cone1.castShadow = true;
      treeGroup.add(cone1);

      const cone2 = new THREE.Mesh(treeGeoCone, foliageMat);
      cone2.scale.set(0.75, 0.75, 0.75);
      cone2.position.y = 6.8;
      treeGroup.add(cone2);
    } else {
      const sphere = new THREE.Mesh(treeGeoSphere, foliageMat);
      sphere.position.y = 4.5;
      sphere.scale.set(1, 1.2, 1);
      sphere.castShadow = true;
      treeGroup.add(sphere);
    }

    scene.add(treeGroup);
  });
}
