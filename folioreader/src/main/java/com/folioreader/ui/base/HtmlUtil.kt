package com.folioreader.ui.base

import android.content.Context
import com.folioreader.Config
import com.folioreader.Constants
import com.folioreader.R

/**
 * @author gautam chibde on 14/6/17.
 */

object HtmlUtil {

    /**
     * Function modifies input html string by adding extra css,js and font information.
     *
     * @param context     Activity Context
     * @param rawHtmlContent input html raw data
     * @return modified raw html string
     */
    fun getHtmlContent(context: Context, rawHtmlContent: String, config: Config): String {
        var htmlContent = rawHtmlContent

        val cssInjection = String.format(
            context.getString(R.string.css_tag),
            Constants.ASSETS_PATH + "folioreader/css/style.css"
        )

        val jsInjection = constructJsInjection(context)

        val toInject = "\n$cssInjection\n$jsInjection\n</head>"
        htmlContent = htmlContent.replace("</head>", toInject)

        var classes = when (config.font) {
            Constants.FONT_ANDADA -> "andada"
            Constants.FONT_LATO -> "lato"
            Constants.FONT_LORA -> "lora"
            Constants.FONT_RALEWAY -> "raleway"
            else -> ""
        }

        if (config.isNightMode) {
            classes += " nightMode"
        }

        classes += when (config.fontSize) {
            0 -> " textSizeOne"
            1 -> " textSizeTwo"
            2 -> " textSizeThree"
            3 -> " textSizeFour"
            4 -> " textSizeFive"
            else -> ""
        }

        htmlContent = htmlContent.replace("<html", "<html class=\"$classes\" onclick=\"onClickHtml()\"")
        return htmlContent
    }

    private fun constructJsInjection(context: Context): String {

        val jsFiles = arrayOf(
            "folioreader/js/libs/jquery-3.1.1.min.js",
            "folioreader/js/libs/jsface.min.js",
            "folioreader/js/libs/rangy-core.js",
            "folioreader/js/libs/rangy-highlighter.js",
            "folioreader/js/libs/rangy-classapplier.js",
            "folioreader/js/libs/rangy-serializer.js",
            "folioreader/js/libs/rangefix.js",
            "folioreader/js/libs/readium-cfi.umd.js",
            "folioreader/js/utils/app-utils.js",
            "folioreader/js/horizontal.js",
            "folioreader/js/bridge.js"
        )

        var jsInjection = ""
        for (i in 0 until jsFiles.size) {
            jsInjection += String.format(
                context.getString(R.string.script_tag),
                Constants.ASSETS_PATH + jsFiles[i]
            ) + "\n"
        }

        jsInjection += String.format(
            context.getString(R.string.script_tag_method_call),
            "setMediaOverlayStyleColors('#C0ED72','#C0ED72')"
        ) + "\n"

        jsInjection += "<meta name=\"viewport\" content=\"height=device-height, user-scalable=no\" />"

        return jsInjection
    }
}
