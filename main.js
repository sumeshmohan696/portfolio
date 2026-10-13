/* ============================================================
   SUMESH MOHAN — SCROLL SETTLE PHYSICS & DROPDOWN SLIDER
   - Text and cards dynamically glide and settle into place as you scroll
   - Navigation dropdown ticker updates, slides, and settles into position
   - 3D Datacenter Corridor zooms into individual server nodes
   - STRICTLY TEAL (#00E5C9), BLACK (#000000), AND WHITE (#FFFFFF)
   ============================================================ */

document.addEventListener('DOMContentLoaded', () => {
  initThreeJsDatacenterCorridor();
  initScrollSettlePhysics();
  initSectionDropdown();
  initExperienceTabs();
  initCicdEngine();
  initPromptStudio();
  initOperatorCLI();
  init3dCardTilt();
});

/* ---------------- 1. THREE.JS 3D DATACENTER AISLE & ZOOMING SERVER ---------------- */
let scene, camera, renderer;
let datacenterAisleGroup, targetFocusServer, neuralCore, statusLeds = [];
let targetCamX = 0, targetCamY = 15, targetCamZ = 220, targetLookY = 0;
let dynamicLight1, dynamicLight2;

function initThreeJsDatacenterCorridor() {
  const canvas = document.getElementById('canvas-3d');
  if (!canvas || typeof THREE === 'undefined') return;

  scene = new THREE.Scene();
  camera = new THREE.PerspectiveCamera(52, window.innerWidth / window.innerHeight, 1, 3000);
  camera.position.set(0, 15, 220);

  renderer = new THREE.WebGLRenderer({ canvas: canvas, alpha: true, antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

  // Lighting
  const ambient = new THREE.AmbientLight(0xffffff, 0.7);
  scene.add(ambient);

  dynamicLight1 = new THREE.PointLight(0x00e5c9, 3.5, 600); // CYBER TEAL
  dynamicLight1.position.set(60, 60, 100);
  scene.add(dynamicLight1);

  dynamicLight2 = new THREE.PointLight(0xffffff, 2.8, 600); // CRISP WHITE
  dynamicLight2.position.set(-60, -40, 80);
  scene.add(dynamicLight2);

  // Main Datacenter Aisle Group
  datacenterAisleGroup = new THREE.Group();
  scene.add(datacenterAisleGroup);

  // A. DATACENTER FLOOR GRID & RUNWAY LIGHTS
  const floorGeo = new THREE.PlaneGeometry(160, 500, 20, 50);
  const floorMat = new THREE.MeshBasicMaterial({
    color: 0x00e5c9,
    wireframe: true,
    transparent: true,
    opacity: 0.12
  });
  const floor = new THREE.Mesh(floorGeo, floorMat);
  floor.rotation.x = -Math.PI / 2;
  floor.position.y = -45;
  floor.position.z = -50;
  datacenterAisleGroup.add(floor);

  // Runway Center Line
  const lineGeo = new THREE.PlaneGeometry(3, 500);
  const lineMat = new THREE.MeshBasicMaterial({
    color: 0x00e5c9,
    transparent: true,
    opacity: 0.35
  });
  const runway = new THREE.Mesh(lineGeo, lineMat);
  runway.rotation.x = -Math.PI / 2;
  runway.position.y = -44.8;
  runway.position.z = -50;
  datacenterAisleGroup.add(runway);

  // B. DUAL ROWS OF SERVER RACKS (12 TOTAL RACKS)
  const rackWidth = 36;
  const rackHeight = 85;
  const rackDepth = 26;
  const aisleOffset = 46;

  for (let row = 0; row < 6; row++) {
    const zPos = 80 - row * 70;

    for (let side of [-1, 1]) {
      const rackGroup = new THREE.Group();
      rackGroup.position.set(side * aisleOffset, -2, zPos);
      rackGroup.rotation.y = (side === -1) ? 0.35 : -0.35;

      // Main Rack Monolith Body
      const rGeo = new THREE.BoxGeometry(rackWidth, rackHeight, rackDepth);
      const rMat = new THREE.MeshStandardMaterial({
        color: (row === 1 && side === 1) ? 0x060a0a : 0x020404,
        metalness: 0.9,
        roughness: 0.28
      });
      const rackMesh = new THREE.Mesh(rGeo, rMat);
      rackGroup.add(rackMesh);

      // Wireframe Hologram Edge
      const wireGeo = new THREE.BoxGeometry(rackWidth + 0.8, rackHeight + 0.8, rackDepth + 0.8);
      const wireMat = new THREE.MeshBasicMaterial({
        color: (side === -1) ? 0x00e5c9 : 0xffffff,
        wireframe: true,
        transparent: true,
        opacity: 0.15
      });
      const wireMesh = new THREE.Mesh(wireGeo, wireMat);
      rackGroup.add(wireMesh);

      // Horizontal Blade Tiers & Blinking LEDs
      for (let b = 0; b < 6; b++) {
        const bY = -32 + b * 12;

        const bayGeo = new THREE.BoxGeometry(rackWidth - 4, 3.5, 0.8);
        const bayMat = new THREE.MeshBasicMaterial({ color: 0x000000 });
        const bay = new THREE.Mesh(bayGeo, bayMat);
        bay.position.set(0, bY, rackDepth / 2 + 0.5);
        rackGroup.add(bay);

        for (let l = 0; l < 4; l++) {
          const ledGeo = new THREE.SphereGeometry(0.6, 8, 8);
          const ledColor = (l % 2 === 0) ? 0x00e5c9 : 0xffffff;
          const ledMat = new THREE.MeshBasicMaterial({ color: ledColor });
          const led = new THREE.Mesh(ledGeo, ledMat);
          led.position.set(-11 + l * 7, bY + 1.2, rackDepth / 2 + 1);
          rackGroup.add(led);
          statusLeds.push({ mesh: led, phase: Math.random() * 6 });
        }
      }

      datacenterAisleGroup.add(rackGroup);

      // Designate Rack (Row 1, Side 1) as focal single server
      if (row === 1 && side === 1) {
        targetFocusServer = rackGroup;

        // Add AI Quantum Processor Core on focal server
        const coreGeo = new THREE.IcosahedronGeometry(11, 1);
        const coreMat = new THREE.MeshStandardMaterial({
          color: 0x000000,
          emissive: 0x00e5c9,
          emissiveIntensity: 0.7,
          wireframe: true
        });
        neuralCore = new THREE.Mesh(coreGeo, coreMat);
        neuralCore.position.y = 52;
        rackGroup.add(neuralCore);

        const innerGeo = new THREE.SphereGeometry(6.5, 16, 16);
        const innerMat = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.85 });
        const innerSphere = new THREE.Mesh(innerGeo, innerMat);
        innerSphere.position.y = 52;
        rackGroup.add(innerSphere);

        for (let r = 0; r < 3; r++) {
          const ringGeo = new THREE.TorusGeometry(15 + r * 5, 0.35, 8, 60);
          const ringMat = new THREE.MeshBasicMaterial({
            color: (r % 2 === 0) ? 0x00e5c9 : 0xffffff,
            transparent: true,
            opacity: 0.75
          });
          const ring = new THREE.Mesh(ringGeo, ringMat);
          ring.position.y = 52;
          ring.rotation.x = Math.PI / 2 + r * 0.25;
          ring.rotation.y = r * 0.5;
          rackGroup.add(ring);
        }
      }
    }
  }

  // C. DATA BUS PARTICLES (400 floating packets)
  const pCount = 400;
  const pGeo = new THREE.BufferGeometry();
  const pPos = new Float32Array(pCount * 3);
  const pCols = new Float32Array(pCount * 3);

  const colors = [
    new THREE.Color(0x00e5c9),
    new THREE.Color(0xffffff),
    new THREE.Color(0x00bfa5),
    new THREE.Color(0xffffff)
  ];

  for (let i = 0; i < pCount; i++) {
    pPos[i * 3] = (Math.random() - 0.5) * 260;
    pPos[i * 3 + 1] = (Math.random() - 0.5) * 180;
    pPos[i * 3 + 2] = (Math.random() - 0.5) * 450;

    const col = colors[Math.floor(Math.random() * colors.length)];
    pCols[i * 3] = col.r;
    pCols[i * 3 + 1] = col.g;
    pCols[i * 3 + 2] = col.b;
  }

  pGeo.setAttribute('position', new THREE.BufferAttribute(pPos, 3));
  pGeo.setAttribute('color', new THREE.BufferAttribute(pCols, 3));

  const pMat = new THREE.PointsMaterial({
    size: 2.6,
    vertexColors: true,
    transparent: true,
    opacity: 0.8
  });
  const dataParticles = new THREE.Points(pGeo, pMat);
  scene.add(dataParticles);

  // Mouse interaction
  let mouseX = 0, mouseY = 0;
  window.addEventListener('mousemove', (e) => {
    mouseX = (e.clientX / window.innerWidth - 0.5) * 2;
    mouseY = (e.clientY / window.innerHeight - 0.5) * 2;
  });

  // Animation Loop with Smooth Camera Fly-Through
  let clock = 0;
  function animate() {
    requestAnimationFrame(animate);
    clock += 0.016;

    camera.position.x += (targetCamX + mouseX * 6 - camera.position.x) * 0.045;
    camera.position.y += (targetCamY - mouseY * 5 - camera.position.y) * 0.045;
    camera.position.z += (targetCamZ - camera.position.z) * 0.045;

    if (neuralCore) {
      const p = 1 + Math.sin(clock * 3) * 0.09;
      neuralCore.scale.set(p, p, p);
      neuralCore.rotation.y += 0.012;
      neuralCore.rotation.x += 0.008;
    }

    statusLeds.forEach(l => {
      const b = (Math.sin(clock * 5 + l.phase) > 0.25) ? 1 : 0.2;
      l.mesh.scale.set(b, b, b);
    });

    const pos = pGeo.attributes.position.array;
    for (let i = 0; i < pCount; i++) {
      pos[i * 3 + 2] += 0.8;
      if (pos[i * 3 + 2] > 200) pos[i * 3 + 2] = -250;
    }
    pGeo.attributes.position.needsUpdate = true;

    camera.lookAt(0, targetLookY, targetCamZ - 100);
    renderer.render(scene, camera);
  }
  animate();

  window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });
}

