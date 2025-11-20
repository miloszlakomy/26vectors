import React from "react";

import * as THREE from "three";
import { ConvexGeometry } from "three/addons/geometries/ConvexGeometry.js";

import { Plane, VertexCloud, Versor } from "./VertexCloud.jsx";

const isGeometryEmpty = (geometry) => {
    return !geometry.attributes.position || geometry.attributes.position.count === 0;
};

const translationSideBySide = 3.0;

export default function App() {
    const mountRef = React.useRef(null);
    const [hull, setHull] = React.useState(null);
    const [hull2, setHull2] = React.useState(null);
    const [textareaPlaceholder, setTextareaPlaceholder] = React.useState(
        "E.g.: " +
        "[6,5,6, 5,3,5, 6,5,6, " +
        " 5,3,5, 3,  3, 5,3,5, " +
        " 6,5,6, 5,3,5, 6,5,6]"
    );
    const [textareaValue, setTextareaValue] = React.useState(textareaPlaceholder);
    const [textarea2Placeholder, setTextarea2Placeholder] = React.useState("");
    const [textarea2Value, setTextarea2Value] = React.useState(textarea2Placeholder);

    React.useEffect(() => {
        // const canvasWidth = window.innerWidth;
        // const canvasHeight = window.innerHeight;
        const canvasWidth  = Math.ceil(2/3 * window.innerWidth);
        const canvasHeight = window.innerHeight;

        // Scene setup
        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(75, canvasWidth / canvasHeight, 0.1, 1000);
        const renderer = new THREE.WebGLRenderer({ alpha: true });

        // Renderer settings
        renderer.setSize(canvasWidth, canvasHeight);
        mountRef.current.appendChild(renderer.domElement);

        // Add ambient light
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.5); // Soft white light
        scene.add(ambientLight);

        // Add directional light
        const directionalLight = new THREE.DirectionalLight(0xffffff, 2); // Bright white light
        directionalLight.position.set(5, 5, 5); // Position the light
        scene.add(directionalLight);

        const initialCameraZ = 7.5;
        let cameraScale = 1;
        camera.position.z = cameraScale * initialCameraZ;

        // Variables for mouse control
        let isDragging = false;
        let previousMousePosition = { x: 0, y: 0 };

        const onMouseDown = (event) => {
            isDragging = true;
        };

        const onMouseUp = () => {
            isDragging = false;
        };

        const onMouseLeave = () => {
            isDragging = false;
        };

        const onMouseMove = (event) => {
            if (isDragging) {
                const deltaMove = {
                    x: event.clientX - previousMousePosition.x,
                    y: event.clientY - previousMousePosition.y,
                };

                // Update rotation based on mouse movement
                newHull.rotation.y += deltaMove.x * 0.01;
                newHull.rotation.x += deltaMove.y * 0.01;

                newHull2.rotation.y += deltaMove.x * 0.01;
                newHull2.rotation.x += deltaMove.y * 0.01;
            }

            previousMousePosition = {
                x: event.clientX,
                y: event.clientY,
            };
        };

        const onMouseWheel = (event) => {
            event.preventDefault();     // Prevent default scrolling behavior
            const scaleFactor = 0.0025; // Change this value for faster/slower scaling
            cameraScale += event.deltaY * scaleFactor

            // Prevent zooming too far or too close
            if (cameraScale < 0) {
                cameraScale = 0;
            } else if (cameraScale > 5) {
                cameraScale = 5;
            }

            camera.position.z = cameraScale * initialCameraZ;
        };

        // Event listeners
        mountRef.current.addEventListener("mousedown",  onMouseDown);
        mountRef.current.addEventListener("mouseup",    onMouseUp);
        mountRef.current.addEventListener("mouseleave", onMouseLeave);
        mountRef.current.addEventListener("mousemove",  onMouseMove);
        mountRef.current.addEventListener("wheel",      onMouseWheel);

        // Animation loop
        const animate = function () {
            requestAnimationFrame(animate);
            renderer.render(scene, camera);
        };


        const scale = Math.min(canvasWidth, canvasHeight) / 100 / 10 / 1.5;

        // Create initial hull
        const hullGeometry = getHullGeometry("", textareaPlaceholder);
        const hullMaterial = new THREE.MeshStandardMaterial({ color: 0xffffff, side: THREE.DoubleSide });
        const newHull = new THREE.Mesh(hullGeometry, hullMaterial);
        newHull.scale.set(scale, scale, scale);
        // newHull.position.x = -translationSideBySide;
        // newHull.rotation.y = 0.075;  // Radians
        // newHull.rotation.x = 0.100;  // Radians
        scene.add(newHull);
        setHull(newHull);


        // Create initial hull2
        const hull2Geometry = getHullGeometry("", textarea2Placeholder);
        const hull2Material = new THREE.MeshStandardMaterial({ color: 0xffffff, side: THREE.DoubleSide });
        const newHull2 = new THREE.Mesh(hull2Geometry, hull2Material);
        newHull2.scale.set(scale, scale, scale);
        newHull2.position.x = translationSideBySide;
        // newHull2.rotation.y = 0.075;  // Radians
        // newHull2.rotation.x = 0.100;  // Radians
        scene.add(newHull2);
        setHull2(newHull2);


        animate();

        // Clean up on component unmount
        return () => {
            mountRef.current.removeEventListener("mousedown",  onMouseDown);
            mountRef.current.removeEventListener("mouseup",    onMouseUp);
            mountRef.current.removeEventListener("mouseleave", onMouseLeave);
            mountRef.current.removeEventListener("mousemove",  onMouseMove);
            mountRef.current.removeEventListener("wheel",      onMouseWheel);
            mountRef.current.removeChild(renderer.domElement);
            if (newHull)  { scene.remove(newHull);  }
            if (newHull2) { scene.remove(newHull2); }
        };
    }, []);

    // Update state based on input
    const handleTextareaValueChange = (e) => {
        const newTextareaValue = e.target.value;
        setTextareaValue(newTextareaValue);
        updateHullGeometry(newTextareaValue);
    };
    const handleTextarea2ValueChange = (e) => {
        const newTextarea2Value = e.target.value;
        setTextarea2Value(newTextarea2Value);
        updateHull2Geometry(newTextarea2Value);
    }
    const updateHullGeometry = (newTextareaValue) => {
        if (!hull) { return; }
        const geometry = getHullGeometry(newTextareaValue, textareaPlaceholder);
        hull.geometry.dispose();  // Cleanup old geometry
        hull.geometry = geometry; // Set new geometry
    };
    const updateHull2Geometry = (newTextarea2Value) => {
        if (!hull2) { return; }
        const geometry = getHullGeometry(newTextarea2Value, textarea2Placeholder);
        hull2.geometry.dispose();  // Cleanup old geometry
        hull2.geometry = geometry; // Set new geometry

        if (isGeometryEmpty(geometry)) { hull.position.x =  0; }
        else { hull.position.x = -translationSideBySide; }
    };
    const getHullGeometry = (newTextareaValue, defaultTextareaValue) => {
        const vc = new VertexCloud({ side_length: 10, vertices_per_side: 11 });
        const ac = [-1, 0, 1];  // Allowed coordinates
        const vectors = [];
        for (const x of ac) { for (const y of ac) { for (const z of ac) {
            if (!(x === 0 && y === 0 && z === 0)) { vectors.push([x, y, z]); }
        }}}
        let matches = newTextareaValue.match(/-?\d+\.?\d*/g);
        if (matches === null) {
            matches = defaultTextareaValue.match(/-?\d+\.?\d*/g);
        }
        if (matches === null) { return new THREE.BufferGeometry(); /* Empty geometry */ }
        const v26 = matches.map(Number);
        for (let i = 0; i < v26.length; i++) {
            vc.deleteBehindPlane({ plane: new Plane({ normal_versor: new Versor({ x: vectors[i][0], y: vectors[i][1], z: vectors[i][2] }), distance_from_origin: v26[i] / (vectors[i][0]**2 + vectors[i][1]**2 + vectors[i][2]**2)**0.5 }) });
        }
        const points = Array.from(vc.vertices).map(v => new THREE.Vector3(v.x, v.y, v.z));
        const geometry = new ConvexGeometry(points);

        return geometry;
    }

    return (
        <div style={{ width: "100vw", height: "100vh", overflow: "hidden" }}><div style={{ width: "110vw", height: "100vh" }}>
            <div style={{ display: "inline-block", width: "34vw", verticalAlign: "top" }}><div style={{ padding: "0.49vw" }}>
                Paste a 26-vector:
                <br />
                <textarea
                    style={{
                        width: "32vw",
                        height: "6em",
                        resize: "vertical", /* Disallow horizontal resizing */
                    }}

                    value={textareaValue}
                    onChange={handleTextareaValueChange}
                />
                <br />
                <br />
                Paste another 26-vector:
                <br />
                <textarea
                    style={{
                        width: "32vw",
                        height: "6em",
                        resize: "vertical", /* Disallow horizontal resizing */
                    }}

                    value={textarea2Value}
                    onChange={handleTextarea2ValueChange}
                />
                <br />
                <br />
                <br />
                <br />
                All characters other than optional minus, followed by digits, with optional '.' decimal separator, are ignored.
            </div></div>
            <div style={{ display: "inline-block" }}>
                <div ref={mountRef} style={{ width: "67vw", height: "100vh", borderLeft: "1px solid gray" }} />
            </div>
        </div></div>
    );
}
