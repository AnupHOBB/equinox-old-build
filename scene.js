import { ImportManager } from './core/ImportManager.js'
import { ARViewer } from './ui/ARViewer.js'
import { ColorMenu } from './ui/ColorMenu.js'
import { LoadingScreen } from './ui/LoadingScreen.js'
import { NavigationBarItem, NavigationBarManager } from './ui/NavigationBar.js'
import { Slider } from './ui/Slider.js'
import { VideoPlayer } from './ui/VideoPlayer.js'

let colors = ['#FFFFFF', '#555555', '#786D5F', '#D4C59C', '#CD7F32']
let colorMenu = new ColorMenu(document.getElementById('color-menu-container'), colors)

let loadingScreen = new LoadingScreen(document.getElementById('loading-screen'), document.getElementById('loading-text'), document.getElementById('loading-bar'))
let videoPlayer = new VideoPlayer(document.getElementById('video-screen'), document.querySelector('video'), document.getElementById('cross-icon'))
videoPlayer.setOnCloseEvent((e)=>videoPlayer.show(false)) 
videoPlayer.show(false)

let slider =  new Slider(document.getElementById('slider-container'), document.getElementById('slider'))
let navBarManager = new NavigationBarManager()

let navBarLightItem = new NavigationBarItem(document.getElementById('nav-bar-light'), document.getElementById('nav-light-img'))
navBarLightItem.setCustomValue('sliderValue', 0)
navBarLightItem.setOnSelect((navBarLightItem)=>{
    slider.show(true)
    slider.setValue(navBarLightItem.getCustomValue('sliderValue'))
    slider.setType('slider-light')
    navBarLightItem.setImage('./assets/light-icon-gray.png')
    navBarLightItem.setContainerClass('nav-bar-item-outer-selected')
})
navBarLightItem.setOnUnselect(()=>{
    slider.show(false)
    navBarLightItem.setImage('./assets/light-icon-orange.png')
    navBarLightItem.setContainerClass('nav-bar-item-outer')
})
navBarManager.addItem(navBarLightItem)

let navBarRoofItem = new NavigationBarItem(document.getElementById('nav-bar-roof'), document.getElementById('nav-roof-img'))
navBarRoofItem.setCustomValue('sliderValue', 0)
navBarRoofItem.setOnSelect((navBarRoofItem)=>{
    slider.show(true)
    slider.setValue(navBarRoofItem.getCustomValue('sliderValue'))
    slider.setType('slider-roof')
    navBarRoofItem.setImage('./assets/roof-icon-gray.png')
    navBarRoofItem.setContainerClass('nav-bar-item-outer-selected')
})
navBarRoofItem.setOnUnselect(()=>{
    slider.show(false)
    navBarRoofItem.setImage('./assets/roof-icon-orange.png')
    navBarRoofItem.setContainerClass('nav-bar-item-outer')
})
navBarManager.addItem(navBarRoofItem)

let navBarColorItem = new NavigationBarItem(document.getElementById('nav-bar-color'), document.getElementById('nav-color-img'))
navBarColorItem.setOnSelect((navBarColorItem)=>{
    colorMenu.show(true)
    navBarColorItem.setImage('./assets/color-icon-gray.png')
    navBarColorItem.setContainerClass('nav-bar-item-outer-selected')
})
navBarColorItem.setOnUnselect(()=>{
    colorMenu.show(false)
    navBarColorItem.setImage('./assets/color-icon-orange.png')
    navBarColorItem.setContainerClass('nav-bar-item-outer')
})
navBarManager.addItem(navBarColorItem)

let arViewer = new ARViewer(document.getElementById('ar-button'))

window.onresize = () => 
{
    if (!loadingScreen.isVisible())
    {
        let isHandHeld = navigator.userAgent.includes('iPad') || navigator.userAgent.includes('iPhone') || navigator.userAgent.includes('Android')
        arViewer.show(isHandHeld)
    }
} 

