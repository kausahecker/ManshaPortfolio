// --- VERSION 16 LOADED ---
console.log("--- VERSION 16 LOADED ---");

// Existing Project Routing
const projectRoutes = {
    "#1": "canvory-patisserie.html",
    "#2": "skin-cycles.html",
    "#3": "sunday-soul-sante.html",
    "#4": "ttdeye.html"
};

document.querySelectorAll(".project_row").forEach((row) => {
    row.addEventListener("click", () => {
        let nImg = row.querySelector(".project_num img");
        if (nImg && projectRoutes[nImg.alt.trim()]) {
            window.location.href = projectRoutes[nImg.alt.trim()];
        }
    });
});

document.querySelectorAll('.project_row').forEach(row => {
    const preview = row.querySelector('.project_preview');
    if (!preview) return;

    row.addEventListener('mousemove', (e) => {
        preview.style.left = (e.clientX - 20) + 'px';
        preview.style.top  = (e.clientY - 20) + 'px';
    });
});

// GSAP Scroll Animation
gsap.registerPlugin(ScrollTrigger);

let tl;

// USER: Perfect these RATIOS (0 to 1) relative to the hand images
// 0.0 is the leftmost edge of the image, 1.0 is the rightmost.
const fingerRatios = [
    { leftHand: 0.46, rightHand: 0.55 }, // String 0 (Top)
    { leftHand: 0.02, rightHand: 0.99 }, // String 1
    { leftHand: 0.47, rightHand: 0.54 }, // String 2
    { leftHand: 0.60, rightHand: 0.39 }, // String 3
    { leftHand: 0.40, rightHand: 0.60 }  // String 4 (Bottom)
];

function getSVGX(handSelector, ratio) {
    const hand = document.querySelector(handSelector);
    const svg = document.querySelector('#threads-svg');
    if (!hand || !svg) return 0;

    const handRect = hand.getBoundingClientRect();
    const svgRect = svg.getBoundingClientRect();

    // Global X of the point
    const globalX = handRect.left + (handRect.width * ratio);

    // Convert to SVG viewBox units (0 to 1719)
    const relativeX = (globalX - svgRect.left) / svgRect.width;
    return relativeX * 1719;
}

function generateMessyPath(y, i, startX, endX) {
    const centerX = 1719 / 2;
    const start = `M ${startX} ${y}`;
    const c1 = `C ${centerX + (Math.random() - 0.5) * 400} ${Math.random() * 443} ${centerX + (Math.random() - 0.5) * 400} ${Math.random() * 443} ${centerX} ${221}`;
    const c2 = `S ${centerX + (Math.random() - 0.5) * 400} ${Math.random() * 443} ${endX} ${y}`;
    return `${start} ${c1} ${c2}`;
}

function generateStraightPath(y, i, startX, endX) {
    const midX = (startX + endX) / 2;
    return `M ${startX} ${y} C ${startX + 300} ${y} ${endX - 300} ${y} ${midX} ${y} S ${endX - 200} ${y} ${endX} ${y}`;
}

function initAnimation() {
    if (tl) tl.kill();

    // Reset hands and content for measurement
    gsap.set(".hand-left, .hand-right, .home-content", { clearProps: "all" });

    // 1. Calculate CLOSED state coordinates (Initial)
    const yCoords = [0, 110.75, 221.5, 332.25, 443];
    const closedPoints = fingerRatios.map((r, i) => ({
        start: getSVGX('.hand-left', r.leftHand),
        end: getSVGX('.hand-right', r.rightHand)
    }));

    // 2. Temporarily move hands to OPEN state for measurement
    gsap.set(".hand-left", { left: "10%", marginLeft: "0px", transform: "translateX(0%)" });
    gsap.set(".hand-right", { right: "10%", marginRight: "0px", transform: "translateX(0%)" });

    const openPoints = fingerRatios.map((r, i) => ({
        start: getSVGX('.hand-left', r.leftHand),
        end: getSVGX('.hand-right', r.rightHand)
    }));

    // 3. Revert hands to closed for the animation start
    gsap.set(".hand-left, .hand-right", { clearProps: "all" });

    // 4. Build Timeline
    tl = gsap.timeline({
        scrollTrigger: {
            trigger: ".scroll-wrapper",
            start: "top top",
            end: "bottom bottom",
            scrub: 1,
            invalidateOnRefresh: true
        }
    });

    // Fade out hero
    tl.to(".hero-text, .hero-logo", { opacity: 0, duration: 1 }, 0);

    // Initial Paths
    const threadPaths = document.querySelectorAll(".thread-path");
    threadPaths.forEach((path, i) => {
        const d_closed = generateMessyPath(yCoords[i], i, closedPoints[i].start, closedPoints[i].end);
        const d_open = generateStraightPath(yCoords[i], i, openPoints[i].start, openPoints[i].end);

        path.setAttribute("d", d_closed);
        tl.to(path, { attr: { d: d_open }, duration: 4, ease: "power1.inOut" }, 0);
    });

    // Move Hands
    tl.to(".hand-left", { left: "10%", marginLeft: "0px", transform: "translateX(0%)", duration: 4, ease: "power1.inOut" }, 0);
    tl.to(".hand-right", { right: "10%", marginRight: "0px", transform: "translateX(0%)", duration: 4, ease: "power1.inOut" }, 0);

    // Fade in Home Content
    tl.to(".home-content", {
        opacity: 1,
        duration: 2,
        ease: "power2.inOut",
        onStart: () => { document.querySelector(".home-content").style.visibility = "visible"; },
        onComplete: () => { document.querySelector(".home-content").style.pointerEvents = "auto"; },
        onReverseComplete: () => { document.querySelector(".home-content").style.pointerEvents = "none"; }
    }, 2);
}

// Wait for images to load before measuring
window.addEventListener('load', initAnimation);
window.addEventListener('resize', initAnimation);
