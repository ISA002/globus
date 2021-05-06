import * as THREE from "three";
import { geoInterpolate } from "d3";
import { Circ, TimelineMax } from "gsap";
import vertex from "./lineShader/vertex.glsl";
import fragment from "./lineShader/fragment.glsl";

export default class Line {
  constructor(startXYZ, endXYZ, radius, scene) {
    this.scene = scene;
    this.startTime = performance.now();
    this.addedEndPoint = false;

    if (startXYZ !== undefined && endXYZ !== undefined) {
      const [start, end] = this.getLatAndLong(startXYZ, endXYZ, radius);

      const d3Interpolate = geoInterpolate(
        [start[1], start[0]],
        [end[1], end[0]]
      );
      const control1 = d3Interpolate(0.25);
      const control2 = d3Interpolate(0.75);

      const startV = new THREE.Vector2(start[0], start[1]);
      const endV = new THREE.Vector2(end[0], end[1]);

      const arcHeight = startV.distanceTo(endV) * 0.5 + radius * 1.35;

      const controlXYZ1 = this.toXYZ(control1[1], control1[0], arcHeight);
      const controlXYZ2 = this.toXYZ(control2[1], control2[0], arcHeight);

      const curve = new THREE.CubicBezierCurve3(
        startXYZ,
        controlXYZ1,
        controlXYZ2,
        endXYZ
      );

      this.geometry = new THREE.TubeBufferGeometry(curve, 64, 0.02, 4);

      this.geometry.computeBoundingSphere();
      this.geometry.computeBoundingBox();
      this.material = new THREE.ShaderMaterial({
        uniforms: {
          u_resolution: {
            type: "v2",
            value: new THREE.Vector2(window.innerWidth, window.innerHeight),
          },
          u_vanishValue: { value: 0.0 },
        },
        vertexShader: vertex,
        fragmentShader: fragment,
      });
      this.simpleMaterial = new THREE.MeshBasicMaterial({ color: 0xff992b });
      const pointGeometry = new THREE.SphereGeometry(0.05, 32, 32);

      this.startPointMesh = new THREE.Mesh(pointGeometry, this.simpleMaterial);
      this.endPointMesh = new THREE.Mesh(pointGeometry, this.simpleMaterial);
      this.mesh = new THREE.Mesh(this.geometry, this.material);
      this.startPointMesh.position.set(startXYZ.x, startXYZ.y, startXYZ.z);
      this.endPointMesh.position.set(endXYZ.x, endXYZ.y, endXYZ.z);

      this.scene.add(this.mesh);
      this.scene.add(this.startPointMesh);
      this.gVanVal = {
        value: 0,
      };

      this.geometry.setDrawRange(0, 1);
      this.t1 = new TimelineMax({ onUpdate: this.drawAnimatedLine });
      this.t1.to(this.gVanVal, {
          value: 0.51,
          duration: 2.2,
          ease: Circ.easeIn,
        }).to(this.gVanVal, {
          value: 1,
          duration: 5,
        }, '+=1');
      this.t1.pause();
    }
  }

  startAnimation = () => {
    if (this.t1) {
      this.t1.play()
      this.drawAnimatedLine();
    }
  }

  getLatAndLong = (start, end, R) => {
    return [
      [Math.asin(start.z / R), Math.atan2(start.y, start.x)],
      [Math.asin(end.z / R), Math.atan2(end.y, end.x)],
    ];
  };

  toXYZ = (lat, lon, R) => {
    return {
      x: R * Math.cos(lat) * Math.cos(lon),
      y: R * Math.cos(lat) * Math.sin(lon),
      z: R * Math.sin(lat),
    };
  };

  drawAnimatedLine = () => {
    const drawRangeCount = this.gVanVal.value * 3000;

    if (this.gVanVal.value < 0.999) {
      if (this.gVanVal.value === 0.51) {
        this.scene.add(this.endPointMesh);
      }
      if (this.gVanVal.value > 0.51) {
        if (!this.addedEndPoint) {
          this.scene.remove(this.startPointMesh);
          this.addedEndPoint = true;
        }
        this.mesh.material.uniforms.u_vanishValue.value += 0.03;
      }
      const vanVal = this.mesh.material.uniforms.u_vanishValue.value.toFixed(1);
      if (Number(vanVal) > 0.85) {
        this.scene.remove(this.endPointMesh);
      }
      this.mesh.geometry.setDrawRange(0, drawRangeCount);
      // requestAnimationFrame(this.drawAnimatedLine);
    } else {
      this.scene.remove(this.mesh);
    }
  };
}
