import * as THREE from "three";
import { WorldChunk } from "./worldChunk.js";
import { DataStore } from "./dataStore.js";

export class World extends THREE.Group {
    asyncLoading = true;
    drawDistance = 1;
    chunkSize = { width: 32, height: 32 };

    params = {
        seed: 0,
        terrain: {
            scale: 60,
            magnitude: 10,
            offset: 10,
            waterOffset: 3
        },
        trees: {
            trunk: { minHeight: 5, maxHeight: 7 },
            canopy: { minRadius: 2, maxRadius: 3, density: 0.8 },
            frequency: 0.005
        },
        clouds: {
            scale: 20,
            density: 0.25
        }
    };

    dataStore = new DataStore();
    visibleChunks = new Set();

    constructor(seed = 0) {
        super();
        this.seed = seed;
        this.chunkQueue = [];
    }

    generate() {
        this.dataStore.clear();
        this.disposeChunks();

        for (let x = -this.drawDistance; x <= this.drawDistance; x++) {
            for (let z = -this.drawDistance; z <= this.drawDistance; z++) {
                this.queueChunk(x, z);
            }
        }
        this.processChunkQueue();
    }

    /**
     * @param {Player} player
     */
    update(player) {
        const visibleChunks = this.getVisibleChunks(player);
        this.updateVisibleChunks(visibleChunks);
        this.processChunkQueue();
    }

    /**
     * @param {Player} player
     * @returns {{x: number, z: number}[]}
     */
    getVisibleChunks(player) {
        const visibleChunks = [];

        const coords = this.worldToChunkCoords(
            player.position.x,
            0,
            player.position.z
        );

        for (let x = coords.chunk.x - this.drawDistance; x <= coords.chunk.x + this.drawDistance; x++) {
            for (let z = coords.chunk.z - this.drawDistance; z <= coords.chunk.z + this.drawDistance; z++) {
                visibleChunks.push({ x, z });
            }
        }

        return visibleChunks;
    }

    updateVisibleChunks(visibleChunks) {
        const newVisibleChunks = new Set(visibleChunks.map(({ x, z }) => `${x},${z}`));

        // Remove unused chunks
        this.visibleChunks.forEach((key) => {
            if (!newVisibleChunks.has(key)) {
                const [x, z] = key.split(',').map(Number);
                this.removeChunk(x, z);
            }
        });

        // Add new chunks
        newVisibleChunks.forEach((key) => {
            if (!this.visibleChunks.has(key)) {
                const [x, z] = key.split(',').map(Number);
                this.queueChunk(x, z);
            }
        });

        this.visibleChunks = newVisibleChunks;
    }

    queueChunk(x, z) {
        this.chunkQueue.push({ x, z });
    }

    processChunkQueue() {
        if (this.chunkQueue.length === 0) return;

        const chunksToProcess = this.chunkQueue.splice(0, 5);
        for (const { x, z } of chunksToProcess) {
            this.generateChunk(x, z);
        }

        requestAnimationFrame(() => this.processChunkQueue());
    }

    removeChunk(x, z) {
        const chunk = this.getChunk(x, z);
        if (chunk) {
            chunk.disposeInstances();
            this.remove(chunk);
        }
    }

    /**
     * @param {number} x
     * @param {number} z
     */
    generateChunk(x, z) {
        const chunk = new WorldChunk(this.chunkSize, this.params, this.dataStore);
        chunk.position.set(x * this.chunkSize.width, 0, z * this.chunkSize.width);
        chunk.userData = { x, z };

        if (this.asyncLoading) {
            requestIdleCallback(() => {
                chunk.generate();
                this.add(chunk);
            }, { timeout: 1000 });
        } else {
            chunk.generate();
            this.add(chunk);
        }
    }

    /**
     * @param {number} x
     * @param {number} y
     * @param {number} z
     * @returns {{id: number, instanceId: number} | null}
     */
    getBlock(x, y, z) {
        const coords = this.worldToChunkCoords(x, y, z);
        const chunk = this.getChunk(coords.chunk.x, coords.chunk.z);

        if (chunk && chunk.loaded) {
            return chunk.getBlock(coords.block.x, coords.block.y, coords.block.z);
        } else {
            return null;
        }
    }

    /**
     * @param {number} x
     * @param {number} y
     * @param {number} z
     * @returns {{
     *     chunk: { x: number, z: number},
     *     block: {x: number, y: number, z: number}
     *     }}
     */
    worldToChunkCoords(x, y, z) {
        const chunkCoords = {
            x: Math.floor(x / this.chunkSize.width),
            z: Math.floor(z / this.chunkSize.width)
        };

        const blockCoords = {
            x: x - this.chunkSize.width * chunkCoords.x,
            y,
            z: z - this.chunkSize.width * chunkCoords.z
        };

        return {
            chunk: chunkCoords,
            block: blockCoords
        };
    }

    /**
     * @param {number} chunkX
     * @param {number} chunkZ
     * @returns {WorldChunk | null}
     */
    getChunk(chunkX, chunkZ) {
        return this.children.find((chunk) => {
            return chunk.userData.x === chunkX && chunk.userData.z === chunkZ;
        });
    }

    disposeChunks() {
        this.traverse((chunk) => {
            if (chunk.disposeInstances) {
                chunk.disposeInstances();
            }
        });
        this.clear();
    }

    /**
     * @param {number} x
     * @param {number} y
     * @param {number} z
     * @param {number} blockId
     */
    addBlock(x, y, z, blockId) {
        const coords = this.worldToChunkCoords(x, y, z);
        const chunk = this.getChunk(coords.chunk.x, coords.chunk.z);

        if (chunk) {
            chunk.addBlock(coords.block.x, coords.block.y, coords.block.z, blockId);

            this.hideBlock(x - 1, y, z);
            this.hideBlock(x + 1, y, z);
            this.hideBlock(x, y - 1, z);
            this.hideBlock(x, y + 1, z);
            this.hideBlock(x, y, z - 1);
            this.hideBlock(x, y, z + 1);
        }
    }

    /**
     * @param {number} x
     * @param {number} y
     * @param {number} z
     */
    removeBlock(x, y, z) {
        const coords = this.worldToChunkCoords(x, y, z);
        const chunk = this.getChunk(coords.chunk.x, coords.chunk.z);

        if (chunk) {
            chunk.removeBlock(coords.block.x, coords.block.y, coords.block.z);

            this.revealBlock(x - 1, y, z);
            this.revealBlock(x + 1, y, z);
            this.revealBlock(x, y - 1, z);
            this.revealBlock(x, y + 1, z);
            this.revealBlock(x, y, z - 1);
            this.revealBlock(x, y, z + 1);
        }
    }

    /**
     * @param {number} x
     * @param {number} y
     * @param {number} z
     */
    revealBlock(x, y, z) {
        const coords = this.worldToChunkCoords(x, y, z);
        const chunk = this.getChunk(coords.chunk.x, coords.chunk.z);

        if (chunk) {
            chunk.addBlockInstance(coords.block.x, coords.block.y, coords.block.z);
        }
    }

    /**
     * @param {number} x
     * @param {number} y
     * @param {number} z
     */
    hideBlock(x, y, z) {
        const coords = this.worldToChunkCoords(x, y, z);
        const chunk = this.getChunk(coords.chunk.x, coords.chunk.z);

        if (chunk && chunk.isBlockObscured(coords.block.x, coords.block.y, coords.block.z)) {
            chunk.deleteBlockInstance(coords.block.x, coords.block.y, coords.block.z);
        }
    }
}
