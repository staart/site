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

function isExternal(url) {
  var match = url.match(
    /^([^:\/?#]+:)?(?:\/\/([^\/?#]*))?([^?#]+)?(\?[^#]*)?(#.*)?/
  );
  if (2 > match.length) return false;
  if (
    typeof match[1] === "string" &&
    match[1].length > 0 &&
    match[1].toLowerCase() !== location.protocol
  )
    return true;
  if (
    typeof match[2] === "string" &&
    match[2].length > 0 &&
    match[2].replace(
      new RegExp(
        ":(" + { "http:": 80, "https:": 443 }[location.protocol] + ")?$"
      ),
      ""
    ) !== location.host
  )
    return true;
  return false;
}

var allLinks = document.querySelectorAll("a");
for (let i = 0; allLinks.length > i; i++) {
  var link = allLinks[i];
  if (isExternal(link.getAttribute("href"))) {
    link.classList.add("external-link");
    link.setAttribute("target", "_blank");
    link.setAttribute("rel", "noopener noreferrer");
    link.innerHTML = link.innerHTML + "<span> (opens in new window)</span>";
  }
}

var docsSearch = document.querySelector("input.docs-search");
if (docsSearch) {
  function updateDocsSearch(has) {
    try {
      var parent = docsSearch.parentElement.parentElement.parentElement;
      if (has) {
        parent.classList.add("has-focus");
      } else {
        parent.classList.remove("has-focus");
      }
    } catch (error) {}
  }
  docsSearch.addEventListener("focus", function() {
    updateDocsSearch(true);
  });
  docsSearch.addEventListener("blur", function() {
    updateDocsSearch(false);
  });
}

function inIframe() {
  try {
    return window.self !== window.top;
  } catch (error) {
    return true;
  }
}

if (inIframe()) document.body.classList.add("iframed");
