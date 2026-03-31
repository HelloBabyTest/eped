import React, { useEffect, useRef, useCallback } from 'react';
import { RotateCcw } from 'lucide-react';

interface CaptchaProps {
  onCaptchaChange: (code: string) => void;
}

const Captcha: React.FC<CaptchaProps> = ({ onCaptchaChange }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const generateCaptcha = useCallback(() => {
    const chars = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
    let code = '';
    for (let i = 0; i < 6; i++) {
      code += chars[Math.floor(Math.random() * chars.length)];
    }

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Background
    ctx.fillStyle = '#f3f4f6'; // gray-100
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Add noise (lines)
    for (let i = 0; i < 5; i++) {
      ctx.strokeStyle = `rgba(${Math.random() * 255}, ${Math.random() * 255}, ${Math.random() * 255}, 0.3)`;
      ctx.beginPath();
      ctx.moveTo(Math.random() * canvas.width, Math.random() * canvas.height);
      ctx.lineTo(Math.random() * canvas.width, Math.random() * canvas.height);
      ctx.stroke();
    }

    // Add noise (dots)
    for (let i = 0; i < 30; i++) {
      ctx.fillStyle = `rgba(${Math.random() * 255}, ${Math.random() * 255}, ${Math.random() * 255}, 0.3)`;
      ctx.beginPath();
      ctx.arc(Math.random() * canvas.width, Math.random() * canvas.height, 1, 0, Math.PI * 2);
      ctx.fill();
    }

    // Draw text
    ctx.font = 'bold 24px "JetBrains Mono", monospace';
    ctx.textBaseline = 'middle';
    
    const charWidth = canvas.width / 7;
    for (let i = 0; i < code.length; i++) {
      const char = code[i];
      ctx.save();
      ctx.translate(charWidth * (i + 1), canvas.height / 2);
      ctx.rotate((Math.random() - 0.5) * 0.4); // Slight rotation
      ctx.fillStyle = `rgba(${Math.random() * 100}, ${Math.random() * 100}, ${Math.random() * 100}, 0.8)`;
      ctx.fillText(char, -10, 0);
      ctx.restore();
    }

    onCaptchaChange(code);
  }, [onCaptchaChange]);

  useEffect(() => {
    generateCaptcha();
  }, [generateCaptcha]);

  return (
    <div className="flex items-center gap-3">
      <div className="relative border border-gray-200 rounded-xl overflow-hidden bg-gray-50 shadow-inner">
        <canvas 
          ref={canvasRef} 
          width={150} 
          height={48} 
          className="block"
        />
      </div>
      <button
        type="button"
        onClick={generateCaptcha}
        className="p-3 text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all border border-gray-100 hover:border-indigo-100 shadow-sm"
        title="Yangi kod"
      >
        <RotateCcw className="w-5 h-5" />
      </button>
    </div>
  );
};

export default Captcha;
