/// <reference path="./star.js" />
/// <reference path="./music-handler.js" />

let stars = [];
let starBurst = [];
let musicHandler = new MusicHandler();
let audio = document.getElementById('audio');

let audioContext = new AudioContext();
// let leftAnalyzer = audioContext.createAnalyser();
// let rightAnalyzer = audioContext.createAnalyser();
let analyzer = audioContext.createAnalyser();
analyzer.smoothingTimeConstant = 0.3;
analyzer.fftSize = 1024;
// let leftBufferLength = leftAnalyzer.frequencyBinCount;
// let rightBufferLength = rightAnalyzer.frequencyBinCount;
let bufferLength = analyzer.frequencyBinCount;
let dataArray = new Uint8Array(bufferLength);
let source = audioContext.createMediaElementSource(audio);
source.connect(analyzer);
analyzer.connect(audioContext.destination);


let sensitivity = 1.1;
let previousValue = 0;

let inputFile = document.getElementById('media-input');
let mediaInputButton = document.getElementById('media-input-button');
let mediaHolder = document.getElementById('media-holder');

mediaInputButton.addEventListener('click', () => {
    inputFile.click();
});
inputFile.addEventListener('change', (event) => {
    musicHandler.handleFileChange(event);
    buildAudioGraph();
});

let createStarBurst = () => {
    let angleChange = 3.6;
    for (let i = 0; i < 100; i++) {
        starBurst.push(new Star(
            false,
            false,
            10 * cos(angleChange),
            10 * sin(angleChange),
            random(width / 2),
            20
        ));
        angleChange += 3.6;
    }
};
let calcSumSquaredValue = (valueArray) => {
    let sum = 0;
    for (let i = 0; i < valueArray.length; i++)
        sum += pow(valueArray[i], 2);
    return sum / valueArray.length;
};
let buildAudioGraph = () => {
    console.log(musicHandler.getFile().type);
    if (audio.canPlayType(musicHandler.getFile().type)) {
        audio.src = musicHandler.getFileBlob();
        audio.play();
    } else {
        window.alert('Invalid File Type Selected');
    }
};

let visualize = () => {
    analyzer.getByteFrequencyData(dataArray);
    let currentValue = calcSumSquaredValue(dataArray);

    if (currentValue > sensitivity * previousValue)
        createStarBurst();
    previousValue = currentValue;
};

function setup() {
    let canvas = createCanvas(window.innerWidth - 25, window.innerHeight - mediaHolder.offsetHeight - 45);
    canvas.parent('canvas-holder');
    for (let i = 0; i < 500; i++)
        stars.push(new Star(true, true));
}

function draw() {
    background(0);
    translate(width / 2, height / 2);

    stars.forEach(element => {
        element.update();
        element.show();
        // if (mouseX >= 0 && mouseX <= width)
        //     element.setSpeed();
    });

    starBurst.forEach(element => {
        element.show();
        element.update();
    });

    for (let i = 0; i < starBurst.length; i++) {
        if (starBurst[i].z < 1) {
            starBurst.splice(i, 1);
            i -= 1;
        }
    }

    visualize();
}

// function mousePressed() {
//     createStarBurst();
// }