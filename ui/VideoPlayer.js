/**
 * Wrapper VideoPlayerCore
 */
export class VideoPlayer
{
    /**
     * @param {String} url url of video file
     * @param {Number} width video width
     * @param {Number} height video height
     */
    constructor(url, width, height) { this.core = new VideoPlayerCore(url, width, height) }
    
    /**
     * Resizes the video
     * @param {Number} width video width
     * @param {Number} height video height
     */
    resize(width, height)
    {
        this.core.video.width = width
        this.core.video.height = height
    }

    /**
     * Delegates call to VideoPlayerCore setLocation
     * @param {Number} xPosition x-coordinate of the video in raster space
     * @param {Number} yPosition y-coordinate of the video in raster space
     */
    setLocation(xPosition, yPosition) { this.core.setLocation(xPosition+10, yPosition+10) }

    /**
     * Delegates call to VideoPlayerCore show
     */
    show() { this.core.show() }

    /**
     * Delegates call to VideoPlayerCore hide
     */
    hide() { this.core.hide() }
}

class VideoPlayerCore
{

    /**
     * @param {String} url url of video file
     * @param {Number} width video width
     * @param {Number} height video height
     */
    constructor(url, width, height)
    {
        this.video = document.createElement('video')
        this.video.src = url
        this.video.loop = true
        this.video.width = width
        this.video.height = height
        this.isShowing = false
    }

    /**
     * Sets the location of the video in raster space.
     * @param {Number} xPosition x-coordinate of the video in raster space
     * @param {Number} yPosition y-coordinate of the video in raster space
     */
    setLocation(xPosition, yPosition)
    {
        let xBound = xPosition + this.video.width
        let yBound = yPosition + this.video.height
        if (xBound > window.innerWidth)
            xPosition -= this.video.width
        if (yBound > window.innerHeight)
            yPosition -= this.video.height
        this.video.style = 'position: absolute; top : '+yPosition+'; left: '+xPosition+';'
    }

    /**
     * Shows the video in screen
     */
    show()
    {
        if (!this.isShowing)
        {
            this.video.play()
            document.body.appendChild(this.video)
            this.isShowing = true
        }
    }

    /**
     * Removes the video from screen
     */
    hide()
    {
        if (this.isShowing)
        {
            document.body.removeChild(this.video)
            this.isShowing = false
        }
    }
}