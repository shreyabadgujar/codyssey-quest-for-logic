import { Boxes, CodeXml, Fingerprint, Gem, Network, Route } from "lucide-react";

const insignias = {
  detective: Network,
  arrangement: Gem,
  cipher: Fingerprint,
  maze: Route,
  workshop: Boxes,
  code: CodeXml,
};

export function PuzzleInsignia({ mechanic }) {
  const Mark = insignias[mechanic];
  return <span className="pz-insignia" data-mechanic={mechanic} aria-hidden="true"><Mark strokeWidth={1.4}/></span>;
}
