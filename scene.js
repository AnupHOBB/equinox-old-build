import * as THREE from 'three'
import { SceneManager } from './core/SceneManager.js'
import { FirstPersonCameraManager } from './camera_managers/FirstPersonCameraManager.js'
import { OrbitalCameraManager } from './camera_managers/OrbitalCameraManager.js'
import { DirectLight } from './core/Light.js'
import { AmbientLight } from './core/Light.js'
import { VideoPlayer } from './ui/VideoPlayer.js'
import { MATHS } from './helpers/maths.js'
import { MeshActor, StaticActor } from './core/Actor.js'
import { SliderUI } from './ui/SliderUI.js'
import { InputManager } from './core/InputManager.js'

window.onload = () =>
{
    const DEBUG = true

    const videoPlayer = new VideoPlayer('./assets/vid.mp4', 480, 270)
    new SliderUI((v)=>{
        gltfActor.updateAnimationFrame(-(v/180))
        //directLight.orbit(v)
    })

    const gltfActor = new MeshActor('Roof', './assets/eq_animation.glb', (xhr)=>{status = Math.round((xhr.loaded/ xhr.total) * 100)})
    gltfActor.setPosition(2, -2, -3)
    if (DEBUG)
    gltfActor.applyTexture('./assets/fire.jpg')
    
    let loadingText = document.getElementById('loading-text')
    let loadingBar = document.getElementById('loading-bar')
    let dots = ''
    let dotCount = 1
    let status = 0    
    let text = 'LOADING'

    checkLoading()
    function checkLoading()
    {
        if (status == 100)
        {
            gltfActor.addHotSpots('assets/hotspot.png', new THREE.Vector3(-2.15, 2.6, 0.08), (e)=> {
                videoPlayer.setLocation(e.clientX, e.clientY)
                videoPlayer.show()
            }, ()=>videoPlayer.hide())
            let loadingScreen = document.getElementById('loading-screen')
            document.body.removeChild(loadingScreen) 
        }
        else
        {
            for(let i=0; i<dotCount; i++)
                dots += '.'
            dotCount++
            if (dotCount > 3)
                dotCount = 1
            dots += '&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp'
            loadingText.innerHTML = text+ dots +status+'%'
            dots = ''

            loadingBar.style.width = status + '%'
            setTimeout(checkLoading, 100)
        }
    }

    const canvas = document.querySelector('canvas')

    const sceneManager = new SceneManager(canvas)
    sceneManager.register(gltfActor)    

    const lookAtPosition = new THREE.Vector3(0, 0, -5)
    const axis = new THREE.Vector3(0, -1, 0)
    axis.applyAxisAngle(new THREE.Vector3(0, 0, -1), MATHS.toRadians(20))
    const cameraManager = (DEBUG) ? new FirstPersonCameraManager('Camera', 90) : new OrbitalCameraManager('Camera', 90, axis, lookAtPosition)
    sceneManager.register(cameraManager)
    sceneManager.setActiveCamera('Camera')

    const directLight = new DirectLight('DirectLight', new THREE.Vector3(0, 150, 100), 5, lookAtPosition)
    //directLight.showGizmo(DEBUG)
    sceneManager.register(directLight)

    const floor = new StaticActor('Floor', new THREE.BoxGeometry(100, 0.1, 100), new THREE.MeshLambertMaterial({color: 0x44aa88}), true)
    floor.setPosition(0, -2, 0)
    sceneManager.register(floor)
    sceneManager.register(new AmbientLight('AmbientLight', 0xffffff, 0.8))
    sceneManager.register(new InputManager('Input', canvas))
}