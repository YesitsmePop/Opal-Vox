import * as THREE from 'three';
import { SimplexNoise } from 'three/examples/jsm/math/SimplexNoise.js';
import { RNG } from './rng';
import { blocks, resources } from './blocks.js';

const geometry = new THREE.BoxGeometry(1, 1, 1);

export class WorldChunk extends THREE.Group {

    /**
     * @type {{
     *  id: number,
     *  instanceId: number
     * }[][][]}
     */
    data = [];

    constructor(size, params, dataStore) {
        super();
        this.loaded = false;
        this.size = size;
        this.params = params;
        this.dataStore = dataStore;
    }

    /**
     * Generates the world data and meshes
     */
    generate() {
        const start = performance.now();

        const rng = new RNG(this.params.seed);
        this.initializeTerrain();

        this.generateTerrain(rng);

        this.generateResources(rng);

        this.generateTrees(rng);
        this.generateClouds(rng);
        this.loadPlayerChanges();
        this.generateMeshes();

        this.loaded = true;
    }

    /**
     * Initializes an empty world
     */
    initializeTerrain() {
        this.data = Array.from({ length: this.size.width }, () =>
            Array.from({ length: this.size.height }, () =>
                Array.from({ length: this.size.width }, () => ({
                    id: blocks.empty.id,
                    instanceId: null
                }))
            )
        );
    }

    /**
     * Generates resources within the world
     * @param {RNG} rng Random number generator
     */
    generateResources(rng) {
        const simplex = new SimplexNoise(rng);
        resources.forEach(resource => {
            const { scale, scarcity, id } = resource;
            const invScale = { x: 1 / scale.x, y: 1 / scale.y, z: 1 / scale.z };
            for (let x = 0; x < this.size.width; x++) {
                for (let y = 0; y < this.size.height; y++) {
                    for (let z = 0; z < this.size.width; z++) {
                        const value = simplex.noise3d(
                            (this.position.x + x) * invScale.x,
                            (this.position.y + y) * invScale.y,
                            (this.position.z + z) * invScale.z
                        );

                        if (value > scarcity) {
                            const blockAbove = this.getBlock(x, y + 1, z);
                            const currentBlock = this.getBlock(x, y, z);
                            if (blockAbove && blockAbove.id !== blocks.empty.id && currentBlock && (currentBlock.id === blocks.dirt.id)) {
                                this.setBlockId(x, y, z, id);
                            }
                        }
                    }
                }
            }
        });
    }


    /**
     * Generates the world terrain data
     * @param {RNG} rng Random number generator
     */
    generateTerrain(rng) {
        const simplex = new SimplexNoise(rng);
        const { scale, magnitude, offset, waterOffset } = this.params.terrain;
        for (let x = 0; x < this.size.width; x++) {
            for (let z = 0; z < this.size.width; z++) {
                const noiseValue = simplex.noise(
                    (this.position.x + x) / scale,
                    (this.position.z + z) / scale
                );

                const scaledNoise = offset + magnitude * noiseValue;
                const height = Math.max(0, Math.min(Math.floor(scaledNoise), this.size.height - 1));

                for (let y = 0; y < this.size.height; y++) {
                    let blockId = blocks.empty.id;
                    if (y === 0) {
                        blockId = blocks.bedrock.id;
                    } else if (y <= waterOffset && y <= height) {
                        blockId = blocks.sand.id;
                    } else if (y === height) {
                        blockId = blocks.grass.id;
                    } else if (y < height && this.getBlock(x, y, z).id === blocks.empty.id) {
                        blockId = blocks.dirt.id;
                    }
                    this.setBlockId(x, y, z, blockId);
                }
            }
        }
    }

    /**
     * @param {RNG} rng
     */
    generateTrees(rng) {
        const generateTreeTrunk = (x, z) => {
            const { minHeight, maxHeight } = this.params.trees.trunk;
            const h = Math.round(minHeight + (maxHeight - minHeight) * rng.random());

            for (let y = 0; y < this.size.height; y++) {
                const block = this.getBlock(x, y, z);
                if (block && block.id === blocks.grass.id) {
                    for (let treeY = y + 1; treeY <= y + h; treeY++) {
                        this.setBlockId(x, treeY, z, blocks.oakWood.id);
                    }
                    generateTreeCanopy(x, y + h, z);
                    break;
                }
            }
        };

        const generateTreeCanopy = (centerX, centerY, centerZ) => {
            const { minRadius, maxRadius, density } = this.params.trees.canopy;
            const r = Math.round(minRadius + (maxRadius - minRadius) * rng.random());

            for (let x = -r; x <= r; x++) {
                for (let y = -r; y <= r; y++) {
                    for (let z = -r; z <= r; z++) {
                        if (x * x + y * y + z * z > r * r) continue;

                        const block = this.getBlock(centerX + x, centerY + y, centerZ + z);
                        if (block && block.id === blocks.empty.id && rng.random() < density) {
                            this.setBlockId(centerX + x, centerY + y, centerZ + z, blocks.leaves.id);
                        }
                    }
                }
            }
        };

        const rng1 = new RNG(this.params.seed);
        const offset = this.params.trees.canopy.maxRadius;
        for (let x = offset; x < this.size.width - offset; x++) {
            for (let z = offset; z < this.size.width - offset; z++) {
                if (rng1.random() < this.params.trees.frequency) {
                    generateTreeTrunk(x, z);
                }
            }
        }
    }

