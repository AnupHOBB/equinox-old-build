export class SliderUI
{
    constructor(onChangeCallback)
    {
        this.core = new SliderUICore(onChangeCallback)
    }
}

class SliderUICore
{
    constructor(onChangeCallback)
    {
        this.prevSliderValue = 0
        this.onChangeCallback = onChangeCallback
        this.slider = document.getElementById('slider')
        this.slider.addEventListener('input', ()=>this.onChange())
    }

    onChange()
    {
        this.onChangeCallback(this.prevSliderValue - this.slider.value)
        this.prevSliderValue = this.slider.value
    }
}