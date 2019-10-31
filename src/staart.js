if (
  (window.matchMedia("(prefers-color-scheme: dark)") ||
    localStorage.getItem("theme") === "dark") &&
  localStorage.getItem("theme") !== "light"
)
  document.documentElement.classList.add("dark");

function updateStorage() {
  localStorage.setItem(
    "theme",
    document.documentElement.classList.contains("dark") ? "dark" : "light"
  );
}

var toggleButton = document.querySelector(".theme-toggle");
if (toggleButton) {
  toggleButton.addEventListener("click", function() {
    document.documentElement.classList.toggle("dark");
    updateStorage();
    updateText();
  });
}

function updateText() {
  if (toggleButton) {
    toggleButton.setAttribute(
      "aria-label",
      document.documentElement.classList.contains("dark")
        ? "Change theme to light"
        : "Change theme to dark"
    );
    toggleButton.setAttribute(
      "title",
      document.documentElement.classList.contains("dark")
        ? "Change theme to light"
        : "Change theme to dark"
    );
  }
}
updateText();
