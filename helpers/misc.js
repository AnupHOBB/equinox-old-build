import { Color } from 'three'

export const MISC = 
{
    /**
     * Converts rgb value as string to threejs color object
     * @param {String} str rgb value as string 
     * @returns {THREE.Color} rgb value as threejs color
     */
    toColor : function(str)
    {
        let match = str.match(/rgba?\((\d{1,3}), ?(\d{1,3}), ?(\d{1,3})\)?(?:, ?(\d(?:\.\d?))\))?/)
        return match ? new Color(match[1]/255, match[2]/255, match[3]/255) : new Color()
    },

    /**
     * Converts hexadecimal color value as string to color object
     * @param {String} hex hexadecimal color value as string
     * @returns {THREE.Color} rgb value as threejs color
     */
    hexToColor : function(hex) 
    {
        var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
        return result ? new Color(parseInt(result[1], 16)/255, parseInt(result[2], 16)/255, parseInt(result[3], 16)/255) : new Color()
    }
}