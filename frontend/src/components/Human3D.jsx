// src/components/Human3D.jsx
import React, { useRef, useEffect } from "react";
import { useGLTF } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";



export default function Human3D({ score }) {
  const { scene } = useGLTF("/models/human.glb");
  const blink = useRef(0);

  // 🔴🟠🟢 Risk logic (UNCHANGED)
  const risk = score >= 0.8 ? "high" : score >= 0.5 ? "medium" : "low";

  const blinkColor =
    risk === "high"
      ? new THREE.Color("#ff0000")
      : risk === "medium"
      ? new THREE.Color("#ff8800")
      : new THREE.Color("#00ff00");

  //  Mesh groups (based on your console output)
  const BODY_ZONES = {
    eyes: ["mesh_0"],
    arms: ["mesh_1","mesh_2"],
    legs: ["mesh_3", "mesh_4"],
  };

  // Initialize materials safely (RUNS ONCE)
  useEffect(() => {
    scene.traverse((obj) => {
      if (obj.isMesh) {
        // Clone material to avoid shared state
        obj.material = obj.material.clone();

        // Ensure emissive exists
        obj.material.emissive = new THREE.Color("#000000");
        obj.material.emissiveIntensity = 0;

        console.log("MESH:", obj.name);
      }
    });
  }, [scene]);

  //Blink animation
  useFrame((state) => {
    blink.current = (Math.sin(state.clock.elapsedTime * 4) + 1) / 2;

    scene.traverse((obj) => {
      if (!obj.isMesh || !obj.material) return;

      let shouldBlink = false;

      if (risk === "high") {
        shouldBlink = true; // FULL BODY
      }

      if (risk === "medium") {
        shouldBlink =
          BODY_ZONES.arms.includes(obj.name) ||
          BODY_ZONES.legs.includes(obj.name);
      }

      if (risk === "low") {
        shouldBlink = BODY_ZONES.eyes.includes(obj.name);
      }

      if (shouldBlink) {
        obj.material.emissive.copy(blinkColor);
        obj.material.emissiveIntensity = blink.current;
      } else {
        obj.material.emissiveIntensity = 0;
      }
    });
  });

  return <primitive object={scene} scale={1.6} position={[0, -1, 0]} />;
}
