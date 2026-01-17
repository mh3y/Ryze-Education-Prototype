self.onmessage = (event) => {
  const { canvas, devicePixelRatio } = event.data;
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  let stars = [];
  const STAR_COUNT = 2500;
  const STAR_COLOR_SPECTRUM = ["255, 255, 255", "255, 244, 214", "224, 224, 255", "255, 214, 214"];

  const resize = () => {
    canvas.width = self.innerWidth * devicePixelRatio;
    canvas.height = self.innerHeight * devicePixelRatio;
    stars = [];
    initStars();
  };

  const initStars = () => {
    for (let i = 0; i < STAR_COUNT; i++) {
      const size = (Math.random() ** 3) * 1.5 + 0.1;
      const baseOpacity = (Math.random() ** 3) * 0.8 + 0.1;
      stars.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        size: size,
        baseOpacity: baseOpacity,
        twinkleSpeed: Math.random() * 0.02,
        twinklePhase: Math.random() * Math.PI * 2,
        color: STAR_COLOR_SPECTRUM[Math.floor(Math.random() * STAR_COLOR_SPECTRUM.length)],
      });
    }
  };

  const animate = () => {
    if (!ctx) {
        return;
    }
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    stars.forEach(star => {
      star.twinklePhase += star.twinkleSpeed;
      const twinkle = Math.sin(star.twinklePhase) * 0.5 + 0.9;
      const currentOpacity = Math.min(1, star.baseOpacity * twinkle);
      
      if (star.size > 0.8) {
         ctx.beginPath();
         ctx.arc(star.x, star.y, star.size * 3, 0, Math.PI * 2);
         ctx.fillStyle = `rgba(${star.color}, ${currentOpacity * 0.15})`;
         ctx.fill();
      }

      ctx.beginPath();
      ctx.arc(star.x, star.y, star.size * 0.7, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${star.color}, ${currentOpacity})`;
      ctx.fill();
    });

    requestAnimationFrame(animate);
  };

  self.addEventListener('resize', resize);
  
  initStars();
  animate();
};
