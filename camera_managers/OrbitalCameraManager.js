import * as THREE from 'three'
import { PerspectiveCameraManager } from './PerspectiveCameraManager.js'
import { OrbitControl } from '../core/OrbitControl.js'
import { MATHS } from '.././helpers/maths.js'

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

    getCamera() { return this.core.camera }

    onMessage(sceneManager, senderName, sceneObject) { this.core.onMessage(sceneManager, senderName, sceneObject) }

    onSceneStart(sceneManager) {}

    onSceneRender(sceneManager) { this.core.onSceneRender(sceneManager) }

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
        this.zoom = false
        this.isZooming = false
        this.ogPosition = this.camera.position
    
        this.vDisplacement = new THREE.Vector3()
        this.sourcePosition = this.camera.position
        this.targetPosition = this.camera.position
        this.targetDistance = 0
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
        else if (senderName == 'Roof')
        {       
            if (!this.isZooming)
            {
                if(!this.zoom)
                {
                    let objectPosition = sceneObject
                    let front = new THREE.Vector3()
                    this.camera.getWorldDirection(front)
                    this.ogPosition = new THREE.Vector3(this.camera.position.x, this.camera.position.y, this.camera.position.z)
                    this.sourcePosition = new THREE.Vector3(this.camera.position.x, this.camera.position.y, this.camera.position.z)
                    this.targetPosition = MATHS.subtractVectors(objectPosition, front)
                    let vDisplacementActual = MATHS.subtractVectors(this.targetPosition, this.sourcePosition)
                    this.targetDistance = MATHS.length(vDisplacementActual)
                    this.vDisplacement = MATHS.scaleVector(MATHS.normalize(vDisplacementActual), 0.1)
                    this.isZooming = true
                    this.zoom = true
                }
                else
                {
                    this.sourcePosition = new THREE.Vector3(this.camera.position.x, this.camera.position.y, this.camera.position.z)
                    this.targetPosition = this.ogPosition
                    let vDisplacementActual = MATHS.subtractVectors(this.targetPosition, this.sourcePosition)
                    this.targetDistance = MATHS.length(vDisplacementActual)
                    this.vDisplacement = MATHS.scaleVector(MATHS.normalize(vDisplacementActual), 0.1)
                    this.isZooming = true
                    this.zoom = false
                }
            }
        }
    }

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

    onActive(sceneManager, myName) { sceneManager.broadcastTo(myName, 'Input', null) }

    onMoveEvent(deltaX, deltaY, x, y) 
    { 
        if (!this.zoom && !this.isZooming)
            this.cameraOrbiter.pan(deltaX) 
    }

    onDoubleClick(event, flag)
    {
        if (!this.zoom && !this.isZooming)
        {
            if (flag)
                this.cameraOrbiter.start(this.orbitSpeed)
            else
                this.cameraOrbiter.stop()
        }
    }
}