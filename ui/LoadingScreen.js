/**
 * Wrapper class for LoadingScreenCore
 */
export class LoadingScreen
{
    /**
     * @param {HTMLElement} loadingScreenElement html element for loading screen container
     * @param {HTMLElement} loadingTextElement html element for loading screen text
     * @param {HTMLElement} loadingBarElement html element for loading bar
     */
    constructor(loadingScreenElement, loadingTextElement, loadingBarElement) { this.core = new LoadingScreenCore(loadingScreenElement, loadingTextElement, loadingBarElement) }

    /**
     * Updates the loading status value
     * @param {Number} status status value that is displayed
     */
    update(status) { this.core.status = status }

    /**
     * Shows or hides loading screen
     * @param {Boolean} show flag to show or hide loading screen 
     */
    show(show) 
    { 
        if ((show && !this.core.isVisible) || (!show && this.core.isVisible))
        {
            this.core.isVisible = show
            if (show)
            {
                document.body.append(this.core.loadingScreen)    
                this.core.update()
            }
            else
                document.body.removeChild(this.core.loadingScreen)  
        }
    }

    /**
     * 
     * @returns {Boolean} 
     */
    isVisible() { return this.core.isVisible }
}

/**
 * Updates loading screen for every 100 ms
 */
class LoadingScreenCore
{
    /**
     * @param {HTMLElement} loadingScreenElement html element for loading screen container
     * @param {HTMLElement} loadingTextElement html element for loading screen text
     * @param {HTMLElement} loadingBarElement html element for loading bar
     */
    constructor(loadingScreenElement, loadingTextElement, loadingBarElement)
    {
        this.loadingScreen = loadingScreenElement
        this.loadingText = loadingTextElement
        this.loadingBar = loadingBarElement
        this.dots = ''
        this.dotCount = 1
        this.isVisible = true
        this.status = 0
        this.update()
    }

    /**
     * Updates the loading screen every 100ms
     */
    update()
    {
        for(let i=0; i<this.dotCount; i++)
            this.dots += '.'
        this.dotCount++
        if (this.dotCount > 3)
            this.dotCount = 1
        if (this.status > 99)
        { 
            this.loadingBar.style.width = '100%'
            this.loadingText.innerHTML = 'SETTING UP SCENE' + this.dots
        }
        else
        {
            this.dots += '&nbsp&nbsp&nbsp'
            this.loadingText.innerHTML = 'LOADING'+ this.dots + this.status +'%'
            this.loadingBar.style.width = this.status + '%'
        }
        this.dots = ''
        if (this.isVisible)
            setTimeout(()=>this.update(), 100)
    }
}