import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAccounts } from '../context/AccountContext';
import {
  SUNFIRE_CASTLE,
  CASTLE_TURRETS,
  RUINS_ALERT_ZONE,
  FERTILE_LAND_ZONE,
  TUNDRA_ZONE,
  FIXED_STRONGHOLDS,
  FIXED_FORTRESSES,
  getObjectiveRestrictedZone
} from '../data/mapLayoutData';

// Footprints:
// - HQ: 3x3 (territory 15x15 centered)
// - Banner: 1x1 (territory 7x7 centered)
// - Bear Trap: 3x3
// - City: 2x2 with player label
// - Node: 2x2 with resource type (Meat, Wood, Coal, Iron)
// - Statue: 2x2 generic statue
// - Fortress: 4x4 (Fixed World Objective)
// - Stronghold: 4x4 (Fixed World Objective)
// - Castle: 6x6 (Center Objective)

const RESOURCE_TYPES = ['Meat', 'Wood', 'Coal', 'Iron'];

const RESOURCE_COLORS = {
  Meat: '#f87171',
  Wood: '#4ade80',
  Coal: '#94a3b8',
  Iron: '#fbbf24'
};

const ALLIANCE_COLORS = [
  { id: 'gold',   name: 'Gold (Main)',  border: '#fde047', bg: '#ca8a04', terrBg: 'rgba(234, 179, 8, 0.15)', terrBorder: 'rgba(234, 179, 8, 0.6)' },
  { id: 'blue',   name: 'Blue (Wing)',  border: '#60a5fa', bg: '#1d4ed8', terrBg: 'rgba(59, 130, 246, 0.15)', terrBorder: 'rgba(59, 130, 246, 0.6)' },
  { id: 'red',    name: 'Red (Enemy)',  border: '#f87171', bg: '#b91c1c', terrBg: 'rgba(239, 68, 68, 0.15)',  terrBorder: 'rgba(239, 68, 68, 0.6)' },
  { id: 'purple', name: 'Purple (NAP)', border: '#c084fc', bg: '#7e22ce', terrBg: 'rgba(168, 85, 247, 0.15)', terrBorder: 'rgba(168, 85, 247, 0.6)' },
  { id: 'green',  name: 'Green (Ally)', border: '#4ade80', bg: '#15803d', terrBg: 'rgba(34, 197, 94, 0.15)',  terrBorder: 'rgba(34, 197, 94, 0.6)' },
  { id: 'orange', name: 'Orange',       border: '#fb923c', bg: '#c2410c', terrBg: 'rgba(249, 115, 22, 0.15)', terrBorder: 'rgba(249, 115, 22, 0.6)' },
  { id: 'gray',   name: 'Neutral/Gray', border: '#cbd5e1', bg: '#475569', terrBg: 'rgba(148, 163, 184, 0.12)', terrBorder: 'rgba(148, 163, 184, 0.5)' }
];

const DEFAULT_PLAN = {
  name: 'Main Hive Plan',
  stateNumber: '',
  allianceTag: '',
  originX: 550,   // reference bottom-left X
  originY: 550,   // reference bottom-left Y
  entities: []
};

