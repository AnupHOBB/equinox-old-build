import * as THREE from 'three'
import { GLTFLoader } from 'gltf-loader'

export class FloorActor
{
    constructor(name, geometry, material, supportShadow)
    {
        this.name = name
        this.mesh = new THREE.Mesh(geometry, material)
        this.mesh.receiveShadow = supportShadow
    }

    applyTexture(url)
    {
        let texture = new THREE.TextureLoader().load(url)
        texture.wrapS = THREE.RepeatWrapping
        texture.wrapT = THREE.RepeatWrapping
        texture.repeat = new THREE.Vector2(100, 200)
        texture.anisotropy = 2
        this.mesh.material.map = texture
    }

    applyColor(color) { this.mesh.material.color = color }

    setPosition(x, y, z) { this.mesh.position.set(x, y, z) }

    onMessage(sceneManager, senderName, data) {}

    onSceneStart(sceneManager) { sceneManager.add(this.mesh, true) }

    onSceneRender(sceneManager) {}

    isReady() { return true }

    isRayCastable() { return true }

    isDrawable() { return true }
}

export class MeshActor
{
    constructor(name, url, onProgress) 
    {
        this.name = name 
        this.core = new MeshActorCore(url, onProgress) 
    }

    updateAnimationFrame(deltaSeconds) { this.core.updateAnimationFrame(deltaSeconds) } 

    setPosition(x, y, z) { this.core.setPosition(x, y, z) }

    getPosition() { return this.core.position }

    applyTexture(url) { this.core.applyTexture(url) }

    applyColor(color) { this.core.applyColor(color) }

    changeTexture() { this.core.changeTexture() }

    addHotSpots(hotSpot) { this.core.hotspots.push(hotSpot) }

    onMessage(sceneManager, senderName, data) {}

    onSceneStart(sceneManager) { this.core.onSceneStart(sceneManager) }

    onSceneRender(sceneManager) { this.core.onSceneRender(sceneManager) }

    isReady() { return this.core.ready }

    isRayCastable() { return false }

    isDrawable() { return true }
}

class MeshActorCore
{
    constructor(url, onProgress)
    {
        new GLTFLoader().load(url, (model)=>this.onModelLoad(model), onProgress)
        this.meshes = []
        this.texture = null
        this.color = new THREE.Color(1, 1, 1)
        this.hotspots = []
        this.ready = false
        this.position = new THREE.Vector3()
        this.roofBound = new THREE.Mesh(new THREE.BoxGeometry(4.75, 0.5, 3.3), new THREE.MeshBasicMaterial({ transparent: true, opacity: 0 }))
        this.roofBound.position.set(-0.1, 0.5, -4.65)
        this.mixer = null
    }

    updateAnimationFrame(deltaSeconds) 
    { 
        if (this.mixer != null)
            this.mixer.update(deltaSeconds)
    } 

    setPosition(x, y, z)
    {
        this.position.x = x
        this.position.y = y
        this.position.z = z
        if (this.ready)
        {
            this.meshes.forEach(mesh => {
                mesh.position.x += this.position.x
                mesh.position.y += this.position.y
                mesh.position.z += this.position.z
            })
        }
    }

    applyTexture(url)
    {
        this.texture = new THREE.TextureLoader().load(url)
        this.texture.wrapS = THREE.ClampToEdgeWrapping
        this.texture.wrapT = THREE.ClampToEdgeWrapping
        this.changeTexture()
    }

    applyColor(color) 
    { 
        this.color = color
        this.changeColor() 
    }

    changeTexture()
    {
        if (this.texture != null)
            this.meshes.forEach(mesh => { 
                mesh.children.forEach(child => { child.material.map = this.texture })
            })
    }

    changeColor()
    {
        this.meshes.forEach(mesh => { 
            mesh.children.forEach(child => { child.material.color = this.color })
        })   
    }

    onSceneStart(sceneManager) 
    {
        sceneManager.add(this.roofBound, true)
        this.meshes.forEach(mesh=>sceneManager.add(mesh, false))
    }

    onSceneRender(sceneManager)
    {
        if (this.hotspots.length > 0)
        {
            for (let hotSpot of this.hotspots)
            {
                let [rasterCoord, showHotSpot] = sceneManager.getRasterCoordIfNearest(hotSpot.getWorldPosition())
                if (showHotSpot)
                {    
                    hotSpot.setRasterCoordinates(rasterCoord.x, rasterCoord.y)
                    hotSpot.show()
                }
                else
                    hotSpot.hide()
            }
        }
    }

    onModelLoad(model)
    {
        model.scene.children.forEach(mesh=>this.meshes.push(mesh))
        this.meshes.forEach(mesh => {
            mesh.children.forEach(child => {
                child.material.shadowSide = THREE.BackSide
                child.material.metalness = 0
                child.receiveShadow = true
                child.castShadow = true
            })
        })
        this.meshes.forEach(mesh => {
            mesh.position.x += this.position.x
            mesh.position.y += this.position.y
            mesh.position.z += this.position.z
        })
        const clip = model.animations[0]
        if (clip != null && clip != undefined)
        {
            this.mixer = new THREE.AnimationMixer(model.scene)
            this.mixer.clipAction(clip).play()
        }
        this.ready = true
        this.changeTexture()
        this.changeColor()
    }
}