import * as THREE from "three";
// import gsap from 'gsap';

import map from "../assets/africa-map.png";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import vertex from "./shader/vertex.glsl";
import fragment from "./shader/fragment.glsl";

export default class Renderer3D {
  constructor(dom) {
    this.dom = dom;

    this.width = window.innerWidth;
    this.height = window.innerHeight;
    this.scene = new THREE.Scene();
    this.renderer = new THREE.WebGLRenderer();
    this.renderer.setSize(this.width, this.height);
    // this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.setClearColor(0x111111, 1);
    dom.appendChild(this.renderer.domElement);

    this.camera = new THREE.PerspectiveCamera(
      45,
      this.width / this.height,
      1,
      1000
    );

    this.camera.position.set(0, 0, 15);
    this.camera.lookAt(new THREE.Vector3());

    new OrbitControls(this.camera, this.renderer.domElement);

    this.mouse = { x: 0, y: 0 };

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
    }
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
    }

    const hexagonMaterialFront = new THREE.ShaderMaterial({
      ...hexagonSphereData,
      side: THREE.FrontSide,
    });

    const hexagonMaterialBack = new THREE.ShaderMaterial({
      ...hexagonSphereData,
      side: THREE.BackSide,
    });

    const hexagonGeometry = new THREE.SphereGeometry(5.1, 64, 64);

    const hexagongSphereFront = new THREE.Mesh(hexagonGeometry, hexagonMaterialFront);
    const hexagongSphereBack = new THREE.Mesh(hexagonGeometry, hexagonMaterialBack);
    const sphereFront = new THREE.Mesh(geometry, materialFront);
    const sphereBack = new THREE.Mesh(geometry, materialBack);
    this.scene.add(sphereBack);
    this.scene.add(sphereFront);
    this.scene.add(hexagongSphereFront);
    this.scene.add(hexagongSphereBack);
    this.addListeners();
  };

  render = () => {
    requestAnimationFrame(this.render);
    this.renderer.render(this.scene, this.camera);
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