    /**
     * @param {RNG} rng
     */
    generateClouds(rng) {
        const simplex = new SimplexNoise(rng);
        const { scale, density } = this.params.clouds;
        const invScale = 1 / scale;
        for (let x = 0; x < this.size.width; x++) {
            for (let z = 0; z < this.size.width; z++) {
                const value = (simplex.noise(
                    (this.position.x + x) * invScale,
                    (this.position.z + z) * invScale
                ) + 1) * 0.5;

                if (value < density) {
                    this.setBlockId(x, this.size.height - 1, z, blocks.cloud.id);
                }
            }
        }
    }

    loadPlayerChanges() {
        for (let x = 0; x < this.size.width; x++) {
            for (let y = 0; y < this.size.height; y++) {
                for (let z = 0; z < this.size.width; z++) {
                    if (this.dataStore.contains(this.position.x, this.position.z, x, y, z)) {
                        const blockId = this.dataStore.get(this.position.x, this.position.z, x, y, z);
                        this.setBlockId(x, y, z, blockId);
                    }
                }
            }
        }
    }

    generateWater() {
        const material = new THREE.MeshLambertMaterial({
            color: 0x9090e0,
            transparent: true,
            opacity: 0.9,
            side: THREE.DoubleSide
        });

        const waterMesh = new THREE.Mesh(new THREE.PlaneGeometry(), material);
        waterMesh.rotateX(-Math.PI / 2.0);
        waterMesh.position.set(
            this.size.width / 2,
            this.params.terrain.waterOffset + 0.4,
            this.size.width / 2
        );
        waterMesh.scale.set(this.size.width, this.size.width, 1);
        waterMesh.layers.set(1);
        this.add(waterMesh);
    }

    /**
     * Generates the meshes from the world data
     */
    generateMeshes() {
        this.disposeInstances();

        this.generateWater();

        const maxCount = this.size.width * this.size.width * this.size.height;

        // Create lookup table of InstancedMesh's with the block id being the key
        const meshes = {};
        Object.values(blocks)
            .filter((blockType) => blockType.id !== blocks.empty.id)
            .forEach((blockType) => {
                const mesh = new THREE.InstancedMesh(geometry, blockType.material, maxCount);
                mesh.name = blockType.id;
                mesh.count = 0;
                mesh.castShadow = true;
                mesh.receiveShadow = true;
                meshes[blockType.id] = mesh;
            });

        // Add instances for each non-empty block
        const matrix = new THREE.Matrix4();
        for (let x = 0; x < this.size.width; x++) {
            for (let y = 0; y < this.size.height; y++) {
                for (let z = 0; z < this.size.width; z++) {
                    const blockId = this.getBlock(x, y, z).id;

                    // Ignore empty blocks
                    if (blockId === blocks.empty.id) continue;

                    const mesh = meshes[blockId];
                    const instanceId = mesh.count;

                    // Create a new instance if block is not obscured by other blocks
                    if (!this.isBlockObscured(x, y, z)) {
                        matrix.setPosition(x, y, z);
                        mesh.setMatrixAt(instanceId, matrix);
                        this.setBlockInstanceId(x, y, z, instanceId);
                        mesh.count++;
                    }
                }
            }
        }

        // Add all instanced meshes to the scene
        this.add(...Object.values(meshes));
    }

    /**
     * Gets the block data at (x, y, z)
     * @param {number} x
     * @param {number} y
     * @param {number} z
     * @returns {{id: number, instanceId: number}}
     */
    getBlock(x, y, z) {
        if (this.inBounds(x, y, z)) {
            return this.data[x][y][z];
        } else {
            return null;
        }
    }

    /**
     * @param {number} x
     * @param {number} y
     * @param {number} z
     * @param {number} blockId
     */
    addBlock(x, y, z, blockId) {
        if(this.getBlock(x, y, z).id === blocks.empty.id){
            this.setBlockId(x, y, z, blockId);
            this.addBlockInstance(x, y, z);
            this.dataStore.set(this.position.x, this.position.z, x, y, z, blockId);
        }
    }

