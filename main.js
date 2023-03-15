import * as THREE from "https://unpkg.com/three/build/three.module.js";
import { OrbitControls } from "https://cdn.skypack.dev/three@0.132.2/examples/jsm/controls/OrbitControls.js";
import * as TWEEN from "https://cdn.jsdelivr.net/npm/@tweenjs/tween.js@18.6.4/+esm"
const scene = new THREE.Scene();
/* 
  FOV,
  Aspect Ratio (Typically width/height),
  near clipping plane,
  far clipping plane,
*/
const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);

const renderer = new THREE.WebGLRenderer();
/* Use width and height of area we want to fill */
renderer.setSize(window.innerWidth, window.innerHeight);

const canvasElement = renderer.domElement;

/* Append canvas element */
document.body.appendChild(canvasElement);

/* Enable orbiting controls */
const controls = new OrbitControls(camera, canvasElement);

/* Create and load textures */
const textureLoader = new THREE.TextureLoader();
const ballTexture = textureLoader.load("textures/basketball_texture2.png");
const ballNormalMap = textureLoader.load("textures/basketball_normal_map.png");
const courtTexture = textureLoader.load("textures/blazers_court_texture2.jpg");
const jumbotronTexture = textureLoader.load("textures/blazers_jumbotron.png");
const backboardTexture = textureLoader.load("textures/nba_backboard.jpg");

const netTexture = textureLoader.load("textures/net.png");
netTexture.repeat.set(2, 0.7);
netTexture.offset.set(0, 0.3);
netTexture.wrapS = THREE.RepeatWrapping;

/* Add lighting
- DirectionalLight() - light color, intensity
*/
const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
scene.add(ambientLight);

const light = new THREE.DirectionalLight(0xffffff, 1);
light.position.set(0, 10, 10).normalize();
scene.add(light);

/* Create the court plane */
const planeGeometry = new THREE.PlaneGeometry(94, 50);
/* .map : Texture ==> The color map. May optionally include an alpha channel, typically combined with .transparent or .alphaTest. Default is null. */
const planeMaterial = new THREE.MeshBasicMaterial({
  map: courtTexture,
});
const courtPlane = new THREE.Mesh(planeGeometry, planeMaterial);
courtPlane.rotation.x = -Math.PI / 2;

scene.add(courtPlane);

/* Create the basketball geometry */
const createBasketball = () => {
  /* SphereGeometry -- radius, widthSegments, heightSegments */
  const geometry = new THREE.SphereGeometry(2, 30, 16);
  const material = new THREE.MeshStandardMaterial({
    map: ballTexture,
    normalMap: ballNormalMap,
    roughness: 0.5, // Adjust the roughness to make the surface less shiny
  });
  const basketball = new THREE.Mesh(geometry, material);
  basketball.position.set(0, 5, 0);
  return basketball;
};
const basketball = createBasketball();
/* Add a userData property to the basketball mesh */
basketball.userData = { isBasketball: true };

// Create a raycaster
const raycaster = new THREE.Raycaster();

// Create a mouse vector
const mouse = new THREE.Vector2();

const onBasketballMouseDown = (event) => {
  // Calculate the mouse position in normalized device coordinates (-1 to +1)
  mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

  // Update the picking ray with the camera and mouse position
  raycaster.setFromCamera(mouse, camera);

  // Find all mesh objects intersected by the ray
  const intersects = raycaster.intersectObjects(scene.children, true);

  // Check if any of the intersected objects have a userData property with isBasketball set to true
  const basketballClicked = intersects.some(
    (intersect) => intersect.object.userData.isBasketball
  );
  if (basketballClicked) {
    console.log("Basketball clicked!");
    // Handle the basketball click event

    // Animate the basketball rotation
    new TWEEN.Tween(basketball.rotation)
      .to({ y: basketball.rotation.y + 2 * Math.PI }, 1000)
      .start();

    // basketball.position.set(0, 1, 0);
  }
};
canvasElement.addEventListener("mousedown", onBasketballMouseDown);
scene.add(basketball);