// URL Compression helper using Base64 UTF-8
const encodePlanToHash = (plan) => {
  try {
    const json = JSON.stringify(plan);
    const bytes = new TextEncoder().encode(json);
    let binary = '';
    for (let i = 0; i < bytes.length; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
  } catch (e) {
    console.error('Failed to encode plan', e);
    return '';
  }
};

const decodePlanFromHash = (hash) => {
  try {
    const binary = atob(hash);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
    const json = new TextDecoder().decode(bytes);
    return JSON.parse(json);
  } catch (e) {
    console.error('Failed to decode plan', e);
    return null;
  }
};

// AABB collision detection to prevent overlapping structures
const isOverlapping = (x1, y1, w1, h1, x2, y2, w2, h2) => {
  return !(
    x1 + w1 <= x2 ||
    x2 + w2 <= x1 ||
    y1 + h1 <= y2 ||
    y2 + h2 <= y1
  );
};

export default function TerritoryPlanner() {
  const { accounts, activeAccountId, updateAccountState } = useAccounts();
  const [searchParams] = useSearchParams();

  // Load from direct localStorage or active account or fallback to default
  const [plan, setPlan] = useState(() => {
    try {
      const direct = localStorage.getItem('wosCalc_activeTerritoryPlan');
      if (direct) return JSON.parse(direct);
    } catch (e) {
      console.error(e);
    }
    const activeAcc = accounts.find(a => a.id === activeAccountId);
    return activeAcc?.state?.territoryPlanner || DEFAULT_PLAN;
  });
  const [activeTool, setActiveTool] = useState('select'); // select, trap, hq, banner, city, node, statue, eraser
  const [selectedEntityId, setSelectedEntityId] = useState(null);
  const [overlapWarning, setOverlapWarning] = useState(null);
  
  // Placement tool configs
  const [newCityName, setNewCityName] = useState('');
  const [newStatueName, setNewStatueName] = useState('');
  const [newFacilityName, setNewFacilityName] = useState('Facility');
  const [newTrapName, setNewTrapName] = useState('Bear Trap 1');
  const [selectedHqType, setSelectedHqType] = useState('Icefield'); // 'Icefield' or 'Tundra'
  const [selectedResourceType, setSelectedResourceType] = useState('Meat');
  const [selectedAllianceColor, setSelectedAllianceColor] = useState('gold');
  const [bannerAllianceTag, setBannerAllianceTag] = useState('');
  const [autoIncrementCity, setAutoIncrementCity] = useState(true);
  const [cityCounter, setCityCounter] = useState(1);

  // Map Layer Toggles
  const [showBoundaries, setShowBoundaries] = useState(true);
  const [showObjectives, setShowObjectives] = useState(true);

  // iPad & screen space collapsible panels
  const [showLeftTools, setShowLeftTools] = useState(true);
  const [showRoster, setShowRoster] = useState(false);

  // Canvas Viewport: pan & zoom
  const [zoom, setZoom] = useState(24); // pixels per tile
  const [pan, setPan] = useState({ x: 250, y: 250 });
  const [isPanning, setIsPanning] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [hoveredTile, setHoveredTile] = useState(null);

  // Rename modal for cities or any entity
  const [renameModalEntity, setRenameModalEntity] = useState(null);
  const [renameInputValue, setRenameInputValue] = useState('');

  // Coordinate Search Inputs
  const [searchCoordX, setSearchCoordX] = useState('');
  const [searchCoordY, setSearchCoordY] = useState('');

  // Link import toast/prompt
  const [importedPlan, setImportedPlan] = useState(null);
  const [shareSuccess, setShareSuccess] = useState(false);
  const isSidebarCollapsed = localStorage.getItem('wosCalc_sidebarCollapsed') === 'true';

  const canvasRef = useRef(null);
  const containerRef = useRef(null);

  // Pinch-to-zoom tracking on touch devices
  const touchStateRef = useRef({ lastDist: 0, isPinching: false });

  // Handle URL share param (?plan=...)
  useEffect(() => {
    const planParam = searchParams.get('plan');
    if (planParam) {
      const decoded = decodePlanFromHash(planParam);
      if (decoded && decoded.entities) {
        setImportedPlan(decoded);
        setPlan(decoded);
        // Clear the ?plan= from the browser URL without refreshing so subsequent reloads don't re-import
        window.history.replaceState({}, document.title, window.location.pathname);
      }
    }
  }, [searchParams]);

  // Sync to account state and direct localStorage when plan changes
  useEffect(() => {
    if (!plan) return;
    try {
      localStorage.setItem('wosCalc_activeTerritoryPlan', JSON.stringify(plan));
    } catch (e) {
      console.error(e);
    }
    updateAccountState('territoryPlanner', plan);
  }, [plan, updateAccountState]);

  // Keep city counter up to date
  useEffect(() => {
    const cities = plan.entities.filter(e => e.type === 'city');
    if (cities.length >= cityCounter) {
      setCityCounter(cities.length + 1);
    }
  }, [plan.entities.length]);

  // Find bear trap(s) and HQ for quick reference & distance calculations
  const bearTraps = useMemo(() => {
    return plan.entities.filter(e => e.type === 'trap');
  }, [plan.entities]);
  const bearTrap = bearTraps[0] || null;

  const allianceHQs = useMemo(() => {
    return plan.entities.filter(e => e.type === 'hq');
  }, [plan.entities]);

  // Fixed world structures (Castle, Turrets, Strongholds, Fortresses)
  const fixedWorldObjects = useMemo(() => {
    return [
      SUNFIRE_CASTLE,
      ...CASTLE_TURRETS,
      ...FIXED_STRONGHOLDS,
      ...FIXED_FORTRESSES
    ];
  }, []);

  // Convert screen client coords to grid tile coords
  const screenToTile = useCallback((screenX, screenY) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const relX = screenX - rect.left - pan.x;
    const relY = screenY - rect.top - pan.y;

    const tileX = Math.floor(relX / zoom) + plan.originX;
    const tileY = Math.floor(-relY / zoom) + plan.originY;

    return { x: tileX, y: tileY };
  }, [zoom, pan, plan.originX, plan.originY]);

  // Convert tile coords to screen coords (bottom-left of tile)
  const tileToScreen = useCallback((tileX, tileY) => {
    const relX = (tileX - plan.originX) * zoom;
    const relY = -(tileY - plan.originY) * zoom;
    return {
      x: relX + pan.x,
      y: relY + pan.y
    };
  }, [zoom, pan, plan.originX, plan.originY]);

  // Non-passive wheel & touch event listeners to prevent iOS/iPad Safari/PWA browser page zoom
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Trackpad pinch gesture support (Chrome/Safari map trackpad pinches to WheelEvent with ctrlKey = true)
    const onWheelHandler = (e) => {
      // Always prevent browser page-level zoom
      e.preventDefault();

      let zoomFactor;
      if (e.ctrlKey) {
        // Pinching on trackpad: smooth fine-grained control
        zoomFactor = e.deltaY < 0 ? 1.025 : 0.975;
      } else {
        // Normal 2-finger scroll or mousewheel: gentle steps
        zoomFactor = e.deltaY < 0 ? 1.08 : 0.92;
      }
      setZoom(prevZoom => {
        const newZoom = Math.min(60, Math.max(6, prevZoom * zoomFactor));
        const rect = canvas.getBoundingClientRect();
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;

        setPan(prevPan => ({
          x: mouseX - (mouseX - prevPan.x) * (newZoom / prevZoom),
          y: mouseY - (mouseY - prevPan.y) * (newZoom / prevZoom)
        }));

        return newZoom;
      });
    };

    // Native touch listeners for iPad/iOS PWA with passive: false to prevent Safari gesture zoom
    const onTouchStartHandler = (e) => {
      if (e.touches.length === 2) {
        e.preventDefault();
        const touch1 = e.touches[0];
        const touch2 = e.touches[1];
        const dist = Math.hypot(touch1.clientX - touch2.clientX, touch1.clientY - touch2.clientY);
        const midX = (touch1.clientX + touch2.clientX) / 2;
        const midY = (touch1.clientY + touch2.clientY) / 2;
        touchStateRef.current = { lastDist: dist, isPinching: true, midX, midY };
      } else if (e.touches.length === 1) {
        const touch = e.touches[0];
        setIsPanning(true);
        setDragStart({ x: touch.clientX - pan.x, y: touch.clientY - pan.y });
        const tile = screenToTile(touch.clientX, touch.clientY);
        setHoveredTile(tile);
      }
    };

    const onTouchMoveHandler = (e) => {
      if (e.touches.length === 2 && touchStateRef.current.isPinching) {
        e.preventDefault();
        const touch1 = e.touches[0];
        const touch2 = e.touches[1];
        const dist = Math.hypot(touch1.clientX - touch2.clientX, touch1.clientY - touch2.clientY);
        if (touchStateRef.current.lastDist > 0) {
          const ratio = dist / touchStateRef.current.lastDist;
          // Dampen pinch ratio slightly for smooth iPad control
          const dampenedRatio = 1 + (ratio - 1) * 0.7;

          setZoom(prevZoom => {
            const newZoom = Math.min(60, Math.max(6, prevZoom * dampenedRatio));
            const rect = canvas.getBoundingClientRect();
            const midX = (touchStateRef.current.midX || (rect.left + rect.width / 2)) - rect.left;
            const midY = (touchStateRef.current.midY || (rect.top + rect.height / 2)) - rect.top;

            setPan(prevPan => ({
              x: midX - (midX - prevPan.x) * (newZoom / prevZoom),
              y: midY - (midY - prevPan.y) * (newZoom / prevZoom)
            }));

            return newZoom;
          });
        }
        touchStateRef.current.lastDist = dist;
      } else if (e.touches.length === 1 && isPanning) {
        e.preventDefault();
        const touch = e.touches[0];
        setPan({
          x: touch.clientX - dragStart.x,
          y: touch.clientY - dragStart.y
        });
        const tile = screenToTile(touch.clientX, touch.clientY);
        setHoveredTile(tile);
      }
    };

    const onTouchEndHandler = () => {
      touchStateRef.current.isPinching = false;
      setIsPanning(false);
    };

    // Safari iOS gesture prevention
    const onGestureStart = (e) => e.preventDefault();
    const onGestureChange = (e) => e.preventDefault();

    canvas.addEventListener('wheel', onWheelHandler, { passive: false });
    canvas.addEventListener('touchstart', onTouchStartHandler, { passive: false });
    canvas.addEventListener('touchmove', onTouchMoveHandler, { passive: false });
    canvas.addEventListener('touchend', onTouchEndHandler, { passive: false });
    canvas.addEventListener('gesturestart', onGestureStart, { passive: false });
    canvas.addEventListener('gesturechange', onGestureChange, { passive: false });

    return () => {
      canvas.removeEventListener('wheel', onWheelHandler);
      canvas.removeEventListener('touchstart', onTouchStartHandler);
      canvas.removeEventListener('touchmove', onTouchMoveHandler);
      canvas.removeEventListener('touchend', onTouchEndHandler);
      canvas.removeEventListener('gesturestart', onGestureStart);
      canvas.removeEventListener('gesturechange', onGestureChange);
    };
  }, [pan, isPanning, dragStart, screenToTile]);

  // Track container dimensions to trigger immediate canvas re-draw on resize/panel collapse
  const [containerSize, setContainerSize] = useState({ width: 0, height: 0 });

  // Handle ResizeObserver to keep canvas sharp and filling 100% of container
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const ro = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect;
        if (width > 0 && height > 0) {
          setContainerSize({ width: Math.round(width), height: Math.round(height) });
        }
      }
    });
    ro.observe(container);
    return () => ro.disconnect();
  }, []);

  // Draw Canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const width = canvas.width = containerRef.current?.clientWidth || 800;
    const height = canvas.height = containerRef.current?.clientHeight || 600;

    // Clear background
    ctx.fillStyle = '#091326';
    ctx.fillRect(0, 0, width, height);

    // Compute visible tile boundaries across the entire canvas viewport directly from pan & zoom
    const minX = Math.floor((-pan.x) / zoom) + plan.originX - 3;
    const maxX = Math.ceil((width - pan.x) / zoom) + plan.originX + 3;
    const minY = Math.floor((pan.y - height) / zoom) + plan.originY - 3;
    const maxY = Math.ceil(pan.y / zoom) + plan.originY + 3;

    // 1. Draw World Boundaries (Tundra, Fertile Land, Ruins)
    if (showBoundaries) {
      // Tundra Boundary (250 to 950)
      const tunBL = tileToScreen(TUNDRA_ZONE.minX, TUNDRA_ZONE.maxY);
      const tunW = (TUNDRA_ZONE.maxX - TUNDRA_ZONE.minX) * zoom;
      const tunH = (TUNDRA_ZONE.maxY - TUNDRA_ZONE.minY) * zoom;
      ctx.fillStyle = 'rgba(14, 165, 233, 0.04)';
      ctx.strokeStyle = 'rgba(14, 165, 233, 0.35)';
      ctx.lineWidth = 2;
      ctx.setLineDash([8, 8]);
      ctx.fillRect(tunBL.x, tunBL.y, tunW, tunH);
      ctx.strokeRect(tunBL.x, tunBL.y, tunW, tunH);

      // Fertile Land Boundary (450 to 750)
      const ferBL = tileToScreen(FERTILE_LAND_ZONE.minX, FERTILE_LAND_ZONE.maxY);
      const ferW = (FERTILE_LAND_ZONE.maxX - FERTILE_LAND_ZONE.minX) * zoom;
      const ferH = (FERTILE_LAND_ZONE.maxY - FERTILE_LAND_ZONE.minY) * zoom;
      ctx.fillStyle = 'rgba(34, 197, 94, 0.05)';
      ctx.strokeStyle = 'rgba(34, 197, 94, 0.45)';
      ctx.lineWidth = 2.5;
      ctx.setLineDash([6, 6]);
      ctx.fillRect(ferBL.x, ferBL.y, ferW, ferH);
      ctx.strokeRect(ferBL.x, ferBL.y, ferW, ferH);

      // Ruins / Red Alert Zone around Sunfire Castle (565 to 635)
      const ruiBL = tileToScreen(RUINS_ALERT_ZONE.minX, RUINS_ALERT_ZONE.maxY);
      const ruiW = (RUINS_ALERT_ZONE.maxX - RUINS_ALERT_ZONE.minX) * zoom;
      const ruiH = (RUINS_ALERT_ZONE.maxY - RUINS_ALERT_ZONE.minY) * zoom;
      ctx.fillStyle = 'rgba(239, 68, 68, 0.09)';
      ctx.strokeStyle = 'rgba(239, 68, 68, 0.6)';
      ctx.lineWidth = 2;
      ctx.setLineDash([]);
      ctx.fillRect(ruiBL.x, ruiBL.y, ruiW, ruiH);
      ctx.strokeRect(ruiBL.x, ruiBL.y, ruiW, ruiH);

      // Red Alert / Restricted Ruins No-Build Zones (60x60) around each Stronghold & Fortress
      [...FIXED_STRONGHOLDS, ...FIXED_FORTRESSES].forEach(obj => {
        const zone = getObjectiveRestrictedZone(obj);
        const zBL = tileToScreen(zone.minX, zone.maxY);
        const zW = (zone.maxX - zone.minX) * zoom;
        const zH = (zone.maxY - zone.minY) * zoom;

        // Same rich ruins styling as Sunfire Castle ruins
        ctx.fillStyle = 'rgba(239, 68, 68, 0.09)';
        ctx.strokeStyle = 'rgba(239, 68, 68, 0.6)';
        ctx.lineWidth = 2;
        ctx.setLineDash([]);
        ctx.fillRect(zBL.x, zBL.y, zW, zH);
        ctx.strokeRect(zBL.x, zBL.y, zW, zH);

        if (zoom >= 8) {
          ctx.font = 'bold 9px sans-serif';
          ctx.fillStyle = '#ef4444';
          ctx.fillText(`RUINS (${obj.name.toUpperCase()}) 60x60`, zBL.x + 6, zBL.y + 12);
        }
      });

      // Scorched Earth / No-Build Zone around plotable facilities (15x15 area: 6 tiles on all sides)
      const allFacilities = plan.entities.filter(e => e.type === 'facility');
      allFacilities.forEach(fac => {
        const p = tileToScreen(fac.x - 6, fac.y + 3 + 6);
        ctx.fillStyle = 'rgba(239, 68, 68, 0.08)';
        ctx.strokeStyle = 'rgba(239, 68, 68, 0.5)';
        ctx.lineWidth = 1.5;
        ctx.setLineDash([4, 4]);
        ctx.fillRect(p.x, p.y, 15 * zoom, 15 * zoom);
        ctx.strokeRect(p.x, p.y, 15 * zoom, 15 * zoom);
        ctx.setLineDash([]);

        if (zoom >= 12) {
          ctx.font = 'bold 9px sans-serif';
          ctx.fillStyle = 'rgba(248, 113, 113, 0.8)';
          ctx.fillText(`SCORCHED EARTH (15x15)`, p.x + 4, p.y + 12);
        }
      });

      // Zone Labels
      if (zoom >= 10) {
        ctx.font = 'bold 11px sans-serif';
        ctx.fillStyle = '#ef4444';
        ctx.fillText('RUINS (NO-BUILD ZONE)', ruiBL.x + 8, ruiBL.y + 16);

        ctx.fillStyle = '#4ade80';
        ctx.fillText('FERTILE LAND', ferBL.x + 8, ferBL.y + 16);

        ctx.fillStyle = '#38bdf8';
        ctx.fillText('TUNDRA', tunBL.x + 8, tunBL.y + 16);
      }
      ctx.setLineDash([]);
    }

    // 2. Draw Grid Lines covering the entire viewable area
    ctx.lineWidth = 1;
    for (let x = minX; x <= maxX; x++) {
      const scrX = (x - plan.originX) * zoom + pan.x;
      ctx.strokeStyle = (x % 10 === 0) ? 'rgba(56, 189, 248, 0.4)' : (x % 5 === 0 ? 'rgba(255, 255, 255, 0.16)' : 'rgba(255, 255, 255, 0.05)');
      ctx.beginPath();
      ctx.moveTo(scrX, 0);
      ctx.lineTo(scrX, height);
      ctx.stroke();

      if (x % 5 === 0 && zoom >= 14) {
        ctx.fillStyle = (x % 10 === 0) ? '#38bdf8' : 'rgba(255,255,255,0.45)';
        ctx.font = '10px monospace';
        ctx.fillText(`X:${x}`, scrX + 2, height - 8);
      }
    }

    for (let y = minY; y <= maxY; y++) {
      const scrY = -(y - plan.originY) * zoom + pan.y;
      ctx.strokeStyle = (y % 10 === 0) ? 'rgba(56, 189, 248, 0.4)' : (y % 5 === 0 ? 'rgba(255, 255, 255, 0.16)' : 'rgba(255, 255, 255, 0.05)');
      ctx.beginPath();
      ctx.moveTo(0, scrY);
      ctx.lineTo(width, scrY);
      ctx.stroke();

      if (y % 5 === 0 && zoom >= 14) {
        ctx.fillStyle = (y % 10 === 0) ? '#38bdf8' : 'rgba(255,255,255,0.45)';
        ctx.font = '10px monospace';
        ctx.fillText(`Y:${y}`, 8, scrY - 4);
      }
    }

    // 3. Draw Bear Trap Range Rings (Traps are 3x3, center is at x + 1.5, y + 1.5)
    const allTraps = plan.entities.filter(e => e.type === 'trap');
    allTraps.forEach(trap => {
      const centerScreen = tileToScreen(trap.x + 1.5, trap.y + 1.5);
      [5, 10, 15, 20].forEach(r => {
        ctx.strokeStyle = 'rgba(239, 68, 68, 0.25)';
        ctx.setLineDash([4, 4]);
        ctx.beginPath();
        ctx.arc(centerScreen.x, centerScreen.y, r * zoom, 0, Math.PI * 2);
        ctx.stroke();
        ctx.setLineDash([]);
        
        ctx.fillStyle = 'rgba(239, 68, 68, 0.6)';
        ctx.font = '9px sans-serif';
        ctx.fillText(`R:${r}`, centerScreen.x + r * zoom - 15, centerScreen.y - 2);
      });
    });

    // 4. Draw Fixed World Objectives (Castle, Turrets, Strongholds, Fortresses)
    if (showObjectives) {
      fixedWorldObjects.forEach(obj => {
        const p = tileToScreen(obj.x, obj.y + obj.height);
        const w = obj.width * zoom;
        const h = obj.height * zoom;

        if (obj.type === 'castle') {
          ctx.fillStyle = '#b45309';
          ctx.fillRect(p.x + 1, p.y + 1, w - 2, h - 2);
          ctx.strokeStyle = '#f59e0b';
          ctx.lineWidth = 3;
          ctx.strokeRect(p.x + 1, p.y + 1, w - 2, h - 2);

          // Draw Turret inner corner indicators inside the 12x12
          ctx.fillStyle = '#78350f';
          ctx.strokeStyle = '#d97706';
          ctx.lineWidth = 1.5;
          const tw = 3 * zoom;
          const th = 3 * zoom;
          // NW turret
          ctx.fillRect(p.x + 2, p.y + 2, tw, th);
          ctx.strokeRect(p.x + 2, p.y + 2, tw, th);
          // NE turret
          ctx.fillRect(p.x + w - tw - 2, p.y + 2, tw, th);
          ctx.strokeRect(p.x + w - tw - 2, p.y + 2, tw, th);
          // SW turret
          ctx.fillRect(p.x + 2, p.y + h - th - 2, tw, th);
          ctx.strokeRect(p.x + 2, p.y + h - th - 2, tw, th);
          // SE turret
          ctx.fillRect(p.x + w - tw - 2, p.y + h - th - 2, tw, th);
          ctx.strokeRect(p.x + w - tw - 2, p.y + h - th - 2, tw, th);

          // Center Castle Keep (6x6 inside the 12x12)
          const kw = 6 * zoom;
          const kh = 6 * zoom;
          const kx = p.x + (w - kw) / 2;
          const ky = p.y + (h - kh) / 2;
          ctx.fillStyle = '#92400e';
          ctx.fillRect(kx, ky, kw, kh);
          ctx.strokeStyle = '#fbbf24';
          ctx.lineWidth = 2.5;
          ctx.strokeRect(kx, ky, kw, kh);

          ctx.fillStyle = '#ffffff';
          ctx.font = `bold ${Math.max(16, Math.min(36, zoom * 1.6))}px sans-serif`;
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText('👑', p.x + w / 2, p.y + h / 2 - 8);
          if (zoom >= 10) {
            ctx.font = 'bold 12px sans-serif';
            ctx.fillText('SUNFIRE CASTLE', p.x + w / 2, p.y + h / 2 + 14);
            ctx.font = '10px monospace';
            ctx.fillText('Center (600, 600)', p.x + w / 2, p.y + h / 2 + 28);
          }
        } else if (obj.name.includes('Turret')) {
          ctx.fillStyle = '#78350f';
          ctx.fillRect(p.x + 1, p.y + 1, w - 2, h - 2);
          ctx.strokeStyle = '#f59e0b';
          ctx.lineWidth = 2;
          ctx.strokeRect(p.x + 1, p.y + 1, w - 2, h - 2);

          ctx.fillStyle = '#ffffff';
          ctx.font = `${Math.max(12, Math.min(22, zoom))}px sans-serif`;
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText('🏹', p.x + w / 2, p.y + h / 2 - 6);
          if (zoom >= 14) {
            ctx.font = 'bold 10px sans-serif';
            ctx.fillText(obj.name, p.x + w / 2, p.y + h / 2 + 10);
          }
        } else if (obj.type === 'stronghold') {
          ctx.fillStyle = '#4c1d95';
          ctx.fillRect(p.x + 1, p.y + 1, w - 2, h - 2);
          ctx.strokeStyle = '#a855f7';
          ctx.lineWidth = 2.5;
          ctx.strokeRect(p.x + 1, p.y + 1, w - 2, h - 2);

          ctx.fillStyle = '#ffffff';
          ctx.font = `${Math.max(14, Math.min(26, zoom * 1.2))}px sans-serif`;
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText('⚔️', p.x + w / 2, p.y + h / 2 - 8);
          if (zoom >= 12) {
            ctx.font = 'bold 11px sans-serif';
            ctx.fillText(obj.name, p.x + w / 2, p.y + h / 2 + 12);
          }
        } else if (obj.type === 'fortress') {
          ctx.fillStyle = '#1e3a8a';
          ctx.fillRect(p.x + 1, p.y + 1, w - 2, h - 2);
          ctx.strokeStyle = '#38bdf8';
          ctx.lineWidth = 2.5;
          ctx.strokeRect(p.x + 1, p.y + 1, w - 2, h - 2);

          ctx.fillStyle = '#ffffff';
          ctx.font = `${Math.max(14, Math.min(26, zoom * 1.2))}px sans-serif`;
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText('🛡️', p.x + w / 2, p.y + h / 2 - 8);
          if (zoom >= 12) {
            ctx.font = 'bold 11px sans-serif';
            ctx.fillText(obj.name, p.x + w / 2, p.y + h / 2 + 12);
          }
        }

        // Coordinate tag
        if (zoom >= 16) {
          ctx.fillStyle = 'rgba(0,0,0,0.8)';
          ctx.font = '9px monospace';
          ctx.textAlign = 'left';
          ctx.textBaseline = 'bottom';
          const coordText = `(${obj.x},${obj.y})`;
          const tw = ctx.measureText(coordText).width;
          ctx.fillRect(p.x + 2, p.y + h - 14, tw + 4, 12);
          ctx.fillStyle = '#f8fafc';
          ctx.fillText(coordText, p.x + 4, p.y + h - 4);
        }
      });
    }

    // 6. Draw Placed Entities (Buildings, Cities, Traps, Nodes, Statues)
    plan.entities.forEach(ent => {
      const isSelected = ent.id === selectedEntityId;
      const sizeX = ent.width || (ent.type === 'hq' || ent.type === 'trap' ? 3 : (ent.type === 'banner' ? 1 : 2));
      const sizeY = ent.height || (ent.type === 'hq' || ent.type === 'trap' ? 3 : (ent.type === 'banner' ? 1 : 2));
      
      const p = tileToScreen(ent.x, ent.y + sizeY);
      const w = sizeX * zoom;
      const h = sizeY * zoom;
      const allianceColor = ALLIANCE_COLORS.find(c => c.id === (ent.color || 'gold')) || ALLIANCE_COLORS[0];

      // Entity Body
      switch (ent.type) {
        case 'trap':
          ctx.fillStyle = '#b91c1c';
          ctx.fillRect(p.x + 1, p.y + 1, w - 2, h - 2);
          ctx.strokeStyle = isSelected ? '#ffffff' : '#f87171';
          ctx.lineWidth = isSelected ? 3 : 2;
          ctx.strokeRect(p.x + 1, p.y + 1, w - 2, h - 2);
          
          ctx.fillStyle = '#ffffff';
          ctx.font = `bold ${Math.max(14, Math.min(26, zoom * 1.2))}px sans-serif`;
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText('🐻', p.x + w / 2, p.y + h / 2 - 8);
          if (zoom > 12) {
            const trapLabel = ent.label || 'BEAR TRAP';
            ctx.font = 'bold 10px sans-serif';
            const textWidth = ctx.measureText(trapLabel).width;
            ctx.fillStyle = 'rgba(0, 0, 0, 0.75)';
            ctx.fillRect(p.x + (w - textWidth - 8) / 2, p.y + h / 2 + 5, textWidth + 8, 15);
            ctx.fillStyle = '#fca5a5';
            ctx.fillText(trapLabel, p.x + w / 2, p.y + h / 2 + 13);
          }
          break;

        case 'hq':
          ctx.fillStyle = allianceColor.bg;
          ctx.fillRect(p.x + 1, p.y + 1, w - 2, h - 2);
          ctx.strokeStyle = isSelected ? '#ffffff' : allianceColor.border;
          ctx.lineWidth = isSelected ? 3 : 2;
          ctx.strokeRect(p.x + 1, p.y + 1, w - 2, h - 2);

          ctx.fillStyle = '#ffffff';
          ctx.font = `bold ${Math.max(14, Math.min(26, zoom * 1.2))}px sans-serif`;
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText('🏰', p.x + w / 2, p.y + h / 2 - 8);
          if (zoom > 12) {
            const hqLabel = ent.label || 'HQ';
            ctx.font = 'bold 11px sans-serif';
            const textWidth = ctx.measureText(hqLabel).width;
            ctx.fillStyle = 'rgba(0, 0, 0, 0.75)';
            ctx.fillRect(p.x + (w - textWidth - 8) / 2, p.y + h / 2 + 5, textWidth + 8, 15);
            ctx.fillStyle = allianceColor.border || '#fcd34d';
            ctx.fillText(hqLabel, p.x + w / 2, p.y + h / 2 + 13);
          }
          break;

        case 'banner':
          ctx.fillStyle = allianceColor.bg;
          ctx.fillRect(p.x + 1, p.y + 1, w - 2, h - 2);
          ctx.strokeStyle = isSelected ? '#ffffff' : allianceColor.border;
          ctx.lineWidth = isSelected ? 2.5 : 1.5;
          ctx.strokeRect(p.x + 1, p.y + 1, w - 2, h - 2);

          ctx.fillStyle = '#ffffff';
          ctx.font = `${Math.max(10, Math.min(16, zoom * 0.8))}px sans-serif`;
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText('🚩', p.x + w / 2, p.y + h / 2);
          break;

        case 'city':
          ctx.fillStyle = '#0f766e';
          ctx.fillRect(p.x + 1, p.y + 1, w - 2, h - 2);
          ctx.strokeStyle = isSelected ? '#38bdf8' : '#2dd4bf';
          ctx.lineWidth = isSelected ? 3 : 1.5;
          ctx.strokeRect(p.x + 1, p.y + 1, w - 2, h - 2);

          ctx.fillStyle = '#ffffff';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.font = `${Math.max(10, Math.min(18, zoom * 0.7))}px sans-serif`;
          ctx.fillText('🏙️', p.x + w / 2, p.y + h / 2 - (zoom > 16 ? 7 : 0));

          if (zoom >= 12) {
            ctx.font = 'bold 10px sans-serif';
            const label = ent.label || `P-${ent.id.slice(-3)}`;
            const textWidth = ctx.measureText(label).width;
            
            ctx.fillStyle = 'rgba(0, 0, 0, 0.75)';
            ctx.fillRect(p.x + (w - textWidth - 8) / 2, p.y + h / 2 + (zoom > 16 ? 4 : -5), textWidth + 8, 14);
            
            ctx.fillStyle = '#5eead4';
            ctx.fillText(label, p.x + w / 2, p.y + h / 2 + (zoom > 16 ? 11 : 2));
          }
          break;

        case 'node':
          const nodeColor = RESOURCE_COLORS[ent.resourceType] || '#a855f7';
          ctx.fillStyle = '#1e293b';
          ctx.fillRect(p.x + 1, p.y + 1, w - 2, h - 2);
          ctx.strokeStyle = isSelected ? '#ffffff' : nodeColor;
          ctx.lineWidth = isSelected ? 3 : 2;
          ctx.strokeRect(p.x + 1, p.y + 1, w - 2, h - 2);

          const icon = ent.resourceType === 'Meat' ? '🥩' : ent.resourceType === 'Wood' ? '🌲' : ent.resourceType === 'Coal' ? '🪨' : '⛏️';
          ctx.fillStyle = '#ffffff';
          ctx.font = `${Math.max(11, Math.min(18, zoom * 0.7))}px sans-serif`;
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(icon, p.x + w / 2, p.y + h / 2 - (zoom > 16 ? 6 : 0));
          
          if (zoom >= 14) {
            ctx.font = 'bold 9px sans-serif';
            ctx.fillStyle = nodeColor;
            ctx.fillText(ent.resourceType.toUpperCase(), p.x + w / 2, p.y + h / 2 + (zoom > 16 ? 8 : 0));
          }
          break;

        case 'statue':
          ctx.fillStyle = '#475569';
          ctx.fillRect(p.x + 1, p.y + 1, w - 2, h - 2);
          ctx.strokeStyle = isSelected ? '#ffffff' : '#cbd5e1';
          ctx.lineWidth = isSelected ? 3 : 2;
          ctx.strokeRect(p.x + 1, p.y + 1, w - 2, h - 2);

          ctx.fillStyle = '#ffffff';
          ctx.font = `${Math.max(12, Math.min(22, zoom * 0.8))}px sans-serif`;
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText('🗿', p.x + w / 2, p.y + h / 2 - (zoom > 16 ? 6 : 0));
          if (zoom >= 12) {
            const statueLabel = ent.label || 'STATUE';
            ctx.font = 'bold 10px sans-serif';
            const textWidth = ctx.measureText(statueLabel).width;
            ctx.fillStyle = 'rgba(0, 0, 0, 0.75)';
            ctx.fillRect(p.x + (w - textWidth - 8) / 2, p.y + h / 2 + (zoom > 16 ? 4 : -5), textWidth + 8, 14);
            ctx.fillStyle = '#f1f5f9';
            ctx.fillText(statueLabel, p.x + w / 2, p.y + h / 2 + (zoom > 16 ? 11 : 2));
          }
          break;

        case 'facility':
          ctx.fillStyle = '#1e293b';
          ctx.fillRect(p.x + 1, p.y + 1, w - 2, h - 2);
          ctx.strokeStyle = isSelected ? '#ffffff' : '#f59e0b';
          ctx.lineWidth = isSelected ? 3 : 2;
          ctx.strokeRect(p.x + 1, p.y + 1, w - 2, h - 2);

          ctx.fillStyle = '#ffffff';
          ctx.font = `${Math.max(14, Math.min(26, zoom * 1.2))}px sans-serif`;
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText('🏛️', p.x + w / 2, p.y + h / 2 - 8);
          if (zoom >= 12) {
            const facLabel = ent.label || 'FACILITY';
            ctx.font = 'bold 10px sans-serif';
            const textWidth = ctx.measureText(facLabel).width;
            ctx.fillStyle = 'rgba(0, 0, 0, 0.75)';
            ctx.fillRect(p.x + (w - textWidth - 8) / 2, p.y + h / 2 + 5, textWidth + 8, 15);
            ctx.fillStyle = '#fbbf24';
            ctx.fillText(facLabel, p.x + w / 2, p.y + h / 2 + 13);
          }
          break;

        default:
          break;
      }

      // Bottom-left coordinate indicator
      if (zoom >= 18) {
        ctx.fillStyle = 'rgba(0,0,0,0.85)';
        ctx.font = '9px monospace';
        ctx.textAlign = 'left';
        ctx.textBaseline = 'bottom';
        const coordText = `(${ent.x},${ent.y})`;
        const tw = ctx.measureText(coordText).width;
        ctx.fillRect(p.x + 2, p.y + h - 14, tw + 4, 12);
        ctx.fillStyle = '#f8fafc';
        ctx.fillText(coordText, p.x + 4, p.y + h - 4);
      }
    });

    // 6. Draw Territory Overlays OVER entities (Translucent Multi-color Banners: 7x7, HQ: 15x15)
    // This allows territory coverage and borders to show through all player cities, nodes, and statues!
    plan.entities.forEach(ent => {
      const allianceColor = ALLIANCE_COLORS.find(c => c.id === (ent.color || 'gold')) || ALLIANCE_COLORS[0];
      if (ent.type === 'hq') {
        const terrX = ent.x - 6;
        const terrY = ent.y - 6;
        const p = tileToScreen(terrX, terrY + 15);
        ctx.fillStyle = allianceColor.terrBg;
        ctx.strokeStyle = allianceColor.terrBorder;
        ctx.lineWidth = 2.5;
        ctx.fillRect(p.x, p.y, 15 * zoom, 15 * zoom);
        ctx.strokeRect(p.x, p.y, 15 * zoom, 15 * zoom);
      } else if (ent.type === 'banner') {
        const terrX = ent.x - 3;
        const terrY = ent.y - 3;
        const p = tileToScreen(terrX, terrY + 7);
        ctx.fillStyle = allianceColor.terrBg;
        ctx.strokeStyle = allianceColor.terrBorder;
        ctx.lineWidth = 2;
        ctx.fillRect(p.x, p.y, 7 * zoom, 7 * zoom);
        ctx.strokeRect(p.x, p.y, 7 * zoom, 7 * zoom);
      }
    });

    // 7. Draw Placement Ghost/Preview under mouse cursor
    if (hoveredTile && activeTool !== 'select' && activeTool !== 'eraser') {
      let previewW = 2;
      let previewH = 2;
      let ghostColor = 'rgba(56, 189, 248, 0.4)';
      let ghostStroke = '#38bdf8';

      if (activeTool === 'hq' || activeTool === 'trap' || activeTool === 'facility') {
        previewW = 3;
        previewH = 3;
        ghostColor = activeTool === 'trap' ? 'rgba(239, 68, 68, 0.4)' : activeTool === 'facility' ? 'rgba(245, 158, 11, 0.4)' : 'rgba(59, 130, 246, 0.4)';
        ghostStroke = activeTool === 'trap' ? '#f87171' : activeTool === 'facility' ? '#fbbf24' : '#60a5fa';
      } else if (activeTool === 'banner') {
        previewW = 1;
        previewH = 1;
        const curCol = ALLIANCE_COLORS.find(c => c.id === selectedAllianceColor) || ALLIANCE_COLORS[0];
        ghostColor = curCol.terrBg;
        ghostStroke = curCol.border;
      }

      // Check if current position conflicts with another structure OR Ruins zone (for banners/cities/HQs)
      const hasConflict = plan.entities.some(ent => {
        const w = ent.width || (ent.type === 'hq' || ent.type === 'trap' ? 3 : (ent.type === 'banner' ? 1 : 2));
        const h = ent.height || (ent.type === 'hq' || ent.type === 'trap' ? 3 : (ent.type === 'banner' ? 1 : 2));
        return isOverlapping(hoveredTile.x, hoveredTile.y, previewW, previewH, ent.x, ent.y, w, h);
      }) || (showObjectives && fixedWorldObjects.some(obj => {
        return isOverlapping(hoveredTile.x, hoveredTile.y, previewW, previewH, obj.x, obj.y, obj.width, obj.height);
      }));

      // In ruins, building banners or HQs is forbidden by game rules
      const inRuins = (activeTool === 'banner' || activeTool === 'hq') &&
        hoveredTile.x >= RUINS_ALERT_ZONE.minX && hoveredTile.x < RUINS_ALERT_ZONE.maxX &&
        hoveredTile.y >= RUINS_ALERT_ZONE.minY && hoveredTile.y < RUINS_ALERT_ZONE.maxY;

      // In Fort/Stronghold restricted zones (60x60), banners and HQs cannot be built
      const inObjectiveZone = (activeTool === 'banner' || activeTool === 'hq') &&
        [...FIXED_STRONGHOLDS, ...FIXED_FORTRESSES].some(obj => {
          const z = getObjectiveRestrictedZone(obj);
          return hoveredTile.x >= z.minX && hoveredTile.x < z.maxX &&
                 hoveredTile.y >= z.minY && hoveredTile.y < z.maxY;
        });

      // In Scorched Earth around Facilities (15x15), banners and HQs cannot be built
      const inFacilityScorchedEarth = (activeTool === 'banner' || activeTool === 'hq') &&
        plan.entities.some(e => {
          if (e.type !== 'facility') return false;
          return hoveredTile.x >= e.x - 6 && hoveredTile.x < e.x + 9 &&
                 hoveredTile.y >= e.y - 6 && hoveredTile.y < e.y + 9;
        });

      if (hasConflict || inRuins || inObjectiveZone || inFacilityScorchedEarth) {
        ghostColor = 'rgba(239, 68, 68, 0.45)';
        ghostStroke = '#ef4444';
      }

      const p = tileToScreen(hoveredTile.x, hoveredTile.y + previewH);
      ctx.fillStyle = ghostColor;
      ctx.fillRect(p.x, p.y, previewW * zoom, previewH * zoom);
      ctx.strokeStyle = ghostStroke;
      ctx.lineWidth = 2;
      ctx.setLineDash([3, 3]);
      ctx.strokeRect(p.x, p.y, previewW * zoom, previewH * zoom);
      ctx.setLineDash([]);
      
      ctx.fillStyle = (hasConflict || inRuins || inObjectiveZone || inFacilityScorchedEarth) ? '#fca5a5' : '#ffffff';
      ctx.font = 'bold 10px monospace';
      const label = inRuins ? 'NO-BUILD RUINS' : inObjectiveZone ? 'FORT NO-BUILD ZONE' : inFacilityScorchedEarth ? 'SCORCHED EARTH' : hasConflict ? 'BLOCKED' : '';
      ctx.fillText(label ? `${label} (${hoveredTile.x},${hoveredTile.y})` : `(${hoveredTile.x},${hoveredTile.y})`, p.x + 4, p.y + previewH * zoom - 4);
    }

  }, [plan, zoom, pan, screenToTile, tileToScreen, hoveredTile, activeTool, selectedEntityId, bearTrap, showBoundaries, showObjectives, fixedWorldObjects, selectedAllianceColor, containerSize, showLeftTools, showRoster]);

  // Mouse & Pan handlers
  const handleMouseDown = (e) => {
    if (e.button === 2 || e.button === 1 || activeTool === 'select') {
      setIsPanning(true);
      setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
    }
  };

  const handleMouseMove = (e) => {
    if (isPanning) {
      setPan({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y
      });
      return;
    }
    const tile = screenToTile(e.clientX, e.clientY);
    setHoveredTile(tile);
  };

  const handleMouseUp = () => {
    setIsPanning(false);
  };

  const handleWheel = (e) => {
    e.preventDefault();
    const zoomFactor = e.deltaY < 0 ? 1.15 : 0.85;
    const newZoom = Math.min(60, Math.max(6, zoom * zoomFactor));

    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    const newPanX = mouseX - (mouseX - pan.x) * (newZoom / zoom);
    const newPanY = mouseY - (mouseY - pan.y) * (newZoom / zoom);

    setZoom(newZoom);
    setPan({ x: newPanX, y: newPanY });
  };

  // Touch event handlers for iPad
  const handleTouchStart = (e) => {
    if (e.touches.length === 2) {
      const touch1 = e.touches[0];
      const touch2 = e.touches[1];
      const dist = Math.hypot(touch1.clientX - touch2.clientX, touch1.clientY - touch2.clientY);
      touchStateRef.current = { lastDist: dist, isPinching: true };
    } else if (e.touches.length === 1) {
      const touch = e.touches[0];
      setIsPanning(true);
      setDragStart({ x: touch.clientX - pan.x, y: touch.clientY - pan.y });
      const tile = screenToTile(touch.clientX, touch.clientY);
      setHoveredTile(tile);
    }
  };

  const handleTouchMove = (e) => {
    if (e.touches.length === 2 && touchStateRef.current.isPinching) {
      const touch1 = e.touches[0];
      const touch2 = e.touches[1];
      const dist = Math.hypot(touch1.clientX - touch2.clientX, touch1.clientY - touch2.clientY);
      const ratio = dist / touchStateRef.current.lastDist;
      
      const newZoom = Math.min(60, Math.max(6, zoom * ratio));
      setZoom(newZoom);
      touchStateRef.current.lastDist = dist;
    } else if (e.touches.length === 1 && isPanning) {
      const touch = e.touches[0];
      setPan({
        x: touch.clientX - dragStart.x,
        y: touch.clientY - dragStart.y
      });
      const tile = screenToTile(touch.clientX, touch.clientY);
      setHoveredTile(tile);
    }
  };

  const handleTouchEnd = () => {
    touchStateRef.current.isPinching = false;
    setIsPanning(false);
  };

  // Jump camera directly to specific map coordinates
  const jumpToCoordinate = (x, y) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    setPan({
      x: centerX - (x - plan.originX) * zoom,
      y: centerY + (y - plan.originY) * zoom
    });
  };

  // Click handler to select, place, or open rename modal
  const handleCanvasClick = (e) => {
    if (isPanning) return;
    const tile = screenToTile(e.clientX, e.clientY);

    // Eraser Tool
    if (activeTool === 'eraser') {
      const clickedEntity = plan.entities.find(ent => {
        const w = ent.width || (ent.type === 'hq' || ent.type === 'trap' ? 3 : (ent.type === 'banner' ? 1 : 2));
        const h = ent.height || (ent.type === 'hq' || ent.type === 'trap' ? 3 : (ent.type === 'banner' ? 1 : 2));
        return tile.x >= ent.x && tile.x < ent.x + w && tile.y >= ent.y && tile.y < ent.y + h;
      });
      if (clickedEntity) {
        setPlan(prev => ({
          ...prev,
          entities: prev.entities.filter(ent => ent.id !== clickedEntity.id)
        }));
        if (selectedEntityId === clickedEntity.id) setSelectedEntityId(null);
      }
      return;
    }

    // Select Tool: Pick clicked entity and open rename modal if already selected
    if (activeTool === 'select') {
      const clickedEntity = plan.entities.find(ent => {
        const w = ent.width || (ent.type === 'hq' || ent.type === 'trap' ? 3 : (ent.type === 'banner' ? 1 : 2));
        const h = ent.height || (ent.type === 'hq' || ent.type === 'trap' ? 3 : (ent.type === 'banner' ? 1 : 2));
        return tile.x >= ent.x && tile.x < ent.x + w && tile.y >= ent.y && tile.y < ent.y + h;
      });

      if (clickedEntity) {
        if (selectedEntityId === clickedEntity.id) {
          setRenameModalEntity(clickedEntity);
          setRenameInputValue(clickedEntity.label || '');
        } else {
          setSelectedEntityId(clickedEntity.id);
        }
      } else {
        setSelectedEntityId(null);
      }
      return;
    }

    // Determine footprint for new structure
    let w = 2;
    let h = 2;
    if (activeTool === 'hq' || activeTool === 'trap' || activeTool === 'facility') {
      w = 3;
      h = 3;
    } else if (activeTool === 'banner') {
      w = 1;
      h = 1;
    }

    // Check if trying to build inside Ruins / Red Alert Zone
    if ((activeTool === 'banner' || activeTool === 'hq') &&
        tile.x >= RUINS_ALERT_ZONE.minX && tile.x < RUINS_ALERT_ZONE.maxX &&
        tile.y >= RUINS_ALERT_ZONE.minY && tile.y < RUINS_ALERT_ZONE.maxY) {
      setOverlapWarning('Protected Zone! Alliance Banners and HQs cannot be built inside the Ruins.');
      setTimeout(() => setOverlapWarning(null), 2500);
      return;
    }

    // Check if trying to build inside Fort / Stronghold Restricted Zones (60x60)
    if (activeTool === 'banner' || activeTool === 'hq') {
      const conflictZone = [...FIXED_STRONGHOLDS, ...FIXED_FORTRESSES].find(obj => {
        const z = getObjectiveRestrictedZone(obj);
        return tile.x >= z.minX && tile.x < z.maxX &&
               tile.y >= z.minY && tile.y < z.maxY;
      });
      if (conflictZone) {
        setOverlapWarning(`Protected Zone! Cannot build inside the 60x60 ${conflictZone.name} restricted area.`);
        setTimeout(() => setOverlapWarning(null), 2500);
        return;
      }
    }

    // Check if trying to build inside Facility Scorched Earth Zones (15x15)
    if (activeTool === 'banner' || activeTool === 'hq') {
      const conflictFac = plan.entities.find(e => {
        if (e.type !== 'facility') return false;
        return tile.x >= e.x - 6 && tile.x < e.x + 9 &&
               tile.y >= e.y - 6 && tile.y < e.y + 9;
      });
      if (conflictFac) {
        setOverlapWarning(`Protected Zone! Cannot build inside the 15x15 Scorched Earth zone of ${conflictFac.label || 'Facility'}.`);
        setTimeout(() => setOverlapWarning(null), 2500);
        return;
      }
    }

    // OVERLAP CHECK: Prevent any structure from overlapping an existing structure or fixed world objective
    const overlapping = plan.entities.find(ent => {
      const ew = ent.width || (ent.type === 'hq' || ent.type === 'trap' ? 3 : (ent.type === 'banner' ? 1 : 2));
      const eh = ent.height || (ent.type === 'hq' || ent.type === 'trap' ? 3 : (ent.type === 'banner' ? 1 : 2));
      return isOverlapping(tile.x, tile.y, w, h, ent.x, ent.y, ew, eh);
    }) || (showObjectives && fixedWorldObjects.find(obj => {
      return isOverlapping(tile.x, tile.y, w, h, obj.x, obj.y, obj.width, obj.height);
    }));

    if (overlapping) {
      setOverlapWarning(`Cannot place here! Overlaps with ${overlapping.label || overlapping.name || overlapping.type.toUpperCase()}`);
      setTimeout(() => setOverlapWarning(null), 2500);
      return;
    }

    // Placement Tools
    let newEntity = null;
    const id = Date.now().toString() + Math.random().toString(36).substr(2, 4);

    if (activeTool === 'trap') {
      newEntity = {
        id,
        type: 'trap',
        x: tile.x,
        y: tile.y,
        width: 3,
        height: 3,
        label: newTrapName.trim() || 'Bear Trap'
      };
      setPlan(prev => ({ ...prev, entities: [...prev.entities, newEntity] }));
      return;
    }

    if (activeTool === 'hq') {
      newEntity = {
        id,
        type: 'hq',
        x: tile.x,
        y: tile.y,
        width: 3,
        height: 3,
        color: selectedAllianceColor,
        hqType: selectedHqType,
        label: bannerAllianceTag ? `${bannerAllianceTag} ${selectedHqType} HQ` : `${selectedHqType} HQ`
      };
      setPlan(prev => ({ ...prev, entities: [...prev.entities, newEntity] }));
      return;
    }

    if (activeTool === 'banner') {
      newEntity = {
        id,
        type: 'banner',
        x: tile.x,
        y: tile.y,
        width: 1,
        height: 1,
        color: selectedAllianceColor,
        label: bannerAllianceTag || 'Banner'
      };
    } else if (activeTool === 'city') {
      const label = newCityName.trim() || `Player ${cityCounter}`;
      newEntity = {
        id,
        type: 'city',
        x: tile.x,
        y: tile.y,
        width: 2,
        height: 2,
        label
      };
      if (autoIncrementCity) {
        setCityCounter(c => c + 1);
        setNewCityName('');
      }
    } else if (activeTool === 'node') {
      newEntity = {
        id,
        type: 'node',
        x: tile.x,
        y: tile.y,
        width: 2,
        height: 2,
        resourceType: selectedResourceType,
        label: `${selectedResourceType} Node`
      };
    } else if (activeTool === 'statue') {
      newEntity = {
        id,
        type: 'statue',
        x: tile.x,
        y: tile.y,
        width: 2,
        height: 2,
        label: newStatueName.trim() || 'Statue'
      };
    } else if (activeTool === 'facility') {
      newEntity = {
        id,
        type: 'facility',
        x: tile.x,
        y: tile.y,
        width: 3,
        height: 3,
        label: newFacilityName.trim() || 'Facility'
      };
    }

    if (newEntity) {
      setPlan(prev => ({
        ...prev,
        entities: [...prev.entities, newEntity]
      }));
    }
  };

  // Distance calculation helper (Euclidean & Manhattan)
  const calculateDistance = (city, trap) => {
    if (!city || !trap) return null;
    const dx = (city.x + 1) - (trap.x + 1.5);
    const dy = (city.y + 1) - (trap.y + 1.5);
    const euclidean = Math.sqrt(dx * dx + dy * dy);
    return {
      euclidean: euclidean.toFixed(1),
      tiles: Math.max(Math.abs(dx), Math.abs(dy)).toFixed(1)
    };
  };

  // Generate shareable link
  const handleGenerateShareLink = () => {
    const encoded = encodePlanToHash(plan);
    const url = new URL(window.location.origin + window.location.pathname);
    url.searchParams.set('plan', encoded);
    
    navigator.clipboard.writeText(url.toString()).then(() => {
      setShareSuccess(true);
      setTimeout(() => setShareSuccess(false), 3000);
    });
  };

  // Export as PNG image
  const handleExportPNG = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const link = document.createElement('a');
    link.download = `${plan.name.replace(/\s+/g, '_')}_Layout.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  };

  // Reset/Clear Hive
  const handleClearPlan = () => {
    if (window.confirm('Clear all placed entities from this territory plan?')) {
      setPlan(prev => ({ ...prev, entities: [] }));
      setSelectedEntityId(null);
    }
  };

  // Save renamed entity
  const handleSaveRename = () => {
    if (!renameModalEntity) return;
    const newName = renameInputValue.trim();
    setPlan(prev => ({
      ...prev,
      entities: prev.entities.map(ent => 
        ent.id === renameModalEntity.id ? { 
          ...ent, 
          label: newName || (renameModalEntity.type === 'hq' ? 'Alliance HQ' : renameModalEntity.type === 'statue' ? 'Statue' : ent.label) 
        } : ent
      )
    }));
    setRenameModalEntity(null);
  };

  // Selected Entity object
  const selectedEntity = plan.entities.find(e => e.id === selectedEntityId);

  // Sorted list of cities by distance to bear trap
  const sortedCities = useMemo(() => {
    const cities = plan.entities.filter(e => e.type === 'city');
    if (!bearTrap) return cities;
    return [...cities].sort((a, b) => {
      const distA = Math.hypot((a.x + 1) - (bearTrap.x + 1.5), (a.y + 1) - (bearTrap.y + 1.5));
      const distB = Math.hypot((b.x + 1) - (bearTrap.x + 1.5), (b.y + 1) - (bearTrap.y + 1.5));
      return distA - distB;
    });
  }, [plan.entities, bearTrap]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', flex: 1, gap: '8px', minHeight: 0 }}>
      
      {/* Overlap Error Toast */}
      {overlapWarning && (
        <div style={{
          position: 'fixed',
          top: '20px',
          left: '50%',
          transform: 'translateX(-50%)',
          background: '#ef4444',
          color: '#fff',
          padding: '10px 20px',
          borderRadius: '8px',
          boxShadow: '0 8px 24px rgba(0,0,0,0.5)',
          zIndex: 1000,
          fontWeight: 'bold',
          fontSize: '0.9rem',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          <span>🚫</span> {overlapWarning}
        </div>
      )}

      {/* Top Banner Alert when Plan loaded via link */}
      {importedPlan && (
        <div style={{
          background: 'linear-gradient(90deg, #1e3a8a, #0369a1)',
          padding: '8px 14px',
          borderRadius: '8px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          color: '#ffffff',
          boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
          flexShrink: 0
        }}>
          <div>
            <strong>🔗 Shared Plan:</strong> "{importedPlan.name || 'Territory Plan'}" ({importedPlan.entities.length} items)
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button 
              className="action-btn" 
              style={{ background: '#22c55e', color: '#000', fontWeight: 'bold' }}
              onClick={() => {
                updateAccountState('territoryPlanner', importedPlan);
                setImportedPlan(null);
                window.history.replaceState({}, document.title, window.location.pathname);
                alert('Plan successfully saved to your active account!');
              }}
            >
              💾 Save to My Account
            </button>
            <button 
              className="action-btn"
              onClick={() => {
                setImportedPlan(null);
                window.history.replaceState({}, document.title, window.location.pathname);
              }}
            >
              Dismiss
            </button>
          </div>
        </div>
      )}

      {/* Top Compact Control Bar */}
      <div 
        className="territory-topbar"
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: 'var(--glass-bg)',
          padding: '8px 14px',
          borderRadius: '10px',
          border: '1px solid var(--glass-border)',
          gap: '8px',
          flexShrink: 0
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          <button 
            className="action-btn"
            style={{ 
              padding: '6px 10px', 
              fontSize: '0.8rem', 
              background: showLeftTools ? 'rgba(56, 189, 248, 0.25)' : 'rgba(255, 255, 255, 0.08)', 
              color: 'var(--text-primary)',
              border: showLeftTools ? '1px solid #38bdf8' : '1px solid var(--glass-border)'
            }}
            onClick={() => setShowLeftTools(s => !s)}
            title="Toggle Tools"
          >
            🛠️ Tools
          </button>

          <input 
            type="text" 
            value={plan.name} 
            onChange={e => setPlan(p => ({ ...p, name: e.target.value }))}
            style={{
              background: 'rgba(0,0,0,0.3)',
              border: '1px solid var(--glass-border)',
              color: 'var(--text-primary)',
              padding: '4px 8px',
              borderRadius: '6px',
              fontSize: '0.9rem',
              fontWeight: 'bold',
              width: '130px'
            }}
          />

          <input 
            type="text" 
            placeholder="State #" 
            value={plan.stateNumber || ''} 
            onChange={e => setPlan(p => ({ ...p, stateNumber: e.target.value }))}
            style={{
              background: 'rgba(0,0,0,0.3)',
              border: '1px solid var(--glass-border)',
              color: 'var(--text-primary)',
              padding: '4px 8px',
              borderRadius: '6px',
              fontSize: '0.85rem',
              width: '70px'
            }}
          />

          <input 
            type="text" 
            placeholder="Tag [ALL]" 
            value={plan.allianceTag || ''} 
            onChange={e => setPlan(p => ({ ...p, allianceTag: e.target.value }))}
            style={{
              background: 'rgba(0,0,0,0.3)',
              border: '1px solid var(--glass-border)',
              color: 'var(--text-primary)',
              padding: '4px 8px',
              borderRadius: '6px',
              fontSize: '0.85rem',
              width: '75px'
            }}
          />

          {/* Map Layer Toggles */}
          <button
            className="action-btn"
            style={{
              padding: '5px 8px',
              fontSize: '0.75rem',
              background: showBoundaries ? 'rgba(34, 197, 94, 0.25)' : 'rgba(255, 255, 255, 0.05)',
              color: showBoundaries ? '#4ade80' : 'var(--text-secondary)',
              border: showBoundaries ? '1px solid #22c55e' : '1px solid var(--glass-border)'
            }}
            onClick={() => setShowBoundaries(b => !b)}
          >
            🗺️ Zones {showBoundaries ? 'ON' : 'OFF'}
          </button>

          <button
            className="action-btn"
            style={{
              padding: '5px 8px',
              fontSize: '0.75rem',
              background: showObjectives ? 'rgba(168, 85, 247, 0.25)' : 'rgba(255, 255, 255, 0.05)',
              color: showObjectives ? '#c084fc' : 'var(--text-secondary)',
              border: showObjectives ? '1px solid #a855f7' : '1px solid var(--glass-border)'
            }}
            onClick={() => setShowObjectives(o => !o)}
          >
            🏰 Forts & Castle {showObjectives ? 'ON' : 'OFF'}
          </button>
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', gap: '6px', alignItems: 'center', flexWrap: 'wrap' }}>
          <button 
            className="action-btn"
            style={{ background: shareSuccess ? '#22c55e' : 'var(--accent-color)', color: '#000', fontWeight: 'bold', padding: '6px 10px', fontSize: '0.8rem' }}
            onClick={handleGenerateShareLink}
          >
            {shareSuccess ? '✓ Link Copied!' : '🔗 Share'}
          </button>
          <button className="action-btn" style={{ padding: '6px 10px', fontSize: '0.8rem' }} onClick={handleExportPNG}>
            📷 PNG
          </button>
          <button 
            className="action-btn" 
            style={{ 
              background: showRoster ? 'rgba(56, 189, 248, 0.25)' : 'rgba(255, 255, 255, 0.08)', 
              color: 'var(--text-primary)', 
              border: showRoster ? '1px solid #38bdf8' : '1px solid var(--glass-border)', 
              padding: '6px 10px', 
              fontSize: '0.8rem' 
            }}
            onClick={() => setShowRoster(s => !s)}
          >
            👥 Roster ({plan.entities.filter(e => e.type === 'city').length})
          </button>
          <button className="action-btn" style={{ color: '#f87171', padding: '6px 10px', fontSize: '0.8rem' }} onClick={handleClearPlan}>
            🗑️ Clear
          </button>
        </div>
      </div>

      {/* Main Workspace */}
      <div style={{ display: 'flex', flex: 1, gap: '8px', minHeight: 0, position: 'relative' }}>
        
        {/* Left Vertical Tool Palette */}
        {showLeftTools && (
          <div style={{
            width: '200px',
            background: 'var(--glass-bg)',
            borderRadius: '10px',
            border: '1px solid var(--glass-border)',
            padding: '10px',
            display: 'flex',
            flexDirection: 'column',
            gap: '6px',
            overflowY: 'auto',
            flexShrink: 0
          }}>
            <div style={{ fontSize: '0.75rem', fontWeight: 'bold', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>
              Placement Tools
            </div>

            <button 
              style={{
                padding: '8px 10px',
                borderRadius: '6px',
                border: activeTool === 'select' ? '2px solid var(--accent-color)' : '1px solid var(--glass-border)',
                background: activeTool === 'select' ? 'rgba(56, 189, 248, 0.2)' : 'rgba(0,0,0,0.2)',
                color: 'var(--text-primary)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                textAlign: 'left'
              }}
              onClick={() => setActiveTool('select')}
            >
              <span>🖐️</span>
              <div>
                <div style={{ fontWeight: 'bold', fontSize: '0.8rem' }}>Select / Move</div>
                <div style={{ fontSize: '0.65rem', color: 'var(--text-secondary)' }}>Click to rename</div>
              </div>
            </button>

            <button 
              style={{
                padding: '8px 10px',
                borderRadius: '6px',
                border: activeTool === 'trap' ? '2px solid #ef4444' : '1px solid var(--glass-border)',
                background: activeTool === 'trap' ? 'rgba(239, 68, 68, 0.25)' : 'rgba(0,0,0,0.2)',
                color: 'var(--text-primary)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                textAlign: 'left'
              }}
              onClick={() => setActiveTool('trap')}
            >
              <span style={{ fontSize: '1.1rem' }}>🐻</span>
              <div>
                <div style={{ fontWeight: 'bold', fontSize: '0.8rem' }}>Bear Trap (3x3)</div>
                <div style={{ fontSize: '0.65rem', color: 'var(--text-secondary)' }}>Central objective</div>
              </div>
            </button>

            {/* Sub-options for Bear Trap */}
            {activeTool === 'trap' && (
              <div style={{
                background: 'rgba(0,0,0,0.3)',
                padding: '6px',
                borderRadius: '6px',
                display: 'flex',
                flexDirection: 'column',
                gap: '4px'
              }}>
                <label style={{ fontSize: '0.65rem', color: 'var(--text-secondary)' }}>Trap Name / Number:</label>
                <div style={{ display: 'flex', gap: '4px', marginBottom: '2px' }}>
                  {['Bear Trap 1', 'Bear Trap 2', 'Bear Trap 3'].map(preset => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => setNewTrapName(preset)}
                      style={{
                        flex: 1,
                        padding: '2px 4px',
                        fontSize: '0.65rem',
                        background: newTrapName === preset ? '#ef4444' : 'rgba(255,255,255,0.06)',
                        color: '#fff',
                        border: '1px solid var(--glass-border)',
                        borderRadius: '3px',
                        cursor: 'pointer'
                      }}
                    >
                      {preset.replace('Bear Trap ', 'Trap ')}
                    </button>
                  ))}
                </div>
                <input
                  type="text"
                  placeholder="Custom Trap Name"
                  value={newTrapName}
                  onChange={e => setNewTrapName(e.target.value)}
                  style={{
                    width: '100%',
                    background: 'rgba(255,255,255,0.08)',
                    border: '1px solid var(--glass-border)',
                    color: '#fff',
                    borderRadius: '4px',
                    padding: '3px 6px',
                    fontSize: '0.75rem'
                  }}
                />
              </div>
            )}

            <button 
              style={{
                padding: '8px 10px',
                borderRadius: '6px',
                border: activeTool === 'hq' ? '2px solid #3b82f6' : '1px solid var(--glass-border)',
                background: activeTool === 'hq' ? 'rgba(59, 130, 246, 0.25)' : 'rgba(0,0,0,0.2)',
                color: 'var(--text-primary)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                textAlign: 'left'
              }}
              onClick={() => setActiveTool('hq')}
            >
              <span style={{ fontSize: '1.1rem' }}>🏰</span>
              <div>
                <div style={{ fontWeight: 'bold', fontSize: '0.8rem' }}>HQ (3x3)</div>
                <div style={{ fontSize: '0.65rem', color: 'var(--text-secondary)' }}>15x15 territory</div>
              </div>
            </button>

            {/* Sub-options for HQ: Icefield vs Tundra HQ & Alliance Color */}
            {activeTool === 'hq' && (
              <div style={{
                background: 'rgba(0,0,0,0.3)',
                padding: '6px',
                borderRadius: '6px',
                display: 'flex',
                flexDirection: 'column',
                gap: '4px'
              }}>
                <label style={{ fontSize: '0.65rem', color: 'var(--text-secondary)' }}>HQ Location Type:</label>
                <div style={{ display: 'flex', gap: '4px', marginBottom: '2px' }}>
                  {['Icefield', 'Tundra'].map(type => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => setSelectedHqType(type)}
                      style={{
                        flex: 1,
                        padding: '4px',
                        fontSize: '0.7rem',
                        fontWeight: selectedHqType === type ? 'bold' : 'normal',
                        background: selectedHqType === type ? 'var(--accent-color)' : 'rgba(255,255,255,0.06)',
                        color: selectedHqType === type ? '#000' : 'var(--text-primary)',
                        border: '1px solid var(--glass-border)',
                        borderRadius: '4px',
                        cursor: 'pointer'
                      }}
                    >
                      {type === 'Icefield' ? '❄️ Icefield HQ' : '🌲 Tundra HQ'}
                    </button>
                  ))}
                </div>

                <label style={{ fontSize: '0.65rem', color: 'var(--text-secondary)', marginTop: '2px' }}>Alliance Color:</label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '4px' }}>
                  {ALLIANCE_COLORS.map(col => (
                    <button
                      key={col.id}
                      title={col.name}
                      onClick={() => setSelectedAllianceColor(col.id)}
                      style={{
                        height: '20px',
                        borderRadius: '4px',
                        background: col.bg,
                        border: selectedAllianceColor === col.id ? '2px solid #fff' : `1px solid ${col.border}`,
                        cursor: 'pointer'
                      }}
                    />
                  ))}
                </div>

                <input
                  type="text"
                  placeholder="Alliance Tag [XYZ]"
                  value={bannerAllianceTag}
                  onChange={e => setBannerAllianceTag(e.target.value)}
                  style={{
                    width: '100%',
                    background: 'rgba(255,255,255,0.08)',
                    border: '1px solid var(--glass-border)',
                    color: '#fff',
                    borderRadius: '4px',
                    padding: '3px 6px',
                    fontSize: '0.75rem',
                    marginTop: '2px'
                  }}
                />
              </div>
            )}

            <button 
              style={{
                padding: '8px 10px',
                borderRadius: '6px',
                border: activeTool === 'banner' ? '2px solid #eab308' : '1px solid var(--glass-border)',
                background: activeTool === 'banner' ? 'rgba(234, 179, 8, 0.25)' : 'rgba(0,0,0,0.2)',
                color: 'var(--text-primary)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                textAlign: 'left'
              }}
              onClick={() => setActiveTool('banner')}
            >
              <span style={{ fontSize: '1.1rem' }}>🚩</span>
              <div>
                <div style={{ fontWeight: 'bold', fontSize: '0.8rem' }}>Banner (1x1)</div>
                <div style={{ fontSize: '0.65rem', color: 'var(--text-secondary)' }}>7x7 territory</div>
              </div>
            </button>

            {/* Sub-options for Banner: Alliance Color & Tag */}
            {activeTool === 'banner' && (
              <div style={{
                background: 'rgba(0,0,0,0.3)',
                padding: '6px',
                borderRadius: '6px',
                display: 'flex',
                flexDirection: 'column',
                gap: '4px'
              }}>
                <label style={{ fontSize: '0.65rem', color: 'var(--text-secondary)' }}>Alliance Color:</label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '4px' }}>
                  {ALLIANCE_COLORS.map(col => (
                    <button
                      key={col.id}
                      title={col.name}
                      onClick={() => setSelectedAllianceColor(col.id)}
                      style={{
                        height: '22px',
                        borderRadius: '4px',
                        background: col.bg,
                        border: selectedAllianceColor === col.id ? '2px solid #fff' : `1px solid ${col.border}`,
                        cursor: 'pointer'
                      }}
                    />
                  ))}
                </div>
                <input
                  type="text"
                  placeholder="Alliance Tag [XYZ]"
                  value={bannerAllianceTag}
                  onChange={e => setBannerAllianceTag(e.target.value)}
                  style={{
                    width: '100%',
                    background: 'rgba(255,255,255,0.08)',
                    border: '1px solid var(--glass-border)',
                    color: '#fff',
                    borderRadius: '4px',
                    padding: '3px 6px',
                    fontSize: '0.75rem',
                    marginTop: '2px'
                  }}
                />
              </div>
            )}

            <button 
              style={{
                padding: '8px 10px',
                borderRadius: '6px',
                border: activeTool === 'city' ? '2px solid #14b8a6' : '1px solid var(--glass-border)',
                background: activeTool === 'city' ? 'rgba(20, 184, 166, 0.25)' : 'rgba(0,0,0,0.2)',
                color: 'var(--text-primary)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                textAlign: 'left'
              }}
              onClick={() => setActiveTool('city')}
            >
              <span style={{ fontSize: '1.1rem' }}>🏙️</span>
              <div>
                <div style={{ fontWeight: 'bold', fontSize: '0.8rem' }}>City (2x2)</div>
                <div style={{ fontSize: '0.65rem', color: 'var(--text-secondary)' }}>Player city slot</div>
              </div>
            </button>

            {/* Sub-options for City placement */}
            {activeTool === 'city' && (
              <div style={{
                background: 'rgba(0,0,0,0.3)',
                padding: '6px',
                borderRadius: '6px',
                fontSize: '0.75rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '4px'
              }}>
                <div>
                  <label style={{ color: 'var(--text-secondary)', display: 'block', fontSize: '0.65rem' }}>Name:</label>
                  <input 
                    type="text" 
                    placeholder={`Player ${cityCounter}`}
                    value={newCityName}
                    onChange={e => setNewCityName(e.target.value)}
                    style={{
                      width: '100%',
                      background: 'rgba(255,255,255,0.08)',
                      border: '1px solid var(--glass-border)',
                      color: '#fff',
                      borderRadius: '4px',
                      padding: '3px 6px',
                      fontSize: '0.75rem'
                    }}
                  />
                </div>
                <label style={{ display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer', fontSize: '0.7rem' }}>
                  <input 
                    type="checkbox" 
                    checked={autoIncrementCity} 
                    onChange={e => setAutoIncrementCity(e.target.checked)}
                  />
                  Auto # (1, 2...)
                </label>
              </div>
            )}

            <button 
              style={{
                padding: '8px 10px',
                borderRadius: '6px',
                border: activeTool === 'node' ? '2px solid #a855f7' : '1px solid var(--glass-border)',
                background: activeTool === 'node' ? 'rgba(168, 85, 247, 0.25)' : 'rgba(0,0,0,0.2)',
                color: 'var(--text-primary)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                textAlign: 'left'
              }}
              onClick={() => setActiveTool('node')}
            >
              <span style={{ fontSize: '1.1rem' }}>🌾</span>
              <div>
                <div style={{ fontWeight: 'bold', fontSize: '0.8rem' }}>Node (2x2)</div>
                <div style={{ fontSize: '0.65rem', color: 'var(--text-secondary)' }}>Meat, Wood, etc.</div>
              </div>
            </button>

            {/* Sub-options for Resource Node */}
            {activeTool === 'node' && (
              <div style={{
                background: 'rgba(0,0,0,0.3)',
                padding: '6px',
                borderRadius: '6px',
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '4px'
              }}>
                {RESOURCE_TYPES.map(res => (
                  <button
                    key={res}
                    onClick={() => setSelectedResourceType(res)}
                    style={{
                      padding: '3px 4px',
                      borderRadius: '4px',
                      fontSize: '0.7rem',
                      fontWeight: selectedResourceType === res ? 'bold' : 'normal',
                      background: selectedResourceType === res ? RESOURCE_COLORS[res] : 'rgba(255,255,255,0.05)',
                      color: selectedResourceType === res ? '#000' : 'var(--text-primary)',
                      border: '1px solid var(--glass-border)',
                      cursor: 'pointer'
                    }}
                  >
                    {res}
                  </button>
                ))}
              </div>
            )}

            <button 
              style={{
                padding: '8px 10px',
                borderRadius: '6px',
                border: activeTool === 'statue' ? '2px solid #94a3b8' : '1px solid var(--glass-border)',
                background: activeTool === 'statue' ? 'rgba(148, 163, 184, 0.25)' : 'rgba(0,0,0,0.2)',
                color: 'var(--text-primary)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                textAlign: 'left'
              }}
              onClick={() => setActiveTool('statue')}
            >
              <span style={{ fontSize: '1.1rem' }}>🗿</span>
              <div>
                <div style={{ fontWeight: 'bold', fontSize: '0.8rem' }}>Statue (2x2)</div>
                <div style={{ fontSize: '0.65rem', color: 'var(--text-secondary)' }}>Monument</div>
              </div>
            </button>

            {/* Sub-options for Statue */}
            {activeTool === 'statue' && (
              <div style={{
                background: 'rgba(0,0,0,0.3)',
                padding: '6px',
                borderRadius: '6px',
                display: 'flex',
                flexDirection: 'column',
                gap: '4px'
              }}>
                <label style={{ fontSize: '0.65rem', color: 'var(--text-secondary)' }}>Statue Name/Label:</label>
                <input
                  type="text"
                  placeholder="e.g. Bear Trap Statue"
                  value={newStatueName}
                  onChange={e => setNewStatueName(e.target.value)}
                  style={{
                    width: '100%',
                    background: 'rgba(255,255,255,0.08)',
                    border: '1px solid var(--glass-border)',
                    color: '#fff',
                    borderRadius: '4px',
                    padding: '3px 6px',
                    fontSize: '0.75rem'
                  }}
                />
              </div>
            )}

            <button 
              style={{
                padding: '8px 10px',
                borderRadius: '6px',
                border: activeTool === 'facility' ? '2px solid #f59e0b' : '1px solid var(--glass-border)',
                background: activeTool === 'facility' ? 'rgba(245, 158, 11, 0.25)' : 'rgba(0,0,0,0.2)',
                color: 'var(--text-primary)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                textAlign: 'left'
              }}
              onClick={() => setActiveTool('facility')}
            >
              <span style={{ fontSize: '1.1rem' }}>🏛️</span>
              <div>
                <div style={{ fontWeight: 'bold', fontSize: '0.8rem' }}>Facility (3x3)</div>
                <div style={{ fontSize: '0.65rem', color: 'var(--text-secondary)' }}>15x15 Scorched Earth</div>
              </div>
            </button>

            {/* Sub-options for Facility */}
            {activeTool === 'facility' && (
              <div style={{
                background: 'rgba(0,0,0,0.3)',
                padding: '6px',
                borderRadius: '6px',
                display: 'flex',
                flexDirection: 'column',
                gap: '4px'
              }}>
                <label style={{ fontSize: '0.65rem', color: 'var(--text-secondary)' }}>Facility Name/Type:</label>
                <input
                  type="text"
                  placeholder="e.g. Iron Mine Facility"
                  value={newFacilityName}
                  onChange={e => setNewFacilityName(e.target.value)}
                  style={{
                    width: '100%',
                    background: 'rgba(255,255,255,0.08)',
                    border: '1px solid var(--glass-border)',
                    color: '#fff',
                    borderRadius: '4px',
                    padding: '3px 6px',
                    fontSize: '0.75rem'
                  }}
                />
              </div>
            )}

            <button 
              style={{
                padding: '8px 10px',
                borderRadius: '6px',
                border: activeTool === 'eraser' ? '2px solid #ef4444' : '1px solid var(--glass-border)',
                background: activeTool === 'eraser' ? 'rgba(239, 68, 68, 0.25)' : 'rgba(0,0,0,0.2)',
                color: 'var(--text-primary)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                textAlign: 'left'
              }}
              onClick={() => setActiveTool('eraser')}
            >
              <span style={{ fontSize: '1.1rem' }}>🧽</span>
              <div>
                <div style={{ fontWeight: 'bold', fontSize: '0.8rem' }}>Eraser</div>
                <div style={{ fontSize: '0.65rem', color: 'var(--text-secondary)' }}>Delete item</div>
              </div>
            </button>

            {/* Quick Map Jump Shortcuts */}
            <div style={{
              background: 'rgba(0,0,0,0.3)',
              borderRadius: '6px',
              padding: '6px',
              display: 'flex',
              flexDirection: 'column',
              gap: '6px',
              marginTop: '4px'
            }}>
              <div style={{ fontSize: '0.7rem', fontWeight: 'bold', color: 'var(--text-secondary)' }}>
                📍 Quick Jump
              </div>
              <select
                onChange={(e) => {
                  if (!e.target.value) return;
                  const [jx, jy] = e.target.value.split(',').map(Number);
                  if (!isNaN(jx) && !isNaN(jy)) {
                    jumpToCoordinate(jx, jy);
                  }
                  e.target.value = '';
                }}
                defaultValue=""
                style={{
                  width: '100%',
                  background: 'rgba(255, 255, 255, 0.08)',
                  border: '1px solid var(--glass-border)',
                  color: 'var(--text-primary)',
                  borderRadius: '4px',
                  padding: '4px 6px',
                  fontSize: '0.75rem',
                  cursor: 'pointer'
                }}
              >
                <option value="" disabled style={{ background: '#1e293b', color: '#94a3b8' }}>Select landmark...</option>
                
                <optgroup label="Core Objectives" style={{ background: '#1e293b', color: '#f8fafc' }}>
                  <option value="600,600">👑 Sunfire Castle (600, 600)</option>
                  
                  {/* Auto-populated HQ Quick Jumps */}
                  {allianceHQs.map(hq => (
                    <option key={hq.id} value={`${hq.x + 1.5},${hq.y + 1.5}`}>
                      🏰 {hq.label || 'Alliance HQ'} ({hq.x}, {hq.y})
                    </option>
                  ))}

                  {/* Auto-populated Bear Trap Quick Jumps */}
                  {bearTraps.map(trap => (
                    <option key={trap.id} value={`${trap.x + 1.5},${trap.y + 1.5}`}>
                      🐻 {trap.label || 'Bear Trap'} ({trap.x}, {trap.y})
                    </option>
                  ))}

                  {allianceHQs.length === 0 && bearTraps.length === 0 && (
                    <option value={`${plan.originX},${plan.originY}`}>
                      🏠 Hive Origin ({plan.originX}, {plan.originY})
                    </option>
                  )}
                </optgroup>

                <optgroup label="Strongholds (Level 4)" style={{ background: '#1e293b', color: '#c084fc' }}>
                  {FIXED_STRONGHOLDS.map(sh => (
                    <option key={sh.id} value={`${sh.x + 3},${sh.y + 3}`}>
                      ⚔️ {sh.name} ({sh.x}, {sh.y})
                    </option>
                  ))}
                </optgroup>

                <optgroup label="Fortresses" style={{ background: '#1e293b', color: '#60a5fa' }}>
                  {FIXED_FORTRESSES.map(f => (
                    <option key={f.id} value={`${f.x + 3},${f.y + 3}`}>
                      🏰 {f.name} ({f.x}, {f.y})
                    </option>
                  ))}
                </optgroup>
              </select>

              {/* Coordinate Search & Go */}
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '4px',
                borderTop: '1px solid rgba(255,255,255,0.08)',
                paddingTop: '6px'
              }}>
                <div style={{ fontSize: '0.65rem', color: 'var(--text-secondary)' }}>
                  Go to Coordinate (X, Y):
                </div>
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    const x = parseFloat(searchCoordX);
                    const y = parseFloat(searchCoordY);
                    if (!isNaN(x) && !isNaN(y)) {
                      jumpToCoordinate(x, y);
                    }
                  }}
                  style={{ display: 'flex', gap: '4px', alignItems: 'center' }}
                >
                  <input
                    type="number"
                    placeholder="X"
                    min="0"
                    max="1200"
                    value={searchCoordX}
                    onChange={e => setSearchCoordX(e.target.value)}
                    style={{
                      width: '45px',
                      background: 'rgba(255, 255, 255, 0.08)',
                      border: '1px solid var(--glass-border)',
                      color: 'var(--text-primary)',
                      borderRadius: '4px',
                      padding: '3px 4px',
                      fontSize: '0.75rem',
                      textAlign: 'center'
                    }}
                  />
                  <input
                    type="number"
                    placeholder="Y"
                    min="0"
                    max="1200"
                    value={searchCoordY}
                    onChange={e => setSearchCoordY(e.target.value)}
                    style={{
                      width: '45px',
                      background: 'rgba(255, 255, 255, 0.08)',
                      border: '1px solid var(--glass-border)',
                      color: 'var(--text-primary)',
                      borderRadius: '4px',
                      padding: '3px 4px',
                      fontSize: '0.75rem',
                      textAlign: 'center'
                    }}
                  />
                  <button
                    type="submit"
                    style={{
                      flex: 1,
                      background: 'var(--accent-color)',
                      color: '#000',
                      border: 'none',
                      borderRadius: '4px',
                      padding: '3px 6px',
                      fontSize: '0.75rem',
                      fontWeight: 'bold',
                      cursor: 'pointer'
                    }}
                  >
                    Go
                  </button>
                </form>
              </div>
            </div>

            {/* Selected Entity Inspector */}
            {selectedEntity && (
              <div style={{
                marginTop: 'auto',
                background: 'rgba(0,0,0,0.4)',
                border: '1px solid var(--glass-border)',
                borderRadius: '6px',
                padding: '8px',
                display: 'flex',
                flexDirection: 'column',
                gap: '6px'
              }}>
                <div style={{ fontSize: '0.75rem', fontWeight: 'bold', color: 'var(--accent-color)' }}>
                  Selected: {selectedEntity.type.toUpperCase()}
                </div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>
                  Bottom-Left: ({selectedEntity.x}, {selectedEntity.y})
                </div>
                <button
                  style={{
                    background: 'rgba(56, 189, 248, 0.2)',
                    border: '1px solid #38bdf8',
                    color: '#fff',
                    borderRadius: '4px',
                    padding: '4px',
                    fontSize: '0.75rem',
                    cursor: 'pointer',
                    fontWeight: 'bold'
                  }}
                  onClick={() => {
                    setRenameModalEntity(selectedEntity);
                    setRenameInputValue(selectedEntity.label || '');
                  }}
                >
                  ✏️ Rename "{selectedEntity.label || 'Entity'}"
                </button>
                <button 
                  style={{
                    background: '#dc2626',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '4px',
                    padding: '4px',
                    fontSize: '0.75rem',
                    cursor: 'pointer'
                  }}
                  onClick={() => {
                    setPlan(prev => ({
                      ...prev,
                      entities: prev.entities.filter(ent => ent.id !== selectedEntity.id)
                    }));
                    setSelectedEntityId(null);
                  }}
                >
                  Delete Item
                </button>
              </div>
            )}

          </div>
        )}

        {/* Center Canvas Grid Viewport */}
        <div 
          ref={containerRef}
          style={{
            flex: 1,
            position: 'relative',
            borderRadius: '10px',
            overflow: 'hidden',
            border: '1px solid var(--glass-border)',
            background: '#040a15'
          }}
        >
          <canvas
            ref={canvasRef}
            style={{ width: '100%', height: '100%', display: 'block', cursor: activeTool === 'select' ? (isPanning ? 'grabbing' : 'grab') : 'crosshair' }}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onWheel={handleWheel}
            onClick={handleCanvasClick}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            onContextMenu={e => e.preventDefault()}
          />

          {/* Coordinate & Zoom HUD overlay */}
          <div style={{
            position: 'absolute',
            bottom: '10px',
            left: '10px',
            background: 'rgba(0, 0, 0, 0.75)',
            backdropFilter: 'blur(4px)',
            border: '1px solid var(--glass-border)',
            padding: '4px 10px',
            borderRadius: '6px',
            fontSize: '0.75rem',
            color: 'var(--text-secondary)',
            display: 'flex',
            gap: '12px'
          }}>
            <div>Hover: <strong style={{ color: '#fff' }}>{hoveredTile ? `(${hoveredTile.x}, ${hoveredTile.y})` : '--'}</strong></div>
            <div>Zoom: <strong style={{ color: '#fff' }}>{Math.round((zoom / 24) * 100)}%</strong></div>
          </div>

          {/* Canvas Quick Controls */}
          <div style={{
            position: 'absolute',
            top: '10px',
            right: '10px',
            display: 'flex',
            gap: '6px'
          }}>
            <button 
              className="action-btn"
              style={{ padding: '6px 10px', fontSize: '0.8rem' }}
              onClick={() => {
                if (bearTrap) {
                  const canvas = canvasRef.current;
                  if (!canvas) return;
                  const centerX = canvas.width / 2;
                  const centerY = canvas.height / 2;
                  setPan({
                    x: centerX - (bearTrap.x - plan.originX + 1.5) * zoom,
                    y: centerY + (bearTrap.y - plan.originY + 1.5) * zoom
                  });
                } else {
                  setPan({ x: 250, y: 250 });
                }
              }}
            >
              🎯 Recenter
            </button>
            <button 
              className="action-btn"
              style={{ padding: '6px 10px', fontSize: '0.8rem' }}
              onClick={() => setZoom(z => Math.min(60, z * 1.25))}
            >
              ➕
            </button>
            <button 
              className="action-btn"
              style={{ padding: '6px 10px', fontSize: '0.8rem' }}
              onClick={() => setZoom(z => Math.max(6, z * 0.8))}
            >
              ➖
            </button>
          </div>
        </div>

        {/* Right Side City & Hive Distance Roster (Collapsible) */}
        {showRoster && (
          <div style={{
            width: '230px',
            background: 'var(--glass-bg)',
            borderRadius: '10px',
            border: '1px solid var(--glass-border)',
            padding: '10px',
            display: 'flex',
            flexDirection: 'column',
            gap: '6px',
            overflowY: 'auto',
            flexShrink: 0
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ fontSize: '0.8rem', fontWeight: 'bold', color: 'var(--text-primary)' }}>
                Hive Roster ({sortedCities.length})
              </div>
              <button 
                onClick={() => setShowRoster(false)} 
                style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', fontSize: '0.9rem' }}
              >
                ✕
              </button>
            </div>

            <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>
              Sorted by march distance to Bear Trap
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', overflowY: 'auto', flex: 1 }}>
              {sortedCities.map((city, idx) => {
                const dist = calculateDistance(city, bearTrap);
                const isSelected = city.id === selectedEntityId;
                return (
                  <div
                    key={city.id}
                    onClick={() => {
                      setSelectedEntityId(city.id);
                      const canvas = canvasRef.current;
                      if (canvas) {
                        const centerX = canvas.width / 2;
                        const centerY = canvas.height / 2;
                        setPan({
                          x: centerX - (city.x - plan.originX + 1) * zoom,
                          y: centerY + (city.y - plan.originY + 1) * zoom
                        });
                      }
                    }}
                    style={{
                      background: isSelected ? 'rgba(56, 189, 248, 0.2)' : 'rgba(0,0,0,0.25)',
                      border: isSelected ? '1px solid #38bdf8' : '1px solid var(--glass-border)',
                      borderRadius: '6px',
                      padding: '6px',
                      cursor: 'pointer',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '2px'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontWeight: 'bold', fontSize: '0.8rem', color: '#fff' }}>
                        #{idx + 1} {city.label}
                      </span>
                      {dist && (
                        <span style={{ fontSize: '0.7rem', color: '#38bdf8', fontWeight: 'bold' }}>
                          {dist.euclidean} tiles
                        </span>
                      )}
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.65rem', color: 'var(--text-secondary)' }}>
                      <span>({city.x}, {city.y})</span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setRenameModalEntity(city);
                          setRenameInputValue(city.label || '');
                        }}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: '#38bdf8',
                          cursor: 'pointer',
                          textDecoration: 'underline'
                        }}
                      >
                        Rename
                      </button>
                    </div>
                  </div>
                );
              })}

              {sortedCities.length === 0 && (
                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textAlign: 'center', marginTop: '16px' }}>
                  No player cities placed yet.
                </div>
              )}
            </div>
          </div>
        )}

      </div>

      {/* Quick Rename Modal for Cities & Entities */}
      {renameModalEntity && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.7)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 2000,
          backdropFilter: 'blur(4px)'
        }}>
          <div style={{
            background: 'var(--bg-secondary)',
            border: '1px solid var(--glass-border)',
            borderRadius: '12px',
            padding: '20px',
            width: '320px',
            boxShadow: '0 12px 36px rgba(0,0,0,0.5)',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px'
          }}>
            <h3 style={{ margin: 0, fontSize: '1rem', color: 'var(--text-primary)' }}>
              Rename {renameModalEntity.type === 'city' ? 'Player City' : renameModalEntity.type.toUpperCase()}
            </h3>
            <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
              Coordinates: ({renameModalEntity.x}, {renameModalEntity.y})
            </p>
            <input 
              type="text" 
              autoFocus
              value={renameInputValue}
              onChange={e => setRenameInputValue(e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Enter') handleSaveRename();
                if (e.key === 'Escape') setRenameModalEntity(null);
              }}
              placeholder="Enter player or building name"
              style={{
                width: '100%',
                background: 'rgba(255,255,255,0.08)',
                border: '1px solid var(--glass-border)',
                color: '#fff',
                borderRadius: '6px',
                padding: '8px 10px',
                fontSize: '0.9rem'
              }}
            />
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
              <button 
                className="action-btn"
                onClick={() => setRenameModalEntity(null)}
              >
                Cancel
              </button>
              <button 
                className="action-btn"
                style={{ background: 'var(--accent-color)', color: '#000', fontWeight: 'bold' }}
                onClick={handleSaveRename}
              >
                Save Name
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
