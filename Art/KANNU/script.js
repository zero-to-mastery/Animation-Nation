// $('input').focusin(function() {
//     $('label').transition({x:'80px'},500,'ease').next()
//     .transition({x:'5px'},500, 'ease');
// //setTimeout needed for Chrome, for some reson there is no animation from left to right, the pen is immediately present. Slight delay to adding the animation class fixes it
//      setTimeout(function(){
//     $('label').next().addClass('move-pen');
//     },100);

// });
  
//   $('input').focusout(function() {
//       $('label').transition({x:'0px'},500,'ease').next()
//        .transition({x:'-100px'},500, 'ease').removeClass('move-pen');
//   });

// Function to add animation and move the label and pen
// function addAnimation(element, labelX, penX) {
//     element.style.transition = 'transform 500ms ease';
//     element.style.transform = `translateX(${labelX}px)`;
//     element.nextElementSibling.style.transition = 'transform 500ms ease';
//     element.nextElementSibling.style.transform = `translateX(${penX}px`;
//     setTimeout(function () {
//         element.nextElementSibling.classList.add('move-pen');
//     }, 100);
// }

// // Function to remove animation and reset label and pen positions
// function removeAnimation(element) {
//     element.style.transition = 'transform 500ms ease';
//     element.style.transform = 'translateX(0px)';
//     element.nextElementSibling.style.transition = 'transform 500ms ease';
//     element.nextElementSibling.style.transform = 'translateX(-100px)';
//     element.nextElementSibling.classList.remove('move-pen');
// }

// // Get all input elements
// var inputElements = document.querySelectorAll('input');

// // Add focusin and focusout event listeners
// inputElements.forEach(function (input) {
//     input.addEventListener('focusin', function () {
//         addAnimation(this.previousElementSibling, 80, 5);
//     });

//     input.addEventListener('focusout', function () {
//         removeAnimation(this.previousElementSibling);
//     });
// });

// Get the toggle icon element
var toggleIcon = document.querySelector(".toggle-icon");

// Get the navigation container element
var navContainer = document.getElementById("nav-container");

// Add a click event listener to the toggle icon
toggleIcon.addEventListener("click", function() {
    // Toggle the "pushed" class on the navigation container
    navContainer.classList.toggle("pushed");
});