/* ---------------- 2. SCROLL CHOREOGRAPHY, SETTLE PHYSICS & DROPDOWN TICKER ---------------- */
const SECTIONS_CONFIG = [
  {
    id: "hero",
    label: "01 // HERO ARCHITECTURE",
    camX: 0, camY: 15, camZ: 220, lookY: 0,
    primary: "#00e5c9", secondary: "#ffffff",
    glow: "rgba(0, 229, 201, 0.35)",
    grad: "linear-gradient(135deg, #00e5c9 0%, #ffffff 100%)",
    ambient: "radial-gradient(circle at 50% 30%, rgba(0, 229, 201, 0.18) 0%, rgba(0, 229, 201, 0.04) 45%, transparent 70%)"
  },
  {
    id: "prompt-engineering",
    label: "02 // PROMPT ENGINEERING",
    camX: 25, camY: 35, camZ: 75, lookY: 30,
    primary: "#00e5c9", secondary: "#ffffff",
    glow: "rgba(0, 229, 201, 0.35)",
    grad: "linear-gradient(135deg, #00e5c9 0%, #ffffff 100%)",
    ambient: "radial-gradient(circle at 60% 40%, rgba(0, 229, 201, 0.18) 0%, rgba(0, 229, 201, 0.04) 48%, transparent 70%)"
  },
  {
    id: "experience",
    label: "03 // PANAPPS & JIO WORK",
    camX: 42, camY: -5, camZ: 40, lookY: -10,
    primary: "#00e5c9", secondary: "#ffffff",
    glow: "rgba(0, 229, 201, 0.35)",
    grad: "linear-gradient(135deg, #00e5c9 0%, #ffffff 100%)",
    ambient: "radial-gradient(circle at 40% 40%, rgba(0, 229, 201, 0.18) 0%, rgba(0, 229, 201, 0.04) 48%, transparent 70%)"
  },
  {
    id: "ai-workloads",
    label: "04 // AUTONOMOUS AI SYSTEMS",
    camX: -30, camY: 20, camZ: 60, lookY: 15,
    primary: "#00e5c9", secondary: "#ffffff",
    glow: "rgba(0, 229, 201, 0.35)",
    grad: "linear-gradient(135deg, #00e5c9 0%, #ffffff 100%)",
    ambient: "radial-gradient(circle at 50% 50%, rgba(0, 229, 201, 0.18) 0%, rgba(0, 229, 201, 0.04) 50%, transparent 70%)"
  },
  {
    id: "cicd-engine",
    label: "05 // 5-STAGE CI/CD ENGINE",
    camX: 0, camY: -8, camZ: 50, lookY: -8,
    primary: "#00e5c9", secondary: "#ffffff",
    glow: "rgba(0, 229, 201, 0.35)",
    grad: "linear-gradient(135deg, #00e5c9 0%, #ffffff 100%)",
    ambient: "radial-gradient(circle at 50% 40%, rgba(0, 229, 201, 0.18) 0%, rgba(0, 229, 201, 0.04) 50%, transparent 70%)"
  },
  {
    id: "dual-os",
    label: "06 // DUAL OS MASTERY",
    camX: -38, camY: 0, camZ: 85, lookY: 0,
    primary: "#00e5c9", secondary: "#ffffff",
    glow: "rgba(0, 229, 201, 0.35)",
    grad: "linear-gradient(135deg, #00e5c9 0%, #ffffff 100%)",
    ambient: "radial-gradient(circle at 50% 40%, rgba(0, 229, 201, 0.18) 0%, rgba(0, 229, 201, 0.04) 50%, transparent 70%)"
  },
  {
    id: "skills",
    label: "07 // TECHNICAL SKILLS",
    camX: 35, camY: 10, camZ: 100, lookY: 5,
    primary: "#00e5c9", secondary: "#ffffff",
    glow: "rgba(0, 229, 201, 0.35)",
    grad: "linear-gradient(135deg, #00e5c9 0%, #ffffff 100%)",
    ambient: "radial-gradient(circle at 60% 50%, rgba(0, 229, 201, 0.18) 0%, rgba(0, 229, 201, 0.04) 50%, transparent 70%)"
  },
  {
    id: "credentials",
    label: "08 // AZ-104 & CCNA CERTS",
    camX: -25, camY: 18, camZ: 125, lookY: 10,
    primary: "#00e5c9", secondary: "#ffffff",
    glow: "rgba(0, 229, 201, 0.35)",
    grad: "linear-gradient(135deg, #00e5c9 0%, #ffffff 100%)",
    ambient: "radial-gradient(circle at 40% 50%, rgba(0, 229, 201, 0.18) 0%, rgba(0, 229, 201, 0.04) 50%, transparent 70%)"
  },
  {
    id: "terminal",
    label: "09 // OPERATOR CLI CONSOLE",
    camX: 0, camY: 15, camZ: 140, lookY: 5,
    primary: "#00e5c9", secondary: "#ffffff",
    glow: "rgba(0, 229, 201, 0.35)",
    grad: "linear-gradient(135deg, #00e5c9 0%, #ffffff 100%)",
    ambient: "radial-gradient(circle at 50% 60%, rgba(0, 229, 201, 0.18) 0%, rgba(0, 229, 201, 0.04) 50%, transparent 70%)"
  },
  {
    id: "contact",
    label: "10 // DIRECT CONTACT DECK",
    camX: 0, camY: 25, camZ: 110, lookY: 15,
    primary: "#00e5c9", secondary: "#ffffff",
    glow: "rgba(0, 229, 201, 0.35)",
    grad: "linear-gradient(135deg, #00e5c9 0%, #ffffff 100%)",
    ambient: "radial-gradient(circle at 50% 50%, rgba(0, 229, 201, 0.18) 0%, rgba(0, 229, 201, 0.04) 50%, transparent 70%)"
  }
];

