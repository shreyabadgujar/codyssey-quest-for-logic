// Temporary page body for unimplemented routes. Remove usage as pages get built.
export default function PageStub({ title, note }) {
  return (
    <section className="folio">
      <h1 className="text-3xl">{title}</h1>
      <hr className="rule-ornate" />
      <p className="annotation">{note || "TODO: not yet implemented."}</p>
    </section>
  );
}
