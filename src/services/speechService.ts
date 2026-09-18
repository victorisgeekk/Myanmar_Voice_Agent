export class SpeechService {
  private recognition: any = null;
  private isListening: boolean = false;
  private synth: SpeechSynthesis | null = null;
  private audioCtx: AudioContext | null = null;

  constructor() {
    if (typeof window !== 'undefined') {
      const SpeechRecognition =
        (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

      if (SpeechRecognition) {
        this.recognition = new SpeechRecognition();
        this.recognition.continuous = true;
        this.recognition.interimResults = true;
        // Prioritize Myanmar locale, fallback will be handled smoothly
        this.recognition.lang = 'my-MM';
      }

      if ('speechSynthesis' in window) {
        this.synth = window.speechSynthesis;
      }
    }
  }

  public isSpeechSupported(): boolean {
    return !!this.recognition;
  }

  public startListening(
    onResult: (transcript: string, isFinal: boolean) => void,
    onError: (err: any) => void
  ) {
    if (!this.recognition || this.isListening) return;

    this.playTone(440, 0.1); // pleasant chime on start

    this.recognition.onresult = (event: any) => {
      let interimTranscript = '';
      let finalTranscript = '';

      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          finalTranscript += event.results[i][0].transcript;
        } else {
          interimTranscript += event.results[i][0].transcript;
        }
      }

      if (finalTranscript) {
        onResult(finalTranscript.trim(), true);
      } else if (interimTranscript) {
        onResult(interimTranscript.trim(), false);
      }
    };

    this.recognition.onerror = (event: any) => {
      // If my-MM fails on certain browsers, try fallback
      if (event.error === 'language-not-supported' && this.recognition.lang === 'my-MM') {
        this.recognition.lang = 'en-US';
        try {
          this.recognition.start();
          return;
        } catch (e) {
          // ignore
        }
      }
      this.isListening = false;
      onError(event);
    };

    this.recognition.onend = () => {
      this.isListening = false;
    };

    try {
      this.recognition.start();
      this.isListening = true;
    } catch (e) {
      onError(e);
    }
  }

  public stopListening() {
    if (this.recognition && this.isListening) {
      try {
        this.recognition.stop();
      } catch (e) {
        // ignore
      }
      this.isListening = false;
      this.playTone(330, 0.1);
    }
  }

  public speak(text: string, onEnd?: () => void) {
    if (!this.synth) {
      if (onEnd) onEnd();
      return;
    }

    this.synth.cancel(); // Stop ongoing speech

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.95;
    utterance.pitch = 1.05;

    // Pick best available voice (prefer Asian/Myanmar or smooth female voice)
    const voices = this.synth.getVoices();
    const myanmarVoice = voices.find((v) => v.lang.includes('my') || v.lang.includes('burmese'));
    const naturalVoice = voices.find(
      (v) => v.lang.includes('en-IN') || v.lang.includes('en-SG') || v.name.includes('Natural')
    );

    if (myanmarVoice) {
      utterance.voice = myanmarVoice;
      utterance.lang = 'my-MM';
    } else if (naturalVoice) {
      utterance.voice = naturalVoice;
    }

    utterance.onend = () => {
      if (onEnd) onEnd();
    };

    utterance.onerror = () => {
      if (onEnd) onEnd();
    };

    this.synth.speak(utterance);
  }

  public playTone(freq: number, duration: number) {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      if (!this.audioCtx || this.audioCtx.state === 'closed') {
        this.audioCtx = new AudioCtx();
      }
      const osc = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, this.audioCtx.currentTime);

      gain.gain.setValueAtTime(0.08, this.audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.audioCtx.currentTime + duration);

      osc.connect(gain);
      gain.connect(this.audioCtx.destination);

      osc.start();
      osc.stop(this.audioCtx.currentTime + duration);
    } catch (e) {
      // Audio context might be restricted before user gesture
    }
  }
}

export const speechService = new SpeechService();
