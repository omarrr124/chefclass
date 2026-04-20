import { useEffect, useRef } from 'react';

export default function CursorTrail() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    let mouseMoved = false;
    let animationFrameId;
    
    const pointer = {
      x: 0.5 * window.innerWidth,
      y: 0.5 * window.innerHeight,
    };
    
    const params = {
      pointsNumber: 15,
      widthFactor: 0.15,
      mouseThreshold: 0.6,
      spring: 0.4,
      friction: 0.5,
    };
    
    let isHovering = false;
    const defaultColor = [212, 175, 55]; // #D4AF37
    const hoverColor = [255, 255, 255]; // #FFFFFF
    let currentColor = [...defaultColor];
    
    const trail = new Array(params.pointsNumber);
    for (let i = 0; i < params.pointsNumber; i++) {
      trail[i] = { x: pointer.x, y: pointer.y, dx: 0, dy: 0 };
    }

    const updateMousePosition = (eX, eY) => {
      pointer.x = eX;
      pointer.y = eY;
    };

    const handleMouseMove = (e) => {
      mouseMoved = true;
      updateMousePosition(e.clientX, e.clientY);
    };
    
    const handleTouchMove = (e) => {
      mouseMoved = true;
      updateMousePosition(e.targetTouches[0].clientX, e.targetTouches[0].clientY);
    };

    const handleClick = (e) => {
      updateMousePosition(e.clientX, e.clientY);
    };

    const handleMouseOver = (e) => {
      if (e.target.closest('a, button, input, [role="button"], .cursor-pointer, canvas')) {
        isHovering = true;
      }
    };

    const handleMouseOut = (e) => {
      if (e.target.closest('a, button, input, [role="button"], .cursor-pointer, canvas')) {
        isHovering = false;
      }
    };

    window.addEventListener("click", handleClick);
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("touchmove", handleTouchMove, { passive: true });
    window.addEventListener("mouseover", handleMouseOver);
    window.addEventListener("mouseout", handleMouseOut);

    const setupCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    window.addEventListener("resize", setupCanvas);
    setupCanvas();

    const update = (t) => {
      if (!mouseMoved) {
        pointer.x = (0.5 + 0.3 * Math.cos(0.002 * t) * (Math.sin(0.005 * t))) * window.innerWidth;
        pointer.y = (0.5 + 0.2 * Math.cos(0.005 * t) + 0.1 * Math.cos(0.01 * t)) * window.innerHeight;
      }

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      const targetWidth = isHovering ? 0.35 : 0.15;
      params.widthFactor += (targetWidth - params.widthFactor) * 0.15;

      const targetRgb = isHovering ? hoverColor : defaultColor;
      currentColor[0] += (targetRgb[0] - currentColor[0]) * 0.15;
      currentColor[1] += (targetRgb[1] - currentColor[1]) * 0.15;
      currentColor[2] += (targetRgb[2] - currentColor[2]) * 0.15;
      
      ctx.strokeStyle = `rgb(${currentColor[0]}, ${currentColor[1]}, ${currentColor[2]})`;
      
      // Fitting color: baker's primary theme color
      // ctx.strokeStyle = '#D4AF37';  
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';

      trail.forEach((p, pIdx) => {
        const prev = pIdx === 0 ? pointer : trail[pIdx - 1];
        const spring = pIdx === 0 ? 0.4 * params.spring : params.spring;
        
        p.dx += (prev.x - p.x) * spring;
        p.dy += (prev.y - p.y) * spring;
        p.dx *= params.friction;
        p.dy *= params.friction;
        
        p.x += p.dx;
        p.y += p.dy;
      });

      ctx.beginPath();
      ctx.moveTo(trail[0].x, trail[0].y);
      for (let i = 1; i < trail.length - 1; i++) {
        const xc = 0.5 * (trail[i].x + trail[i + 1].x);
        const yc = 0.5 * (trail[i].y + trail[i + 1].y);
        ctx.quadraticCurveTo(trail[i].x, trail[i].y, xc, yc);
        ctx.lineWidth = params.widthFactor * (params.pointsNumber - i);
        ctx.stroke();
      }
      ctx.lineTo(trail[trail.length - 1].x, trail[trail.length - 1].y);
      ctx.stroke();

      animationFrameId = window.requestAnimationFrame(update);
    };

    update(0);

    return () => {
      window.removeEventListener("click", handleClick);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("touchmove", handleTouchMove);
      window.removeEventListener("mouseover", handleMouseOver);
      window.removeEventListener("mouseout", handleMouseOut);
      window.removeEventListener("resize", setupCanvas);
      window.cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        pointerEvents: 'none',
        zIndex: 9999,
      }}
    />
  );
}
