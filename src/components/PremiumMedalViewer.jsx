import { Canvas, useFrame } from "@react-three/fiber";
import { Stage, Sparkles } from "@react-three/drei";
import { Suspense, useRef, useState } from "react";
import { useGLTF } from "@react-three/drei";
import * as THREE from "three";

const MedalModel = ({ targetRotation }) => {
  const { scene } = useGLTF("/models/Blue_Star_Badge.glb");
  const ref = useRef();
  useFrame(() => {
    if (ref.current) {
      ref.current.rotation.y +=
        (targetRotation.current - ref.current.rotation.y) * 0.05;
      ref.current.rotation.x = Math.sin(Date.now() * 0.001) * 0.05;
    }
  });

  return <primitive ref={ref} object={scene} scale={1.8} />;
};

const PremiumMedalViewer = () => {
  const targetRotation = useRef(0);
  const dragging = useRef(false);

  const handlePointerDown = () => {
    dragging.current = true;
  };

  const handlePointerUp = () => {
    dragging.current = false;
    targetRotation.current = 0;
  };

  const handlePointerMove = (e) => {
    if (dragging.current) {
      targetRotation.current += e.movementX * 0.01;
    }
  };

  return (
    <div
      style={{
        width: "100%",
        height: 140,
        borderRadius: "1rem",
        overflow: "hidden",
      }}
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
      onPointerLeave={handlePointerUp}
      onPointerMove={handlePointerMove}
    >
      <Canvas camera={{ position: [0, 0, 5], fov: 45 }}>
        <Sparkles
          count={40}
          scale={7}
          size={3}
          color="#4e6ff9"
          speed={2}
          position={[0, 0, -3]} // <<< назад по Z
        />
        <ambientLight intensity={1.2} />
        <directionalLight position={[1.2, 1.2, 4]} intensity={1} />

        <Suspense fallback={null}>
          <Stage environment="city" intensity={1} shadows={false}>
            <MedalModel targetRotation={targetRotation} />
          </Stage>
        </Suspense>
      </Canvas>
    </div>
  );
};

export default PremiumMedalViewer;
