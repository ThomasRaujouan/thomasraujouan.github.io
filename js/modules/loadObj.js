import { OBJLoader } from "https://unpkg.com/three@0.139.2/examples/jsm/loaders/OBJLoader";
import * as THREE from "three";

const defaultMaterial = new THREE.MeshPhongMaterial({
  color: 0xbbbbbb, // Set your desired color
  shininess: 10, // Set the shininess (adjust as needed)
  // map: texture,
});

// Usage: const obj = await loadOBJModel(objPath);
const loadOBJModel = async function (objPath) {
  const loader = new OBJLoader();
  try {
    const obj = await new Promise((resolve, reject) => {
      loader.load(
        objPath,
        (loadedObj) => {
          resolve(loadedObj); // Resolve the Promise with the loaded object
        },
        function (xhr) {
          // Compute the loading progression
          const load = xhr.loaded / xhr.total;
          const loadText = load * 100 + "% loaded";
          console.log(loadText);
          // Display the loading progression
          const info = document.getElementById("info");
          if (load != 1) {
            info.innerText = loadText;
          } else info.innerText = "";
        },
        reject
      ); // Reject the Promise if there's an error
    });
    return obj; // Return the loaded object
  } catch (error) {
    throw new Error("Error loading OBJ model: " + error);
  }
};

const center = function (object) {
  const boundingBox = new THREE.Box3().setFromObject(object);
  const center = boundingBox.getCenter(new THREE.Vector3());
  object.position.sub(center);
};

const setMaterial = function (object, material = defaultMaterial) {
  object.traverse(function (child) {
    if (child instanceof THREE.Mesh) {
      child.material = material;
      child.castShadow = true;
      child.receiveShadow = true;
      child.material.side = THREE.DoubleSide; // (or THREE.FrontSide) no face culling
    }
  });
};

const setTexture = function (
  object,
  texturePath = "/assets/textures/chess-texture.svg",
  flip = true
) {
  const textureLoader = new THREE.TextureLoader();
  const texture = textureLoader.load("/assets/textures/chess-texture.svg");
  texture.flipY = flip;
  object.traverse(function (child) {
    if (child instanceof THREE.Mesh) {
      child.material.map = texture;
    }
  });
};

export { loadOBJModel, center, defaultMaterial, setMaterial, setTexture };
/*
Usage:
const scene = new THREE.Scene();
loadObj(scene, "/assets/obj/dressed-enneper-full.obj");
*/
