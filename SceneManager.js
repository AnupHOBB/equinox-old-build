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
}

class SceneCore
{
    constructor(canvas, camera, onRenderCallback)
    {
        this.renderer = new THREE.WebGLRenderer({canvas, alpha:true})
        this.renderer.shadowMap.enabled = true
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap
        this.scene = new THREE.Scene()
        this.camera = camera
        this.onRenderCallback = onRenderCallback
        window.requestAnimationFrame(()=>this.animFrame())
    }

    add(sceneObject)
    {
        this.scene.add(sceneObject)
    }

    animFrame()
    {
        this.renderLoop()
        window.requestAnimationFrame(()=>this.animFrame())
    }

    renderLoop()
    {
        this.renderer.setSize(window.innerWidth, window.innerHeight)
        this.renderer.render(this.scene, this.camera)
        this.onRenderCallback()
    }
}