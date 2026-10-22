/**
 * Utility for recording canvas animations as video
 */
export class MediaRecorder {
  private canvas: HTMLCanvasElement;
  private stream: MediaStream | null = null;
  private recorder: globalThis.MediaRecorder | null = null;
  private chunks: Blob[] = [];
  private isRecording = false;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
  }

  /**
   * Start recording the canvas
   */
  async start(): Promise<void> {
    if (this.isRecording) return;

    try {
      // Get the canvas stream
      this.stream = this.canvas.captureStream(30); // 30 FPS
      
      // Create audio context for narration
      const audioContext = new AudioContext();
      const audioDestination = audioContext.createMediaStreamDestination();
      
      // Combine canvas stream with audio
      const tracks = [
        ...this.stream.getVideoTracks(),
        ...audioDestination.stream.getAudioTracks()
      ];
      
      const combinedStream = new MediaStream(tracks);
      
      // Create and configure the media recorder
      this.recorder = new globalThis.MediaRecorder(combinedStream, {
        mimeType: 'video/webm;codecs=vp9',
        videoBitsPerSecond: 2500000 // 2.5 Mbps
      });
      
      this.chunks = [];
      
      // Collect data as it becomes available
      this.recorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          this.chunks.push(e.data);
        }
      };
      
      // Start recording
      this.recorder.start(100); // Collect data in 100ms chunks
      this.isRecording = true;
    } catch (error) {
      console.error('Error starting recording:', error);
      throw new Error('Failed to start recording');
    }
  }

  /**
   * Stop recording and get the resulting video blob
   */
  async stop(): Promise<Blob> {
    return new Promise((resolve, reject) => {
      if (!this.recorder || !this.isRecording) {
        reject(new Error('No active recording'));
        return;
      }
      
      this.recorder.onstop = () => {
        // Combine all chunks into a single blob
        const videoBlob = new Blob(this.chunks, { type: 'video/webm' });
        this.isRecording = false;
        
        // Clean up
        this.chunks = [];
        if (this.stream) {
          this.stream.getTracks().forEach(track => track.stop());
        }
        
        resolve(videoBlob);
      };
      
      this.recorder.stop();
    });
  }

  /**
   * Check if recording is in progress
   */
  get recording(): boolean {
    return this.isRecording;
  }

  /**
   * Create a URL for the recorded video
   * @param blob Video blob
   */
  static createVideoUrl(blob: Blob): string {
    return URL.createObjectURL(blob);
  }

  /**
   * Add synthesized speech to a video
   * @param text Text to synthesize
   * @param audioContext Audio context
   * @param destination Audio destination
   */
  static async addSynthesizedSpeech(
    text: string,
    audioContext: AudioContext,
    destination: MediaStreamAudioDestinationNode
  ): Promise<void> {
    // In a real implementation, this would use the Web Speech API
    // or a third-party TTS service to generate speech
    console.log('Synthesizing speech for:', text);
    
    // For now, we just simulate it
    return new Promise(resolve => {
      setTimeout(resolve, 1000);
    });
  }
}
