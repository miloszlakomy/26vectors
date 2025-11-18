import * as THREE from "three";
import { ConvexGeometry } from "three/addons/geometries/ConvexGeometry.js";

export class Vertex { constructor({ x, y, z }) { Object.assign(this, arguments[0]); } }
export class Vector { constructor({ x, y, z }) { Object.assign(this, arguments[0]); } }
export function norm({ x, y, z }) { return (x**2 + y**2 + z**2)**0.5; }
export class Versor { constructor({ x, y, z }) {
    Object.assign(this, arguments[0]);
    const n = norm(this);
    this.x /= n; this.y /= n; this.z /= n;
} }
export class Plane { constructor({ normal_versor, distance_from_origin }) {
        Object.assign(this, arguments[0]);
} }
export function dotProduct({ v, w }) { return v.x*w.x + v.y*w.y + v.z*w.z; }
export const eps = 1e-9;
export class VertexCloud {
    constructor({ side_length, vertices_per_side }) {
        // Object.assign(this, arguments[0]);
        this.vertices = new Set();
        if (vertices_per_side === 1) {
            this.vertices.add(new Vertex({ x: 0, y: 0, z: 0 }));
            return;
        }
        const r = [];  // vertices = r**3
        for (let i = -vertices_per_side + 1; i < vertices_per_side; i += 2) {
            r.push(i * side_length / 2 / (vertices_per_side - 1));
        }
        for (const x of r) { for (const y of r) { for (const z of r) {
            this.vertices.add(new Vertex({ x: x, y: y, z: z }));
        } } }
    }
    deleteBehindPlane({ plane }) {
        this.vertices.forEach(vertex => {
            if (dotProduct({ v: vertex, w: plane.normal_versor }) >
                plane.distance_from_origin + eps) { this.vertices.delete(vertex); }
        });
    }
}

/*

let vc = new VertexCloud({ side_length: 10, vertices_per_side: 3 });
console.log(vc);

vc.deleteBehindPlane({ plane: new Plane({ normal_versor: new Versor({ x: 1, y: -1, z: -1 }), distance_from_origin: 0 }) });
console.log(vc);

let points = Array.from(vc.vertices).map(v => new THREE.Vector3(v.x, v.y, v.z));
console.log(points);
let hullGeometry = new ConvexGeometry(points);
console.log(hullGeometry.attributes.position);
if (hullGeometry.attributes.position.count > 0) {
    console.log(
        new Set(Array.from(
            { length: hullGeometry.attributes.position.count },
            (v, k) => JSON.stringify(new Vertex({
                x: hullGeometry.attributes.position.getX(k),
                y: hullGeometry.attributes.position.getY(k),
                z: hullGeometry.attributes.position.getZ(k),
            })),
        ))
    );
} else {
    console.log(new Set(Array.from(vc.vertices).map(v => JSON.stringify(v))));
}

vc = new VertexCloud({ side_length: 10, vertices_per_side: 1 });
points = Array.from(vc.vertices).map(v => new THREE.Vector3(v.x, v.y, v.z));
console.log(points);
hullGeometry = new ConvexGeometry(points);
console.log(hullGeometry.attributes.position);
if (hullGeometry.attributes.position.count > 0) {
    console.log(
        new Set(Array.from(
            { length: hullGeometry.attributes.position.count },
            (v, k) => JSON.stringify(new Vertex({
                x: hullGeometry.attributes.position.getX(k),
                y: hullGeometry.attributes.position.getY(k),
                z: hullGeometry.attributes.position.getZ(k),
            })),
        ))
    );
} else {
    console.log(new Set(Array.from(vc.vertices).map(v => JSON.stringify(v))));
}

*/
