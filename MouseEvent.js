export class MouseEvent
{
    constructor(canvas, onMoveCallback)
    {
        this.core = new MouseEventCore(canvas, onMoveCallback)
    }

    setSensitivity(sensitivity)
    {
        this.core.sensitivity = sensitivity
    }

    registerDoubleClickEvent(onDblClick)
    {
        this.core.registerDoubleClickEvent(onDblClick)
    }

    enable()
    {
        this.core.enable = true
    }

    disable()
    {
        this.core.enable = false
    }
}

class MouseEventCore
{
    constructor(canvas, onMoveCallback)
    {
        this.mousePress = false
        this.enable = true
        this.firstClick = true
        this.lastXY = { x: 0, y: 0 }
        this.onMoveCallback = onMoveCallback
        this.sensitivity = 1
        this.canvas = canvas
        this.dblClickCounter = 0
        this.canvas.addEventListener('mousedown', e=>this.onPress(e))
        this.canvas.addEventListener('mouseup', e=>this.onRelease(e))
        this.canvas.addEventListener('mousemove', e=>this.onMove(e))
    }

    registerDoubleClickEvent(onDblClickCallback)
    {
        this.canvas.addEventListener('dblclick', e=>this.onDblClick(e, onDblClickCallback))
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
            this.onMoveCallback(deltaX, deltaY)
            this.lastXY = this.currentXY
        }
    }

    onDblClick(event, onDblClickCallback)
    {
        this.dblClickCounter++
        if (this.dblClickCounter == 2)
            this.dblClickCounter = 0
        onDblClickCallback(event, this.dblClickCounter == 1)
    }
}