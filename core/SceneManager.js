import * as THREE from 'three'
import { RayCast } from './RayCast.js'

export class SceneManager
{
    constructor(canvas) { this.core = new SceneCore(canvas, this) }

    add(name, sceneObject) { this.core.add(name, sceneObject) }

    remove(name) { this.core.remove(name) }

    getRasterCoordIfNearest(worldPosition) { return this.core.getRasterCoordIfNearest(worldPosition) }

    setActiveCamera(name) { this.core.setActiveCamera(name) }

    broadcastTo(from, to, data) { this.core.broadcastTo(from, to, data) }

    broadcastToAll(from, data) { this.core.broadcastToAll(from, data) }
}

class SceneCore
{
    constructor(canvas, sceneManager)
    {
        this.renderer = new THREE.WebGLRenderer({canvas, alpha:true, antialias:true})
        this.renderer.shadowMap.enabled = true
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap
        this.scene = new THREE.Scene()
        this.sceneManager = sceneManager
        this.rayCast = new RayCast()
        this.activeCameraManager = null
        this.sceneObjectMap = new Map()
        this.inactiveObjNameMap = new Map()
        this.noticeBoard = []
        window.requestAnimationFrame(()=>this.animFrame())
    }

    add(sceneObject)
    {
        this.sceneObjectMap.set(sceneObject.name, sceneObject)
        if (sceneObject.isDrawable())
            this.inactiveObjNameMap.set(sceneObject.name, null)
        if (sceneObject.isRayCastable())
            this.rayCast.addObject(sceneObject)
        sceneObject.onSceneStart(this.sceneManager)
        this.popNoticeBoard(sceneObject)
    }

    popNoticeBoard(sceneObject)
    {
        for (let notice of this.noticeBoard)
        {
            if (notice.to == sceneObject.name)
            {    
                sceneObject.onMessage(this.sceneManager, notice.from, notice.data)
                this.noticeBoard.splice(this.noticeBoard.indexOf(notice), 1) 
            }
        }
    }

    remove(name)
    {
        let sceneObject = this.sceneObjectMap.get(name)
        if (sceneObject != null && sceneObject != undefined)
            this.scene.remove(sceneObject.get())
    }

    getRasterCoordIfNearest(worldPosition)
    {
        let [rasterCoord, isValid] = this.activeCameraManager.worldToRaster(worldPosition)
        if (isValid)
        {        
            let hitPointWorld = this.rayCast.raycast(rasterCoord, this.activeCameraManager)
            isValid &&= hitPointWorld != undefined
            if (isValid)
            {
                let viewPosition = this.activeCameraManager.worldToView(worldPosition)
                let hitPointView = this.activeCameraManager.worldToView(hitPointWorld)
                isValid &&= viewPosition.z <= hitPointView.z
            }
        } 
        return [rasterCoord, isValid]
    }

    setActiveCamera(name)
    {
        let cameraManager = this.sceneObjectMap.get(name)
        if (cameraManager != null && cameraManager != undefined)
        {
            this.activeCameraManager = cameraManager
            this.activeCameraManager.onActive(this.sceneManager)
        } 
    }

    broadcastTo(from, to, data)
    {
        let sceneObject = this.sceneObjectMap.get(to)
        if (sceneObject != undefined)
            sceneObject.onMessage(this.sceneManager, from, data)
        else
            this.noticeBoard.push({ from: from, to: to, data: data })
    }

    broadcastToAll(from, data)
    {
        let sceneObjectKeys = this.sceneObjectMap.keys()
        for (let sceneObjectKey of sceneObjectKeys)
            if (sceneObjectKey != from)
                this.sceneObjectMap.get(sceneObjectKey).onMessage(this.sceneManager, from, data)     
    }

    animFrame()
    {
        this.renderLoop()
        window.requestAnimationFrame(()=>this.animFrame())
    }

    renderLoop()
    {
        if (this.activeCameraManager != null && this.activeCameraManager != undefined)
        {
            this.activeCameraManager.setAspectRatio(window.innerWidth/window.innerHeight)
            this.activeCameraManager.updateMatrices()
            this.queryReadyObjects()
            this.renderer.setSize(window.innerWidth, window.innerHeight)
            this.renderer.render(this.scene, this.activeCameraManager.getThreeJsCamera())
            this.notifyObjects()
        }
    }

    notifyObjects()
    {
        let sceneObjects = this.sceneObjectMap.values()
        for (let sceneObject of sceneObjects)
            sceneObject.onSceneRender(this.sceneManager)
    }

    queryReadyObjects()
    {
        if (this.inactiveObjNameMap.size > 0) 
        {
            let inactiveObjNames = this.inactiveObjNameMap.keys()
            for (let sceneObjectName of inactiveObjNames)
            {
                let sceneObject = this.sceneObjectMap.get(sceneObjectName)
                if (sceneObject.isReady())
                {   
                    this.scene.add(sceneObject.get())
                    this.inactiveObjNameMap.delete(sceneObjectName)
                } 
            }
        }
    }
}