let lastActiveIndex = -1;
let currentReelY = 0;
let targetReelY = 0;
const REEL_ITEM_HEIGHT = 20; // Exact pixel height of each ticker item

function initScrollSettlePhysics() {
  const ambientBg = document.querySelector('.ambient-dynamic-glow');
  const sections = SECTIONS_CONFIG.map(cfg => ({
    cfg: cfg,
    el: document.getElementById(cfg.id)
  })).filter(s => s.el !== null);

  const reelEl = document.getElementById('dropdown-ticker-reel');
  const tickerItems = reelEl ? reelEl.querySelectorAll('.dropdown-ticker-item') : [];
  const menuItems = document.querySelectorAll('.nav-dropdown-item');

  function updateScrollPositions() {
    const vHeight = window.innerHeight;
    const vCenter = vHeight * 0.45;
    const scrollY = window.pageYOffset || document.documentElement.scrollTop;
    const vFocus = scrollY + vCenter;

    const n = sections.length;
    if (n === 0) return;

    // A. CALCULATE FRACTIONAL SCROLL INDEX ACROSS ALL SECTIONS
    let fracIndex = 0;
    const sectionCenters = sections.map(s => {
      const rect = s.el.getBoundingClientRect();
      return scrollY + rect.top + rect.height * 0.45;
    });

    if (vFocus <= sectionCenters[0]) {
      fracIndex = 0;
    } else if (vFocus >= sectionCenters[n - 1]) {
      fracIndex = n - 1;
    } else {
      for (let i = 0; i < n - 1; i++) {
        const cA = sectionCenters[i];
        const cB = sectionCenters[i + 1];
        if (vFocus >= cA && vFocus <= cB) {
          const span = Math.max(1, cB - cA);
          fracIndex = i + (vFocus - cA) / span;
          break;
        }
      }
    }

    // Target reel position in pixels (moves upward continuously as you scroll down)
    targetReelY = -fracIndex * REEL_ITEM_HEIGHT;

    // Active integer section index (closest to current focus)
    const activeIdx = Math.max(0, Math.min(n - 1, Math.round(fracIndex)));

    // B. KINETIC TEXT & CARD SETTLING FOR EVERY SECTION ON THE PAGE
    sections.forEach((item, index) => {
      const rect = item.el.getBoundingClientRect();
      const sCenter = rect.top + rect.height * 0.4;
      const normDist = (sCenter - vCenter) / (vHeight * 0.55);
      const clamped = Math.max(-1.3, Math.min(1.3, normDist));

      // Elements inside this section settle into position
      const settleBlocks = item.el.querySelectorAll('.scroll-settle');
      settleBlocks.forEach((block, bIdx) => {
        const stagger = (bIdx % 4) * 0.05;
        const targetY = clamped * (28 + stagger * 14); // Moves by up to 28-36px then settles to 0
        const targetRotX = clamped * -5; // Subtle 3D tilt settling to 0deg
        const targetOpacity = Math.max(0.32, 1 - Math.abs(clamped) * 0.42);

        block.style.transform = `translate3d(0, ${targetY.toFixed(1)}px, 0) rotateX(${targetRotX.toFixed(1)}deg)`;
        block.style.opacity = targetOpacity.toFixed(2);
      });
    });

    // C. UPDATE ACTIVE SECTION STATE, COLORS & 3D LIGHTS WHEN CROSSING SECTION THRESHOLD
    if (activeIdx !== lastActiveIndex) {
      lastActiveIndex = activeIdx;
      const activeConfig = sections[activeIdx].cfg;

      // 1. Update 3D Camera Targets
      targetCamX = activeConfig.camX;
      targetCamY = activeConfig.camY;
      targetCamZ = activeConfig.camZ;
      targetLookY = activeConfig.lookY;

      // 2. Update Dynamic Color CSS Tokens (Strictly NO VIOLET)
      const root = document.documentElement;
      root.style.setProperty('--theme-primary', activeConfig.primary);
      root.style.setProperty('--theme-secondary', activeConfig.secondary);
      root.style.setProperty('--theme-glow', activeConfig.glow);
      root.style.setProperty('--theme-grad', activeConfig.grad);
      root.style.setProperty('--theme-border', activeConfig.glow.replace('0.35', '0.45').replace('0.38', '0.48').replace('0.4', '0.48'));

      // 3. Update Ambient Glow
      if (ambientBg) {
        ambientBg.style.background = activeConfig.ambient + ", linear-gradient(180deg, rgba(0, 0, 0, 0.7) 0%, rgba(0, 0, 0, 0.92) 50%, #000000 100%)";
      }

      // 4. Update Three.js Dynamic Lights
      if (dynamicLight1) dynamicLight1.color.set(activeConfig.primary);
      if (dynamicLight2) dynamicLight2.color.set(activeConfig.secondary);

      // 5. Update Active Classes on Ticker Items
      tickerItems.forEach((it, idx) => {
        it.classList.toggle('active-item', idx === activeIdx);
      });

      // 6. Update Active Classes in Dropdown Menu
      menuItems.forEach((mi, idx) => {
        mi.classList.toggle('active', idx === activeIdx);
      });
    }
  }

  // D. PHYSICS ANIMATION LOOP FOR ULTRA-SMOOTH REEL SETTLING
  function renderReelPhysics() {
    requestAnimationFrame(renderReelPhysics);
    // Smooth lerp: reel follows scroll and settles into exact slot
    currentReelY += (targetReelY - currentReelY) * 0.14;
    if (reelEl) {
      reelEl.style.transform = `translate3d(0, ${currentReelY.toFixed(2)}px, 0)`;
    }
  }
  renderReelPhysics();

  window.addEventListener('scroll', updateScrollPositions, { passive: true });
  window.addEventListener('resize', updateScrollPositions, { passive: true });
  updateScrollPositions();
}

