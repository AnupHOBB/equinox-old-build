export class VideoPlayer
{
    constructor(url, width, height)
    {
        this.core = new VideoPlayerCore(url, width, height)
    }
    
    resize(width, height)
    {
        this.core.video.width = width
        this.core.video.height = height
    }

    setLocation(xPosition, yPosition)
    {
        this.core.setLocation(xPosition, yPosition)
    }

    show()
    {
        this.core.show()
    }

    hide()
    {
        this.core.hide()
    }
}

class VideoPlayerCore
{
    constructor(url, width, height)
    {
        this.video = document.createElement('video')
        this.video.src = url
        this.video.loop = true
        this.video.width = width
        this.video.height = height
        this.isShowing = false
    }

    setLocation(xPosition, yPosition)
    {
        let xBound = xPosition + this.video.width
        let yBound = yPosition + this.video.height
        if (xBound > window.innerWidth)
            xPosition -= this.video.width
        if (yBound > window.innerHeight)
            yPosition -= this.video.height
        this.video.style = this.toCssFormat(xPosition, yPosition)
    }

    show()
    {
        if (!this.isShowing)
        {
            this.video.play()
            document.body.appendChild(this.video)
            this.isShowing = true
        }
    }

    hide()
    {
        document.body.removeChild(this.video)
        this.isShowing = false
    }

    toCssFormat(xPosition, yPosition)
    {
        return 'position: absolute; top : '+yPosition+'; left: '+xPosition+';'
    }
}