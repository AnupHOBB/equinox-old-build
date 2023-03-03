import { ImportManager } from './core/ImportManager.js'
import { LoadingScreen } from './ui/LoadingScreen.js'

let loadingScreen = new LoadingScreen(document.getElementById('loading-screen'), document.getElementById('loading-text'), document.getElementById('loading-bar'))
let importMap = new Map()
importMap.set('THREE', 'three')
importMap.set('GLTF','gltf-loader')
importMap.set('MATHS', '../helpers/maths.js')
importMap.set('HOTSPOT', '../core/HotSpot.js')
importMap.set('SCENE','../core/SceneManager.js')
importMap.set('MISC','../helpers/misc.js')
importMap.set('ACTOR','../core/Actor.js')
importMap.set('CAMERA','../camera_managers/OrbitalCameraManager.js')
importMap.set('LIGHT','../core/Light.js')
importMap.set('INPUT','../core/InputManager.js')
importMap.set('AR','../ui/ARViewer.js')
importMap.set('COLOR','../ui/ColorMenu.js')
importMap.set('NAVBAR','../ui/NavigationBar.js')
importMap.set('SLIDER','../ui/Slider.js')
importMap.set('VIDEO','../ui/VideoPlayer.js')
importMap.set('LOADER','../core/AssetLoader.js')

/**
 * Imports all the required modules present within the import map
 */
ImportManager.execute(importMap, (name, module, progress) => 
{//Called after successfully importing each module
    loadingScreen.update(Math.round((progress * 33)/100))
    importMap.set(name, module)
}, onImport)

/**
 * Called after successfully importing all modules
 */
function onImport()
{
    let GLTF = importMap.get('GLTF')
    let THREE = importMap.get('THREE')
    let LOADER = importMap.get('LOADER')
    let loader = new LOADER.AssetLoader()
    loader.addTextureLoader('../assets/envmap.png', new THREE.TextureLoader())
    loader.addGLTFLoader('../assets/scene.glb', new GLTF.GLTFLoader())
    loader.addGLTFLoader('../assets/eq_animation.glb', new GLTF.GLTFLoader())
    loader.execute((p)=>loadingScreen.update(Math.round((p * 67)/100) + 33), onLoadComplete)
}

/**
 * Called after successfully loading all assets
 * @param {Map} assetMap map consisting of all the requested assets
 */
function onLoadComplete(assetMap)
{
    let SCENE = importMap.get('SCENE')
    let sceneManager = new SCENE.SceneManager(document.querySelector('canvas'))
    addSceneObjects(sceneManager, assetMap)
    addUIObjects(sceneManager)
}

/**
 * Adds 3D threejs objects into the threejs scene via SceneManager
 * @param {SceneManager} sceneManager 
 * @param {Map} assetMap map consisting of all the requested assets
 */
function addSceneObjects(sceneManager, assetMap)
{
    let THREE = importMap.get('THREE')
    const lookAtPosition = new THREE.Vector3(0, 0, -5)
    let CAMERA = importMap.get('CAMERA')
    let cameraManager = new CAMERA.OrbitalCameraManager('Camera', 90, lookAtPosition)
    sceneManager.register(cameraManager)
    sceneManager.setActiveCamera('Camera')
    let LIGHT = importMap.get('LIGHT')
    let directLight = new LIGHT.DirectLight('DirectLight', new THREE.Vector3(100, 50, 0), 5, new THREE.Vector3(0, 0, -4))
    sceneManager.register(directLight)
    sceneManager.register(new LIGHT.AmbientLight('AmbientLight', 0xffffff, 0.8))
    let INPUT = importMap.get('INPUT')
    sceneManager.register(new INPUT.InputManager('Input', document.querySelector('canvas')))
    let ACTOR = importMap.get('ACTOR')
    let background = new ACTOR.ShapeActor('Background', new THREE.SphereGeometry(100, 256, 16),  new THREE.MeshBasicMaterial( { color: 0xffffff,  map: assetMap.get('../assets/envmap.png'), side: THREE.BackSide }))
    background.setPosition(2, 0, -5)
    sceneManager.register(background)
    let sceneGLTF = new ACTOR.MeshActor('Scene', assetMap.get('../assets/scene.glb'))
    sceneGLTF.setPosition(-39, -10.5, 60.4)
    sceneManager.register(sceneGLTF) 
    let roofGLTF = new ACTOR.MeshActor('Roof', assetMap.get('../assets/eq_animation.glb'))
    roofGLTF.setPosition(2, -2, -3)
    sceneManager.register(roofGLTF) 
}

/**
 * Adds HTML UI elements
 * @param {SceneManager} sceneManager 
 */
