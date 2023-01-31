import * as THREE from 'three'
import { SceneManager } from './SceneManager.js'
import { CameraManager, CAMERA_TYPE } from './CameraManager.js'
import { Light } from './Light.js'
import { VideoPlayer } from './VideoPlayer.js'
import { MATHS } from './maths.js'
import { GLTFActor, BoxActor } from './Actor.js'
import { RayCast } from './RayCast.js'
import { SliderUI } from './SliderUI.js'

window.onload = () =>
{
    const DEBUG = true

    const lookAtPosition = new THREE.Vector3(0, 0, -5)
    let axis = new THREE.Vector3(0, -1, 0)
    axis.applyAxisAngle(new THREE.Vector3(0, 0, -1), MATHS.toRadians(20))

    const fov = 90
    const aspectRatio = window.innerWidth/window.innerHeight
    const nearPlane = 0.1
    const farPlane = 1000
    const camera = new THREE.PerspectiveCamera(fov, aspectRatio, nearPlane, farPlane)
    
    const raycast = new RayCast(camera)

    const canvas = document.querySelector('canvas')

    const sceneManager = new SceneManager(canvas, camera, ()=>gltfActor.onSceneRender(cameraManager, raycast))

    let videoPlayer = new VideoPlayer('./assets/vid.mp4', 480, 270)

    let gltfActor = new GLTFActor()
    gltfActor.addTexture('./assets/fire.jpg')
    gltfActor.load('./assets/LouveredRoof.glb', onLoading, onLoadComplete)

    function onLoading(model, rayCastable)
    {
        sceneManager.add(model)
        if (rayCastable)
            raycast.addObject(model)
    }

    function onLoadComplete()
    {
        gltfActor.addHotSpots('assets/hotspot.png', onHotSpotClick, ()=>videoPlayer.hide())
        sceneManager.startLoop()
        gltfActor.changeTexture()
    }

    function onHotSpotClick(event)
    {
        videoPlayer.setLocation(event.clientX, event.clientY)
        videoPlayer.show()
    }

    const cameraManager = new CameraManager(canvas, camera, axis, lookAtPosition)
    cameraManager.setType((DEBUG)?CAMERA_TYPE.firstPerson:CAMERA_TYPE.orbit)

    let light = new Light(new THREE.Vector3(0, 150, 100), 5, lookAtPosition)
    light.addToScene(sceneManager, false)

    let floor = new BoxActor(new THREE.BoxGeometry(100, 0.1, 100), new THREE.MeshLambertMaterial({color: 0x44aa88}), true)
    floor.setPosition(0, -2, 0)
    floor.addToScene(sceneManager)
    floor.addToRaycast(raycast)

    let ambientLight = new THREE.AmbientLight(0xffffff, 0.8)
    sceneManager.add(ambientLight)

    new SliderUI((v)=>light.orbit(v))
}