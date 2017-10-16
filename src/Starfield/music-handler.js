class MusicHandler {
    constructor() {
        this.mediaFile = null;
        this.fileSelected = false;
        this.fileBlobURL = null;
    }

    handleFileChange(event) {
        this.mediaFile = event.target.files[0];
        this.fileSelected = true;
        let fileURL = window.URL.createObjectURL(this.mediaFile);
        this.fileBlobURL = fileURL;
    }

    getFileBlob() {
        return this.fileBlobURL;
    }

    getFile() {
        return this.mediaFile;
    }
}