const mechanics = ["detective", "arrangement", "cipher", "maze", "workshop", "code"];
module.exports = mechanics.flatMap(mechanic => require("./" + mechanic));
