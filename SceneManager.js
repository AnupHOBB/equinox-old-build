import * as THREE from 'three'
import { KeyEvent } from './KeyEvent.js'
import { MouseEvent } from './MouseEvent.js'
import { RayCast } from './RayCast.js'

export class SceneManager
{
    constructor(canvas)
    {
        this.core = new SceneCore(canvas)
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

    registerKeyEvent(onKeyEvent)
    {
        this.core.registerKeyEvent(onKeyEvent)
    }

    registerMouseMoveEvent(onMouseMoveEvent)
    {
        this.core.registerMouseMoveEvent(onMouseMoveEvent)
    }

    registerDblClickEvent(onDblClickEvent)
    {
        this.core.registerDblClickEvent(onDblClickEvent)
    }

    setMouseSensitivity(sensitivity)
    {
        this.core.setMouseSensitivity(sensitivity)
    }

    changeActiveCamera(name)
    {
        this.core.changeActiveCamera(name)
    }

    startLoop()
    {
        this.core.startLoop()
    }
}

class SceneCore
{
    constructor(canvas)
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
        this.keyEvent = new KeyEvent()
        this.mouseEvent = new MouseEvent(canvas)
    }

    add(name, sceneObject, isRayCastable)
    {
        this.sceneObjectMap.set(name, sceneObject)
        this.inactiveObjNameMap.set(name, null)
        if (isRayCastable)
            this.rayCast.addObject(sceneObject)
    }

    addCamera(name, cameraManager)
    {
        this.cameraManagerMap.set(name, cameraManager)
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

    registerKeyEvent(onKeyEvent)
    {
        this.keyEvent.register(onKeyEvent)
    }

    registerMouseMoveEvent(onMouseMoveEvent)
    {
        this.mouseEvent.registerMoveEvent(onMouseMoveEvent)
    }

    registerDblClickEvent(onDblClickEvent)
    {
        this.mouseEvent.registerDoubleClickEvent(onDblClickEvent) 
    }

    setMouseSensitivity(sensitivity)
    {
        this.mouseEvent.setSensitivity(sensitivity)
    }

    changeActiveCamera(name)
    {
        let cameraManager = this.cameraManagerMap.get(name)
        if (cameraManager != null && cameraManager != undefined)
        {
            this.activeCameraManager = cameraManager
            this.activeCameraManager.onActive(this)
        } 
    }

    startLoop()
    {
        if (!this.loopStarted)
        { 
            let sceneObjects = this.sceneObjectMap.values()
            for (let sceneObject of sceneObjects)
                sceneObject.onSceneStart(this)
            this.activeCameraManager = this.cameraManagerMap.values().next().value
            this.activeCameraManager.onActive(this)
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
        this.addReadyObjects()
        this.renderer.setSize(window.innerWidth, window.innerHeight)
        this.renderer.render(this.scene, this.activeCameraManager.getThreeJsCamera())
        let sceneObjects = this.sceneObjectMap.values()
        for (let sceneObject of sceneObjects)
            sceneObject.onSceneRender(this)
        this.keyEvent.notify()
    }

    addReadyObjects()
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