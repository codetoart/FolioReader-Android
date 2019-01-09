//
//  bridge.js
//  FolioReader-Android
//
//  Created by Heberti Almeida on 06/05/15.
//  Copyright (c) 2015 Folio Reader. All rights reserved.
//

var thisHighlight;
var audioMarkClass;
var wordsPerMinute = 180;

var Direction = Object.freeze({
    VERTICAL: "VERTICAL",
    HORIZONTAL: "HORIZONTAL"
});

var DisplayUnit = Object.freeze({
    PX: "PX",
    DP: "DP",
    CSS_PX: "CSS_PX"
});

var viewportRect;

// Menu colors
function setHighlightStyle(style) {
    Highlight.getUpdatedHighlightId(thisHighlight.id, style);
}

function removeThisHighlight() {
    return thisHighlight.id;
}

function removeHighlightById(elmId) {
    var elm = document.getElementById(elmId);
    elm.outerHTML = elm.innerHTML;
    return elm.id;
}

function getHighlightContent() {
    return thisHighlight.textContent
}

// Reading time
function getReadingTime() {
    var text = document.body.innerText;
    var totalWords = text.trim().split(/\s+/g).length;
    var wordsPerSecond = wordsPerMinute / 60; //define words per second based on words per minute
    var totalReadingTimeSeconds = totalWords / wordsPerSecond; //define total reading time in seconds
    var readingTimeMinutes = Math.round(totalReadingTimeSeconds / 60);

    return readingTimeMinutes;
}

/**
 Remove All Classes - removes the given class from all elements in the DOM
 */
function removeAllClasses(className) {
    var els = document.body.getElementsByClassName(className)
    if (els.length > 0)
        for (i = 0; i <= els.length; i++) {
            els[i].classList.remove(className);
        }
}

/**
 Audio Mark ID - marks an element with an ID with the given class and scrolls to it
 */
function audioMarkID(className, id) {
    if (audioMarkClass)
        removeAllClasses(audioMarkClass);

    audioMarkClass = className
    var el = document.getElementById(id);

    scrollToNodeOrRange(el);
    el.classList.add(className)
}

function setMediaOverlayStyle(style) {
    document.documentElement.classList.remove("mediaOverlayStyle0", "mediaOverlayStyle1", "mediaOverlayStyle2")
    document.documentElement.classList.add(style)
}

function setMediaOverlayStyleColors(color, colorHighlight) {
    var stylesheet = document.styleSheets[document.styleSheets.length - 1];
//    stylesheet.insertRule(".mediaOverlayStyle0 span.epub-media-overlay-playing { background: "+colorHighlight+" !important }")
//    stylesheet.insertRule(".mediaOverlayStyle1 span.epub-media-overlay-playing { border-color: "+color+" !important }")
//    stylesheet.insertRule(".mediaOverlayStyle2 span.epub-media-overlay-playing { color: "+color+" !important }")
}

var currentIndex = -1;


function findSentenceWithIDInView(els) {
    // @NOTE: is `span` too limiting?
    for (indx in els) {
        var element = els[indx];

        // Horizontal scroll
        if (document.body.scrollTop == 0) {
            var elLeft = document.body.clientWidth * Math.floor(element.offsetTop / window.innerHeight);
            // document.body.scrollLeft = elLeft;

            if (elLeft == document.body.scrollLeft) {
                currentIndex = indx;
                return element;
            }

            // Vertical
        } else if (element.offsetTop > document.body.scrollTop) {
            currentIndex = indx;
            return element;
        }
    }

    return null
}

function findNextSentenceInArray(els) {
    if (currentIndex >= 0) {
        currentIndex++;
        return els[currentIndex];
    }

    return null
}

function resetCurrentSentenceIndex() {
    currentIndex = -1;
}

function rewindCurrentIndex() {
    currentIndex = currentIndex - 1;
}

function getSentenceWithIndex(className) {
    var sentence;
    var sel = getSelection();
    var node = null;
    var elements = document.querySelectorAll("span.sentence");

    // Check for a selected text, if found start reading from it
    if (sel.toString() != "") {
        console.log(sel.anchorNode.parentNode);
        node = sel.anchorNode.parentNode;

        if (node.className == "sentence") {
            sentence = node;

            for (var i = 0, len = elements.length; i < len; i++) {
                if (elements[i] === sentence) {
                    currentIndex = i;
                    break;
                }
            }
        } else {
            sentence = findSentenceWithIDInView(elements);
        }
    } else if (currentIndex < 0) {
        sentence = findSentenceWithIDInView(elements);
    } else {
        sentence = findNextSentenceInArray(elements);
    }

    var text = sentence.innerText || sentence.textContent;

    scrollToNodeOrRange(sentence);

    if (audioMarkClass) {
        removeAllClasses(audioMarkClass);
    }

    audioMarkClass = className;
    sentence.classList.add(className);
    return text;
}

