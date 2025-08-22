document.getElementById('bsThemeSwitch').onchange = switchBootstrapTheme;

// cf. https://htmx.org/docs/#scripting or https://hypermedia.systems/client-side-scripting/#rsjs for more htmx-idiomatic approaches
function switchBootstrapTheme() {
  const html = document.documentElement;
  const currentTheme = html.getAttribute("data-bs-theme");
  html.setAttribute(
    "data-bs-theme",
    currentTheme === "light" ? "dark" : "light"
  );
}