/* Create a backboard */
const createBackboard = ({ isLeftSide }) => {
  const backboardWidth = 4;
  const backboardHeight = 3;

  /* Create the main backboard itself */
  const backboardGeometry = new THREE.PlaneGeometry(
    backboardWidth,
    backboardHeight
  );

  const backboardMaterial = new THREE.MeshPhysicalMaterial({
    color: 0xffffff,
    transparent: true,
    opacity: 0.5,
    clearcoat: 1.0,
    clearcoatRoughness: 0.0,
    metalness: 0.0,
    roughness: 0.1,
  });
  const backboard = new THREE.Mesh(backboardGeometry, backboardMaterial);

  /* Create the gray border around the backboard */
  const borderWidth = 0.1;
  const backboardBorderShape = new THREE.Shape();

  const backboardBorderWidth = backboardWidth - borderWidth * 2;
  const backboardBorderHeight = backboardHeight - borderWidth * 2;

  const backboardBorderVertices = [
    [-backboardWidth / 2 + borderWidth, -backboardHeight / 2 + borderWidth],
    [-backboardWidth / 2 + borderWidth, backboardHeight / 2 - borderWidth],
    [backboardWidth / 2 - borderWidth, backboardHeight / 2 - borderWidth],
    [backboardWidth / 2 - borderWidth, -backboardHeight / 2 + borderWidth],
  ];

  for (let i = 0; i < backboardBorderVertices.length; i++) {
    if (i === 0) {
      backboardBorderShape.moveTo(...backboardBorderVertices[i]);
    } else {
      backboardBorderShape.lineTo(...backboardBorderVertices[i]);
    }
  }
  backboardBorderShape.lineTo(...backboardBorderVertices[0]);

  const borderInnerShape = new THREE.Shape();
  const borderInnerVertices = [
    [
      -backboardBorderWidth / 2 + borderWidth,
      -backboardBorderHeight / 2 + borderWidth,
    ],
    [
      -backboardBorderWidth / 2 + borderWidth,
      backboardBorderHeight / 2 - borderWidth,
    ],
    [
      backboardBorderWidth / 2 - borderWidth,
      backboardBorderHeight / 2 - borderWidth,
    ],
    [
      backboardBorderWidth / 2 - borderWidth,
      -backboardBorderHeight / 2 + borderWidth,
    ],
  ];

  for (let i = 0; i < borderInnerVertices.length; i++) {
    if (i === 0) {
      borderInnerShape.moveTo(...borderInnerVertices[i]);
    } else {
      borderInnerShape.lineTo(...borderInnerVertices[i]);
    }
  }
  borderInnerShape.lineTo(...borderInnerVertices[0]);
  backboardBorderShape.holes.push(borderInnerShape);

  const borderGeometry = new THREE.ShapeGeometry(backboardBorderShape);
  const borderMaterial = new THREE.MeshBasicMaterial({ color: 0xa7b7cc });
  const backboardBorder = new THREE.Mesh(borderGeometry, borderMaterial);

  /* Create the white shooting square right behind the rim */

  const shootSquareShape = new THREE.Shape();
  const shootSquareWidth = 0.75;
  const shootSquareHeight = 0.75;
  const shootSquareVertices = [
    [-shootSquareWidth, -shootSquareHeight],
    [-shootSquareWidth, shootSquareHeight],
    [shootSquareWidth, shootSquareHeight],
    [shootSquareWidth, -shootSquareHeight],
  ];
  for (let i = 0; i < shootSquareVertices.length; i++) {
    if (i === 0) {
      shootSquareShape.moveTo(...shootSquareVertices[i]);
    } else {
      shootSquareShape.lineTo(...shootSquareVertices[i]);
    }
  }
  shootSquareShape.lineTo(...shootSquareVertices[0]);

  const shootSquareInnerShape = new THREE.Shape();
  const innerShootSquareWidth = 0.5;
  const innerShootSquareHeight = 0.5;
  const innerShootSquareVertices = [
    [-innerShootSquareWidth, -innerShootSquareHeight],
    [-innerShootSquareWidth, innerShootSquareHeight],
    [innerShootSquareWidth, innerShootSquareHeight],
    [innerShootSquareWidth, -innerShootSquareHeight],
  ];

  for (let i = 0; i < innerShootSquareVertices.length; i++) {
    if (i === 0) {
      shootSquareInnerShape.moveTo(...innerShootSquareVertices[i]);
    } else {
      shootSquareInnerShape.lineTo(...innerShootSquareVertices[i]);
    }
  }
  shootSquareInnerShape.lineTo(...innerShootSquareVertices[0]);
  shootSquareShape.holes.push(shootSquareInnerShape);

  const backboardShootSquareGeometry = new THREE.ShapeGeometry(
    shootSquareShape
  );
  const backboardShootSquareMaterial = new THREE.MeshBasicMaterial({
    color: 0xffffff,
    transparent: true,
  });
  const backboardShootSquare = new THREE.Mesh(
    backboardShootSquareGeometry,
    backboardShootSquareMaterial
  );

  /* TODO: Black unclosed rectangle on the bottom border */

  const paddingWidth = backboardWidth - borderWidth * 2;
  const paddingHeight = 1;

  // Create the top plane
  const topPlaneGeometry = new THREE.PlaneGeometry(paddingWidth, paddingHeight);
  const topPlaneMaterial = new THREE.MeshBasicMaterial({ color: 0x000000 });
  const topPlane = new THREE.Mesh(topPlaneGeometry, topPlaneMaterial);

  // Position the top plane at the top of the backboard
  topPlane.position.set(
    0,
    -backboardHeight / 2 + borderWidth + paddingHeight / 2,
    0
  );

  // Create the bottom plane
  const bottomPlaneGeometry = new THREE.PlaneGeometry(
    paddingWidth,
    paddingHeight
  );
  const bottomPlaneMaterial = new THREE.MeshBasicMaterial({ color: 0x000000 });
  const bottomPlane = new THREE.Mesh(bottomPlaneGeometry, bottomPlaneMaterial);

  // Position the bottom plane at the bottom of the backboard
  bottomPlane.position.set(
    0,
    -backboardHeight / 2 + borderWidth + paddingHeight / 2,
    0
  );

  // Rotate the bottom plane 90 degrees so that it's vertical
  bottomPlane.rotation.set(Math.PI / 2, 0, 0);

  // Combine the two planes into a single mesh
  const bottomPadding = new THREE.Group();
  bottomPadding.add(topPlane);
  bottomPadding.add(bottomPlane);

  /* Create a group to hold the backboard elements */
  const backboardGroup = new THREE.Group();
  backboardGroup.add(backboard);
  backboardGroup.add(backboardBorder);
  backboardGroup.add(backboardShootSquare);
  backboardGroup.add(bottomPadding);

  backboard.position.set(0, 0, 0);
  /* Set the border slightly behind the backboard */
  backboardBorder.position.set(0, 0, -0.01);

  if (isLeftSide) {
    backboardGroup.position.set(10.5, 7, 0);
    backboardGroup.rotation.y = Math.PI / 2;
  } else {
    backboardGroup.position.set(-10.5, 7, 0);
    backboardGroup.rotation.y = -Math.PI / 2;
  }

  return backboardGroup;
};

