import * as THREE from 'three'
import { OrbitControl } from './OrbitControl.js'
import { KeyEvent } from './KeyEvent.js'
import { MouseEvent } from './MouseEvent.js'
import { MATHS } from './maths.js'
import { MATRIX } from './matrix.js'

export const CAMERA_TYPE =
{
    orbit : 'orbit',
    firstPerson : 'firstPerson'
}

export class CameraManager
{
    constructor(canvas, camera, axis, lookAtPosition)
    {
        this.core = new CameraManagerCore(canvas, camera, axis, lookAtPosition)
    }

    setType(type)
    {
        if (type == CAMERA_TYPE.orbit)
        {
            this.core.type = type
            this.core.mouseInput.setSensitivity(0.5)
        }
        else if (type == CAMERA_TYPE.firstPerson)
        {   
            this.core.type = type 
            this.core.mouseInput.setSensitivity(0.05)
        }
        else
            throw 'Invalid Camera type'
    } 
    
    worldToRaster(worldPosition, raycaster)
    {
        return this.core.worldToRaster(worldPosition, raycaster)
    }
}

class CameraManagerCore
{
    constructor(canvas, camera, axis, lookAtPosition)
    {
        this.orbitSpeed = 60
        this.type = CAMERA_TYPE.orbit
        this.camera = camera
        this.camera.rotation.order = 'YXZ'
        this.cameraOrbiter = new OrbitControl(camera, axis, lookAtPosition)
        this.keyInput = new KeyEvent((w,s,a,d)=>this.onKeyinput(w,s,a,d))
        this.mouseInput = new MouseEvent(canvas)
        this.mouseInput.registerMoveEvent((dx, dy) => this.onMouseInput(dx, dy))
        this.mouseInput.setSensitivity(0.5)
        this.mouseInput.registerDoubleClickEvent((e, f) => this.onDoubleClick(e, f))
    }

    onKeyinput(pressW, pressS, pressA, pressD) 
    {
        if (this.type == CAMERA_TYPE.firstPerson)
        {
            let scale = 0.1
            let front = new THREE.Vector3()
            this.camera.getWorldDirection(front)
            let right = MATHS.cross(front, new THREE.Vector3(0, 1, 0))
            let newPosition = new THREE.Vector3()
            front = new THREE.Vector3(front.x * scale, front.y * scale, front.z * scale)
            right = new THREE.Vector3(right.x * scale, right.y * scale, right.z * scale)
            if (pressW)
            {
                newPosition = MATHS.addVectors(this.camera.position, front)
                this.camera.position.set(newPosition.x, newPosition.y, newPosition.z)
            }
            if (pressS)
            {
                newPosition = MATHS.subtractVectors(this.camera.position, front)
                this.camera.position.set(newPosition.x, newPosition.y, newPosition.z)
            }
            if (pressA)
            {
                newPosition = MATHS.subtractVectors(this.camera.position, right)
                this.camera.position.set(newPosition.x, newPosition.y, newPosition.z)
            }
            if (pressD)
            {
                newPosition = MATHS.addVectors(this.camera.position, right)
                this.camera.position.set(newPosition.x, newPosition.y, newPosition.z)
            }
        }
    }

    onMouseInput(deltaX, deltaY, x, y)
    {
        if (this.type == CAMERA_TYPE.firstPerson)
        {
            let pitchDeg = MATHS.toDegrees(this.camera.rotation.x - deltaY)
            if (pitchDeg > -85 && pitchDeg < 85)
                this.camera.rotation.x -= deltaY
            this.camera.rotation.y -= deltaX
        }
        else if (this.type == CAMERA_TYPE.orbit)
            this.cameraOrbiter.pan(deltaX)
    }

    onDoubleClick(event, flag)
    {
        if (this.type == CAMERA_TYPE.orbit)
        {
            if (flag)
                this.cameraOrbiter.start(this.orbitSpeed)
            else
                this.cameraOrbiter.stop()
        }
    }

    worldToRaster(worldPosition, raycaster)
    {
        let viewMatrix = this.getViewMatrix(this.camera)
        let viewPosition = MATRIX.mat4XVec3(viewMatrix, worldPosition)
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
        let hitPointWorld = raycaster.raycast({ x: rasterX, y: rasterY })
        if (hitPointWorld == undefined)
            return [{ x: rasterX, y: rasterY }, true]
        let hitPointView = MATRIX.mat4XVec3(viewMatrix, hitPointWorld)
        if (viewPosition.z > hitPointView.z)
            return [, false]
        return [{ x: rasterX, y: rasterY }, true]
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