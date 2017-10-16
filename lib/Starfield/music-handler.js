"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var MusicHandler = function () {
    function MusicHandler() {
        _classCallCheck(this, MusicHandler);

        this.mediaFile = null;
        this.fileSelected = false;
        this.fileBlobURL = null;
    }

    _createClass(MusicHandler, [{
        key: "handleFileChange",
        value: function handleFileChange(event) {
            this.mediaFile = event.target.files[0];
            this.fileSelected = true;
            var fileURL = window.URL.createObjectURL(this.mediaFile);
            this.fileBlobURL = fileURL;
        }
    }, {
        key: "getFileBlob",
        value: function getFileBlob() {
            return this.fileBlobURL;
        }
    }, {
        key: "getFile",
        value: function getFile() {
            return this.mediaFile;
        }
    }]);

    return MusicHandler;
}();