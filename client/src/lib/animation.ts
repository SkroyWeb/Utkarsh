// Basic animation library for the AI teacher

/**
 * Animates the teacher avatar on a canvas
 * @param canvas Canvas element to draw on
 * @returns Cleanup function
 */
export function animateTeacher(canvas: HTMLCanvasElement): () => void {
  const ctx = canvas.getContext('2d');
  if (!ctx) return () => {};

  // Set canvas dimensions
  const width = canvas.width;
  const height = canvas.height;

  // Animation state
  let frameId: number;
  let eyeBlink = 0;
  
  // Teacher colors
  const skinColor = '#FFD8B4';
  const hairColor = '#654321';
  const shirtColor = '#3B82F6';
  const glassesColor = '#333333';
  
  // Animation timing
  let lastBlinkTime = 0;
  const blinkInterval = 3000; // blink every 3 seconds

  // Draw the teacher character
  const drawTeacher = (time: number) => {
    ctx.clearRect(0, 0, width, height);
    
    // Calculate head position with slight bobbing
    const bobbing = Math.sin(time / 1000) * 3;
    
    // Background - circular gradient
    const gradient = ctx.createRadialGradient(
      width / 2, height / 2, 0,
      width / 2, height / 2, width / 2
    );
    gradient.addColorStop(0, 'rgba(219, 234, 254, 0.7)');
    gradient.addColorStop(1, 'rgba(59, 130, 246, 0.2)');
    
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);
    
    // Draw head
    ctx.fillStyle = skinColor;
    ctx.beginPath();
    ctx.arc(width / 2, height / 2 + bobbing, width * 0.35, 0, Math.PI * 2);
    ctx.fill();
    
    // Draw hair
    ctx.fillStyle = hairColor;
    ctx.beginPath();
    ctx.arc(width / 2, height / 2 + bobbing - 15, width * 0.33, Math.PI, Math.PI * 2);
    ctx.fill();
    
    // Manage blinking
    if (time - lastBlinkTime > blinkInterval) {
      eyeBlink = 1;
      lastBlinkTime = time;
      setTimeout(() => {
        eyeBlink = 0;
      }, 200);
    }
    
    // Draw eyes
    const eyeY = height / 2 + bobbing - 10;
    const eyeSize = eyeBlink ? 1 : 5;
    
    // Glasses
    ctx.strokeStyle = glassesColor;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(width / 2 - 25, eyeY, 15, 0, Math.PI * 2);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(width / 2 + 25, eyeY, 15, 0, Math.PI * 2);
    ctx.stroke();
    
    // Bridge of glasses
    ctx.beginPath();
    ctx.moveTo(width / 2 - 10, eyeY);
    ctx.lineTo(width / 2 + 10, eyeY);
    ctx.stroke();
    
    // Left eye
    ctx.fillStyle = '#000000';
    ctx.beginPath();
    ctx.arc(width / 2 - 25, eyeY, eyeSize, 0, Math.PI * 2);
    ctx.fill();
    
    // Right eye
    ctx.beginPath();
    ctx.arc(width / 2 + 25, eyeY, eyeSize, 0, Math.PI * 2);
    ctx.fill();
    
    // Smile
    ctx.beginPath();
    ctx.arc(width / 2, eyeY + 25, 20, 0, Math.PI);
    ctx.stroke();
    
    // Shirt/Collar
    ctx.fillStyle = shirtColor;
    ctx.beginPath();
    ctx.moveTo(width / 2 - 50, height);
    ctx.lineTo(width / 2 + 50, height);
    ctx.lineTo(width / 2 + 40, height - 30);
    ctx.lineTo(width / 2, height - 40);
    ctx.lineTo(width / 2 - 40, height - 30);
    ctx.closePath();
    ctx.fill();
    
    // Animate
    frameId = requestAnimationFrame(drawTeacher);
  };
  
  // Start animation
  frameId = requestAnimationFrame(drawTeacher);
  
  // Return cleanup function
  return () => {
    cancelAnimationFrame(frameId);
  };
}

/**
 * Animate text appearing character by character
 * @param element Element to animate text within
 * @param text Text to animate
 * @param speed Speed of animation in ms per character
 */
export function animateText(element: HTMLElement, text: string, speed = 50): Promise<void> {
  return new Promise((resolve) => {
    let index = 0;
    element.textContent = '';
    
    const interval = setInterval(() => {
      if (index < text.length) {
        element.textContent += text.charAt(index);
        index++;
      } else {
        clearInterval(interval);
        resolve();
      }
    }, speed);
  });
}

/**
 * Generic animation function
 * @param duration Duration in milliseconds
 * @param callback Callback function with progress (0-1)
 */
export function animate(duration: number, callback: (progress: number) => void): Promise<void> {
  return new Promise((resolve) => {
    const startTime = performance.now();
    
    const step = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      callback(progress);
      
      if (progress < 1) {
        requestAnimationFrame(step);
      } else {
        resolve();
      }
    };
    
    requestAnimationFrame(step);
  });
}
