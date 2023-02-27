/**
 * Encapsulates all the html element involved in AR feature
 */
export class ARViewer
{
    /**
     * @param {HTMLImageElement} arButtonElement image tag that is ised as the AR button
     */
    constructor(arButtonElement)
    {
        this.modelViewer = document.createElement('model-viewer')
        this.modelViewer.style = 'width:0%; height:0%'
        this.modelViewer.ar = true
        this.modelViewer.arScale = 'fixed'
        this.modelViewer.src = './assets/LouveredRoof.glb'
        this.arButtonElement = arButtonElement
        this.arButtonElement.addEventListener('click', (e)=>modelViewer.activateAR()) 
        this.isVisible = true
    }

    /**
     * Sets the color of the model in AR mode
     * @param {String} colorInHex color value in hexdecimal
     */
    setColor(colorInHex)
    {
        const materials = this.modelViewer.model.materials
        for (let material of materials)
            material.pbrMetallicRoughness.setBaseColorFactor(colorInHex)
    }

    /**
     * Shows or hides the AR button
     * @param {Boolean} show flag that shows or hide the AR button
     */
    show(show)
    {
        if (show && !this.isVisible)
        {
            document.body.appendChild(this.arButtonElement)
            this.isVisible = true
        }
        else if (!show && this.isVisible)
        {
            document.body.removeChild(this.arButtonElement)
            this.isVisible = false
        }
    }
}