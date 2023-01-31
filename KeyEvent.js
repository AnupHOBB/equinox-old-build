export class KeyEvent
{
    constructor(onEventCallback)
    {
        this.core = new KeyEventCore(onEventCallback)
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

class KeyEventCore
{
    constructor(onEventCallback)
    {
        this.keyMap = { w : false, s : false, a : false, d : false}
        this.enable = true
        this.onEventCallback = onEventCallback
        window.addEventListener("keydown", e=>this.onDown(e))
        window.addEventListener("keyup", e=>this.onUp(e))
        setTimeout(()=>this.notify(), 10)
    }

    onDown(event)
    {
        if (event.key == 'w')
            this.keyMap.w = true
        if (event.key == 's')
            this.keyMap.s = true
        if (event.key == 'a')
            this.keyMap.a = true
        if (event.key == 'd')
            this.keyMap.d = true
    }

    onUp(event)
    {
        if (event.key == 'w')
            this.keyMap.w = false
        if (event.key == 's')
            this.keyMap.s = false
        if (event.key == 'a')
            this.keyMap.a = false
        if (event.key == 'd')
            this.keyMap.d = false
    }

    notify()
    {
        if (this.enable)
        {
            this.onEventCallback(this.keyMap.w, this.keyMap.s, this.keyMap.a, this.keyMap.d)
            setTimeout(()=>this.notify(), 10)
        }
    }
}