/* ---------------- 3. SECTION QUICK-JUMP DROPDOWN MENU ---------------- */
function initSectionDropdown() {
  const trigger = document.getElementById('nav-dropdown-trigger');
  const menu = document.getElementById('nav-dropdown-menu');
  if (!trigger || !menu) return;

  trigger.addEventListener('click', (e) => {
    e.stopPropagation();
    const isOpen = menu.classList.toggle('open');
    trigger.classList.toggle('open-active', isOpen);
  });

  document.addEventListener('click', () => {
    menu.classList.remove('open');
    trigger.classList.remove('open-active');
  });

  const items = menu.querySelectorAll('.nav-dropdown-item');
  items.forEach(it => {
    it.addEventListener('click', () => {
      menu.classList.remove('open');
      trigger.classList.remove('open-active');
    });
  });
}

/* ---------------- 4. PROMPT ENGINEERING STUDIO ---------------- */
const PROMPT_TEMPLATES = {
  react: {
    title: "FRIDAY Local ReAct Tool Calling Architecture",
    spec: "Model: Ollama (Llama 3.2 3B) • Context: 128k • Tool Schema: Strict JSON",
    prompt: `You are FRIDAY, an autonomous system engineer operating locally on Windows 11.
You have access to the following local runtime tools:
1. run_powershell(command: string) -> stdout, stderr
2. inspect_zabbix_telemetry(host: string, metric: string) -> float
3. trigger_tts_voice(text: string) -> None

Always reason step-by-step using this strict format:
Thought: Detail your reasoning and why this action is required.
Action: {"tool": "run_powershell", "args": {"command": "Get-Service panapps-service"}}
Observation: Wait for tool output.
... (repeat until verified)
Final Answer: Deliver a crisp executive conclusion to the engineer.`,
    output: `Thought: The engineer wants to verify the cluster daemon status before running the CI/CD pipeline.
Action: {"tool": "run_powershell", "args": {"command": "Get-Service panapps-worker"}}
Observation: Status: Running | DisplayName: PanApps Worker Daemon | StartType: Automatic
Thought: Service is healthy. I will trigger neural audio notification and confirm.
Action: {"tool": "trigger_tts_voice", "args": {"text": "PanApps worker daemon verified active."}}
Final Answer: All cluster services operational at 99.9% SLA. Ready for pipeline dispatch.`
  },
  synthesis: {
    title: "Tech News Executive Hype-Free Extraction Prompt",
    spec: "Model: Gemini 3.6 Flash • Fallback: Gemini 2.0 • Output: Markdown Table",
    prompt: `You are an elite DevOps Intelligence Analyst. 
Analyze the provided 8 raw technical feeds from HackerNews, AWS Architecture, and Kubernetes SIG.

Extraction Rules:
1. Strip all marketing fluff, hype words, and vendor pitch jargon.
2. Extract only: Architectural Changes, Vulnerability CVEs, Breaking Changes, and Benchmark Metrics.
3. Formulate output strictly adhering to this markdown structure:
| Topic | Source | Architectural Impact | Critical Takeaway |
4. Do not include conversational preambles or sign-offs.`,
    output: `| Topic | Source | Architectural Impact | Critical Takeaway |
| :--- | :--- | :--- | :--- |
| Kubelet Memory Throttle | K8s SIG | cgroups v2 swap limit accounting | Prevents OOM cascade on node spikes |
| AWS IAM Session Tags | AWS Blog | External OIDC federated attributes | Eliminates hardcoded role assumptions |
| Python 3.13 JIT | Python Core | Experimental tier-2 bytecode JIT | 8-12% throughput boost on API handlers |`
  },
  guardrails: {
    title: "Anti-Hallucination & JSON Schema Output Enforcement",
    spec: "Grammar: Deterministic JSON Schema • Zero Unescaped Strings",
    prompt: `SYSTEM: You are an immutable JSON generator for Kubernetes manifest generation.
You must output a single valid JSON object strictly matching this schema:
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "type": "object",
  "properties": {
    "appName": { "type": "string" },
    "replicas": { "type": "integer", "minimum": 2 },
    "resources": {
      "type": "object",
      "properties": {
        "cpuLimit": { "type": "string" },
        "memLimit": { "type": "string" }
      },
      "required": ["cpuLimit", "memLimit"]
    }
  },
  "required": ["appName", "replicas", "resources"]
}
DO NOT output any commentary, notes, or backticks outside the JSON body.`,
    output: `{
  "appName": "panapps-auth-prod",
  "replicas": 3,
  "resources": {
    "cpuLimit": "500m",
    "memLimit": "512Mi"
  }
}`
  }
};

