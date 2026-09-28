window.addEventListener("load", () => {
  const butterfliesRoot = document.querySelector(".butterflies");

  const landingProfiles = [
    {
      className: "butterfly--1",
      flower: ".flower__leafs--1",
      entry: { x: -76, y: 45, scale: 0.82, rotate: -24 },
      scale: 0.52,
      rotate: 5,
    },
    {
      className: "butterfly--2",
      flower: ".flower__leafs--2",
      entry: { x: 68, y: 36, scale: 0.78, rotate: 24 },
      scale: 0.48,
      rotate: -5,
    },
    {
      className: "butterfly--3",
      flower: ".flower__leafs--3",
      entry: { x: -44, y: -32, scale: 0.72, rotate: -12 },
      scale: 0.44,
      rotate: 10,
    },
  ];

  const vmin = () => Math.min(window.innerWidth, window.innerHeight) / 100;
  const ease = (value) => (1 - Math.cos(Math.PI * value)) / 2;
  const lerp = (start, end, progress) => start + (end - start) * progress;

  const readTransform = (butterfly) => {
    const transform = getComputedStyle(butterfly).transform;

    if (!transform || transform === "none") {
      return { x: 0, y: 0, scale: 0.55, rotate: 0 };
    }

    const matrix = new DOMMatrixReadOnly(transform);

    return {
      x: matrix.m41,
      y: matrix.m42,
      scale: Math.hypot(matrix.a, matrix.b) || 0.55,
      rotate: Math.atan2(matrix.b, matrix.a) * (180 / Math.PI),
    };
  };

  const landingTransform = (butterfly, profile) => {
    const flower = document.querySelector(profile.flower);
    const nectar = flower?.querySelector(".flower__white-circle");

    if (!butterfliesRoot || !nectar) {
      return null;
    }

    const rootRect = butterfliesRoot.getBoundingClientRect();
    const nectarRect = nectar.getBoundingClientRect();
    const butterflyHeight = butterfly.offsetHeight;
    const unit = vmin();
    const nectarX = nectarRect.left + nectarRect.width * 0.5;
    const nectarY = nectarRect.top + nectarRect.height * 0.45;
    const probeX = 6 * unit * profile.scale;
    const probeY = 4.25 * unit * profile.scale;

    return {
      x: nectarX - probeX - rootRect.left,
      y: nectarY - probeY - (rootRect.top - butterflyHeight),
    };
  };

  const attachToFlower = (butterfly, profile) => {
    const flower = document.querySelector(profile.flower);

    if (!flower) {
      return;
    }

    butterfly.classList.remove("is-landing");
    butterfly.classList.add("is-landed");
    flower.appendChild(butterfly);
    butterfly.style.removeProperty("transform");
  };

  const landButterfly = (butterfly, profile) => {
    const start = readTransform(butterfly);
    const startedAt = performance.now();
    const duration = 12000;
    const phase = landingProfiles.indexOf(profile) * 1.4;

    butterfly.style.transform = `translate(${start.x}px, ${start.y}px) scale(${start.scale}) rotate(${start.rotate}deg)`;
    butterfly.classList.add("is-landing");

    const move = (now) => {
      const rawProgress = Math.min((now - startedAt) / duration, 1);
      const progress = ease(rawProgress);
      const target = landingTransform(butterfly, profile);

      if (!target) {
        return;
      }

      const unit = vmin();
      const flutter = 1 - progress;
      const x =
        lerp(start.x, target.x, progress) +
        Math.sin(rawProgress * Math.PI * 3 + phase) * unit * 0.8 * flutter;
      const y =
        lerp(start.y, target.y, progress) -
        Math.sin(rawProgress * Math.PI) * unit * 4 * flutter +
        Math.cos(rawProgress * Math.PI * 3 + phase) * unit * 0.6 * flutter;
      const scale = lerp(start.scale, profile.scale, progress);
      const rotate =
        lerp(start.rotate, profile.rotate, progress) +
        Math.sin(rawProgress * Math.PI * 3 + phase) * 7 * flutter;

      butterfly.style.transform = `translate(${x}px, ${y}px) scale(${scale}) rotate(${rotate}deg)`;

      if (rawProgress < 1) {
        requestAnimationFrame(move);
        return;
      }

      attachToFlower(butterfly, profile);
    };

    requestAnimationFrame(move);
  };

  const startLandingSequence = () => {
    landingProfiles.forEach((profile, index) => {
      const butterfly = document.querySelector(`.${profile.className}`);

      if (!butterfly || butterfly.classList.contains("is-landed")) {
        return;
      }

      setTimeout(() => landButterfly(butterfly, profile), index * 1000);
    });
  };

  const c = setTimeout(() => {
    document.body.classList.remove("not-loaded");
    clearTimeout(c);
    setTimeout(startLandingSequence, 6200);
  }, 1000);
});
