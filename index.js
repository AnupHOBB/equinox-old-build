import * as THREE from 'three'
import { GLTFLoader } from 'gltf-loader'
import { MouseEvent } from './MouseEvent.js'
import { SceneManager } from './SceneManager.js'
import { MATHS } from './Maths.js'
import { OrbitControl } from './OrbitControl.js'
import { Light } from './Light.js'

window.onload = () =>
{
    const lookAtPosition = new THREE.Vector3(0, -1, -5)
    
    let axis = new THREE.Vector3(0, -1, 0)
    axis.applyAxisAngle(new THREE.Vector3(0, 0, -1), MATHS.toRadians(20))

    const fov = 90
    const aspectRatio = 2
    const nearPlane = 0.1
    const farPlane = 1000
    let camera = new THREE.PerspectiveCamera(fov, aspectRatio, nearPlane, farPlane)

    const cameraOrbiter = new OrbitControl(camera, axis, lookAtPosition)
    
    const canvas = document.querySelector('canvas')
    const sceneManager = new SceneManager(canvas, camera, ()=>{})

    const modelURL = './assets/LouveredRoof.glb'
    new GLTFLoader().load(modelURL, (model)=>onModelLoad(model), (p)=>{}, (e)=>console.log(e))
    
    const mouseEvent = new MouseEvent(canvas, (dx, dy)=>cameraOrbiter.pan(dx))
    mouseEvent.setSensitivity(0.5)
    mouseEvent.registerDoubleClickEvent(onDoubleClick)

    let lightPosition = new THREE.Vector3(0, 400, 800)

    let light = new Light(lightPosition, 25, lookAtPosition)
    light.addToScene(sceneManager, false)

    let material = new THREE.MeshLambertMaterial({color: 0x44aa88})
    let geometry = new THREE.BoxGeometry(100, 0.1, 100)
    let floor = new THREE.Mesh(geometry, material)
    floor.receiveShadow = true
    floor.position.set(0, -2, 0)

    sceneManager.add(floor)

    let gltfModel

    function onModelLoad(model)
    {
        gltfModel = model.scene.children[0]
        gltfModel.children.forEach(mesh=>{
            mesh.receiveShadow = true
            mesh.castShadow = true
        })
        gltfModel.position.set(2, -2, -3)
        gltfModel.receiveShadow = true
        gltfModel.castShadow = true
        sceneManager.add(gltfModel)
    }

    function onDoubleClick(event, flag)
    {
        if (flag)
            cameraOrbiter.start(60)
        else
            cameraOrbiter.stop()
    }

    let prevSliderValue = 0

    const slider = document.getElementById('slider')
    slider.addEventListener('input', ()=>onSliderChange(slider.value))

    function onSliderChange(value)
    {
        light.orbit(prevSliderValue - value)
        prevSliderValue = value
    }
}