/* Create hoops */
const createHoop = (side) => {
  const isLeftSide = side === "LEFT";

  /* Create the angled part of the stanchion */
  /* BoxGeometry - width, height, depth */
  const stanchionAngleGeometry = new THREE.BoxGeometry(0.85, 15, 0.5);
  const stanchionAngleMaterial = new THREE.MeshStandardMaterial({
    color: 0xbb2b25,
    // actual color: 0x261e1e
  });
  const stanchionAngle = new THREE.Mesh(
    stanchionAngleGeometry,
    stanchionAngleMaterial
  );

  if (isLeftSide) {
    stanchionAngle.position.set(2.25, 0, 0);
    stanchionAngle.rotation.z = -Math.PI / 5;
  } else {
    stanchionAngle.position.set(-2, 0, 0);
    stanchionAngle.rotation.z = Math.PI / 5;
  }

  /* Create the arm that connects the stanchion to the backboard */
  const stanchionArmColor = 0xbb2b25;
  const armGeometry = new THREE.BoxGeometry(4.5, 1, 0.75);
  const armMaterial = new THREE.MeshStandardMaterial({
    color: stanchionArmColor,
  });
  const arm = new THREE.Mesh(armGeometry, armMaterial);
  const armXPosition = isLeftSide ? 8.25 : -8.25;
  arm.position.set(armXPosition, 6.5, 0);

  /* Create the base of the stanchion */
  const baseGeometry = new THREE.BoxGeometry(3, 1.25, 2);
  const baseMaterial = new THREE.MeshStandardMaterial({ color: 0x261e1e });
  const base = new THREE.Mesh(baseGeometry, baseMaterial);
  const baseXPosition = isLeftSide ? 1.5 : -0.75;
  base.position.set(baseXPosition, 0, 0);

  /* Group the parts of the stanchion together */
  const stanchionGroup = new THREE.Group();
  stanchionGroup.add(stanchionAngle);
  stanchionGroup.add(arm);
  stanchionGroup.add(base);

  const hoopTopGeometry = new THREE.SphereGeometry(0.5, 32, 32);
  const hoopTopMaterial = new THREE.MeshStandardMaterial({ color: 0xffffff });
  const hoopTop = new THREE.Mesh(hoopTopGeometry, hoopTopMaterial);
  hoopTop.position.y = 2.7;

  /* TODO: Create shot-clock -- goes above the backboard */
  const shotClockGeometry = new THREE.PlaneGeometry(1.5, 1.5);

  /* Create the backboard */
  const backboardGroup = createBackboard({ isLeftSide });

  /* Create the net */

  /* Top of net should be an orange ring/circle - #eb6b25 */

  const netXPosition = isLeftSide ? 12 : -12;

  const hoopRadius = 0.7;
  const netWidth = 0.1;
  const netHeight = 1.5;
  const netTopPositionY = netHeight + 5;

  const netTopGeometry = new THREE.RingGeometry(
    hoopRadius - netWidth / 2,
    hoopRadius + netWidth / 2,
    32
  );
  const netTopMaterial = new THREE.MeshBasicMaterial({
    color: 0xeb6b25,
  });
  const netTop = new THREE.Mesh(netTopGeometry, netTopMaterial);
  netTop.rotation.x = -Math.PI / 2; // rotate the ring to be flat
  netTop.position.set(netXPosition, netTopPositionY, 0); // position at the top of the cylinder

  /* Create the net itself */

  const netGeometry = new THREE.CylinderGeometry(
    0.7, // radiusTop
    0.7, // radiusBottom
    1.5, // height
    32, // radialSegments
    1, // heightSegments,
    true // openEnded
  );

  const netColor = new THREE.Color(1, 1, 1); // White color
  netColor.multiplyScalar(10); // Increase brightness by a factor of 2

  const netMaterial = new THREE.MeshBasicMaterial({
    map: netTexture,
    color: netColor,
    side: THREE.DoubleSide,
    transparent: true,
    // opacity: 0.8,
    depthWrite: false,
  });
  const net = new THREE.Mesh(netGeometry, netMaterial);
  net.position.set(netXPosition, 5, 0);

  const netGroup = new THREE.Group();
  netGroup.add(netTop);
  netGroup.add(net);

  /* Group all the hoop components together */
  const hoopGroup = new THREE.Group();
  hoopGroup.add(stanchionGroup);
  hoopGroup.add(backboardGroup);
  // hoopGroup.add(hoopTop);
  hoopGroup.add(netGroup);
  return hoopGroup;
};

