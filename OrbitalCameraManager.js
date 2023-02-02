import { PerspectiveCameraManager } from './PerspectiveCameraManager.js'
import { OrbitControl } from './OrbitControl.js'

export class OrbitalCameraManager
{
    constructor(fov, axis, lookAtPosition)
    {
        this.core = new OrbitalCameraManagerCore(fov, axis, lookAtPosition)
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

class OrbitalCameraManagerCore extends PerspectiveCameraManager
{
    constructor(fov, axis, lookAt)
    {
        super(fov)
        this.orbitSpeed = 60
        this.cameraOrbiter = new OrbitControl(this.camera, axis, lookAt)
    }

    onSceneStart(sceneManager) 
    {
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