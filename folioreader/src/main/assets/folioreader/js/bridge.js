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

// Class manipulation
function hasClass(ele, cls) {
    return !!ele.className.match(new RegExp('(\\s|^)' + cls + '(\\s|$)'));
}

function addClass(ele, cls) {
    if (!hasClass(ele, cls)) ele.className += " " + cls;
}

function removeClass(ele, cls) {
    if (hasClass(ele, cls)) {
        var reg = new RegExp('(\\s|^)' + cls + '(\\s|$)');
        ele.className = ele.className.replace(reg, ' ');
    }
}

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

function getBodyText() {
    return document.body.innerText;
}

// Method that gets the Rect of current selected text
// and returns in a JSON format
var getRectForSelectedText = function (elm) {
    if (typeof elm === "undefined") elm = window.getSelection().getRangeAt(0);

    var rect = elm.getBoundingClientRect();
    return "{{" + rect.left + "," + rect.top + "}, {" + rect.width + "," + rect.height + "}}";
};

// Reading time
function getReadingTime() {
    var text = document.body.innerText;
    var totalWords = text.trim().split(/\s+/g).length;
    var wordsPerSecond = wordsPerMinute / 60; //define words per second based on words per minute
    var totalReadingTimeSeconds = totalWords / wordsPerSecond; //define total reading time in seconds
    var readingTimeMinutes = Math.round(totalReadingTimeSeconds / 60);

    return readingTimeMinutes;
}

