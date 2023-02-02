export class InputManager
{
    constructor(canvas)
    {
        this.keyEvent = new KeyEventCore()
        this.mouseEvent = new MouseEventCore(canvas)
    }

    registerKeyEvent(callback)
    {
        this.keyEvent.register(callback)
    }

    notifyKeyEvent()
    {
        this.keyEvent.notify()
    }

    setCursorSensitivity(sensitivity)
    {
        if (sensitivity != null && sensitivity != undefined)
            this.mouseEvent.sensitivity = sensitivity
    }

    registerClickEvent(onClick)
    {
        if (onClick != null && onClick != undefined)
            this.mouseEvent.clickCallbacks.push(onClick)
    }

    registerMoveEvent(onMoveEvent)
    {
        if (onMoveEvent != null && onMoveEvent != undefined)
            this.mouseEvent.moveCallbacks.push(onMoveEvent)
    }

    registerDoubleClickEvent(onDblClick)
    {
        if (onDblClick != null && onDblClick != undefined)
            this.mouseEvent.dblClickCallbacks.push(onDblClick)
    }
}

class KeyEventCore
{
    constructor()
    {
        this.keyMap = new Map()
        this.callbacks = []
        window.addEventListener("keydown", e=>this.onDown(e))
        window.addEventListener("keyup", e=>this.onUp(e))
    }

    register(callback)
    {
        this.callbacks.push(callback)
    }

    onDown(event)
    {
        let entry = this.keyMap.get(event.key)
        if (entry == null || entry == undefined)
            this.keyMap.set(event.key, true)
    }

    onUp(event)
    {
        let entry = this.keyMap.get(event.key)
        if (entry != null && entry != undefined)
            this.keyMap.delete(event.key)
    }

    notify()
    {
        for (let callback of this.callbacks)
            callback(this.keyMap)
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
        this.dblClickCounter = 0
        this.clickCallbacks = []
        this.moveCallbacks = []
        this.dblClickCallbacks = []
        canvas.addEventListener('mousedown', e=>this.onPress(e))
        canvas.addEventListener('mouseup', e=>this.onRelease(e))
        canvas.addEventListener('mousemove', e=>this.onMove(e))
        canvas.addEventListener('click', e=>this.onClick(e))
        canvas.addEventListener('dblclick', e=>this.onDblClick(e))
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
        if (this.moveCallbacks.length > 0 && this.mousePress)
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