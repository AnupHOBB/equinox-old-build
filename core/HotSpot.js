export class Hotspot
{
    constructor(imageUrl, worldPosition)
    {
        this.img = document.createElement('img')
        this.img.src = imageUrl
        this.isVisible = false
        this.lastRasterCoord = { x: -1, y: -1 }
        this.worldPosition = worldPosition
        this.onMove = ()=>{}
    }

    setOnClick(onClick)
    {
        this.img.onclick = onClick
    }

    setOnDblClick(onDblClick)
    {
        this.img.ondblclick = onDblClick
    }

    setOnMove(onMove)
    {
        this.onMove = onMove
    }

    getWorldPosition()
    {
        return this.worldPosition
    }

    setRasterCoordinates(x, y)
    {
        let aspect = window.innerWidth/window.innerHeight
        if (aspect < 1)
            this.img.style = 'position: absolute; top: '+y+'; left: '+x+'; width: auto; height: 3%; user-select: none;'
        else
            this.img.style = 'position: absolute; top: '+y+'; left: '+x+'; width: 3%; height: auto; user-select: none;'
        if (this.lastRasterCoord.x != x || this.lastRasterCoord.y != y)
            this.onMove()
        this.lastRasterCoord = { x: x, y: y }
    }

    show()
    {
        if (!this.isVisible)
        {
            document.body.appendChild(this.img)
            this.isVisible = true
        }
    }

    hide()
    {
        if (this.isVisible)
        {
            document.body.removeChild(this.img)
            this.isVisible = false
        }
    }
}