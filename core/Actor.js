import * as THREE from 'three'
import { GLTFLoader } from 'gltf-loader'
import { FBXLoader } from 'fbx-loader'
import { MATHS } from '../helpers/maths.js'
import { Hotspot } from './HotSpot.js'

export class StaticActor
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
        texture.anisotropy = 100
        this.mesh.material.map = texture
    }

    applyColor(color) { this.mesh.material.color = color }

    setPosition(x, y, z) { this.mesh.position.set(x, y, z) }

    onMessage(sceneManager, senderName, sceneObject) {}

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

    applyTexture(url) { this.core.applyTexture(url) }

    applyColor(color) { this.core.applyColor(color) }

    changeTexture() { this.core.changeTexture() }

    addHotSpots(imageUrl, offset, onClick, onMove) { this.core.addHotSpots(imageUrl, offset, onClick, onMove) }

    onMessage(sceneManager, senderName, sceneObject) {}

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
        let type = url.split('.')[2]
        if (type == 'fbx')
            new FBXLoader().load(url, (model)=>this.onFBXModelLoad(model), onProgress)
        else if (type == 'glb' || type == 'gltf')
            new GLTFLoader().load(url, (model)=>this.onGLTFModelLoad(model), onProgress)
        else
            throw 'Invalid 3D file format'
        this.meshes = []
        this.texture = null
        this.color = new THREE.Color(1, 1, 1)
        this.hotspots = []
        this.ready = false
        this.position = new THREE.Vector3()
        this.roofBound = new THREE.Mesh(new THREE.BoxGeometry(4.75, 0.5, 3.45), new THREE.MeshBasicMaterial({ transparent: true, opacity: 0 }))
        this.roofBound.position.set(-0.1, 0.5, -4.7,)
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

    addHotSpots(imageUrl, offset, onClick, onMove)
    {
        let position = MATHS.addVectors(this.position, offset)
        this.hotspots.push(new Hotspot(imageUrl, position, onClick, onMove))
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

    getPosition()
    {
        return this.position
    }

    onFBXModelLoad(model)
    {
        model.children.forEach(mesh=>this.meshes.push(mesh))
        this.meshes.forEach(mesh => {
            mesh.material.shadowSide = THREE.BackSide
            mesh.receiveShadow = true
            mesh.castShadow = true
        })

        let roofBody = this.meshes[0]
        roofBody.scale.x = 1
        roofBody.scale.y = 1
        roofBody.scale.z = 1
        roofBody.position.x += this.position.x
        roofBody.position.y += this.position.y
        roofBody.position.z += this.position.z

        let xoffset = 0
        let yoffset = 2.6
        let zoffset = -1.67

        for(let i=1; i< this.meshes.length; i++)
        {
            this.meshes[i].scale.x = 1
            this.meshes[i].scale.y = 1
            this.meshes[i].scale.z = 1
            this.meshes[i].position.x = this.position.x + xoffset
            this.meshes[i].position.y = this.position.y + yoffset
            this.meshes[i].position.z = this.position.z + zoffset
            xoffset-= 0.19
        }

        const clip = model.animations[0]
        this.mixer = new THREE.AnimationMixer(model)
        this.mixer.clipAction(clip).play()
        this.ready = true
        this.changeTexture()
        this.changeColor()
    }

    onGLTFModelLoad(model)
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