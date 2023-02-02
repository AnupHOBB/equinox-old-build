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
        this.keyMap = new Map()
        this.enable = true
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
        if (this.enable)
        {
            for (let callback of this.callbacks)
                callback(this.keyMap)
        }
    }
}