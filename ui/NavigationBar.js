/**
 * Represents a bottom navigation item.
 */
export class NavigationBarItem
{
    /**
     * @param {HTMLElement} containerElement container of the navigation bar button as html element
     * @param {HTMLImageElement} imageElement icon of the navigation bar button as html element
     * @param {any} data object that contains image url and class name that will be used whenever the nav bar item is selected or unselected
     */
    constructor(containerElement, imageElement, data)
    {
        this.containerElement = containerElement
        this.imageElement = imageElement
        this.valuesMap = new Map()
        this.data = data
        this.onSelectCallback = ()=>{}
        this.onUnselectCallback = ()=>{}
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
     * @param {Function} onSelectCallback callback that is called by NavigationBarManagerCore
     */
    setOnSelect(onSelectCallback) { this.onSelectCallback = onSelectCallback }

    /**
     * Sets the callback that is called by NavigationBarManagerCore when this navigation bar button is unselected.
     * @param {Function} onUnselectCallback callback that is called by NavigationBarManagerCore
     */
    setOnUnselect(onUnselectCallback) { this.onUnselectCallback = onUnselectCallback }

    /**
     * Called by NavigationBarManagerCore when this navigation bar item is selected
     * @param {NavigationBarItem} navBarItem this nav bar item object
     */
    onSelect(navBarItem)
    {
        this.setImage(this.data.selectImage)
        this.setContainerClass(this.data.selectClass)
        this.onSelectCallback(navBarItem)
    }

    /**
     * Called by NavigationBarManagerCore when this navigation bar item is unselected
     * @param {NavigationBarItem} navBarItem this nav bar item object
     */
    onUnselect(navBarItem)
    {
        this.setImage(this.data.unselectImage)
        this.setContainerClass(this.data.unselectClass)
        this.onUnselectCallback(navBarItem)
    }
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
            if (i != index)
                this.navBarItems[i].onUnselect(this.navBarItems[i])
        this.navBarItems[index].onSelect(this.navBarItems[index])
    }
}