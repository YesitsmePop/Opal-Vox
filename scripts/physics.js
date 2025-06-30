import * as THREE from "three";
import { Player } from "./player.js";
import { WorldChunk } from "./worldChunk.js";
import { blocks } from "./blocks.js";

const collisionMaterial = new THREE.MeshBasicMaterial({
    color: 0xff0000,
    transparent: true,
    opacity: 0.2
});
const collisionGeometry = new THREE.BoxGeometry(1.001, 1.001, 1.001);

const contactMaterial = new THREE.MeshBasicMaterial({
   wireframe: true,
   color: 0x00ff00
});
const contactGeometry = new THREE.SphereGeometry(0.05, 6, 6);

export class Physics {
    simulationRate = 200;
    timestep = 1 / this.simulationRate;
    accumulator = 0;

    gravity = 32;

    constructor(scene) {
        this.helpers = new THREE.Group();
        //IMPORTANT LINE!!! Set to true for debugging purposes
        this.helpers.visible = false;
        scene.add(this.helpers);
    }

    /**
     * Moves the physics simulation forward in time by "dt"
     * @param {number} dt
     * @param {Player} player
     * @param {WorldChunk} world
     */
    update(dt, player, world) {
        this.accumulator += dt;

        while(this.accumulator >= this.timestep) {
            this.helpers.clear();
            player.velocity.y -= this.gravity * this.timestep;
            player.applyInputs(this.timestep);
            player.updateBoundsHelper();
            this.detectCollisions(player, world);
            this.accumulator -= this.timestep;
        }
    }

    /**
     * Main function for collision detection
     * @param {Player} player
     * @param {WorldChunk} world
     */
    detectCollisions(player, world) {
        player.onGround = false;

        const candidates = this.broadPhase(player, world);
        const collisions = this.narrowPhase(candidates, player);

        if(collisions.length > 0){
            this.resolveCollisions(collisions, player);
        }
    }

    /**
     * Possible blocks the player may be colliding with
     * @param {Player} player
     * @param {WorldChunk} world
     * @returns {[]}
     */
    broadPhase(player, world) {
        const candidates = [];

        const extents = {
            x: {
                min: Math.floor(player.position.x - player.radius),
                max: Math.ceil(player.position.x + player.radius)
            },
            y: {
                min: Math.floor(player.position.y - player.height),
                max: Math.ceil(player.position.y)
            },
            z: {
                min: Math.floor(player.position.z - player.radius),
                max: Math.ceil(player.position.z + player.radius)
            }
        };

        for(let x = extents.x.min; x <= extents.x.max; x++){
            for(let y = extents.y.min; y <= extents.y.max; y++){
                for(let z = extents.z.min; z <= extents.z.max; z++){
                    const blockId = world.getBlock(x, y, z)?.id;
                    if (blockId && blockId !== blocks.empty.id) {
                        const block = { x, y, z};
                        candidates.push(block);
                        this.addCollisionHelper(block);
                    }
                }
            }
        }

        return candidates;
    }

    /**
     * @param {{x: number, y: number, z: number}[]} candidates
     * @param {Player} player
     * @returns
     */
    narrowPhase(candidates, player) {
        const collisions = [];

        for(const block of candidates) {
            const p = player.position;
            const closestPoint = {
                x: Math.max(block.x - 0.5, Math.min(p.x, block.x + 0.5)),
                y: Math.max(block.y - 0.5, Math.min(p.y - (player.height / 2), block.y + 0.5)),
                z: Math.max(block.z - 0.5, Math.min(p.z, block.z + 0.5))
            };

            const dx = closestPoint.x - player.position.x;
            const dy = closestPoint.y - (player.position.y - (player.height / 2));
            const dz = closestPoint.z - player.position.z;

            if(this.pointInPlayerBoundingCylinder(closestPoint, player)) {
                const overlapY = (player.height / 2) - Math.abs(dy);
                const overlapXZ = player.radius - Math.sqrt(dx * dx + dz * dz);

                let normal, overlap;
                if(overlapY < overlapXZ){
                    normal = new THREE.Vector3(0, -Math.sign(dy), 0);
                    overlap = overlapY;
                    player.onGround = true;
                } else {
                    normal = new THREE.Vector3(-dx, 0, -dz).normalize();
                    overlap = overlapXZ;
                }

                collisions.push({
                    block,
                    contactPoint: closestPoint,
                    normal,
                    overlap
                });

                this.addContactPointHelper(closestPoint);

            }
        }

        return collisions;
    }

    /**
     * @param {object} collisions
     * @param {Player} player
     */
    resolveCollisions(collisions, player) {
        collisions.sort((a, b) => {
           return a.overlap < b.overlap;
        });
        for(const collision of collisions){

            if(!this.pointInPlayerBoundingCylinder(collision.contactPoint, player))
                continue;

            let deltaPosition = collision.normal.clone();
            deltaPosition.multiplyScalar(collision.overlap);
            player.position.add(deltaPosition);

            let magnitude = player.worldVelocity.dot(collision.normal);
            let velocityAdjustment = collision.normal.clone().multiplyScalar(magnitude);

            player.applyWorldDeltaVelocity(velocityAdjustment.negate());
        }
    }

    /**
     * Visualizes the block the player is colliding with
     * @param {THREE.Object3D} block
     */
    addCollisionHelper(block) {
        const blockMesh = new THREE.Mesh(collisionGeometry, collisionMaterial);
        blockMesh.position.copy(block);
        this.helpers.add(blockMesh);
    }

    /**
     * @param {{x, y, z}} p
     */
    addContactPointHelper(p) {
        const contactMesh = new THREE.Mesh(contactGeometry, contactMaterial);
        contactMesh.position.copy(p);
        this.helpers.add(contactMesh);
    }

    /**
     * @param {{x: number, y: number, z: number}} p
     * @param {Player} player
     * @returns {boolean}
     */
    pointInPlayerBoundingCylinder(p, player) {
        const dx = p.x - player.position.x;
        const dy = p.y - (player.position.y - (player.height / 2));
        const dz = p.z - player.position.z;
        const r_sq = dx * dx + dz * dz;

        return (Math.abs(dy) < player.height / 2) && (r_sq < player.radius * player.radius);
    }

}