    /**
     * @param {number} x
     * @param {number} y
     * @param {number} z
     */
    removeBlock(x, y, z) {
        const block = this.getBlock(x, y, z);
        if(block && block.id !== blocks.empty.id){
            this.deleteBlockInstance(x, y, z);
            this.setBlockId(x, y, z, blocks.empty.id);
            this.dataStore.set(this.position.x, this.position.z, x, y, z, blocks.empty.id);
        }
    }

    /**
     * @param {number} x
     * @param {number} y
     * @param {number} z
     */
    deleteBlockInstance(x, y, z) {
        const block = this.getBlock(x, y, z);

        if(block.instanceId === null) return;

        const mesh = this.children.find((instanceMesh) => instanceMesh.name === block.id);
        const instanceId = block.instanceId;

        const lastMatrix = new THREE.Matrix4();
        mesh.getMatrixAt(mesh.count - 1, lastMatrix);

        const v = new THREE.Vector3();
        v.applyMatrix4(lastMatrix);
        this.setBlockInstanceId(v.x, v.y, v.z, instanceId);

        mesh.setMatrixAt(instanceId, lastMatrix);

        mesh.count--;

        mesh.instanceMatrix.needsUpdate = true;
        mesh.computeBoundingSphere();

        this.setBlockInstanceId(x, y, z, null);
    }

    /**
     * @param {number} x
     * @param {number} y
     * @param {number} z
     */
    addBlockInstance(x, y, z) {
        const block = this.getBlock(x, y, z);

        if(block && block.id !== blocks.empty.id && !block.instanceId) {

            const mesh = this.children.find((instanceMesh) => instanceMesh.name === block.id);
            const instanceId = mesh.count++;
            this.setBlockInstanceId(x, y, z, instanceId);

            const matrix = new THREE.Matrix4();
            matrix.setPosition(x, y, z);
            mesh.setMatrixAt(instanceId, matrix);
            mesh.instanceMatrix.needsUpdate = true;

            mesh.computeBoundingSphere();
        }
    }

    /**
     * Sets the block id for the block at (x, y, z)
     * @param {number} x
     * @param {number} y
     * @param {number} z
     * @param {number} id
     */
    setBlockId(x, y, z, id) {
        if (this.inBounds(x, y, z)) {
            this.data[x][y][z].id = id;
        }
    }

    /**
     * Sets the block instance id for the block at (x, y, z)
     * @param {number} x
     * @param {number} y
     * @param {number} z
     * @param {number} instanceId
     */
    setBlockInstanceId(x, y, z, instanceId) {
        if (this.inBounds(x, y, z)) {
            this.data[x][y][z].instanceId = instanceId;
        }
    }

    /**
     * Checks if the (x, y, z) coordinates are within bounds
     * @param {number} x
     * @param {number} y
     * @param {number} z
     * @returns {boolean}
     */
    inBounds(x, y, z) {
        return (x >= 0 && x < this.size.width &&
            y >= 0 && y < this.size.height &&
            z >= 0 && z < this.size.width);
    }

    /**
     * Returns true if this block is completely hidden by other blocks
     * @param {number} x
     * @param {number} y
     * @param {number} z
     * @returns {boolean}
     */
    isBlockObscured(x, y, z) {
        const block = this.getBlock(x, y, z);

        const up = this.getBlock(x, y + 1, z)?.id ?? blocks.empty.id;
        const down = this.getBlock(x, y - 1, z)?.id ?? blocks.empty.id;
        const left = this.getBlock(x + 1, y, z)?.id ?? blocks.empty.id;
        const right = this.getBlock(x - 1, y, z)?.id ?? blocks.empty.id;
        const forward = this.getBlock(x, y, z + 1)?.id ?? blocks.empty.id;
        const back = this.getBlock(x, y, z - 1)?.id ?? blocks.empty.id;

        if (up === blocks.empty.id || up === blocks.glass.id || up === blocks.ice.id ||
            down === blocks.empty.id || down === blocks.glass.id || down === blocks.ice.id ||
            left === blocks.empty.id || left === blocks.glass.id || left === blocks.ice.id ||
            right === blocks.empty.id || right === blocks.glass.id || right === blocks.ice.id ||
            forward === blocks.empty.id || forward === blocks.glass.id || forward === blocks.ice.id ||
            back === blocks.empty.id || back === blocks.glass.id || back === blocks.ice.id){
            return false;
        } else {
            return true;
        }
    }


    disposeInstances() {
        this.traverse((obj) => {
            if(obj.dispose) obj.dispose();
        });
        this.clear();
    }

}
