class AudioProcessor {
    constructor() {
        this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        this.sampleRate = this.audioContext.sampleRate;
    }

    async loadAudioFile(file) {
        const arrayBuffer = await file.arrayBuffer();
        const audioBuffer = await this.audioContext.decodeAudioData(arrayBuffer);
        return audioBuffer;
    }

    async cleanVocals(vocalBuffer, intensity = 0.7) {
        // Apply noise reduction and enhancement
        const cleanedBuffer = this.audioContext.createBuffer(
            vocalBuffer.numberOfChannels,
            vocalBuffer.length,
            vocalBuffer.sampleRate
        );

        for (let channel = 0; channel < vocalBuffer.numberOfChannels; channel++) {
            const inputData = vocalBuffer.getChannelData(channel);
            const outputData = cleanedBuffer.getChannelData(channel);
            
            // Apply noise gate and EQ simulation
            for (let i = 0; i < inputData.length; i++) {
                let sample = inputData[i];
                
                // Simple noise gate
                if (Math.abs(sample) < 0.01 * intensity) {
                    sample *= 0.1;
                }
                
                // Enhance clarity (simple high-frequency boost simulation)
                if (Math.abs(sample) > 0.001) {
                    sample *= 1 + (intensity * 0.3);
                }
                
                // Prevent clipping
                sample = Math.max(-1, Math.min(1, sample));
                outputData[i] = sample;
            }
        }

        return cleanedBuffer;
    }

    async mixAudio(stems) {
        // Find the maximum length among all stems
        const maxLength = Math.max(
            stems.vocals.length,
            stems.drums.length,
            stems.bass.length,
            stems.other.length
        );

        const mixedBuffer = this.audioContext.createBuffer(
            2, // Stereo output
            maxLength,
            this.sampleRate
        );

        // Mix all stems together with appropriate levels
        const stemLevels = {
            vocals: 0.8,
            drums: 0.7,
            bass: 0.6,
            other: 0.5
        };

        for (let channel = 0; channel < 2; channel++) {
            const outputData = mixedBuffer.getChannelData(channel);
            
            // Mix vocals
            this.mixStem(outputData, stems.vocals, channel, stemLevels.vocals);
            
            // Mix drums
            this.mixStem(outputData, stems.drums, channel, stemLevels.drums);
            
            // Mix bass
            this.mixStem(outputData, stems.bass, channel, stemLevels.bass);
            
            // Mix other instruments
            this.mixStem(outputData, stems.other, channel, stemLevels.other);
        }

        return mixedBuffer;
    }

    mixStem(outputData, stemBuffer, targetChannel, level) {
        const sourceChannel = Math.min(targetChannel, stemBuffer.numberOfChannels - 1);
        const sourceData = stemBuffer.getChannelData(sourceChannel);
        
        for (let i = 0; i < sourceData.length; i++) {
            outputData[i] += sourceData[i] * level;
        }
    }

    async masterAudio(audioBuffer) {
        // Apply mastering effects (compression, limiting, EQ)
        const masteredBuffer = this.audioContext.createBuffer(
            audioBuffer.numberOfChannels,
            audioBuffer.length,
            audioBuffer.sampleRate
        );

        for (let channel = 0; channel < audioBuffer.numberOfChannels; channel++) {
            const inputData = audioBuffer.getChannelData(channel);
            const outputData = masteredBuffer.getChannelData(channel);
            
            // Apply simple compression and limiting
            let envelope = 0;
            const attack = 0.001;
            const release = 0.1;
            const threshold = 0.7;
            const ratio = 4;
            
            for (let i = 0; i < inputData.length; i++) {
                const sample = inputData[i];
                const absSample = Math.abs(sample);
                
                // Envelope follower
                if (absSample > envelope) {
                    envelope = absSample * attack + envelope * (1 - attack);
                } else {
                    envelope = absSample * release + envelope * (1 - release);
                }
                
                // Apply compression
                let processedSample = sample;
                if (envelope > threshold) {
                    const excess = envelope - threshold;
                    const gainReduction = 1 - (excess * (ratio - 1) / ratio);
                    processedSample = sample * gainReduction;
                }
                
                // Final limiting
                processedSample = Math.max(-0.95, Math.min(0.95, processedSample));
                outputData[i] = processedSample;
            }
        }

        return masteredBuffer;
    }

    async exportAudio(audioBuffer, format = 'mp3') {
        // Convert AudioBuffer to WAV/MP3
        const wavData = this.audioBufferToWav(audioBuffer);
        const blob = new Blob([wavData], { type: 'audio/wav' });
        
        if (format === 'mp3') {
            // Simple MP3 conversion simulation (in real app, use proper MP3 encoder)
            return blob;
        }
        
        return blob;
    }

    audioBufferToWav(buffer) {
        const length = buffer.length * buffer.numberOfChannels * 2;
        const arrayBuffer = new ArrayBuffer(44 + length);
        const view = new DataView(arrayBuffer);
        
        // WAV header
        const writeString = (offset, string) => {
            for (let i = 0; i < string.length; i++) {
                view.setUint8(offset + i, string.charCodeAt(i));
            }
        };
        
        writeString(0, 'RIFF');
        view.setUint32(4, 36 + length, true);
        writeString(8, 'WAVE');
        writeString(12, 'fmt ');
        view.setUint32(16, 16, true);
        view.setUint16(20, 1, true);
        view.setUint16(22, buffer.numberOfChannels, true);
        view.setUint32(24, buffer.sampleRate, true);
        view.setUint32(28, buffer.sampleRate * 2 * buffer.numberOfChannels, true);
        view.setUint16(32, buffer.numberOfChannels * 2, true);
        view.setUint16(34, 16, true);
        writeString(36, 'data');
        view.setUint32(40, length, true);
        
        // Convert audio data
        let offset = 44;
        for (let i = 0; i < buffer.length; i++) {
            for (let channel = 0; channel < buffer.numberOfChannels; channel++) {
                const sample = Math.max(-1, Math.min(1, buffer.getChannelData(channel)[i]));
                view.setInt16(offset, sample * 0x7FFF, true);
                offset += 2;
            }
        }
        
        return arrayBuffer;
    }
}
