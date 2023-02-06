import * as THREE from 'three'
import { OrbitControl } from './OrbitControl.js'

export class AmbientLight
{
    constructor(name, color, intensity) 
    {
        this.name = name 
        this.light = new THREE.AmbientLight(color, intensity) 
    }

    onMessage(sceneManager, senderName, data) {}

    onSceneStart(sceneManager) { sceneManager.add(this.light, false) }

    onSceneRender(sceneManager) {}

    isReady() { return true }

    isRayCastable() { return false }

    isDrawable() { return true }
}

export class DirectLight
{
    constructor(name, position, size, lookAt) 
    { 
        this.name = name 
        this.core = new DirectLightCore(position, size, lookAt) 
        this.enableGizmo = false
        this.enabled = false
        this.gizmo = new THREE.CameraHelper(this.core.light.shadow.camera) 
    }

    showGizmo(enableGizmo) { this.enableGizmo = enableGizmo }

    orbit(speed) { this.core.orbit(speed) }

    onMessage(sceneManager, senderName, sceneObject) {}

    onSceneStart(sceneManager) 
    { 
        sceneManager.add(this.core.light, false)
        sceneManager.add(this.core.mesh, false)
    }

    onSceneRender(sceneManager) 
    {
        if (this.enableGizmo && !this.enabled)
        {    
            sceneManager.add(this.gizmo, false)
            this.enabled = true
        }
        else if (!this.enableGizmo && this.enabled) 
        {    
            sceneManager.remove(this.gizmo)
            this.enabled = false
        }
    }

    isReady() { return true }

    isRayCastable() { return false }

    isDrawable() { return true }
}

class DirectLightCore
{
    constructor(position, size, lookAt)
    {
        this.light = new THREE.DirectionalLight(0xffffff, 0.2)
        this.light.position.set(position.x, position.y, position.z)  
        this.light.castShadow = true
        this.light.shadow.mapSize.width = 1024
        this.light.shadow.mapSize.height = 1024
        this.light.shadow.camera.near = 0.1
        this.light.shadow.camera.far = 200
        this.light.shadow.camera.left = -10
        this.light.shadow.camera.right = 10
        this.light.shadow.camera.bottom = -10
        this.light.shadow.camera.top = 10
        this.light.shadow.bias = -0.0005
        this.mesh = new THREE.Mesh(new THREE.SphereGeometry(size, 64, 32), new THREE.MeshBasicMaterial({color: 0xFCE570}))
        this.mesh.position.set(position.x, position.y, position.z)
        this.lightOrbiter = new OrbitControl(this.light, new THREE.Vector3(0, 1, 0), lookAt)
        this.meshOrbiter = new OrbitControl(this.mesh, new THREE.Vector3(0, 1, 0), lookAt)
    }
    
    orbit(speed)
    {
        this.lightOrbiter.pan(speed)
        this.meshOrbiter.pan(speed)
    }
}