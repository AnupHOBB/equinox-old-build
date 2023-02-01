export class KeyEvent
{
    constructor()
    {
        this.core = new KeyEventCore()
    }

    register(callback)
    {
        this.core.register(callback)
    }

    enable()
    {
        this.core.enable = true
    }

    disable()
    {
        this.core.enable = false
    }

    notify()
    {
        this.core.notify()
    }
}

class KeyEventCore
{
    constructor()
    {
        this.keyMap = { w : false, s : false, a : false, d : false}
        this.enable = true
        this.callbacks = []
        window.addEventListener("keydown", e=>this.onDown(e))
        window.addEventListener("keyup", e=>this.onUp(e))
        setTimeout(()=>this.notify(), 10)
    }

    register(callback)
    {
        this.callbacks.push(callback)
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
            for (let callback of this.callbacks)
                callback(this.keyMap.w, this.keyMap.s, this.keyMap.a, this.keyMap.d)
        }
    }
}