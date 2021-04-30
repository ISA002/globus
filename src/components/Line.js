export default class Line {
  constructor(start, end, radius) {
    super();
  
    // Convert latitude/longitude to XYZ on the globe
    const start = toXYZ(start[0], start[1], radius);
    const endXYZ = toXYZ(end[0], end[1], radius);
  
    // D3 interpolates along the great arc that passes
    // through both the start and end point
    const d3Interpolate = geoInterpolate(
      [start[1], start[0]],
      [end[1], end[0]],
    );
    const control1 = d3Interpolate(0.25);
    const control2 = d3Interpolate(0.75);
  
    // Set the arc height to half the distance between points
    const arcHeight = start.distanceTo(end) * 0.5 + radius;
    const controlXYZ1 = toXYZ(control1[1], control1[0], arcHeight);
    const controlXYZ2 = toXYZ(control2[1], control2[0], arcHeight);
  
    // CubicBezier allows for curves which travel half way
    // around the globe without penetrating the sphere
    const curve = new CubicBezierCurve3(start, controlXYZ1, controlXYZ2, end);
  
    // Arcs are curved tubes with 0.5px radius and 8 sides
    // Each curve is broken into 44 segments
    this.geometry = new THREE.TubeBufferGeometry(curve, 44, 0.5, 8);
    this.material = new THREE.ShaderMaterial({
      // A custom fragment shader animates arc colors
    });
    this.mesh = new THREE.Mesh(this.geometry, this.material);
    this.add(this.mesh);
  
    // Set the draw range to show only the first vertex
    this.geometry.setDrawRange(0, 1);
    this.drawAnimatedLine();
  }
  
  drawAnimatedLine = () => {
    let drawRangeCount = this.geometry.drawRange.count;
    const timeElapsed = performance.now() - this.startTime;
  
    // Animate the curve for 2.5 seconds
    const progress = timeElapsed / 2500;
  
    // Arcs are made up of roughly 3000 vertices
    drawRangeCount = progress * 3000;
  
    if (progress < 0.999) {
      // Update the draw range to reveal the curve
      this.geometry.setDrawRange(0, drawRangeCount);
      requestAnimationFrame(this.drawAnimatedLine);
    }
  }
}