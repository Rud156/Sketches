"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Utility = function () {
    function Utility() {
        _classCallCheck(this, Utility);
    }

    _createClass(Utility, [{
        key: "calcSumSquaredValue",
        value: function calcSumSquaredValue(valueArray) {
            var sum = 0;
            for (var i = 0; i < valueArray.length; i++) {
                sum += pow(valueArray[i], 2);
            }return sum / valueArray.length;
        }
    }, {
        key: "calcSumSquareStereo",
        value: function calcSumSquareStereo(valueArray) {
            var value = this.calcSumSquaredValue(valueArray);
            return value * valueArray.length;
        }
    }, {
        key: "calcMean",
        value: function calcMean(valueArray) {
            var sum = 0;
            for (var i = 0; i < valueArray.length; i++) {
                sum += valueArray[i];
            }return sum / valueArray.length;
        }
    }, {
        key: "calcVariance",
        value: function calcVariance(valueArray, oldValue) {
            var sum = 0;
            for (var i = 0; i < valueArray.length; i++) {
                sum += pow(valueArray[i] - oldValue, 2);
            }return sum / valueArray.length;
        }
    }, {
        key: "shiftBuffer",
        value: function shiftBuffer(buffer, value) {
            var newArray = [].concat(_toConsumableArray(buffer));
            newArray.pop();
            newArray.unshift(value);
            return newArray;
        }
    }]);

    return Utility;
}();
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
/// <reference path="./utility.js" />

var stars = [];
var starBurst = [];
var musicHandler = new MusicHandler();
var utility = new Utility();
var audio = document.getElementById('audio');

var sampleSize = 1024;
var someConstantValue = 100; // TODO: Works for 'Haunted'
var audioContext = new AudioContext();
var analyzer = audioContext.createAnalyser();
analyzer.fftSize = sampleSize;
var bufferLength = analyzer.frequencyBinCount;
var dataArray = new Float32Array(bufferLength);
var source = audioContext.createMediaElementSource(audio);
source.connect(analyzer);
analyzer.connect(audioContext.destination);

var sensitivity = -0.0025714 * 0 + 1.5142857;
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

var buildAudioGraph = function buildAudioGraph() {
    if (audio.canPlayType(musicHandler.getFile().type)) {
        audio.src = musicHandler.getFileBlob();
        audio.play();
    } else {
        window.alert('Invalid File Type Selected');
    }
};

