// import * as THREE from "./three.module.js";
import { OrbitControls } from "https://cdn.skypack.dev/three@0.132.2/examples/jsm/controls/OrbitControls.js";
import { DragControls } from "https://cdn.skypack.dev/three@0.132.2/examples/jsm/controls/DragControls.js";
// import * as Ammo from "https://cdn.skypack.dev/three@0.132.2/examples/jsm/libs/ammo.module.js";
// import * as Ammo from "./ammo.js";

import * as TWEEN from "https://cdn.jsdelivr.net/npm/@tweenjs/tween.js@18.6.4/+esm";

/* Create the scene and perspective camera */
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

/* Set camera's initial position and view */
camera.position.set(0, 50, 50);
camera.lookAt(0, 0, 0);

const renderer = new THREE.WebGLRenderer();
/* Use width and height of area we want to fill */
renderer.setSize(window.innerWidth, window.innerHeight);

const canvasElement = renderer.domElement;

/* Append canvas element */
document.body.appendChild(canvasElement);

// const physicsWorld = new Ammo.btDiscreteDynamicsWorld(
//   new Ammo.btCollisionDispatcher(new Ammo.btDefaultCollisionConfiguration()),
//   new Ammo.btDbvtBroadphase(),
//   new Ammo.btSequentialImpulseConstraintSolver(),
//   new Ammo.btDefaultCollisionConfiguration()
// );

/* Enable orbiting controls */
const orbitControls = new OrbitControls(camera, canvasElement);

/* Create an AudioListener and add it to the camera */
const audioListener = new THREE.AudioListener();
camera.add(audioListener);

/* Create a global audio source */
const sound = new THREE.Audio(audioListener);

// Load crowd sound and set it as the Audio object's buffer
const audioLoader = new THREE.AudioLoader();

audioLoader.load("audio/NBA_Crowd_Sound.mp3", (buffer) => {
  sound.setBuffer(buffer);
  sound.setLoop(true);
  sound.setVolume(0.1);
});

/* Get the button and icon elements from the HTML */
const volumeButton = document.getElementById("volume-button");
const volumeIcon = document.getElementById("volume-icon");

/* Add an event listener to the button to toggle the volume */
volumeButton.addEventListener("click", () => {
  if (sound.isPlaying) {
    sound.pause();
    volumeIcon.innerHTML = "volume_off";
  } else {
    sound.play();
    volumeIcon.innerHTML = "volume_up";
  }
});

/* COLORS */
const GAME_CLOCK_COLOR = "#dc8e50";
const SHOT_CLOCK_COLOR = "#f44341";
const RIM_COLOR = "#eb6b25";
const STANCHION_COLOR = "#261e1e";

/* NAMED VALUES */
const DEGS_180 = Math.PI
const DEGS_90 = Math.PI / 2;
const DEGS_45 = Math.PI / 4;

const BLACK_MATERIAL = new THREE.MeshBasicMaterial({ color: "black" });

/* Create and load textures */
const textureLoader = new THREE.TextureLoader();
const ballTexture = textureLoader.load("textures/basketball_texture2.png");
const ballNormalMap = textureLoader.load("textures/basketball_normal_map.png");
const courtTexture = textureLoader.load("textures/blazers_court_texture2.jpg");
const jumbotronTexture = textureLoader.load("textures/blazers_jumbotron.png");

const backboardTexture = textureLoader.load("textures/nba_backboard.jpg");

const crowdTexture = textureLoader.load("textures/blazers_crowd_1.png");
const scorersTableTexture = textureLoader.load("textures/scorers_table.jpg");

const netTexture = textureLoader.load("textures/net.png");
netTexture.repeat.set(2, 0.7);
netTexture.offset.set(0, 0.3);
netTexture.wrapS = THREE.RepeatWrapping;

/* Load the GLTF models */
const gltfLoader = new THREE.GLTFLoader();
console.log(gltfLoader);

