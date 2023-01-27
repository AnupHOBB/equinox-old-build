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
    
    worldToRaster(camera, worldPosition)
    {
        return this.core.worldToRaster(camera, worldPosition)
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
        this.screenTopBound = camera.near * Math.tan(MATHS.toRadians(camera.fov/2))
        this.screenBottomBound = -this.screenTopBound
        this.screenRightBound = this.screenTopBound * camera.aspect
        this.screenLeftBound = -this.screenRightBound
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

    worldToRaster(camera, worldPosition)
    {
        let viewMatrix = this.getViewMatrix(camera)
        let viewPosition = MATRIX.mat4XVec3(viewMatrix, worldPosition)
        if (viewPosition.z < camera.near || viewPosition.z > camera.far)
            return [, false]
        let projectedX = (camera.near * viewPosition.x)/viewPosition.z
        let projectedY = (camera.near * viewPosition.y)/viewPosition.z
        if (projectedX < this.screenLeftBound || projectedX > this.screenRightBound)
            return [, false]
        if (projectedY < this.screenBottomBound || projectedY > this.screenTopBound)
            return [, false]
        let rasterX = (window.innerWidth * (projectedX - this.screenLeftBound))/(this.screenRightBound - this.screenLeftBound)
        let rasterY = (window.innerHeight * (this.screenTopBound - projectedY))/(this.screenTopBound - this.screenBottomBound)
        return [{ x: rasterX, y: rasterY }, true]
    }

    getViewMatrix(camera)
    {
        let front = new THREE.Vector3()
        camera.getWorldDirection(front)
        let right = MATHS.cross(front, new THREE.Vector3(0, 1, 0))
        let up = MATHS.cross(right, front)
        return [
            [ right.x, right.y, right.z, -MATHS.dot(camera.position, right) ],
            [ up.x, up.y, up.z, -MATHS.dot(camera.position, up) ],
            [ front.x, front.y, front.z, -MATHS.dot(camera.position, front)],
            [ 0, 0, 0, 1 ]
        ]
    }
}