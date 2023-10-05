document.addEventListener("DOMContentLoaded", function () {
    const button = document.querySelector(".glow-on-hover");

    // Function to add the 'hover' class to the button
    function addHoverClass() {
        button.classList.add("hover");
    }

    // Function to remove the 'hover' class from the button
    function removeHoverClass() {
        button.classList.remove("hover");
    }

    // Add 'addHoverClass' function periodically (e.g., every 2 seconds)
    const hoverInterval = setInterval(addHoverClass, 2000);

    // Remove 'hover' class after the animation duration (20s)
    button.addEventListener("animationend", function (event) {
        if (event.animationName === "glowing") {
            removeHoverClass();
        }
    });

    // Stop the hover animation after a certain time (e.g., 30 seconds)
    setTimeout(function () {
        clearInterval(hoverInterval);
        removeHoverClass();
    }, 30000); // 30 seconds (adjust as needed)
});
