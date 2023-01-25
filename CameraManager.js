import * as THREE from 'three'
import { OrbitControl } from './OrbitControl.js'
import { KeyEvent } from './KeyEvent.js'
import { MouseEvent } from './MouseEvent.js'
import { MATHS } from './Maths.js'

export const CAMERA_TYPE =
{
    orbit : 'orbit',
    firstPerson : 'firstPerson'
}

export class CameraManager
{
    constructor(canvas, camera)
    {
        this.core = new CameraManagerCore(canvas, camera)
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
}

class CameraManagerCore
{
    constructor(canvas, camera)
    {
        this.orbitSpeed = 60
        this.lookAtPosition = new THREE.Vector3(camera.position.x, camera.position.y, camera.position.z - 5)
        this.type = CAMERA_TYPE.orbit
        let axis = new THREE.Vector3(0, -1, 0)
        axis.applyAxisAngle(new THREE.Vector3(0, 0, -1), MATHS.toRadians(20))

        this.camera = camera
        this.camera.rotation.order = 'YXZ'
        this.cameraOrbiter = new OrbitControl(camera, axis, this.lookAtPosition)
        this.keyInput = new KeyEvent((w,s,a,d)=>this.onKeyinput(w,s,a,d))
        this.mouseInput = new MouseEvent(canvas, (dx, dy) => this.onMouseInput(dx, dy))
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

    onMouseInput(deltaX, deltaY)
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
}