function addUIObjects(sceneManager)
{
    let colors = ['#FFFFFF', '#555555', '#786D5F', '#D4C59C', '#CD7F32']
    let COLOR = importMap.get('COLOR')
    let MISC = importMap.get('MISC')
    let colorMenu = new COLOR.ColorMenu(document.getElementById('color-menu-container'), colors)
    colorMenu.populateItems(document.getElementById('color-menu'), (color)=>{
        sceneManager.broadcastTo('ColorMenu', 'Roof', MISC.MISC.hexToColor(color))
        arViewer.setColor(color)
    })
    colorMenu.show(false)
    sceneManager.broadcastTo('ColorMenu', 'Roof', MISC.MISC.hexToColor(colors[0]))

    let SLIDER = importMap.get('SLIDER')
    let slider =  new SLIDER.Slider(document.getElementById('slider-container'), document.getElementById('slider'))
    slider.setType('slider-light')
    slider.setCallback((deltaValue, value, typeName)=>{
        if (typeName == 'slider-light')
        {    
            navBarLightItem.setCustomValue('sliderValue', value)
            sceneManager.broadcastTo('Slider', 'DirectLight', deltaValue)
        }
        else if (typeName == 'slider-roof')
        {
            navBarRoofItem.setCustomValue('sliderValue', value) 
            sceneManager.broadcastTo('Slider', 'Roof', -(deltaValue/180))
        }
    })

    let NAVBAR = importMap.get('NAVBAR')
    let navBarManager = new NAVBAR.NavigationBarManager()
    let navBarLightData = { selectImage: '../assets/light-icon-gray.png', unselectImage: '../assets/light-icon-orange.png', selectClass: 'nav-bar-item-outer-selected', unselectClass: 'nav-bar-item-outer' }
    let navBarLightItem = new NAVBAR.NavigationBarItem(document.getElementById('nav-bar-light'), document.getElementById('nav-light-img'), navBarLightData)
    navBarLightItem.setCustomValue('sliderValue', 120)
    navBarLightItem.setOnSelect((navBarLightItem)=>{
        slider.show(true)
        slider.setRange(0, 120)
        slider.setValue(navBarLightItem.getCustomValue('sliderValue'))
        slider.setType('slider-light')
    })
    navBarLightItem.setOnUnselect(()=>slider.show(false))
    navBarManager.addItem(navBarLightItem)
    let navBarRoofData = { selectImage: '../assets/roof-icon-gray.png', unselectImage: '../assets/roof-icon-orange.png', selectClass: 'nav-bar-item-outer-selected', unselectClass: 'nav-bar-item-outer' }
    let navBarRoofItem = new NAVBAR.NavigationBarItem(document.getElementById('nav-bar-roof'), document.getElementById('nav-roof-img'), navBarRoofData)
    navBarRoofItem.setCustomValue('sliderValue', 0)
    navBarRoofItem.setOnSelect((navBarRoofItem)=>{
        slider.show(true)
        slider.setRange(0, 250)
        slider.setValue(navBarRoofItem.getCustomValue('sliderValue'))
        slider.setType('slider-roof')
    })
    navBarRoofItem.setOnUnselect(()=>slider.show(false))
    navBarManager.addItem(navBarRoofItem)
    let navBarColorData = { selectImage: '../assets/color-icon-gray.png', unselectImage: '../assets/color-icon-orange.png', selectClass: 'nav-bar-item-outer-selected', unselectClass: 'nav-bar-item-outer' }
    let navBarColorItem = new NAVBAR.NavigationBarItem(document.getElementById('nav-bar-color'), document.getElementById('nav-color-img'), navBarColorData)
    navBarColorItem.setOnSelect(()=>colorMenu.show(true))
    navBarColorItem.setOnUnselect(()=>colorMenu.show(false))
    navBarManager.addItem(navBarColorItem)

    let AR = importMap.get('AR')
    let arViewer = new AR.ARViewer(document.getElementById('ar-button'))
    document.body.onresize = ()=>{arViewer.show(importMap.get('MISC').MISC.isHandHeldDevice() && !loadingScreen.isVisible())}

    let VIDEO = importMap.get('VIDEO')
    let videoPlayer = new VIDEO.VideoPlayer(document.getElementById('video-screen'), document.querySelector('video'), document.getElementById('cross-icon'))
    videoPlayer.show(false)

    let THREE = importMap.get('THREE')
    let HOTSPOT = importMap.get('HOTSPOT')
    let MATHS = importMap.get('MATHS')
    let hotSpot1 = new HOTSPOT.Hotspot(MATHS.MATHS.addVectors(new THREE.Vector3(2, -2, -3), new THREE.Vector3(-3.55, 2.4, 0.01)))
    hotSpot1.setRenderCondition(()=>{ return !videoPlayer.isShowing() && !loadingScreen.isVisible() })
    hotSpot1.setOnClick((e)=>videoPlayer.show(true))
    hotSpot1.setOnDblClick(()=>sceneManager.broadcastTo('Roof', 'Camera', hotSpot1.worldPosition))
    let hotSpot2 = new HOTSPOT.Hotspot(MATHS.MATHS.addVectors(new THREE.Vector3(2, -2, -3), new THREE.Vector3(-0.85, 2.4, 0.01)))
    hotSpot2.setRenderCondition(()=>{ return !videoPlayer.isShowing() && !loadingScreen.isVisible() })
    hotSpot2.setOnClick((e)=>videoPlayer.show(true))
    hotSpot2.setOnDblClick(()=>sceneManager.broadcastTo('Roof', 'Camera', hotSpot2.worldPosition))
    let hotSpot3 = new HOTSPOT.Hotspot(MATHS.MATHS.addVectors(new THREE.Vector3(2, -2, -3), new THREE.Vector3(-3.25, 2.4, -3.2)))
    hotSpot3.setRenderCondition(()=>{ return !videoPlayer.isShowing() && !loadingScreen.isVisible() })
    hotSpot3.setOnClick((e)=>videoPlayer.show(true))
    hotSpot3.setOnDblClick(()=>sceneManager.broadcastTo('Roof', 'Camera', hotSpot3.worldPosition))
    sceneManager.broadcastTo('Hotspot', 'Roof', hotSpot1)
    sceneManager.broadcastTo('Hotspot', 'Roof', hotSpot2)
    sceneManager.broadcastTo('Hotspot', 'Roof', hotSpot3)

    loadingScreen.show(false)
    arViewer.show(MISC.MISC.isHandHeldDevice() && !loadingScreen.isVisible())
}