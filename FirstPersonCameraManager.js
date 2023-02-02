import { PerspectiveCameraManager } from './PerspectiveCameraManager.js'
import * as THREE from 'three'
import { MATHS } from './maths.js'

export class FirstPersonCameraManager
{
    constructor(fov)
    {
        this.core = new FirstPersonCameraManagerCore(fov)
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

    onSceneStart(sceneManager) 
    {
        this.core.onSceneStart(sceneManager)
    }

    onSceneRender(sceneManager) {}

    onActive(sceneManager)
    {
        this.core.onActive(sceneManager)
    }
}

class FirstPersonCameraManagerCore extends PerspectiveCameraManager
{
    constructor(fov)
    {
        super(fov)
    }

    onSceneStart(sceneManager) 
    {
        let inputManager = sceneManager.getInputManager()
        inputManager.registerKeyEvent((w,s,a,d)=>this.onKeyinput(w,s,a,d))
        inputManager.registerMoveEvent((dx, dy) => this.onMouseInput(dx, dy))
    }

    onActive(sceneManager)
    {
        let inputManager = sceneManager.getInputManager()
        inputManager.setCursorSensitivity(0.05)
    }

    onKeyinput(keyMap) 
    {
        let scale = 0.1
        let front = new THREE.Vector3()
        this.camera.getWorldDirection(front)
        let right = MATHS.cross(front, new THREE.Vector3(0, 1, 0))
        let newPosition = new THREE.Vector3()
        front = new THREE.Vector3(front.x * scale, front.y * scale, front.z * scale)
        right = new THREE.Vector3(right.x * scale, right.y * scale, right.z * scale)
        if (keyMap.get('w') != undefined)
        {
            newPosition = MATHS.addVectors(this.camera.position, front)
            this.camera.position.set(newPosition.x, newPosition.y, newPosition.z)
        }
        if (keyMap.get('s') != undefined)
        {
            newPosition = MATHS.subtractVectors(this.camera.position, front)
             this.camera.position.set(newPosition.x, newPosition.y, newPosition.z)
        }
        if (keyMap.get('a') != undefined)
        {
            newPosition = MATHS.subtractVectors(this.camera.position, right)
            this.camera.position.set(newPosition.x, newPosition.y, newPosition.z)
        }
        if (keyMap.get('d') != undefined)
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