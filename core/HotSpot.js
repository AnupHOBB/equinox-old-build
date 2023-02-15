/**
 * Represents the hotspots that appera attached onto a 3D model
 */
export class Hotspot
{
    /**
     * @param {String} imageUrl url of the image that is displayed as a hotspot
     * @param {THREE.Vector3} worldPosition position of the hotspot in world space
     */
    constructor(imageUrl, worldPosition)
    {
        this.img = document.createElement('img')
        this.img.src = imageUrl
        this.isVisible = false
        this.lastRasterCoord = { x: -1, y: -1 }
        this.worldPosition = worldPosition
        this.input = new HotspotInput(this.img)
    }

    /**
     * Sets the click callback
     * @param {Function} onClick callback function that is called when the user clicks on the hot spot 
     */
    setOnClick(onClick) { this.img.onclick = onClick }

    /**
     * Sets the double click callback
     * @param {Function} onDblClick callback function that is called when the user double clicks on the hot spot 
     */
    setOnDblClick(onDblClick) { this.input.onDoubleClick = onDblClick }

    /**
     * Sets the mouse move callback
     * @param {Function} onMove callback function that is called when the mouse or touch cursor is moved 
     */
    setOnMove(onMove) { this.input.onMove = onMove }

    /**
     * Sets the mouse or touch hold callback
     * @param {Function} onHold callback function that is called when the user clicks on the hot spot 
     */
    setOnHold(onHold) { this.input.onHold = onHold }

    /**
     * Returns the world space position of hot spot
     * @returns {THREE.Vector3} position of the hot spot in world space
     */
    getWorldPosition() { return this.worldPosition }

    /**
     * Sets the raster coordinate of hotspot. This function is called by the actor that the hotspot belongs to
     * @param {Number} x x-coordinate of hotspot in raster space 
     * @param {Number} y y-coordinate of hotspot in raster space 
     */
    setRasterCoordinates(x, y)
    {
        let aspect = window.innerWidth/window.innerHeight
        if (aspect < 1)
            this.img.style = 'position: absolute; top: '+y+'; left: '+x+'; width: auto; height: 3%; user-select: none;'
        else
            this.img.style = 'position: absolute; top: '+y+'; left: '+x+'; width: 2%; height: auto; user-select: none;'
        if (this.lastRasterCoord.x != x || this.lastRasterCoord.y != y)
        {    
            this.input.onMove()
            this.input.press = false
        }
        this.lastRasterCoord = { x: x, y: y }
    }

    /**
     * Displays the hotspot
     */
    show()
    {
        if (!this.isVisible)
        {
            document.body.appendChild(this.img)
            this.isVisible = true
        }
    }

    /**
     * Hides the hotspot
     */
    hide()
    {
        if (this.isVisible)
        {
            document.body.removeChild(this.img)
            this.isVisible = false
        }
    }
}

/**
 * Responsible for managing hotspot inputs
 */
class HotspotInput
{
    /**
     * @param {HTMLImageElement} imageElement the image element that hols the hot spot icon
     */
    constructor(imageElement)
    {
        this.imageElement = imageElement
        this.imageElement.onmousedown = e=>this.onPress(e)
        this.imageElement.onmouseup = e=>this.onRelease(e)
        this.imageElement.ontouchstart = e=>this.onPress(e)
        this.imageElement.ontouchend = e=>this.onRelease(e)
        this.onMove = ()=>{}
        this.onHold = ()=>{}
        this.onDoubleClick = ()=>{}
        this.press = false
        this.dblTapCount = 0
    }

    /**
     * Called whenever the image element detects a mouse down or touch start event
     * @param {Event} event mouse or touch event
     */
    onPress(event)
    {
        this.press = true
        setTimeout(()=>{
            if (this.press)
            {
                if (event.type == 'touchstart') 
                    event = event.touches[0]
                this.onHold(event)
            }
        }, 500)
        this.dblTapCount++
        if (this.dblTapCount > 1)
        {
            this.dblTapCount = 0   
            this.onDoubleClick(event)
        }
        else
            setTimeout(()=>{this.dblTapCount = 0}, 500) 
    }

    /**
     * Called whenever the image element detects a mouse up or touch end event
     * @param {Event} event mouse or touch event
     */
    onRelease(event) { this.press = false }
}