function initPromptStudio() {
  const buttons = document.querySelectorAll('.studio-btn');
  buttons.forEach(btn => {
    btn.addEventListener('click', () => {
      buttons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const key = btn.getAttribute('data-prompt');
      loadPromptTemplate(key);
    });
  });
}

function loadPromptTemplate(key) {
  const data = PROMPT_TEMPLATES[key];
  if (!data) return;

  const promptEl = document.getElementById('studio-prompt-code');
  const outputEl = document.getElementById('studio-output-code');
  const specEl = document.getElementById('studio-spec-badge');

  if (promptEl) promptEl.textContent = data.prompt;
  if (outputEl) outputEl.textContent = data.output;
  if (specEl) specEl.textContent = data.spec;
}

/* ---------------- 5. WORK EXPERIENCE TABS ---------------- */
function initExperienceTabs() {
  const tabs = document.querySelectorAll('.exp-tab-btn');
  const panels = document.querySelectorAll('.exp-content-panel');

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => t.classList.remove('active'));
      panels.forEach(p => p.classList.remove('active'));

      tab.classList.add('active');
      const target = tab.getAttribute('data-target');
      const p = document.getElementById(target);
      if (p) p.classList.add('active');
    });
  });
}

/* ---------------- 6. CI/CD ENGINE STEPPER & RUNNER ---------------- */
const CICD_STAGES = [
  {
    step: "01",
    label: "Source & Branching",
    title: "Stage 1: Multi-Branch Git Orchestration & PR Gating",
    desc: "Implemented strict Git branching strategies (GitFlow / trunk-based PR gating) at PanApps International Pvt. Ltd. Code commits trigger automated webhooks that isolate branches, run linter checks, and prevent broken merges into staging or production.",
    metric: "0% Unverified Merges • Conflict-Free Parallel Sprints",
    snippet: "# Git Branching Strategy & Webhook Runner\ngit checkout -b feature/auth-service\ngit commit -m 'feat: optimized token verification'\ngit push origin feature/auth-service\n# Automated GitLab / GitHub webhook triggers Jenkins PR pipeline"
  },
  {
    step: "02",
    label: "Automated Build & Test",
    title: "Stage 2: Declarative Jenkinsfile Compilation & Unit Testing",
    desc: "Authored robust declarative Jenkinsfiles that provision ephemeral build agents, trigger automated unit testing suites, and perform static analysis. Increased overall deployment frequency by 30% across engineering squads.",
    metric: "+30% Release Cadence • Automated Test Pass Gate",
    snippet: "pipeline {\n  agent { label 'docker-runner' }\n  stages {\n    stage('Test') {\n      steps {\n        sh 'pytest --cov=app tests/'\n        sh 'flake8 app/'\n      }\n    }\n  }\n}"
  },
  {
    step: "03",
    label: "Containerization",
    title: "Stage 3: Hardened Multi-Stage Docker Microservice Builds",
    desc: "Standardized microservices into lightweight, security-scanned Docker images using multi-stage builds. Reduced container base footprint by 75% and integrated vulnerability scanning before pushing to container registries.",
    metric: "75% Image Size Reduction • Vulnerability Scanned",
    snippet: "# Multi-stage Docker build for production\nFROM python:3.12-alpine AS builder\nWORKDIR /build\nCOPY requirements.txt .\nRUN pip install --no-cache-dir -r requirements.txt\nFROM python:3.12-alpine\nCOPY --from=builder /usr/local /usr/local\nCMD ['python', 'main.py']"
  },
  {
    step: "04",
    label: "Orchestration",
    title: "Stage 4: Kubernetes Rolling Rollouts & Multi-Cloud (Azure & AWS)",
    desc: "Provisioned and administered infrastructure across Azure and AWS cloud environments. Automated Kubernetes deployments with zero-downtime rolling updates, resource quotas, and liveness/readiness health probes.",
    metric: "Zero Downtime Deployments • Dynamic Auto-Scaling",
    snippet: "apiVersion: apps/v1\nkind: Deployment\nmetadata:\n  name: panapps-service-prod\nspec:\n  replicas: 3\n  strategy:\n    type: RollingUpdate\n    rollingUpdate:\n      maxUnavailable: 0\n      maxSurge: 1"
  },
  {
    step: "05",
    label: "Observability & SLA",
    title: "Stage 5: 24/7 Zabbix Telemetry & Automated Remediation",
    desc: "Configured Zabbix monitoring agents with custom telemetry metrics and alerts. Combined with automated Python remediation scripts and disaster recovery backups to maintain a verified 99.9% uptime SLA.",
    metric: "99.9% Uptime SLA • 22% Faster MTTR",
    snippet: "# Zabbix agent monitoring trigger & auto-healing daemon\nimport psutil, subprocess\nif psutil.virtual_memory().percent > 92:\n    subprocess.run(['systemctl', 'restart', 'panapps-worker'])\n    # Alert dispatched to engineering command channel"
  }
];