function goToHighlight(highlightId) {
    var element = document.getElementById(highlightId.toString());
    if (element)
        scrollToNodeOrRange(element);

    LoadingView.hide();
}

function goToAnchor(anchorId) {
    var element = document.getElementById(anchorId);
    if (element)
        scrollToNodeOrRange(element);

    LoadingView.hide();
}

function scrollToLast() {
    console.log("-> scrollToLast");

    var direction = FolioWebView.getDirection();
    var scrollingElement = bodyOrHtml();

    switch (direction) {
        case Direction.VERTICAL:
            scrollingElement.scrollTop =
                scrollingElement.scrollHeight - document.documentElement.clientHeight;
            break;
        case Direction.HORIZONTAL:
            scrollingElement.scrollLeft =
                scrollingElement.scrollWidth - document.documentElement.clientWidth;
            WebViewPager.setPageToLast();
            break;
    }

    LoadingView.hide();
}

function scrollToFirst() {
    console.log("-> scrollToFirst");

    var direction = FolioWebView.getDirection();
    var scrollingElement = bodyOrHtml();

    switch (direction) {
        case Direction.VERTICAL:
            scrollingElement.scrollTop = 0;
            break;
        case Direction.HORIZONTAL:
            scrollingElement.scrollLeft = 0;
            WebViewPager.setPageToFirst();
            break;
    }

    LoadingView.hide();
}

function checkCompatMode() {
    if (document.compatMode === "BackCompat") {
        console.error("-> Web page loaded in Quirks mode. Please report to developer " +
            "for debugging with current EPUB file, as many features might stop working " +
            "(ex. Horizontal scroll feature).")
    }
}

// TODO -> Check if this is required?
function bodyOrHtml() {
    if ('scrollingElement' in document) {
        return document.scrollingElement;
    }
    // Fallback for legacy browsers
    if (navigator.userAgent.indexOf('WebKit') != -1) {
        return document.body;
    }
    return document.documentElement;
}

/**
 * @param {(Element|Text|Range)} nodeOrRange
 * @returns {(Element|Text|Range)} nodeOrRange
 */
function scrollToNodeOrRange(nodeOrRange) {

    var scrollingElement = bodyOrHtml();
    var direction = FolioWebView.getDirection();

    // For Direction.VERTICAL
    var nodeOffsetTop, nodeOffsetHeight;

    // For Direction.HORIZONTAL
    var nodeOffsetLeft;

    if (nodeOrRange instanceof Range || nodeOrRange.nodeType === Node.TEXT_NODE) {

        var rect;
        if (nodeOrRange.nodeType && nodeOrRange.nodeType === Node.TEXT_NODE) {
            var range = document.createRange();
            range.selectNode(nodeOrRange);
            rect = RangeFix.getBoundingClientRect(range);
        } else {
            rect = RangeFix.getBoundingClientRect(nodeOrRange);
        }
        nodeOffsetTop = scrollingElement.scrollTop + rect.top;
        nodeOffsetHeight = rect.height;
        nodeOffsetLeft = scrollingElement.scrollLeft + rect.left;

    } else if (nodeOrRange.nodeType === Node.ELEMENT_NODE) {

        nodeOffsetTop = nodeOrRange.offsetTop;
        nodeOffsetHeight = nodeOrRange.offsetHeight;
        nodeOffsetLeft = nodeOrRange.offsetLeft;

    } else {
        throw("-> Illegal Argument Exception, nodeOrRange -> " + nodeOrRange);
    }

    switch (direction) {

        case Direction.VERTICAL:
            var topDistraction = FolioWebView.getTopDistraction(DisplayUnit.DP);
            var pageTop = scrollingElement.scrollTop + topDistraction;
            var pageBottom = scrollingElement.scrollTop + document.documentElement.clientHeight
                - FolioWebView.getBottomDistraction(DisplayUnit.DP);

            var elementTop = nodeOffsetTop - 20;
            elementTop = elementTop < 0 ? 0 : elementTop;
            var elementBottom = nodeOffsetTop + nodeOffsetHeight + 20;
            var needToScroll = (elementTop < pageTop || elementBottom > pageBottom);

            //console.log("-> topDistraction = " + topDistraction);
            //console.log("-> pageTop = " + pageTop);
            //console.log("-> elementTop = " + elementTop);
            //console.log("-> pageBottom = " + pageBottom);
            //console.log("-> elementBottom = " + elementBottom);

            if (needToScroll) {
                var newScrollTop = elementTop - topDistraction;
                newScrollTop = newScrollTop < 0 ? 0 : newScrollTop;
                //console.log("-> Scrolled to = " + newScrollTop);
                scrollingElement.scrollTop = newScrollTop;
            }
            break;

        case Direction.HORIZONTAL:
            var clientWidth = document.documentElement.clientWidth;
            var pageIndex = Math.floor(nodeOffsetLeft / clientWidth);
            var newScrollLeft = clientWidth * pageIndex;
            //console.log("-> newScrollLeft = " + newScrollLeft);
            scrollingElement.scrollLeft = newScrollLeft;
            WebViewPager.setCurrentPage(pageIndex);
            break;
    }

    return nodeOrRange;
}

