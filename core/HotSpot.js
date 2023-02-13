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
        this.onMove = ()=>{}
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
    setOnDblClick(onDblClick) { this.img.ondblclick = onDblClick }

    /**
     * Sets the mouse move callback
     * @param {Function} onMove callback function that is called when the mouse or touch cursor is moved 
     */
    setOnMove(onMove) { this.onMove = onMove }

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
            this.onMove()
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