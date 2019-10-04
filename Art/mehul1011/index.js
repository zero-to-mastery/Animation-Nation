// https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API/Tutorial/Drawing_shapes

const canvas = document.querySelector('#canvas');

const ctx = canvas.getContext('2d');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight; 

ctx.strokeStyle = 'red';
ctx.lineJoin = 'round';
ctx.lineCap = 'round';
ctx.lineWidth = 0;


let isDrawing = false;
// basically saying that if the mouse is down to draw then we are going to set this variable to true so it can draw on the canvas if mouse is over or just hovering over the canvas then it will be false

let lastX = 0;
let lastY = 0;
let hue = 0;
let direction = true;

function draw(e) {
  if (!isDrawing) {return;} //stops when the function from running when they are not moused down
  console.log(e); 
  ctx.strokeStyle = `hsl(${hue}, 100%, 50%)`;
  ctx.lineWidth = hue;
  ctx.beginPath();
  // ctx.lineWidth = 4;
  ctx.moveTo(lastX, lastY);
  // move to 0, 0
  ctx.lineTo(e.clientX, e.clientY);
  ctx.stroke();
  lastX = e.clientX;
  lastY = e.clientY;
  hue++;
  if (hue >= 360){
    hue = 0;
  }
  // https://mothereffinghsl.com/

  if (ctx.lineWidth >= 100 || ctx.lineWidth <= 1){
    // flip the hsl
    direction = !direction;
  }
  if (direction) {
    ctx.lineWidth++;
  }else {
    ctx.lineWidth--;
  }
  // if (ctx.lineWidth >= 50){
  //   ctx.lineWidth = 0;
  // }
}

canvas.addEventListener('mousemove', draw);
canvas.addEventListener('mousedown', (e) => {
  isDrawing = true;
  lastX = e.clientX;
  lastY = e.clientY;
});
canvas.addEventListener('mouseup', () => isDrawing = false);
canvas.addEventListener('mouseout', () => isDrawing = false);


// window.addEventListener('load', (e) => {
//   // console.log('Hello');
//   e.preventDefault;
//   const canvas = document.querySelector('#canvas');
//   const ctx = canvas.getContext('2d');
//   // ctx => context which is space on the canvas where we wanna draw and context does exactly return that (which context it is 2-D or 3-D)

//   // resizing
//   // function resized(){
//   canvas.height = window.innerHeight;
//   canvas.width = window.innerWidth;
  // ctx.lineWidth = 4;
  // ctx.strokeStyle = 'red';
  // ctx.strokeRect(100, 100, 200, 200);
  // // x, y, width, height (4 parameters)
  // ctx.lineWidth = 2;
  // ctx.strokeStyle = 'blue';
  // ctx.strokeRect(150, 400, 200, 202);

  // ctx.fillRect(500, 250, 100, 100);
  // ctx.clearRect(520, 270, 60, 60);
  // ctx.strokeRect(525, 275, 50, 50);

  // ctx.beginPath();
  // // creates a path and other commands with this makes a figure
  // ctx.moveTo(75, 50);
  // ctx.lineTo(100, 75);
  // ctx.lineTo(100, 20);
  // ctx.closePath();
  // ctx.stroke();

  // variables 
  // let painting = false;

  // function startPosition(e){
  //   painting = true;
  //   draw(e);
  // }
  // function finishedPosition() {
  //   painting = false;
  //   ctx.beginPath();
  //   ctx.moveTo(e.clientX, e.clientY);
  // }
  // function draw(e) {
  //   if (!painting) {return;}
  //   ctx.lineWidth = 10;
  //   // to make it thick
  //   ctx.strokeStyle = 'red';
  //   ctx.lineCap = 'round';
  //   // this will make our line circle at the ends
  //   ctx.lineTo(e.clientX, e.clientY);
  //   ctx.stroke();
  // }
  // // eventListener
  // canvas.addEventListener('mousedown', startPosition);
  // canvas.addEventListener('mouseup', finishedPosition);
  // canvas.addEventListener('mousemove', draw);

  // arc(x, y, radius, startAngle, endAngle, anticlockwise)
  // }
  // window.addEventListener('resize', resized);
  
// });
