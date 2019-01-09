## Internal Developer Notes for Development of FolioReader

## New Highlight Implementation

### POC for reference

- Highlight POC 2 in [epub-highlight](https://github.com/hrishikesh-kadam/epub-highlight).

### List of existing classes and interfaces dependent on highlight feature

- Highlight
- HighlightImpl
- HighLightTable
- DbAdapter
- FolioDatabaseHelper
- DictionaryTable
- OnHighlightListener
- HighlightFragment
- HighlightAdapter
- SaveReceivedHighlightTask
- HighlightUtil

### Implementation Notes

- [ ] Highlight interface and HighlightImpl to be replaced by open class HighlightLocator which extends Locator.
- [ ] HighLightTable, DbAdapter, FolioDatabaseHelper to be replaced with Room implementation.
- [ ] DictionaryTable depends on FolioDatabaseHelper, but currently not in use anywhere, so to be deleted at the moment, can be implemented in future using Room if required.

### Road map

1. [x] On Selection of text, show text selection menu.
2. [ ] On click of color, draw svg g element.
3. [ ] While drawing svg g element, model data according to HighlightLocator.
4. [ ] Send callback to Android code with newly created HighlightLocator object.
5. [ ] HighlightLocator object can be created in JS itself and send it to Android as json or send required info to Android as json and then create object in Android.
6. [ ] Save this object in DB using Room.
7. [ ] After saving in DB, broadcast it to developer.
8. [ ] Edit or Delete existing highlight from webview UI.
9. [ ] Draw list of HighlightLocator saved in DB per spine. Ex. Reopening EPUB.
10. [ ] Edit HighlightFragment and HighlightAdapter to show list.
11. [ ] After click on highlight from list, scroll it to the visible viewport.
12. [ ] Add or edit notes from HighlightFragment.
13. [ ] Deleting highlight from HighlightFragment should also delete it from DOM.
14. [ ] Work on Sync logic of highlight before opening EPUB.
15. [ ] Add 'Add note' UI in TextSelection Popup of webview.
