const corners = ["tl", "tr", "bl", "br"];

export function QuestFrame() {
  return <div className="pz-frame" aria-hidden="true">
    {corners.map(corner => <svg key={corner} className={"pz-corner pz-corner-"+corner} viewBox="0 0 96 96" fill="none">
      <path d="M3 94V28Q3 3 28 3H94M8 74V29Q8 8 29 8H75M16 60V33Q16 16 34 16H60M3 38Q26 37 37 15Q27 39 45 40Q52 41 54 35Q55 29 48 28Q42 28 44 35M38 3Q37 26 15 37Q39 27 40 45Q41 52 35 54Q29 55 28 48Q28 42 35 44M10 12Q24 12 23 24Q22 29 17 27M12 10Q12 24 24 23Q29 22 27 17M7 55q14 0 14 12q0 6-6 5m40-65q0 14 12 14q6 0 5-6" />
      <path d="M30 30l6-3 6 3-6 3zm-3 6 3-6 3 6-3 6zM64 9l4-4 4 4-4 4zM9 64l4 4-4 4-4-4z" />
    </svg>)}
  </div>;
}

export function QuestSeal({ className = "", elaborate = false }) {
  return <svg className={"pz-seal "+className} viewBox="0 0 120 120" fill="none" aria-hidden="true">
    <circle cx="60" cy="60" r="44"/><circle cx="60" cy="60" r="36"/><circle cx="60" cy="60" r="25" strokeDasharray="2 4"/>
    {elaborate && <><circle cx="60" cy="60" r="56" strokeDasharray="1.6 4"/><circle cx="60" cy="60" r="51"/><path d="M21 21l78 78m0-78-78 78M60 8v104M8 60h104"/></>}
    <path className="pz-seal-star" d="M60 10Q63 49 74 46Q71 57 110 60Q71 63 74 74Q63 71 60 110Q57 71 46 74Q49 63 10 60Q49 57 46 46Q57 49 60 10Z" />
    <path d="m60 33 7 20 20 7-20 7-7 20-7-20-20-7 20-7zM36 36l48 48m0-48L36 84"/>
    <circle cx="60" cy="60" r="4" className="pz-seal-center"/>
  </svg>;
}

export function QuestRibbon() {
  return <svg className="pz-ribbon-drawing" viewBox="0 0 680 108" preserveAspectRatio="none" aria-hidden="true">
    <path className="pz-ribbon-tail" d="M58 22 7 32 28 52 5 70l68 16 28-30m521-34 51 10-21 20 23 18-68 16-28-30"/>
    <path className="pz-ribbon-front" d="M63 15Q78 5 116 15Q340 37 564 15q38-10 53 0l-11 67q-12 12-42 6Q340 72 116 88q-30 6-42-6Z"/>
    <path className="pz-ribbon-detail" d="M71 20q25-4 46 1 223 22 446 0 21-5 46-1M79 77q20 8 39 4 222-15 444 0 19 4 39-4M63 15q19-4 23 7l5 60q-7-8-17 0m543-67q-19-4-23 7l-5 60q7-8 17 0M32 38l24-5m-18 10 20-4m-25 24 31 5m584-30-24-5m18 10-20-4m25 24-31 5"/>
    <path className="pz-ribbon-detail" d="m330 85 10-8 10 8-10 8z"/>
  </svg>;
}

export function QuestCandle() {
  return <svg className="pz-candle" viewBox="0 0 125 165" aria-hidden="true">
    <circle className="pz-candle-halo" cx="62" cy="39" r="36"/>
    <circle className="pz-candle-ring" cx="62" cy="39" r="27" fill="none"/>
    <path className="pz-candle-metal" d="M38 116q24 12 48 0l-10 12-7 3 3 15 20 8q-30 11-60 0l20-8 3-15-7-3Z"/>
    <ellipse className="pz-candle-metal" cx="62" cy="115" rx="29" ry="6"/>
    <path className="pz-candle-wax" d="M51 62q11-5 22 0l2 53q-13 6-26 0z"/>
    <path className="pz-candle-drip" d="M52 64q4 12 6 2l3 18q2 7 4 0V66q3 8 6-1M54 106v-14m15 17V96"/>
    <path className="pz-candle-wick" d="M62 62v-9"/>
    <path className="pz-candle-flame" d="M62 21c2 12 13 21 9 31-3 9-16 10-19 0-3-10 8-16 10-31Z"/>
    <path className="pz-candle-core" d="M62 41c5 8 6 15 0 16-6-1-4-8 0-16Z"/>
  </svg>;
}
