let imgbox = document.querySelectorAll('.imgbox');
let contentbox = document.querySelectorAll('.contentbox');
for (let i = 0; i < imgbox.length; i++) {
  imgbox[i].addEventListener('mouseover', function () {
    for (let i = 0; i < contentbox.length; i++) {
      contentbox[i].className = 'contentbox';
    }
    document.getElementById(this.dataset.id).className = 'contentbox active';

    for (let i = 0; i < imgbox.length; i++) {
      imgbox[i].className = 'imgbox';
    }
    this.className = 'imgbox active';
  });
}
