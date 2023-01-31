import * as THREE from 'three'
import { GLTFLoader } from 'gltf-loader'
import { MATHS } from './maths.js'
import { Hotspot } from './HotSpot.js'
import { Color } from 'three'

export class BoxActor
{
    constructor(geometry, material, supportShadow)
    {
        this.floor = new THREE.Mesh(geometry, material)
        this.floor.receiveShadow = supportShadow
    }

    setPosition(x, y, z)
    {
        this.floor.position.set(x, y, z)
    }

    addToScene(sceneManager)
    {
        sceneManager.add(this.floor)
    }

    addToRaycast(raycast)
    {
        raycast.addObject(this.floor)
    }
}

export class GLTFActor
{
    constructor()
    {
        this.core = new GLTFActorCore()
    }

    load(url, onLoading, onLoadComplete)
    {
        this.core.load(url, onLoading, onLoadComplete)
    }

    addTexture(url)
    {
        this.core.addTexture(url)
    }

    changeTexture()
    {
        this.core.changeTexture()
    }

    addHotSpots(imageUrl, onClick, onMove)
    {
        this.core.addHotSpots(imageUrl, onClick, onMove)
    }

    onSceneRender(cameraManager, raycast)
    {
        this.core.onSceneRender(cameraManager, raycast)
    }

    getPosition()
    {
        return this.core.getPosition()
    }
}

class GLTFActorCore
{
    constructor()
    {
        this.gltfModel = null
        this.textures = []
        this.hotspots = []
    }

    load(url, onLoading, onLoadComplete)
    {
        new GLTFLoader().load(url, (model)=>this.onModelLoad(model, onLoading, onLoadComplete), (p)=>{}, (e)=>console.log(e))
    }

    addTexture(url)
    {
        let texture = new THREE.TextureLoader().load(url)
        texture.wrapS = THREE.ClampToEdgeWrapping
        texture.wrapT = THREE.ClampToEdgeWrapping
        this.textures.push(texture)
    }

    changeTexture()
    {
        if (this.textures.length > 0)
        {
            this.gltfModel.children.forEach(mesh=>{
                mesh.material.map = this.textures[0]
                mesh.material.color = new Color(0.5, 0.5, 0.5)
            })
        }
    }

    addHotSpots(imageUrl, onClick, onMove)
    {
        let position = MATHS.addVectors(this.gltfModel.position, new THREE.Vector3(-2.15, 2.6, 0.08))
        this.hotspots.push(new Hotspot(imageUrl, position, onClick, onMove))
    }

    onSceneRender(cameraManager, raycast)
    {
        if (this.hotspots.length > 0)
        {
            for (let hotSpot of this.hotspots)
            {
                let [rasterCoord, isValid] = cameraManager.worldToRaster(hotSpot.getWorldPosition(), raycast)
                if (isValid)
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

    onModelLoad(model, onLoading, onLoadComplete)
    {
        this.gltfModel = model.scene.children[0]
        this.gltfModel.children.forEach(mesh=>{
            mesh.material.shadowSide = THREE.BackSide
            mesh.receiveShadow = true
            mesh.castShadow = true
        })
        this.gltfModel.position.set(2, -2, -3)
        onLoading(this.gltfModel, false)
        let roofBoundMaterial = new THREE.MeshBasicMaterial({ transparent: true, opacity: 0 }) 
        let roofBoundGeometery = new THREE.BoxGeometry(4.75, 0.5, 3.45)
        let roofBound = new THREE.Mesh(roofBoundGeometery, roofBoundMaterial)
        roofBound.position.set(-0.1, 0.5, -4.65)
        onLoading(roofBound, true)
        onLoadComplete()
    }
}