import React from "react";

import * as THREE from "three";
import { ConvexGeometry } from "three/addons/geometries/ConvexGeometry.js";

import { Plane, VertexCloud, Versor } from "./VertexCloud.jsx";

const isNonNegativeNumber = (value) => {
    const number = parseFloat(value);
    return !isNaN(number) && number >= 0;
};

export default function App() {
    const mountRef = React.useRef(null);
    // const [dimensions, setDimensions] = React.useState({ width: 0.1, height: 0.1, depth: 0.1 });
    const [textareaValue, setTextareaValue] = React.useState("");
    // const [textDimensions, setTextDimensions] = React.useState({ width: 1, height: 1, depth: 1 });
    // const [box, setBox] = React.useState(null);
    const [hull, setHull] = React.useState(null);
    const [textareaPlaceholder, setTextareaPlaceholder] = React.useState(
        "[6,5,6, 5,3,5, 6,5,6, " +
        " 5,3,5, 3,  3, 5,3,5, " +
        " 6,5,6, 5,3,5, 6,5,6]"
    );

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
                /*
                newBox.rotation.y += deltaMove.x * 0.01;
                newBox.rotation.x += deltaMove.y * 0.01;
                */

                newHull.rotation.y += deltaMove.x * 0.01;
                newHull.rotation.x += deltaMove.y * 0.01;
            }

            previousMousePosition = {
                x: event.clientX,
                y: event.clientY,
            };
        };

        const onMouseWheel = (event) => {
            event.preventDefault(); // Prevent default scrolling behavior
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


        // Create a cube
        /*
        const geometry = new THREE.BoxGeometry(dimensions.width, dimensions.height, dimensions.depth);
        const material = new THREE.MeshStandardMaterial({ color: 0x00ff00, side: THREE.DoubleSide });
        const newBox = new THREE.Mesh(geometry, material);
        scene.add(newBox);
        setBox(newBox);
        */


        // Create initial hull
        const hullGeometry = getHullGeometry("");
        const hullMaterial = new THREE.MeshStandardMaterial({ color: 0xffffff, side: THREE.DoubleSide });
        const newHull = new THREE.Mesh(hullGeometry, hullMaterial);
        const scale = Math.min(canvasWidth, canvasHeight) / 100 / 10;
        newHull.scale.set(scale, scale, scale);
        // newHull.rotation.y = 0.075;  // Radians
        // newHull.rotation.x = 0.100;  // Radians
        scene.add(newHull);
        setHull(newHull);


        animate();

        // Clean up on component unmount
        return () => {
            mountRef.current.removeEventListener("mousedown",  onMouseDown);
            mountRef.current.removeEventListener("mouseup",    onMouseUp);
            mountRef.current.removeEventListener("mouseleave", onMouseLeave);
            mountRef.current.removeEventListener("mousemove",  onMouseMove);
            mountRef.current.removeEventListener("wheel",      onMouseWheel);
            mountRef.current.removeChild(renderer.domElement);
            // scene.remove(newBox);
            scene.remove(newHull);
        };
    }, []);

    // Update the dimensions of the box based on input
    /*
    const handleDimensionsChange = (e) => {
        const { name, value } = e.target;
        const newDimensions = { ...dimensions, [name]: parseFloat(value) };

        setDimensions(newDimensions);
        setTextDimensions(newDimensions);
        updateBoxGeometry(newDimensions);
    };
    const handleTextDimensionsChange = (e) => {
        const { name, value } = e.target;
        const newTextDimensions = { ...textDimensions, [name]: value };
        setTextDimensions(newTextDimensions);

        // Allow all input for user experience but validate before updating state
        const newValue = parseFloat(value);
        if (!isNonNegativeNumber(newValue)) { return; }

        const newDimensions = { ...dimensions, [name]: newValue };
        setDimensions(newDimensions);
        updateBoxGeometry(newDimensions);
    };
    */
    const handleTextareaValueChange = (e) => {
        const newTextareaValue = e.target.value;
        setTextareaValue(newTextareaValue);
        updateHullGeometry(newTextareaValue);
    };
    /*
    const updateBoxGeometry = (newDimensions) => {
        if (!box) { return; }

        const geometry = new THREE.BoxGeometry(
            1e-9 + newDimensions.width,
            1e-9 + newDimensions.height,
            1e-9 + newDimensions.depth,
        );
        box.geometry.dispose();  // Cleanup old geometry
        box.geometry = geometry; // Set new geometry
    };
    */
    const updateHullGeometry = (newTextareaValue) => {
        if (!hull) { return; }
        const geometry = getHullGeometry(newTextareaValue);
        hull.geometry.dispose();  // Cleanup old geometry
        hull.geometry = geometry; // Set new geometry
    };
    const getHullGeometry = (newTextareaValue) => {
        const vc = new VertexCloud({ side_length: 10, vertices_per_side: 11 });
        const ac = [-1, 0, 1];  // Allowed coordinates
        const vectors = [];
        for (const x of ac) { for (const y of ac) { for (const z of ac) {
            if (!(x === 0 && y === 0 && z === 0)) { vectors.push([x, y, z]); }
        }}}
        let matches = newTextareaValue.match(/-?\d+\.?\d*/g);
        if (matches === null) {
            matches = textareaPlaceholder.match(/-?\d+\.?\d*/g);
        }
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

                    placeholder={textareaPlaceholder}
                    value={textareaValue}
                    onChange={handleTextareaValueChange}
                />
            </div></div>
            <div style={{ display: "inline-block" }}>
                <div ref={mountRef} style={{ width: "67vw", height: "100vh", borderLeft: "1px solid gray" }} />
            </div>
        </div></div>
    );
}

/*
                <!--
                <label>
                    <input
                        type="range"
                        name="width"
                        min="0.1"
                        max="3"
                        step="0.1"
                        value={dimensions.width}
                        onChange={handleDimensionsChange}
                    />
                    <input
                        type="text"
                        name="width"
                        value={textDimensions.width}
                        onChange={handleTextDimensionsChange}
                        style={{ width: "50px", marginLeft: "10px", marginRight: "10px" }}
                    />
                    Width
                </label>
                <br />
                <label>
                    <input
                        type="range"
                        name="height"
                        min="0.1"
                        max="3"
                        step="0.1"
                        value={dimensions.height}
                        onChange={handleDimensionsChange}
                    />
                    <input
                        type="text"
                        name="height"
                        value={textDimensions.height}
                        onChange={handleTextDimensionsChange}
                        style={{ width: "50px", marginLeft: "10px", marginRight: "10px" }}
                    />
                    Height
                </label>
                <br />
                <label>
                    <input
                        type="range"
                        name="depth"
                        min="0.1"
                        max="3"
                        step="0.1"
                        value={dimensions.depth}
                        onChange={handleDimensionsChange}
                    />
                    <input
                        type="text"
                        name="depth"
                        value={textDimensions.depth}
                        onChange={handleTextDimensionsChange}
                        style={{ width: "50px", marginLeft: "10px", marginRight: "10px" }}
                    />
                    Depth
                </label>
                -->
*/