function initCicdEngine() {
  const steps = document.querySelectorAll('.cicd-step-card');
  steps.forEach((s, idx) => {
    s.addEventListener('click', () => {
      showCicdStage(idx);
    });
  });
}

function showCicdStage(idx) {
  const data = CICD_STAGES[idx];
  if (!data) return;

  const steps = document.querySelectorAll('.cicd-step-card');
  steps.forEach((s, i) => {
    s.classList.toggle('active', i === idx);
  });

  const heading = document.getElementById('inspect-title');
  const desc = document.getElementById('inspect-desc');
  const metric = document.getElementById('inspect-metric');
  const snippet = document.getElementById('inspect-snippet');

  if (heading) heading.textContent = data.title;
  if (desc) desc.textContent = data.desc;
  if (metric) metric.innerHTML = data.metric;
  if (snippet) snippet.textContent = data.snippet;
}

window.runCicdSimulation = function() {
  let cur = 0;
  const btn = document.getElementById('btn-run-sim');
  if (btn) {
    btn.disabled = true;
    btn.textContent = "⚙️ Executing Full Pipeline...";
  }

  const interval = setInterval(() => {
    showCicdStage(cur);
    cur++;
    if (cur >= CICD_STAGES.length) {
      clearInterval(interval);
      if (btn) {
        btn.disabled = false;
        btn.textContent = "▶ Run Full Pipeline Simulation";
      }
    }
  }, 1200);
};

