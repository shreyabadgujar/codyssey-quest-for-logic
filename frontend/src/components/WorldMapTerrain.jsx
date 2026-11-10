import { getIslandArtwork, ISLANDS } from "../data/islands.js";
import { CHART_HEIGHT, CHART_WIDTH, STARTING_BERTH, WORLD_MAP_LAYOUT, WORLD_MAP_ROUTES } from "../data/worldMapLayout.js";

const soundings = [
  [384, 114, 42], [872, 183, 63], [1328, 103, 24], [1353, 285, 18],
  [417, 360, 32], [826, 267, 48], [1052, 302, 29], [384, 576, 58],
  [1091, 558, 52], [774, 575, 78], [832, 692, 51], [434, 773, 34],
  [79, 604, 16], [310, 604, 22], [1344, 653, 39], [874, 837, 31],
];

const currentLines = [
  "M-14 302C131 256 224 306 364 272S535 205 713 252 935 297 1077 253 1296 189 1469 219",
  "M-22 313C119 275 237 315 374 281S541 224 708 268 928 313 1081 267 1290 200 1468 232",
  "M-27 325C129 298 231 326 382 293S542 239 707 285 927 327 1089 279 1297 216 1467 245",
  "M-15 574C146 557 254 590 402 617S634 607 807 611 1060 579 1220 613 1401 603 1454 586",
  "M-10 589C158 570 269 604 402 628S638 620 810 626 1063 595 1220 626 1414 617 1462 597",
  "M-12 605C156 587 272 618 410 640S647 634 808 640 1055 612 1225 637 1418 630 1458 611",
  "M373 928C443 880 431 814 428 754S447 654 490 635",
  "M389 931C460 887 447 817 445 752S464 670 496 642",
  "M1296 921C1279 856 1297 773 1331 743S1409 698 1447 701",
  "M1312 922C1294 857 1312 790 1340 756S1413 716 1447 718",
];

function islandCenter(id) {
  const { origin: [x, y], scale } = WORLD_MAP_LAYOUT[id];
  return [x + 150 * scale, y + 124 * scale];
}

function ChartCompass() {
  return <g transform="translate(820 96)" className="wm-chart-compass">
    <circle r="59" /><circle r="50" strokeDasharray="1 5" /><circle r="40" />
    <path d="M0-50V50M-50 0H50M-36-36l72 72m0-72-72 72" />
    {[0, 45, 90, 135, 180, 225, 270, 315].map((angle, index) => <g key={angle} transform={`rotate(${angle}) scale(${index % 2 ? .65 : 1})`}>
      <path d="M0-48L-8-8 0 0 8-8Z" className="wm-compass-needle" />
      <path d="M0-48V0L8-8Z" className="wm-compass-shadow" />
    </g>)}
    <circle r="5" className="wm-compass-needle" />
    <text y="-68">N</text><text x="69" y="4">E</text><text y="78">S</text><text x="-69" y="4">W</text>
  </g>;
}

function Berth({ position: [x, y], start = false }) {
  return <g transform={`translate(${x} ${y})`} className="wm-berth" data-start={start}>
    <ellipse rx={start ? 30 : 14} ry={start ? 11 : 6} />
    <path d={start ? "M-31-7L-22 2 15 2 21-5-21-5Z M-21-8V5M-10-7V5M1-7V5M12-7V5" : "M-14-5L-7 1 11 1 13-4-10-4Z M-8-6V3M0-6V3M8-6V3"} />
  </g>;
}

