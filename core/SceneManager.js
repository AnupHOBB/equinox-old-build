import * as THREE from 'three'
import { RayCast } from './RayCast.js'

export class SceneManager
{
    constructor(canvas, inputManager)
    {
        this.core = new SceneCore(canvas, inputManager, this)
    }

    add(name, sceneObject, isRayCastable)
    {
        this.core.add(name, sceneObject, isRayCastable)
    }

    addCamera(name, cameraManager)
    {
        this.core.addCamera(name, cameraManager)
    }

    remove(name)
    {
        this.core.remove(name)
    }

    getRasterCoordIfNearest(worldPosition)
    {
        return this.core.getRasterCoordIfNearest(worldPosition)
    }

    changeActiveCamera(name)
    {
        this.core.changeActiveCamera(name)
    }

    getInputManager()
    {
        return this.core.inputManager
    }
}

class SceneCore
{
    constructor(canvas, inputManager, sceneManager)
    {
        this.renderer = new THREE.WebGLRenderer({canvas, alpha:true, antialias:true})
        this.renderer.shadowMap.enabled = true
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap
        this.scene = new THREE.Scene()
        this.loopStarted = false
        this.sceneObjectMap = new Map()
        this.inactiveObjNameMap = new Map()
        this.cameraManagerMap = new Map()
        this.activeCameraManager = null
        this.rayCast = new RayCast()
        this.inputManager = inputManager
        this.sceneManager = sceneManager
        this.startLoop()
    }

    add(name, sceneObject, isRayCastable)
    {
        this.sceneObjectMap.set(name, sceneObject)
        this.inactiveObjNameMap.set(name, null)
        if (isRayCastable)
            this.rayCast.addObject(sceneObject)
        if (this.loopStarted)
            sceneObject.onSceneStart(this.sceneManager)
    }

    addCamera(name, cameraManager)
    {
        this.cameraManagerMap.set(name, cameraManager)
        if (this.activeCameraManager == null)
        {    
            this.activeCameraManager = cameraManager
            this.activeCameraManager.onActive(this.sceneManager)
        }
        if (this.loopStarted)
            cameraManager.onSceneStart(this.sceneManager)
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

    changeActiveCamera(name)
    {
        let cameraManager = this.cameraManagerMap.get(name)
        if (cameraManager != null && cameraManager != undefined)
        {
            this.activeCameraManager = cameraManager
            this.activeCameraManager.onActive(this.sceneManager)
        } 
    }

    startLoop()
    {
        if (!this.loopStarted)
        { 
            window.requestAnimationFrame(()=>this.animFrame())
            this.loopStarted = true
        }
    }

    animFrame()
    {
        this.renderLoop()
        window.requestAnimationFrame(()=>this.animFrame())
    }

    renderLoop()
    {
        this.activeCameraManager.setAspectRatio(window.innerWidth/window.innerHeight)
        this.activeCameraManager.updateMatrices()
        this.queryReadyObjects()
        this.renderer.setSize(window.innerWidth, window.innerHeight)
        this.renderer.render(this.scene, this.activeCameraManager.getThreeJsCamera())
        this.notifyObjects()
        this.inputManager.notifyKeyEvent()
    }

    notifyObjects()
    {
        let sceneObjects = this.sceneObjectMap.values()
        for (let sceneObject of sceneObjects)
            sceneObject.onSceneRender(this.sceneManager)
        let cameraManagers = this.cameraManagerMap.values()
        for (let cameraManager of cameraManagers)
            cameraManager.onSceneRender(this.sceneManager)
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