/* ---------------- 7. 3D CARD TILT EFFECT ---------------- */
function init3dCardTilt() {
  const cards = document.querySelectorAll('.card-3d-tilt');
  cards.forEach(card => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;

      const rotateX = ((y - centerY) / centerY) * -6;
      const rotateY = ((x - centerX) / centerX) * 6;

      card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
    });

    card.addEventListener('mouseleave', () => {
      card.style.transform = `perspective(1000px) rotateX(0deg) rotateY(0deg)`;
    });
  });
}

/* ---------------- 8. OPERATOR CONSOLE CLI ---------------- */
const CLI_COMMANDS = {
  help: () => [
    "=== OPERATOR CONSOLE CLI (sumeshmohan) ===",
    "Available commands:",
    "  prompts     - Inspect advanced prompt engineering architectures & ReAct loops",
    "  experience  - Full-strength PanApps & Reliance Jio career history",
    "  panapps     - Detailed 10 pillars of DevOps engineering at PanApps",
    "  jio         - Fiber optics & network technician deliverables at Jio",
    "  ai          - Autonomous AI systems & agent workflows under active development",
    "  friday      - FRIDAY voice-enabled autonomous desktop agent specs",
    "  technews    - 24/7 Render cloud news intelligence bot architecture",
    "  skills      - Verified skills matrix (Cloud, DevOps, OS, Automation)",
    "  cicd        - 5-stage Jenkins pipeline metrics (+30% release frequency)",
    "  linux       - Linux administration (Ubuntu, CentOS, RHEL, systemd, LVM)",
    "  windows     - Windows Server, VMware ESXi, Active Directory, Office 365",
    "  python      - Python automation daemons (15 hours saved monthly)",
    "  certs       - Microsoft Azure AZ-104, Cisco CCNA, DCA credentials",
    "  uptime      - Verified 99.9% uptime SLA production record",
    "  contact     - Direct communication channels (Email, Phone, LinkedIn)",
    "  clear       - Clear the console screen"
  ],
  prompts: () => [
    "ADVANCED PROMPT ENGINEERING CAPABILITIES:",
    "  1. ReAct Architecture: Multi-turn Thought -> Action -> Observation -> Final Answer loops.",
    "  2. JSON Schema Output: Zero unescaped strings, deterministic grammar-constrained parsing.",
    "  3. Context Compression: Prompt routing, context distillation, and minimal token overhead.",
    "  4. Anti-Hallucination: Grounded system instructions enforcing verifiable factual outputs."
  ],
  experience: () => [
    "WORK EXPERIENCE RECORD (FULL STRENGTH):",
    "1. DevOps Engineer @ PanApps International Pvt. Ltd. (Jan 2022 - Present | Muttom, Aluva)",
    "   - Developed automated Jenkins CI/CD pipelines, increasing release frequency by 30%.",
    "   - Architected multi-team Git branching strategies for seamless parallel sprints.",
    "   - Administered Azure & AWS cloud resources, auto-scaling, and cost optimization.",
    "   - Hardened Linux & Windows Server environments, guaranteeing 99.9% uptime SLA.",
    "   - Deployed Zabbix real-time monitoring, slashing incident MTTR by 22%.",
    "   - Built Python automation daemons, eliminating 15 hours of manual patching monthly.",
    "   - Containerized microservices via multi-stage Docker & managed Kubernetes rollouts.",
    "2. Network Technician @ Reliance Jio (Aug 2021 - Jan 2022 | Kollam)",
    "   - Conducted telecom optical surveys and validated infrastructure deliverables.",
    "   - Deployed and configured IP set-top devices, ONTs, and enterprise access points."
  ],
  panapps: () => [
    "PANAPPS INTERNATIONAL PVT. LTD. — KEY RESPONSIBILITIES:",
    "  * CI/CD Automation   : Declarative Jenkinsfiles, automated bash testing runners.",
    "  * Cloud Governance   : Microsoft Azure & AWS VM/VPC lifecycle management.",
    "  * Dual OS Management : Linux (Ubuntu/CentOS) & Windows Server 2016-2022.",
    "  * Telemetry & Health : Enterprise Zabbix agents, custom alerts, 22% faster MTTR.",
    "  * Python Automation  : Patching scripts, automated backup sync (15h/month saved).",
    "  * High Availability  : Automated backup scheduling & disaster recovery (99.9% SLA).",
    "  * SaaS & Identity    : Office 365 tenant administration & DNS uptime management."
  ],
  jio: () => [
    "RELIANCE JIO — FIBER OPTICS & INFRASTRUCTURE:",
    "  * Optical Surveys    : Site deliverables verification, signal attenuation checks.",
    "  * Hardware Deploy    : Installed and maintained ONTs, IP set-top boxes, and APs.",
    "  * Laser Calibration  : Cross-departmental fiber optic laser systems installation."
  ],
  ai: () => [
    "AUTONOMOUS AI SYSTEMS & WORKLOADS (ACTIVE DEVELOPMENT):",
    "  1. FRIDAY Desktop Agent    : Local LLM (Ollama Llama 3.2), Edge-TTS, tool execution.",
    "  2. Tech World News Bot     : 24/7 Render daemon, Telegram Webhooks, Gemini API fallback.",
    "  3. Keepalive Pinger Engine : 9-minute automated background thread defeating sleep.",
    "  4. Knowledge Compounding   : Automated markdown synthesis & Git auto-commit bridge."
  ],
  friday: () => [
    "FRIDAY AUTONOMOUS DESKTOP AGENT:",
    "  * Runtime: Python 3.12 on Windows 11 with local GPU acceleration.",
    "  * LLM Engine: Ollama running llama3.2:latest for rapid offline reasoning.",
    "  * Voice: Neural voice synthesis via Microsoft Edge-TTS."
  ],
  technews: () => [
    "TECH WORLD NEWS & INTELLIGENCE BOT:",
    "  * Cloud Host: 24/7 on Render Cloud in Docker container.",
    "  * Inbound: Telegram Webhooks (/webhook) for instant wakeups.",
    "  * Intelligence: Multi-model Gemini fallback (3.6-flash -> 2.0-flash -> 1.5-flash)."
  ],
  skills: () => [
    "VERIFIED TECHNICAL SKILLS MATRIX (RESUME SOURCE):",
    "  * Cloud & DevOps : Azure, AWS, Docker, Kubernetes, Terraform, Jenkins",
    "  * Scripting      : Python, Bash, PowerShell, Azure CLI",
    "  * Version Control: Git, GitLab CI/CD",
    "  * Administration : Linux (Ubuntu, CentOS, RHEL), Windows Server, VMware ESXi",
    "  * Databases      : MySQL, MongoDB, Microsoft SQL Server",
    "  * Networking     : Cisco CCNA, TCP/IP, DNS, DHCP, VLANs, Fiber Optics"
  ],
  cicd: () => [
    "CI/CD PIPELINE ARCHITECTURE (PANAPPS):",
    "  * Multi-branch Jenkins pipeline with declarative stages.",
    "  * Docker multi-stage image packaging (75% size reduction).",
    "  * Rolling zero-downtime rollouts on Kubernetes & cloud VMs."
  ],
  linux: () => [
    "LINUX SYSTEM ADMINISTRATION:",
    "  * Distros: Ubuntu Server, CentOS, Red Hat Enterprise Linux (RHEL).",
    "  * Core: systemd service unit authoring, SELinux policy enforcement, LVM partitions."
  ],
  windows: () => [
    "WINDOWS SERVER & ENTERPRISE INFRASTRUCTURE:",
    "  * OS: Windows Server 2016, 2019, 2022.",
    "  * Identity: Active Directory Domain Services (AD DS), Group Policy (GPO), RBAC.",
    "  * Virtualization: VMware ESXi hypervisor clusters and VM lifecycle management."
  ],
  python: () => [
    "PYTHON SCRIPTING & AUTOMATION IMPACT:",
    "  * Automated OS security updates and server package patching.",
    "  * Backup replication daemons with checksum verification (15h/month saved)."
  ],
  certs: () => [
    "VERIFIED CERTIFICATIONS & EDUCATION:",
    "  * Microsoft Certified: Azure Administrator Associate (AZ-104) [2023 - 2026]",
    "  * Cisco Certified Network Associate (CCNA) [2021 - 2024]",
    "  * Diploma in Computer Applications (DCA) [2018 - Present]",
    "  * Diploma in Electronics Engineering (82% Distinction) [SN Polytechnic College]"
  ],
  uptime: () => [
    "UPTIME & RELIABILITY SLA:",
    "  * Production Track Record: 99.9% Uptime SLA maintained across PanApps clusters.",
    "  * MTTR Improvement: 22% reduction in Mean Time To Resolution via Zabbix alerts."
  ],
  contact: () => [
    "DIRECT CONTACT CHANNELS:",
    "  * Email   : sumeshmohan696@gmail.com",
    "  * Phone   : +91-7356126353",
    "  * LinkedIn: https://www.linkedin.com/in/sumeshmohana54623",
    "  * GitHub  : https://github.com/sumeshmohan696"
  ],
  clear: () => {
    const out = document.getElementById('cli-screen');
    if (out) out.innerHTML = "";
    return [];
  }
};