window.onload = () =>
{    
    let roofModelStatus = 0
    let sceneModelStatus = 0
    let textureStatus = 100
    let importStatus = 0
    loadingScreen.show(true)
    let importmanager = new ImportManager()
    importmanager.add('THREE', 'three')
    importmanager.add('MATHS', '../helpers/maths.js')
    importmanager.add('HOTSPOT', '../core/HotSpot.js')
    importmanager.add('SCENE','../core/SceneManager.js')
    importmanager.add('MISC','../helpers/misc.js')
    importmanager.add('ACTOR','../core/Actor.js')
    importmanager.add('CAMERA','../camera_managers/OrbitalCameraManager.js')
    importmanager.add('LIGHT','../core/Light.js')
    importmanager.add('INPUT','../core/InputManager.js')
    importmanager.execute((p, t) => 
    {
        let stat = Math.round(((roofModelStatus + sceneModelStatus + textureStatus + importStatus)/400) * 100)
        loadingScreen.update(stat)
    }, onImportComplete)

    function onImportComplete(importMap)
    {
        let THREE = importMap.get('THREE')
        const canvas = document.querySelector('canvas')
        const lookAtPosition = new THREE.Vector3(0, 0, -5)
        let SCENE = importMap.get('SCENE')
        let sceneManager = new SCENE.SceneManager(canvas)
        let MISC = importMap.get('MISC')
        arViewer.show(MISC.MISC.isHandHeldDevice())
        let ACTOR = importMap.get('ACTOR')
        new THREE.TextureLoader().load('./assets/envmap.png', (texture)=>{
            let background = new ACTOR.ShapeActor('Background', new THREE.SphereGeometry(100, 256, 16),  new THREE.MeshBasicMaterial( { color: 0xffffff,  map: texture, side: THREE.BackSide }))
            background.setPosition(2, 0, -5)
            sceneManager.register(background)
        })
        let sceneGLTF = new ACTOR.MeshActor('Scene', './assets/scene.glb', (xhr)=>{
            let loadStat = Math.round((xhr.loaded/ xhr.total) * 100) 
            if (loadStat < 100)
            {
                sceneModelStatus = loadStat
                let stat = Math.round(((roofModelStatus + sceneModelStatus + textureStatus + importStatus)/400) * 100)
                loadingScreen.update(stat)
            }
        }, ()=>{
            sceneModelStatus = 100
            let roofGLTF = new ACTOR.MeshActor('Roof', './assets/eq_animation.glb', (xhr)=>{ 
                let loadStat = Math.round((xhr.loaded/ xhr.total) * 100) 
                if (loadStat < 100)
                {    
                    roofModelStatus = loadStat
                    let stat = Math.round(((roofModelStatus + sceneModelStatus + textureStatus + importStatus)/400) * 100)
                    loadingScreen.update(stat)
                }
            }, ()=>{
                roofModelStatus = 100
                let completeStat = Math.round(((roofModelStatus + sceneModelStatus + textureStatus + importStatus)/400) * 100)
                loadingScreen.update(completeStat)
                onLoadingComplete(sceneManager, cameraManager, roofGLTF, importMap)
            })
            roofGLTF.applyColor(MISC.MISC.hexToColor(colors[0]))
            roofGLTF.setPosition(2, -2, -3)
            sceneManager.register(roofGLTF) 
            slider.setCallback((d, v, c)=>{
                if (c == 'slider-light')
                {    
                    navBarLightItem.setCustomValue('sliderValue', v)
                    directLight.orbit(d)
                }
                else if (c == 'slider-roof')
                {
                    navBarRoofItem.setCustomValue('sliderValue', v)
                    roofGLTF.updateAnimationFrame(-(d/180))
                }
            })
        })
        sceneGLTF.setPosition(-39, -10.5, 60.4)
        sceneManager.register(sceneGLTF) 
        let CAMERA = importMap.get('CAMERA')
        let cameraManager = new CAMERA.OrbitalCameraManager('Camera', 90, lookAtPosition)
        sceneManager.register(cameraManager)
        sceneManager.setActiveCamera('Camera')
        let LIGHT = importMap.get('LIGHT')
        let directLight = new LIGHT.DirectLight('DirectLight', new THREE.Vector3(0, 150, 100), 5, lookAtPosition)
        sceneManager.register(directLight)
        sceneManager.register(new LIGHT.AmbientLight('AmbientLight', 0xffffff, 0.8))
        let INPUT = importMap.get('INPUT')
        sceneManager.register(new INPUT.InputManager('Input', canvas))
    }

    function onLoadingComplete(sceneManager, cameraManager, gltfActor, importMap)
    {
        let HOTSPOT = importMap.get('HOTSPOT')
        let MATHS = importMap.get('MATHS')
        let THREE = importMap.get('THREE')
        let MISC = importMap.get('MISC')
        let hotSpot1 = new HOTSPOT.Hotspot(MATHS.MATHS.addVectors(gltfActor.getPosition(), new THREE.Vector3(-3.55, 2.4, 0.01)))
        hotSpot1.setRenderCondition(()=>{ return !videoPlayer.isShowing() })
        hotSpot1.setOnClick((e)=>videoPlayer.show(true))
        hotSpot1.setOnDblClick(()=>sceneManager.broadcastTo(gltfActor.name, cameraManager.name, hotSpot1.worldPosition))
        let hotSpot2 = new HOTSPOT.Hotspot(MATHS.MATHS.addVectors(gltfActor.getPosition(), new THREE.Vector3(-0.85, 2.4, 0.01)))
        hotSpot2.setRenderCondition(()=>{ return !videoPlayer.isShowing() })
        hotSpot2.setOnClick((e)=>videoPlayer.show(true))
        hotSpot2.setOnDblClick(()=>sceneManager.broadcastTo(gltfActor.name, cameraManager.name, hotSpot2.worldPosition))
        let hotSpot3 = new HOTSPOT.Hotspot(MATHS.MATHS.addVectors(gltfActor.getPosition(), new THREE.Vector3(-3.25, 2.4, -3.2)))
        hotSpot3.setRenderCondition(()=>{ return !videoPlayer.isShowing() })
        hotSpot3.setOnClick((e)=>videoPlayer.show(true))
        hotSpot3.setOnDblClick(()=>sceneManager.broadcastTo(gltfActor.name, cameraManager.name, hotSpot3.worldPosition))
        gltfActor.addHotSpots(hotSpot1)
        gltfActor.addHotSpots(hotSpot2)
        gltfActor.addHotSpots(hotSpot3)
        colorMenu.populateItems(document.getElementById('color-menu'), (color)=>{
            gltfActor.applyColor(MISC.MISC.hexToColor(color))
            arViewer.setColor(color)
        })
        colorMenu.show(false)
        loadingScreen.show(false)
    }
}