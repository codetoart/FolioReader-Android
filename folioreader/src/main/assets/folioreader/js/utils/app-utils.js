function appendPx(dim) {
    return dim + "px";
}

/**
 * Returns true iff the two specified rectangles intersect. In no event are
 * either of the rectangles modified.
 *
 * @param {DOMRect} a The first rectangle being tested for intersection
 * @param {DOMRect} b The second rectangle being tested for intersection
 * @returns {boolean} returns true iff the two specified rectangles intersect.
 */
function rectIntersects(a, b) {
    return a.left < b.right && b.left < a.right && a.top < b.bottom && b.top < a.bottom;
}

/**
 * Returns true iff the specified rectangle b is inside or equal to
 * rectangle b. An empty rectangle never contains another rectangle.
 *
 * @param {DOMRect} a The rectangle being tested whether rectangle b is inside this or not.
 * @param {DOMRect} b The rectangle being tested for containment.
 * @returns {boolean} returns true iff the specified rectangle r is inside or equal to this rectangle
 */
function rectContains(a, b) {
    // check for empty first
    return a.left < a.right && a.top < a.bottom
        // now check for containment
        && a.left <= b.left && a.top <= b.top && a.right >= b.right && a.bottom >= b.bottom;
}

/**
 * @param {MouseEvent} event
 * @param {Element} element
 * @return {boolean}
 */
function isClickInsideElement(event, element) {

    var rect = element.getBoundingClientRect();
    return isPointInRect(event.clientX, event.clientY, rect);
}

/**
 * Return true if x, y coordinates inside rect bounds.
 * @param {number} x
 * @param {number} y
 * @param {(ClientRect|DOMRect)} rect
 */
function isPointInRect(x, y, rect) {
    return x >= rect.left && x <= rect.right && y >= rect.top && y <= rect.bottom;
}

//For testing purpose only
function sleep(seconds) {
    var e = new Date().getTime() + (seconds * 1000);
    while (new Date().getTime() <= e) {
    }
}

/**
 * Constructs DOMRect object from json string representation of DOMRect
 * @param {string} rectJsonString
 * @return {DOMRect}
 */
function constructDOMRect(rectJsonString) {
    var rectJson = JSON.parse(rectJsonString);
    return new DOMRect(rectJson.x, rectJson.y, rectJson.width, rectJson.height);
}