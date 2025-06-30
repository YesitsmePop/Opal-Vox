import * as THREE from "three";

const textureLoader = new THREE.TextureLoader();

export function loadTexture(path) {
    const texture = textureLoader.load(path);
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.minFilter = THREE.NearestFilter;
    texture.magFilter = THREE.NearestFilter;
    return texture;
}

export const textures = {
    dirt: loadTexture("textures/dirt.png"),
    grass: loadTexture("textures/grass.png"),
    grassSide: loadTexture("textures/grass_side.png"),
    stone: loadTexture("textures/stone.png"),
    coalOre: loadTexture("textures/coal_ore.png"),
    ironOre: loadTexture("textures/iron_ore.png"),
    leaves: loadTexture("textures/leaves.png"),
    oakSide: loadTexture("textures/oak_side.png"),
    oakTop: loadTexture("textures/oak_top.png"),
    sand: loadTexture("textures/sand.png"),
    snow: loadTexture("textures/snow.png"),
    snowSide: loadTexture("textures/snow_side.png"),
    jungleSide: loadTexture("textures/jungle_tree_side.png"),
    jungleTop: loadTexture("textures/jungle_tree_top.png"),
    cactusSide: loadTexture("textures/cactus_side.png"),
    cactusTop: loadTexture("textures/cactus_top.png"),
    glass: loadTexture("textures/glass.png"),
    oakPlanks: loadTexture("textures/oak_planks.png"),
    junglePlanks: loadTexture("textures/jungle_planks.png"),
    jungleLeaves: loadTexture("textures/jungle_leaves.png"),
    diamondOre: loadTexture("textures/diamond_ore.png"),
    goldOre: loadTexture("textures/gold_ore.png"),
    whiteConcrete: loadTexture("textures/white_concrete.png"),
    redConcrete: loadTexture("textures/red_concrete.png"),
    orangeConcrete: loadTexture("textures/orange_concrete.png"),
    yellowConcrete: loadTexture("textures/yellow_concrete.png"),
    greenConcrete: loadTexture("textures/green_concrete.png"),
    blueConcrete: loadTexture("textures/blue_concrete.png"),
    purpleConcrete: loadTexture("textures/purple_concrete.png"),
    blackConcrete: loadTexture("textures/black_concrete.png"),
    stoneBricks: loadTexture("textures/stone_bricks.png"),
    ice: loadTexture("textures/ice.png"),
    selection: loadTexture("textures/selection.png"),
    bedrock: loadTexture("textures/bedrock.png"),
};