/* Create the "left" hoop */
const hoop1 = createHoop("LEFT");
hoop1.position.set(-45, 0, 0);
scene.add(hoop1);

/* Create the "right" hoop */
const hoop2 = createHoop("RIGHT");
hoop2.position.set(45, 0, 0);
scene.add(hoop2);

camera.position.set(0, 50, 50);
camera.lookAt(0, 0, 0);

/* Create jumbotron at center of court */
const createJumbotron = () => {
  /* Creates BoxGeometry with: width, height, depth */
  const jumbotronGeometry = new THREE.BoxGeometry(12, 12, 5);
  const jumbotronMaterial = new THREE.MeshStandardMaterial({
    map: jumbotronTexture,
  });
  const jumbotron = new THREE.Mesh(jumbotronGeometry, jumbotronMaterial);
  jumbotron.position.set(0, 30, 5);
  return jumbotron;
};
const jumbotron = createJumbotron();
scene.add(jumbotron);

/* Create rendering loop -- renderer draws the scene everytime screen refreshes (60hz) 
       Basically, anything you want to move or change while the app is running has to go through the animate loop. 
      You can of course call other functions from there, so that you don't end up with an animate function that's hundreds of lines. 
*/

let basketballY = 5;
let basketballX = 0;

const animate = () => {
  requestAnimationFrame(animate);

  /* 0.05 = amplitude, 0.005 = frequency */
  // basketballX += 0.05 * Math.cos(Date.now() * 0.005);
  // basketballY += 0.125 * Math.sin(Date.now() * 0.005);
  // basketball.position.set(basketballX, basketballY, 0);

  /* Update TWEEN */
  TWEEN.update();

  controls.update(); // update the controls

  renderer.render(scene, camera);
};
animate();
