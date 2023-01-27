import * as THREE from 'three'
import { GLTFLoader } from 'gltf-loader'
import { SceneManager } from './SceneManager.js'
import { CameraManager, CAMERA_TYPE } from './CameraManager.js'
import { Light } from './Light.js'
import { Color } from 'three'
import { VideoPlayer } from './VideoPlayer.js'
import { MATHS } from './maths.js'

const DEBUG = true

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
    const cameraManager = new CameraManager(canvas, camera, axis, lookAtPosition)
    cameraManager.setType((DEBUG)?CAMERA_TYPE.firstPerson:CAMERA_TYPE.orbit)

    const sceneManager = new SceneManager(canvas, camera, onSceneRender)

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
            //mesh.material.map = texture
            //mesh.material.color = new Color(0.5, 0.5, 0.5)
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
    
    let img = document.createElement('img')
    img.src = 'assets/hotspot.png'
    img.onclick = onClick

    let videoPlayer = new VideoPlayer('./assets/vid.mp4', 480, 270)
    let isShowing = false

    function onClick(event)
    {
        if (!isShowing)
        {
            videoPlayer.setLocation(event.clientX, event.clientY)
            videoPlayer.show()
            isShowing = true
        }
    }

    let lastRasterCoord = { x: -1, y: -1 }
    let isHotSpotVisible = false

    function onSceneRender()
    {
        if (gltfModel != undefined && img != undefined)
        {
            let [rasterCoord, isVisible] = cameraManager.worldToRaster(camera, gltfModel.position)
            if (isVisible)
            {
                if (lastRasterCoord.x < 0 && lastRasterCoord.y < 0)
                    lastRasterCoord = rasterCoord
                img.style = 'position: absolute; top: '+rasterCoord.y+'; left: '+rasterCoord.x+'; width: 3%; height: auto;'
                if (!isHotSpotVisible)
                {
                    document.body.appendChild(img)
                    isHotSpotVisible = true
                }
                if (isShowing && (lastRasterCoord.x != rasterCoord.x || lastRasterCoord.y != rasterCoord.y))
                {
                    videoPlayer.hide()
                    isShowing = false
                }
                lastRasterCoord = rasterCoord
            }
            else
            {    
                if (isHotSpotVisible)
                {
                    document.body.removeChild(img)
                    isHotSpotVisible = false
                }
            }
        }
    }
}