export default function WorldMapTerrain({ selectedIslandId }) {
  return <svg className="wm-terrain" viewBox={`0 0 ${CHART_WIDTH} ${CHART_HEIGHT}`} aria-hidden="true">
    <defs>
      <linearGradient id="wm-depth" x1="0" x2=".94" y1="0" y2="1" gradientUnits="objectBoundingBox">
        <stop className="wm-depth-light" /><stop offset=".48" className="wm-depth-middle" /><stop offset="1" className="wm-depth-dark" />
      </linearGradient>
      <radialGradient id="wm-sea-light" cx=".32" cy=".23" r=".72">
        <stop className="wm-sea-light" /><stop offset="1" className="wm-sea-clear" />
      </radialGradient>
      <pattern id="wm-waves" width="126" height="96" patternUnits="userSpaceOnUse">
        <path d="M11 15q5-3 10 0t10 0m-16 5q5-3 10 0m50 40q6-4 12 0t12 0m-19 6q6-3 12 0m24-31 5-1M44 79l7-1" />
      </pattern>
      <pattern id="wm-grid" width="116" height="116" patternUnits="userSpaceOnUse">
        <path d="M0 116V0H116M55 0h6M0 55v6" />
      </pattern>
      {Object.entries(WORLD_MAP_LAYOUT).map(([id, { coast }]) => <g key={id}>
        <path id={`wm-coast-${id}`} d={coast} />
        <clipPath id={`wm-shape-${id}`}><use href={`#wm-coast-${id}`} /></clipPath>
      </g>)}
    </defs>

    <rect width="1440" height="920" fill="url(#wm-depth)" />
    <image href="/assets/accessories/wardrobe/ocean-mystery.webp" width="1440" height="920" preserveAspectRatio="xMidYMid slice" className="wm-sea-paint" />
    <rect width="1440" height="920" fill="url(#wm-sea-light)" />
    <rect width="1440" height="920" fill="url(#wm-grid)" />
    <rect width="1440" height="920" fill="url(#wm-waves)" />
    <g className="wm-currents">{currentLines.map(line => <path key={line} d={line} />)}</g>
    <g className="wm-chart-border">
      <path d="M15 36 36 15H1404l21 21v848l-21 21H36l-21-21Z" />
      <path d="M22 39 39 22H1401l17 17v842l-17 17H39l-17-17Z" />
      <path d="M59 15h84m91 0h84m91 0h84m91 0h84m91 0h84m91 0h84m91 0h84m91 0h84M59 905h84m91 0h84m91 0h84m91 0h84m91 0h84m91 0h84m91 0h84m91 0h84" />
    </g>
    <g className="wm-soundings">{soundings.map(([x, y, depth]) => <text key={`${x}:${y}`} x={x} y={y}>{depth}</text>)}</g>
    <ChartCompass />
    <g className="wm-sea-script">
      <text x="220" y="58">THE WESTERN REACH</text>
      <text x="201" y="608">The Saffron Current</text>
      <text x="819" y="752" transform="rotate(-11 819 752)">The Lantern Strait</text>
      <text x="1161" y="591">Sea of Turning Tides</text>
    </g>
    <g className="wm-sailing-ship" transform="translate(405 448)">
      <path d="M-25 12q15 9 35 6m-29 5q16 8 39-1m-46-16q19 9 46-1" />
      <path d="M-22 0Q0 5 26-4L15 12-10 13Z M1 2v-40m1 2 14 4-14 5m-3-1Q-5-15-16-3l16-3m4-18 13 19L4-3" />
    </g>
    <g className="wm-routes">
      {WORLD_MAP_ROUTES.map(([from, to]) => {
        const [x1, y1] = islandCenter(from);
        const [x2, y2] = islandCenter(to);
        const viaLanternStrait = from === "graphbound-kingdom" && to === "searching-peaks";
        const cx = viaLanternStrait ? 1028 : (x1 + x2) / 2 + (y1 - y2) * .22;
        const cy = (y1 + y2) / 2 + (x2 - x1) * .16;
        const d = `M${x1} ${y1}Q${cx} ${cy} ${x2} ${y2}`;
        return <g key={`${from}:${to}`} data-route={`${from}:${to}`} data-active={selectedIslandId === from || selectedIslandId === to}>
          <path d={d} className="wm-route-engraving" />
          <path d={d} className="wm-route-gold" />
        </g>;
      })}
    </g>
    {ISLANDS.map(({ id }) => {
      const { origin: [x, y], scale, berth } = WORLD_MAP_LAYOUT[id];
      const coast = `#wm-coast-${id}`;
      return <g key={id} className="wm-land" data-land={id}>
        <g transform={`translate(${x} ${y}) scale(${scale})`}>
          <use href={coast} className="wm-coast-deep" transform="translate(0 8)" />
          <use href={coast} className="wm-coast-shelf" transform="translate(0 4)" />
          <use href={coast} className="wm-coast-foam" />
          <image href={getIslandArtwork(id).illustration} width="300" height="206" clipPath={`url(#wm-shape-${id})`} />
          <use href={coast} className="wm-coast-line" />
        </g>
        <Berth position={berth} />
      </g>;
    })}
    <Berth position={STARTING_BERTH} start />
    <text className="wm-start-label" x={STARTING_BERTH[0]} y={STARTING_BERTH[1] + 23}>First Landing</text>
  </svg>;
}