export const blocks = {
    empty: {
        id: 1,
        name: "empty",
        texture: "textures/empty.png"
    },
    grass: {
        id: 100,
        name: "Grass",
        texture: "textures/grass_side.png",
        color: 0x559020,
        material: [
            new THREE.MeshLambertMaterial({map: textures.grassSide}),
            new THREE.MeshLambertMaterial({map: textures.grassSide}),
            new THREE.MeshLambertMaterial({map: textures.grass}),
            new THREE.MeshLambertMaterial({map: textures.dirt}),
            new THREE.MeshLambertMaterial({map: textures.grassSide}),
            new THREE.MeshLambertMaterial({map: textures.grassSide})
        ]
    },
    dirt: {
        id: 101,
        name: "Dirt",
        texture: "textures/dirt.png",
        color: 0x807020,
        material: new THREE.MeshLambertMaterial({map: textures.dirt})
    },
    oakWood: {
        id: 102,
        name: "Oak Wood",
        texture: "textures/oak_side.png",
        color: 0x806060,
        material: [
            new THREE.MeshLambertMaterial({map: textures.oakSide}),
            new THREE.MeshLambertMaterial({map: textures.oakSide}),
            new THREE.MeshLambertMaterial({map: textures.oakTop}),
            new THREE.MeshLambertMaterial({map: textures.oakTop}),
            new THREE.MeshLambertMaterial({map: textures.oakSide}),
            new THREE.MeshLambertMaterial({map: textures.oakSide}),
        ]
    },
    jungleWood: {
        id: 103,
        name: "Jungle Wood",
        texture: "textures/jungle_tree_side.png",
        material: [
            new THREE.MeshLambertMaterial({map: textures.jungleSide}),
            new THREE.MeshLambertMaterial({map: textures.jungleSide}),
            new THREE.MeshLambertMaterial({map: textures.jungleTop}),
            new THREE.MeshLambertMaterial({map: textures.jungleTop}),
            new THREE.MeshLambertMaterial({map: textures.jungleSide}),
            new THREE.MeshLambertMaterial({map: textures.jungleSide})
        ]
    },
    leaves: {
        id: 104,
        name: "Leaves",
        texture: "textures/leaves.png",
        material: new THREE.MeshLambertMaterial({map: textures.leaves})
    },
    jungleLeaves: {
        id: 105,
        name: "Jungle Leaves",
        texture: "textures/jungle_leaves.png",
        material: new THREE.MeshLambertMaterial({map: textures.jungleLeaves})
    },
    sand: {
        id: 106,
        name: "Sand",
        texture: "textures/sand.png",
        material: new THREE.MeshLambertMaterial({map: textures.sand})
    },
    cactus: {
        id: 107,
        name: "Cactus",
        texture: "textures/cactus_side.png",
        material: [
            new THREE.MeshLambertMaterial({map: textures.cactusSide}),
            new THREE.MeshLambertMaterial({map: textures.cactusSide}),
            new THREE.MeshLambertMaterial({map: textures.cactusTop}),
            new THREE.MeshLambertMaterial({map: textures.cactusTop}),
            new THREE.MeshLambertMaterial({map: textures.cactusSide}),
            new THREE.MeshLambertMaterial({map: textures.cactusSide}),
        ]
    },
    snow: {
        id: 108,
        name: "Snow",
        texture: "textures/snow_side.png",
        material: [
            new THREE.MeshLambertMaterial({map: textures.snowSide}),
            new THREE.MeshLambertMaterial({map: textures.snowSide}),
            new THREE.MeshLambertMaterial({map: textures.snow}),
            new THREE.MeshLambertMaterial({map: textures.snow}),
            new THREE.MeshLambertMaterial({map: textures.snowSide}),
            new THREE.MeshLambertMaterial({map: textures.snowSide}),
        ]
    },
    ice: {
        id: 109,
        name: "Ice",
        texture: "textures/ice.png",
        material: new THREE.MeshLambertMaterial({map: textures.ice, transparent: true, opacity: 0.8})
    },
    stone: {
        id: 200,
        name: "Stone",
        texture: "textures/stone.png",
        color: 0x808080,
        scale: {x: 40, y: 40, z: 40},
        scarcity: 0.35,
        material: new THREE.MeshLambertMaterial({map: textures.stone})
    },
    coalOre: {
        id: 201,
        name: "Coal Ore",
        texture: "textures/coal_ore.png",
        color: 0x202020,
        scale: {x: 10, y: 10, z: 10},
        scarcity: 0.7,
        material: new THREE.MeshLambertMaterial({map: textures.coalOre})
    },
    ironOre: {
        id: 202,
        name: "Iron Ore",
        texture: "textures/iron_ore.png",
        color: 0x806060,
        scale: {x: 6, y: 6, z: 6},
        scarcity: 0.85,
        material: new THREE.MeshLambertMaterial({map: textures.ironOre})
    },
    goldOre: {
        id: 203,
        name: "Gold Ore",
        texture: "textures/gold_ore.png",
        scale: {x: 4, y: 4, z: 4},
        scarcity: 0.90,
        material: new THREE.MeshLambertMaterial({map: textures.goldOre})
    },
    diamondOre: {
        id: 204,
        name: "Diamond Ore",
        texture: "textures/diamond_ore.png",
        scale: {x: 2, y: 2, z: 2},
        scarcity: 0.95,
        material: new THREE.MeshLambertMaterial({map: textures.diamondOre})
    },
    glass: {
        id: 300,
        name: "Glass",
        texture: "textures/glass.png",
        material: [
            new THREE.MeshLambertMaterial({ map: textures.glass, transparent: true, opacity: 0.8 }),
            new THREE.MeshLambertMaterial({ map: textures.glass, transparent: true, opacity: 0.8 }),
            new THREE.MeshLambertMaterial({ map: textures.glass, transparent: true, opacity: 0.8 }),
            new THREE.MeshLambertMaterial({ map: textures.glass, transparent: true, opacity: 0.8 }),
            new THREE.MeshLambertMaterial({ map: textures.glass, transparent: true, opacity: 0.8 }),
            new THREE.MeshLambertMaterial({ map: textures.glass, transparent: true, opacity: 0.8 })
        ]
    },
    oakPlanks: {
        id: 301,
        name: "Oak Planks",
        texture: "textures/oak_planks.png",
        material: new THREE.MeshLambertMaterial({map: textures.oakPlanks})
    },
    junglePlanks: {
        id: 302,
        name: "Jungle Planks",
        texture: "textures/jungle_planks.png",
        material: new THREE.MeshLambertMaterial({map: textures.junglePlanks})
    },
    whiteConcrete: {
        id: 303,
        name: "White Concrete",
        texture: "textures/white_concrete.png",
        material: new THREE.MeshLambertMaterial({map: textures.whiteConcrete})
    },
    redConcrete: {
        id: 304,
        name: "Red Concrete",
        texture: "textures/red_concrete.png",
        material: new THREE.MeshLambertMaterial({map: textures.redConcrete})
    },
    orangeConcrete: {
        id: 305,
        name: "Orange Concrete",
        texture: "textures/orange_concrete.png",
        material: new THREE.MeshLambertMaterial({map: textures.orangeConcrete})
    },
    yellowConcrete: {
        id: 306,
        name: "Yellow Concrete",
        texture: "textures/yellow_concrete.png",
        material: new THREE.MeshLambertMaterial({map: textures.yellowConcrete})
    },
    greenConcrete: {
        id: 307,
        name: "Green Concrete",
        texture: "textures/green_concrete.png",
        material: new THREE.MeshLambertMaterial({map: textures.greenConcrete})
    },
    blueConcrete: {
        id: 308,
        name: "Blue Concrete",
        texture: "textures/blue_concrete.png",
        material: new THREE.MeshLambertMaterial({map: textures.blueConcrete})
    },
    purpleConcrete: {
        id: 309,
        name: "Purple Concrete",
        texture: "textures/purple_concrete.png",
        material: new THREE.MeshLambertMaterial({map: textures.purpleConcrete})
    },
    blackConcrete: {
        id: 310,
        name: "Black Concrete",
        texture: "textures/black_concrete.png",
        material: new THREE.MeshLambertMaterial({map: textures.blackConcrete})
    },
    stoneBricks: {
        id: 311,
        name: "Stone Bricks",
        texture: "textures/stone_bricks.png",
        material: new THREE.MeshLambertMaterial({map: textures.stoneBricks})
    },
    cloud: {
        id: 999,
        name: "Cloud",
        texture: "textures/cloud.png",
        material: new THREE.MeshBasicMaterial({color: 0xf0f0f0})
    },
    bedrock: {
        id: 1000,
        name: "Bedrock",
        texture: "textures/bedrock.png",
        scale: {x: 0, y: 0, z: 0},
        scarcity: 1,
        material: new THREE.MeshLambertMaterial({map: textures.bedrock})
    }
}

export const materials = {
    selection: {
        state: 0,
        material: new THREE.MeshBasicMaterial({map: textures.selection, transparent: true, opacity: 0.7})
    }
}

export const resources = [
    blocks.stone,
    blocks.coalOre,
    blocks.ironOre,
    blocks.goldOre,
    blocks.diamondOre
]