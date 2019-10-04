const secondHand = document.querySelector('second-hand'); 

function setDate(){
  const now = new Date();
  // console.log(now);
  const seconds = now.getSeconds();
  // console.log(seconds);
  const secondsDegrees = ((seconds / 60) * 360); 
  secondHand.style.transform = `rotate(${secondsDegrees}deg)`;
  console.log(seconds);
}

setInterval(setDate, 1000);