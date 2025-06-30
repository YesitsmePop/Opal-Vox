import * as THREE from "three";
import { PointerLockControls } from "three/addons/controls/PointerLockControls.js";
import { blocks, materials, loadTexture } from "./blocks.js";
import { Tool } from "./tool.js";

const CENTER_SCREEN = new THREE.Vector2();

export class Player {
    radius = 0.5;
    height = 1.75;
    jumpSpeed = 10;
    onGround = false;

    maxSpeed = 7;
    input = new THREE.Vector3();
    velocity = new THREE.Vector3();
    #worldVelocity = new THREE.Vector3();

    camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.1, 200);
    controls = new PointerLockControls(this.camera, document.body);
    cameraHelper = new THREE.CameraHelper(this.camera);

    raycaster = new THREE.Raycaster(new THREE.Vector3(), new THREE.Vector3(), 0, 5);
    selectedCoords = null;
    activeBlockId = 1;
    selectedBlock = blocks.grass;

    tool = new Tool();

    /**
     * @param {THREE.Scene} scene
     */
    constructor(scene) {

        this.camera.position.set(8, 24, 8);
        this.camera.layers.enable(1);
        scene.add(this.camera);
        this.cameraHelper.visible = false;
        scene.add(this.cameraHelper);

        this.camera.add(this.tool);

        document.addEventListener("keydown", this.onKeyDown.bind(this));
        document.addEventListener("keyup", this.onKeyUp.bind(this));

        this.boundsHelper = new THREE.Mesh(
            new THREE.CylinderGeometry(this.radius, this.radius, this.height, 16),
            new THREE.MeshBasicMaterial({ wireframe: true })
        );
        this.boundsHelper.visible = false;
        scene.add(this.boundsHelper);

        const selectionGeometry = new THREE.BoxGeometry(1.01, 1.01, 1.01);
        this.selectionHelper = new THREE.Mesh(selectionGeometry, materials.selection.material);
        scene.add(this.selectionHelper);

        this.raycaster.layers.set(0);
    }


setSelectedBlock(block) {
        this.selectedBlock = block;
    }

    get worldVelocity() {
        this.#worldVelocity.copy(this.velocity);
        this.#worldVelocity.applyEuler(new THREE.Euler(0, this.camera.rotation.y, 0));
        return this.#worldVelocity;
    }

    /**
     * @param {World} world
     */
    update(world) {
        this.updateRaycaster(world);
        this.tool.update();
    }

    /**
     * @param {World} world
     */
    updateRaycaster(world) {
        this.raycaster.setFromCamera(CENTER_SCREEN, this.camera);
        const intersections = this.raycaster.intersectObject(world, true);

        if(intersections.length > 0){
            const intersection = intersections[0];

            const chunk = intersection.object.parent;

            const blockMatrix = new THREE.Matrix4();
            intersection.object.getMatrixAt(intersection.instanceId, blockMatrix);

            this.selectedCoords = chunk.position.clone();
            this.selectedCoords.applyMatrix4(blockMatrix);

            if(this.activeBlockId !== blocks.empty.id){
                this.selectedCoords.add(intersection.normal);
            }

            this.selectionHelper.position.copy(this.selectedCoords);
            this.selectionHelper.visible = true;
        } else{
            this.selectedCoords = null;
            this.selectionHelper.visible = false;
        }
    }

    /**
     * @param {THREE.Vector3} dv
     */
    applyWorldDeltaVelocity(dv) {
        dv.applyEuler(new THREE.Euler(0, -this.camera.rotation.y, 0));
        this.velocity.add(dv);
    }

    applyInputs(dt) {
        if(this.controls.isLocked){
            this.velocity.x = this.input.x;
            this.velocity.z = this.input.z;
            this.controls.moveRight(this.velocity.x * dt);
            this.controls.moveForward(this.velocity.z * dt);
            this.position.y += this.velocity.y * dt;

            document.getElementById("player-position").innerHTML = this.toString();
        }
    }

    updateBoundsHelper() {
        this.boundsHelper.position.copy(this.position);
        this.boundsHelper.position.y -= this.height / 2;
    }

    /**
     * Returns the current world position of the player
     * @type {THREE.Vector3}
     */
    get position() {
        return this.camera.position;
    }

    /**
     * @param {KeyboardEvent} event
     */
    onKeyDown(event){
        if(!this.controls.isLocked){
            this.controls.lock();
        }

        let itemName;

        switch(event.code){
            case "Digit1":
                itemName = "Pickaxe";
                this.activeBlockId = 1;

                document.getElementById(`toolbar-${this.previousBlockId}`).classList.remove("selected");
                break;
            case "Digit2":
                itemName = this.selectedBlock.name;
                this.activeBlockId = 2;

                document.getElementById(`toolbar-${this.previousBlockId}`).classList.remove("selected");
                break;
        }

        this.previousBlockId = this.activeBlockId;

        document.getElementById(`toolbar-${this.activeBlockId}`).classList.add("selected");

        switch(event.code){
            case "Digit1":
            case "Digit2":
                const item = document.getElementById("item");

                item.textContent = itemName;

                this.tool.visible = (this.activeBlockId === 1);

                break;
            case "KeyW":
                this.input.z = this.maxSpeed;
                break;
            case "KeyA":
                this.input.x = -this.maxSpeed;
                break;
            case "KeyS":
                this.input.z = -this.maxSpeed;
                break;
            case "KeyD":
                this.input.x = this.maxSpeed;
                break;
            case "KeyR":
                this.position.set(8, 24, 8);
                this.velocity.set(0, 0, 0);
                break;
            case "Space":
                if(this.onGround){
                    this.velocity.y += this.jumpSpeed;
                }
                break;
        }
    }

    /**
     * Event handler for "keydown event
     * @param {KeyboardEvent} event
     */
    onKeyUp(event){
        switch(event.code){
            case "KeyW":
                this.input.z = 0;
                break;
            case "KeyA":
                this.input.x = 0;
                break;
            case "KeyS":
                this.input.z = 0;
                break;
            case "KeyD":
                this.input.x = 0;
                break;
        }
    }

    toString() {
        let str = "";
        str += `X: ${this.position.x.toFixed(3)} `;
        str += `Y: ${this.position.y.toFixed(3)} `;
        str += `Z: ${this.position.z.toFixed(3)} `;
        return str;
    }
}