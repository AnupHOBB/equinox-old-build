import * as THREE from 'three'

export class RayCast
{
    constructor(camera)
    {
        this.raycastObjects = []
        this.camera = camera
    }

    addObject(sceneObject)
    {
        this.raycastObjects.push(sceneObject)
    }

    raycast(rasterCoord)
    {
        let screenSpaceX = (rasterCoord.x / window.innerWidth) *  2 - 1
        let screenSpaceY = -(rasterCoord.y / window.innerHeight) *  2 + 1
        let rayCaster = new THREE.Raycaster()
        rayCaster.setFromCamera({ x: screenSpaceX, y: screenSpaceY }, this.camera)
        let hitObjects = rayCaster.intersectObjects(this.raycastObjects)
        return (hitObjects.length > 0) ? hitObjects[0].point : undefined
    }
}