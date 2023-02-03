import { PerspectiveCameraManager } from './PerspectiveCameraManager.js'
import { OrbitControl } from '../core/OrbitControl.js'

export class OrbitalCameraManager
{
    constructor(name, fov, axis, lookAtPosition) 
    { 
        this.name = name
        this.core = new OrbitalCameraManagerCore(fov, axis, lookAtPosition) 
    }

    setAspectRatio(ratio) { this.core.camera.aspect = ratio }

    updateMatrices() { this.core.updateMatrices() }
    
    worldToRaster(worldPosition) { return this.core.worldToRaster(worldPosition) }

    worldToView(worldPosition) { return this.core.worldToView(worldPosition) }

    getThreeJsCamera() { return this.core.camera }

    onMessage(sceneManager, senderName, sceneObject) { this.core.onMessage(sceneManager, senderName, sceneObject) }

    onSceneStart(sceneManager) {}

    onSceneRender(sceneManager) {}

    onActive(sceneManager) { this.core.onActive(sceneManager, this.name) }

    isReady() { return true }

    isRayCastable() { return false }

    isDrawable() { return false }
}

class OrbitalCameraManagerCore extends PerspectiveCameraManager
{
    constructor(fov, axis, lookAt)
    {
        super(fov)
        this.orbitSpeed = 60
        this.cameraOrbiter = new OrbitControl(this.camera, axis, lookAt)
    }

    onMessage(sceneManager, senderName, sceneObject) 
    {
        if (senderName == 'Input')
        {
            let inputManager = sceneObject
            inputManager.registerMoveEvent((dx, dy) => this.onMoveEvent(dx, dy))
            inputManager.registerDoubleClickEvent((e, f) => this.onDoubleClick(e, f))
            inputManager.setCursorSensitivity(0.5)
        }
    }

    onActive(sceneManager, myName) { sceneManager.broadcastTo(myName, 'Input', null) }

    onMoveEvent(deltaX, deltaY, x, y) { this.cameraOrbiter.pan(deltaX) }

    onDoubleClick(event, flag)
    {
        if (flag)
            this.cameraOrbiter.start(this.orbitSpeed)
        else
            this.cameraOrbiter.stop()
    }
}