const islandSlugs = [
  "linked-isles", "stack-queue-depths", "sorting-sands", "searching-peaks", "tree-of-secrets",
  "graphbound-kingdom", "recursion-realm", "stringwood-forest", "dynamic-programming-dimension",
];
const banks = islandSlugs.map(slug => require("./" + slug));
module.exports = { banks };
