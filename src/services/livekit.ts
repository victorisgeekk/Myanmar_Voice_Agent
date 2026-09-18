import {
  Room,
  RoomEvent,
  createLocalAudioTrack,
  LocalAudioTrack,
  RemoteTrack,
  Track,
  RemoteParticipant,
} from 'livekit-client';

export class LiveKitService {
  private room: Room | null = null;
  private localAudioTrack: LocalAudioTrack | null = null;
  private audioContext: AudioContext | null = null;
  private analyser: AnalyserNode | null = null;
  private dataArray: Uint8Array | null = null;
  private animFrameId: number | null = null;
  private onLevelChange?: (level: number) => void;

  public async connect(
    roomName: string,
    participantName: string,
    callbacks: {
      onConnected: () => void;
      onDisconnected: (reason?: string) => void;
      onError: (err: string) => void;
      onParticipantJoined: (p: RemoteParticipant) => void;
      onParticipantLeft: (p: RemoteParticipant) => void;
      onLevelChange: (level: number) => void;
      onAgentMessage?: (msg: string) => void;
    }
  ): Promise<Room> {
    try {
      this.onLevelChange = callbacks.onLevelChange;

      // 1. Fetch token from our full-stack endpoint
      const tokenRes = await fetch(
        `/api/livekit/token?room=${encodeURIComponent(roomName)}&name=${encodeURIComponent(
          participantName
        )}`
      );
      if (!tokenRes.ok) {
        throw new Error('Failed to generate LiveKit access token from server');
      }
      const { token, wsUrl } = await tokenRes.json();

      // 2. Initialize Room
      const room = new Room({
        adaptiveStream: true,
        dynacast: true,
        audioCaptureDefaults: {
          autoGainControl: true,
          echoCancellation: true,
          noiseSuppression: true,
        },
      });

      this.room = room;

      // 3. Set up event listeners
      room.on(RoomEvent.Connected, () => {
        callbacks.onConnected();
      });

      room.on(RoomEvent.Disconnected, (reason) => {
        this.stopAudioAnalysis();
        callbacks.onDisconnected(reason ? String(reason) : 'Room disconnected');
      });

      room.on(RoomEvent.ParticipantConnected, (p) => {
        callbacks.onParticipantJoined(p);
      });

      room.on(RoomEvent.ParticipantDisconnected, (p) => {
        callbacks.onParticipantLeft(p);
      });

      room.on(RoomEvent.TrackSubscribed, (track: RemoteTrack) => {
        if (track.kind === Track.Kind.Audio) {
          const audioElement = track.attach();
          audioElement.autoplay = true;
          document.body.appendChild(audioElement);
        }
      });

      room.on(RoomEvent.DataReceived, (payload: Uint8Array) => {
        try {
          const decoder = new TextDecoder();
          const str = decoder.decode(payload);
          if (callbacks.onAgentMessage) {
            callbacks.onAgentMessage(str);
          }
        } catch (e) {
          console.error('DataReceived parse error:', e);
        }
      });

      // 4. Connect to LiveKit Cloud
      await room.connect(wsUrl, token);

      // 5. Publish local microphone track
      try {
        const audioTrack = await createLocalAudioTrack({
          echoCancellation: true,
          noiseSuppression: true,
        });
        this.localAudioTrack = audioTrack;
        await room.localParticipant.publishTrack(audioTrack);
        this.startAudioAnalysis(audioTrack.mediaStreamTrack);
      } catch (micErr: any) {
        console.warn('Microphone publication notice:', micErr?.message || micErr);
      }

      return room;
    } catch (err: any) {
      callbacks.onError(err?.message || 'LiveKit connection failed');
      throw err;
    }
  }

  private startAudioAnalysis(mediaStreamTrack: MediaStreamTrack) {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;

      this.audioContext = new AudioCtx();
      const stream = new MediaStream([mediaStreamTrack]);
      const source = this.audioContext.createMediaStreamSource(stream);

      this.analyser = this.audioContext.createAnalyser();
      this.analyser.fftSize = 64;
      this.analyser.smoothingTimeConstant = 0.8;

      source.connect(this.analyser);

      const bufferLength = this.analyser.frequencyBinCount;
      this.dataArray = new Uint8Array(bufferLength);

      const updateLevel = () => {
        if (!this.analyser || !this.dataArray) return;
        this.analyser.getByteFrequencyData(this.dataArray as any);

        let sum = 0;
        for (let i = 0; i < this.dataArray.length; i++) {
          sum += this.dataArray[i];
        }
        const average = sum / this.dataArray.length;
        const normalized = Math.min(100, Math.round((average / 128) * 100));

        if (this.onLevelChange) {
          this.onLevelChange(normalized);
        }

        this.animFrameId = requestAnimationFrame(updateLevel);
      };

      updateLevel();
    } catch (e) {
      console.warn('Audio analysis not supported or blocked:', e);
    }
  }

  private stopAudioAnalysis() {
    if (this.animFrameId) {
      cancelAnimationFrame(this.animFrameId);
      this.animFrameId = null;
    }
    if (this.audioContext && this.audioContext.state !== 'closed') {
      this.audioContext.close();
      this.audioContext = null;
    }
    this.analyser = null;
    this.dataArray = null;
  }

  public async toggleMicrophone(enabled: boolean): Promise<boolean> {
    if (this.localAudioTrack) {
      if (enabled) {
        await this.localAudioTrack.unmute();
      } else {
        await this.localAudioTrack.mute();
      }
      return !this.localAudioTrack.isMuted;
    }
    return false;
  }

  public async disconnect() {
    this.stopAudioAnalysis();
    if (this.localAudioTrack) {
      this.localAudioTrack.stop();
      this.localAudioTrack = null;
    }
    if (this.room) {
      await this.room.disconnect();
      this.room = null;
    }
  }
}

export const livekitService = new LiveKitService();
