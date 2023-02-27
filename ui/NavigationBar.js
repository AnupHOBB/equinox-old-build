/**
 * Represents a bottom navigation item.
 */
export class NavigationBarItem
{
    /**
     * @param {HTMLElement} containerElement container of the navigation bar button as html element
     * @param {HTMLImageElement} imageElement icon of the navigation bar button as html element
     */
    constructor(containerElement, imageElement)
    {
        this.containerElement = containerElement
        this.imageElement = imageElement
        this.valuesMap = new Map()
        this.onSelect = ()=>{}
        this.onUnselect = ()=>{}
    }

    /**
     * Sets the image icon of the navvigation bar button
     * @param {String} url url of the image icon 
     */
    setImage(url) { this.imageElement.src = url }

    /**
     * Sets the class name for the container element of the navigation bar button
     * @param {String} className css class name
     */
    setContainerClass(className) { this.containerElement.className = className }

    /**
     * Stores any user defined value in the value map.
     * @param {String} name name of the value
     * @param {any} value the value itself
     */
    setCustomValue(name, value) { this.valuesMap.set(name, value) }

    /**
     * Retrieves the user defined value by name
     * @param {String} name name of the value
     */
    getCustomValue(name) { return this.valuesMap.get(name) }

    /**
     * Sets the callback that is called by NavigationBarManagerCore when this navigation bar button is selected.
     * @param {Function} onSelect callback that is called by NavigationBarManagerCore
     */
    setOnSelect(onSelect) { this.onSelect = onSelect }

    /**
     * Sets the callback that is called by NavigationBarManagerCore when this navigation bar button is unselected.
     * @param {Function} onUnselect callback that is called by NavigationBarManagerCore
     */
    setOnUnselect(onUnselect) { this.onUnselect = onUnselect }
}

/**
 * Wrapper class of NavigationBarManagerCore
 */
export class NavigationBarManager
{
    constructor() { this.core = new NavigationBarManagerCore() }

    /**
     * Delegates call to NavigationBarManagerCore addItem
     * @param {NavigationBarItem} item navigation bar item
     */
    addItem(item) { this.core.addItem(item) }
}

/**
 * Manages the  navigation bar.
 */
class NavigationBarManagerCore
{
    constructor() { this.navBarItems = [] }

    /**
     * Adds the navigation bar item in navBarItems array and overrides the onclick event
     * of the navigation bar item's container element to call NavigationBarManagerCore's onClick
     * function.
     * @param {NavigationBarItem} navBarItem navigation bar item
     */
    addItem(navBarItem) 
    { 
        let index = this.navBarItems.length
        navBarItem.containerElement.onclick = ()=>{ this.onClick(index) }
        this.navBarItems.push(navBarItem) 
    }

    /**
     * Callback that is called when user selects any of the added navigation bar items.
     * @param {Number} index index of navigation bar item in navBarItems array
     */
    onClick(index)
    {
        for (let i=0; i<this.navBarItems.length; i++)
        {
            if (i != index)
                this.navBarItems[i].onUnselect(this.navBarItems[i])
        }
        this.navBarItems[index].onSelect(this.navBarItems[index])
    }
}