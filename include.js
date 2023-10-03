let cards = [
  {
    artName: 'Tic Tac Yo!',
    pageLink: './Art/smokeraven667/smokeraven.html',
    imageLink: './Art/smokeraven667/tic-tac-yo.gif',
    author: 'Joy',
    githubLink: 'https://github.com/smokeraven667'
  },
  {
    artName: 'hanisntsolo',
    pageLink: './Art/hanisntsolo/hanisntsolo.html',
    imageLink: './Art/hanisntsolo/hanisntsolo.gif',
    author: 'Hanisntsolo',
    githubLink: 'https://github.com/hanisntsolo'
  },
  {
    artName: 'Orbiting-Ball',
    pageLink: './Art/Tipchan/OrbitingBall.html',
    imageLink: './Art/Tipchan/OrbitingBall.gif',
    author: 'Tipchan',
    githubLink: 'https://github.com/tsongtheng'
  },
  {
    artName: 'Simple BAAF',
    pageLink: './Art/baaf-Animation/index.html',
    imageLink: './Art/baaf-Animation/baafscreen.png',
    author: 'Farid Bass',
    githubLink: 'https://github.com/baafbass'
  },
  {
    artName: 'Triangle',
    pageLink: './Art/Joy/triangle.html',
    imageLink: './Art/Joy/triangle.gif',
    author: 'Joy',
    githubLink: 'https://github.com/royranger'
  }
];

// +--------------------------------------------------------------------------------+
// +                                                                                +
// +                  YOU DO NOT NEED TO CHANGE ANYTHING BELOW THIS                 +
// +                                                                                +
// +--------------------------------------------------------------------------------+

// Creates cards from the array above
// You don't need to modify this
let contents = [];
Shuffle(cards).forEach((c) => {
  contents.push([
    `<li class="card">` +
      `<a href='${c.pageLink}'>` +
      `<img class="art-image" src='${c.imageLink}' alt='${c.artName}' />` +
      `</a>` +
      `<div class="flex-content">` +
      `<a href='${c.pageLink}'><h3 class="art-title">${c.artName}</h3></a>` +
      `<p class='author'><a href="${c.githubLink}" target="_blank"><i class="fab fa-github"></i> ${c.author}</a> </p>` +
      `</div>` +
      `</li>`
  ]);
});

document.getElementById('cards').innerHTML = contents;

function Shuffle(o) {
  for (
    var j, x, i = o.length;
    i;
    j = parseInt(Math.random() * i), x = o[--i], o[i] = o[j], o[j] = x
  );
  return o;
}
