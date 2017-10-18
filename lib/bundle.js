"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Star = function () {
    function Star(reset, autoColor, x, y, z, speed) {
        _classCallCheck(this, Star);

        this.x = x === undefined ? random(-width / 2, width / 2) : x;
        this.y = y === undefined ? random(-height / 2, height / 2) : y;

        this.z = z === undefined ? random(width / 2) : z;
        this.size = 0;
        this.speed = speed === undefined ? random(0, 20) : speed;
        this.alpha = 0;

        this.previousZ = this.z;
        this.reset = reset;

        this.color = autoColor ? null : random([235, 115, 0]);
        this.autoColor = autoColor;
    }

    _createClass(Star, [{
        key: "setStartPositions",
        value: function setStartPositions(x, y, z, speed) {
            this.x = x;
            this.y = y;
            this.z = z;
            this.speed = speed;
            this.previousZ = this.z;
        }
    }, {
        key: "show",
        value: function show() {
            if (this.autoColor) this.color = parseInt(map(this.z, 0, width / 2, 0, 359));
            var fillColor = color("hsl(" + this.color + ", 100%, 50%)");

            var positionX = map(this.x / this.z, 0, 1, 0, width / 2);
            var positionY = map(this.y / this.z, 0, 1, 0, height / 2);

            this.size = map(this.z, 0, width / 2, 16, 0);
            fill(fillColor);
            noStroke();
            ellipse(positionX, positionY, this.size);

            var previousX = map(this.x / this.previousZ, 0, 1, 0, width / 2);
            var previousY = map(this.y / this.previousZ, 0, 1, 0, height / 2);

            stroke(fillColor);
            line(previousX, previousY, positionX, positionY);
        }
    }, {
        key: "update",
        value: function update() {
            this.previousZ = this.z;
            this.z -= this.speed;

            if (this.z < 1 && this.reset) {
                this.x = random(-width / 2, width / 2);
                this.y = random(-height / 2, height / 2);
                this.z = width / 2;
                this.size = 0;
                this.previousZ = this.z;
            } else if (this.z >= width / 2 && this.reset) {
                this.z = 2;
                this.x = random(-width / 2, width / 2);
                this.y = random(-height / 2, height / 2);
                this.previousZ = this.z;
                this.size = 16;
            }
        }
    }, {
        key: "setSpeed",
        value: function setSpeed() {
            this.speed = map(mouseX, 0, width, -60, 60);
        }
    }]);

    return Star;
}();
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
'use strict';

/// <reference path="./star.js" />
/// <reference path="./music-handler.js" />

var stars = [];
var starBurst = [];
var musicHandler = new MusicHandler();
var audio = document.getElementById('audio');

var audioContext = new AudioContext();
var analyzer = audioContext.createAnalyser();
analyzer.smoothingTimeConstant = 0.3;
analyzer.fftSize = 1024;
var bufferLength = analyzer.frequencyBinCount;
var dataArray = new Uint8Array(bufferLength);
var source = audioContext.createMediaElementSource(audio);
source.connect(analyzer);
analyzer.connect(audioContext.destination);

var sensitivity = 1.1; // TODO: Make some formula for the beats
var previousValue = 0; // FixMe: Not exactly required
var historyBuffer = [];

var inputFile = document.getElementById('media-input');
var mediaInputButton = document.getElementById('media-input-button');
var mediaHolder = document.getElementById('media-holder');

mediaInputButton.addEventListener('click', function () {
    inputFile.click();
});
inputFile.addEventListener('change', function (event) {
    musicHandler.handleFileChange(event);
    buildAudioGraph();
});

var createStarBurst = function createStarBurst() {
    var angleChange = 3.6;
    for (var i = 0; i < 100; i++) {
        starBurst.push(new Star(false, false, 10 * cos(angleChange), 10 * sin(angleChange), random(width / 2), 20));
        angleChange += 3.6;
    }
};
var calcSumSquaredValue = function calcSumSquaredValue(valueArray) {
    var sum = 0;
    for (var i = 0; i < valueArray.length; i++) {
        sum += pow(valueArray[i], 2);
    }return sum / valueArray.length;
};
var buildAudioGraph = function buildAudioGraph() {
    console.log(musicHandler.getFile().type);
    if (audio.canPlayType(musicHandler.getFile().type)) {
        audio.src = musicHandler.getFileBlob();
        audio.play();
    } else {
        window.alert('Invalid File Type Selected');
    }
};

