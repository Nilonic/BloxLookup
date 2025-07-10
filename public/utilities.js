var AboutModal;

// Open About modal
function openAboutModal() {
  // Create modal container div
  AboutModal = document.createElement("div");
  AboutModal.id = "aboutModal";
  AboutModal.className = "modal";

  // Create modal content div
  var modalContent = document.createElement("div");
  modalContent.className = "modal-content";

  // Create close button (×)
  var closeButton = document.createElement("span");
  closeButton.className = "close";
  closeButton.innerHTML = "&times;";
  closeButton.onclick = closeAboutModal; // Assign close function

  // Create header (h2)
  var header = document.createElement("h2");
  header.textContent = "About BloxLookup";

  var nextParagraph = document.createElement("p");
  nextParagraph.innerHTML =
    'Material Symbols here: <a href="https://fonts.google.com/icons">Google Material Symbols & Icons</a>';

  var nextNextParagraph = document.createElement("p");
  nextNextParagraph.innerHTML =
    "More Roblox API Mappings here: <a href='https://github.com/AntiBoomz/BTRoblox/blob/master/README.md' target='_blank'>BTRobox Readme Links</a>";

  // Create sub-header (h3)
  var subHeader = document.createElement("h3");
  subHeader.textContent = "Things this server uses:";

  // Create unordered list
  var ul = document.createElement("ul");
  var items = ["Node", "NPM", "Express", "Path", "Crypto", "Node-Fetch"];
  items.forEach(function (item) {
    var li = document.createElement("li");
    li.textContent = item;
    ul.appendChild(li);
  });

  // Create final paragraph
  var finalParagraph = document.createElement("p");
  finalParagraph.textContent =
    "This app was made because I had an idea and wanted to prove myself wrong.";

  // Append elements to modalContent
  modalContent.appendChild(closeButton);
  modalContent.appendChild(header);
  modalContent.appendChild(nextParagraph);
  modalContent.appendChild(nextNextParagraph);
  modalContent.appendChild(subHeader);
  modalContent.appendChild(ul);
  modalContent.appendChild(finalParagraph);

  // Append modalContent to AboutModal (modal container)
  AboutModal.appendChild(modalContent);

  // Append modal to body
  document.body.appendChild(AboutModal);
}

// Close About modal
function closeAboutModal() {
  if (AboutModal) {
    document.body.removeChild(AboutModal); // Remove the modal from DOM
    AboutModal = null;
  }
}

// Navigate to different pages
function navigateTo(page) {
  if (page === "home") {
    location.href = location.origin;
  } else if (page === "github") {
    window.open("https://github.com/Nilonic/BloxLookup", "_blank");
  }
}