var visualize = function visualize() {
    analyzer.getFloatTimeDomainData(dataArray);
    var instantSpec = utility.calcSumSquareStereo(dataArray);
    var mean = utility.calcMean(historyBuffer);
    var variance = utility.calcVariance(historyBuffer, instantSpec);

    sensitivity = -0.0025714 * variance + 1.5142857;
    historyBuffer = utility.shiftBuffer(historyBuffer, instantSpec);

    if (instantSpec > abs(sensitivity) * mean * 5) createStarBurst();
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

    visualize();
}
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInV0aWxpdHkuanMiLCJzdGFyLmpzIiwibXVzaWMtaGFuZGxlci5qcyIsImluZGV4LmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDdERBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNsRkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNwQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoiYnVuZGxlLmpzIiwic291cmNlc0NvbnRlbnQiOlsiXCJ1c2Ugc3RyaWN0XCI7XG5cbnZhciBfY3JlYXRlQ2xhc3MgPSBmdW5jdGlvbiAoKSB7IGZ1bmN0aW9uIGRlZmluZVByb3BlcnRpZXModGFyZ2V0LCBwcm9wcykgeyBmb3IgKHZhciBpID0gMDsgaSA8IHByb3BzLmxlbmd0aDsgaSsrKSB7IHZhciBkZXNjcmlwdG9yID0gcHJvcHNbaV07IGRlc2NyaXB0b3IuZW51bWVyYWJsZSA9IGRlc2NyaXB0b3IuZW51bWVyYWJsZSB8fCBmYWxzZTsgZGVzY3JpcHRvci5jb25maWd1cmFibGUgPSB0cnVlOyBpZiAoXCJ2YWx1ZVwiIGluIGRlc2NyaXB0b3IpIGRlc2NyaXB0b3Iud3JpdGFibGUgPSB0cnVlOyBPYmplY3QuZGVmaW5lUHJvcGVydHkodGFyZ2V0LCBkZXNjcmlwdG9yLmtleSwgZGVzY3JpcHRvcik7IH0gfSByZXR1cm4gZnVuY3Rpb24gKENvbnN0cnVjdG9yLCBwcm90b1Byb3BzLCBzdGF0aWNQcm9wcykgeyBpZiAocHJvdG9Qcm9wcykgZGVmaW5lUHJvcGVydGllcyhDb25zdHJ1Y3Rvci5wcm90b3R5cGUsIHByb3RvUHJvcHMpOyBpZiAoc3RhdGljUHJvcHMpIGRlZmluZVByb3BlcnRpZXMoQ29uc3RydWN0b3IsIHN0YXRpY1Byb3BzKTsgcmV0dXJuIENvbnN0cnVjdG9yOyB9OyB9KCk7XG5cbmZ1bmN0aW9uIF90b0NvbnN1bWFibGVBcnJheShhcnIpIHsgaWYgKEFycmF5LmlzQXJyYXkoYXJyKSkgeyBmb3IgKHZhciBpID0gMCwgYXJyMiA9IEFycmF5KGFyci5sZW5ndGgpOyBpIDwgYXJyLmxlbmd0aDsgaSsrKSB7IGFycjJbaV0gPSBhcnJbaV07IH0gcmV0dXJuIGFycjI7IH0gZWxzZSB7IHJldHVybiBBcnJheS5mcm9tKGFycik7IH0gfVxuXG5mdW5jdGlvbiBfY2xhc3NDYWxsQ2hlY2soaW5zdGFuY2UsIENvbnN0cnVjdG9yKSB7IGlmICghKGluc3RhbmNlIGluc3RhbmNlb2YgQ29uc3RydWN0b3IpKSB7IHRocm93IG5ldyBUeXBlRXJyb3IoXCJDYW5ub3QgY2FsbCBhIGNsYXNzIGFzIGEgZnVuY3Rpb25cIik7IH0gfVxuXG52YXIgVXRpbGl0eSA9IGZ1bmN0aW9uICgpIHtcbiAgICBmdW5jdGlvbiBVdGlsaXR5KCkge1xuICAgICAgICBfY2xhc3NDYWxsQ2hlY2sodGhpcywgVXRpbGl0eSk7XG4gICAgfVxuXG4gICAgX2NyZWF0ZUNsYXNzKFV0aWxpdHksIFt7XG4gICAgICAgIGtleTogXCJjYWxjU3VtU3F1YXJlZFZhbHVlXCIsXG4gICAgICAgIHZhbHVlOiBmdW5jdGlvbiBjYWxjU3VtU3F1YXJlZFZhbHVlKHZhbHVlQXJyYXkpIHtcbiAgICAgICAgICAgIHZhciBzdW0gPSAwO1xuICAgICAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCB2YWx1ZUFycmF5Lmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICAgICAgc3VtICs9IHBvdyh2YWx1ZUFycmF5W2ldLCAyKTtcbiAgICAgICAgICAgIH1yZXR1cm4gc3VtIC8gdmFsdWVBcnJheS5sZW5ndGg7XG4gICAgICAgIH1cbiAgICB9LCB7XG4gICAgICAgIGtleTogXCJjYWxjU3VtU3F1YXJlU3RlcmVvXCIsXG4gICAgICAgIHZhbHVlOiBmdW5jdGlvbiBjYWxjU3VtU3F1YXJlU3RlcmVvKHZhbHVlQXJyYXkpIHtcbiAgICAgICAgICAgIHZhciB2YWx1ZSA9IHRoaXMuY2FsY1N1bVNxdWFyZWRWYWx1ZSh2YWx1ZUFycmF5KTtcbiAgICAgICAgICAgIHJldHVybiB2YWx1ZSAqIHZhbHVlQXJyYXkubGVuZ3RoO1xuICAgICAgICB9XG4gICAgfSwge1xuICAgICAgICBrZXk6IFwiY2FsY01lYW5cIixcbiAgICAgICAgdmFsdWU6IGZ1bmN0aW9uIGNhbGNNZWFuKHZhbHVlQXJyYXkpIHtcbiAgICAgICAgICAgIHZhciBzdW0gPSAwO1xuICAgICAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCB2YWx1ZUFycmF5Lmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICAgICAgc3VtICs9IHZhbHVlQXJyYXlbaV07XG4gICAgICAgICAgICB9cmV0dXJuIHN1bSAvIHZhbHVlQXJyYXkubGVuZ3RoO1xuICAgICAgICB9XG4gICAgfSwge1xuICAgICAgICBrZXk6IFwiY2FsY1ZhcmlhbmNlXCIsXG4gICAgICAgIHZhbHVlOiBmdW5jdGlvbiBjYWxjVmFyaWFuY2UodmFsdWVBcnJheSwgb2xkVmFsdWUpIHtcbiAgICAgICAgICAgIHZhciBzdW0gPSAwO1xuICAgICAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCB2YWx1ZUFycmF5Lmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICAgICAgc3VtICs9IHBvdyh2YWx1ZUFycmF5W2ldIC0gb2xkVmFsdWUsIDIpO1xuICAgICAgICAgICAgfXJldHVybiBzdW0gLyB2YWx1ZUFycmF5Lmxlbmd0aDtcbiAgICAgICAgfVxuICAgIH0sIHtcbiAgICAgICAga2V5OiBcInNoaWZ0QnVmZmVyXCIsXG4gICAgICAgIHZhbHVlOiBmdW5jdGlvbiBzaGlmdEJ1ZmZlcihidWZmZXIsIHZhbHVlKSB7XG4gICAgICAgICAgICB2YXIgbmV3QXJyYXkgPSBbXS5jb25jYXQoX3RvQ29uc3VtYWJsZUFycmF5KGJ1ZmZlcikpO1xuICAgICAgICAgICAgbmV3QXJyYXkucG9wKCk7XG4gICAgICAgICAgICBuZXdBcnJheS51bnNoaWZ0KHZhbHVlKTtcbiAgICAgICAgICAgIHJldHVybiBuZXdBcnJheTtcbiAgICAgICAgfVxuICAgIH1dKTtcblxuICAgIHJldHVybiBVdGlsaXR5O1xufSgpOyIsIlwidXNlIHN0cmljdFwiO1xuXG52YXIgX2NyZWF0ZUNsYXNzID0gZnVuY3Rpb24gKCkgeyBmdW5jdGlvbiBkZWZpbmVQcm9wZXJ0aWVzKHRhcmdldCwgcHJvcHMpIHsgZm9yICh2YXIgaSA9IDA7IGkgPCBwcm9wcy5sZW5ndGg7IGkrKykgeyB2YXIgZGVzY3JpcHRvciA9IHByb3BzW2ldOyBkZXNjcmlwdG9yLmVudW1lcmFibGUgPSBkZXNjcmlwdG9yLmVudW1lcmFibGUgfHwgZmFsc2U7IGRlc2NyaXB0b3IuY29uZmlndXJhYmxlID0gdHJ1ZTsgaWYgKFwidmFsdWVcIiBpbiBkZXNjcmlwdG9yKSBkZXNjcmlwdG9yLndyaXRhYmxlID0gdHJ1ZTsgT2JqZWN0LmRlZmluZVByb3BlcnR5KHRhcmdldCwgZGVzY3JpcHRvci5rZXksIGRlc2NyaXB0b3IpOyB9IH0gcmV0dXJuIGZ1bmN0aW9uIChDb25zdHJ1Y3RvciwgcHJvdG9Qcm9wcywgc3RhdGljUHJvcHMpIHsgaWYgKHByb3RvUHJvcHMpIGRlZmluZVByb3BlcnRpZXMoQ29uc3RydWN0b3IucHJvdG90eXBlLCBwcm90b1Byb3BzKTsgaWYgKHN0YXRpY1Byb3BzKSBkZWZpbmVQcm9wZXJ0aWVzKENvbnN0cnVjdG9yLCBzdGF0aWNQcm9wcyk7IHJldHVybiBDb25zdHJ1Y3RvcjsgfTsgfSgpO1xuXG5mdW5jdGlvbiBfY2xhc3NDYWxsQ2hlY2soaW5zdGFuY2UsIENvbnN0cnVjdG9yKSB7IGlmICghKGluc3RhbmNlIGluc3RhbmNlb2YgQ29uc3RydWN0b3IpKSB7IHRocm93IG5ldyBUeXBlRXJyb3IoXCJDYW5ub3QgY2FsbCBhIGNsYXNzIGFzIGEgZnVuY3Rpb25cIik7IH0gfVxuXG52YXIgU3RhciA9IGZ1bmN0aW9uICgpIHtcbiAgICBmdW5jdGlvbiBTdGFyKHJlc2V0LCBhdXRvQ29sb3IsIHgsIHksIHosIHNwZWVkKSB7XG4gICAgICAgIF9jbGFzc0NhbGxDaGVjayh0aGlzLCBTdGFyKTtcblxuICAgICAgICB0aGlzLnggPSB4ID09PSB1bmRlZmluZWQgPyByYW5kb20oLXdpZHRoIC8gMiwgd2lkdGggLyAyKSA6IHg7XG4gICAgICAgIHRoaXMueSA9IHkgPT09IHVuZGVmaW5lZCA/IHJhbmRvbSgtaGVpZ2h0IC8gMiwgaGVpZ2h0IC8gMikgOiB5O1xuXG4gICAgICAgIHRoaXMueiA9IHogPT09IHVuZGVmaW5lZCA/IHJhbmRvbSh3aWR0aCAvIDIpIDogejtcbiAgICAgICAgdGhpcy5zaXplID0gMDtcbiAgICAgICAgdGhpcy5zcGVlZCA9IHNwZWVkID09PSB1bmRlZmluZWQgPyByYW5kb20oMCwgMjApIDogc3BlZWQ7XG4gICAgICAgIHRoaXMuYWxwaGEgPSAwO1xuXG4gICAgICAgIHRoaXMucHJldmlvdXNaID0gdGhpcy56O1xuICAgICAgICB0aGlzLnJlc2V0ID0gcmVzZXQ7XG5cbiAgICAgICAgdGhpcy5jb2xvciA9IGF1dG9Db2xvciA/IG51bGwgOiByYW5kb20oWzIzNSwgMTE1LCAwXSk7XG4gICAgICAgIHRoaXMuYXV0b0NvbG9yID0gYXV0b0NvbG9yO1xuICAgIH1cblxuICAgIF9jcmVhdGVDbGFzcyhTdGFyLCBbe1xuICAgICAgICBrZXk6IFwic2V0U3RhcnRQb3NpdGlvbnNcIixcbiAgICAgICAgdmFsdWU6IGZ1bmN0aW9uIHNldFN0YXJ0UG9zaXRpb25zKHgsIHksIHosIHNwZWVkKSB7XG4gICAgICAgICAgICB0aGlzLnggPSB4O1xuICAgICAgICAgICAgdGhpcy55ID0geTtcbiAgICAgICAgICAgIHRoaXMueiA9IHo7XG4gICAgICAgICAgICB0aGlzLnNwZWVkID0gc3BlZWQ7XG4gICAgICAgICAgICB0aGlzLnByZXZpb3VzWiA9IHRoaXMuejtcbiAgICAgICAgfVxuICAgIH0sIHtcbiAgICAgICAga2V5OiBcInNob3dcIixcbiAgICAgICAgdmFsdWU6IGZ1bmN0aW9uIHNob3coKSB7XG4gICAgICAgICAgICBpZiAodGhpcy5hdXRvQ29sb3IpIHRoaXMuY29sb3IgPSBwYXJzZUludChtYXAodGhpcy56LCAwLCB3aWR0aCAvIDIsIDAsIDM1OSkpO1xuICAgICAgICAgICAgdmFyIGZpbGxDb2xvciA9IGNvbG9yKFwiaHNsKFwiICsgdGhpcy5jb2xvciArIFwiLCAxMDAlLCA1MCUpXCIpO1xuXG4gICAgICAgICAgICB2YXIgcG9zaXRpb25YID0gbWFwKHRoaXMueCAvIHRoaXMueiwgMCwgMSwgMCwgd2lkdGggLyAyKTtcbiAgICAgICAgICAgIHZhciBwb3NpdGlvblkgPSBtYXAodGhpcy55IC8gdGhpcy56LCAwLCAxLCAwLCBoZWlnaHQgLyAyKTtcblxuICAgICAgICAgICAgdGhpcy5zaXplID0gbWFwKHRoaXMueiwgMCwgd2lkdGggLyAyLCAxNiwgMCk7XG4gICAgICAgICAgICBmaWxsKGZpbGxDb2xvcik7XG4gICAgICAgICAgICBub1N0cm9rZSgpO1xuICAgICAgICAgICAgZWxsaXBzZShwb3NpdGlvblgsIHBvc2l0aW9uWSwgdGhpcy5zaXplKTtcblxuICAgICAgICAgICAgdmFyIHByZXZpb3VzWCA9IG1hcCh0aGlzLnggLyB0aGlzLnByZXZpb3VzWiwgMCwgMSwgMCwgd2lkdGggLyAyKTtcbiAgICAgICAgICAgIHZhciBwcmV2aW91c1kgPSBtYXAodGhpcy55IC8gdGhpcy5wcmV2aW91c1osIDAsIDEsIDAsIGhlaWdodCAvIDIpO1xuXG4gICAgICAgICAgICBzdHJva2UoZmlsbENvbG9yKTtcbiAgICAgICAgICAgIGxpbmUocHJldmlvdXNYLCBwcmV2aW91c1ksIHBvc2l0aW9uWCwgcG9zaXRpb25ZKTtcbiAgICAgICAgfVxuICAgIH0sIHtcbiAgICAgICAga2V5OiBcInVwZGF0ZVwiLFxuICAgICAgICB2YWx1ZTogZnVuY3Rpb24gdXBkYXRlKCkge1xuICAgICAgICAgICAgdGhpcy5wcmV2aW91c1ogPSB0aGlzLno7XG4gICAgICAgICAgICB0aGlzLnogLT0gdGhpcy5zcGVlZDtcblxuICAgICAgICAgICAgaWYgKHRoaXMueiA8IDEgJiYgdGhpcy5yZXNldCkge1xuICAgICAgICAgICAgICAgIHRoaXMueCA9IHJhbmRvbSgtd2lkdGggLyAyLCB3aWR0aCAvIDIpO1xuICAgICAgICAgICAgICAgIHRoaXMueSA9IHJhbmRvbSgtaGVpZ2h0IC8gMiwgaGVpZ2h0IC8gMik7XG4gICAgICAgICAgICAgICAgdGhpcy56ID0gd2lkdGggLyAyO1xuICAgICAgICAgICAgICAgIHRoaXMuc2l6ZSA9IDA7XG4gICAgICAgICAgICAgICAgdGhpcy5wcmV2aW91c1ogPSB0aGlzLno7XG4gICAgICAgICAgICB9IGVsc2UgaWYgKHRoaXMueiA+PSB3aWR0aCAvIDIgJiYgdGhpcy5yZXNldCkge1xuICAgICAgICAgICAgICAgIHRoaXMueiA9IDI7XG4gICAgICAgICAgICAgICAgdGhpcy54ID0gcmFuZG9tKC13aWR0aCAvIDIsIHdpZHRoIC8gMik7XG4gICAgICAgICAgICAgICAgdGhpcy55ID0gcmFuZG9tKC1oZWlnaHQgLyAyLCBoZWlnaHQgLyAyKTtcbiAgICAgICAgICAgICAgICB0aGlzLnByZXZpb3VzWiA9IHRoaXMuejtcbiAgICAgICAgICAgICAgICB0aGlzLnNpemUgPSAxNjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH0sIHtcbiAgICAgICAga2V5OiBcInNldFNwZWVkXCIsXG4gICAgICAgIHZhbHVlOiBmdW5jdGlvbiBzZXRTcGVlZCgpIHtcbiAgICAgICAgICAgIHRoaXMuc3BlZWQgPSBtYXAobW91c2VYLCAwLCB3aWR0aCwgLTYwLCA2MCk7XG4gICAgICAgIH1cbiAgICB9XSk7XG5cbiAgICByZXR1cm4gU3Rhcjtcbn0oKTsiLCJcInVzZSBzdHJpY3RcIjtcblxudmFyIF9jcmVhdGVDbGFzcyA9IGZ1bmN0aW9uICgpIHsgZnVuY3Rpb24gZGVmaW5lUHJvcGVydGllcyh0YXJnZXQsIHByb3BzKSB7IGZvciAodmFyIGkgPSAwOyBpIDwgcHJvcHMubGVuZ3RoOyBpKyspIHsgdmFyIGRlc2NyaXB0b3IgPSBwcm9wc1tpXTsgZGVzY3JpcHRvci5lbnVtZXJhYmxlID0gZGVzY3JpcHRvci5lbnVtZXJhYmxlIHx8IGZhbHNlOyBkZXNjcmlwdG9yLmNvbmZpZ3VyYWJsZSA9IHRydWU7IGlmIChcInZhbHVlXCIgaW4gZGVzY3JpcHRvcikgZGVzY3JpcHRvci53cml0YWJsZSA9IHRydWU7IE9iamVjdC5kZWZpbmVQcm9wZXJ0eSh0YXJnZXQsIGRlc2NyaXB0b3Iua2V5LCBkZXNjcmlwdG9yKTsgfSB9IHJldHVybiBmdW5jdGlvbiAoQ29uc3RydWN0b3IsIHByb3RvUHJvcHMsIHN0YXRpY1Byb3BzKSB7IGlmIChwcm90b1Byb3BzKSBkZWZpbmVQcm9wZXJ0aWVzKENvbnN0cnVjdG9yLnByb3RvdHlwZSwgcHJvdG9Qcm9wcyk7IGlmIChzdGF0aWNQcm9wcykgZGVmaW5lUHJvcGVydGllcyhDb25zdHJ1Y3Rvciwgc3RhdGljUHJvcHMpOyByZXR1cm4gQ29uc3RydWN0b3I7IH07IH0oKTtcblxuZnVuY3Rpb24gX2NsYXNzQ2FsbENoZWNrKGluc3RhbmNlLCBDb25zdHJ1Y3RvcikgeyBpZiAoIShpbnN0YW5jZSBpbnN0YW5jZW9mIENvbnN0cnVjdG9yKSkgeyB0aHJvdyBuZXcgVHlwZUVycm9yKFwiQ2Fubm90IGNhbGwgYSBjbGFzcyBhcyBhIGZ1bmN0aW9uXCIpOyB9IH1cblxudmFyIE11c2ljSGFuZGxlciA9IGZ1bmN0aW9uICgpIHtcbiAgICBmdW5jdGlvbiBNdXNpY0hhbmRsZXIoKSB7XG4gICAgICAgIF9jbGFzc0NhbGxDaGVjayh0aGlzLCBNdXNpY0hhbmRsZXIpO1xuXG4gICAgICAgIHRoaXMubWVkaWFGaWxlID0gbnVsbDtcbiAgICAgICAgdGhpcy5maWxlU2VsZWN0ZWQgPSBmYWxzZTtcbiAgICAgICAgdGhpcy5maWxlQmxvYlVSTCA9IG51bGw7XG4gICAgfVxuXG4gICAgX2NyZWF0ZUNsYXNzKE11c2ljSGFuZGxlciwgW3tcbiAgICAgICAga2V5OiBcImhhbmRsZUZpbGVDaGFuZ2VcIixcbiAgICAgICAgdmFsdWU6IGZ1bmN0aW9uIGhhbmRsZUZpbGVDaGFuZ2UoZXZlbnQpIHtcbiAgICAgICAgICAgIHRoaXMubWVkaWFGaWxlID0gZXZlbnQudGFyZ2V0LmZpbGVzWzBdO1xuICAgICAgICAgICAgdGhpcy5maWxlU2VsZWN0ZWQgPSB0cnVlO1xuICAgICAgICAgICAgdmFyIGZpbGVVUkwgPSB3aW5kb3cuVVJMLmNyZWF0ZU9iamVjdFVSTCh0aGlzLm1lZGlhRmlsZSk7XG4gICAgICAgICAgICB0aGlzLmZpbGVCbG9iVVJMID0gZmlsZVVSTDtcbiAgICAgICAgfVxuICAgIH0sIHtcbiAgICAgICAga2V5OiBcImdldEZpbGVCbG9iXCIsXG4gICAgICAgIHZhbHVlOiBmdW5jdGlvbiBnZXRGaWxlQmxvYigpIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLmZpbGVCbG9iVVJMO1xuICAgICAgICB9XG4gICAgfSwge1xuICAgICAgICBrZXk6IFwiZ2V0RmlsZVwiLFxuICAgICAgICB2YWx1ZTogZnVuY3Rpb24gZ2V0RmlsZSgpIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLm1lZGlhRmlsZTtcbiAgICAgICAgfVxuICAgIH1dKTtcblxuICAgIHJldHVybiBNdXNpY0hhbmRsZXI7XG59KCk7IiwiJ3VzZSBzdHJpY3QnO1xuXG4vLy8gPHJlZmVyZW5jZSBwYXRoPVwiLi9zdGFyLmpzXCIgLz5cbi8vLyA8cmVmZXJlbmNlIHBhdGg9XCIuL211c2ljLWhhbmRsZXIuanNcIiAvPlxuLy8vIDxyZWZlcmVuY2UgcGF0aD1cIi4vdXRpbGl0eS5qc1wiIC8+XG5cbnZhciBzdGFycyA9IFtdO1xudmFyIHN0YXJCdXJzdCA9IFtdO1xudmFyIG11c2ljSGFuZGxlciA9IG5ldyBNdXNpY0hhbmRsZXIoKTtcbnZhciB1dGlsaXR5ID0gbmV3IFV0aWxpdHkoKTtcbnZhciBhdWRpbyA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdhdWRpbycpO1xuXG52YXIgc2FtcGxlU2l6ZSA9IDEwMjQ7XG52YXIgc29tZUNvbnN0YW50VmFsdWUgPSAxMDA7IC8vIFRPRE86IFdvcmtzIGZvciAnSGF1bnRlZCdcbnZhciBhdWRpb0NvbnRleHQgPSBuZXcgQXVkaW9Db250ZXh0KCk7XG52YXIgYW5hbHl6ZXIgPSBhdWRpb0NvbnRleHQuY3JlYXRlQW5hbHlzZXIoKTtcbmFuYWx5emVyLmZmdFNpemUgPSBzYW1wbGVTaXplO1xudmFyIGJ1ZmZlckxlbmd0aCA9IGFuYWx5emVyLmZyZXF1ZW5jeUJpbkNvdW50O1xudmFyIGRhdGFBcnJheSA9IG5ldyBGbG9hdDMyQXJyYXkoYnVmZmVyTGVuZ3RoKTtcbnZhciBzb3VyY2UgPSBhdWRpb0NvbnRleHQuY3JlYXRlTWVkaWFFbGVtZW50U291cmNlKGF1ZGlvKTtcbnNvdXJjZS5jb25uZWN0KGFuYWx5emVyKTtcbmFuYWx5emVyLmNvbm5lY3QoYXVkaW9Db250ZXh0LmRlc3RpbmF0aW9uKTtcblxudmFyIHNlbnNpdGl2aXR5ID0gLTAuMDAyNTcxNCAqIDAgKyAxLjUxNDI4NTc7XG52YXIgaGlzdG9yeUJ1ZmZlciA9IFtdO1xuXG52YXIgaW5wdXRGaWxlID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ21lZGlhLWlucHV0Jyk7XG52YXIgbWVkaWFJbnB1dEJ1dHRvbiA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdtZWRpYS1pbnB1dC1idXR0b24nKTtcbnZhciBtZWRpYUhvbGRlciA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdtZWRpYS1ob2xkZXInKTtcblxubWVkaWFJbnB1dEJ1dHRvbi5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIGZ1bmN0aW9uICgpIHtcbiAgICBpbnB1dEZpbGUuY2xpY2soKTtcbn0pO1xuaW5wdXRGaWxlLmFkZEV2ZW50TGlzdGVuZXIoJ2NoYW5nZScsIGZ1bmN0aW9uIChldmVudCkge1xuICAgIG11c2ljSGFuZGxlci5oYW5kbGVGaWxlQ2hhbmdlKGV2ZW50KTtcbiAgICBidWlsZEF1ZGlvR3JhcGgoKTtcbn0pO1xuXG52YXIgY3JlYXRlU3RhckJ1cnN0ID0gZnVuY3Rpb24gY3JlYXRlU3RhckJ1cnN0KCkge1xuICAgIHZhciBhbmdsZUNoYW5nZSA9IDMuNjtcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IDEwMDsgaSsrKSB7XG4gICAgICAgIHN0YXJCdXJzdC5wdXNoKG5ldyBTdGFyKGZhbHNlLCBmYWxzZSwgMTAgKiBjb3MoYW5nbGVDaGFuZ2UpLCAxMCAqIHNpbihhbmdsZUNoYW5nZSksIHJhbmRvbSh3aWR0aCAvIDIpLCAyMCkpO1xuICAgICAgICBhbmdsZUNoYW5nZSArPSAzLjY7XG4gICAgfVxufTtcblxudmFyIGJ1aWxkQXVkaW9HcmFwaCA9IGZ1bmN0aW9uIGJ1aWxkQXVkaW9HcmFwaCgpIHtcbiAgICBpZiAoYXVkaW8uY2FuUGxheVR5cGUobXVzaWNIYW5kbGVyLmdldEZpbGUoKS50eXBlKSkge1xuICAgICAgICBhdWRpby5zcmMgPSBtdXNpY0hhbmRsZXIuZ2V0RmlsZUJsb2IoKTtcbiAgICAgICAgYXVkaW8ucGxheSgpO1xuICAgIH0gZWxzZSB7XG4gICAgICAgIHdpbmRvdy5hbGVydCgnSW52YWxpZCBGaWxlIFR5cGUgU2VsZWN0ZWQnKTtcbiAgICB9XG59O1xuXG52YXIgdmlzdWFsaXplID0gZnVuY3Rpb24gdmlzdWFsaXplKCkge1xuICAgIGFuYWx5emVyLmdldEZsb2F0VGltZURvbWFpbkRhdGEoZGF0YUFycmF5KTtcbiAgICB2YXIgaW5zdGFudFNwZWMgPSB1dGlsaXR5LmNhbGNTdW1TcXVhcmVTdGVyZW8oZGF0YUFycmF5KTtcbiAgICB2YXIgbWVhbiA9IHV0aWxpdHkuY2FsY01lYW4oaGlzdG9yeUJ1ZmZlcik7XG4gICAgdmFyIHZhcmlhbmNlID0gdXRpbGl0eS5jYWxjVmFyaWFuY2UoaGlzdG9yeUJ1ZmZlciwgaW5zdGFudFNwZWMpO1xuXG4gICAgc2Vuc2l0aXZpdHkgPSAtMC4wMDI1NzE0ICogdmFyaWFuY2UgKyAxLjUxNDI4NTc7XG4gICAgaGlzdG9yeUJ1ZmZlciA9IHV0aWxpdHkuc2hpZnRCdWZmZXIoaGlzdG9yeUJ1ZmZlciwgaW5zdGFudFNwZWMpO1xuXG4gICAgaWYgKGluc3RhbnRTcGVjID4gYWJzKHNlbnNpdGl2aXR5KSAqIG1lYW4gKiA1KSBjcmVhdGVTdGFyQnVyc3QoKTtcbn07XG5cbmZ1bmN0aW9uIHNldHVwKCkge1xuICAgIHZhciBjYW52YXMgPSBjcmVhdGVDYW52YXMod2luZG93LmlubmVyV2lkdGggLSAyNSwgd2luZG93LmlubmVySGVpZ2h0IC0gbWVkaWFIb2xkZXIub2Zmc2V0SGVpZ2h0IC0gNDUpO1xuICAgIGNhbnZhcy5wYXJlbnQoJ2NhbnZhcy1ob2xkZXInKTtcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IDUwMDsgaSsrKSB7XG4gICAgICAgIHN0YXJzLnB1c2gobmV3IFN0YXIodHJ1ZSwgdHJ1ZSkpO1xuICAgIH1mb3IgKHZhciBfaSA9IDA7IF9pIDwgNDM7IF9pKyspIHtcbiAgICAgICAgaGlzdG9yeUJ1ZmZlci5wdXNoKDApO1xuICAgIH1cbn1cblxuZnVuY3Rpb24gZHJhdygpIHtcbiAgICBiYWNrZ3JvdW5kKDApO1xuICAgIHRyYW5zbGF0ZSh3aWR0aCAvIDIsIGhlaWdodCAvIDIpO1xuXG4gICAgc3RhcnMuZm9yRWFjaChmdW5jdGlvbiAoZWxlbWVudCkge1xuICAgICAgICBlbGVtZW50LnVwZGF0ZSgpO1xuICAgICAgICBlbGVtZW50LnNob3coKTtcbiAgICB9KTtcblxuICAgIHN0YXJCdXJzdC5mb3JFYWNoKGZ1bmN0aW9uIChlbGVtZW50KSB7XG4gICAgICAgIGVsZW1lbnQuc2hvdygpO1xuICAgICAgICBlbGVtZW50LnVwZGF0ZSgpO1xuICAgIH0pO1xuXG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBzdGFyQnVyc3QubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgaWYgKHN0YXJCdXJzdFtpXS56IDwgMSkge1xuICAgICAgICAgICAgc3RhckJ1cnN0LnNwbGljZShpLCAxKTtcbiAgICAgICAgICAgIGkgLT0gMTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHZpc3VhbGl6ZSgpO1xufSJdfQ==