function initOperatorCLI() {
  const input = document.getElementById('cli-input');
  const screen = document.getElementById('cli-screen');
  if (!input || !screen) return;

  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      const raw = input.value.trim();
      input.value = "";
      if (!raw) return;

      const echo = document.createElement('div');
      echo.className = 'echo';
      echo.textContent = "sumesh@sumeshmohan:~$ " + raw;
      screen.appendChild(echo);

      const cmd = raw.toLowerCase();
      if (CLI_COMMANDS[cmd]) {
        const lines = CLI_COMMANDS[cmd]();
        lines.forEach(line => {
          const l = document.createElement('div');
          l.className = 'out';
          l.textContent = line;
          screen.appendChild(l);
        });
      } else {
        const err = document.createElement('div');
        err.className = 'sys';
        err.style.color = '#00e5c9';
        err.textContent = "command not recognized: '" + raw + "'. Type 'help' to see valid commands.";
        screen.appendChild(err);
      }
      screen.scrollTop = screen.scrollHeight;
    }
  });
}

window.runCliFromChip = function(cmdStr) {
  const input = document.getElementById('cli-input');
  if (input) {
    input.value = cmdStr;
    input.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' }));
  }
};

/* ---------------- 9. CONTACT COPY TOAST ---------------- */
window.copyEmailToClipboard = function() {
  const email = "sumeshmohan696@gmail.com";
  navigator.clipboard.writeText(email).then(() => {
    showToastNotice("✓ Email copied to clipboard: " + email);
  }).catch(() => {
    showToastNotice("Direct email: " + email);
  });
};

function showToastNotice(msg) {
  const toast = document.getElementById('toast-notice');
  if (!toast) return;
  toast.textContent = msg;
  toast.classList.add('show');
  setTimeout(() => {
    toast.classList.remove('show');
  }, 3500);
}
