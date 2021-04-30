import * as THREE from "three";
import { geoInterpolate } from "d3";

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

      const arcHeight = startV.distanceTo(endV) * 0.5 + radius * 1.2;

      const controlXYZ1 = this.toXYZ(control1[1], control1[0], arcHeight);
      const controlXYZ2 = this.toXYZ(control2[1], control2[0], arcHeight);

      const curve = new THREE.CubicBezierCurve3(
        startXYZ,
        controlXYZ1,
        controlXYZ2,
        endXYZ
      );

      this.geometry = new THREE.TubeBufferGeometry(curve, 44, 0.02, 4);

      this.geometry.computeBoundingSphere();
      this.geometry.computeBoundingBox();
      this.material = new THREE.MeshBasicMaterial({
        color: 0xff7f50,
      });
      const pointGeometry = new THREE.SphereGeometry(0.05, 32, 32);

      this.startPointMesh = new THREE.Mesh(pointGeometry, this.material);
      this.endPointMesh = new THREE.Mesh(pointGeometry, this.material);
      this.mesh = new THREE.Mesh(this.geometry, this.material);
      this.startPointMesh.position.set(startXYZ.x, startXYZ.y, startXYZ.z);
      this.endPointMesh.position.set(endXYZ.x, endXYZ.y, endXYZ.z);

      this.scene.add(this.mesh);
      this.scene.add(this.startPointMesh);

      this.geometry.setDrawRange(0, 1);
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
    let drawRangeCount = this.geometry.drawRange.count;
    const timeElapsed = performance.now() - this.startTime;

    const progress = timeElapsed / 2500;

    drawRangeCount = progress * 3000;

    if (progress < 0.999) {
      if (progress > 0.4 && !this.addedEndPoint) {
        this.scene.add(this.endPointMesh);
        this.addedEndPoint = true;
      }
      this.geometry.setDrawRange(0, drawRangeCount);
      requestAnimationFrame(this.drawAnimatedLine);
    } else {
      this.scene.remove(this.endPointMesh);
      this.scene.remove(this.mesh);
      this.scene.remove(this.startPointMesh);
    }
  };
}