gltfLoader.load("./models/chair.gltf", (gltf) => {
  const chair = gltf.scene;
  chair.scale.set(2.5, 2.5, 2.5); // Scale the chair to make it visible

  const TOP_CHAIRS_START_Z = -22.5;

  /* Left Chairs */
  const leftChairsStartX = (-courtWidth / 2) + 7.5;
  
  for (let i = 0; i < 10; i++) {
    const chairClone = chair.clone();
    chairClone.rotation.y = -DEGS_90;
    const xIncrement = i * 2.75;
    chairClone.position.set(leftChairsStartX + xIncrement, 0, TOP_CHAIRS_START_Z);
    scene.add(chairClone);
  }

  /* Scorers Table Chairs */
  

  /* Right Chairs */
  const rightchairsStartX = (courtWidth / 2) - 32.5;
  for (let i = 0; i < 10; i++) {
    const chairClone = chair.clone();
    chairClone.rotation.y = -DEGS_90;
    const xIncrement = i * 2.75;
    chairClone.position.set(rightchairsStartX + xIncrement, 0, TOP_CHAIRS_START_Z);
    scene.add(chairClone);
  }

  /* Bottom Chairs */


  console.log({ gltf })
}
)


/* Add lighting
- DirectionalLight() - light color, intensity
*/
const ambientLight = new THREE.AmbientLight("white", 0.4);
scene.add(ambientLight);

const light = new THREE.DirectionalLight("white", 1);
light.position.set(0, 10, 10).normalize();
scene.add(light);

/* Create the court plane */
const courtWidth = 94;
const courtHeight = 0.1;
const courtDepth = 50;
const courtGeometry = new THREE.BoxGeometry(
  courtWidth,
  courtHeight,
  courtDepth
);

/* .map : Texture ==> The color map. May optionally include an alpha channel, typically combined with .transparent or .alphaTest. Default is null. */
const courtMaterial = new THREE.MeshBasicMaterial({
  map: courtTexture,
});
const court = new THREE.Mesh(courtGeometry, courtMaterial);
court.name = "court";

scene.add(court);

/* TODO: Review this, but covering underneath court with black surface */
const coverGeometry = new THREE.BoxGeometry(courtWidth, 0.05, courtDepth);
const cover = new THREE.Mesh(coverGeometry, BLACK_MATERIAL);
cover.position.set(0, -0.05, 0);
scene.add(cover);

/* Create the crowd */

/* 
- Different width for each crowd position
*/

const crowdWidth = 50;
const crowdHeight = 20;

// create an array of positions in polar coordinates around the court

// 180 = Math.PI radians
const crowdPositions = [
  { radius: 25, angle: Math.PI, width: courtWidth, height: 20 },
  { radius: 25, angle: 0, width: courtWidth, height: 20 },
  { radius: 47.5, angle: Math.PI / 2, width: 50, height: 20 },
  { radius: 47.5, angle: 3 * Math.PI / 2, width: 50, height: 20 },
];

const crowdMaterials = new THREE.MeshBasicMaterial({ map: crowdTexture });

// create a crowd geometry for each position and add it to the scene
for (const position of crowdPositions) {
  const {radius, angle, width, height} = position;

  const crowdGeometry = new THREE.PlaneGeometry(width, height);
  const crowd = new THREE.Mesh(crowdGeometry, crowdMaterials);
  const x = radius * Math.sin(angle);
  const z = radius * Math.cos(angle);
  crowd.position.set(x, 10, z);
  
  crowd.rotation.y = angle + (DEGS_180);
  // crowd.rotation.x = -DEGS_45;

  scene.add(crowd);
}

/* Create the basketball geometry */
const initialBallPosition = new THREE.Vector3(0, 5, 0);
const createBasketball = () => {
  /* SphereGeometry -- radius, widthSegments, heightSegments */
  const basketballRadius = 1.05;
  const ballWidthSegments = 30;
  const ballHeightSegments = 16;
  const geometry = new THREE.SphereGeometry(
    basketballRadius,
    ballWidthSegments,
    ballHeightSegments
  );
  const material = new THREE.MeshStandardMaterial({
    map: ballTexture,
    normalMap: ballNormalMap,
    roughness: 0.5, // Adjust the roughness to make the surface less shiny
  });
  const basketball = new THREE.Mesh(geometry, material);
  basketball.name = "basketball";
  basketball.position.copy(initialBallPosition);
  return basketball;
};
const basketball = createBasketball();

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
    (intersect) => intersect.object.name === "basketball"
  );
  if (basketballClicked) {
    console.log("Basketball clicked!");
    // Handle the basketball click event

    // Animate the basketball rotation
    const yRotation = basketball.rotation.y + 2 * DEGS_180 
    new TWEEN.Tween(basketball.rotation)
      .to({ 
        y: yRotation
      }, 1000)
      .start();
  }
};
canvasElement.addEventListener("mousedown", onBasketballMouseDown);
scene.add(basketball);

