import * as THREE from 'three';
import Stats from 'three/examples/jsm/libs/stats.module.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { World } from './world';
import { Player } from './player';
import { Physics } from './physics';
import { createUI } from './ui';
import { blocks } from "./blocks.js";
import { ModelLoader } from "./modelLoader.js";
import { createBlockSelectionUI } from './blockSelection.js';

// Renderer setup
const renderer = new THREE.WebGLRenderer();
renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setClearColor(0x80a0e0);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
document.body.appendChild(renderer.domElement);

// Camera setup
const orbitCamera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
orbitCamera.position.set(-20, 20, -20);
orbitCamera.layers.enable(1);


// Commented out OrbitControls
/*
const controls = new OrbitControls(orbitCamera, renderer.domElement);
controls.target.set(32, 0, 32);
controls.update();
*/

// Scene setup
const scene = new THREE.Scene();
export const player = new Player(scene);
const physics = new Physics(scene);
const world = new World();
const gui = createUI(world, player, physics, scene);
scene.add(world);
scene.add(gui);

const modelLoader = new ModelLoader();
modelLoader.loadModels((models) => {
    player.tool.setMesh(models.pickaxe);
});

const sun = new THREE.DirectionalLight();
sun.intensity = 1.5;
sun.position.set(50, 50, 50);
sun.castShadow = true;

// Set the size of the sun's shadow box
sun.shadow.camera.left = -100;
sun.shadow.camera.right = 100;
sun.shadow.camera.top = 100;
sun.shadow.camera.bottom = -100;
sun.shadow.camera.near = 0.1;
sun.shadow.camera.far = 200;
sun.shadow.bias = -0.001;
sun.shadow.mapSize = new THREE.Vector2(2048, 2048);
scene.add(sun);
scene.add(sun.target);

const ambient = new THREE.AmbientLight();
ambient.intensity = 0.2;
scene.add(ambient);

scene.fog = new THREE.Fog(0x80a0e0, 30, 50);

// Events
window.addEventListener('resize', () => {
    player.camera.aspect = window.innerWidth / window.innerHeight;
    player.camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

// UI Setup
const stats = new Stats();
document.body.appendChild(stats.dom);

let statsVisible = true;
let positionVisible = true;
const playerPositionElement = document.getElementById("player-position");
document.addEventListener('keydown', (event) => {
    if (event.code === 'KeyQ') {
        statsVisible = !statsVisible;
        positionVisible = !positionVisible;

        if (statsVisible) {
            document.body.appendChild(stats.dom);
        } else {
            document.body.removeChild(stats.dom);
        }

        if (playerPositionElement) {
            if (positionVisible) {
                playerPositionElement.style.display = 'block';
                playerPositionElement.innerHTML = player.toString();
            } else {
                playerPositionElement.style.display = 'none';
            }
        }

    }
});

let totalCoal = 0;
let totalIron = 0;
let totalGold = 0;
let totalDiamond = 0;

let intervalId;
let blockDelay = 500;

function onMouseDown(event) {
    if (player.controls.isLocked && player.selectedCoords && player.selectedBlock) {
        if (player.activeBlockId === blocks.empty.id) {
            const block = world.getBlock(player.selectedCoords.x, player.selectedCoords.y, player.selectedCoords.z);
            if (block.id !== blocks.bedrock.id) {
                switch(block.id){
                    case blocks.coalOre.id:
                        totalCoal++;
                        break;
                    case blocks.ironOre.id:
                        totalIron++;
                        break;
                    case blocks.goldOre.id:
                        totalGold++;
                        break;
                    case blocks.diamondOre.id:
                        totalDiamond++;
                        break;
                    default:
                        break;
                }
                intervalId = setInterval(() => {
                    world.removeBlock(
                        player.selectedCoords.x,
                        player.selectedCoords.y,
                        player.selectedCoords.z
                    );
                    player.tool.startAnimation();
                }, blockDelay);
                //console.log('Total coal:', totalCoal, 'Total iron:', totalIron, 'Total gold:', totalGold, 'Total diamond:', totalDiamond);
                player.tool.startAnimation();
            }
        } else {
            world.addBlock(
                player.selectedCoords.x,
                player.selectedCoords.y,
                player.selectedCoords.z,
                player.selectedBlock.id
            );
        }
    }
}

function onMouseUp(event) {
    clearInterval(intervalId);
}

document.addEventListener("mousedown", onMouseDown);
document.addEventListener("mouseup", onMouseUp);

let isBlockSelectionMode = false;

document.addEventListener('keydown', (event) => {
    if (event.code === 'KeyE') {
        isBlockSelectionMode = !isBlockSelectionMode;

        const blockSelectionContainer = document.getElementById('block-selection-container');
        blockSelectionContainer.style.display = isBlockSelectionMode ? 'block' : 'none';

        if (isBlockSelectionMode) {
            document.exitPointerLock();
        }
    }
});



// Render loop
let previousTime = performance.now();
function animate() {
    requestAnimationFrame(animate);

    const currentTime = performance.now();
    const dt = (currentTime - previousTime) / 1000;

    sun.position.copy(player.camera.position);
    sun.position.sub(new THREE.Vector3(-50, -50, -50));
    sun.target.position.copy(player.camera.position);

    player.update(world);
    physics.update(dt, player, world);
    world.update(player);

    renderer.render(scene, player.camera);
    stats.update();

    if (playerPositionElement && positionVisible) {
        playerPositionElement.innerHTML = player.toString();
    }

    const oreStatsElement = document.getElementById("ore-stats");
    if (oreStatsElement) {
        oreStatsElement.innerHTML = `Total coal: ${totalCoal}<br>Total iron: ${totalIron}<br>Total gold: ${totalGold}<br>Total diamond: ${totalDiamond}`;
    }

    previousTime = currentTime;
}

createBlockSelectionUI();
animate();
