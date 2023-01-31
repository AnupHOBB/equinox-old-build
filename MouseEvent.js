let core = null

export class MouseEvent
{
    constructor(canvas)
    {
        if (core == null)
            core = new MouseEventCore(canvas)
    }

    setSensitivity(sensitivity)
    {
        if (sensitivity != null && sensitivity != undefined)
            core.sensitivity = sensitivity
    }

    registerClickEvent(onClick)
    {
        if (onClick != null && onClick != undefined)
            core.clickCallbacks.push(onClick)
    }

    registerMoveEvent(onMoveClick)
    {
        if (onMoveClick != null && onMoveClick != undefined)
            core.moveCallbacks.push(onMoveClick)
    }

    registerDoubleClickEvent(onDblClick)
    {
        if (onDblClick != null && onDblClick != undefined)
            core.dblClickCallbacks.push(onDblClick)
    }

    enable()
    {
        core.enable = true
    }

    disable()
    {
        core.enable = false
    }
}

class MouseEventCore
{
    constructor(canvas)
    {
        this.mousePress = false
        this.enable = true
        this.firstClick = true
        this.lastXY = { x: 0, y: 0 }
        this.sensitivity = 1
        this.canvas = canvas
        this.dblClickCounter = 0
        this.clickCallbacks = []
        this.moveCallbacks = []
        this.dblClickCallbacks = []
        this.canvas.addEventListener('mousedown', e=>this.onPress(e))
        this.canvas.addEventListener('mouseup', e=>this.onRelease(e))
        this.canvas.addEventListener('mousemove', e=>this.onMove(e))
        this.canvas.addEventListener('click', e=>this.onClick(e))
        this.canvas.addEventListener('dblclick', e=>this.onDblClick(e))
    }

    onClick(event)
    {
        for (let clickCallback of this.clickCallbacks)
            clickCallback(event.clientX, event.clientY)
    }
    
    onPress(event)
    {
        this.mousePress = true
    }

    onRelease(event)
    {
        this.mousePress = false
        this.firstClick = true
        this.lastXY = { x: 0, y: 0 }
    }

    onMove(event)
    {
        if (this.mousePress && this.enable)
        {    
            if (this.firstClick)
            {
                this.lastXY = { x: event.clientX, y: event.clientY }
                this.firstClick = false
            }
            this.currentXY = { x: event.clientX, y: event.clientY }
            let deltaX = (this.currentXY.x - this.lastXY.x) * this.sensitivity
            let deltaY = (this.currentXY.y - this.lastXY.y) * this.sensitivity
            for (let moveCallback of this.moveCallbacks)
                moveCallback(deltaX, deltaY, event.clientX, event.clientY)
            this.lastXY = this.currentXY
        }
    }

    onDblClick(event)
    {
        this.dblClickCounter++
        if (this.dblClickCounter == 2)
            this.dblClickCounter = 0
        for (let dblClickCallback of this.dblClickCallbacks)
            dblClickCallback(event, this.dblClickCounter == 1)
    }
}