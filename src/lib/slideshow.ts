/**
 * Slideshow generator — produces self-contained HTML with CSS transitions.
 * No external dependencies.
 */

export type MusicTrack = {
  id: string;
  name: string;
  category: "romantic" | "upbeat" | "adventure" | "chill" | "celebration";
  bpm: number;
};

export const MUSIC_TRACKS: MusicTrack[] = [
  { id: "romantic_1", name: "Sunset Dreams", category: "romantic", bpm: 72 },
  { id: "romantic_2", name: "Gentle Waves", category: "romantic", bpm: 68 },
  { id: "romantic_3", name: "Love Letters", category: "romantic", bpm: 76 },
  { id: "romantic_4", name: "Starlit Dance", category: "romantic", bpm: 70 },
  { id: "upbeat_1", name: "Summer Vibes", category: "upbeat", bpm: 120 },
  { id: "upbeat_2", name: "Beach Party", category: "upbeat", bpm: 128 },
  { id: "upbeat_3", name: "Island Hop", category: "upbeat", bpm: 118 },
  { id: "upbeat_4", name: "Tropical Groove", category: "upbeat", bpm: 125 },
  { id: "adventure_1", name: "Wild Explorer", category: "adventure", bpm: 110 },
  { id: "adventure_2", name: "Mountain Peak", category: "adventure", bpm: 105 },
  { id: "adventure_3", name: "Ocean Dive", category: "adventure", bpm: 115 },
  { id: "adventure_4", name: "Desert Wind", category: "adventure", bpm: 100 },
  { id: "chill_1", name: "Lazy Afternoon", category: "chill", bpm: 85 },
  { id: "chill_2", name: "Palm Shade", category: "chill", bpm: 80 },
  { id: "chill_3", name: "Cool Breeze", category: "chill", bpm: 90 },
  { id: "chill_4", name: "Hammock Time", category: "chill", bpm: 78 },
  { id: "celebration_1", name: "Confetti Rain", category: "celebration", bpm: 130 },
  { id: "celebration_2", name: "Toast to Us", category: "celebration", bpm: 125 },
  { id: "celebration_3", name: "Fireworks", category: "celebration", bpm: 135 },
  { id: "celebration_4", name: "Golden Hour", category: "celebration", bpm: 120 },
];

export function getTrackById(id: string): MusicTrack | undefined {
  return MUSIC_TRACKS.find((t) => t.id === id);
}

export function getTracksByCategory(category: string): MusicTrack[] {
  return MUSIC_TRACKS.filter((t) => t.category === category);
}

const CATEGORIES = ["romantic", "upbeat", "adventure", "chill", "celebration"] as const;
export { CATEGORIES as MUSIC_CATEGORIES };

/**
 * Generates a self-contained HTML slideshow with CSS transitions, a title
 * overlay, progress bar, and simple Web Audio API ambient tones.
 */
