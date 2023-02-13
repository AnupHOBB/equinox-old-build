/**
 * Wrapper SliderUICore
 */
export class SliderUI
{
    /**
     * @param {HTMLElement} element html element for slider
     * @param {Function} onChangeCallback callback that is called whenever the slider moves
     */
    constructor(element, onChangeCallback) { this.core = new SliderUICore(element, onChangeCallback) }
}

/**
 * Wrapper class for slider
 */
class SliderUICore
{
    /**
     * @param {HTMLElement} element html element for slider
     * @param {Function} onChangeCallback callback that is called whenever the slider moves
     */
    constructor(element, onChangeCallback)
    {
        this.prevSliderValue = 0
        this.onChangeCallback = onChangeCallback
        this.slider = element
        this.slider.addEventListener('input', ()=>this.onChange())
    }

    /**
     * Called by slider element whenever it detects a change in slider position.
     * This function calls the registered callback and provides it the slider displacement value
     * from its last known position.
     */
    onChange()
    {
        this.onChangeCallback(this.prevSliderValue - this.slider.value)
        this.prevSliderValue = this.slider.value
    }
}