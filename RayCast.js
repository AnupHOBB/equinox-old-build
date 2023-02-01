import * as THREE from 'three'

export class RayCast
{
    constructor()
    {
        this.raycastObjects = []
        this.rayCaster = new THREE.Raycaster()
    }

    addObject(sceneObject)
    {
        this.raycastObjects.push(sceneObject.get())
    }

    raycast(rasterCoord, cameraManager)
    {
        let screenSpaceX = (rasterCoord.x / window.innerWidth) *  2 - 1
        let screenSpaceY = -(rasterCoord.y / window.innerHeight) *  2 + 1
        this.rayCaster.setFromCamera({ x: screenSpaceX, y: screenSpaceY }, cameraManager.getThreeJsCamera())
        let hitObjects = this.rayCaster.intersectObjects(this.raycastObjects)
        return (hitObjects.length > 0) ? hitObjects[0].point : undefined
    }
}