export class SliderUI
{
    constructor(element, onChangeCallback)
    {
        this.core = new SliderUICore(element, onChangeCallback)
    }
}

class SliderUICore
{
    constructor(element, onChangeCallback)
    {
        this.prevSliderValue = 0
        this.onChangeCallback = onChangeCallback
        this.slider = element
        this.slider.addEventListener('input', ()=>this.onChange())
    }

    onChange()
    {
        this.onChangeCallback(this.prevSliderValue - this.slider.value)
        this.prevSliderValue = this.slider.value
    }
}