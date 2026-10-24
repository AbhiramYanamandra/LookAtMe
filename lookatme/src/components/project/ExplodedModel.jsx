"use client";

import { useEffect, useRef, useState } from "react";

/**
 * A 3D model that comes apart into layers. It starts assembled; a click (or
 * the button) lifts each layer by its `lift` from src/content/models.js, and
 * a second click puts it back, the camera swinging between `views` as it
 * goes. Hovering a part, or a layer in the list below,
 * lights the part up and names it. On touch, a tap on a part while the model
 * is apart names it instead of reassembling.
 *
 * Drawn with three.js directly (model-viewer cannot move parts on their own),
 * imported only when this mounts. The poster stands in while it loads and if
 * WebGL is unavailable. Rendering pauses while the model is off screen.
 */
const DURATION = 950;
const STAGGER = 70;
const HIGHLIGHT = 0xe8942d;
const ease = (t) => (t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2);

export function ExplodedModel({ src, poster, alt, layers, views }) {
  const stage = useRef(null);
  const tip = useRef(null);
  const api = useRef(null);
  const [status, setStatus] = useState("loading");
  const [apart, setApart] = useState(false);
  const [active, setActive] = useState(null);

  useEffect(() => {
    let disposed = false;
    let teardown = () => {};

    (async () => {
      const [THREE, { GLTFLoader }, { OrbitControls }, { RoomEnvironment }] = await Promise.all([
        import("three"),
        import("three/examples/jsm/loaders/GLTFLoader.js"),
        import("three/examples/jsm/controls/OrbitControls.js"),
        import("three/examples/jsm/environments/RoomEnvironment.js"),
      ]);
      if (disposed) return;
      const element = stage.current;
      const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;

      let renderer;
      try {
        renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
      } catch {
        setStatus("failed");
        return;
      }
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      renderer.outputColorSpace = THREE.SRGBColorSpace;
      renderer.toneMapping = THREE.NeutralToneMapping;
      element.appendChild(renderer.domElement);

      const scene = new THREE.Scene();
      const pmrem = new THREE.PMREMGenerator(renderer);
      scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
      const key = new THREE.DirectionalLight(0xfff1e0, 1.4);
      key.position.set(0.4, 1, 0.6);
      scene.add(key);

      let gltf;
      try {
        gltf = await new GLTFLoader().loadAsync(src);
      } catch {
        if (!disposed) setStatus("failed");
        renderer.dispose();
        renderer.domElement.remove();
        return;
      }
      if (disposed) {
        renderer.dispose();
        return;
      }
      const model = gltf.scene;
      scene.add(model);

      // Claim the top-most node each layer matches; every mesh below it belongs to that layer.
      const parts = layers.map((layer) => ({ layer, nodes: [], materials: [], value: 0, from: 0 }));
      const meshes = [];
      const claim = (node) => {
        const part = parts.find((candidate) => candidate.layer.match.some((prefix) => node.name.startsWith(prefix)));
        if (!part) return node.children.forEach(claim);
        part.nodes.push(node);
        node.userData.base = node.position.y;
        // Own copies of the materials, so lighting up one layer leaves the rest alone.
        const copies = new Map();
        node.traverse((child) => {
          if (!child.isMesh) return;
          if (!copies.has(child.material)) copies.set(child.material, child.material.clone());
          child.material = copies.get(child.material);
          child.userData.part = part;
          meshes.push(child);
        });
        part.materials.push(...copies.values());
      };
      claim(model);

      const place = () => {
        for (const part of parts) for (const node of part.nodes) node.position.y = node.userData.base + (part.layer.lift / 1000) * part.value;
      };
      const boundsAt = (value) => {
        for (const part of parts) part.value = value;
        place();
        model.updateMatrixWorld(true);
        return new THREE.Box3().setFromObject(model).getBoundingSphere(new THREE.Sphere());
      };
      const exploded = boundsAt(1);
      const assembled = boundsAt(0);

      const camera = new THREE.PerspectiveCamera(28, 1, 0.001, 10);
      const controls = new OrbitControls(camera, renderer.domElement);
      controls.enableZoom = false;
      controls.enablePan = false;
      controls.enableDamping = true;
      controls.minPolarAngle = THREE.MathUtils.degToRad(10);
      controls.maxPolarAngle = THREE.MathUtils.degToRad(172);
      controls.autoRotate = !reduced;
      const angles = ([around, down]) => [THREE.MathUtils.degToRad(down), THREE.MathUtils.degToRad(around)];
      controls.autoRotateSpeed = 0.5;
      // Vertical swipes still scroll the page; sideways drags rotate the model.
      renderer.domElement.style.touchAction = "pan-y";
      const direction = new THREE.Vector3().setFromSphericalCoords(1, ...angles(views.assembled));

      // Distance that fits a sphere of radius r in both the vertical and horizontal field of view.
      const fit = (radius) => {
        const vertical = THREE.MathUtils.degToRad(camera.fov) / 2;
        const horizontal = Math.atan(Math.tan(vertical) * camera.aspect);
        return (radius * 1.08) / Math.sin(Math.min(vertical, horizontal));
      };
      const resize = () => {
        const { width, height } = element.getBoundingClientRect();
        if (!width || !height) return;
        renderer.setSize(width, height, false);
        camera.aspect = width / height;
        camera.updateProjectionMatrix();
      };
      resize();

      // Taking apart and putting back: each layer eases on its own, a beat apart.
      let target = 0;
      let started = 0;
      const view = new THREE.Spherical();
      let swing = null;
      const setTarget = (value) => {
        target = value;
        started = performance.now();
        for (const part of parts) part.from = part.value;
        // Taking apart turns to the `apart` view; putting back only tilts up, keeping where the visitor turned it.
        view.setFromVector3(camera.position.clone().sub(controls.target));
        const [phi, theta] = angles(value === 1 ? views.apart : [THREE.MathUtils.radToDeg(view.theta), views.assembled[1]]);
        swing = { phi: view.phi, theta: view.theta, dPhi: phi - view.phi, dTheta: ((((theta - view.theta + Math.PI) % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI)) - Math.PI };
      };

      // Lighting up a layer and placing its label.
      let current = null;
      let anchored = false;
      const light = (part) => {
        for (const candidate of parts) {
          for (const material of candidate.materials) {
            material.emissive?.setHex(candidate === part ? HIGHLIGHT : 0x000000);
            material.emissiveIntensity = candidate === part ? 0.45 : 1;
          }
        }
      };
      const show = (part, at) => {
        if (part !== current) {
          current = part;
          light(part);
          setActive(part?.layer.id ?? null);
        }
        controls.autoRotate = !reduced && !part && target === 0;
        renderer.domElement.style.cursor = part ? "pointer" : "";
        anchored = Boolean(part) && !at;
        if (part && at) moveTip(at.x, at.y);
      };
      const moveTip = (x, y) => {
        const box = tip.current;
        if (!box) return;
        const { width, height } = element.getBoundingClientRect();
        const left = Math.min(Math.max(x, box.offsetWidth / 2 + 8), width - box.offsetWidth / 2 - 8);
        const flip = y - box.offsetHeight - 18 < 0;
        box.style.transform = `translate(${left}px, ${Math.min(y, height)}px) translate(-50%, ${flip ? "18px" : "calc(-100% - 18px)"})`;
      };
      const anchor = new THREE.Vector3();
      const anchorBox = new THREE.Box3();
      const placeTipAtPart = () => {
        anchorBox.makeEmpty();
        for (const node of current.nodes) anchorBox.expandByObject(node);
        anchorBox.getCenter(anchor).project(camera);
        const { width, height } = element.getBoundingClientRect();
        moveTip(((anchor.x + 1) / 2) * width, ((1 - anchor.y) / 2) * height);
      };

      const toggle = (value = target === 1 ? 0 : 1) => {
        setTarget(value);
        setApart(value === 1);
        if (value === 0) show(null);
        controls.autoRotate = !reduced && value === 0;
      };

      const raycaster = new THREE.Raycaster();
      const pointer = new THREE.Vector2();
      const hit = (event) => {
        const rect = renderer.domElement.getBoundingClientRect();
        pointer.set(((event.clientX - rect.left) / rect.width) * 2 - 1, -((event.clientY - rect.top) / rect.height) * 2 + 1);
        raycaster.setFromCamera(pointer, camera);
        const [first] = raycaster.intersectObjects(meshes, false);
        return { part: first?.object.userData.part ?? null, x: event.clientX - rect.left, y: event.clientY - rect.top };
      };
      const onMove = (event) => {
        if (event.pointerType !== "mouse" || event.buttons) return;
        const { part, x, y } = hit(event);
        show(part, { x, y });
      };
      const onLeave = (event) => {
        if (event.pointerType === "mouse") show(null);
      };
      let down = null;
      const onDown = (event) => {
        down = { x: event.clientX, y: event.clientY, time: performance.now() };
      };
      const onUp = (event) => {
        if (!down) return;
        const moved = Math.hypot(event.clientX - down.x, event.clientY - down.y);
        const quick = performance.now() - down.time < 600;
        down = null;
        if (moved > 6 || !quick) return;
        if (event.pointerType !== "mouse" && target === 1) {
          const { part } = hit(event);
          if (part && part !== current) return show(part);
        }
        toggle();
      };
      const canvas = renderer.domElement;
      canvas.addEventListener("pointermove", onMove);
      canvas.addEventListener("pointerleave", onLeave);
      canvas.addEventListener("pointerdown", onDown);
      canvas.addEventListener("pointerup", onUp);

      api.current = {
        toggle,
        focus: (id) => show(parts.find((part) => part.layer.id === id) ?? null),
      };

      const centre = new THREE.Vector3();
      const loop = (now) => {
        const span = DURATION + STAGGER * (parts.length - 1);
        for (const [index, part] of parts.entries()) {
          // Top layers lead when coming apart; bottom layers lead going back.
          const delay = (target === 1 ? index : parts.length - 1 - index) * STAGGER;
          const t = reduced ? 1 : Math.min(Math.max((now - started - delay) / DURATION, 0), 1);
          part.value = part.from + (target - part.from) * ease(t);
        }
        place();
        const progress = reduced ? 1 : ease(Math.min((now - started) / span, 1));
        const amount = target === 1 ? progress : 1 - progress;
        const radius = THREE.MathUtils.lerp(assembled.radius, exploded.radius, amount);
        centre.lerpVectors(assembled.center, exploded.center, amount);
        view.setFromVector3(camera.position.clone().sub(controls.target));
        if (swing) {
          view.phi = swing.phi + swing.dPhi * progress;
          view.theta = swing.theta + swing.dTheta * progress;
          if (progress === 1) swing = null;
        }
        view.radius = fit(radius);
        controls.target.copy(centre);
        camera.position.setFromSpherical(view).add(centre);
        controls.update();
        if (current && anchored) placeTipAtPart();
        renderer.render(scene, camera);
      };
      camera.position.copy(assembled.center).addScaledVector(direction, fit(assembled.radius));
      controls.target.copy(assembled.center);

      let running = false;
      const run = (on) => {
        if (on === running) return;
        running = on;
        renderer.setAnimationLoop(on ? loop : null);
      };
      const visibility = new IntersectionObserver(([entry]) => run(entry.isIntersecting));
      visibility.observe(element);
      const sizing = new ResizeObserver(resize);
      sizing.observe(element);
      run(true);
      setStatus("ready");

      teardown = () => {
        run(false);
        visibility.disconnect();
        sizing.disconnect();
        canvas.removeEventListener("pointermove", onMove);
        canvas.removeEventListener("pointerleave", onLeave);
        canvas.removeEventListener("pointerdown", onDown);
        canvas.removeEventListener("pointerup", onUp);
        controls.dispose();
        model.traverse((child) => {
          if (child.isMesh) {
            child.geometry.dispose();
            child.material.dispose();
          }
        });
        scene.environment.dispose();
        pmrem.dispose();
        renderer.dispose();
        canvas.remove();
        api.current = null;
      };
    })();

    return () => {
      disposed = true;
      teardown();
    };
  }, [src, layers]);

  const layer = layers.find((candidate) => candidate.id === active);

  return (
    <div className="xm" data-status={status} data-apart={apart || undefined}>
      <div className="xm-stage" ref={stage} role="img" aria-label={alt}>
        {status !== "ready" && (
          // eslint-disable-next-line @next/next/no-img-element
          <img className="xm-poster" src={poster} alt="" />
        )}
        <div className="xm-tip" ref={tip} aria-hidden="true" data-visible={layer ? "" : undefined}>
          {layer && (
            <>
              <strong>{layer.label}</strong>
              <span>{layer.detail}</span>
            </>
          )}
        </div>
        {status === "ready" && (
          <>
            <button type="button" className="xm-toggle" onClick={() => api.current?.toggle()}>
              {apart ? "Put it back together" : "Take it apart"}
            </button>
            <p className="xm-hint" aria-hidden="true">
              <span className="xm-hint-fine">{apart ? "Hover a part · click to reassemble" : "Click to take it apart · drag to rotate"}</span>
              <span className="xm-hint-touch">{apart ? "Tap a part to name it" : "Tap to take it apart"}</span>
            </p>
          </>
        )}
      </div>
      {status === "ready" && (
        <ol className="xm-layers" aria-label="Layers, top to bottom">
          {layers.map((item) => (
            <li key={item.id}>
              <button
                type="button"
                aria-pressed={active === item.id}
                aria-describedby={active === item.id ? "xm-detail" : undefined}
                onMouseEnter={() => api.current?.focus(item.id)}
                onMouseLeave={() => api.current?.focus(null)}
                onFocus={() => api.current?.focus(item.id)}
                onBlur={() => api.current?.focus(null)}
                onClick={() => {
                  if (!apart) api.current?.toggle(1);
                  api.current?.focus(item.id);
                }}
              >
                {item.label}
              </button>
            </li>
          ))}
        </ol>
      )}
      <p id="xm-detail" className="xm-sr" aria-live="polite">
        {layer ? `${layer.label}: ${layer.detail}` : ""}
      </p>
    </div>
  );
}
