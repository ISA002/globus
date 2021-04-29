import * as THREE from "three";
// import gsap from 'gsap';

import map from "../assets/africa-map.png";
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
    this.renderer = new THREE.WebGLRenderer();
    this.renderer.setSize(this.width, this.height);
    this.context = this.renderer.getContext("2d");
    // this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.setClearColor(0x13344c, 1);
    dom.appendChild(this.renderer.domElement);

    this.camera = new THREE.PerspectiveCamera(
      45,
      this.width / this.height,
      1,
      1000
    );

    this.camera.position.set(0, 0, 18);
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

    const hexagonGeometry = new THREE.SphereGeometry(5.2, 64, 64);

    const hexagongSphereFront = new THREE.Mesh(
      hexagonGeometry,
      hexagonMaterialFront
    );
    const hexagongSphereBack = new THREE.Mesh(
      hexagonGeometry,
      hexagonMaterialBack
    );
    const sphereFront = new THREE.Mesh(geometry, materialFront);
    const sphereBack = new THREE.Mesh(geometry, materialBack);
    this.scene.add(sphereBack);
    this.scene.add(sphereFront);
    this.scene.add(hexagongSphereFront);
    this.scene.add(hexagongSphereBack);


    
    
    const vector = new THREE.Vector3();
    const DOT_COUNT = 1000;
    // const dotGeometry = new THREE.CircleGeometry(2, 5);
    // const positions = [];

    // const materialDot = new THREE.MeshBasicMaterial({
    //   color: 0xff0000,
    //   side: THREE.DoubleSide,
    // });
    const radius = 6;

    new THREE.ImageLoader().load(map, (img) => {
      for (let i = DOT_COUNT; i >= 0; i--) {
        const phi = Math.acos(-1 + (2 * i) / DOT_COUNT);
        const theta = Math.sqrt(DOT_COUNT * Math.PI) * phi;

        vector.setFromSphericalCoords(radius, phi, theta);
        // console.log(vector);
        // dotGeometry.lookAt(vector);
        // dotGeometry.translate(vector.x, vector.y, vector.z);
        vector.x /= radius;
        vector.y /= radius;
        vector.z /= radius;

        let imageData;
        const sizeMap = { x: 1440, y: 754 };
        imageData = this.getImageData(img);

        // dotGeometry.computeBoundingSphere();
        const uv = this.pointToUv(vector);
        if (i === DOT_COUNT || i === 0) console.log(uv);
        // console.log(uv);
        // const sample = imageData.getImageData(
        //   uv.x * sizeMap.x,
        //   uv.y * sizeMap.y,
        //   1,
        //   1
        // ).data;
        // if (sample[0] !== africaColor.r && sample[1] !== africaColor.g) return;
        
        // for (let i = 0; i < dotGeometry.faces.length; i++) {
        //   const face = dotGeometry.faces[i];

        //   positions.push(
        //     dotGeometry.vertices[face.a].x,
        //     dotGeometry.vertices[face.a].y,
        //     dotGeometry.vertices[face.a].z,
        //     dotGeometry.vertices[face.b].x,
        //     dotGeometry.vertices[face.b].y,
        //     dotGeometry.vertices[face.b].z,
        //     dotGeometry.vertices[face.c].x,
        //     dotGeometry.vertices[face.c].y,
        //     dotGeometry.vertices[face.c].z
        //   );

        //   // const [countryId] = getCountryId(sample);
        //   // countryIds.push(countryId, countryId, countryId);
        // }
        }
      })
    this.addListeners();
  };

  render = () => {
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
