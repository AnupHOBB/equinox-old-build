import * as THREE from 'three'

export class SceneManager
{
    constructor(canvas, camera, onRenderCallback)
    {
        this.core = new SceneCore(canvas, camera, onRenderCallback)
    }

    add(sceneObject, shouldRayCast)
    {
        this.core.add(sceneObject, shouldRayCast)
    }

    raycast(rasterCoord)
    {
        return this.core.raycast(rasterCoord)
    }

    startLoop()
    {
        this.core.startLoop()
    }
}

class SceneCore
{
    constructor(canvas, camera, onRenderCallback)
    {
        this.renderer = new THREE.WebGLRenderer({canvas, alpha:true, antialias:true})
        this.renderer.shadowMap.enabled = true
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap
        this.scene = new THREE.Scene()
        this.camera = camera
        this.onRenderCallback = onRenderCallback
        this.raycastObjects = []
        this.loopStarted = false
    }

    add(sceneObject, shouldRayCast)
    {
        this.scene.add(sceneObject)
        if (shouldRayCast)
            this.raycastObjects.push(sceneObject)
    }

    raycast(rasterCoord)
    {
        let screenSpaceX = (rasterCoord.x / window.innerWidth) *  2 - 1
        let screenSpaceY = -(rasterCoord.y / window.innerHeight) *  2 + 1
        let rayCaster = new THREE.Raycaster()
        rayCaster.setFromCamera({ x: screenSpaceX, y: screenSpaceY }, this.camera)
        let hitObjects = rayCaster.intersectObjects(this.raycastObjects)
        return (hitObjects.length > 0) ? hitObjects[0].point : undefined
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
        this.camera.aspect = window.innerWidth/window.innerHeight
        this.camera.updateProjectionMatrix()
        this.renderer.setSize(window.innerWidth, window.innerHeight)
        this.renderer.render(this.scene, this.camera)
        this.onRenderCallback()
    }
}