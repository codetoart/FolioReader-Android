var horizontalInterval;
var horizontalIntervalPeriod = 1000;
var horizontalIntervalCounter = 0;
var horizontalIntervalLimit = 3000;

function horizontalRecheck() {

    horizontalIntervalCounter += horizontalIntervalPeriod;

    if (window.scrollWidth !== document.documentElement.scrollWidth) {
        // Rare condition
        // This might happen when document.documentElement.scrollWidth gives incorrect value
        // when the webview is busy re-drawing contents.
        //console.log("-> horizontalIntervalCounter = " + horizontalIntervalCounter);
        console.warn("-> scrollWidth changed from " + window.scrollWidth + " to " +
            document.documentElement.scrollWidth);
        postInitHorizontalDirection();
    }

    if (horizontalIntervalCounter >= horizontalIntervalLimit)
        clearInterval(horizontalInterval);
}

function initHorizontalDirection() {

    preInitHorizontalDirection();
    postInitHorizontalDirection();

    horizontalInterval = setInterval(horizontalRecheck, horizontalIntervalPeriod);
}

function preInitHorizontalDirection() {

    //console.log(window);
    //console.log("-> " + document.getElementsByTagName('title')[0].innerText);
    var htmlElement = document.getElementsByTagName('html')[0];
    var bodyElement = document.getElementsByTagName('body')[0];

    // Required when initHorizontalDirection() is called multiple times.
    // Currently it is called only once per page.
    htmlElement.style.width = null;
    bodyElement.style.width = null;
    htmlElement.style.height = null;
    bodyElement.style.height = null;

    var bodyStyle = bodyElement.currentStyle || window.getComputedStyle(bodyElement);
    var paddingTop = parseInt(bodyStyle.paddingTop, 10);
    var paddingRight = parseInt(bodyStyle.paddingRight, 10);
    var paddingBottom = parseInt(bodyStyle.paddingBottom, 10);
    var paddingLeft = parseInt(bodyStyle.paddingLeft, 10);
    //console.log("-> padding = " + paddingTop + ", " + paddingRight + ", " + paddingBottom + ", " + paddingLeft);

    //document.documentElement.clientWidth is window.innerWidth excluding x scrollbar width
    var pageWidth = document.documentElement.clientWidth - (paddingLeft + paddingRight);
    //document.documentElement.clientHeight is window.innerHeight excluding y scrollbar height
    var pageHeight = document.documentElement.clientHeight - (paddingTop + paddingBottom);

    bodyElement.style.columnGap = (paddingLeft + paddingRight) + 'px';
    bodyElement.style.columnWidth = pageWidth + 'px';
    bodyElement.style.columnFill = 'auto';

    //console.log("-> window.innerWidth = " + window.innerWidth);
    //console.log("-> window.innerHeight = " + window.innerHeight);
    //console.log("-> clientWidth = " + document.documentElement.clientWidth);
    //console.log("-> clientHeight = " + document.documentElement.clientHeight);
    //console.log("-> bodyElement.offsetWidth = " + bodyElement.offsetWidth);
    //console.log("-> bodyElement.offsetHeight = " + bodyElement.offsetHeight);
    //console.log("-> pageWidth = " + pageWidth);
    //console.log("-> pageHeight = " + pageHeight);

    htmlElement.style.height = (pageHeight + (paddingTop + paddingBottom)) + 'px';
    bodyElement.style.height = pageHeight + 'px';
}

function postInitHorizontalDirection() {

    var htmlElement = document.getElementsByTagName('html')[0];
    var bodyElement = document.getElementsByTagName('body')[0];
    var bodyStyle = bodyElement.currentStyle || window.getComputedStyle(bodyElement);
    var paddingTop = parseInt(bodyStyle.paddingTop, 10);
    var paddingRight = parseInt(bodyStyle.paddingRight, 10);
    var paddingBottom = parseInt(bodyStyle.paddingBottom, 10);
    var paddingLeft = parseInt(bodyStyle.paddingLeft, 10);
    var clientWidth = document.documentElement.clientWidth;

    var scrollWidth = document.documentElement.scrollWidth;
    //console.log("-> document.documentElement.offsetWidth = " + document.documentElement.offsetWidth);
    if (scrollWidth > clientWidth
        && scrollWidth > document.documentElement.offsetWidth) {
        scrollWidth += paddingRight;
    }
    var newBodyWidth = scrollWidth - (paddingLeft + paddingRight);
    window.scrollWidth = scrollWidth;

    htmlElement.style.width = scrollWidth + 'px';
    bodyElement.style.width = newBodyWidth + 'px';

    // pageCount deliberately rounded instead of ceiling to avoid any unexpected error
    var pageCount = Math.round(scrollWidth / clientWidth);
    var pageCountFloat = scrollWidth / clientWidth;

    if (pageCount !== pageCountFloat) {
        console.warn("-> pageCount = " + pageCount + ", pageCountFloat = " + pageCountFloat
            + ", Something wrong in pageCount calculation");
    }

    //console.log("-> scrollWidth = " + scrollWidth);
    //console.log("-> newBodyWidth = " + newBodyWidth);
    //console.log("-> pageCount = " + pageCount);

    FolioPageFragment.setHorizontalPageCount(pageCount);
}