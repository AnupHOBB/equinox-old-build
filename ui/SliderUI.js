/**
 * Wrapper SliderUICore
 */
export class SliderUI
{
    /**
     * @param {HTMLElement} element html element for slider
     */
    constructor(element) { this.core = new SliderUICore(element) }

    /**
     * sets the slider value
     * @param {Number} value new slider value 
     */
    setValue(value) 
    { 
        this.core.slider.value = value 
        this.core.prevSliderValue = value
    }

    /**
     * sets the slider class name
     * @param {String} className name of the css class for the slider
     */
    setClassName(className) { this.core.slider.className = className }

    /**
     * sets the slider callback function which is called on detecting change in slider value
     * @param {Function} onChangeCallback callback function to be called on detecting change in slider value
     */
    setCallback(onChangeCallback) { this.core.onChangeCallback = onChangeCallback }
}

/**
 * Wrapper class for slider
 */
class SliderUICore
{
    /**
     * @param {HTMLElement} element html element for slider
     */
    constructor(element)
    {
        this.slider = element
        this.slider.addEventListener('input', ()=>this.onChange())
        this.prevSliderValue = 0
        this.onChangeCallback = (d,v,c)=>{}
    }

    /**
     * Called by slider element whenever it detects a change in slider position.
     * This function calls the registered callback and provides it the slider displacement value
     * from its last known position.
     */
    onChange()
    {
        this.onChangeCallback(this.prevSliderValue - this.slider.value, this.slider.value, this.slider.className)
        this.prevSliderValue = this.slider.value
    }
}