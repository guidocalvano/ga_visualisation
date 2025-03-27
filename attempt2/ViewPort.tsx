import React, { useRef, useState, useEffect, useMemo } from "react"
import * as THREE from 'three';
// import Algebra from 'Algebra';
import Algebra from 'ganja.js';
window.Algebra = Algebra;
var PGA3D = Algebra(3,0,1);

function InfiniteLine({parent, orientation, position}) {
    var [line, setLine] = useState(() => {
        const material = new THREE.LineBasicMaterial( {
        	color: 0xffffff,
        	linewidth: 1,
        	linecap: 'round', //ignored by WebGLRenderer
        	linejoin:  'round' //ignored by WebGLRenderer
        } );

        const points = [];
        points.push( new THREE.Vector3( -10, -10, -10 ) );
        points.push( new THREE.Vector3( 10, 10, -10 ) );
        console.log("RENDERING LINE");
        
        const geometry = new THREE.BufferGeometry().setFromPoints( points );

        
        let l = new THREE.Line(geometry, material);
        parent.add(l);
    });
}

function InfinitePlane({normal, distance}) {
    var [mesh, setMesh] = useState(() => {
        let m = new THREE.Mesh();
        m.position.set(x,y,z);
        parent.add(m);
        
        return m;
    });

}


function Mesh({parent, x, y, z, children}) {

    var [mesh, setMesh] = useState(() => {
        let m = new THREE.Mesh();
        m.position.set(x,y,z);
        parent.add(m);
        m.onBeforeRender = (renderer, scene, camera, geometry, material, group) => {
            window.camera = camera;
            window.PGA3D = PGA3D;
        };
        
        return m;
    });
    
    useEffect(() => {
        mesh.position.set(x,y,z);
        return () => {}
    }, [x,y,z]);

    // useEffect(() => {
    //     mesh.material = material;
    //     return () => {}
    // }, [material]);

    const mappedChildren = React.Children.map(children, child => {
        // Checking isValidElement is the safe way and avoids a
        // typescript error too.
        
        return React.cloneElement(child, 
                                  {
                                    onMaterial: (m) => {
                                          
                                          mesh.material = m;
                                        
                                          window.mesh = mesh;
                                          window.THREE = THREE;
                                          window.material = m;
                                    }, 
                                    onGeometry: (geometry) => {
                                           mesh.geometry = geometry;
                                    }
                                  }
                                 );        
      });


    // useEffect(() => {
    //     mesh.geometry = geometry;
    //     return () => {}
    // }, [geometry]);
    
    return <>{mappedChildren}</>;
}

function AmbientLight({parent, color}) {
    const light = useMemo(() =>{
        let l = new THREE.AmbientLight( color );
        parent.add( l );
        return l;
    });

    return <></>;
}


function PointLight({parent, x, y, z, color, intensity, distance}) {
    const [light, setLight] = useState(() =>{
        let l = new THREE.PointLight( color, intensity, distance );
        l.position.set(x,y,x);
        parent.add( l );

        return l;
    });

    return <></>;
}

function cameraToRoot(camera) {
    let cursor = camera;
    
    while(cursor.parent) cursor = cursor.parent;

    return cursor;
}

function Renderer({camera}) {
    const containerRef = useRef(null);
    const [renderer, setRenderer] = useState(() =>  new THREE.WebGLRenderer({ antialias: true }), []);

    useEffect(() => {
        if(!camera) return ()=>{};
        let scene = cameraToRoot(camera);

        if (!(scene instanceof THREE.Scene)) alert("WOOT");

        const width = containerRef.current.clientWidth;
        const height = containerRef.current.clientHeight;

        renderer.setSize(width, height);
        containerRef.current.appendChild(renderer.domElement);

        const handleResize = () => {
            const newWidth = containerRef.current.clientWidth;
            const newHeight = containerRef.current.clientHeight;
            camera.aspect = newWidth / newHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(newWidth, newHeight);
        };
        window.addEventListener('resize', handleResize);

        function animate() {
            renderer.render( scene, camera );
        }
        renderer.setAnimationLoop( animate );

        return () => {
          // Stop animation loop
          renderer.setAnimationLoop( null );
          // Dispose of Three.js objects

          renderer.dispose();
    
          // Remove event listener
          window.removeEventListener('resize', handleResize);
    
          // Remove the renderer’s canvas from the DOM
          if (containerRef.current) {
            containerRef.current.removeChild(renderer.domElement);
          }
            console.log("DESTROYED EFFECT");
        };
        
    }, [camera && cameraToRoot(camera), camera])

    return (<div 
      ref={containerRef} 
      style={{ width: '100%', height: '800px', border: '1px solid #ccc' }}
    >
    </div>) 
}

function PerspectiveCamera({parent, fov, aspectRatio, nearClippingPlane, farClippingPlane, onCamera}) {
    // fov = 75
    
    
    const [camera, setCamera] = useState(() => {
        let c = new THREE.PerspectiveCamera(
          fov,            // Field of view
          aspectRatio, 
          nearClippingPlane,           // Near clipping plane
          farClippingPlane           // Far clipping plane
        );

        onCamera(c);
        return c;
    }, []);

    useEffect(() => {
            parent.add(camera);

            () => {
                parent.remove(camera);
                camera.dispose();
            }

        }, [parent]);


    
    return (<></>);
}

// class UpdateStream {
//     constructor() {
//         this.listeners = new Map();
//     }

