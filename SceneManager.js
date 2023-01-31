import * as THREE from 'three'

export class SceneManager
{
    constructor(canvas, camera, onRenderCallback)
    {
        this.core = new SceneCore(canvas, camera, onRenderCallback)
    }

    add(sceneObject)
    {
        this.core.add(sceneObject)
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
        this.loopStarted = false
    }

    add(sceneObject)
    {
        this.scene.add(sceneObject)
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