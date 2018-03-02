function LabelTool(handleLabel, handleUrl, handleTitle) {
    handleLabel = typeof handleLabel === 'function'
        ? handleLabel
        : require('./text/link-label');
    handleUrl = typeof handleUrl === 'function'
        ? handleUrl
        : require('./text/link-attr');
    handleTitle = typeof handleTitle === 'function'
        ? handleTitle
        : require('./text/link-attr');
    
    var dict = {};

    this.bind = function (label, url, title) {
        label = handleLabel(label);
        if (/^\s*$/.test(label) || label in dict) {
            return false;
        }
        dict[label] = {
            url: handleUrl(url),
            title: handleTitle(title)
        };
        return true;
    }
    this.dict = function (label) {
        label = handleLabel(label);
        if (/^\s*$/.test(label)) {
            return false;
        }
        return dict[label];
    }
    this.handleUrl = handleUrl;
    this.handleLabel = handleLabel;
    this.handleTitle = handleTitle;
}

module.exports = LabelTool;