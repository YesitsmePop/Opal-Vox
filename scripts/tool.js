import * as THREE from "three";

export class Tool extends THREE.Group {
    animate = false;
    animationAmplitude = 0.5;
    animationDuration = 400;
    animationStart = 0;
    animationSpeed = 0.025;
    animation = undefined;
    toolMesh = undefined;

    get animationTime() {
        return performance.now() - this.animationStart;
    }

    startAnimation() {
        if(this.animate) return;

        this.animate = true;
        this.animationStart = performance.now();

        clearTimeout(this.animate);

        this.animation = setTimeout(() => {
            this.animate = false;
            this.toolMesh.rotation.z = 0;
        }, this.animationDuration);
    }

    update() {
        if(this.animate && this.toolMesh){
            this.toolMesh.rotation.z = this.animationAmplitude * Math.sin(this.animationTime * this.animationSpeed);

        }
    }

    /**
     * @param {THREE.Mesh} mesh
     */
    setMesh(mesh) {
        this.clear();

        this.toolMesh = mesh;
        this.add(this.toolMesh);
        mesh.receiveShadow = true;
        mesh.castShadow = true;

        this.position.set(0.8, -0.3, -0.3);
        this.scale.set(0.5, 0.5, 0.5);
        this.rotation.z = Math.PI / 2;
        this.rotation.y = Math.PI + 1.4;
    }
}