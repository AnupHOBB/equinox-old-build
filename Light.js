import * as THREE from 'three'
import { OrbitControl } from './OrbitControl.js'

export class Light
{
    constructor(position, size, lookAtPosition)
    {
        this.core = new LightCore(position, size, lookAtPosition)
    }

    addToScene(sceneManager, showGizmo)
    {
        this.core.addToScene(sceneManager, showGizmo)
    }

    get()
    {
        return this.core.light
    }

    orbit(speed)
    {
        this.core.orbit(speed)
    }
}

class LightCore
{
    constructor(position, size, lookAtPosition)
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
        const material = new THREE.MeshBasicMaterial({color: 0xFCE570})
        const geometry = new THREE.SphereGeometry(size, 64, 32)
        this.mesh = new THREE.Mesh(geometry, material)
        this.mesh.position.set(position.x, position.y, position.z)  
        this.lightOrbiter = new OrbitControl(this.light, new THREE.Vector3(0, 1, 0), lookAtPosition)
        this.meshOrbiter = new OrbitControl(this.mesh, new THREE.Vector3(0, 1, 0), lookAtPosition)
    }

    addToScene(sceneManager, showGizmo)
    {
        sceneManager.add(this.light)
        sceneManager.add(this.mesh)
        if (showGizmo)
            sceneManager.add(new THREE.CameraHelper(this.light.shadow.camera), false)
    }

    orbit(speed)
    {
        this.lightOrbiter.pan(speed)
        this.meshOrbiter.pan(speed)
    }
}