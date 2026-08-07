import React, { useRef, useState, useEffect, useMemo } from 'react';
import Globe from 'react-globe.gl';
import * as THREE from 'three';

const materialCache = {};

export default function GlobeComponent({ selectedCountry, onCountryClick, onPixelClick, onUfoClick, isUfoPanelOpen, purchasedPixels = [], activeAttacks = [], conqueredCountries = {}, worldBoss, alliances = [], emperors = {} }) {
  const animatedMaterials = useRef({});
  const globeEl = useRef();
  const [countries, setCountries] = useState({ features: [] });
  const [hoverD, setHoverD] = useState();
  const [hoveredPixel, setHoveredPixel] = useState(null);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const shipRef = useRef(null);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const planetsAdded = useRef(false);

  useEffect(() => {
    // Load GeoJSON data for countries
    fetch('https://raw.githubusercontent.com/vasturiano/react-globe.gl/master/example/datasets/ne_110m_admin_0_countries.geojson')
      .then(res => res.json())
      .then(setCountries);

      // Slowly rotate the globe for a cinematic effect
      if (globeEl.current) {
        const controls = globeEl.current.controls();
        controls.autoRotate = true;
        controls.autoRotateSpeed = 0.2; // Very slow and smooth
        // Prevent zooming too close (clipping) on mobile
        // Allow zooming extremely close to see the individual crystals
        controls.minDistance = 105;
        controls.maxDistance = 600;
        globeEl.current.pointOfView({ altitude: 2.5 });
        
        // Add realistic background planets only once
        if (!planetsAdded.current) {
          const scene = globeEl.current.scene();
          
          // 1. Realistic Moon
          const textureLoader = new THREE.TextureLoader();
          const moonGeo = new THREE.SphereGeometry(20, 32, 32);
          const moonMat = new THREE.MeshStandardMaterial({ 
            color: 0xe0e0e0, 
            roughness: 0.9,
            bumpScale: 0.05
          });
          const moon = new THREE.Mesh(moonGeo, moonMat);
          moon.position.set(180, 60, -250); 
          scene.add(moon);

          // 2. Distant Mars-like planet
          const marsGeo = new THREE.SphereGeometry(12, 32, 32);
          const marsMat = new THREE.MeshStandardMaterial({
            color: 0xbf3f27,
            roughness: 1,
          });
          const mars = new THREE.Mesh(marsGeo, marsMat);
          mars.position.set(-220, -80, -200);
          scene.add(mars);

          // 3. Cyberpunk Neon Star / Nebula core
          const starGeo = new THREE.SphereGeometry(4, 16, 16);
          const starMat = new THREE.MeshBasicMaterial({ color: 0x00f3ff });
          const star = new THREE.Mesh(starGeo, starMat);
          star.position.set(120, 160, 100);
          
          // Glowing aura for the star
          const auraGeo = new THREE.SphereGeometry(6, 16, 16);
          const auraMat = new THREE.MeshBasicMaterial({ color: 0x00f3ff, transparent: true, opacity: 0.3 });
          const aura = new THREE.Mesh(auraGeo, auraMat);
          star.add(aura);
          scene.add(star);

          // Lights for the planets
          const dirLight = new THREE.DirectionalLight(0xffffff, 1.2);
          dirLight.position.set(200, 100, 100);
          scene.add(dirLight);

          const ambientLight = new THREE.AmbientLight(0xffffff, 0.2);
          scene.add(ambientLight);

          planetsAdded.current = true;
        }
      }
  }, []);

  const getIsoByName = (name) => {
    const overrides = {
      'France': 'fr',
      'Norway': 'no',
      'Somaliland': 'so',
      'Kosovo': 'xk'
    };
    if (overrides[name]) return overrides[name];
    const feature = countries.features?.find(f => f.properties.ADMIN === name);
    const iso = feature ? feature.properties.ISO_A2?.toLowerCase() : null;
    return (iso && iso !== '-99') ? iso : null;
  };
  // Calculate the centroid of a country from its GeoJSON geometry
  const getCentroid = (name) => {
    const feature = countries.features?.find(f => f.properties.ADMIN === name);
    if (!feature) return null;
    const geom = feature.geometry;
    let pts = [];
    if (geom.type === 'Polygon') {
      pts = geom.coordinates[0];
    } else if (geom.type === 'MultiPolygon') {
      // Use the largest polygon (most points) for best centroid
      let largest = geom.coordinates[0][0];
      geom.coordinates.forEach(poly => {
        if (poly[0].length > largest.length) largest = poly[0];
      });
      pts = largest;
    }
    if (pts.length === 0) return null;
    let minLng = 180, maxLng = -180, minLat = 90, maxLat = -90;
    pts.forEach(p => { 
      if (p[0] < minLng) minLng = p[0];
      if (p[0] > maxLng) maxLng = p[0];
      if (p[1] < minLat) minLat = p[1];
      if (p[1] > maxLat) maxLat = p[1];
    });
    return { lat: (minLat + maxLat) / 2, lng: (minLng + maxLng) / 2 };
  };

  const playerCountryGroups = useMemo(() => {
    const groups = {};
    purchasedPixels.forEach(p => {
      const key = `${p.country}_${p.name}`;
      if (!groups[key]) {
         const centroid = getCentroid(p.country);
         if (!centroid) return;
         
         // Deterministic hash based on username to offset their crystal slightly from centroid
         let hash = 0;
         for (let i = 0; i < p.name.length; i++) {
            hash = Math.imul(31, hash) + p.name.charCodeAt(i) | 0;
         }
         const rng = () => {
            hash = Math.imul(741103597, hash) + 1 | 0;
            return (hash >>> 0) / 4294967296;
         };
         
         // Offset up to +/- 1.5 degrees so players form a cluster/city on the map
         const offsetLat = (rng() - 0.5) * 3.0;
         const offsetLng = (rng() - 0.5) * 3.0;
         
         groups[key] = { 
            ...p, 
            lat: centroid.lat + offsetLat, 
            lng: centroid.lng + offsetLng, 
            totalPixels: 0, 
            isGroupedPlayer: true 
         };
      }
      groups[key].totalPixels += (p.amount || 1);
    });
    return Object.values(groups);
  }, [purchasedPixels, countries]);

  // Compute HTML Overlays
  const htmlElements = useMemo(() => {
    const elements = [];

    // Calculate country totals for counters
    const countryStats = {};
    purchasedPixels.forEach(p => {
      if (!countryStats[p.country]) {
        countryStats[p.country] = { count: 0 };
      }
      countryStats[p.country].count += (p.amount || 1);
    });

    // Add a live counter badge for each active country at its centroid
    Object.keys(countryStats).forEach(country => {
      // Only show the label if this country is currently hovered to avoid clutter and overlap
      if (!hoverD || !hoverD.properties || hoverD.properties.ADMIN !== country) return;

      let displayIso = getIsoByName(country);
      if (conqueredCountries && conqueredCountries[country]) {
        displayIso = getIsoByName(conqueredCountries[country]);
      }

      const centroid = getCentroid(country);
      if (!centroid) return;

      elements.push({
        type: 'counter',
        country,
        lat: centroid.lat,
        lng: centroid.lng,
        count: countryStats[country].count,
        iso: displayIso
      });
    });

    // Only show tooltip for the currently hovered pixel to save massive performance
    if (hoveredPixel) {
      elements.push({ ...hoveredPixel, type: 'tooltip' });
    }

    if (worldBoss && worldBoss.active) {
      elements.push({ ...worldBoss, type: 'ufo-hp' });
    }

    // Add HTML logos ONLY if they have >= 100 pixels in that country
    playerCountryGroups.forEach(group => {
      if (group.totalPixels >= 100) {
        elements.push({ 
           ...group, 
           type: 'logo', 
           isGlobalVisible: group.totalPixels >= 500 
        });
      }
    });

    // Add Alliance Crests for any active alliance over countryA
    const alliancesByCountry = {};
    if (alliances && alliances.length > 0) {
      alliances.forEach(a => {
        if (a.expiresAt > Date.now()) {
          if (!alliancesByCountry[a.countryA]) alliancesByCountry[a.countryA] = [];
          alliancesByCountry[a.countryA].push(a);
        }
      });

      Object.keys(alliancesByCountry).forEach(countryName => {
        const activeAlliances = alliancesByCountry[countryName].slice(0, 10); // Max 10 per country
        const centroid = getCentroid(countryName);
        if (centroid) {
          // Calculate dynamic radius based on the country's pixel count to push them outside the grid
          const countryPixelCount = purchasedPixels.filter(p => p.country === countryName).length;
          const gridRadius = (Math.ceil(Math.sqrt(Math.min(5000, countryPixelCount))) / 2) * 0.5;
          const radius = Math.max(3.0, gridRadius + 1.5); // Push them further out

          activeAlliances.forEach((a, index) => {
            const angle = (index / activeAlliances.length) * Math.PI * 2;
            const offsetLat = activeAlliances.length === 1 ? 0 : Math.sin(angle) * radius;
            const offsetLng = activeAlliances.length === 1 ? 0 : Math.cos(angle) * radius;

            elements.push({
              type: 'alliance-crest',
              name: a.name || 'Alianță',
              crest: a.crest || '🛡️',
              color: a.color || '#00f3ff',
              lat: centroid.lat + offsetLat,
              lng: centroid.lng + offsetLng,
              allianceData: a
            });
          });
        }
      });
    }

    return elements;
  }, [purchasedPixels, hoveredPixel, countries, conqueredCountries, hoverD, worldBoss, alliances]);

  useEffect(() => {
    const handleGlobalClick = (e) => {
      const ufoBar = e.target.closest('.ufo-hp-bar');
      if (ufoBar && worldBoss && worldBoss.active) {
         e.preventDefault();
         if (onUfoClick) onUfoClick();
      }
    };

    window.addEventListener('pointerdown', handleGlobalClick, { capture: true });
    window.addEventListener('click', handleGlobalClick, { capture: true });
    window.addEventListener('dblclick', handleGlobalClick, { capture: true });
    return () => {
      window.removeEventListener('pointerdown', handleGlobalClick, { capture: true });
      window.removeEventListener('click', handleGlobalClick, { capture: true });
      window.removeEventListener('dblclick', handleGlobalClick, { capture: true });
    };
  }, [worldBoss, onUfoClick]);

  // High Performance Visual Reactivity (Pulsing Territories)
  useEffect(() => {
    if (isMobile) return; // Save CPU/GPU on mobile!

    let frameId;
    const animate = () => {
      const time = Date.now() / 200; // Speed of the pulse
      const activeTargets = activeAttacks ? activeAttacks.map(a => a.target) : [];
      
      Object.keys(animatedMaterials.current).forEach(country => {
        const mat = animatedMaterials.current[country];
        if (!mat) return;
        
        if (activeTargets.includes(country)) {
          // Intense pulse for under-attack countries
          const intensity = (Math.sin(time) + 1) / 2; // 0 to 1
          mat.color.setRGB(1, 0.2 + (intensity * 0.8), 0.2 + (intensity * 0.8)); // Pulses towards red
        } else {
          // Reset to normal white/transparent
          mat.color.setHex(0xffffff);
        }
      });
      frameId = requestAnimationFrame(animate);
    };
    
    animate();
    return () => cancelAnimationFrame(frameId);
  }, [activeAttacks]);

  // Shockwaves & Lasers (Arcs) Logic tied to Active Attacks
  const [rings, setRings] = useState([]);
  const [arcs, setArcs] = useState([]);
  
  useEffect(() => {
    if (!activeAttacks || activeAttacks.length === 0) {
      setRings([]);
      setArcs([]);
      return;
    }
    
    const newRings = [];
    const newArcs = [];

    activeAttacks.forEach(attack => {
       // Target processing
       let targetP = null;
       
       if (attack.lat !== undefined && attack.lng !== undefined) {
          targetP = { lat: attack.lat, lng: attack.lng };
       } else {
          const targetPixels = purchasedPixels.filter(p => p.country === attack.target);
          
          const getCentroid = (name) => {
         const feature = countries.features?.find(f => f.properties.ADMIN === name);
         if (!feature) return null;
         const geom = feature.geometry;
         let pts = [];
         if (geom.type === 'Polygon') pts = geom.coordinates[0];
         else if (geom.type === 'MultiPolygon') {
           let largest = geom.coordinates[0][0];
           geom.coordinates.forEach(poly => { if (poly[0].length > largest.length) largest = poly[0]; });
           pts = largest;
         }
         if (pts.length === 0) return null;
         let sumLng = 0, sumLat = 0;
         pts.forEach(p => { sumLng += p[0]; sumLat += p[1]; });
         return { lat: sumLat / pts.length, lng: sumLng / pts.length };
       };


       if (targetPixels.length > 0) {
         targetP = targetPixels[Math.floor(Math.random() * targetPixels.length)];
       } else {
         targetP = getCentroid(attack.target); // fallback to centroid
       }

       if (targetP) {
         newRings.push({
           lat: targetP.lat,
           lng: targetP.lng,
           color: attack.color || (Math.random() > 0.5 ? '#bc13fe' : '#00f3ff'), 
           maxR: Math.random() * 6 + 6,
           propagationSpeed: Math.random() * 2 + 3,
           repeatPeriod: Math.random() * 400 + 400
         });
         
         // Generate arcs coming from outside orbit down to the target
         for (let i=0; i< (attack.lasersCount || 2); i++) {
            newArcs.push({
               startLat: targetP.lat + (Math.random() * 60 - 30),
               startLng: targetP.lng + (Math.random() * 60 - 30),
               endLat: targetP.lat,
               endLng: targetP.lng,
               color: attack.laserColor || ['red', '#ff4444', '#ffaaaa'][Math.floor(Math.random() * 3)]
            });
         }
       }
      }
    });
    setRings(newRings);
    setArcs(newArcs);
  }, [activeAttacks, purchasedPixels, countries]);

  // Create a stylized 3D Pixel or UFO
  const createCustomObject = (d) => {
    if (d.isUFO) {
       const ufoGroup = new THREE.Group();
       
       // UFO Disk
       const diskGeo = new THREE.TorusGeometry(3, 1.2, 16, 100);
       const diskMat = new THREE.MeshStandardMaterial({ color: '#222222', metalness: 0.9, roughness: 0.1 });
       const disk = new THREE.Mesh(diskGeo, diskMat);
       disk.rotation.x = Math.PI / 2;
       
       // UFO Dome
       const domeGeo = new THREE.SphereGeometry(2.5, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2);
       const domeMat = new THREE.MeshStandardMaterial({ color: '#ff0000', emissive: '#ff0000', emissiveIntensity: 1.5, transparent: true, opacity: 0.9 });
       const dome = new THREE.Mesh(domeGeo, domeMat);
       dome.position.y = 0.5;

       // Tractor Beam (Cylinder)
       const beamGeo = new THREE.CylinderGeometry(1, 6, 15, 32);
       const beamMat = new THREE.MeshBasicMaterial({ color: '#ff0000', transparent: true, opacity: 0.4, blending: THREE.AdditiveBlending });
       const beam = new THREE.Mesh(beamGeo, beamMat);
       beam.position.y = -7.5;

       ufoGroup.add(disk);
       ufoGroup.add(dome);
       ufoGroup.add(beam);

       ufoGroup.scale.set(1.5, 1.5, 1.5);
       
       const parent = new THREE.Group();
       parent.add(ufoGroup);
       parent.__data = d;
       parent.__innerGroup = ufoGroup;
       return parent;
    }

    const parent = new THREE.Group();
    
    // Make pixels MASSIVE and unmissable so we can debug their placement
    const geometry = new THREE.BoxGeometry(2.0, 2.0, 2.0); 
    
    // Pixel material
    const material = new THREE.MeshStandardMaterial({ 
      color: '#bc13fe',
      emissive: '#bc13fe',
      emissiveIntensity: 1.0, // Glow very brightly
      roughness: 0.1,
      metalness: 0.8
    });
    
    const crystal = new THREE.Mesh(geometry, material);
    // Push the pixel outwards along the local Z axis so it sits ABOVE the country polygons
    // Country altitude is 0.01 (1 unit thick) to 0.04 (4 units thick). 
    crystal.position.z = 4.0;
    
    const group = new THREE.Group();
    group.add(crystal);
    
    // Scale for the globe based on pixel count
    const totalPx = d.totalPixels || 1;
    // Base size 0.5. At 100 pixels, it reaches size 1.5 (but it becomes logo at 100 anyway)
    const scale = 0.5 + (Math.min(totalPx, 100) / 100) * 1.0;
    group.scale.set(scale, scale, scale);
    
    // Hitbox for raycasting clicks (scale hitbox too)
    const hitBoxGeo = new THREE.SphereGeometry(2.0 * scale, 8, 8);
    const hitBoxMat = new THREE.MeshBasicMaterial({ visible: false });
    const hitBox = new THREE.Mesh(hitBoxGeo, hitBoxMat);
    
    parent.add(group);
    parent.add(hitBox);
    parent.__data = d;
    parent.__innerGroup = group;
    // slightly rotate to make it look nicer
    group.rotation.x = Math.random() * Math.PI;
    group.rotation.y = Math.random() * Math.PI;

    return parent;
  };

  // Cinematic Solar System Logic (Real-time UTC Day/Night Sync)
  useEffect(() => {
    if (!globeEl.current) return;
    
    let animationFrameId;
    let cleanupLights = () => {};

    // Wait a tick for scene to be ready
    setTimeout(() => {
      if (!globeEl.current) return;
      const scene = globeEl.current.scene();

      // Remove existing globe lights to take control of the shading
      const existingLights = scene.children.filter(obj => obj.isLight);
      existingLights.forEach(l => scene.remove(l));

      // Cinematic Ambient (Pitch black space for the night side to make it realistic)
      const ambientLight = new THREE.AmbientLight(0xffffff, 0.015); // Almost completely dark on the night side
      scene.add(ambientLight);

      // Create Animated Spaceship
      if (!shipRef.current) {
        const shipGroup = new THREE.Group();
        
        const bodyGeo = new THREE.CylinderGeometry(0.3, 0.8, 4, 8);
        bodyGeo.rotateX(Math.PI / 2);
        const bodyMat = new THREE.MeshStandardMaterial({ color: '#ffffff', metalness: 0.9, roughness: 0.1 });
        const body = new THREE.Mesh(bodyGeo, bodyMat);
        
        const wingGeo = new THREE.BoxGeometry(4, 0.1, 1.5);
        const wingMat = new THREE.MeshStandardMaterial({ color: '#ff2a2a', metalness: 0.5 });
        const wing = new THREE.Mesh(wingGeo, wingMat);
        wing.position.set(0, 0, -1);
        
        const cockpitGeo = new THREE.SphereGeometry(0.4, 16, 16);
        cockpitGeo.scale(1, 0.5, 2);
        const cockpitMat = new THREE.MeshPhysicalMaterial({ color: '#00d0ff', transmission: 0.9, opacity: 1, transparent: true, roughness: 0 });
        const cockpit = new THREE.Mesh(cockpitGeo, cockpitMat);
        cockpit.position.set(0, 0.4, 0.5);

        const engineMat = new THREE.MeshBasicMaterial({ color: '#00ffff' });
        const engine1 = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.2, 0.4, 8), engineMat);
        engine1.rotateX(Math.PI / 2);
        engine1.position.set(-0.8, 0, -2);
        const engine2 = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.2, 0.4, 8), engineMat);
        engine2.rotateX(Math.PI / 2);
        engine2.position.set(0.8, 0, -2);

        const engineLight = new THREE.PointLight('#00ffff', 1.5, 20);
        engineLight.position.set(0, 0, -3);
        
        shipGroup.add(body, wing, cockpit, engine1, engine2, engineLight);
        
        // Point nose along the path of orbit
        shipGroup.rotation.y = Math.PI / 2;
        // Push out into orbit (globe radius is 100)
        shipGroup.position.set(0, 0, 105);

        const pivot = new THREE.Group();
        pivot.add(shipGroup);
        scene.add(pivot);
        shipRef.current = { pivot, shipGroup, time: 0 };
      }

      // The Sun (Directional Light for casting daylight based on real time)
      const sunLight = new THREE.DirectionalLight(0xffffff, 4.5); 
      scene.add(sunLight);

      // The Sun Visual Mesh
      const sunGeo = new THREE.SphereGeometry(15, 32, 32);
      const sunMat = new THREE.MeshBasicMaterial({ color: 0xffffee });
      const sunMesh = new THREE.Mesh(sunGeo, sunMat);
      scene.add(sunMesh);

      // Sun Cinematic Glow
      const canvas = document.createElement('canvas');
      canvas.width = 128; canvas.height = 128;
      const context = canvas.getContext('2d');
      const gradient = context.createRadialGradient(64, 64, 0, 64, 64, 64);
      gradient.addColorStop(0, 'rgba(255, 255, 255, 1)');
      gradient.addColorStop(0.2, 'rgba(255, 230, 150, 0.8)');
      gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
      context.fillStyle = gradient;
      context.fillRect(0, 0, 128, 128);
      const glowTex = new THREE.CanvasTexture(canvas);
      const glowMat = new THREE.SpriteMaterial({ map: glowTex, color: 0xffddaa, transparent: true, blending: THREE.AdditiveBlending });
      const sunGlow = new THREE.Sprite(glowMat);
      sunGlow.scale.set(120, 120, 1);
      sunMesh.add(sunGlow);

      cleanupLights = () => {
        scene.remove(ambientLight, sunLight, sunMesh);
      };


      // Real-Time Position Loop for UTC Day/Night
      const updatePositions = () => {
        if (!globeEl.current || !globeEl.current.getCoords) return;
        
        const now = new Date();
        
        // 1. Calculate Real Sun Position (UTC based Day/Night)
        const timeInHours = now.getUTCHours() + now.getUTCMinutes() / 60 + now.getUTCSeconds() / 3600 + now.getUTCMilliseconds() / 3600000;
        
        // Sun moves west by 15 degrees every hour. At 12:00 UTC it is at longitude 0.
        const sunLng = 180 - (timeInHours * 15);
        
        // Rough seasonal declination (Latitude of the sun)
        const dayOfYear = Math.floor((now - new Date(now.getFullYear(), 0, 0)) / 1000 / 60 / 60 / 24);
        const sunLat = -23.44 * Math.cos((360 / 365) * (dayOfYear + 10) * (Math.PI / 180));

        // Place Sun far away (Altitude 12 = ~13 earth radii)
        const sunPos = globeEl.current.getCoords(sunLat, sunLng, 12); 
        sunLight.position.set(sunPos.x, sunPos.y, sunPos.z);
        sunMesh.position.set(sunPos.x, sunPos.y, sunPos.z);

        const pov = globeEl.current.pointOfView();
        // Only show alliances when zoomed in very closely (e.g. altitude < 0.8)
        const shouldShowAlliances = pov.altitude < 0.8;
        
        document.querySelectorAll('.alliance-crest-marker').forEach(el => {
           if (shouldShowAlliances) {
              el.style.opacity = '1';
              el.style.pointerEvents = 'auto';
           } else {
              el.style.opacity = '0';
              el.style.pointerEvents = 'none';
           }
        });

        // Animate Spaceship
        if (shipRef.current) {
           shipRef.current.time += 0.002;
           const t = shipRef.current.time;
           shipRef.current.pivot.rotation.y = t * 2; // Orbit around globe
           shipRef.current.pivot.rotation.x = Math.sin(t) * 0.4; // Wobble latitude
           
           // Ship banking and bobbing
           shipRef.current.shipGroup.position.z = 104 + Math.sin(t * 8) * 1.5;
           shipRef.current.shipGroup.rotation.z = Math.sin(t * 2) * 0.3; 
        }
        
        animationFrameId = requestAnimationFrame(updatePositions);
      };


      updatePositions();
    }, 100);

    return () => {
      if (animationFrameId) cancelAnimationFrame(animationFrameId);
      cleanupLights();
    };
  }, []);

  // Watch for selectedCountry prop changes to fly the camera
  useEffect(() => {
    if (selectedCountry && globeEl.current && countries?.features) {
      const feature = countries.features.find(f => f.properties.ADMIN === selectedCountry.ADMIN);
      if (feature) {
        let type = feature.geometry.type;
        let coords = feature.geometry.coordinates;
        let pts = [];
        if (type === 'Polygon') pts = coords[0];
        else if (type === 'MultiPolygon') pts = coords[0][0]; // approximate with first polygon
        
        if (pts && pts.length > 0) {
          if (!selectedCountry.preventZoom) {
            let sumLng = 0, sumLat = 0;
            pts.forEach(p => { sumLng += p[0]; sumLat += p[1]; });
            const targetLat = sumLat / pts.length;
            const targetLng = sumLng / pts.length;
            
            globeEl.current.pointOfView({ lat: targetLat, lng: targetLng, altitude: 1.0 }, 1000);
            globeEl.current.controls().autoRotate = false;
          }
        }
      }
    }
  }, [selectedCountry, countries]);

  // Watch for UFO panel open to stop rotation and focus on Boss
  useEffect(() => {
    if (selectedCountry && selectedCountry.ADMIN && !selectedCountry.preventZoom) {
      if (globeEl.current) {
        let targetLat = selectedCountry.clickLat || 0;
        let targetLng = selectedCountry.clickLng || 0;
        let altitude = 0.5; // default zoom level

        // Calculate centroid of the country for a perfect cinematic center
        const feature = countries.features?.find(f => f.properties.ADMIN === selectedCountry.ADMIN);
        if (feature && feature.geometry) {
           const geom = feature.geometry;
           let pts = [];
           if (geom.type === 'Polygon') pts = geom.coordinates[0];
           else if (geom.type === 'MultiPolygon') {
             let largest = geom.coordinates[0][0];
             geom.coordinates.forEach(poly => { if (poly[0].length > largest.length) largest = poly[0]; });
             pts = largest;
           }
           if (pts.length > 0) {
             let minLng = 180, maxLng = -180, minLat = 90, maxLat = -90;
             let sumLng = 0, sumLat = 0;
             pts.forEach(p => { 
                sumLng += p[0]; sumLat += p[1]; 
                if (p[0] < minLng) minLng = p[0];
                if (p[0] > maxLng) maxLng = p[0];
                if (p[1] < minLat) minLat = p[1];
                if (p[1] > maxLat) maxLat = p[1];
             });
             targetLat = sumLat / pts.length;
             targetLng = sumLng / pts.length;
             
             // Dynamic altitude based on country size!
             // Large countries (Russia/USA) will zoom out, small countries (Romania/Moldova) will zoom in closely
             const maxDimension = Math.max(maxLng - minLng, maxLat - minLat);
             altitude = Math.max(0.15, Math.min(1.8, maxDimension * 0.012 + 0.1));
           }
        }

        // Smooth cinematic pan (1500ms) with d3-like easing handled by the library
        globeEl.current.pointOfView({ lat: targetLat, lng: targetLng, altitude }, 1500);
        globeEl.current.controls().autoRotate = false;
      }
    }
  }, [selectedCountry, countries]);

  useEffect(() => {
    if (globeEl.current) {
      if (isUfoPanelOpen && worldBoss && worldBoss.active) {
        globeEl.current.controls().autoRotate = false;
        globeEl.current.pointOfView({ lat: worldBoss.lat, lng: worldBoss.lng, altitude: 1.0 }, 1000);
      } else if (!selectedCountry && !isUfoPanelOpen) {
        globeEl.current.controls().autoRotate = true;
      }
    }
  }, [isUfoPanelOpen, worldBoss, selectedCountry]);

  return (
    <div className="absolute inset-0 pointer-events-auto">
      <Globe
        ref={globeEl}
        globeImageUrl={null}
        animateIn={false}
        backgroundColor="rgba(0,0,0,0)"
        rendererConfig={{ antialias: false, powerPreference: "high-performance", alpha: true }}
        onGlobeReady={() => {
           if (globeEl.current) {
              const material = globeEl.current.globeMaterial();
              material.color = new THREE.Color(0x061122); // HD Deep ocean vector color
              material.roughness = 0.5;
              material.metalness = 0.1;
           }
        }}
        
        // Polygons (Countries)
        polygonsData={countries.features}
        polygonAltitude={({ properties: d }) => d === hoverD ? 0.04 : (isMobile ? 0.02 : 0.01)}
        polygonCapColor={({ properties: d }) => {
          if (d === hoverD) return 'rgba(0, 243, 255, 0.4)';
          return 'rgba(10, 25, 15, 0.9)'; // Solid HD landmass color
        }}
        polygonCapMaterial={({ properties: d }) => {
          const countryName = d.ADMIN;
          const countryPixels = purchasedPixels.filter(p => p.country === countryName);
          const isConquered = conqueredCountries && conqueredCountries[countryName];
          
          let targetIso = null;

          if (isConquered) {
             // Show the CONQUEROR's flag on the occupied territory
             const conquerorName = conqueredCountries[countryName];
             targetIso = getIsoByName(conquerorName);
          } else if (countryPixels.length > 0) {
             // Show the country's own flag
             targetIso = getIsoByName(countryName);
          }

          if (targetIso) {
              if (materialCache[targetIso]) {
                  animatedMaterials.current[d.ADMIN] = materialCache[targetIso];
                  return materialCache[targetIso];
              }
              const texture = new THREE.TextureLoader().load(`https://flagcdn.com/w320/${targetIso}.png`);
              texture.center.set(0.5, 0.5);
              // Squish vertically to fix vertical stretching caused by bounding boxes
              texture.repeat.set(1, 1.4);
              texture.wrapS = THREE.ClampToEdgeWrapping;
              texture.wrapT = THREE.ClampToEdgeWrapping;
              texture.colorSpace = THREE.SRGBColorSpace;
              
              const mat = new THREE.MeshBasicMaterial({ 
                map: texture, 
                color: '#ffffff',
                transparent: true,
                opacity: 0.95 // slightly more opaque to pop colors
              });
              materialCache[targetIso] = mat;
              animatedMaterials.current[d.ADMIN] = mat;
              return mat;
          }
          
          // No material override - use polygonCapColor
          if (animatedMaterials.current[d.ADMIN]) delete animatedMaterials.current[d.ADMIN];
          return undefined;
        }}
        polygonSideColor={({ properties: d }) => {
          if (isMobile) return undefined; // Completely disable 3D extrusion walls on mobile to stop flickering
          if (conqueredCountries && conqueredCountries[d.ADMIN]) return 'rgba(255, 0, 0, 0.3)';
          return 'rgba(0, 243, 255, 0.15)';
        }}
        polygonStrokeColor={({ properties: d }) => {
          if (conqueredCountries && conqueredCountries[d.ADMIN]) return isMobile ? 'rgba(150, 0, 0, 0.4)' : '#ff0000';
          return isMobile ? 'rgba(0, 168, 181, 0.3)' : '#00f3ff'; // Softer, dimmer border on mobile to prevent eye strain/flickering
        }}
        polygonLabel={({ properties: d }) => {
          if (window.isHoveringAlliance) return '';
          const iso = getIsoByName(d.ADMIN);
          const flagHtml = iso ? `<img src="https://flagcdn.com/w20/${iso}.png" style="width: 20px; height: auto; max-height: 14px; border-radius: 2px; vertical-align: middle; margin-right: 4px; box-shadow: 0 0 3px rgba(255,255,255,0.3);" />` : '🌍 ';
          
          let conquerorLabel = '';
          if (conqueredCountries && conqueredCountries[d.ADMIN]) {
            conquerorLabel = `<br/><span style="color: red;">⚔️ Ocupat de: ${conqueredCountries[d.ADMIN]}</span>`;
          }
          return `
            <div style="background: rgba(0, 0, 0, 0.8); padding: 5px 10px; border-radius: 4px; border: 1px solid #bc13fe; font-family: sans-serif; font-size: 14px; display: flex; align-items: center; white-space: nowrap;">
              ${flagHtml} <b style="color: white; vertical-align: middle;">${d.ADMIN}</b>${conquerorLabel}
            </div>
          `;
        }}
        onPolygonHover={isMobile ? undefined : setHoverD}
        onPolygonClick={({ properties: d }, event, { lat, lng, altitude }) => {
          onCountryClick({ ...d, clickLat: lat, clickLng: lng });
        }}

        // Shockwaves (Active Battle Zones)
        ringsData={rings}
        ringColor="color"
        ringMaxRadius="maxR"
        ringPropagationSpeed="propagationSpeed"
        ringRepeatPeriod="repeatPeriod"

        // Lasers (Attack Arcs)
        arcsData={arcs}
        arcStartLat={d => d.startLat}
        arcStartLng={d => d.startLng}
        arcEndLat={d => d.endLat}
        arcEndLng={d => d.endLng}
        arcColor={d => d.color}
        arcDashLength={0.6}
        arcDashGap={0.2}
        arcDashInitialGap={() => Math.random()}
        arcDashAnimateTime={1500}
        arcAltitudeAutoScale={0.4}
        arcStroke={3.0}

        // Animated Pixels and UFO
        customLayerData={[
          ...playerCountryGroups.map(g => ({...g, isPixel: true})), 
          ...(worldBoss && worldBoss.active ? [{...worldBoss, isUFO: true}] : [])
        ]}
        customLayerLabel={(d) => {
           if (d.isUFO) return 'World Boss';
           // Read locally saved profile picture if available
           const savedPic = localStorage.getItem(`hexglobe_profile_${d.name}`);
           const imgHtml = savedPic ? `<img src="${savedPic}" style="width: 44px; height: 44px; border-radius: 50%; object-fit: cover; border: 2px solid #00f3ff; margin: 0 auto 6px; box-shadow: 0 0 10px rgba(0,243,255,0.5);" />` : `<div style="width: 44px; height: 44px; border-radius: 50%; background: #00f3ff; color: #000; font-weight: bold; font-size: 20px; line-height: 44px; margin: 0 auto 6px; box-shadow: 0 0 10px rgba(0,243,255,0.5);">${d.name.charAt(0).toUpperCase()}</div>`;
           
           return `
             <div style="background: rgba(5, 5, 10, 0.95); border: 1px solid #bc13fe; padding: 12px; border-radius: 12px; text-align: center; font-family: sans-serif; pointer-events: none; min-width: 140px; backdrop-filter: blur(4px); box-shadow: 0 10px 25px rgba(0,0,0,0.8);">
               ${imgHtml}
               <div style="font-weight: 900; color: #fff; margin-bottom: 2px; font-size: 14px;">${d.name}</div>
               <div style="font-size: 11px; color: #bc13fe; font-weight: 900; margin-bottom: 6px; letter-spacing: 1px;">${d.totalPixels} PIXELI</div>
               <div style="font-size: 10px; color: #00f3ff; font-weight: 700; opacity: 0.8;">🌐 ${d.name.replace(/\s+/g, '').toLowerCase()}.md</div>
             </div>
           `;
        }}
        customThreeObject={createCustomObject}
        customThreeObjectUpdate={(obj, d) => {
          if (!obj.__innerGroup) return;
          if (d.isUFO) {
            obj.__innerGroup.rotation.y += 0.02;
          } else if (!obj.__isSprite) {
            obj.__innerGroup.rotation.y += 0.01;
          }
        }}
        onCustomLayerHover={(obj) => {
          setHoveredPixel(obj && !obj.__data.isUFO ? obj.__data : null);
        }}
        onCustomLayerClick={(obj, event, { lat, lng }) => {
          if (obj.__data.isUFO) {
            if (onUfoClick) onUfoClick();
          } else {
            onPixelClick(obj.__data);
          }
          if(globeEl.current) {
            globeEl.current.pointOfView({ lat, lng, altitude: 0.8 }, 1000);
          }
        }}
        
        // Labels & Tooltips (HTML Elements)
        htmlElementsData={htmlElements}
        htmlElement={d => {
          const el = document.createElement('div');
          if (['logo', 'alliance-crest', 'ufo'].includes(d.type)) {
             el.style.pointerEvents = 'auto';
             el.style.cursor = 'pointer';
          }
          
          if (d.type === 'counter') {
            const flagHtml = d.iso ? `<img src="https://flagcdn.com/w20/${d.iso}.png" style="width: 20px; height: auto; max-height: 14px; border-radius: 2px; vertical-align: middle; box-shadow: 0 0 3px rgba(255,255,255,0.3);" />` : '🌍';
            el.innerHTML = `
              <div style="display: flex; flex-direction: column; align-items: center; pointer-events: none; transform: translate(-50%, -150%);">
                <div style="background: rgba(0,0,0,0.8); border: 1px solid #bc13fe; box-shadow: 0 0 10px rgba(188,19,254,0.5); padding: 4px 8px; border-radius: 6px; color: white; font-family: sans-serif; font-size: 11px; font-weight: bold; white-space: nowrap; display: flex; align-items: center; gap: 4px;">
                  ${flagHtml} ${d.count} <span style="color: gray;">Patrioți</span>
                </div>
                <div style="width: 1px; height: 15px; background: rgba(188,19,254,0.5); margin-top: 2px;"></div>
              </div>
            `;
          } else if (d.type === 'tooltip') {
            el.innerHTML = `
              <div style="background: rgba(20,20,35,0.9); border: 1px solid #bc13fe; border-radius: 8px; padding: 4px 10px; color: white; font-family: sans-serif; font-size: 13px; font-weight: bold; pointer-events: none; white-space: nowrap; box-shadow: 0 0 15px rgba(188,19,254,0.5); transform: translate(-50%, -100%); display: flex; flex-direction: column; align-items: center; gap: 2px;">
                <span>👤 ${d.name || 'Jucător'}</span>
                ${d.website ? `<span style="font-size: 10px; color: #00f3ff;">🌐 ${d.website.substring(0,20)}${d.website.length > 20 ? '...' : ''}</span>` : ''}
              </div>
            `;
          } else if (d.type === 'alliance-crest') {
            let alliancePic = null;
            try {
               alliancePic = localStorage.getItem(`hexglobe_alliance_${d.name}`);
            } catch(e) {}
            
            el.innerHTML = `
              <div class="alliance-crest-marker" style="pointer-events: auto; transform: translate(-50%, -50%); display: flex; flex-direction: column; align-items: center; animation: floatCrest 4s ease-in-out infinite; transition: opacity 0.3s ease;">
                 <style>
                    @keyframes floatCrest {
                       0%, 100% { transform: translate(-50%, -50%) translateY(0); }
                       50% { transform: translate(-50%, -50%) translateY(-5px); }
                    }
                    @keyframes pulseGlow {
                       0%, 100% { box-shadow: 0 0 10px ${d.color}80, inset 0 0 5px ${d.color}80; }
                       50% { box-shadow: 0 0 20px ${d.color}, inset 0 0 10px ${d.color}; }
                    }
                 </style>
                 <div style="font-size: 7px; font-weight: 900; color: white; text-shadow: 0 0 5px ${d.color}, 0 0 10px ${d.color}; margin-bottom: 2px; text-transform: uppercase; letter-spacing: 1px; background: rgba(0,0,0,0.7); padding: 2px 4px; border-radius: 6px; border: 1px solid ${d.color}40; white-space: nowrap; position: relative;">
                    ${d.allianceData && d.allianceData.conqueror ? `<div style="position: absolute; top: -15px; right: -15px; font-size: 10px; background: red; padding: 2px; border-radius: 4px; border: 1px solid white; display: flex; gap: 2px; align-items: center; box-shadow: 0 0 10px red;">⚠️ <img src="https://flagcdn.com/w20/${d.allianceData.conquerorFlag || 'ro'}.png" style="width: 12px; height: 8px;" /></div>` : ''}
                    ${d.name}
                 </div>
                 <div style="width: ${alliancePic ? '35px' : '25px'}; height: 35px; background: linear-gradient(135deg, rgba(0,0,0,0.9), rgba(20,20,20,0.9)); border: 1.5px solid ${d.allianceData && d.allianceData.conqueror ? 'red' : d.color}; border-radius: 4px 4px 12px 12px; display: flex; align-items: center; justify-content: center; font-size: 14px; animation: pulseGlow 3s infinite; position: relative; overflow: hidden;">
                    <div style="position: absolute; inset: 0; background: linear-gradient(to bottom right, rgba(255,255,255,0.2), transparent); z-index: 5;"></div>
                    ${alliancePic ? 
                      `<img src="${alliancePic}" style="width: 100%; height: 100%; object-fit: cover; position: relative; z-index: 10;" />` : 
                      `<span style="filter: drop-shadow(0 0 5px ${d.allianceData && d.allianceData.conqueror ? 'red' : d.color}); position: relative; z-index: 10;">${d.crest}</span>`
                    }
                 </div>
              </div>
            `;
            let dragStartX = 0;
            let dragStartY = 0;
            el.onmouseenter = () => { window.isHoveringAlliance = true; };
            el.onmouseleave = () => { window.isHoveringAlliance = false; };
            el.ontouchstart = (e) => {
               window.isHoveringAlliance = true;
               dragStartX = e.touches[0].clientX;
               dragStartY = e.touches[0].clientY;
            };
            el.onclick = (e) => {
               e.stopPropagation();
               window.dispatchEvent(new CustomEvent('mapAllianceClick', {
                  detail: d.allianceData
               }));
            };
            el.ontouchend = (e) => {
               window.isHoveringAlliance = false;
               e.stopPropagation();
               const dx = Math.abs(e.changedTouches[0].clientX - dragStartX);
               const dy = Math.abs(e.changedTouches[0].clientY - dragStartY);
               if (dx < 10 && dy < 10) {
                 window.dispatchEvent(new CustomEvent('mapAllianceClick', {
                    detail: d.allianceData
                 }));
               }
            };
          } else if (d.type === 'ufo-hp') {
              el.innerHTML = `
                <div class="ufo-hp-bar" style="cursor: pointer; pointer-events: none; background: linear-gradient(135deg, rgba(20,0,0,0.95), rgba(50,0,0,0.85)); border: 1px solid rgba(255,0,68,0.5); border-top: 3px solid #ff0044; box-shadow: 0 10px 30px -5px rgba(255,0,0,0.5), inset 0 0 20px rgba(255,0,0,0.2); padding: 12px 20px; border-radius: 6px; color: white; font-family: 'Inter', sans-serif; white-space: nowrap; transform: translate(-50%, -100%); display: flex; flex-direction: column; align-items: center; transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); backdrop-filter: blur(10px);">
                  <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 8px; pointer-events: none;">
                     <span style="display: inline-block; width: 8px; height: 8px; background: #ff0044; border-radius: 50%; box-shadow: 0 0 10px #ff0044; animation: pulse 1s infinite;"></span>
                     <span style="color: #fff; font-size: 13px; font-weight: 900; text-transform: uppercase; letter-spacing: 2px; text-shadow: 0 0 10px rgba(255,0,0,0.8);">TARGET LOCK: ${d.country.toUpperCase()}</span>
                  </div>
                  <div style="position: relative; width: 180px; height: 12px; background: rgba(0,0,0,0.8); border-radius: 2px; overflow: hidden; border: 1px solid rgba(255,0,68,0.4); pointer-events: none; box-shadow: inset 0 0 10px rgba(0,0,0,0.8);">
                     <div style="position: absolute; left: 0; top: 0; width: ${(d.hp / d.maxHp) * 100}%; height: 100%; background: linear-gradient(90deg, #aa0000, #ff0044); box-shadow: 0 0 15px #ff0044; transition: width 0.3s ease;"></div>
                  </div>
                  <div style="font-size: 10px; margin-top: 6px; font-weight: 700; color: #ff8888; letter-spacing: 1px; pointer-events: none;">▶ CLICK TO ENGAGE (${d.hp.toLocaleString()} / ${d.maxHp.toLocaleString()} HP)</div>
                  <div style="position: absolute; bottom: -7px; left: 50%; transform: translateX(-50%); width: 0; height: 0; border-left: 7px solid transparent; border-right: 7px solid transparent; border-top: 7px solid #ff0044;"></div>
                </div>
              `;
            } else if (d.type === 'logo') {
            let logoUrl = null;
            let currentPx = 100;
            let targetPx = 100;
            try {
              // Check for global profile picture first
              const profilePic = localStorage.getItem(`hexglobe_profile_${d.name}`);
              if (profilePic) {
                 logoUrl = profilePic;
              }
              
              // Still load pixel data from the country-specific logo (or fallback image if no profile pic)
              const raw = localStorage.getItem(`hexglobe_logo_${d.country}_${d.name}`);
              if (raw) {
                const parsed = JSON.parse(raw);
                if (!logoUrl && parsed.imageBase64) logoUrl = parsed.imageBase64;
                currentPx = parsed.currentPixels || 0;
                targetPx = parsed.targetPixels || 1;
              }
            } catch(e) {}

            const isComplete = currentPx >= targetPx;
            const progress = Math.min(100, Math.round((currentPx / targetPx) * 100));
            
            let finalBorderCol = isComplete ? '#00f3ff' : 'rgba(255,255,255,0.3)';
            let finalShadow = isComplete ? 'box-shadow: 0 0 10px rgba(0,243,255,0.5);' : 'box-shadow: 0 2px 5px rgba(0,0,0,0.5);';
            let iconHtml = '';
            let extraStyles = '';
            // Dynamic size scaling based on total pixels invested
            // Base size is 32px, grows progressively up to a max of 90px so they stand out but don't cover others
            let size = Math.min(90, 32 + (d.totalPixels * 0.05)); 
            
            const isEmperor = emperors && d.country && emperors[d.country] === d.name;
            
            if (isEmperor) {
               finalBorderCol = '#fbbf24'; // Massive Emperor Gold
               finalShadow = 'box-shadow: 0 0 30px rgba(251, 191, 36, 1), inset 0 0 15px rgba(251, 191, 36, 0.8);';
               iconHtml = '<div style="position: absolute; top: -25px; left: 50%; transform: translateX(-50%); font-size: 28px; filter: drop-shadow(0 0 10px #fbbf24) drop-shadow(0 0 20px #f59e0b); z-index: 200; pointer-events: none; animation: pulse 2s infinite;">👑</div>';
               extraStyles = 'z-index: 150;';
            } else if (d.totalPixels >= 1000) {
               finalBorderCol = '#eab308'; // President (Gold)
               finalShadow = 'box-shadow: 0 0 20px rgba(234,179,8,0.8), inset 0 0 10px rgba(234,179,8,0.5);';
               iconHtml = '<div style="position: absolute; top: -12px; right: -10px; font-size: 16px; filter: drop-shadow(0 0 5px #eab308); z-index: 10; pointer-events: none;">🎩</div>';
               extraStyles = 'z-index: 100;';
            } else if (d.totalPixels >= 500) {
               finalBorderCol = '#a855f7'; // Guvernator (Purple)
               finalShadow = 'box-shadow: 0 0 15px rgba(168,85,247,0.7);';
               iconHtml = '<div style="position: absolute; top: -10px; right: -8px; font-size: 14px; filter: drop-shadow(0 0 3px #a855f7); z-index: 10; pointer-events: none;">🏛️</div>';
               extraStyles = 'z-index: 90;';
            } else if (d.totalPixels >= 100) {
               finalBorderCol = '#ef4444'; // General/VIP (Red)
               finalShadow = 'box-shadow: 0 0 12px rgba(239,68,68,0.6);';
               iconHtml = '<div style="position: absolute; top: -8px; right: -6px; font-size: 12px; filter: drop-shadow(0 0 2px #ef4444); z-index: 10; pointer-events: none;">⭐</div>';
               extraStyles = 'z-index: 80;';
            }

            if (logoUrl) {
              el.innerHTML = `
                 <div title="${d.name}" style="cursor: pointer; width: ${size}px; height: ${size}px; border: 2px solid ${finalBorderCol}; border-radius: 6px; overflow: visible; ${finalShadow} transform: translate(-50%, -50%); pointer-events: auto; position: relative; background: black; transition: all 0.2s; ${extraStyles}">
                    <img src="${logoUrl}" style="width: 100%; height: 100%; object-fit: contain; pointer-events: none; border-radius: 4px;" />
                    ${iconHtml}
                    ${!isComplete ? `<div style="position: absolute; bottom: 0; left: 0; height: 2px; background: #00f3ff; width: ${progress}%; pointer-events: none;"></div>` : ''}
                 </div>
              `;
            } else {
              const getInitials = (name) => name.split(/[\\s_]+/).slice(0, 2).map(w => w[0]?.toUpperCase() || '').join('');
              let hash = 0;
              for (let i = 0; i < d.name.length; i++) hash = d.name.charCodeAt(i) + ((hash << 5) - hash);
              const h1 = Math.abs(hash) % 360;
              const h2 = Math.abs(hash * 2) % 360;
              const grad = `linear-gradient(135deg, hsl(${h1}, 80%, 55%), hsl(${h2}, 80%, 55%))`;
              
              el.innerHTML = `
                 <div title="${d.name}" style="cursor: pointer; width: ${size}px; height: ${size}px; border: 2px solid ${finalBorderCol}; border-radius: 6px; ${finalShadow} background: ${grad}; display: flex; align-items: center; justify-content: center; color: white; font-family: Inter, sans-serif; font-size: ${size/2.5}px; font-weight: 900; transform: translate(-50%, -50%); pointer-events: auto; position: relative; overflow: visible; transition: all 0.2s; ${extraStyles}">
                    <span style="pointer-events: none;">${getInitials(d.name)}</span>
                    ${iconHtml}
                    ${!isComplete && logoUrl === null ? `<div style="position: absolute; bottom: 0; left: 0; height: 2px; background: #00f3ff; width: ${progress}%; pointer-events: none;"></div>` : ''}
                 </div>
              `;
            }

            let dragStartX = 0;
            let dragStartY = 0;
            el.ontouchstart = (e) => {
               dragStartX = e.touches[0].clientX;
               dragStartY = e.touches[0].clientY;
            };
            el.onclick = (e) => {
               e.stopPropagation();
               if (onPixelClick) onPixelClick(d);
            };
            el.ontouchend = (e) => {
               e.stopPropagation();
               const dx = Math.abs(e.changedTouches[0].clientX - dragStartX);
               const dy = Math.abs(e.changedTouches[0].clientY - dragStartY);
               if (dx < 10 && dy < 10) {
                 if (onPixelClick) onPixelClick(d);
               }
            };
          }
          return el;
        }}
        htmlAltitude={d => {
          if (d.type === 'logo') return 0.01;
          if (d.type === 'alliance-crest') return 0.02; // Low on the surface
          return 0.12;
        }}

        // Atmosphere
        atmosphereColor="#00f3ff"
        atmosphereAltitude={0.15}
      />
    </div>
  );
}
