const videos = document.querySelectorAll("video");
const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

if (reducedMotion) {
  videos.forEach((video) => {
    video.autoplay = false;
    video.pause();
  });
} else if ("IntersectionObserver" in window) {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(({ isIntersecting, target }) => {
      if (isIntersecting) {
        target.play().catch(() => {});
      } else {
        target.pause();
      }
    });
  }, { threshold: 0.45 });

  videos.forEach((video) => observer.observe(video));
}
