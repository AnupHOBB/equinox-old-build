import { MATHS } from './helpers/maths.js'
import { Hotspot } from './core/HotSpot.js'
import { SliderUI } from './ui/SliderUI.js'

window.onload = () =>
{
    let THREE
    let gltfActor 
    let sceneManager
    let cameraManager
    let directLight
    let videoPlayer
    let MISC

    new SliderUI(document.getElementById('slider-light'), (v)=>directLight.orbit(v))
    new SliderUI(document.getElementById('slider-roof'), (v)=>gltfActor.updateAnimationFrame(-(v/180)))
    
    let loadingText = document.getElementById('loading-text')
    let loadingBar = document.getElementById('loading-bar')
    let dots = ''
    let dotCount = 1
    let status = 0    
    let modelStatus = 0
    let textureStatus = 0
    let jsFilesStatus = 0
    let queryLoadStatus = true

    checkLoading()
    function checkLoading()
    {
        if (queryLoadStatus)
        {
            status = Math.round(((modelStatus + textureStatus + jsFilesStatus)/300) * 100)
            for(let i=0; i<dotCount; i++)
                dots += '.'
            dotCount++
            if (dotCount > 3)
                dotCount = 1
            if (status > 99)
            { 
                loadingBar.style.width = '100%'
                loadingText.innerHTML = 'SETTING UP SCENE' + dots
            }
            else
            {
                dots += '&nbsp&nbsp&nbsp'
                loadingText.innerHTML = 'LOADING'+ dots +status+'%'
                loadingBar.style.width = status + '%'
            }
            dots = ''
            setTimeout(checkLoading, 100)
        }
    }

    function onLoadingComplete()
    {
        let hotSpot1 = new Hotspot('assets/hotspot.png', MATHS.addVectors(gltfActor.getPosition(), new THREE.Vector3(-3.55, 2.4, 0.01)))
        hotSpot1.setOnClick((e)=>{
            if (!cameraManager.isZoomed())
                videoPlayer.show(e.clientX, e.clientY)
        })
        hotSpot1.setOnMove(()=>videoPlayer.hide())
        hotSpot1.setOnDblClick(()=>sceneManager.broadcastTo(gltfActor.name, cameraManager.name, hotSpot1.worldPosition))
        let hotSpot2 = new Hotspot('assets/hotspot.png', MATHS.addVectors(gltfActor.getPosition(), new THREE.Vector3(-0.85, 2.4, 0.01)))
        hotSpot2.setOnClick((e)=>{
            if (!cameraManager.isZoomed())
                videoPlayer.show(e.clientX, e.clientY)
        })
        hotSpot2.setOnMove(()=>videoPlayer.hide())
        hotSpot2.setOnDblClick(()=>sceneManager.broadcastTo(gltfActor.name, cameraManager.name, hotSpot2.worldPosition))
        let hotSpot3 = new Hotspot('assets/hotspot.png', MATHS.addVectors(gltfActor.getPosition(), new THREE.Vector3(-3.25, 2.4, -3.4)))
        hotSpot3.setOnClick((e)=>{
            if (!cameraManager.isZoomed())
                videoPlayer.show(e.clientX, e.clientY)
        })
        hotSpot3.setOnMove(()=>videoPlayer.hide())
        hotSpot3.setOnDblClick(()=>sceneManager.broadcastTo(gltfActor.name, cameraManager.name, hotSpot3.worldPosition))
        gltfActor.addHotSpots(hotSpot1)
        gltfActor.addHotSpots(hotSpot2)
        gltfActor.addHotSpots(hotSpot3)
        queryLoadStatus = false
        let loadingScreen = document.getElementById('loading-screen')
        document.body.removeChild(loadingScreen) 
    }

    let colors = ['#ECF9FF', '#FFFBEB', '#FFE7CC', '#F8CBA6']
    let colorMenu = document.getElementById('color-menu')
    for(let i=0; i<colors.length; i++)
    {
        let colorItem = document.createElement('div')
        colorItem.id = 'color-item'+i
        colorItem.className = 'color-item'
        colorItem.style.backgroundColor = colors[i]
        colorItem.onclick = ()=>
        {
            let style = window.getComputedStyle(colorItem)
            let color = MISC.toColor(style.getPropertyValue('background-color'))
            gltfActor.applyColor(color)
        }  
        colorMenu.appendChild(colorItem)
    }

    importAll()
    function importAll()
    {
        import("three").then((THR)=>{
            THREE = THR
            const canvas = document.querySelector('canvas')
            const lookAtPosition = new THREE.Vector3(0, 0, -5)
            import("./core/SceneManager.js").then((M)=>{
                sceneManager = new M.SceneManager(canvas)
                jsFilesStatus += 12.5
                new THREE.TextureLoader().load('./assets/Colored_Paving_Bricks.png', (texture)=>{
                    texture.wrapS = THREE.RepeatWrapping
                    texture.wrapT = THREE.RepeatWrapping
                    texture.repeat = new THREE.Vector2(100, 200)
                    texture.anisotropy = 2
                    import("./helpers/misc.js").then((M)=>{
                        MISC = M.MISC
                        import("./core/Actor.js").then((M)=>{
                            let floor = new M.ShapeActor('Floor', new THREE.BoxGeometry(100, 0.1, 100), new THREE.MeshLambertMaterial(), true)
                            floor.applyTexture(texture)
                            floor.setPosition(0, -2, 0)
                            sceneManager.register(floor)
                            new THREE.TextureLoader().load('./assets/envmap.png', (texture)=>{
                                let background = new M.ShapeActor('Background', new THREE.SphereGeometry(100, 256, 16),  new THREE.MeshBasicMaterial( { color: 0xffffff,  map: texture, side: THREE.BackSide }))
                                background.setPosition(0, 0, -4.5)
                                sceneManager.register(background)
                            })
                            gltfActor = new M.MeshActor('Roof', './assets/eq_animation.glb', (xhr)=>{ 
                                let loadStat = Math.round((xhr.loaded/ xhr.total) * 100) 
                                if (loadStat < 100)
                                    modelStatus = loadStat
                            }, ()=>{
                                modelStatus = 100
                                onLoadingComplete()
                            })
                            gltfActor.applyColor(MISC.hexToColor(colors[0]))
                            gltfActor.setPosition(2, -2, -3)
                            sceneManager.register(gltfActor) 
                            jsFilesStatus += 12.5
                            import("./ui/VideoPlayer.js").then((M)=>{
                                videoPlayer = new M.VideoPlayer('./assets/vid.mp4')
                                jsFilesStatus += 12.5
                            })     
                            import("./camera_managers/OrbitalCameraManager.js").then((M)=>{
                                cameraManager = new M.OrbitalCameraManager('Camera', 90, lookAtPosition)
                                sceneManager.register(cameraManager)
                                sceneManager.setActiveCamera('Camera')
                                jsFilesStatus += 12.5
                            })
                            import("./core/Light.js").then((M)=>{
                                directLight = new M.DirectLight('DirectLight', new THREE.Vector3(0, 150, 100), 5, lookAtPosition)
                                sceneManager.register(directLight)
                                sceneManager.register(new M.AmbientLight('AmbientLight', 0xffffff, 0.8))
                                jsFilesStatus += 12.5
                            })
                            import("./core/InputManager.js").then((M)=>{
                                sceneManager.register(new M.InputManager('Input', canvas))
                                jsFilesStatus += 12.5
                            })
                        })
                        jsFilesStatus += 12.5
                    })  
                    textureStatus = 100
                })
                jsFilesStatus += 12.5
            })
        })
    }
}