var visualize = function visualize() {
    analyzer.getByteFrequencyData(dataArray);
    var currentValue = calcSumSquaredValue(dataArray);

    if (currentValue > sensitivity * previousValue) createStarBurst();
    previousValue = currentValue;
};

function setup() {
    var canvas = createCanvas(window.innerWidth - 25, window.innerHeight - mediaHolder.offsetHeight - 45);
    canvas.parent('canvas-holder');
    for (var i = 0; i < 500; i++) {
        stars.push(new Star(true, true));
    }for (var _i = 0; _i < 43; _i++) {
        historyBuffer.push(0);
    }
}

function draw() {
    background(0);
    translate(width / 2, height / 2);

    stars.forEach(function (element) {
        element.update();
        element.show();
        // if (mouseX >= 0 && mouseX <= width)
        //     element.setSpeed();
    });

    starBurst.forEach(function (element) {
        element.show();
        element.update();
    });

    for (var i = 0; i < starBurst.length; i++) {
        if (starBurst[i].z < 1) {
            starBurst.splice(i, 1);
            i -= 1;
        }
    }
}
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInN0YXIuanMiLCJtdXNpYy1oYW5kbGVyLmpzIiwiaW5kZXguanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ2xGQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ3BDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJidW5kbGUuanMiLCJzb3VyY2VzQ29udGVudCI6WyJcInVzZSBzdHJpY3RcIjtcblxudmFyIF9jcmVhdGVDbGFzcyA9IGZ1bmN0aW9uICgpIHsgZnVuY3Rpb24gZGVmaW5lUHJvcGVydGllcyh0YXJnZXQsIHByb3BzKSB7IGZvciAodmFyIGkgPSAwOyBpIDwgcHJvcHMubGVuZ3RoOyBpKyspIHsgdmFyIGRlc2NyaXB0b3IgPSBwcm9wc1tpXTsgZGVzY3JpcHRvci5lbnVtZXJhYmxlID0gZGVzY3JpcHRvci5lbnVtZXJhYmxlIHx8IGZhbHNlOyBkZXNjcmlwdG9yLmNvbmZpZ3VyYWJsZSA9IHRydWU7IGlmIChcInZhbHVlXCIgaW4gZGVzY3JpcHRvcikgZGVzY3JpcHRvci53cml0YWJsZSA9IHRydWU7IE9iamVjdC5kZWZpbmVQcm9wZXJ0eSh0YXJnZXQsIGRlc2NyaXB0b3Iua2V5LCBkZXNjcmlwdG9yKTsgfSB9IHJldHVybiBmdW5jdGlvbiAoQ29uc3RydWN0b3IsIHByb3RvUHJvcHMsIHN0YXRpY1Byb3BzKSB7IGlmIChwcm90b1Byb3BzKSBkZWZpbmVQcm9wZXJ0aWVzKENvbnN0cnVjdG9yLnByb3RvdHlwZSwgcHJvdG9Qcm9wcyk7IGlmIChzdGF0aWNQcm9wcykgZGVmaW5lUHJvcGVydGllcyhDb25zdHJ1Y3Rvciwgc3RhdGljUHJvcHMpOyByZXR1cm4gQ29uc3RydWN0b3I7IH07IH0oKTtcblxuZnVuY3Rpb24gX2NsYXNzQ2FsbENoZWNrKGluc3RhbmNlLCBDb25zdHJ1Y3RvcikgeyBpZiAoIShpbnN0YW5jZSBpbnN0YW5jZW9mIENvbnN0cnVjdG9yKSkgeyB0aHJvdyBuZXcgVHlwZUVycm9yKFwiQ2Fubm90IGNhbGwgYSBjbGFzcyBhcyBhIGZ1bmN0aW9uXCIpOyB9IH1cblxudmFyIFN0YXIgPSBmdW5jdGlvbiAoKSB7XG4gICAgZnVuY3Rpb24gU3RhcihyZXNldCwgYXV0b0NvbG9yLCB4LCB5LCB6LCBzcGVlZCkge1xuICAgICAgICBfY2xhc3NDYWxsQ2hlY2sodGhpcywgU3Rhcik7XG5cbiAgICAgICAgdGhpcy54ID0geCA9PT0gdW5kZWZpbmVkID8gcmFuZG9tKC13aWR0aCAvIDIsIHdpZHRoIC8gMikgOiB4O1xuICAgICAgICB0aGlzLnkgPSB5ID09PSB1bmRlZmluZWQgPyByYW5kb20oLWhlaWdodCAvIDIsIGhlaWdodCAvIDIpIDogeTtcblxuICAgICAgICB0aGlzLnogPSB6ID09PSB1bmRlZmluZWQgPyByYW5kb20od2lkdGggLyAyKSA6IHo7XG4gICAgICAgIHRoaXMuc2l6ZSA9IDA7XG4gICAgICAgIHRoaXMuc3BlZWQgPSBzcGVlZCA9PT0gdW5kZWZpbmVkID8gcmFuZG9tKDAsIDIwKSA6IHNwZWVkO1xuICAgICAgICB0aGlzLmFscGhhID0gMDtcblxuICAgICAgICB0aGlzLnByZXZpb3VzWiA9IHRoaXMuejtcbiAgICAgICAgdGhpcy5yZXNldCA9IHJlc2V0O1xuXG4gICAgICAgIHRoaXMuY29sb3IgPSBhdXRvQ29sb3IgPyBudWxsIDogcmFuZG9tKFsyMzUsIDExNSwgMF0pO1xuICAgICAgICB0aGlzLmF1dG9Db2xvciA9IGF1dG9Db2xvcjtcbiAgICB9XG5cbiAgICBfY3JlYXRlQ2xhc3MoU3RhciwgW3tcbiAgICAgICAga2V5OiBcInNldFN0YXJ0UG9zaXRpb25zXCIsXG4gICAgICAgIHZhbHVlOiBmdW5jdGlvbiBzZXRTdGFydFBvc2l0aW9ucyh4LCB5LCB6LCBzcGVlZCkge1xuICAgICAgICAgICAgdGhpcy54ID0geDtcbiAgICAgICAgICAgIHRoaXMueSA9IHk7XG4gICAgICAgICAgICB0aGlzLnogPSB6O1xuICAgICAgICAgICAgdGhpcy5zcGVlZCA9IHNwZWVkO1xuICAgICAgICAgICAgdGhpcy5wcmV2aW91c1ogPSB0aGlzLno7XG4gICAgICAgIH1cbiAgICB9LCB7XG4gICAgICAgIGtleTogXCJzaG93XCIsXG4gICAgICAgIHZhbHVlOiBmdW5jdGlvbiBzaG93KCkge1xuICAgICAgICAgICAgaWYgKHRoaXMuYXV0b0NvbG9yKSB0aGlzLmNvbG9yID0gcGFyc2VJbnQobWFwKHRoaXMueiwgMCwgd2lkdGggLyAyLCAwLCAzNTkpKTtcbiAgICAgICAgICAgIHZhciBmaWxsQ29sb3IgPSBjb2xvcihcImhzbChcIiArIHRoaXMuY29sb3IgKyBcIiwgMTAwJSwgNTAlKVwiKTtcblxuICAgICAgICAgICAgdmFyIHBvc2l0aW9uWCA9IG1hcCh0aGlzLnggLyB0aGlzLnosIDAsIDEsIDAsIHdpZHRoIC8gMik7XG4gICAgICAgICAgICB2YXIgcG9zaXRpb25ZID0gbWFwKHRoaXMueSAvIHRoaXMueiwgMCwgMSwgMCwgaGVpZ2h0IC8gMik7XG5cbiAgICAgICAgICAgIHRoaXMuc2l6ZSA9IG1hcCh0aGlzLnosIDAsIHdpZHRoIC8gMiwgMTYsIDApO1xuICAgICAgICAgICAgZmlsbChmaWxsQ29sb3IpO1xuICAgICAgICAgICAgbm9TdHJva2UoKTtcbiAgICAgICAgICAgIGVsbGlwc2UocG9zaXRpb25YLCBwb3NpdGlvblksIHRoaXMuc2l6ZSk7XG5cbiAgICAgICAgICAgIHZhciBwcmV2aW91c1ggPSBtYXAodGhpcy54IC8gdGhpcy5wcmV2aW91c1osIDAsIDEsIDAsIHdpZHRoIC8gMik7XG4gICAgICAgICAgICB2YXIgcHJldmlvdXNZID0gbWFwKHRoaXMueSAvIHRoaXMucHJldmlvdXNaLCAwLCAxLCAwLCBoZWlnaHQgLyAyKTtcblxuICAgICAgICAgICAgc3Ryb2tlKGZpbGxDb2xvcik7XG4gICAgICAgICAgICBsaW5lKHByZXZpb3VzWCwgcHJldmlvdXNZLCBwb3NpdGlvblgsIHBvc2l0aW9uWSk7XG4gICAgICAgIH1cbiAgICB9LCB7XG4gICAgICAgIGtleTogXCJ1cGRhdGVcIixcbiAgICAgICAgdmFsdWU6IGZ1bmN0aW9uIHVwZGF0ZSgpIHtcbiAgICAgICAgICAgIHRoaXMucHJldmlvdXNaID0gdGhpcy56O1xuICAgICAgICAgICAgdGhpcy56IC09IHRoaXMuc3BlZWQ7XG5cbiAgICAgICAgICAgIGlmICh0aGlzLnogPCAxICYmIHRoaXMucmVzZXQpIHtcbiAgICAgICAgICAgICAgICB0aGlzLnggPSByYW5kb20oLXdpZHRoIC8gMiwgd2lkdGggLyAyKTtcbiAgICAgICAgICAgICAgICB0aGlzLnkgPSByYW5kb20oLWhlaWdodCAvIDIsIGhlaWdodCAvIDIpO1xuICAgICAgICAgICAgICAgIHRoaXMueiA9IHdpZHRoIC8gMjtcbiAgICAgICAgICAgICAgICB0aGlzLnNpemUgPSAwO1xuICAgICAgICAgICAgICAgIHRoaXMucHJldmlvdXNaID0gdGhpcy56O1xuICAgICAgICAgICAgfSBlbHNlIGlmICh0aGlzLnogPj0gd2lkdGggLyAyICYmIHRoaXMucmVzZXQpIHtcbiAgICAgICAgICAgICAgICB0aGlzLnogPSAyO1xuICAgICAgICAgICAgICAgIHRoaXMueCA9IHJhbmRvbSgtd2lkdGggLyAyLCB3aWR0aCAvIDIpO1xuICAgICAgICAgICAgICAgIHRoaXMueSA9IHJhbmRvbSgtaGVpZ2h0IC8gMiwgaGVpZ2h0IC8gMik7XG4gICAgICAgICAgICAgICAgdGhpcy5wcmV2aW91c1ogPSB0aGlzLno7XG4gICAgICAgICAgICAgICAgdGhpcy5zaXplID0gMTY7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9LCB7XG4gICAgICAgIGtleTogXCJzZXRTcGVlZFwiLFxuICAgICAgICB2YWx1ZTogZnVuY3Rpb24gc2V0U3BlZWQoKSB7XG4gICAgICAgICAgICB0aGlzLnNwZWVkID0gbWFwKG1vdXNlWCwgMCwgd2lkdGgsIC02MCwgNjApO1xuICAgICAgICB9XG4gICAgfV0pO1xuXG4gICAgcmV0dXJuIFN0YXI7XG59KCk7IiwiXCJ1c2Ugc3RyaWN0XCI7XG5cbnZhciBfY3JlYXRlQ2xhc3MgPSBmdW5jdGlvbiAoKSB7IGZ1bmN0aW9uIGRlZmluZVByb3BlcnRpZXModGFyZ2V0LCBwcm9wcykgeyBmb3IgKHZhciBpID0gMDsgaSA8IHByb3BzLmxlbmd0aDsgaSsrKSB7IHZhciBkZXNjcmlwdG9yID0gcHJvcHNbaV07IGRlc2NyaXB0b3IuZW51bWVyYWJsZSA9IGRlc2NyaXB0b3IuZW51bWVyYWJsZSB8fCBmYWxzZTsgZGVzY3JpcHRvci5jb25maWd1cmFibGUgPSB0cnVlOyBpZiAoXCJ2YWx1ZVwiIGluIGRlc2NyaXB0b3IpIGRlc2NyaXB0b3Iud3JpdGFibGUgPSB0cnVlOyBPYmplY3QuZGVmaW5lUHJvcGVydHkodGFyZ2V0LCBkZXNjcmlwdG9yLmtleSwgZGVzY3JpcHRvcik7IH0gfSByZXR1cm4gZnVuY3Rpb24gKENvbnN0cnVjdG9yLCBwcm90b1Byb3BzLCBzdGF0aWNQcm9wcykgeyBpZiAocHJvdG9Qcm9wcykgZGVmaW5lUHJvcGVydGllcyhDb25zdHJ1Y3Rvci5wcm90b3R5cGUsIHByb3RvUHJvcHMpOyBpZiAoc3RhdGljUHJvcHMpIGRlZmluZVByb3BlcnRpZXMoQ29uc3RydWN0b3IsIHN0YXRpY1Byb3BzKTsgcmV0dXJuIENvbnN0cnVjdG9yOyB9OyB9KCk7XG5cbmZ1bmN0aW9uIF9jbGFzc0NhbGxDaGVjayhpbnN0YW5jZSwgQ29uc3RydWN0b3IpIHsgaWYgKCEoaW5zdGFuY2UgaW5zdGFuY2VvZiBDb25zdHJ1Y3RvcikpIHsgdGhyb3cgbmV3IFR5cGVFcnJvcihcIkNhbm5vdCBjYWxsIGEgY2xhc3MgYXMgYSBmdW5jdGlvblwiKTsgfSB9XG5cbnZhciBNdXNpY0hhbmRsZXIgPSBmdW5jdGlvbiAoKSB7XG4gICAgZnVuY3Rpb24gTXVzaWNIYW5kbGVyKCkge1xuICAgICAgICBfY2xhc3NDYWxsQ2hlY2sodGhpcywgTXVzaWNIYW5kbGVyKTtcblxuICAgICAgICB0aGlzLm1lZGlhRmlsZSA9IG51bGw7XG4gICAgICAgIHRoaXMuZmlsZVNlbGVjdGVkID0gZmFsc2U7XG4gICAgICAgIHRoaXMuZmlsZUJsb2JVUkwgPSBudWxsO1xuICAgIH1cblxuICAgIF9jcmVhdGVDbGFzcyhNdXNpY0hhbmRsZXIsIFt7XG4gICAgICAgIGtleTogXCJoYW5kbGVGaWxlQ2hhbmdlXCIsXG4gICAgICAgIHZhbHVlOiBmdW5jdGlvbiBoYW5kbGVGaWxlQ2hhbmdlKGV2ZW50KSB7XG4gICAgICAgICAgICB0aGlzLm1lZGlhRmlsZSA9IGV2ZW50LnRhcmdldC5maWxlc1swXTtcbiAgICAgICAgICAgIHRoaXMuZmlsZVNlbGVjdGVkID0gdHJ1ZTtcbiAgICAgICAgICAgIHZhciBmaWxlVVJMID0gd2luZG93LlVSTC5jcmVhdGVPYmplY3RVUkwodGhpcy5tZWRpYUZpbGUpO1xuICAgICAgICAgICAgdGhpcy5maWxlQmxvYlVSTCA9IGZpbGVVUkw7XG4gICAgICAgIH1cbiAgICB9LCB7XG4gICAgICAgIGtleTogXCJnZXRGaWxlQmxvYlwiLFxuICAgICAgICB2YWx1ZTogZnVuY3Rpb24gZ2V0RmlsZUJsb2IoKSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5maWxlQmxvYlVSTDtcbiAgICAgICAgfVxuICAgIH0sIHtcbiAgICAgICAga2V5OiBcImdldEZpbGVcIixcbiAgICAgICAgdmFsdWU6IGZ1bmN0aW9uIGdldEZpbGUoKSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5tZWRpYUZpbGU7XG4gICAgICAgIH1cbiAgICB9XSk7XG5cbiAgICByZXR1cm4gTXVzaWNIYW5kbGVyO1xufSgpOyIsIid1c2Ugc3RyaWN0JztcblxuLy8vIDxyZWZlcmVuY2UgcGF0aD1cIi4vc3Rhci5qc1wiIC8+XG4vLy8gPHJlZmVyZW5jZSBwYXRoPVwiLi9tdXNpYy1oYW5kbGVyLmpzXCIgLz5cblxudmFyIHN0YXJzID0gW107XG52YXIgc3RhckJ1cnN0ID0gW107XG52YXIgbXVzaWNIYW5kbGVyID0gbmV3IE11c2ljSGFuZGxlcigpO1xudmFyIGF1ZGlvID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2F1ZGlvJyk7XG5cbnZhciBhdWRpb0NvbnRleHQgPSBuZXcgQXVkaW9Db250ZXh0KCk7XG52YXIgYW5hbHl6ZXIgPSBhdWRpb0NvbnRleHQuY3JlYXRlQW5hbHlzZXIoKTtcbmFuYWx5emVyLnNtb290aGluZ1RpbWVDb25zdGFudCA9IDAuMztcbmFuYWx5emVyLmZmdFNpemUgPSAxMDI0O1xudmFyIGJ1ZmZlckxlbmd0aCA9IGFuYWx5emVyLmZyZXF1ZW5jeUJpbkNvdW50O1xudmFyIGRhdGFBcnJheSA9IG5ldyBVaW50OEFycmF5KGJ1ZmZlckxlbmd0aCk7XG52YXIgc291cmNlID0gYXVkaW9Db250ZXh0LmNyZWF0ZU1lZGlhRWxlbWVudFNvdXJjZShhdWRpbyk7XG5zb3VyY2UuY29ubmVjdChhbmFseXplcik7XG5hbmFseXplci5jb25uZWN0KGF1ZGlvQ29udGV4dC5kZXN0aW5hdGlvbik7XG5cbnZhciBzZW5zaXRpdml0eSA9IDEuMTsgLy8gVE9ETzogTWFrZSBzb21lIGZvcm11bGEgZm9yIHRoZSBiZWF0c1xudmFyIHByZXZpb3VzVmFsdWUgPSAwOyAvLyBGaXhNZTogTm90IGV4YWN0bHkgcmVxdWlyZWRcbnZhciBoaXN0b3J5QnVmZmVyID0gW107XG5cbnZhciBpbnB1dEZpbGUgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnbWVkaWEtaW5wdXQnKTtcbnZhciBtZWRpYUlucHV0QnV0dG9uID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ21lZGlhLWlucHV0LWJ1dHRvbicpO1xudmFyIG1lZGlhSG9sZGVyID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ21lZGlhLWhvbGRlcicpO1xuXG5tZWRpYUlucHV0QnV0dG9uLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgZnVuY3Rpb24gKCkge1xuICAgIGlucHV0RmlsZS5jbGljaygpO1xufSk7XG5pbnB1dEZpbGUuYWRkRXZlbnRMaXN0ZW5lcignY2hhbmdlJywgZnVuY3Rpb24gKGV2ZW50KSB7XG4gICAgbXVzaWNIYW5kbGVyLmhhbmRsZUZpbGVDaGFuZ2UoZXZlbnQpO1xuICAgIGJ1aWxkQXVkaW9HcmFwaCgpO1xufSk7XG5cbnZhciBjcmVhdGVTdGFyQnVyc3QgPSBmdW5jdGlvbiBjcmVhdGVTdGFyQnVyc3QoKSB7XG4gICAgdmFyIGFuZ2xlQ2hhbmdlID0gMy42O1xuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgMTAwOyBpKyspIHtcbiAgICAgICAgc3RhckJ1cnN0LnB1c2gobmV3IFN0YXIoZmFsc2UsIGZhbHNlLCAxMCAqIGNvcyhhbmdsZUNoYW5nZSksIDEwICogc2luKGFuZ2xlQ2hhbmdlKSwgcmFuZG9tKHdpZHRoIC8gMiksIDIwKSk7XG4gICAgICAgIGFuZ2xlQ2hhbmdlICs9IDMuNjtcbiAgICB9XG59O1xudmFyIGNhbGNTdW1TcXVhcmVkVmFsdWUgPSBmdW5jdGlvbiBjYWxjU3VtU3F1YXJlZFZhbHVlKHZhbHVlQXJyYXkpIHtcbiAgICB2YXIgc3VtID0gMDtcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IHZhbHVlQXJyYXkubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgc3VtICs9IHBvdyh2YWx1ZUFycmF5W2ldLCAyKTtcbiAgICB9cmV0dXJuIHN1bSAvIHZhbHVlQXJyYXkubGVuZ3RoO1xufTtcbnZhciBidWlsZEF1ZGlvR3JhcGggPSBmdW5jdGlvbiBidWlsZEF1ZGlvR3JhcGgoKSB7XG4gICAgY29uc29sZS5sb2cobXVzaWNIYW5kbGVyLmdldEZpbGUoKS50eXBlKTtcbiAgICBpZiAoYXVkaW8uY2FuUGxheVR5cGUobXVzaWNIYW5kbGVyLmdldEZpbGUoKS50eXBlKSkge1xuICAgICAgICBhdWRpby5zcmMgPSBtdXNpY0hhbmRsZXIuZ2V0RmlsZUJsb2IoKTtcbiAgICAgICAgYXVkaW8ucGxheSgpO1xuICAgIH0gZWxzZSB7XG4gICAgICAgIHdpbmRvdy5hbGVydCgnSW52YWxpZCBGaWxlIFR5cGUgU2VsZWN0ZWQnKTtcbiAgICB9XG59O1xuXG52YXIgdmlzdWFsaXplID0gZnVuY3Rpb24gdmlzdWFsaXplKCkge1xuICAgIGFuYWx5emVyLmdldEJ5dGVGcmVxdWVuY3lEYXRhKGRhdGFBcnJheSk7XG4gICAgdmFyIGN1cnJlbnRWYWx1ZSA9IGNhbGNTdW1TcXVhcmVkVmFsdWUoZGF0YUFycmF5KTtcblxuICAgIGlmIChjdXJyZW50VmFsdWUgPiBzZW5zaXRpdml0eSAqIHByZXZpb3VzVmFsdWUpIGNyZWF0ZVN0YXJCdXJzdCgpO1xuICAgIHByZXZpb3VzVmFsdWUgPSBjdXJyZW50VmFsdWU7XG59O1xuXG5mdW5jdGlvbiBzZXR1cCgpIHtcbiAgICB2YXIgY2FudmFzID0gY3JlYXRlQ2FudmFzKHdpbmRvdy5pbm5lcldpZHRoIC0gMjUsIHdpbmRvdy5pbm5lckhlaWdodCAtIG1lZGlhSG9sZGVyLm9mZnNldEhlaWdodCAtIDQ1KTtcbiAgICBjYW52YXMucGFyZW50KCdjYW52YXMtaG9sZGVyJyk7XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCA1MDA7IGkrKykge1xuICAgICAgICBzdGFycy5wdXNoKG5ldyBTdGFyKHRydWUsIHRydWUpKTtcbiAgICB9Zm9yICh2YXIgX2kgPSAwOyBfaSA8IDQzOyBfaSsrKSB7XG4gICAgICAgIGhpc3RvcnlCdWZmZXIucHVzaCgwKTtcbiAgICB9XG59XG5cbmZ1bmN0aW9uIGRyYXcoKSB7XG4gICAgYmFja2dyb3VuZCgwKTtcbiAgICB0cmFuc2xhdGUod2lkdGggLyAyLCBoZWlnaHQgLyAyKTtcblxuICAgIHN0YXJzLmZvckVhY2goZnVuY3Rpb24gKGVsZW1lbnQpIHtcbiAgICAgICAgZWxlbWVudC51cGRhdGUoKTtcbiAgICAgICAgZWxlbWVudC5zaG93KCk7XG4gICAgICAgIC8vIGlmIChtb3VzZVggPj0gMCAmJiBtb3VzZVggPD0gd2lkdGgpXG4gICAgICAgIC8vICAgICBlbGVtZW50LnNldFNwZWVkKCk7XG4gICAgfSk7XG5cbiAgICBzdGFyQnVyc3QuZm9yRWFjaChmdW5jdGlvbiAoZWxlbWVudCkge1xuICAgICAgICBlbGVtZW50LnNob3coKTtcbiAgICAgICAgZWxlbWVudC51cGRhdGUoKTtcbiAgICB9KTtcblxuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgc3RhckJ1cnN0Lmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIGlmIChzdGFyQnVyc3RbaV0ueiA8IDEpIHtcbiAgICAgICAgICAgIHN0YXJCdXJzdC5zcGxpY2UoaSwgMSk7XG4gICAgICAgICAgICBpIC09IDE7XG4gICAgICAgIH1cbiAgICB9XG59Il19
