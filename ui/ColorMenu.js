/**
 * Responsible for populating the color menu
 */
export class ColorMenu
{
    /**
     * @param {Array} colors array of colors in hexadecimal
     */
    constructor(colorContainer, colors) 
    {
        this.colorContainer = colorContainer
        this.colors = colors
        this.isVisible = true
    }

    /**
     * Shows or hides color menu
     */
    show(show)
    {
        if (show && !this.isVisible)
        {
            document.body.append(this.colorContainer)
            this.isVisible = true
        }
        else if (!show && this.isVisible)
        {
            document.body.removeChild(this.colorContainer)
            this.isVisible = false
        }
    }

    /**
     * Populates color item within the color container
     * @param {HTMLElement} colorContainerElement html element that references the container for colors
     */
    populateItems(colorContainerElement, onItemClick)
    {
        for(let i=0; i<this.colors.length; i++)
        {
            let colorItem = document.createElement('div')
            colorItem.id = 'color-item'+i
            colorItem.className = 'color-item'
            colorItem.style.backgroundColor = this.colors[i]
            colorItem.onclick = ()=> { onItemClick(this.colors[i]) }  
            colorContainerElement.appendChild(colorItem)
        }
    }
}