function scrollAnchor(id) {
    window.location.hash = id;
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

$(function () {
    window.ssReader = Class({
        $singleton: true,

        init: function () {
            rangy.init();

            this.highlighter = rangy.createHighlighter();

            this.highlighter.addClassApplier(rangy.createClassApplier("highlight_yellow", {
                ignoreWhiteSpace: true,
                tagNames: ["span", "a"]
            }));

            this.highlighter.addClassApplier(rangy.createClassApplier("highlight_green", {
                ignoreWhiteSpace: true,
                tagNames: ["span", "a"]
            }));

            this.highlighter.addClassApplier(rangy.createClassApplier("highlight_blue", {
                ignoreWhiteSpace: true,
                tagNames: ["span", "a"]
            }));

            this.highlighter.addClassApplier(rangy.createClassApplier("highlight_pink", {
                ignoreWhiteSpace: true,
                tagNames: ["span", "a"]
            }));

            this.highlighter.addClassApplier(rangy.createClassApplier("highlight_underline", {
                ignoreWhiteSpace: true,
                tagNames: ["span", "a"]
            }));

        },

        setFontAndada: function () {
            this.setFont("andada");
        },

        setFontLato: function () {
            this.setFont("lato");
        },

        setFontPtSerif: function () {
            this.setFont("pt-serif");
        },

        setFontPtSans: function () {
            this.setFont("pt-sans");
        },

        base64encode: function (str) {
            return btoa(unescape(encodeURIComponent(str)));
        },

        base64decode: function (str) {
            return decodeURIComponent(escape(atob(str)));
        },

        clearSelection: function () {
            if (window.getSelection) {
                if (window.getSelection().empty) {  // Chrome
                    window.getSelection().empty();
                } else if (window.getSelection().removeAllRanges) {  // Firefox
                    window.getSelection().removeAllRanges();
                }
            } else if (document.selection) {  // IE?
                document.selection.empty();
            }
        },

        // Public methods

        setFont: function (fontName) {
            $("#ss-wrapper-font").removeClass().addClass("ss-wrapper-" + fontName);
        },

        setSize: function (size) {
            $("#ss-wrapper-size").removeClass().addClass("ss-wrapper-" + size);
        },

        setTheme: function (theme) {
            $("body, #ss-wrapper-theme").removeClass().addClass("ss-wrapper-" + theme);
        },

        setComment: function (comment, inputId) {
            $("#" + inputId).val(ssReader.base64decode(comment));
            $("#" + inputId).trigger("input", ["true"]);
        },

        highlightSelection: function (color) {
            try {

                this.highlighter.highlightSelection(color, null);
                var range = window.getSelection().toString();
                var params = {content: range, rangy: this.getHighlights(), color: color};
                this.clearSelection();
                Highlight.onReceiveHighlights(JSON.stringify(params));
            } catch (err) {
                console.log("highlightSelection : " + err);
            }
        },

        unHighlightSelection: function () {
            try {
                this.highlighter.unhighlightSelection();
                Highlight.onReceiveHighlights(this.getHighlights());
            } catch (err) {
            }
        },

        getHighlights: function () {
            try {
                return this.highlighter.serialize();
            } catch (err) {
            }
        },

        setHighlights: function (serializedHighlight) {
            try {
                this.highlighter.removeAllHighlights();
                this.highlighter.deserialize(serializedHighlight);
            } catch (err) {
            }
        },

        removeAll: function () {
            try {
                this.highlighter.removeAllHighlights();
            } catch (err) {
            }
        },

        copy: function () {
            SSBridge.onCopy(window.getSelection().toString());
            this.clearSelection();
        },

        share: function () {
            SSBridge.onShare(window.getSelection().toString());
            this.clearSelection();
        },

        search: function () {
            SSBridge.onSearch(window.getSelection().toString());
            this.clearSelection();
        }
    });

    if (typeof ssReader !== "undefined") {
        ssReader.init();
    }

    $(".verse").click(function () {
        SSBridge.onVerseClick(ssReader.base64encode($(this).attr("verse")));
    });

    $("code").each(function (i) {
        var textarea = $("<textarea class='textarea'/>").attr("id", "input-" + i).on("input propertychange", function (event, isInit) {
            $(this).css({'height': 'auto', 'overflow-y': 'hidden'}).height(this.scrollHeight);
            $(this).next().css({'height': 'auto', 'overflow-y': 'hidden'}).height(this.scrollHeight);

            if (!isInit) {
                var that = this;
                if (timeout !== null) {
                    clearTimeout(timeout);
                }
                timeout = setTimeout(function () {
                    SSBridge.onCommentsClick(
                        ssReader.base64encode($(that).val()),
                        $(that).attr("id")
                    );
                }, 1000);
            }
        });
        var border = $("<div class='textarea-border' />");
        var container = $("<div class='textarea-container' />");

        $(textarea).appendTo(container);
        $(border).appendTo(container);

        $(this).after(container);
    });
});

function array_diff(array1, array2) {
    var difference = $.grep(array1, function (el) {
        return $.inArray(el, array2) < 0
    });
    return difference.concat($.grep(array2, function (el) {
        return $.inArray(el, array1) < 0
    }));
    ;
}

//For testing purpose only
function sleep(seconds) {
    var e = new Date().getTime() + (seconds * 1000);
    while (new Date().getTime() <= e) {
    }
}

// Mock objects for testing purpose
/*var FolioPageFragment = {

    setHorizontalPageCount : function(pageCount) {
        console.warn("-> Mock call to FolioPageFragment.setHorizontalPageCount(" + pageCount + ")");
    },

    storeFirstVisibleSpan : function(usingId, value) {
        console.warn("-> Mock call to FolioPageFragment.storeFirstVisibleSpan(" + usingId + ", " + value + ")");
    },

    getDirection : function() {
        //var direction = Direction.VERTICAL;
        var direction = Direction.HORIZONTAL;
        console.warn("-> Mock call to FolioPageFragment.getDirection(), return " + direction);
        return direction;
    },

    getTopDistraction : function() {
        console.warn("-> Mock call to FolioPageFragment.getTopDistraction(), return " + 0);
        return 0;
    },

    getBottomDistraction : function() {
        console.warn("-> Mock call to FolioPageFragment.getBottomDistraction(), return " + 0);
        return 0;
    }
};

var FolioWebView = {

    setCompatMode : function(compatMode) {
        console.warn("-> Mock call to FolioWebView.setCompatMode(" + compatMode + ")");
    }
};

var WebViewPager = {

    setCurrentPage : function(pageIndex) {
        console.warn("-> Mock call to WebViewPager.setCurrentPage(" + pageIndex + ")");
    },

    setPageToLast : function() {
        console.warn("-> Mock call to WebViewPager.setPageToLast()");
    },

    setPageToFirst : function() {
        console.warn("-> Mock call to WebViewPager.setPageToFirst()");
    }
};

var LoadingView = {

    show : function() {
        console.warn("-> Mock call to LoadingView.show()");
    },

    hide : function() {
        console.warn("-> Mock call to LoadingView.hide()");
    },

    visible : function() {
        console.warn("-> Mock call to LoadingView.visible()");
    },

    invisible : function() {
        console.warn("-> Mock call to LoadingView.invisible()");
    }
};*/

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
 * @param {Element} [element]
 * @returns {object} JSON of {@link DOMRect}
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
    if (selectionType == "Range") {
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

function constructDOMRect(rectJsonString) {
    var rectJson = JSON.parse(rectJsonString);
    return new DOMRect(rectJson.x, rectJson.y, rectJson.width, rectJson.height);
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
