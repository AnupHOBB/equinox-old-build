import * as THREE from 'three'
import { PerspectiveCamera, BaseCameraManager } from './BaseCameraManager.js'
import { OrbitControl } from '../core/OrbitControl.js'
import { MATHS } from '.././helpers/maths.js'

/**
 * Wraps OrbitalCameraManagerCore object.
 */
export class OrbitalCameraManager extends BaseCameraManager
{
    /**
     * @param {String} name name of the object which is used in sending or receiving message
     * @param {Number} fov camera field of view
     * @param {THREE.Vector3} axis orbit axis
     * @param {THREE.Vector3} lookAtPosition point to focus on during orbit
     */
    constructor(name, fov, axis, lookAtPosition) 
    { 
        super()
        this.name = name
        this.core = new OrbitalCameraManagerCore(fov, axis, lookAtPosition) 
    }

    /**
     * Sets the aspect ratio value in camera
     * @param {Number} ratio camera aspect ratio
     */
    setAspectRatio(ratio) { this.core.camera.aspect = ratio }

    /**
     * Delegates call to OrbitalCameraManagerCore's updateMatrices
     */
    updateMatrices() { this.core.updateMatrices() }
    
    /**
     * Delegates call to OrbitalCameraManagerCore's worldToRaster
     * @param {THREE.Vector3} worldPosition position of point in world whose raster coordinate is required
     * @returns {[THREE.Vector2, Boolean]} [raster coordinate of the point whose world coordinate was given, 
     * boolean value to indicate whether the raster coordinate is valid or not]
     */
    worldToRaster(worldPosition) { return this.core.worldToRaster(worldPosition) }

    /**
     * Delegates call to OrbitalCameraManagerCore's worldToView
     * @param {THREE.Vector3} worldPosition position of point in world whose view space coordinate is required
     * @returns {THREE.Vector3} position of point in view space whose world coordinate was given
     */
    worldToView(worldPosition) { return this.core.worldToView(worldPosition) }

    /**
     * Returns the threejs camera object stored within
     * @returns {THREE.PerspectiveCamera} threejs camera object
     */
    getCamera() { return this.core.camera }

    /**
     * Called by SceneManager when there is a message for this object posted by any other object registered in SceneManager.
     * However, this function only delegates call to OrbitalCameraManagerCore's onMessage.
     * @param {SceneManager} sceneManager the SceneManager object
     * @param {String} senderName name of the object who posted the message
     * @param {any} data any object sent as part of the message
     */
    onMessage(sceneManager, senderName, data) { this.core.onMessage(sceneManager, senderName, data) }

    /**
     * Called by SceneManager as soon as the object gets registered in SceneManager.
     * @param {SceneManager} sceneManager the SceneManager object
     */
    onSceneStart(sceneManager) {}

    /**
     * Called by SceneManager every frame.
     * However, this function only delegates call to OrbitalCameraManagerCore's onSceneRender.
     * @param {SceneManager} sceneManager the SceneManager object
     */
    onSceneRender(sceneManager) { this.core.onSceneRender(sceneManager) }

    /**
     * Called by SceneManager when this camera object is set as active.
     * However, this function only delegates call to OrbitalCameraManagerCore's onActive.
     * @param {SceneManager} sceneManager the SceneManager object
     */
    onActive(sceneManager) { this.core.onActive(sceneManager, this.name) }

    /**
     * Used for notifying the SceneManager if this object is ready to be included in scene.
     * @returns {Boolean} ready status of camera
     */
    isReady() { return true }

    /**
     * Used for notifying the SceneManager if this object should be included in raycasting.
     * @returns {Boolean} ray castable status of camera
     */
    isRayCastable() { return false }

    /**
     * Used for notifying the SceneManager if this object is drawable in screen.
     * @returns {Boolean} drawable status of camera
     */
    isDrawable() { return false }
}

/**
 * Extends the functionality of PerspectiveCameraManager to provide orbital camera feature
 */
class OrbitalCameraManagerCore extends PerspectiveCamera
{
    /**
     * @param {*} fov camera field of view
     * @param {*} axis orbit axis
     * @param {*} lookAt point to focus on during orbit
     */
    constructor(fov, axis, lookAt)
    {
        super(fov)
        this.orbitSpeed = 60
        this.cameraOrbiter = new OrbitControl(this.camera, axis, lookAt)
        this.zoom = false
        this.isZooming = false
        this.ogPosition = this.camera.position
        this.vDisplacement = new THREE.Vector3()
        this.sourcePosition = this.camera.position
        this.targetPosition = this.camera.position
        this.targetDistance = 0
        this.autoOrbiting = false
    }

