import { buildings } from "./buildings.js";

export const format = (number, places = 2) => {
  if (number < 1000000) {
    return number.toLocaleString(undefined, {
      minimumFractionDigits: places,
      maximumFractionDigits: places,
    });
  }

  let suffixes = [
    "",
    "k",
    " million",
    " billion",
    " trillion",
    " quadrillion",
    " quintillion",
  ];

  let tier = (Math.log10(Math.abs(number)) / 3) | 0;

  if (tier == 0) return number;

  let suffix = suffixes[tier];
  let scale = Math.pow(10, tier * 3);

  let scaled = number / scale;

  return scaled.toFixed(3) + suffix;
};

export const formatSmall = (number) => {
  if (number < 1000) {
    return number.toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  }

  let suffixes = ["", "K", "M", "B", "t", "q", "Q"];

  let tier = (Math.log10(Math.abs(number)) / 3) | 0;

  if (tier == 0) return number;

  let suffix = suffixes[tier];
  let scale = Math.pow(10, tier * 3);

  let scaled = number / scale;

  return scaled.toFixed(2) + suffix;
};

export const getRate = (save) => {
  let rate = 0;

  for (let building of buildings) {
    rate += (save.ownedBuildings[building.id] ?? 0) * building.rate;
  }

  return rate;
};

export const dateString = (date) => {
  date = new Date(date);
  let units = {
    year: 24 * 60 * 60 * 1000 * 365,
    month: (24 * 60 * 60 * 1000 * 365) / 12,
    day: 24 * 60 * 60 * 1000,
    hour: 60 * 60 * 1000,
    minute: 60 * 1000,
    second: 1000,
  };

  let rtf = new Intl.RelativeTimeFormat("en", { numeric: "auto" });

  const getRelativeTime = (d1, d2 = new Date()) => {
    let elapsed = d1 - d2;

    // "Math.abs" accounts for both "past" & "future" scenarios
    for (let u in units)
      if (Math.abs(elapsed) > units[u] || u == "second")
        return rtf.format(Math.round(elapsed / units[u]), u);
  };

  return getRelativeTime(date) + ", " + date.toLocaleDateString();
};

export const checkEligibility = (save, upgrades) => {
  let eligible = [];
  for (let upgrade of upgrades) {
    if (!save.ownedUpgrades.includes(upgrade.id)) {
      if (upgrade.requirement.type == "clicks") {
        if (save.stats.timesClicked >= upgrade.requirement.value) {
          eligible.push(upgrade);
        }
      }
      if (upgrade.requirement.type == "clicked") {
        if (save.stats.hnsClicked >= upgrade.requirement.value) {
          eligible.push(upgrade);
        }
      }
    }
  }
  return eligible;
}