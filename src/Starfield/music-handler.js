class MusicHandler {
    constructor() {
        this.mediaFile = null;
        this.fileSelected = false;
    }

    handleFileChange(event) {
        this.mediaFile = event.target.files[0];
        this.fileSelected = true;
    }
}