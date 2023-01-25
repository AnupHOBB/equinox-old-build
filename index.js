import * as THREE from 'three'
import { GLTFLoader } from 'gltf-loader'
import { SceneManager } from './SceneManager.js'
import { MATHS } from './Maths.js'
import { CameraManager, CAMERA_TYPE } from './CameraManager.js'
import { Light } from './Light.js'
import { Color } from 'three'

const DEBUG = false

window.onload = () =>
{
    const lookAtPosition = new THREE.Vector3(0, 0, -5)
    
    let axis = new THREE.Vector3(0, -1, 0)
    axis.applyAxisAngle(new THREE.Vector3(0, 0, -1), MATHS.toRadians(20))

    const fov = 90
    const aspectRatio = 2
    const nearPlane = 0.1
    const farPlane = 1000
    let camera = new THREE.PerspectiveCamera(fov, aspectRatio, nearPlane, farPlane)
    
    const canvas = document.querySelector('canvas')
    const cameraManager = new CameraManager(canvas, camera)
    cameraManager.setType((DEBUG)?CAMERA_TYPE.firstPerson:CAMERA_TYPE.orbit)

    const sceneManager = new SceneManager(canvas, camera, ()=>{})

    const modelURL = './assets/LouveredRoof.glb'
    new GLTFLoader().load(modelURL, (model)=>onModelLoad(model), (p)=>{}, (e)=>console.log(e))

    let lightPosition = new THREE.Vector3(0, 150, 100)

    let light = new Light(lightPosition, 5, lookAtPosition)
    light.addToScene(sceneManager, DEBUG)

    let material = new THREE.MeshLambertMaterial({color: 0x44aa88})

    let geometry = new THREE.BoxGeometry(100, 0.1, 100)
    let floor = new THREE.Mesh(geometry, material)
    floor.receiveShadow = true
    floor.position.set(0, -2, 0)

    sceneManager.add(floor)

    let ambientLight = new THREE.AmbientLight(0xffffff, 0.8)
    sceneManager.add(ambientLight)

    let texture = new THREE.TextureLoader().load('assets/fire.jpg')
    texture.wrapS = THREE.ClampToEdgeWrapping
    texture.wrapT = THREE.ClampToEdgeWrapping

    let gltfModel

    function onModelLoad(model)
    {
        gltfModel = model.scene.children[0]
        gltfModel.children.forEach(mesh=>{
            mesh.material.shadowSide = THREE.BackSide
            mesh.receiveShadow = true
            mesh.castShadow = true
            mesh.material.map = texture
            mesh.material.color = new Color(0.5, 0.5, 0.5)
        })
        gltfModel.position.set(2, -2, -3)
        sceneManager.add(gltfModel)
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