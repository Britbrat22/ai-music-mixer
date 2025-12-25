class BeatGenerator {
    constructor() {
        this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        this.sampleRate = this.audioContext.sampleRate;
    }

    async generateBeat(originalBeat, style = 'modern') {
        // Generate new beat based on style and original beat pattern
        const beatPatterns = this.getBeatPattern(style);
        const newBeatBuffer = this.createBeatBuffer(beatPatterns);
        
        return newBeatBuffer;
    }

    getBeatPattern(style) {
        // Define beat patterns for different styles
        const patterns = {
            modern: {
                kick: [1, 0, 0, 0, 1, 0, 0, 1, 0, 0, 0, 0, 1, 0, 1, 0],
                snare: [0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0],
                hihat: [0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1]
            },
            classic: {
                kick: [1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0],
                snare: [0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0],
                hihat: [0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1]
            },
            electronic: {
                kick: [1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1],
                snare: [0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0],
                hihat: [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1]
            },
            hiphop: {
                kick: [1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0],
                snare: [0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0],
                hihat: [0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0]
            },
            rock: {
                kick: [1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0],
                snare: [0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0],
                hihat: [0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1]
            }
        };

        return patterns[style] || patterns.modern;
    }

    createBeatBuffer(patterns) {
        const beatDuration = 8; // 8 seconds
        const samplesPerBeat = (this.sampleRate * beatDuration) / patterns.kick.length;
        const totalSamples = this.sampleRate * beatDuration;

        const beatBuffer = this.audioContext.createBuffer(
            2, // Stereo
            totalSamples,
            this.sampleRate
        );

        // Generate each drum sound
        for (let channel = 0; channel < 2; channel++) {
            const channelData = beatBuffer.getChannelData(channel);
            
            // Generate kick drum
            for (let i = 0; i < patterns.kick.length; i++) {
                if (patterns.kick[i] === 1) {
                    const startSample = i * samplesPerBeat;
                    this.generateKickDrum(channelData, startSample, samplesPerBeat);
                }
            }
            
            // Generate snare drum
            for (let i = 0; i < patterns.snare.length; i++) {
                if (patterns.snare[i] === 1) {
                    const startSample = i * samplesPerBeat;
                    this.generateSnareDrum(channelData, startSample, samplesPerBeat);
                }
            }
            
            // Generate hi-hat
            for (let i = 0; i < patterns.hihat.length; i++) {
                if (patterns.hihat[i] === 1) {
                    const startSample = i * samplesPerBeat;
                    this.generateHiHat(channelData, startSample, samplesPerBeat);
                }
            }
        }

        return beatBuffer;
    }

    generateKickDrum(buffer, startSample, duration) {
        // Generate a simple kick drum sound (sine wave with envelope)
        const frequency = 60; // Low frequency for kick
        const envelope = this.createEnvelope(duration, 0.01, 0.2);
        
        for (let i = 0; i < duration && startSample + i < buffer.length; i++) {
            const t = i / this.sampleRate;
            const sample = Math.sin(2 * Math.PI * frequency * t) * envelope[i] * 1.5;
            buffer[startSample + i] += sample;
        }
    }

    generateSnareDrum(buffer, startSample, duration) {
        // Generate a simple snare drum sound (noise with envelope)
        const envelope = this.createEnvelope(duration, 0.6, 0.15);
        
        for (let i = 0; i < duration && startSample + i < buffer.length; i++) {
            const noise = (Math.random() - 0.5) * 2;
            const sample = noise * envelope[i] * 1.3;
            buffer[startSample + i] += sample;
        }
    }

    generateHiHat(buffer, startSample, duration) {
        // Generate a simple hi-hat sound (high-frequency noise with envelope)
        const envelope = this.createEnvelope(duration, 0.002, 0.05);
        
        for (let i = 0; i < duration && startSample + i < buffer.length; i++) {
            const noise = (Math.random() - 0.5) * 2;
            const filtered = this.applyHighPassFilter(noise, i);
            const sample = filtered * envelope[i] * 1.2;
            buffer[startSample + i] += sample;
        }
    }

    createEnvelope(duration, attack, release) {
        const envelope = new Float32Array(duration);
        const attackSamples = attack * this.sampleRate;
        const releaseSamples = release * this.sampleRate;
        
        for (let i = 0; i < duration; i++) {
            if (i < attackSamples) {
                // Attack phase
                envelope[i] = i / attackSamples;
            } else if (i < duration - releaseSamples) {
                // Sustain phase
                envelope[i] = 1;
            } else {
                // Release phase
                const releasePos = i - (duration - releaseSamples);
                envelope[i] = 1 - (releasePos / releaseSamples);
            }
        }
        
        return envelope;
    }

    applyHighPassFilter(sample, index) {
        // Simple high-pass filter simulation
        const alpha = 0.8;
        const filtered = sample - (sample * alpha);
        return filtered;
    }
}
