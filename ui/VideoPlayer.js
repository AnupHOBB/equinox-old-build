/**
 * Responsible for managing video player
 */
export class VideoPlayer
{
    /**
     * @param {HTMLElement} videoContainerElement element that holds the videoElement tag
     * @param {HTMLVideoElement} videoElement element that displays the video
     * @param {HTMLVideoElement} crossIconElement element that displays the cross icon
     */
    constructor(videoContainerElement, videoElement, crossIconElement)
    {
        this.videoContainerElement = videoContainerElement
        this.videoElement = videoElement
        this.crossIcon = crossIconElement
        this.crossIcon.onclick = (e) => this.show(false)
        this.isVisible = true
    }

    /**
     * Shows or hides slider video player
     */
    show(show)
    {
        if (show && !this.isVisible)
        {
            document.body.append(this.videoContainerElement)
            this.videoElement.play() 
            this.isVisible = true
        }
        else if (!show && this.isVisible)
        {
            document.body.removeChild(this.videoContainerElement)
            this.isVisible = false
        }
    }

    /**
     * Returns video container's visibility
     * @returns {Boolean} value that indicates video container's visibility
     */
    isShowing() { return this.isVisible }
}