export function generateSlideshowHtml(
  photoUrls: string[],
  musicTrackId: string,
  duration: 30 | 60 | 90,
  title?: string,
): string {
  const track = getTrackById(musicTrackId);
  const trackName = track?.name ?? "Slideshow";
  const bpm = track?.bpm ?? 100;
  const count = photoUrls.length;
  const slideTime = (duration * 1000) / count; // ms per slide
  const fadeDuration = Math.min(800, slideTime * 0.3);
  const displayTitle = title || "Your Memories";

  // Transition styles based on category mood
  const category = track?.category ?? "chill";
  const transitionMap: Record<string, string> = {
    romantic: "opacity",
    upbeat: "transform, opacity",
    adventure: "transform, opacity",
    chill: "opacity",
    celebration: "transform, opacity",
  };
  const transitionProp = transitionMap[category] || "opacity";

  // Build photo divs
  const photoDivs = photoUrls
    .map(
      (url, i) =>
        `<div class="slide" id="s${i}" style="background-image:url('${url}')"></div>`,
    )
    .join("\n");

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1"/>
<title>${displayTitle} — Fotiqo</title>
<style>
*{margin:0;padding:0;box-sizing:border-box}
body{background:#111;overflow:hidden;font-family:'Segoe UI',system-ui,sans-serif}
.slide{position:absolute;inset:0;background-size:cover;background-position:center;
  opacity:0;transition:${transitionProp} ${fadeDuration}ms ease-in-out;
  ${category === "upbeat" ? "transform:scale(1.05);" : ""}
  ${category === "adventure" ? "transform:translateX(20px);" : ""}
  ${category === "celebration" ? "transform:scale(0.95) rotate(1deg);" : ""}
}
.slide.active{opacity:1;
  ${category === "upbeat" ? "transform:scale(1);" : ""}
  ${category === "adventure" ? "transform:translateX(0);" : ""}
  ${category === "celebration" ? "transform:scale(1) rotate(0deg);" : ""}
}
.overlay{position:fixed;top:0;left:0;right:0;padding:32px 24px;
  background:linear-gradient(to bottom,rgba(0,0,0,0.6),transparent);
  z-index:10;text-align:center;pointer-events:none}
.title{color:#fff;font-size:28px;font-weight:700;letter-spacing:0.5px;
  text-shadow:0 2px 8px rgba(0,0,0,0.5)}
.subtitle{color:rgba(255,255,255,0.7);font-size:14px;margin-top:6px}
.progress-wrap{position:fixed;bottom:0;left:0;right:0;height:4px;
  background:rgba(255,255,255,0.15);z-index:10}
.progress-bar{height:100%;background:linear-gradient(90deg,#e07a5f,#f2cc8f);
  width:0%;transition:width 0.3s linear}
.watermark{position:fixed;bottom:16px;right:16px;color:rgba(255,255,255,0.35);
  font-size:12px;z-index:10;letter-spacing:1px}
.counter{position:fixed;bottom:16px;left:16px;color:rgba(255,255,255,0.5);
  font-size:13px;z-index:10}
.play-btn{position:fixed;inset:0;display:flex;align-items:center;justify-content:center;
  z-index:20;background:rgba(0,0,0,0.5);cursor:pointer}
.play-btn span{width:80px;height:80px;border-radius:50%;background:rgba(255,255,255,0.15);
  backdrop-filter:blur(8px);display:flex;align-items:center;justify-content:center;
  border:2px solid rgba(255,255,255,0.3)}
.play-btn span::after{content:'';display:block;width:0;height:0;
  border-left:24px solid #fff;border-top:14px solid transparent;
  border-bottom:14px solid transparent;margin-left:4px}
.play-btn.hidden{display:none}
</style>
</head>
<body>
${photoDivs}

<div class="overlay">
  <div class="title">${displayTitle}</div>
  <div class="subtitle">${trackName} &middot; ${duration}s</div>
</div>

<div class="progress-wrap"><div class="progress-bar" id="prog"></div></div>
<div class="counter" id="counter">1 / ${count}</div>
<div class="watermark">Fotiqo</div>

<div class="play-btn" id="playBtn"><span></span></div>

<script>
(function(){
  var slides=document.querySelectorAll('.slide');
  var prog=document.getElementById('prog');
  var counter=document.getElementById('counter');
  var playBtn=document.getElementById('playBtn');
  var total=${count};
  var dur=${duration*1000};
  var interval=${Math.round(slideTime)};
  var current=0;
  var startTime=0;
  var timer=null;
  var raf=null;

  function show(i){
    slides.forEach(function(s){s.classList.remove('active')});
    slides[i].classList.add('active');
    counter.textContent=(i+1)+' / '+total;
  }

  function updateProgress(){
    var elapsed=Date.now()-startTime;
    var pct=Math.min(100,elapsed/dur*100);
    prog.style.width=pct+'%';
    if(elapsed<dur) raf=requestAnimationFrame(updateProgress);
  }

  function advance(){
    current++;
    if(current>=total){
      clearInterval(timer);
      cancelAnimationFrame(raf);
      prog.style.width='100%';
      return;
    }
    show(current);
  }

  /* Simple Web Audio ambient tone generator */
  function playTone(){
    try{
      var ctx=new(window.AudioContext||window.webkitAudioContext)();
      var bpm=${bpm};
      var noteInterval=60/bpm;
      var cat='${category}';
      var freqs={romantic:[261,329,392],upbeat:[329,392,523],
        adventure:[220,329,440],chill:[196,261,329],
        celebration:[392,523,659]};
      var notes=freqs[cat]||freqs.chill;
      var totalDur=${duration};
      for(var t=0;t<totalDur;t+=noteInterval){
        var osc=ctx.createOscillator();
        var gain=ctx.createGain();
        osc.type=cat==='upbeat'||cat==='celebration'?'square':'sine';
        osc.frequency.value=notes[Math.floor(Math.random()*notes.length)];
        gain.gain.setValueAtTime(0,ctx.currentTime+t);
        gain.gain.linearRampToValueAtTime(0.06,ctx.currentTime+t+0.05);
        gain.gain.linearRampToValueAtTime(0,ctx.currentTime+t+noteInterval*0.8);
        osc.connect(gain);gain.connect(ctx.destination);
        osc.start(ctx.currentTime+t);
        osc.stop(ctx.currentTime+t+noteInterval);
      }
    }catch(e){}
  }

  show(0);

  playBtn.addEventListener('click',function(){
    playBtn.classList.add('hidden');
    startTime=Date.now();
    playTone();
    timer=setInterval(advance,interval);
    updateProgress();
  });
})();
</script>
</body>
</html>`;
}
