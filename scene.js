import * as THREE from 'three'
import { SceneManager } from './core/SceneManager.js'
import { OrbitalCameraManager } from './camera_managers/OrbitalCameraManager.js'
import { DirectLight } from './core/Light.js'
import { AmbientLight } from './core/Light.js'
import { VideoPlayer } from './ui/VideoPlayer.js'
import { MATHS } from './helpers/maths.js'
import { MeshActor, StaticActor } from './core/Actor.js'
import { SliderUI } from './ui/SliderUI.js'
import { InputManager } from './core/InputManager.js'
import { Hotspot } from './core/HotSpot.js'

window.onload = () =>
{
    const videoPlayer = new VideoPlayer('./assets/vid.mp4', 480, 270)
    new SliderUI(document.getElementById('slider-light'), (v)=>directLight.orbit(v))
    new SliderUI(document.getElementById('slider-roof'), (v)=>gltfActor.updateAnimationFrame(-(v/180)))
    
    let loadingText = document.getElementById('loading-text')
    let loadingBar = document.getElementById('loading-bar')
    let dots = ''
    let dotCount = 1
    let status = 0    

    checkLoading()
    function checkLoading()
    {
        loadingBar.style.width = status + '%'
        if (status == 100)
        { 
            loadingText.innerHTML = 'LOADING COMPLETE'
            setTimeout(onLoadingComplete, 500)
        }
        else
        {
            for(let i=0; i<dotCount; i++)
                dots += '.'
            dotCount++
            if (dotCount > 3)
                dotCount = 1
            dots += '&nbsp&nbsp&nbsp'
            loadingText.innerHTML = 'LOADING'+ dots +status+'%'
            dots = ''
            loadingBar.style.width = status + '%'
            setTimeout(checkLoading, 100)
        }
    }

    function onLoadingComplete()
    {
        let hotSpot1 = new Hotspot('assets/hotspot.png', MATHS.addVectors(gltfActor.getPosition(), new THREE.Vector3(-3.55, 2.4, 0.01)))
        hotSpot1.setOnClick(showVideo)
        hotSpot1.setOnMove(()=>videoPlayer.hide())
        hotSpot1.setOnDblClick(()=>{ sceneManager.broadcastTo(gltfActor.name, cameraManager.name, hotSpot1.worldPosition) })
        let hotSpot2 = new Hotspot('assets/hotspot.png', MATHS.addVectors(gltfActor.getPosition(), new THREE.Vector3(-0.85, 2.4, 0.01)))
        hotSpot2.setOnClick(showVideo)
        hotSpot2.setOnMove(()=>videoPlayer.hide())
        hotSpot2.setOnDblClick(()=>{ sceneManager.broadcastTo(gltfActor.name, cameraManager.name, hotSpot2.worldPosition) })
        let hotSpot3 = new Hotspot('assets/hotspot.png', MATHS.addVectors(gltfActor.getPosition(), new THREE.Vector3(-3.25, 2.4, -3.4)))
        hotSpot3.setOnClick(showVideo)
        hotSpot3.setOnMove(()=>videoPlayer.hide())
        hotSpot3.setOnDblClick(()=>{ sceneManager.broadcastTo(gltfActor.name, cameraManager.name, hotSpot3.worldPosition) })
        gltfActor.addHotSpots(hotSpot1)
        gltfActor.addHotSpots(hotSpot2)
        gltfActor.addHotSpots(hotSpot3)
        let loadingScreen = document.getElementById('loading-screen')
        document.body.removeChild(loadingScreen) 
    }

    function showVideo(e)
    {
        videoPlayer.setLocation(e.clientX, e.clientY)
        videoPlayer.show()
    }

    let colors = ['#ECF9FF', '#FFFBEB', '#FFE7CC', '#F8CBA6']
    registerColorClicks()
    function registerColorClicks()
    {
        let colorMenu = document.getElementById('color-menu')
        for(let i=0; i<colors.length; i++)
        {
            let colorItem = document.createElement('div')
            colorItem.id = 'color-item'+i
            colorItem.className = 'color-item'
            colorItem.style.backgroundColor = colors[i]
            colorItem.onclick = ()=>{
                let style = window.getComputedStyle(colorItem)
                let color = toColor(style.getPropertyValue('background-color'))
                gltfActor.applyColor(color)
            }
            colorMenu.appendChild(colorItem)
        }
    }

    function toColor(str)
    {
        let match = str.match(/rgba?\((\d{1,3}), ?(\d{1,3}), ?(\d{1,3})\)?(?:, ?(\d(?:\.\d?))\))?/)
        return match ? new THREE.Color(match[1]/255, match[2]/255, match[3]/255) : new THREE.Color()
    }

    const gltfActor = new MeshActor('Roof', './assets/eq_animation.glb', (xhr)=>{status = Math.round((xhr.loaded/ xhr.total) * 100)})
    gltfActor.setPosition(2, -2, -3)

    const canvas = document.querySelector('canvas')

    const sceneManager = new SceneManager(canvas)
    sceneManager.register(gltfActor)    

    const lookAtPosition = new THREE.Vector3(0, 0, -5)
    const axis = new THREE.Vector3(0, -1, 0)
    axis.applyAxisAngle(new THREE.Vector3(0, 0, -1), MATHS.toRadians(20))
    const cameraManager = new OrbitalCameraManager('Camera', 90, axis, lookAtPosition)
    sceneManager.register(cameraManager)
    sceneManager.setActiveCamera('Camera')

    const directLight = new DirectLight('DirectLight', new THREE.Vector3(0, 150, 100), 5, lookAtPosition)
    sceneManager.register(directLight)

    const floor = new StaticActor('Floor', new THREE.BoxGeometry(100, 0.1, 100), new THREE.MeshLambertMaterial(), true)
    floor.applyTexture('./assets/Colored_Paving_Bricks.png')
    floor.setPosition(0, -2, 0)
    sceneManager.register(floor)
    sceneManager.register(new AmbientLight('AmbientLight', 0xffffff, 0.8))
    sceneManager.register(new InputManager('Input', canvas))
}