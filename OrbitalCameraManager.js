import { PerspectiveCameraManager } from './PerspectiveCameraManager.js'
import { OrbitControl } from './OrbitControl.js'

export class OrbitalCameraManager
{
    constructor(sceneManager, fov, axis, lookAtPosition)
    {
        this.core = new OrbitalCameraManagerCore(sceneManager, fov, axis, lookAtPosition)
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

class OrbitalCameraManagerCore extends PerspectiveCameraManager
{
    constructor(sceneManager, fov, axis, lookAt)
    {
        super(fov)
        this.orbitSpeed = 60
        this.cameraOrbiter = new OrbitControl(this.camera, axis, lookAt)
        sceneManager.registerMouseMoveEvent((dx, dy) => this.onMouseInput(dx, dy))
        sceneManager.registerDblClickEvent((e, f) => this.onDoubleClick(e, f))
    }

    onActive(sceneManager)
    {
        sceneManager.setMouseSensitivity(0.5)
    }

    onMouseInput(deltaX, deltaY, x, y)
    {
        this.cameraOrbiter.pan(deltaX)
    }

    onDoubleClick(event, flag)
    {
        if (flag)
            this.cameraOrbiter.start(this.orbitSpeed)
        else
            this.cameraOrbiter.stop()
    }
}