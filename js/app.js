class AIMusicMixer {
    constructor() {
        this.audioProcessor = new AudioProcessor();
        this.aiModels = new AIModels();
        this.beatGenerator = new BeatGenerator();
        
        this.currentFile = null;
        this.processedAudio = null;
        
        this.initializeElements();
        this.setupEventListeners();
        this.loadAIModels();
    }

    initializeElements() {
        this.uploadArea = document.getElementById('uploadArea');
        this.audioFile = document.getElementById('audioFile');
        this.fileInfo = document.getElementById('fileInfo');
        this.fileName = document.getElementById('fileName');
        this.removeFile = document.getElementById('removeFile');
        this.processButton = document.getElementById('processButton');
        this.progressContainer = document.getElementById('progressContainer');
        this.progressFill = document.getElementById('progressFill');
        this.progressText = document.getElementById('progressText');
        this.resultsSection = document.getElementById('resultsSection');
        this.audioPlayer = document.getElementById('audioPlayer');
        this.downloadBtn = document.getElementById('downloadBtn');
        this.newProcessBtn = document.getElementById('newProcessBtn');
        this.loadingModal = document.getElementById('loadingModal');
        this.vocalIntensity = document.getElementById('vocalIntensity');
        this.vocalIntensityValue = document.getElementById('vocalIntensityValue');
    }

    setupEventListeners() {
        // Upload events
        this.uploadArea.addEventListener('click', () => this.audioFile.click());
        this.uploadArea.addEventListener('dragover', (e) => {
            e.preventDefault();
            this.uploadArea.style.borderColor = 'var(--primary-color)';
        });
        this.uploadArea.addEventListener('dragleave', () => {
            this.uploadArea.style.borderColor = 'var(--border-color)';
        });
        this.uploadArea.addEventListener('drop', (e) => {
            e.preventDefault();
            this.uploadArea.style.borderColor = 'var(--border-color)';
            const files = e.dataTransfer.files;
            if (files.length > 0) {
                this.handleFileSelect(files[0]);
            }
        });

        this.audioFile.addEventListener('change', (e) => {
            if (e.target.files.length > 0) {
                this.handleFileSelect(e.target.files[0]);
            }
        });

        this.removeFile.addEventListener('click', () => this.clearFile());
        this.processButton.addEventListener('click', () => this.processAudio());
        this.downloadBtn.addEventListener('click', () => this.downloadAudio());
        this.newProcessBtn.addEventListener('click', () => this.resetForm());

        // Settings
        this.vocalIntensity.addEventListener('input', (e) => {
            this.vocalIntensityValue.textContent = e.target.value;
        });
    }

    async loadAIModels() {
        this.showLoadingModal();
        try {
            await this.aiModels.loadModels();
            console.log('AI models loaded successfully');
        } catch (error) {
            console.error('Error loading AI models:', error);
            alert('Some AI features may be limited due to model loading issues');
        } finally {
            this.hideLoadingModal();
        }
    }

    handleFileSelect(file) {
        if (!file.type.startsWith('audio/')) {
            alert('Please select an audio file');
            return;
        }

        this.currentFile = file;
        this.fileName.textContent = file.name;
        this.fileInfo.style.display = 'flex';
        this.processButton.disabled = false;
        
        // Update upload area
        this.uploadArea.innerHTML = `
            <i class="fas fa-check-circle" style="color: var(--success-color);"></i>
            <h3>File Selected</h3>
            <p>Ready to process</p>
        `;
    }

    clearFile() {
        this.currentFile = null;
        this.fileInfo.style.display = 'none';
        this.processButton.disabled = true;
        this.audioFile.value = '';
        
        // Reset upload area
        this.uploadArea.innerHTML = `
            <i class="fas fa-cloud-upload-alt"></i>
            <h3>Upload Your Track</h3>
            <p>Drag & drop or click to select MP3/WAV file</p>
        `;
    }

    async processAudio() {
        if (!this.currentFile) return;

        this.showProgress();
        
        try {
            // Step 1: Load and analyze audio
            this.updateProgress(10, 'Loading audio file...');
            const audioBuffer = await this.audioProcessor.loadAudioFile(this.currentFile);
            
            // Step 2: Separate stems (vocals and instruments)
            this.updateProgress(25, 'Separating vocals and instruments...');
            const stems = await this.aiModels.separateStems(audioBuffer);
            
            // Step 3: Clean vocals if enabled
            let cleanedVocals = stems.vocals;
            if (document.getElementById('vocalCleaning').checked) {
                this.updateProgress(40, 'Cleaning vocals...');
                const intensity = parseInt(this.vocalIntensity.value) / 10;
                cleanedVocals = await this.audioProcessor.cleanVocals(stems.vocals, intensity);
            }
            
            // Step 4: Generate new beats if enabled
            let newBeat = stems.drums;
            if (document.getElementById('beatReplacement').checked) {
                this.updateProgress(60, 'Generating new beats...');
                const beatStyle = document.getElementById('beatStyle').value;
                newBeat = await this.beatGenerator.generateBeat(stems.drums, beatStyle);
            }
            
            // Step 5: Mix audio back together
            this.updateProgress(80, 'Mixing audio...');
            const mixedAudio = await this.audioProcessor.mixAudio({
                vocals: cleanedVocals,
                drums: newBeat,
                bass: stems.bass,
                other: stems.other
            });
            
            // Step 6: Master audio if enabled
            let masteredAudio = mixedAudio;
            if (document.getElementById('autoMastering').checked) {
                this.updateProgress(90, 'Mastering audio...');
                masteredAudio = await this.audioProcessor.masterAudio(mixedAudio);
            }
            
            // Step 7: Convert to output format
            this.updateProgress(95, 'Finalizing output...');
            const outputFormat = document.getElementById('outputFormat').value;
            this.processedAudio = await this.audioProcessor.exportAudio(masteredAudio, outputFormat);
            
            this.updateProgress(100, 'Complete!');
            this.showResults();
            
        } catch (error) {
            console.error('Processing error:', error);
            alert('Error processing audio: ' + error.message);
            this.hideProgress();
        }
    }

    updateProgress(percent, text) {
        this.progressFill.style.width = percent + '%';
        this.progressText.textContent = text;
    }

    showProgress() {
        this.progressContainer.style.display = 'block';
        this.processButton.disabled = true;
    }

    hideProgress() {
        this.progressContainer.style.display = 'none';
        this.processButton.disabled = false;
    }

    showResults() {
        const audioUrl = URL.createObjectURL(this.processedAudio);
        this.audioPlayer.src = audioUrl;
        this.resultsSection.style.display = 'block';
        this.hideProgress();
    }

    downloadAudio() {
        if (!this.processedAudio) return;
        
        const url = URL.createObjectURL(this.processedAudio);
        const a = document.createElement('a');
        a.href = url;
        a.download = `processed_${this.currentFile.name}`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    resetForm() {
        this.clearFile();
        this.resultsSection.style.display = 'none';
        this.audioPlayer.src = '';
        this.processedAudio = null;
        
        // Reset options
        document.getElementById('vocalCleaning').checked = true;
        document.getElementById('beatReplacement').checked = false;
        document.getElementById('autoMastering').checked = true;
        document.getElementById('beatStyle').value = 'modern';
        document.getElementById('outputFormat').value = 'mp3';
        this.vocalIntensity.value = 7;
        this.vocalIntensityValue.textContent = '7';
    }

    showLoadingModal() {
        this.loadingModal.style.display = 'flex';
    }

    hideLoadingModal() {
        this.loadingModal.style.display = 'none';
    }
}

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new AIMusicMixer();
});
