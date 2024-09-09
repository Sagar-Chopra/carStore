import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { DRACOLoader } from "three/examples/jsm/loaders/DRACOLoader.js";

export const initializeScene = (canvas, assetObject, initialAssetIndex) => {
  const scene = new THREE.Scene();
  const sizes = {
    width: window.innerWidth,
    height: window.innerHeight,
  };

  const renderer = new THREE.WebGLRenderer({ canvas });
  renderer.setSize(sizes.width, sizes.height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

  const camera = new THREE.PerspectiveCamera(
    45,
    sizes.width / sizes.height,
    0.1,
    100
  );
  camera.position.z = 5;
  scene.add(camera);

  const light = new THREE.PointLight(0xffffff, 5, 100);
  light.position.set(5, 5, 5);
  const ambientLight = new THREE.AmbientLight(0xffffff, 10);
  scene.add(light, ambientLight);

  const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
  directionalLight.position.set(0, 10, 10);
  scene.add(directionalLight);

  const hemisphereLight = new THREE.HemisphereLight(0xffffff, 0x444444, 1);
  hemisphereLight.position.set(0, 20, 0);
  scene.add(hemisphereLight);

  const dracoLoader = new DRACOLoader();
  dracoLoader.setDecoderPath("/draco/");

  const loader = new GLTFLoader();
  loader.setDRACOLoader(dracoLoader);

  let currentModel = null;
  let currentAssetIndex = initialAssetIndex;

  const loadModel = (asset) => {
    return new Promise((resolve, reject) => {
      if (currentModel) {
        scene.remove(currentModel);
        currentModel.traverse((object) => {
          if (object.isMesh) {
            object.geometry.dispose();
            if (object.material.dispose) {
              object.material.dispose();
            }
          }
        });
        currentModel = null;
      }

      loader.load(
        asset.assetName,
        (gltf) => {
          currentModel = gltf.scene;

          const box = new THREE.Box3().setFromObject(currentModel);
          const center = box.getCenter(new THREE.Vector3());
          const size = box.getSize(new THREE.Vector3());

          const maxDim = Math.max(size.x, size.y, size.z);
          const scale = 2 / maxDim; // Adjust this value to change the overall size

          currentModel.scale.multiplyScalar(scale);
          currentModel.position.sub(center.multiplyScalar(scale));

          scene.add(currentModel);

          camera.position.set(0, 0, 5);
          camera.lookAt(0, 0, 0);

          resolve();
        },
        undefined,
        (error) => {
          console.error("An error occurred while loading the model:", error);
          reject(error);
        }
      );
    });
  };

  const controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.autoRotate = true;
  controls.autoRotateSpeed = 5;

  const handleResize = () => {
    sizes.width = window.innerWidth;
    sizes.height = window.innerHeight;

    camera.aspect = sizes.width / sizes.height;
    camera.updateProjectionMatrix();

    renderer.setSize(sizes.width, sizes.height);
  };
  window.addEventListener("resize", handleResize);

  let animationFrameId = null;

  const animate = () => {
    controls.update();
    renderer.render(scene, camera);
    animationFrameId = requestAnimationFrame(animate);
  };

  const switchModel = async (index) => {
    if (index >= 0 && index < assetObject.length) {
      currentAssetIndex = index;
      await loadModel(assetObject[currentAssetIndex]);
      controls.target.set(0, 0, 0);
      controls.update();
    } else {
      console.error("Invalid model index");
    }
  };

  const cleanup = () => {
    if (animationFrameId) {
      cancelAnimationFrame(animationFrameId);
    }
    window.removeEventListener("resize", handleResize);
    controls.dispose();
    renderer.dispose();
    if (currentModel) {
      scene.remove(currentModel);
      currentModel.traverse((object) => {
        if (object.isMesh) {
          object.geometry.dispose();
          if (object.material.dispose) {
            object.material.dispose();
          }
        }
      });
    }
  };

  // Initial setup
  loadModel(assetObject[currentAssetIndex]).then(() => {
    animate(); // Start the animation loop after the initial model is loaded
  });

  return {
    switchModel,
    cleanup,
  };
};
