(function() {
  'use strict';
  const MIN = 320;
  const MEDIUM = 640;
  const LARGE = 1024;
  var screensize;
  var bodyarea = document.querySelector('body');
  var menu = document.querySelector('#menu');
  var menubtn = menu.querySelectorAll('a');
  var header = document.querySelector('header');
  var logo = header.querySelector('#main-logo');
  var logoalt = header.querySelector('#alt-logo');
  var hambmenu = header.querySelector('#hamburger-menu');
  var aboutsec = document.querySelector('#about');
  var aboutbtn = aboutsec.querySelectorAll('.about-button');
  var biosec = aboutsec.querySelector('#bio');
  var timelinesec = aboutsec.querySelector('#timeline');
  var timelineitems;
  var statssec = document.querySelector('#statistics');
  var statsel = statssec.querySelector('.category');
  var videosec = document.querySelector('#video');
  var overvideo = videosec.querySelector('#over-video');
  var videobtn = overvideo.querySelector('#video-btn');
  var video = videosec.querySelector('#promo-video');
  var videocontrol = videosec.querySelector("#video-controls");
  var videotime = videocontrol.querySelector('#video-time');
  var playbtn = videocontrol.querySelector('#play-btn');
  var seekbar = videocontrol.querySelector('#seek-bar');
  var progressbar = seekbar.querySelector('span');
  var volumebar = videocontrol.querySelector('#volume-bar')
  var volumebg = volumebar.querySelector('#volume-bg');
  var volumefg = volumebar.querySelector('#volume-fg');
  var volumebtn = videocontrol.querySelector('#volume-btn');
  var fullbtn = videocontrol.querySelector('#full-btn > .video-ctrl-bt');
  var gallerysec = document.querySelector('#gallery');
  var leftcaret = gallerysec.querySelector('.fa-caret-left');
  var rightcaret = gallerysec.querySelector('.fa-caret-right');
  var marketsec = document.querySelector('#market');
  var marketcat = marketsec.querySelectorAll('.market-button');
  var productssec = document.querySelector('#products');
  var subscribesec = document.querySelector('#subscribe');
  var instagramsec = document.querySelector('#instagram');
  var statsAnimated = false;
  var videoduration;
  var prevvol = 0;
  var videoPlaying = false;
  var thumb;
  var galleryindex = 0;
  var objectcategory;
  var productindex;
  var curSize = 'small';
  var hashandlers = false;
  var menuOpen = false;
  var onWhiteDiv = false;
  video.volume = 0.8;

  var menuTl = new TimelineLite({
    paused: true
  });

  var videoCtrlTl = new TimelineLite({
    paused: true
  });

  var galleryTl = new TimelineLite();

  function checkScrollMenu() {
    // if menu is open, close it when scroll
    if(menuOpen === true) {
      menuAnimation();
    }
  }

  function animateStats() {
    //check next section to guarantee all Stats section is in viewport
    if(isElementInViewport(statsel)) {
      if (!statsAnimated) {
        let statcont = statssec.querySelectorAll('.stat-wrapper');
        for (let i = 0; i < statcont.length; i++) {
          statcont[i].classList.add('in-view');
        }
        let options = {
          useEasing: true,
          useGrouping: true,
          separator: ',',
          decimal: '.',
        };
        let rec = new CountUp('stats-rec', 0, 313, 0, 3.5, options);
        if (!rec.error) {
          rec.start();
        } else {
          console.error(rec.error);
        }
        let yds = new CountUp('stats-yds', 0, 4424, 0, 3, options);
        if (!yds.error) {
          yds.start();
        } else {
          console.error(yds.error);
        }
        let avg = new CountUp('stats-avg', 0, 14.1, 1, 3.8, options);
        if (!avg.error) {
          avg.start();
        } else {
          console.error(avg.error);
        }
        let td = new CountUp('stats-td', 0, 38, 0, 4.5, options);
        if (!td.error) {
          td.start();
        } else {
          console.error(td.error);
        }
        statsAnimated = true;
      }
    }
  }

  function changeHeaderColor() {
    let instaoffsets = instagramsec.getBoundingClientRect();
    let prudoffsets = productssec.getBoundingClientRect();
    if(!(productssec.classList.contains('products-hide')) && prudoffsets.top < (hambmenu.offsetHeight) && prudoffsets.bottom > (hambmenu.offsetHeight/2)) {
      header.classList.add('alternate-color');
      onWhiteDiv = true;
    }
    else if(instaoffsets.top < (hambmenu.offsetHeight) && instaoffsets.bottom > (hambmenu.offsetHeight/2)) {
      header.classList.add('alternate-color');
      onWhiteDiv = true;
    }
    else {
      header.classList.remove('alternate-color');
      onWhiteDiv = false;
    }
  }

  function menuAnimation() {
    if (!menuOpen) {
      menuOpen = true;
      hambmenu.classList.remove('fa-bars');
      hambmenu.classList.add('fa-times');
      menuTl.play();
      header.classList.remove('alternate-color');
    }
    else {
      menuOpen = false;
      if(onWhiteDiv) {
        header.classList.add('alternate-color');
      }
      menuTl.reverse();
      hambmenu.classList.remove('fa-times');
      hambmenu.classList.add('fa-bars');
    }
  }

  function openMenu() {
    menuTl.to(menu, 1, {left: 0, opacity: 1, ease: Expo.easeInOut});
  }

  function goToTop() {
    bodyarea.scrollIntoView({block: 'start', inline: 'start', behavior: 'smooth'});
  }

  // function to scroll to selected area when menu clicked
  function scrollSection(evt) {
    evt.preventDefault();
    menuAnimation();

    switch(evt.currentTarget.id) {
      case 'menu-home':
        bodyarea.scrollIntoView({block: 'start', inline: 'start', behavior: 'smooth'});
        break;
      case 'menu-about':
        aboutsec.scrollIntoView({block: 'start', inline: 'nearest', behavior: 'smooth'});
        break;
      case 'menu-stats':
        statssec.scrollIntoView({block: 'start', inline: 'nearest', behavior: 'smooth'});
        break;
      case 'menu-video':
        videosec.scrollIntoView({block: 'start', inline: 'start', behavior: 'smooth'});
        break;
      case 'menu-gallery':
        gallerysec.scrollIntoView({block: 'start', inline: 'start', behavior: 'smooth'});
        break;
      case 'menu-market':
        marketsec.scrollIntoView({block: 'start', inline: 'nearest', behavior: 'smooth'});
        break;
      case 'menu-subscribe':
        subscribesec.scrollIntoView({block: 'start', inline: 'nearest', behavior: 'smooth'});
        break;
      default:
        break;
    }
  }

  function centerTimeline() {
    if(window.innerWidth >= MIN && window.innerWidth < MEDIUM) {
      let addmargin = Math.floor((window.innerWidth-MIN)/3)+4;
      for(let i = 0; i < timelineitems.length; i++) {
        timelineitems[i].style.left = addmargin+"px";
      }
    }
    else {
      for(let i = 0; i < timelineitems.length; i++) {
        timelineitems[i].style.left = null;
      }
    }
  }

  function checkScrollTimeline() {
    for (let i = 0; i < timelineitems.length; i++) {
      let offsets = timelineitems[i].getBoundingClientRect();
      if(isElementInViewport(timelineitems[i])) {
        if(!timelineitems[i].classList.contains('in-view')){
          timelineitems[i].classList.add('in-view');
        }
        setSelected(i);
      }
    }
  }

  // set timeline element as selected
  function setSelected(index) {
    for (let i = 0; i < timelineitems.length; i++) {
      timelineitems[i].classList.remove('selected');
    }
    timelineitems[index].classList.add('selected');
  }

  function isElementInViewport(el) {
    let rect = el.getBoundingClientRect();
    return (
      rect.top >= 0 &&
      rect.left >= 0 &&
      rect.bottom <= (window.innerHeight+100 || document.documentElement.clientHeight+100) &&
      rect.right <= (window.innerWidth || document.documentElement.clientWidth)
    );
  }

  function loadStats() {
    let w = document.querySelectorAll('.stat-value')[0].offsetWidth;
    let wrap = document.querySelectorAll('.stat-wrapper');
    let stat = document.querySelectorAll('.stat-value');

    for (let i = 0; i < stat.length; i++){
     stat[i].style.height = w+"px";
     wrap[i].style.height = w+"px";
    }
  }

  class Product {
    constructor() {
      this.image = productssec.querySelector('img');
      this.name = productssec.querySelector('.product-name');
      this.price = productssec.querySelector('.product-price');
      this.rate = productssec.querySelector('.product-rate');
    }
  }

  function checkScreenSize() {
    if(this < MEDIUM || window.innerWidth < MEDIUM) {
      screensize = 'small';
    }
    else if(this < LARGE || window.innerWidth < LARGE) {
      screensize = 'medium';
    }
    else {
      screensize = 'large';
    }
  }

  //set images size (small, medium or large) on load
  function setImageSize() {
    for (let i = 0; i < this.length; i++) {
      this[i].src = this[i].src.replace('small', screensize);
    }
    curSize = screensize;
  }

  //set videos size (small, medium or large) on load
  function setVideoSize() {
    for (let i = 0; i < this.length; i++) {
      var vidsource = this[i].querySelectorAll('source');
      for (let j = 0; j < vidsource.length; j++) {
        vidsource[j].src = vidsource[j].src.replace('medium', screensize);
      }
    }
    curSize = screensize;
  }

  // change images and videos size (small, medium or large) on screen resize
  function changeImageSize() {
    if (curSize !== screensize) {
      var img = document.querySelectorAll('.media-change');
      for (let i = 0; i < img.length; i++) {
        img[i].src = img[i].src.replace(curSize, screensize);
      }
      var vid = document.querySelectorAll('.video-change');
      for (let i = 0; i < vid.length; i++) {
        var vidsource = vid[i].querySelectorAll('source');
        for (let j = 0; j < vidsource.length; j++) {
          vidsource[j].src = vidsource[j].src.replace(curSize, screensize);
        }
      }
      curSize = screensize;
    }
  }

  function openInstagram() {
    let instaarea = this;
    let instagramobject = instagramcontent;

    instagramobject.image.forEach(function(img, index) {
      let instaitem = document.createElement('div');
      instaitem.className = 'insta-item';
      let photo = document.createElement('img');
      photo.className = 'insta-photo';
      photo.src = 'images/instagram_'+instagramobject.image[index].file;
      photo.alt = instagramobject.image[index].alt;
      instaitem.appendChild(photo);
      let caption = document.createElement('p');
      caption.className = 'insta-caption';
      caption.innerHTML = instagramobject.caption[index];
      instaitem.appendChild(caption);
      let obj = document.createElement('p');
      obj.className = 'insta-account';
      obj.innerHTML = '-@obj';
      instaitem.appendChild(obj);
      let date = document.createElement('p');
      date.className = 'insta-date';
      date.innerHTML = instagramobject.date[index];
      instaitem.appendChild(date);
      instaarea.appendChild(instaitem);
    });
  }

  function openTimeline() {
    let wrapper = this.querySelector('ul');
    let timelineobject = timelinecontent;

    if(!timelineitems) {
      timelineobject.year.forEach(function(img, index) {
        let item = document.createElement('li');
        let tlitem = document.createElement('div');
        tlitem.className = 'timeline-item';
        let imgwrapper = document.createElement('div');
        imgwrapper.className = 'tl-photo-wrapper';
        let photo = document.createElement('img');
        photo.className = 'tl-photo';
        photo.src = 'images/timeline_'+timelineobject.image[index].file+'.png';
        photo.alt = timelineobject.image[index].alt;
        imgwrapper.appendChild(photo);
        let title = document.createElement('p');
        title.className = 'tl-title';
        title.innerHTML = timelineobject.title[index];
        imgwrapper.appendChild(title);
        let year = document.createElement('time');
        year.innerHTML = timelineobject.year[index];
        imgwrapper.appendChild(year);
        // let over = document.createElement('div');
        // over.className = 'over-shadow';
        // imgwrapper.appendChild(over);
        tlitem.appendChild(imgwrapper);
        let desc = document.createElement('p');
        desc.className = 'tl-desc';
        desc.innerHTML = timelineobject.desc[index];
        tlitem.appendChild(desc);
        item.appendChild(tlitem);
        wrapper.appendChild(item);
      });
    }
    timelineitems = timelinesec.querySelectorAll('li');
    centerTimeline();
    checkScrollTimeline();
    window.addEventListener('resize', centerTimeline, false);
    window.addEventListener('scroll', checkScrollTimeline, false);
    for(let i = 0; i < timelineitems.length; i++) {
      timelineitems[i].addEventListener('click', scrollTimelineItem, false);
    }
  }

  function scrollTimelineItem(evt) {
    evt.currentTarget.scrollIntoView({block: 'center', inline: 'nearest', behavior: 'smooth'});
  }

  function openGallery() {
    let wrapper = this.querySelector('#photo-wrapper');
    let objectgallery = gallerycontent;

    objectgallery.image.forEach(function(img, index) {
      let photo = document.createElement('img');
      photo.className = 'gallery-photo';
      photo.classList.add('media-change');
      photo.src = 'images/gallery_'+objectgallery.image[index]+'_'+screensize+'.jpg';
      photo.alt = objectgallery.alt[index];
      wrapper.appendChild(photo);
    });

    wrapper.addEventListener('mouseover', showCarets, false);
    wrapper.addEventListener('mouseout', hideCarets, false);
    leftcaret.addEventListener('mouseover', showCarets, false);
    leftcaret.addEventListener('mouseout', hideCarets, false);
    leftcaret.addEventListener('click', prevPhoto, false);
    rightcaret.addEventListener('mouseover', showCarets, false);
    rightcaret.addEventListener('mouseout', hideCarets, false);
    rightcaret.addEventListener('click', nextPhoto, false);
  }

  function prevPhoto() {
    if(!galleryTl.isActive()) {
      let photos = gallerysec.querySelectorAll('.gallery-photo');
      if (galleryindex === 0) {
        galleryTl.to(photos[0], 1, {left: "-100%"});
        galleryTl.to(photos[photos.length-1], 1, {left: 0}, "-=1");
        galleryindex = photos.length-1;
      }
      else {
        galleryTl.to(photos[galleryindex-1], 0, {visibility: "hidden", left: "-100%"});
        galleryTl.to(photos[galleryindex], 1, {left: "100%"});
        galleryTl.to(photos[galleryindex-1], 1, {visibility: "visible", left: 0}, "-=1");
        galleryindex = galleryindex-1;
      }
    }
  }

  function nextPhoto() {
    if(!galleryTl.isActive()) {
      let photos = gallerysec.querySelectorAll('.gallery-photo');
      if (galleryindex === photos.length-1) {
        galleryTl.to(photos[galleryindex], 1, {left: "100%"});
        galleryTl.to(photos[0], 1, {left: 0}, "-=1");
        galleryindex = 0;
      }
      else {
        galleryTl.to(photos[galleryindex+1], 0, {visibility: "hidden", left: "100%"});
        galleryTl.to(photos[galleryindex], 1, {left: "-100%"});
        galleryTl.to(photos[galleryindex+1], 1, {visibility: "visible", left: 0}, "-=1");
        galleryindex = galleryindex+1;
      }
    }
  }

  // function to hide photo gallery arrows when mouse is out of photo
  function hideCarets() {
    TweenMax.to(leftcaret, 1, {opacity: 0});
    TweenMax.to(rightcaret, 1, {opacity: 0});
  }

  // function to show photo gallery arrows when mouse is on photo
  function showCarets() {
    TweenMax.to(leftcaret, 1, {opacity: 1});
    TweenMax.to(rightcaret, 1, {opacity: 1});
  }

  function openProductCategory(evt) {
    evt.preventDefault();
    if(productssec.classList.contains('products-hide')) {
      productssec.classList.remove('products-hide'); //show products section
    }

    productindex = 0;
    objectcategory = marketcontent[evt.currentTarget.id];
    let leftcaret = productssec.querySelector('.fa-caret-left');
    let rightcaret = productssec.querySelector('.fa-caret-right');
    showProduct();
    showThumbs();

    //check if there are previous event handlers
    //if yes, remove them
    if (hashandlers) {
      leftcaret.removeEventListener('click', previousProduct, false);
      rightcaret.removeEventListener('click', nextProduct, false);
      hashandlers = false;
    }

    leftcaret.addEventListener('click', previousProduct, false);
    rightcaret.addEventListener('click', nextProduct, false);
    hashandlers = true;
    productssec.scrollIntoView({behavior: "smooth"});
  }

  function previousProduct() {
    if(productindex === 0) {
      productindex = (objectcategory.image.length)-1;
    }
    else {
      productindex = productindex-1;
    }
    showProduct();
  }

  function nextProduct() {
    if(productindex === (objectcategory.image.length)-1) {
      productindex = 0;
    }
    else {
      productindex++;
    }
    showProduct();
  }

  function showProduct() {
    let product = new Product();
    product.image.src = 'images/product_'+objectcategory.image[productindex];
    product.name.innerHTML = objectcategory.name[productindex];
    product.price.innerHTML = objectcategory.price[productindex];

    //get rate from json and append respective number of stars
    let stars = objectcategory.rate[productindex];
    let starlist = product.rate.querySelector('ul');
    while(starlist.firstChild) {
      starlist.removeChild(starlist.firstChild);
    }
    for (let i = 0; i < stars; i++){
      let staricon = document.createElement('i');
      starlist.appendChild(staricon);
      staricon.className = "fa fa-star";
    }
}
  //show product thumbs
  function showThumbs() {
    let thumbarea = document.querySelector('.thumbProducts');

    while(thumbarea.firstChild) {
     thumbarea.removeChild(thumbarea.firstChild);
    }

    objectcategory.image.forEach(function(img, index) {
       //create and image element
       let newThumb = document.createElement('img');
       newThumb.classList.add('thumb');
       newThumb.src = 'images/product_'+objectcategory.image[index];
       thumbarea.appendChild(newThumb);
     });
     thumb = thumbarea.querySelectorAll('.thumb');
     for(let i = 0; i < thumb.length; i++) {
       thumb[i].addEventListener('click', selectProduct, false);
     }
     thumbArrows();
  }

  // make products thumb area behavior
  function thumbArrows(){
    let thumbCont = document.querySelector('#thumbCont');
    let carousel = thumbCont.querySelector('#thumbCarousel');
    let leftarrow = thumbCont.querySelector('.thumb-left');
    let rightarrow = thumbCont.querySelector('.thumb-right');
    let thumbs = thumbCont.querySelector('.thumbProducts').children.length;
    let th = document.querySelector('.thumb');
    let thumbWidth = 0;
    th.addEventListener('load', function () {
      thumbWidth = th.offsetWidth;
    });
    let leftposition = 0;

    carousel.style.left = leftposition + 'px';
    leftarrow.addEventListener('click', previousThumb, false);
    rightarrow.addEventListener('click', nextThumb, false);

    var moveSlide = function (value) {
        leftposition += value * thumbWidth;
        carousel.style.left = leftposition + 'px';
    };

    function nextThumb(){
      if (leftposition > (thumbs-3) * -thumbWidth) {
          moveSlide(-1);
        } else {
          leftposition = 0;
          carousel.style.left = leftposition + 'px';
        }
    }

    function previousThumb(){
      if(leftposition !== 0) {
        moveSlide(1);
        } else if (leftposition === 0) {
          carousel.style.left = leftposition + 'px';
        } else {
        leftposition = (thumbs-1)* -thumbWidth;
        carousel.style.left = leftposition + 'px';
      }
    }
  }

  // show product regarding selected thumb
  function selectProduct(evt) {
    productindex = Array.from(thumb).indexOf(evt.currentTarget);
    showProduct();
  }

  // function overAboutBtn(evt) {
  //   evt.preventDefault();
  //   let arrow = evt.currentTarget.querySelector('.under-triangle');
  //   // evt.currentTarget.style.opacity = 0.85;
  //   arrow.style.bottom = '-2.5rem';
  //   arrow.style.borderTop = '2.5rem solid #db293e';
  // }
  //
  // function outAboutBtn(evt) {
  //   evt.preventDefault();
  //   let arrow = evt.currentTarget.querySelector('.under-triangle');
  //   evt.currentTarget.style.opacity = null;
  //   arrow.style.bottom = null;
  //   arrow.style.borderTop = null;
  // }

  // open option on About section (Bio or timeline)
  function selectAbout(evt) {
    evt.preventDefault();
    for (let i = 0; i < aboutbtn.length; i++) {
      aboutbtn[i].classList.remove('btn-selected');
    }
    switch(evt.currentTarget.id) {
      case 'btn-bio':
        timelinesec.style.display = 'none';
        if(timelineitems) {
          window.removeEventListener('resize', centerTimeline, false);
          window.removeEventListener('scroll', checkScrollTimeline, false);
          for(let i = 0; i < timelineitems.length; i++) {
            timelineitems[i].removeEventListener('click', scrollTimelineItem, false);
            timelineitems[i].classList.remove('selected');
            timelineitems[i].classList.remove('in-view');
          }
        }
        if(biosec.style.display === 'block') {
          biosec.style.display = 'none';
          evt.currentTarget.classList.remove('btn-selected');
        }
        else {
          biosec.style.display = 'block';
          biosec.scrollIntoView({block: 'start', inline: 'nearest', behavior: 'smooth'});
          evt.currentTarget.classList.add('btn-selected');
        }
        break;
      case 'btn-tl':
        biosec.style.display = 'none';
        if(timelinesec.style.display === 'block') {
          timelinesec.style.display = 'none';
          if(timelineitems) {
            window.removeEventListener('resize', centerTimeline, false);
            window.removeEventListener('scroll', checkScrollTimeline, false);
            for(let i = 0; i < timelineitems.length; i++) {
              timelineitems[i].removeEventListener('click', scrollTimelineItem, false);
              timelineitems[i].classList.remove('selected');
              timelineitems[i].classList.remove('in-view');
            }
          }
          evt.currentTarget.classList.remove('btn-selected');
        }
        else {
          timelinesec.style.display = 'block';
          openTimeline.call(timelinesec);
          timelinesec.scrollIntoView({block: 'start', inline: 'start', behavior: 'smooth'});
          evt.currentTarget.classList.add('btn-selected');
        }
        break;
      default:
        break;
    }

  }

  // function to check if video control must be hidden when video is playing and cursor is not over the video
  // plays timeline to hide video control
  function outVideoControl() {
    videoCtrlTl.play();
  }

  // function to check if video control must be shown when video is playing and cursor is over the video
  // plays timeline in reverse to show video control
  function overVideoControl() {
    videoCtrlTl.reverse();
  }

  // timelines to hide video control when video is playing and mouse is not over the video
  function hideVideoControl() {
    videoCtrlTl.to(videocontrol, 1, {opacity: 0});
  }

  // change Play button from play to pause icon
  function playToPauseBtn(el) {
    el.classList.remove('fa-play');
    el.classList.add('fa-pause');
  }

  // change Play button from pause to play icon
  function pauseToPlayBtn(el) {
    el.classList.remove('fa-pause');
    el.classList.add('fa-play');
  }

  //convert time in seconds.miliseconds to minutes:seconds
  function convertSecondsToMinutes(rawtime) {
    let inttime = Math.floor(rawtime);
    let minutes = Math.floor(inttime/60);
    let seconds = inttime-(minutes*60);
    let time = minutes.toString()+':'+('0'+seconds.toString()).slice(-2);
    return time;
  }

  // function to play/pause video
  function togglePlayVideo() {
    let icon = playbtn.querySelector('.video-ctrl-bt');
    if(video.paused) {
      videoduration = convertSecondsToMinutes(video.duration);
      overvideo.style.backgroundColor = 'transparent';
      video.play();
      playToPauseBtn(icon);
      videobtn.style.display = 'none';
      addVideoListeners();
      outVideoControl();
      videoPlaying = true;
    }
    else {
      video.pause();
      pauseToPlayBtn(icon);
      videobtn.style.display = 'block';
      removeVideoListeners();
      videoCtrlTl.reverse();
      videoPlaying = false;
    }
  }

  //
  function addVideoListeners() {
    let isFullScreen = document.fullScreen || document.mozFullScreen || document.webkitIsFullScreen;
    video.addEventListener('timeupdate', updateVideoCurrentTime, false);
    video.addEventListener('timeupdate', slideProgress, false);
    video.addEventListener('ended', reloadVideo, false);
    videocontrol.addEventListener('mouseout', outVideoControl, false);
    videocontrol.addEventListener('mouseover', overVideoControl, false);
    if (!isFullScreen) {
      overvideo.addEventListener('mouseout', outVideoControl, false);
      overvideo.addEventListener('mouseover', overVideoControl, false);
    }
  }

  // remove event listeners of video and controls
  function removeVideoListeners() {
    video.removeEventListener('timeupdate', updateVideoCurrentTime, false);
    video.removeEventListener('ended', reloadVideo, false);
    overvideo.removeEventListener('mouseout', outVideoControl, false);
    overvideo.removeEventListener('mouseover', overVideoControl, false);
    videocontrol.removeEventListener('mouseout', outVideoControl, false);
    videocontrol.removeEventListener('mouseover', overVideoControl, false);
  }

  // update video running time on video control
  function updateVideoCurrentTime() {
    let curtime = convertSecondsToMinutes(video.currentTime);
    videotime.innerHTML = curtime+' / '+videoduration;
  }

  // reload video to its initial state
  function reloadVideo() {
    let icon = playbtn.querySelector('.video-ctrl-bt');
    video.load();
    pauseToPlayBtn(icon);
    videobtn.style.display = 'block';
    videotime.innerHTML = '0:00 / '+videoduration;
    removeVideoListeners();
    videoCtrlTl.reverse();
    videoPlaying = false;
    progressbar.style.width = null;
  }

  // function to present video on full screen
  function fullScreenVideo() {
    let isFullScreen = document.fullScreen || document.mozFullScreen || document.webkitIsFullScreen;
    if (isFullScreen) {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      } else if (document.mozCancelFullScreen) {
        document.mozCancelFullScreen();
      } else if (document.webkitCancelFullScreen) {
        document.webkitCancelFullScreen();
      } else if (document.msExitFullscreen) {
        document.msExitFullscreen();
      }
      // overvideo.style.zIndex = null;
      // videocontrol.style.zIndex = null;
      // fullbtn.classList.remove('fa-compress');
      // fullbtn.classList.add('fa-arrows-alt');
    }
    else {
      if (video.requestFullscreen) {
        video.requestFullscreen();
      } else if (video.mozRequestFullScreen) {
        video.mozRequestFullScreen();
      } else if (video.webkitRequestFullscreen) {
        video.webkitRequestFullscreen();
      } else if (video.msRequestFullscreen) {
        video.msRequestFullscreen();
      }
      // overvideo.style.zIndex = 2147483647;
      // videocontrol.style.zIndex = 2147483647;
      // fullbtn.classList.remove('fa-arrows-alt');
      // fullbtn.classList.add('fa-compress');
      // outVideoControl();
      // overvideo.removeEventListener('mouseout', outVideoControl, false);
      // overvideo.removeEventListener('mouseover', overVideoControl, false);
    }
  }

  function checkFullscreen() {
    let isFullScreen = document.fullScreen || document.mozFullScreen || document.webkitIsFullScreen;
    if(isFullScreen) {
      overvideo.style.zIndex = 2147483647;
      videocontrol.style.zIndex = 2147483647;
      fullbtn.classList.remove('fa-arrows-alt');
      fullbtn.classList.add('fa-compress');

      overvideo.removeEventListener('mouseout', outVideoControl, false);
      overvideo.removeEventListener('mouseover', overVideoControl, false);
      if (video.currentTime > 0 && !(video.paused) && !(video.ended)) {
        outVideoControl();
      }
    }
    else {
      overvideo.style.zIndex = null;
      videocontrol.style.zIndex = null;
      fullbtn.classList.remove('fa-compress');
      fullbtn.classList.add('fa-arrows-alt');
      if (video.currentTime > 0 && !(video.paused) && !(video.ended)) {
        overvideo.addEventListener('mouseout', outVideoControl, false);
        overvideo.addEventListener('mouseover', overVideoControl, false);
      }
    }
  }

  // change volume regarding position clicked on volume bar
  // also change position of colorful area of volume bar
  function volumeChange(evt) {
    let pos = evt.pageX;
    let voloffsets = volumefg.getBoundingClientRect();
    let volwidth = voloffsets.right-voloffsets.left;
    let perc = (pos-voloffsets.left)/volwidth;
    let value = (volwidth*perc)/16;
    volumefg.style.clip = 'rect(0, '+value+'rem, '+(volwidth/16)+'rem, 0)';
    video.volume = perc.toFixed(1);
    volumeChangeBtn();
  }

  // sets 0% and 100% volume if clicked before or after volume bar area
  function volumeOut(evt) {
    let pos = evt.pageX;
    let voloffsets = volumefg.getBoundingClientRect();
    if (pos < voloffsets.left && pos > voloffsets.left-8) {
      video.volume = 0;
    }
    else if (pos > voloffsets.right && pos < voloffsets.right+8) {
      video.volume = 1;
    }
    volumeChangeBar();
    volumeChangeBtn();
  }

  // change volume bar position regarding video volume level
  function volumeChangeBar() {
    let voloffsets = volumefg.getBoundingClientRect();
    let volwidth = voloffsets.right-voloffsets.left;
    volumefg.style.clip = 'rect(0, '+((video.volume*volwidth)/16)+'rem, '+(volwidth/16)+'rem, 0)';
  }

  // change volume button icon regarding video volume level
  function volumeChangeBtn() {
    let icon = volumebtn.querySelector('.video-ctrl-bt');
    let curclass;
    for (let i = 0; i < icon.classList.length; i++) {
      if (icon.classList[i].match('fa-volume')) {
        curclass = icon.classList[i];
      }
    }
    icon.classList.remove(curclass);
    if (video.volume === 0) {
      icon.classList.add('fa-volume-off');
    }
    else if (video.volume > 0.5) {
      icon.classList.add('fa-volume-up');
    }
    else {
      icon.classList.add('fa-volume-down');
    }
  }

  // mute and unmute video volume
  function toggleMuteVolume() {
    if (video.volume > 0) {
      prevvol = video.volume;
      video.volume = 0;
    }
    else {
      video.volume = prevvol;
      prevvol = 0;
    }
    volumeChangeBar();
    volumeChangeBtn();
  }

  // function to slide seek bar while video is playing
  function slideProgress() {
    let perc = (video.currentTime/video.duration)*100;
    progressbar.style.width = perc.toString()+'%';
  }

  // move video and time regarding position clicked on seek bar
  function toggleSeekBar(evt) {
    let pos = evt.pageX;
    let voloffsets = seekbar.getBoundingClientRect();
    let volwidth = voloffsets.right-voloffsets.left;
    let perc = (pos-voloffsets.left)/volwidth;
    let time = video.duration * perc;
    video.currentTime = time;
    progressbar.style.width = (perc*100).toString()+'%';
  }

  checkScreenSize.call(window.innerWidth);
  setImageSize.call(document.querySelectorAll('.media-change'));
  setVideoSize.call(document.querySelectorAll('.video-change'));
  openGallery.call(gallerysec);
  // openTimeline.call(timelinesec);

  for (let i = 0; i < marketcat.length ; i++) {
    marketcat[i].addEventListener('click', openProductCategory, false);
  }

  window.addEventListener('resize', changeImageSize, false);
  window.addEventListener('load', loadStats, false);
  window.addEventListener('load', checkScreenSize, false);
  window.addEventListener('resize', checkScreenSize, false);
  window.addEventListener('resize', loadStats, false);
  window.addEventListener('scroll', checkScrollMenu, false);
  window.addEventListener('load', openMenu, false);
  window.addEventListener('scroll', animateStats, false);
  window.addEventListener('scroll', changeHeaderColor, false);
  window.addEventListener('load', hideVideoControl, false);
  logo.addEventListener('click', goToTop, false);
  logoalt.addEventListener('click', goToTop, false);
  hambmenu.addEventListener('click', menuAnimation, false);
  for (let i = 0; i < menubtn.length; i++) {
    menubtn[i].addEventListener('click', scrollSection, false);
  }
  for (let i = 0; i < aboutbtn.length; i++) {
    aboutbtn[i].addEventListener('click', selectAbout, false);
  }
  video.addEventListener('click', togglePlayVideo, false);
  overvideo.addEventListener('click', togglePlayVideo, false);
  playbtn.addEventListener('click', togglePlayVideo, false);
  fullbtn.addEventListener('click', fullScreenVideo, false);
  seekbar.addEventListener('mousedown', toggleSeekBar, false);
  volumebg.addEventListener('mousedown', volumeChange, false);
  volumefg.addEventListener('mousedown', volumeChange, false);
  volumebar.addEventListener('mousedown', volumeOut, false);
  volumebtn.addEventListener('click', toggleMuteVolume, false);
  document.addEventListener('webkitfullscreenchange', checkFullscreen, false);
  document.addEventListener('mozfullscreenchange', checkFullscreen, false);
  document.addEventListener('fullscreenchange', checkFullscreen, false);

})();
