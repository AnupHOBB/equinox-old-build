/**
 * Wrapper SliderCore
 */
export class Slider
{
    /**
     * @param {HTMLElement} sliderBarContainer html element for slider container
     * @param {HTMLElement} sliderBarElement html element for slider bar
     */
    constructor(sliderBarContainer, sliderBarElement) 
    {
        this.sliderBarContainer = sliderBarContainer
        this.core = new SliderCore(sliderBarElement)
        this.isVisible = true
    }

    /**
     * sets the slider value range
     * @param {Number} min minimum slider value
     * @param {Number} max maximum slider value
     */
    setRange(min, max)
    {
        this.core.sliderBarElement.min = min
        this.core.sliderBarElement.max = max
    }

    /**
     * sets the slider value
     * @param {Number} value new slider value 
     */
    setValue(value) 
    { 
        this.core.sliderBarElement.value = value 
        this.core.prevSliderValue = value
    }

    /**
     * sets the name of the type of slider
     * @param {String} typeName name of the type
     */
    setType(typeName) { this.core.typeName = typeName }

    /**
     * sets the slider callback function which is called on detecting change in slider value
     * @param {Function} onChangeCallback callback function to be called on detecting change in slider value
     */
    setCallback(onChangeCallback) { this.core.onChangeCallback = onChangeCallback }

    /**
     * Shows or hides slider bar
     */
    show(show)
    {
        if (show && !this.isVisible)
        {
            document.body.append(this.sliderBarContainer)
            this.isVisible = true
        }
        else if (!show && this.isVisible)
        {
            document.body.removeChild(this.sliderBarContainer)
            this.isVisible = false
        }
    }
}

/**
 * Wrapper class for slider
 */
class SliderCore
{
    /**
     * @param {HTMLElement} sliderBarElement html element for slider
     */
    constructor(sliderBarElement)
    {
        this.sliderBarElement = sliderBarElement
        this.sliderBarElement.addEventListener('input', ()=>this.onChange())
        this.typeName = ''
        this.prevSliderValue = sliderBarElement.value
        this.onChangeCallback = (d,v,c)=>{}
    }

    /**
     * Called by slider element whenever it detects a change in slider position.
     * This function calls the registered callback and provides it the slider displacement value
     * from its last known position.
     */
    onChange()
    {
        this.onChangeCallback(this.prevSliderValue - this.sliderBarElement.value, this.sliderBarElement.value, this.typeName)
        this.prevSliderValue = this.sliderBarElement.value
    }
}