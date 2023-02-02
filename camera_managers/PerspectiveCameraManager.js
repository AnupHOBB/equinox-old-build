import * as THREE from 'three'
import { MATHS } from '../helpers/maths.js'
import { MATRIX } from '../helpers/matrix.js'

export class PerspectiveCameraManager
{
    constructor(fov)
    {
        this.camera = new THREE.PerspectiveCamera(fov, window.innerWidth/window.innerHeight, 0.1, 1000)
        this.camera.rotation.order = 'YXZ'
        this.viewMatrix = this.getViewMatrix()
    }

    setAspectRatio(ratio)
    {
        this.camera.aspect = ratio
    }

    worldToRaster(worldPosition)
    {
        let viewPosition = MATRIX.mat4XVec3(this.viewMatrix, worldPosition)
        if (viewPosition.z < this.camera.near || viewPosition.z > this.camera.far)
            return [, false]
        let projectedX = (this.camera.near * viewPosition.x)/viewPosition.z
        let projectedY = (this.camera.near * viewPosition.y)/viewPosition.z
        let screenTopBound = this.camera.near * Math.tan(MATHS.toRadians(this.camera.fov/2))
        let screenBottomBound = -screenTopBound
        let screenRightBound = screenTopBound * this.camera.aspect
        let screenLeftBound = -screenRightBound
        if (projectedX < screenLeftBound || projectedX > screenRightBound)
            return [, false]
        if (projectedY < this.screenBottomBound || projectedY > screenTopBound)
            return [, false]
        let rasterX = (window.innerWidth * (projectedX - screenLeftBound))/(screenRightBound - screenLeftBound)
        let rasterY = (window.innerHeight * (screenTopBound - projectedY))/(screenTopBound - screenBottomBound) 
        return [{ x: rasterX, y: rasterY }, true]
    }

    worldToView(worldPosition)
    {
        return MATRIX.mat4XVec3(this.viewMatrix, worldPosition)
    }

    updateMatrices()
    {
        this.camera.updateProjectionMatrix()
        this.viewMatrix = this.getViewMatrix()
    }

    getViewMatrix()
    {
        let front = new THREE.Vector3()
        this.camera.getWorldDirection(front)
        let right = MATHS.cross(front, new THREE.Vector3(0, 1, 0))
        let up = MATHS.cross(right, front)
        return [
            [ right.x, right.y, right.z, -MATHS.dot(this.camera.position, right) ],
            [ up.x, up.y, up.z, -MATHS.dot(this.camera.position, up) ],
            [ front.x, front.y, front.z, -MATHS.dot(this.camera.position, front)],
            [ 0, 0, 0, 1 ]
        ]
    }
}