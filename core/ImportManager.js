/**
 * This file SHOULD NOT contain any import statement that references either any external libraries
 * or any files within the project.
 */

export class ImportManager
{
    constructor()
    {
        this.pathMap = new Map()
        this.moduleMap = new Map()
    }

    add(moduleName, modulePath) { this.pathMap.set(moduleName, modulePath) }

    execute(onProgress, onComplete)
    {
        if (onProgress == undefined)
            onProgress = (p, s)=>{}
        if (onComplete == undefined)
            onComplete = (m)=>{}
        let names = this.pathMap.keys()
        for (let name of names)
        {    
            import(this.pathMap.get(name)).then((module)=>{
                this.moduleMap.set(name, module)
                onProgress(this.moduleMap.size, this.pathMap.size)
                if (this.moduleMap.size == this.pathMap.size)
                    onComplete(this.moduleMap)
            })
        }
    }
}