//     update(value) {
//         this.listeners.values().forEach(listener => listener(value));
//     }

//     onUpdate(listener) {
//         this.listeners.set(listener, listener);
//     }

//     removeOnUpdate(listener) {
//         this.listeners.delete(listener);
//     }
// };


function Group({parent, children}) {
    const [group, setGroup] = useState(()=> new THREE.Group(), []);

    parent.add(group);

    const mappedChildren = React.Children.map(children, child => {
            // Checking isValidElement is the safe way and avoids a
            // typescript error too.
            return React.cloneElement(child, { parent: group });        
          });

    return (<>
        {mappedChildren}
    </>);
};

function Scene({children, onScene}) {
    const scene = useMemo(() => new THREE.Scene(), []);
    useEffect(() => {
        onScene(scene);
    }, [scene]);

    return (<Group parent={scene}>
        {children}
    </Group>);
}


function MeshStandardMaterial({onMaterial}) {
    const [material, setMaterial] = useState( () => {
        let m = new THREE.MeshStandardMaterial({ color: 'red' });
        onMaterial(m);
        return m;
    }, []);

    var component = (<></>);

    // component.material = material;

    return component;
}


function BoxGeometry({onGeometry}) {
    const [geometry, setGeometry] = useState( () => {
        let g = new THREE.BoxGeometry(2, 2, 2);
        onGeometry(g);
        return g;
    }, []);

    var component = (<></>);

    // component.material = material;

    return component;
}


function ViewPort({}) {
    // const containerRef = useRef(null);
    // const scene = useMemo(() => new THREE.Scene(), []);
    const [scene, setScene] = useState(undefined);
    const [camera, setCamera] = useState(undefined);

    // const camera = useMemo(() => {
        
    //     return new THREE.PerspectiveCamera(
    //       75,            // Field of view
    //       1, // Aspect
    //       0.1,           // Near clipping plane
    //       1000           // Far clipping plane
    //     );
    // }, []);
    // useEffect(() => {
    //     console.log("START EFFECT");

    //     // // 1. Set up scene, camera, and renderer
    //     // const width = containerRef.current.clientWidth;
    //     // const height = containerRef.current.clientHeight;
    //     // camera.aspect = containerRef.current.clientWidth / containerRef.current.clientHeight, 

    //     // // const scene = new THREE.Scene();

    //     // camera.position.z = 5; // Move camera away so we can see the cube
    //     // scene.add(camera);
    //     // const renderer = new THREE.WebGLRenderer({ antialias: true });
    //     // renderer.setSize(width, height);
    //     // containerRef.current.appendChild(renderer.domElement);
    

    //     // const light = new THREE.AmbientLight( 0x404040 ); // soft white light
    //     // scene.add( light );

    //     // const light2 = new THREE.PointLight( 0x404040, 1, 100 ); // soft white light
    //     // light2.position.set( 50, 50, 50 );
    //     // scene.add( light2 );
        
    //     // scene.background = new THREE.Color().setHex( 0xff0000 );
    //     console.log("SCENE CONSTRUCTED.");

    //     // // 4. Handle resizing (optional)
    //     // const handleResize = () => {
    //     //   const newWidth = containerRef.current.clientWidth;
    //     //   const newHeight = containerRef.current.clientHeight;
    //     //   camera.aspect = newWidth / newHeight;
    //     //   camera.updateProjectionMatrix();
    //     //   renderer.setSize(newWidth, newHeight);
    //     // };
    //     // window.addEventListener('resize', handleResize);
    //     // console.log("COMPLETED EFFECT");

    //     // function animate() {
    //     // 	renderer.render( scene, camera );
    //     // }
    //     // renderer.setAnimationLoop( animate );
    //     // 5. Cleanup function
    //     return () => {
    //       // Stop animation loop
    
    //       // Dispose of Three.js objects
    //       geometry.dispose();
    //       material.dispose();
    //       // renderer.dispose();
    
    //       // Remove event listener
    //       // window.removeEventListener('resize', handleResize);
    
    //       // // Remove the renderer’s canvas from the DOM
    //       // if (containerRef.current) {
    //       //   containerRef.current.removeChild(renderer.domElement);
    //       // }
    //         console.log("DESTROYED EFFECT");
    //     };
    //   }, []);

    const geometry = useMemo( () => new THREE.BoxGeometry(1, 1, 1));
    const material = useMemo( () => new THREE.MeshStandardMaterial({ color: 'green' }));
    /*
              75,            // Field of view
          1, // Aspect
          0.1,           // Near clipping plane
          1000           // Far clipping plane
          */

    return (
    <div 
      style={{ width: '800px', height: '800px', border: '1px solid #ccc' }}
    >
        <Scene onScene={setScene}>
            <Group>
                {/* <Mesh x={-2} y={-2} z={-2} >
                    <MeshStandardMaterial />
                    <BoxGeometry />
                </Mesh> */}
                <InfiniteLine orientation={[]} position={[]}/>
                <AmbientLight color={0x404040}/>
                <PointLight color={0xffffff} x={2} y={5} z={1} intensity={100} distance={0} />

                <PerspectiveCamera fov={75} aspectRatio={1} nearClippingPlane={.1} farClippingPlane={1000} onCamera={setCamera} />
                    
            </Group>
        </Scene>
        <Renderer camera={camera} />

    </div>
    );
}


export default ViewPort;