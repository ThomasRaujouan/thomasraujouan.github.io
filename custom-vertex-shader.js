import * as THREE from "three";
import { TrackballControls } from "/js/modules/TrackballControls.js";
import { OBJLoader } from "./js/modules/OBJLoader.module.js";

let camera, scene, renderer, controls, object;

init();
animate();

function init() {
  camera = new THREE.PerspectiveCamera(
    27,
    window.innerWidth / window.innerHeight,
    0.1,
    100
  );
  camera.position.z = 5;

  scene = new THREE.Scene();

  // manager

  function loadModel() {
    object.traverse(function (child) {
      if (child.isMesh) {
        child.material = buildTwistMaterial();
      }
    });

    object.position.y = -0.0;
    object.scale.setScalar(0.1);
    scene.add(object);

    render();
  }

  // model

  const manager = new THREE.LoadingManager(loadModel);

  function onProgress(xhr) {
    if (xhr.lengthComputable) {
      const percentComplete = (xhr.loaded / xhr.total) * 100;
      console.log("model " + percentComplete.toFixed(2) + "% downloaded");
    }
  }

  function onError() {}

  const loader = new OBJLoader(manager);
  loader.load(
    "/assets/obj/costa.obj",
    function (obj) {
      object = obj;
    },
    onProgress,
    onError
  );

  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.body.appendChild(renderer.domElement);

  // EVENTS

  window.addEventListener("resize", onWindowResize);
  createControls(camera);
}

function buildTwistMaterial() {
  const material = new THREE.MeshNormalMaterial();
  material.onBeforeCompile = function (shader) {
    shader.uniforms.time = { value: 0 };

    shader.vertexShader = "uniform float time;\n" + shader.vertexShader;
    shader.vertexShader = shader.vertexShader.replace(
      "#include <begin_vertex>",
      [
        "float theta = sin( time + position.y )/10.0;",
        "float c = cos( theta );",
        "float s = sin( theta );",
        "mat3 m = mat3( c, 0, s, 0, 1, 0, -s, 0, c );",
        "vec3 transformed = vec3( position ) * m;",
        "vNormal = vNormal * m;",
      ].join("\n")
    );
    // console.log(shader.vertexShader);

    material.userData.shader = shader;
  };

  return material;
}

//

function onWindowResize() {
  const width = window.innerWidth;
  const height = window.innerHeight;

  camera.aspect = width / height;
  camera.updateProjectionMatrix();

  renderer.setSize(width, height);
}

//

function animate() {
  requestAnimationFrame(animate);
  controls.update();
  render();
}

function render() {
  scene.traverse(function (child) {
    if (child.isMesh) {
      const shader = child.material.userData.shader;

      if (shader) {
        shader.uniforms.time.value = performance.now() / 1000;
      }
    }
  });

  renderer.render(scene, camera);
}

function createControls(camera) {
  controls = new TrackballControls(camera, renderer.domElement);

  controls.rotateSpeed = 1.0;
  controls.zoomSpeed = 1.2;
  controls.panSpeed = 0.8;

  controls.keys = ["KeyA", "KeyS", "KeyD"];
}
