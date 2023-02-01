import { PerspectiveCameraManager } from './PerspectiveCameraManager.js'
import * as THREE from 'three'
import { MATHS } from './maths.js'

export class FirstPersonCameraManager
{
    constructor(sceneManager, fov)
    {
        this.core = new FirstPersonCameraManagerCore(sceneManager, fov)
    }

    setAspectRatio(ratio)
    {
        this.core.camera.aspect = ratio
    }

    updateMatrices()
    {
        this.core.updateMatrices()
    }
    
    worldToRaster(worldPosition)
    {
        return this.core.worldToRaster(worldPosition)
    }

    worldToView(worldPosition)
    {
        return this.core.worldToView(worldPosition)
    }

    getThreeJsCamera()
    {
        return this.core.camera
    }

    onActive(sceneManager)
    {
        this.core.onActive(sceneManager)
    }
}

class FirstPersonCameraManagerCore extends PerspectiveCameraManager
{
    constructor(sceneManager, fov)
    {
        super(fov)
        sceneManager.registerKeyEvent((w,s,a,d)=>this.onKeyinput(w,s,a,d))
        sceneManager.registerMouseMoveEvent((dx, dy) => this.onMouseInput(dx, dy))
    }

    onActive(sceneManager)
    {
        sceneManager.setMouseSensitivity(0.05)
    }

    onKeyinput(pressW, pressS, pressA, pressD) 
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

    onMouseInput(deltaX, deltaY, x, y)
    {
        let pitchDeg = MATHS.toDegrees(this.camera.rotation.x - deltaY)
        if (pitchDeg > -85 && pitchDeg < 85)
            this.camera.rotation.x -= deltaY
        this.camera.rotation.y -= deltaX
    }
}