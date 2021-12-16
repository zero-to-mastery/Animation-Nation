let btncolor1 = document.querySelector("#color1");
let btncolor2 = document.querySelector("#color2");
let btncolor3 = document.querySelector("#color3");
let c1 = false;
let c2 = false;
let c3 = false;

btncolor1.addEventListener("click", () => {
  if (c1 == false) {
    document.body.style.background =
      "linear-gradient(0.25turn, #aa19e4, #411ad1, #159dd3)";
    c1 = true;
  } else {
    document.body.style.background =
      "linear-gradient(0.25turn, #3f87a6, #ebf8e1, #f69d3c)";
    c1 = false;
  }
});

btncolor2.addEventListener("click", () => {
  if (c2 == false) {
    document.body.style.background =
      "linear-gradient(0.25turn, #ef1023, #121dd1, #dffc13)";
    c2 = true;
  } else {
    document.body.style.background =
      "linear-gradient(0.25turn, #3f87a6, #ebf8e1, #f69d3c)";
    c2 = false;
  }
});

btncolor3.addEventListener("click", () => {
  if (c3 == false) {
    document.body.style.background =
      "linear-gradient(0.25turn, #0000e1, #ffdb00, #eb0085)";
    c3 = true;
  } else {
    document.body.style.background =
      "linear-gradient(0.25turn, #3f87a6, #ebf8e1, #f69d3c)";
    c3 = false;
  }
});