    /**
     * Called by OrbitalCameraManager when there is a message for this object posted by any other object registered in SceneManager.
     * This function registers input to the input manager as soon as it receives input manager's instance as message from input manager and
     * starts zooms in and out process to louvered roof on receiving hotspot location as message from MeshActor object that hold the louvered roof model.
     * @param {SceneManager} sceneManager the SceneManager object
     * @param {String} senderName name of the object who posted the message
     * @param {any} data any object sent as part of the message
     */
    onMessage(sceneManager, senderName, data) 
    {
        if (senderName == 'Input')
        {
            let inputManager = data
            inputManager.registerMoveEvent((dx, dy) => this.onMoveEvent(dx, dy))
            inputManager.registerDoubleClickEvent((e, f) => this.onDoubleClick(e, f))
            inputManager.setCursorSensitivity(0.5)
        }
        else if (senderName == 'Roof')
        {       
            if (!this.isZooming)
            {
                if(!this.zoom)
                {
                    let objectPosition = data
                    let front = new THREE.Vector3()
                    this.camera.getWorldDirection(front)
                    this.ogPosition = new THREE.Vector3(this.camera.position.x, this.camera.position.y, this.camera.position.z)
                    this.targetPosition = MATHS.subtractVectors(objectPosition, front)
                    this.zoom = true 
                }
                else
                {
                    this.targetPosition = this.ogPosition
                    this.zoom = false            
                }
                this.sourcePosition = new THREE.Vector3(this.camera.position.x, this.camera.position.y, this.camera.position.z)
                let vDisplacementActual = MATHS.subtractVectors(this.targetPosition, this.sourcePosition)
                this.targetDistance = MATHS.length(vDisplacementActual)
                this.vDisplacement = MATHS.scaleVector(MATHS.normalize(vDisplacementActual), 0.1)
                this.isZooming = true
            }
        }
    }

    /**
     * Called by OrbitalCameraManager every frame.
     * This function performs the actual zoom in and out process once it has started in onMessage.
     * @param {SceneManager} sceneManager the SceneManager object
     */
    onSceneRender(sceneManager) 
    {
        if (this.isZooming)
        {
            let newPosition = MATHS.addVectors(this.camera.position, this.vDisplacement)
            let travelDistance = MATHS.length(MATHS.subtractVectors(newPosition, this.sourcePosition))
            if (travelDistance <= this.targetDistance)   
                this.camera.position.set(newPosition.x, newPosition.y, newPosition.z)
            else
                this.isZooming = false
        }
    }

    /**
     * Called by OrbitCameraManager when this camera object is set as active.
     * Once its active, it broadcasts message to input manger demanding for its instance.
     * @param {SceneManager} sceneManager the SceneManager object
     */
    onActive(sceneManager, myName) { sceneManager.broadcastTo(myName, 'Input', null) }

    /**
     * Called by InputManager whenever it detects mouse movement. This function is only called
     * when the user holds LMB or RMB and moves the mouse.
     * This function rotates the the camera around based on mouse movement.
     * @param {Number} deltaX displacement of cursor in x-direction
     * @param {Number} deltaY displacement of cursor in y-direction
     * @param {Number} x position of cursor in x-axis
     * @param {Number} y position of cursor in y-axis
     */
    onMoveEvent(deltaX, deltaY, x, y) 
    { 
        if (!this.zoom && !this.isZooming)
            this.cameraOrbiter.pan(deltaX) 
    }

    /**
     * Called by InputManager whenever it detects double click event.
     * This function starts auto orbit on detecting double click and stops auto orbit on detecting double click again.
     * @param {MouseEvent} event mouse event instance
     */
    onDoubleClick(event)
    {
        if (!this.zoom && !this.isZooming)
        {
            if (!this.autoOrbiting)
            {    
                this.cameraOrbiter.start(this.orbitSpeed)
                this.autoOrbiting = true
            }
            else
            {
                this.cameraOrbiter.stop()
                this.autoOrbiting = false
            }
        }
    }
}