import { MISC } from '../helpers/misc.js'

/**
 * Wrapper VideoPlayerCore
 */
export class VideoPlayer
{
    /**
     * @param {String} url url of video file
     */
    constructor(url) { this.core = new VideoPlayerCore(url) }

    /**
     * Delegates call to VideoPlayerCore show
     * @param {Number} xPosition x-coordinate of the video in raster space
     * @param {Number} yPosition y-coordinate of the video in raster space
     */
    show(xPosition, yPosition) { this.core.show(xPosition, yPosition) }

    /**
     * Delegates call to VideoPlayerCore hide
     */
    hide() { this.core.hide() }
}

class VideoPlayerCore
{
    /**
     * @param {String} url url of video file
     */
    constructor(url)
    {
        this.video = document.createElement('video')
        this.video.src = url
        this.video.loop = true
        this.setLocation(0,0)
        this.isShowing = false
    }

    /**
     * Shows the video in screen
     */
    show(xPosition, yPosition)
    {
        if (!this.isShowing)
        {
            document.body.appendChild(this.video)
            this.video.play()
            this.setLocation(xPosition, yPosition)
            this.isShowing = true
        }
    }

    /**
     * Sets the location of the video in raster space.
     * @param {Number} xPosition x-coordinate of the video in raster space
     * @param {Number} yPosition y-coordinate of the video in raster space
     */
    setLocation(xPosition, yPosition)
    {
        let style = window.getComputedStyle(this.video)
        let videoWidth = MISC.pxStringToNumber(style.getPropertyValue('width'))
        let videoHeight = MISC.pxStringToNumber(style.getPropertyValue('height'))
        let xBound = xPosition + videoWidth
        let yBound = yPosition + videoHeight
        if (xBound > window.innerWidth)
            xPosition -= videoWidth
        if (yBound > window.innerHeight)
            yPosition -= videoHeight
        let aspect = window.innerWidth/window.innerHeight
        if (aspect < 1)
            this.video.style = 'position: absolute; top : '+yPosition+'; left: '+xPosition+'; width: 20%; height: auto; min-width: 200px; max-width: 400px;'
        else
            this.video.style = 'position: absolute; top : '+yPosition+'; left: '+xPosition+'; width: 20%; height: auto; min-width: 100px; max-width: 400px;'
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