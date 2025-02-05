import React, { useRef, useState, useEffect, useMemo } from "react"
import * as THREE from 'three';

function Cube({parent, x, y, z}) {
    const geometry = new THREE.BoxGeometry(1, 1, 1);
    const material = new THREE.MeshBasicMaterial({ color: 'tomato' });
    const cube = new THREE.Mesh(geometry, material);
    parent.add(cube);

    return <div/>;
}




function ViewPort({}) {
    const containerRef = useRef(null);
    const scene = useMemo(() => new THREE.Scene(), []);

    useEffect(() => {
        console.log("START EFFECT");

        // 1. Set up scene, camera, and renderer
        const width = containerRef.current.clientWidth;
        const height = containerRef.current.clientHeight;
    
        // const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(
          75,            // Field of view
          width / height, 
          0.1,           // Near clipping plane
          1000           // Far clipping plane
        );
        camera.position.z = 5; // Move camera away so we can see the cube
        scene.add(camera);
        const renderer = new THREE.WebGLRenderer({ antialias: true });
        renderer.setSize(width, height);
        containerRef.current.appendChild(renderer.domElement);
    
        // 2. Create a cube
        const geometry = new THREE.BoxGeometry(1, 1, 1);
        const material = new THREE.MeshBasicMaterial({ color: 'green' });
        const cube = new THREE.Mesh(geometry, material);
        // scene.add(cube);

        const light = new THREE.AmbientLight( 0x404040 ); // soft white light
        scene.add( light );

        const light2 = new THREE.PointLight( 0x404040, 1, 100 ); // soft white light
        light2.position.set( 50, 50, 50 );
        scene.add( light2 );
        
        // scene.background = new THREE.Color().setHex( 0xff0000 );
        console.log("SCENE CONSTRUCTED.");

        // 4. Handle resizing (optional)
        const handleResize = () => {
          const newWidth = containerRef.current.clientWidth;
          const newHeight = containerRef.current.clientHeight;
          camera.aspect = newWidth / newHeight;
          camera.updateProjectionMatrix();
          renderer.setSize(newWidth, newHeight);
        };
        window.addEventListener('resize', handleResize);
        console.log("COMPLETED EFFECT");

        function animate() {
        	renderer.render( scene, camera );
        }
        renderer.setAnimationLoop( animate );
        // 5. Cleanup function
        return () => {
          // Stop animation loop
    
          // Dispose of Three.js objects
          geometry.dispose();
          material.dispose();
          renderer.dispose();
    
          // Remove event listener
          window.removeEventListener('resize', handleResize);
    
          // Remove the renderer’s canvas from the DOM
          if (containerRef.current) {
            containerRef.current.removeChild(renderer.domElement);
          }
            console.log("DESTROYED EFFECT");
        };
      }, []);

    return (
    <div 
      ref={containerRef} 
      style={{ width: '100%', height: '400px', border: '1px solid #ccc' }}
    >
        <Cube parent={scene} x={-2} y={-2} z={-2} />

    </div>
    );
}


export default ViewPort;