var palette = {
  colors: {
    darkblue:  "#133059",
    maroon:    "#733122",
    green:     "#509B70",
    slate:     "#7491B1",
    darkorange:"#C87448",
    red:       "#A9373C",
    aqua:      "#96C2C5",
    darkgreen: "#407145",
    yellow:    "#EAD7A1",
    olive:     "#959280",
    /*  old colors */
    darkteal:  "#004e5f",
    raspberry: "#7c406f",
    /* green:     "#5d956f", */
    paleblue:  "#9ab8cb",
    blue:      "#4871bf",
    orange:    "#cb6158",
    lightpink: "#c7a7b4",
    /* darkblue:  "#073570", */
    darkpink:  "#ab4e66",
    lavender:  "#7f85a9",
    /* yellow:    "#ccb479", */
    purple:    "#594176",
    lightblue: "#5a99b7",
    lightgreen:"#97b386",
    /* red:       "#802f3e", */
    teal:      "#00827f",
    lightbg:   "#B8D4D3",
    tan:       "#D4896C"

  }
};
palette.categoryColors = {
  "American Priors":              "var(--priors-darkblue)",
  "Toward Independence":          "var(--independence-maroon)",
  "Constituting America":         "var(--constituting-green)",
  "Forging these United States":  "var(--forging-slate)",
  "The Coming of the Civil War":  "var(--coming-war-orange)",
  "Civil War and Reconstruction": "var(--civil-war-red)",
  "Commentary":         "var(--commentary-blue)",
  "Tanakh" :            "var(--tanakh-teal)",
  "Midrash":            "var(--midrash-green)",
  "Mishnah":            "var(--mishnah-blue)",
  "Talmud":             "var(--talmud-gold)",
  "Halakhah":           "var(--halakhah-red)",
  "Kabbalah":           "var(--kabbalah-purple)",
  "Jewish Thought":     "var(--philosophy-purple)",
  "Liturgy":            "var(--liturgy-rose)",
  "Tosefta":            "var(--taanitic-green)",
  "Chasidut":           "var(--chasidut-green)",
  "Musar":              "var(--mussar-purple)",
  "Responsa":           "var(--responsa-red)",
  "Second Temple":      "var(--apocrypha-pink)",
  "Quoting Commentary": "var(--responsa-red)",
  "Sheets":             "var(--sefaria-blue)",
  "Sheet":              "var(--sefaria-blue)",
  "Targum":             "var(--miscelaneous-green)",
  "Modern Commentary":  "var(--modern-works-blue)",
  "Reference":          "var(--reference-orange)",
  "System":             "var(--sefaria-blue)",
  "Static":             "linear-gradient(90deg, #00505E 0% 10%, #5698B4 10% 20%, #CCB37C 20% 30%, #5B9370 30% 40%, #823241 40% 50%, #5A4474 50% 60%, #AD4F66 60% 70%, #7285A6 70% 80%, #00807E 80% 90%, #4872B3 90% 100%)"
};
palette.categoryColor = function(cat) {
  if (cat in palette.categoryColors) {
    return palette.categoryColors[cat];
  }

  // For unknown categories, map the string a color (random, but stable)
  const colors = Object.values(palette.colors);
  let idx = 0;
  cat = typeof cat == "string" ? cat : "";
  cat.split("").map(letter => {idx += letter.charCodeAt(0);});
  idx = idx % colors.length;

  return colors[idx];
};

export default palette;
