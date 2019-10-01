let cards = [
  //  Add your card in this section
  {
    artName: 'Square Loader',
    pageLink: './Art/Hemant/index.html',
    imageLink: './Art/Hemant/loader.gif',
    author: 'Hemant Garg',
    githubLink: 'https://github.com/hemant-garg'
  },
  {
    artName: 'wake up, neo...',
    pageLink: './Art/samirjouni/TributeToTheMatrix.html',
    imageLink: './Art/samirjouni/sample.gif',
    author: 'Samir Jouni',
    githubLink: 'https://github.com/samirjouni'
  },
  {
    artName: 'Planet',
    pageLink: './Art/ArthurDoom/planet.html',
    imageLink: './Art/ArthurDoom/planet.gif',
    author: 'ArthurDoom',
    githubLink: 'https://github.com/ArthurDoom'
  },
  {
    artName: 'SquarPy',
    pageLink: './Art/Utkarsh/index.html',
    imageLink: './Art/Utkarsh/hack.gif',
    author: 'utkarsh',
    githubLink: 'https://github.com/Utkarsh2604'
  },
  {
    artName: 'Circle',
    pageLink: './Art/Oliver/Circle.html',
    imageLink: './Art/Oliver/circle.gif',
    author: 'Oliver',
    githubLink: 'https://github.com/oliver-gomes'
  },
  {
    artName: 'Ellipse Loader',
    pageLink: './Art/VaibhavKhulbe/EllipseLoader.html',
    imageLink: './Art/VaibhavKhulbe/ellipseLoader.gif',
    author: 'Vaibhav Khulbe',
    githubLink: 'https://github.com/Kvaibhav01'
  },
  {
    artName: 'Triangle',
    pageLink: './Art/Joy/triangle.html',
    imageLink: './Art/Joy/triangle.gif',
    author: 'Joy',
    githubLink: 'https://github.com/royranger'
  },
  {
    artName: 'Simple Loader',
    pageLink: './Art/soumsps/simpleload.html',
    imageLink: './Art/soumsps/sample.gif',
    author: 'Soumendu Sinha',
    githubLink: 'https://github.com/soumsps'
  },
  {
    artName: 'Rollodex',
    pageLink: './Art/Shruti/rolling.html',
    imageLink: './Art/Shruti/rolling.gif',
    author: 'Shruti',
    githubLink: 'https://github.com/shruti49'
  },
  {
    artName: "Cute Cat",
    pageLink: "./Art/Alghi/cat.html",
    imageLink: "./Art/Alghi/cat.gif",
    author: "Alghi",
    githubLink: "https://github.com/darklordace"
  },
  {
    artName: "ZtM Text",
    pageLink: "./Art/Di4iMoRtAl/ZtM_text_animation.html",
    imageLink: "./Art/Di4iMoRtAl/ZtM_animation.gif",
    author: "Di4iMoRtAl",
    githubLink: "https://github.com/dppeykov"
  },
  {
    artName: "Circles",
    pageLink: "./Art/Bhuvana/circles.html",
    imageLink: "./Art/Bhuvana/circles.gif",
    author: "Bhuvana",
    githubLink: "https://github.com/bhuvana-guna"
  },
  {
    artName: "Css Pulse",
    pageLink: "./Art/Aszmel/pulse.html",
    imageLink: "./Art/Aszmel/css_pulse.gif",
    author: "Aszmel",
    githubLink: "https://github.com/Aszmel"
  },
  {
    artName: "Circle Bounce",
    pageLink: "./Art/Edmund/index.html",
    imageLink: "./Art/Edmund/circle-bounce.gif",
    author: "Edmund",
    githubLink: "https://github.com/edmund1645"
  },
  {
    artName: "Heart Beating",
    pageLink: "./Art/Regem/index.html",
    imageLink: "./Art/Regem/heart.jpg",
    author: "Regem",
    githubLink: "https://github.com/GemzBond"
  },
  {
    artName: "Fading Circles",
    pageLink: "./Art/Ankit/fadeCircle.html",
    imageLink: "./Art/Ankit/fadeCircles.png",
    author: "Ankit Srivastava",
    githubLink: "https://github.com/a18nov"
  },
  {
    artName: "Hacktoberfest 2019",
    pageLink: "./Art/jpk3lly/animation.html",
    imageLink: "./Art/jpk3lly/JP's Animation GIF.gif",
    author: "jpk3lly",
    githubLink: "https://github.com/jpk3lly"
	},
	{
    artName: "Name Rotator",
    pageLink: "./Art/Meet/name.html",
    imageLink: "./Art/Meet/name.gif",
    author: "Meet",
    githubLink: "https://github.com/Meet1103"
	},
	{
    artName: "Moving Surface",
    pageLink: "./Art/Ashu/index.html",
    imageLink: "./Art/Ashu/Moving_Surface.gif",
    author: "Ashutosh",
    githubLink: "https://github.com/Ashutosh00710"
  },
  {
    artName: "ephiphany",
    pageLink: "./Art/OctavianIlies/index.html",
    imageLink: "./Art/OctavianIlies/ephiphany.gif",
    author: "OctavianIlies",
    githubLink: "https://github.com/OctavianIlies"
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
Shuffle(cards).forEach(c => {
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
