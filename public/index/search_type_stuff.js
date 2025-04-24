document.addEventListener("DOMContentLoaded", () => {
    const type = document.getElementById("type");
    const input = document.getElementById("robloxUrl");

    type.addEventListener("change", (ev) => {
        let placeholderText;
        switch (ev.target.value) {
            case "game_url":
                placeholderText = "Enter Roblox game URL";
                break;
            case "user":
                placeholderText = "Enter Roblox user URL or ID";
                break;
            case "group":
                placeholderText = "Enter Roblox group ID";
                break;
            default:
                placeholderText = "Enter Roblox game URL";
                break;
        }
        input.setAttribute("placeholder", placeholderText);
    });
});