document.addEventListener("DOMContentLoaded", () => {
    const type = document.getElementById("type"); // <select name="type" id="type">
    type.addEventListener("change", (ev) => {
        console.log(ev.target.value); // Prints the selected value
    });
});
