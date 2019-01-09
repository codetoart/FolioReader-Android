// Mock implementation of @JavascriptInterface methods from Android code

var FolioPageFragment = {

    setHorizontalPageCount: function (pageCount) {
        console.warn("-> Mock call to FolioPageFragment.setHorizontalPageCount(" + pageCount + ")");
    },

    getDirection: function () {
        //var direction = Direction.VERTICAL;
        var direction = Direction.HORIZONTAL;
        console.warn("-> Mock call to FolioPageFragment.getDirection(), returning " + direction);
        return direction;
    },

    getTopDistraction: function () {
        console.warn("-> Mock call to FolioPageFragment.getTopDistraction(), returning " + 0);
        return 0;
    },

    getBottomDistraction: function () {
        console.warn("-> Mock call to FolioPageFragment.getBottomDistraction(), returning " + 0);
        return 0;
    },

    storeLastReadCfi: function (cfi) {
        console.warn("-> Mock call to FolioPageFragment.storeLastReadCfi(), cfi = " + cfi);
    }
};

var FolioWebView = {

    isPopupShowing: function () {
        var popupShowing = false;
        console.warn("-> Mock call to FolioWebView.isPopupShowing(), returning " + popupShowing);
        return popupShowing;
    },

    dismissPopupWindow: function () {
        console.warn("-> Mock call to FolioWebView.dismissPopupWindow()");
    },

    toggleSystemUI: function () {
        console.warn("-> Mock call to FolioWebView.toggleSystemUI()");
    },

    setSelectionRect: function (left, top, right, bottom) {
        console.warn("-> Mock call to FolioWebView.setSelectionRect(), left = " + left + ", top = " + top +
            ", right = " + right + ", bottom = " + bottom);
    },

    onTextSelectionItemClicked: function (id, selectedText) {
        console.warn("-> Mock call to FolioWebView.onTextSelectionItemClicked(), id = " + id +
            ", selectedText = " + selectedText);
    },

    getViewportRect: function () {
        console.warn("-> Mock call to FolioWebView.getViewportRect()");
        // TODO -> Implement getViewportRect for browser
        throw "-> To be implemented for browser";
    }
};

var WebViewPager = {

    setCurrentPage: function (pageIndex) {
        console.warn("-> Mock call to WebViewPager.setCurrentPage(" + pageIndex + ")");
    },

    setPageToLast: function () {
        console.warn("-> Mock call to WebViewPager.setPageToLast()");
    },

    setPageToFirst: function () {
        console.warn("-> Mock call to WebViewPager.setPageToFirst()");
    }
};

var LoadingView = {

    show: function () {
        console.warn("-> Mock call to LoadingView.show()");
    },

    hide: function () {
        console.warn("-> Mock call to LoadingView.hide()");
    },

    visible: function () {
        console.warn("-> Mock call to LoadingView.visible()");
    },

    invisible: function () {
        console.warn("-> Mock call to LoadingView.invisible()");
    }
};