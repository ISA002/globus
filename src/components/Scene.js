import * as THREE from "three";
import Line from "./Line";

import map from "../assets/map2.png";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import vertex from "./shader/vertex.glsl";
import fragment from "./shader/fragment.glsl";

const africaColor = { r: 69, g: 164, b: 254 };
export default class Renderer3D {
  constructor(dom) {
    this.dom = dom;

    this.width = window.innerWidth;
    this.height = window.innerHeight;
    this.scene = new THREE.Scene();
    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.renderer.setSize(this.width, this.height);
    this.context = this.renderer.getContext("2d");
    // this.renderer.setPixelRatio(window.devicePixelRatio);
    this.time = 0;
    this.startTime = false;
    this.renderer.setClearColor(0x13344c, 1);
    dom.appendChild(this.renderer.domElement);

    this.camera = new THREE.PerspectiveCamera(
      45,
      this.width / this.height,
      1,
      1000
    );

    this.camera.position.set(0, 0, 20);
    this.camera.lookAt(new THREE.Vector3());

    new OrbitControls(this.camera, this.renderer.domElement);

    this.mouse = { x: 0, y: 0 };

    this.addListeners();
    this.addObjects();
    this.render();
  }

  addListeners = () => {
    this.dom.addEventListener("mousemove", this.mouseEvent);
    window.addEventListener("resize", this.onResize);
  };

  mouseEvent = (e) => {
    this.mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
    this.mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;
  };

  destroy = () => {
    this.dom.removeEventListener("mousemove", this.mouseEvent);
    window.removeEventListener("resize", this.onResize);
  };

  addObjects = () => {
    const geometry = new THREE.SphereGeometry(5, 64, 64);
    const texture = new THREE.TextureLoader().load(map);
    const mapSphereMaterialData = {
      map: texture,
      transparent: true,
    };
    const materialFront = new THREE.MeshBasicMaterial({
      ...mapSphereMaterialData,
      side: THREE.FrontSide,
    });

    const materialBack = new THREE.MeshBasicMaterial({
      ...mapSphereMaterialData,
      side: THREE.BackSide,
      opacity: 0.5,
      depthTest: false,
    });

    const hexagonSphereData = {
      uniforms: {
        u_resolution: {
          type: "v2",
          value: new THREE.Vector2(window.innerWidth, window.innerHeight),
        },
      },
      vertexShader: vertex,
      fragmentShader: fragment,
      depthTest: false,
      transparent: true,
    };

    const hexagonMaterialFront = new THREE.ShaderMaterial({
      ...hexagonSphereData,
      side: THREE.FrontSide,
    });

    const hexagonMaterialBack = new THREE.ShaderMaterial({
      ...hexagonSphereData,
      side: THREE.BackSide,
    });

    const hexagonGeometry = new THREE.SphereGeometry(5, 12, 12);

    const hexagongSphereFront = new THREE.Mesh(
      hexagonGeometry,
      hexagonMaterialFront
    );
    const hexagongSphereBack = new THREE.Mesh(
      hexagonGeometry,
      hexagonMaterialBack
    );
    this.sphereFront = new THREE.Mesh(geometry, materialFront);
    this.sphereBack = new THREE.Mesh(geometry, materialBack);
    this.sphereFront.rotateY(55);
    this.sphereBack.rotateY(55);

    new THREE.ImageLoader().load(map, (img) => {
      this.scene.add(this.sphereBack);
      this.scene.add(this.sphereFront);
      this.scene.add(hexagongSphereFront);
      this.scene.add(hexagongSphereBack);
  
      const imageData = this.getImageData(img);
      const DOT_COUNT = 3000;
      this.positions = [];

      const radius = 1;
      this.outR = 5;

      for (let i = DOT_COUNT; i >= 0; i--) {
        const vector = new THREE.Vector3();
        const phi = Math.acos(-1 + (2 * i) / DOT_COUNT);
        const theta = Math.sqrt(DOT_COUNT * Math.PI) * phi;

        vector.setFromSphericalCoords(radius, phi, theta);

        vector.x /= radius;
        vector.y /= radius;
        vector.z /= radius;

        const sizeMap = { x: 1440, y: 754 };

        const uv = this.pointToUv(vector);
        const sample = imageData.getImageData(
          uv.u * sizeMap.x,
          uv.v * sizeMap.y,
          1,
          1
        ).data;
        if (sample[0] !== africaColor.r) continue;

        this.positions.push({
          x: vector.x * this.outR,
          y: vector.y * this.outR,
          z: vector.z * this.outR,
        });
      }
      this.startTime = true;
    });
  };

  render = () => {
    if (this.startTime) {
      this.time += 0.1;
      this.drawLinesBetweenPositions();

      // const rotSpeed = 0.008;
      // const x = this.camera.position.x;
      // const z = this.camera.position.z;

      // this.camera.position.x = x * Math.cos(rotSpeed) + z * Math.sin(rotSpeed);
      // this.camera.position.z = z * Math.cos(rotSpeed) - x * Math.sin(rotSpeed);
      // this.camera.lookAt(this.scene.position);
    }

    requestAnimationFrame(this.render);
    this.renderer.render(this.scene, this.camera);
  };

  pointToUv = ({ x, y, z }) => {
    const u = 0.5 + Math.atan2(x, z) / (2 * Math.PI);
    const v = 0.5 - Math.asin(y) / Math.PI;
    return {
      u,
      v,
    };
  };

  drawLinesBetweenPositions = () => {
    if (this.time.toFixed(1) % 6 === 0) {
      const posCount = this.positions.length;
      const randFirst = Math.round(Math.random() * posCount - 1);
      const randSecond = Math.round(Math.random() * posCount - 1);
      const l = new Line(
        this.positions[randFirst],
        this.positions[randSecond],
        this.outR,
        this.scene
      );
      l.startAnimation();
    }
  };

  getImageData = (img) => {
    const canvas = document.createElement("canvas");
    canvas.width = img.width;
    canvas.height = img.height;
    const context = canvas.getContext("2d");
    canvas.getContext("2d").drawImage(img, 0, 0, img.width, img.height);
    return context;
  };

  onResize = () => {
    this.width = window.innerWidth;
    this.height = window.innerHeight;

    this.camera.aspect = this.width / this.height;

    this.camera.updateProjectionMatrix();
    this.renderer.setSize(this.width, this.height);
  };

  handleClick = () => {};
}