/* Helper Functions */
const drawSquare = ({ shape, vertices }) => {
  for (let i = 0; i < vertices.length; i++) {
    if (i === 0) {
      shape.moveTo(...vertices[i]);
    } else {
      shape.lineTo(...vertices[i]);
    }
  }
  shape.lineTo(...vertices[0]);
};

const BACKBOARD_X = 10.5;
const BACKBOARD_Y = 7;
const BOARD_ROTATION_Y = Math.PI / 2;

/* Create a backboard */
const createBackboard = ({ isLeftSide }) => {
  const backboardWidth = 4;
  const backboardHeight = 3;
  const backboardDepth = 0.2;

  /* Create the main backboard itself */
  const backboardGeometry = new THREE.BoxGeometry(
    backboardWidth,
    backboardHeight,
    backboardDepth
  );

  const backboardMaterial = new THREE.MeshPhysicalMaterial({
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

  drawSquare({
    shape: backboardBorderShape,
    vertices: backboardBorderVertices,
  });

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

  drawSquare({
    shape: borderInnerShape,
    vertices: borderInnerVertices,
  });
  backboardBorderShape.holes.push(borderInnerShape);

  const borderGeometry = new THREE.ShapeGeometry(backboardBorderShape);
  const borderMaterial = new THREE.MeshBasicMaterial({ color: 0xa7b7cc });
  const backboardBorder = new THREE.Mesh(borderGeometry, borderMaterial);

  /* Create the white shooting square right behind the rim */
  const shootSquareShape = new THREE.Shape();
  const shootSquareWidth = 0.75;
  const shootSquareHeight = 0.65;
  const shootSquareVertices = [
    [-shootSquareWidth, -shootSquareHeight],
    [-shootSquareWidth, shootSquareHeight],
    [shootSquareWidth, shootSquareHeight],
    [shootSquareWidth, -shootSquareHeight],
  ];

  drawSquare({
    shape: shootSquareShape,
    vertices: shootSquareVertices,
  });

  const shootSquareInnerShape = new THREE.Shape();
  const innerShootSquareWidth = 0.5;
  const innerShootSquareHeight = 0.5;
  const innerShootSquareVertices = [
    [-innerShootSquareWidth, -innerShootSquareHeight],
    [-innerShootSquareWidth, innerShootSquareHeight],
    [innerShootSquareWidth, innerShootSquareHeight],
    [innerShootSquareWidth, -innerShootSquareHeight],
  ];

  drawSquare({
    shape: shootSquareInnerShape,
    vertices: innerShootSquareVertices,
  });

  shootSquareShape.holes.push(shootSquareInnerShape);

  const shootSquareGeometry = new THREE.ShapeGeometry(shootSquareShape);
  const shootSquareMaterial = new THREE.MeshBasicMaterial({
    color: "white",
    transparent: true,
  });
  const shootSquare = new THREE.Mesh(shootSquareGeometry, shootSquareMaterial);

  /* Position the shoot square */
  const shootSquareYPos = backboardHeight - 3.4;
  shootSquare.position.set(0, shootSquareYPos, 0.2);

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
  backboardGroup.add(shootSquare);
  // TODO: Fix the bottom padding
  // backboardGroup.add(bottomPadding);

  backboard.position.set(0, 0, 0);
  /* Set the border slightly behind the backboard */
  backboardBorder.position.set(0, 0, -0.01);

  if (isLeftSide) {
    backboardGroup.position.set(BACKBOARD_X, BACKBOARD_Y, 0);
    backboardGroup.rotation.y = DEGS_90;
  } else {
    backboardGroup.position.set(-BACKBOARD_X, BACKBOARD_Y, 0);
    backboardGroup.rotation.y = -DEGS_90;
  }

  return backboardGroup;
};

/* Shot Clock Vars */
const QUARTER_LENGTH = 720; // 12 mins in seconds
const SHOT_CLOCK_LENGTH = 24; // 24 seconds

let leftShotClockTime = SHOT_CLOCK_LENGTH;
let rightShotClockTime = SHOT_CLOCK_LENGTH;

let leftGameClockTime = QUARTER_LENGTH; // 12 mins in seconds
let rightGameClockTime = QUARTER_LENGTH; // 12 mins in seconds

const createShotClock = ({ isLeftSide, position, rotation }) => {
  const shotClockXIncrement = isLeftSide ? -0.7 : 0.7;
  const shotClockYIncrement = isLeftSide ? -1 : 1;

  const shotClockXPosition = position.x + shotClockXIncrement;
  const shotClockYPosition = 10 + shotClockYIncrement;

  const shotClockWidth = 2.25;
  const shotClockHeight = 3;
  const shotClockDepth = 0.3;

  const shotClockGeometry = new THREE.BoxGeometry(
    shotClockWidth,
    shotClockHeight,
    shotClockDepth
  );
  const shotClockMaterial = BLACK_MATERIAL;
  const shotClock = new THREE.Mesh(shotClockGeometry, shotClockMaterial);

  shotClock.position.set(shotClockXPosition, 10, 0);
  shotClock.rotation.y = rotation.y;

  /* Define some variables for the text and font size */
  const fontSize = 200;

  /* Create a canvas and context to draw the text onto */
  const canvas = document.createElement("canvas");
  const context = canvas.getContext("2d");

  // Set the canvas dimensions to match the desired text size
  canvas.width = fontSize * 2;
  canvas.height = fontSize;
  // Set the font properties for the text
  context.font = `${fontSize}px Arial`;
  context.textAlign = "center";
  context.textBaseline = "middle";

  // Create a plane geometry and basic material
  const geometry = new THREE.PlaneGeometry(3, 3);
  const material = new THREE.MeshBasicMaterial({
    transparent: true,
  });

  // Create a mesh and position it "above" the shot clock
  const numberCanvas = new THREE.Mesh(geometry, material);
  const numberCanvasIncrement = isLeftSide ? shotClockDepth : -shotClockDepth;
  const numberCanvasPosition = shotClockXPosition + numberCanvasIncrement;
  numberCanvas.position.set(numberCanvasPosition, 10, 0);
  numberCanvas.rotation.y = rotation.y;

  const updateShotClock = () => {
    /* Clear the whole canvas */
    context.clearRect(0, 0, canvas.width, canvas.height);

    /* Determine which time variables to update */
    let currentShotClockTime = rightShotClockTime;
    let currentGameClockTime = rightGameClockTime;
    if (isLeftSide) {
      currentShotClockTime = leftShotClockTime;
      currentGameClockTime = leftGameClockTime;
    }

    const isLastMinute = currentGameClockTime < 60;
    let gameClockText = "";
    if (isLastMinute) {
      // Display the remaining time in minutes:seconds.tenths format
      const remainingSeconds = (currentGameClockTime % 60).toFixed(1);
      const [seconds, tenths] = remainingSeconds.split(".");
      gameClockText = `${seconds}.${tenths}`;
    } else {
      // Display the remaining time in minutes:seconds format
      const minutes = Math.floor(currentGameClockTime / 60);
      const seconds = currentGameClockTime % 60;
      gameClockText = `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
    }

    /* Draw updated game clock and decrement times */
    context.font = `${fontSize / 2}px Arial`;
    context.fillStyle = GAME_CLOCK_COLOR;
    const gameClockX = canvas.width / 2;
    const gameClockY = canvas.height / 2 - 50;
    context.fillText(gameClockText, gameClockX, gameClockY);
    isLeftSide ? leftGameClockTime-- : rightGameClockTime--;

    const shotClockText =
      currentShotClockTime < 10
        ? `0${currentShotClockTime}`
        : currentShotClockTime;

    /* Draw updated 24-second clock and decrement times */
    const shotClockX = canvas.width / 2;
    const shotClockY = canvas.height / 2 + 50;
    context.fillStyle = SHOT_CLOCK_COLOR;
    context.fillText(shotClockText, shotClockX, shotClockY);
    isLeftSide ? leftShotClockTime-- : rightShotClockTime--;

    /* Reset game clock time back to 12 mins when it reaches 0*/
    if (currentGameClockTime === 0) {
      if (isLeftSide) {
        leftGameClockTime = QUARTER_LENGTH;
      } else {
        rightGameClockTime = QUARTER_LENGTH;
      }
    }

    /* Reset shot clock time back to 24 seconds when it reaches 0*/
    if (currentShotClockTime === 0) {
      if (isLeftSide) {
        leftShotClockTime = SHOT_CLOCK_LENGTH;
      } else {
        rightShotClockTime = SHOT_CLOCK_LENGTH;
      }
    }

    // Create a texture from the canvas and update the material
    const texture = new THREE.CanvasTexture(canvas);
    numberCanvas.material.map = texture;
    numberCanvas.material.needsUpdate = true;
  };

  /* Update the shot clock every second */
  setInterval(updateShotClock, 1000);

  /* Create "frame" bars that connect shot clock to back of the rim */
  const frameBarRadius = 0.25;
  const frameBarHeight = 1.5;
  const frameBarGeometry = new THREE.CylinderGeometry(
    frameBarRadius,
    frameBarRadius,
    frameBarHeight
  );

  const frameBarMaterial = new THREE.MeshStandardMaterial({
    color: STANCHION_COLOR,
  });
  const frameBar1 = new THREE.Mesh(frameBarGeometry, frameBarMaterial);
  const frameBar2 = new THREE.Mesh(frameBarGeometry, frameBarMaterial);

  frameBar1.position.set(shotClockXPosition, 10, 0.5);
  frameBar2.position.set(shotClockXPosition, 10, -0.5);

  frameBar1.rotation.x = -Math.PI / 4;
  frameBar1.rotation.z = -Math.PI / 4;

  frameBar2.rotation.x = Math.PI / 4;
  frameBar2.rotation.z = Math.PI / 4;

  /* Create a group to hold all the shot clock elements */
  const shotClockGroup = new THREE.Group();
  shotClockGroup.add(shotClock);
  shotClockGroup.add(numberCanvas);
  shotClockGroup.add(frameBar1);
  shotClockGroup.add(frameBar2);

  return shotClockGroup;
};

/* Create hoops */
const createHoop = (side) => {
  const isLeftSide = side === "LEFT";

  /* Create the main part of the stanchion */
  const stanchionMainWidth = 0.85;
  const stanchionMainHeight = 4.35;
  const stanchionMainDepth = 1.35;
  const stanchionMainGeometry = new THREE.BoxGeometry(
    stanchionMainWidth,
    stanchionMainHeight,
    stanchionMainDepth
  );
  const stanchionMainMaterial = new THREE.MeshStandardMaterial({
    color: STANCHION_COLOR,
  });
  const stanchionMain = new THREE.Mesh(
    stanchionMainGeometry,
    stanchionMainMaterial
  );

  const stanchionMainXPos = isLeftSide ? 2.58 : -1.85;
  const stanchionMainYPos = 3.8;
  stanchionMain.position.set(stanchionMainXPos, stanchionMainYPos, 0);

  /* Create the angled part of the stanchion */
  const stanchionAngleWidth = 2;
  const stanchionAngleHeight = 1;
  // const stanchionAngleDepth = 1.25;
  const stanchionAngleGeometry = new THREE.BoxGeometry(
    stanchionAngleWidth,
    stanchionAngleHeight,
    stanchionMainDepth
  );
  const stanchionAngleMaterial = new THREE.MeshStandardMaterial({
    color: STANCHION_COLOR,
  });
  const stanchionAngle = new THREE.Mesh(
    stanchionAngleGeometry,
    stanchionAngleMaterial
  );

  const stanchionAngleRotation = isLeftSide ? Math.PI / 5 : -Math.PI / 5;
  const stanchionAngleXMod = isLeftSide ? 0.65 : -0.65;
  const stanchionAngleXPos = stanchionMainXPos + stanchionAngleXMod;
  const stanchionAngleYPos = 6.25;
  stanchionAngle.position.set(stanchionAngleXPos, stanchionAngleYPos, 0);
  stanchionAngle.rotation.z = stanchionAngleRotation;

  /* Create stanchion bar */
  const stanchionBarWidth = 0.5;
  let stanchionBarHeight = 2;
  if (!isLeftSide) {
    stanchionBarHeight += 0.85;
  }
  const stanchionBarDepth = 0.8;
  const stanchionBarGeometry = new THREE.BoxGeometry(
    stanchionBarWidth,
    stanchionBarHeight,
    stanchionBarDepth
  );
  const stanchionBarMaterial = new THREE.MeshStandardMaterial({
    color: STANCHION_COLOR,
  });
  const stanchionBar = new THREE.Mesh(
    stanchionBarGeometry,
    stanchionBarMaterial
  );

  let stanchionBarXPos = isLeftSide ? 5 : -5;
  if (!isLeftSide) {
    stanchionBarXPos += 0.425;
  }
  stanchionBar.position.set(stanchionBarXPos, 6.5, 0);
  const stanchionBarRotation = isLeftSide ? DEGS_90 : -DEGS_90;
  stanchionBar.rotation.z = stanchionBarRotation;

  /* Create the arm that connects the stanchion to the backboard */
  const stanchionArmColor = 0xbb2b25;
  const stanchionArmWidth = 4.5;
  const stanchionArmHeight = 0.75;
  const stanchionArmDepth = 0.75;

  const armGeometry = new THREE.BoxGeometry(
    stanchionArmWidth,
    stanchionArmHeight,
    stanchionArmDepth
  );
  const armMaterial = new THREE.MeshStandardMaterial({
    color: stanchionArmColor,
  });
  const arm = new THREE.Mesh(armGeometry, armMaterial);
  const armXPosition = isLeftSide ? 8.25 : -8.25;
  const armYPosition = 6.5;
  arm.position.set(armXPosition, armYPosition, 0);

  /* Create the base of the stanchion */
  const baseGeometry = new THREE.BoxGeometry(3, 1.25, 2);
  const baseMaterial = new THREE.MeshStandardMaterial({ color: 0x261e1e });
  const base = new THREE.Mesh(baseGeometry, baseMaterial);
  const baseXPosition = isLeftSide ? 1.5 : -0.75;
  const baseYPosition = 1;
  base.position.set(baseXPosition, baseYPosition, 0);

  /* Group the parts of the stanchion together */
  const stanchionGroup = new THREE.Group();
  stanchionGroup.add(stanchionMain);
  stanchionGroup.add(stanchionAngle);
  stanchionGroup.add(stanchionBar);
  stanchionGroup.add(arm);
  stanchionGroup.add(base);

  /* Create the backboard */
  const backboardGroup = createBackboard({ isLeftSide });

  /* Create the shot clock */
  const shotClock = createShotClock({
    isLeftSide,
    position: backboardGroup.position,
    rotation: backboardGroup.rotation,
  });

  /* Create the rim */
  const netXPos = backboardGroup.position.x + (isLeftSide ? 1 : -1);

  const hoopRadius = 0.7;
  const netWidth = 0.1;
  const netHeight = 1.5;
  const rimYPos = netHeight + 4.5;

  // Creat part of the rim that connects to the backboard
  const rimConnectorGeometry = new THREE.BoxGeometry(0.25, 0.4, 0.5);
  const rimConnectorMaterial = new THREE.MeshStandardMaterial({
    color: RIM_COLOR,
  });
  const rimConnector = new THREE.Mesh(
    rimConnectorGeometry,
    rimConnectorMaterial
  );

  const rimConnectorXMod = isLeftSide ? 0.25 : -0.25;
  const rimConnectorXPos = backboardGroup.position.x + rimConnectorXMod;
  rimConnector.position.set(rimConnectorXPos, rimYPos, 0);

  // Create the ring that makes up the rim
  const rimGeometry = new THREE.RingGeometry(
    hoopRadius - netWidth / 2,
    hoopRadius + netWidth / 2,
    32
  );
  const rimMaterial = new THREE.MeshBasicMaterial({
    color: RIM_COLOR,
  });
  const rim = new THREE.Mesh(rimGeometry, rimMaterial);
  rim.rotation.x = -DEGS_90; // rotate the ring to be flat
  rim.position.set(netXPos, rimYPos, 0); // position at the top of the cylinder

  const rimGroup = new THREE.Group();
  rimGroup.add(rim);
  rimGroup.add(rimConnector);

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
  net.name = "net";

  const netYPos = rimYPos - 0.8;
  net.position.set(netXPos, netYPos, 0);

  const netGroup = new THREE.Group();
  netGroup.add(rimGroup);
  netGroup.add(net);

  /* Group all the hoop components together */
  const hoopGroup = new THREE.Group();
  hoopGroup.add(stanchionGroup);
  hoopGroup.add(backboardGroup);
  hoopGroup.add(shotClock);
  hoopGroup.add(netGroup);
  return hoopGroup;
};

const HOOP_X_POSITION = 45;

/* Create the "left" hoop */
const hoop1 = createHoop("LEFT");
hoop1.position.set(-HOOP_X_POSITION, 0, 0);
scene.add(hoop1);

/* Create the "right" hoop */
const hoop2 = createHoop("RIGHT");
hoop2.position.set(HOOP_X_POSITION, 0, 0);
scene.add(hoop2);

/* Create jumbotron at center of court */
const createJumbotron = () => {
  /* Creates BoxGeometry with: width, height, depth */
  const jumbotronWidth = 12;
  const jumbotronHeight = 12;
  const jumbotronDepth = 5;

  const jumbotronGeometry = new THREE.BoxGeometry(
    jumbotronWidth,
    jumbotronHeight,
    jumbotronDepth
  );

  const jumbotronMaterial = new THREE.MeshStandardMaterial({
    map: jumbotronTexture,
  });
  const jumbotron = new THREE.Mesh(jumbotronGeometry, jumbotronMaterial);

  // Create black materials for the top and bottom faces
  const blackMaterial = new THREE.MeshBasicMaterial({ color: 0x000000 });

  // Create meshes for the top and bottom faces
  const topGeometry = new THREE.PlaneGeometry(jumbotronWidth, jumbotronDepth);
  const jumboTop = new THREE.Mesh(topGeometry, blackMaterial);
  jumboTop.position.set(0, jumbotronHeight / 2, 0);
  jumboTop.rotation.x = -DEGS_90;

  const bottomGeometry = new THREE.PlaneGeometry(
    jumbotronWidth,
    jumbotronDepth
  );
  const jumboBottom = new THREE.Mesh(bottomGeometry, blackMaterial);
  jumboBottom.position.set(0, -jumbotronHeight / 2, 0);
  jumboBottom.rotation.x = DEGS_90;

  const jumbotronGroup = new THREE.Group();
  jumbotronGroup.add(jumbotron);
  jumbotronGroup.add(jumboTop);
  jumbotronGroup.add(jumboBottom);

  jumbotronGroup.position.set(0, 35, 0);
  return jumbotronGroup;
};
const jumbotron = createJumbotron();
scene.add(jumbotron);

/* TODO: Create sideline --- announcers table, courtside seats */
const scorersTableWidth = 25;
const scorersTableHeight = 3;
const scorersTableDepth = 3;
const scorersTableGeometry = new THREE.BoxGeometry(
  scorersTableWidth,
  scorersTableHeight,
  scorersTableDepth
);

const scorersTableFrontMaterial = new THREE.MeshStandardMaterial({
  map: scorersTableTexture,
});

// Combine the materials into a multi-material
const scorersTableMaterials = [
  BLACK_MATERIAL, // left side
  BLACK_MATERIAL, // right side
  BLACK_MATERIAL, // top
  BLACK_MATERIAL, // bottom
  scorersTableFrontMaterial, // front
  BLACK_MATERIAL, // back
];
const scorersTable = new THREE.Mesh(
  scorersTableGeometry,
  scorersTableMaterials
);
scorersTable.position.set(0, 1.5, -22.5);
scene.add(scorersTable);


console.log({ scorersTable });

/* Create the chairs/bench */


/* Create rendering loop -- renderer draws the scene everytime screen refreshes (60hz) 
       Basically, anything you want to move or change while the app is running has to go through the animate loop. 
      You can of course call other functions from there, so that you don't end up with an animate function that's hundreds of lines. 
*/

let basketballY = 5;
let basketballX = 0;

/* Enable drag controls */
const objects = [basketball];
const dragControls = new DragControls(objects, camera, renderer.domElement);

/* Disable orbit controls when dragging starts */
dragControls.addEventListener("dragstart", (event) => {
  orbitControls.enabled = false;
});

/* Enable orbit controls when dragging ends */
dragControls.addEventListener("dragend", (event) => {
  orbitControls.enabled = true;
});

dragControls.addEventListener("drag", (event) => {
  const isBasketball = event.object.name === "basketball";

  if (isBasketball) {
    const { x, y, z } = event.object.position;
    console.log({ x, y, z });

    if (y < 0) {
      basketball.position.copy(initialBallPosition);
    }
  }
});

const animate = () => {
  requestAnimationFrame(animate);

  /* 0.05 = amplitude, 0.005 = frequency */
  // basketballX += 0.05 * Math.cos(Date.now() * 0.005);
  // basketballY += 0.125 * Math.sin(Date.now() * 0.005);
  // basketball.position.set(basketballX, basketballY, 0);

  /* Update TWEEN */
  TWEEN.update();

  /* Update orbiting controls */
  orbitControls.update();

  renderer.render(scene, camera);
};
animate();