function highlightSearchLocator(rangeCfi) {

    try {
        var $obj = EPUBcfi.Interpreter.getRangeTargetElements(rangeCfi, document);

        var range = document.createRange();
        range.setStart($obj.startElement, $obj.startOffset);
        range.setEnd($obj.endElement, $obj.endOffset);

        window.getSelection().removeAllRanges();
        window.getSelection().addRange(range);
        scrollToNodeOrRange(range);
    } catch (e) {
        console.error("-> " + e);
    }

    LoadingView.hide();
}

/**
 * Returns JSON of selection rect
 * @param {(Element|undefined)} [element]
 * @returns {Object} JSON of {@link DOMRect}
 */
function getSelectionRect(element) {
    console.log("-> getSelectionRect");

    var range;
    if (element !== undefined) {
        range = document.createRange();
        range.selectNodeContents(element);
    } else {
        range = window.getSelection().getRangeAt(0);
    }

    //var rect = range.getBoundingClientRect();
    var rect = RangeFix.getBoundingClientRect(range);
    return {
        left: rect.left,
        top: rect.top,
        right: rect.right,
        bottom: rect.bottom
    };
}

function clearSelection() {
    console.log("-> clearSelection");
    window.getSelection().removeAllRanges();
}

// onClick method set for highlights
function onClickHighlight(element) {
    console.log("-> onClickHighlight");
    event.stopPropagation();
    thisHighlight = element;
    var rectJson = getSelectionRect(element);
    FolioWebView.setSelectionRect(rectJson.left, rectJson.top, rectJson.right, rectJson.bottom);
}

function deleteThisHighlight() {
    if (thisHighlight !== undefined)
        FolioWebView.deleteThisHighlight(thisHighlight.id);
}

function onTextSelectionItemClicked(id) {
    var selectionType = window.getSelection().type;
    var selectedText = "";
    if (selectionType === "Range") {
        selectedText = window.getSelection().toString();
    } else {
        selectedText = thisHighlight.textContent;
    }
    FolioWebView.onTextSelectionItemClicked(id, selectedText);
}

function onClickHtml() {
    console.debug("-> onClickHtml");
    if (FolioWebView.isPopupShowing()) {
        FolioWebView.dismissPopupWindow();
    } else {
        FolioWebView.toggleSystemUI();
    }
}

function computeLastReadCfi() {

    viewportRect = constructDOMRect(FolioWebView.getViewportRect(DisplayUnit.CSS_PX));
    var node = getFirstVisibleNode(document.body) || document.body;

    var cfi;
    if (node.nodeType === Node.TEXT_NODE) {
        cfi = EPUBcfi.Generator.generateCharacterOffsetCFIComponent(node, 0);
    } else {
        cfi = EPUBcfi.Generator.generateElementCFIComponent(node);
    }

    cfi = EPUBcfi.Generator.generateCompleteCFI("/0!", cfi);
    viewportRect = null;
    FolioPageFragment.storeLastReadCfi(cfi);
}

/**
 * Gets the first partially or completely visible node in viewportRect
 * @param {Node} node Accepts {@link Element} or {@link Text}
 * @returns {(Node|null)} Returns {@link Element} or {@link Text} or null
 */
function getFirstVisibleNode(node) {

    var range = document.createRange();
    range.selectNode(node);
    var rect = RangeFix.getBoundingClientRect(range);
    if (rect == null)
        return null;

    var intersects = rectIntersects(viewportRect, rect);
    var contains = rectContains(viewportRect, rect);

    if (contains) {
        // node's rect is completely inside viewportRect.
        return node;

    } else if (intersects) {

        var childNodes = node.childNodes;
        for (var i = 0; i < childNodes.length; i++) {

            // EPUB CFI ignores nodes other than ELEMENT_NODE and TEXT_NODE
            // http://www.idpf.org/epub/linking/cfi/epub-cfi.html#sec-path-child-ref

            if (childNodes[i].nodeType === Node.ELEMENT_NODE || childNodes[i].nodeType === Node.TEXT_NODE) {
                var childNode = getFirstVisibleNode(childNodes[i]);
                if (childNode) {
                    return childNode;
                }
            }
        }

        // No children found or no child's rect completely inside viewportRect,
        // so returning this node as it's rect intersected with viewportRect.
        return node;
    }
    return null;
}

function scrollToCfi(cfi) {

    try {
        var $node = EPUBcfi.Interpreter.getTargetElement(cfi, document);
        scrollToNodeOrRange($node[0]);
    } catch (e) {
        console.error("-> " + e);
    }
    LoadingView.hide();
}
