import * as THREE from 'three'
import { GLTFLoader } from 'gltf-loader'
import { MATHS } from './maths.js'
import { Hotspot } from './HotSpot.js'
import { Color } from 'three'

export class StaticActor
{
    constructor(geometry, material, supportShadow)
    {
        this.mesh = new THREE.Mesh(geometry, material)
        this.mesh.receiveShadow = supportShadow
    }

    setPosition(x, y, z) { this.mesh.position.set(x, y, z) }

    get() { return this.mesh }

    onSceneStart(sceneManager) {}

    onSceneRender(sceneManager) {}

    isReady() { return true }
}

export class GLTFActor
{
    constructor(url) { this.core = new GLTFActorCore(url) }

    setPosition(x, y, z) { this.core.setPosition(x, y, z) }

    applyTexture(url) { this.core.applyTexture(url) }

    applyColor(color) { this.core.applyColor(color) }

    changeTexture() { this.core.changeTexture() }

    addHotSpots(imageUrl, offset, onClick, onMove) { this.core.addHotSpots(imageUrl, offset, onClick, onMove) }

    get() { return this.core.gltfModel }

    onSceneStart(sceneManager) { this.core.onSceneStart(sceneManager) }

    onSceneRender(sceneManager) { this.core.onSceneRender(sceneManager) }

    isReady() { return this.core.ready }
}

class GLTFActorCore
{
    constructor(url)
    {
        new GLTFLoader().load(url, (model)=>this.onModelLoad(model), (p)=>{}, (e)=>console.log(e))
        this.gltfModel = null
        this.texture = null
        this.color = new Color(1, 1, 1)
        this.hotspots = []
        this.ready = false
        this.position = new THREE.Vector3()
        this.roofBound = new StaticActor(new THREE.BoxGeometry(4.75, 0.5, 3.45), new THREE.MeshBasicMaterial({ transparent: true, opacity: 0 }), false)
        this.roofBound.setPosition(-0.1, 0.5, -4.7,)
    }

    setPosition(x, y, z)
    {
        this.position.x = x
        this.position.y = y
        this.position.z = z
        if (this.ready)
            this.gltfModel.position.set(x, y, z)
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
        if (this.ready && this.texture != null)
        {
            this.gltfModel.children.forEach(mesh=>{
                mesh.material.map = this.texture
            })
        }
    }

    changeColor()
    {
        if (this.ready)
        {
            this.gltfModel.children.forEach(mesh=>{
                mesh.material.color = this.color 
            })
        }
    }

    addHotSpots(imageUrl, offset, onClick, onMove)
    {
        let position = MATHS.addVectors(this.position, offset)
        this.hotspots.push(new Hotspot(imageUrl, position, onClick, onMove))
    }

    onSceneStart(sceneManager) 
    {
        sceneManager.add('RoofBound', this.roofBound, true)
    }

    onSceneRender(sceneManager)
    {
        if (this.ready && this.hotspots.length > 0)
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
        if (this.gltfModel != null)
            return this.gltfModel.position
    }

    onModelLoad(model)
    {
        this.gltfModel = model.scene.children[0]
        this.gltfModel.children.forEach(mesh=>{
            mesh.material.shadowSide = THREE.BackSide
            mesh.receiveShadow = true
            mesh.castShadow = true
        })
        this.gltfModel.position.set(this.position.x, this.position.y, this.position.z)
        this.ready = true
        this.changeTexture()
        this.changeColor()
    }
}