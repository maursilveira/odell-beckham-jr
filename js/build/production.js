/*
	countUp.js
	by @inorganik
*/

// target = id of html element or var of previously selected html element where counting occurs
// startVal = the value you want to begin at
// endVal = the value you want to arrive at
// decimals = number of decimal places, default 0
// duration = duration of animation in seconds, default 2
// options = optional object of options (see below)

var CountUp = function(target, startVal, endVal, decimals, duration, options) {

	var self = this;
	self.version = function () { return '1.9.3'; };

	// default options
	self.options = {
		useEasing: true, // toggle easing
		useGrouping: true, // 1,000,000 vs 1000000
		separator: ',', // character to use as a separator
		decimal: '.', // character to use as a decimal
		easingFn: easeOutExpo, // optional custom easing function, default is Robert Penner's easeOutExpo
		formattingFn: formatNumber, // optional custom formatting function, default is formatNumber above
		prefix: '', // optional text before the result
		suffix: '', // optional text after the result
		numerals: [] // optionally pass an array of custom numerals for 0-9
	};

	// extend default options with passed options object
	if (options && typeof options === 'object') {
		for (var key in self.options) {
			if (options.hasOwnProperty(key) && options[key] !== null) {
				self.options[key] = options[key];
			}
		}
	}

	if (self.options.separator === '') {
		self.options.useGrouping = false;
	}
	else {
		// ensure the separator is a string (formatNumber assumes this)
		self.options.separator = '' + self.options.separator;
	}

	// make sure requestAnimationFrame and cancelAnimationFrame are defined
	// polyfill for browsers without native support
	// by Opera engineer Erik Möller
	var lastTime = 0;
	var vendors = ['webkit', 'moz', 'ms', 'o'];
	for(var x = 0; x < vendors.length && !window.requestAnimationFrame; ++x) {
		window.requestAnimationFrame = window[vendors[x]+'RequestAnimationFrame'];
		window.cancelAnimationFrame = window[vendors[x]+'CancelAnimationFrame'] || window[vendors[x]+'CancelRequestAnimationFrame'];
	}
	if (!window.requestAnimationFrame) {
		window.requestAnimationFrame = function(callback, element) {
			var currTime = new Date().getTime();
			var timeToCall = Math.max(0, 16 - (currTime - lastTime));
			var id = window.setTimeout(function() { callback(currTime + timeToCall); }, timeToCall);
			lastTime = currTime + timeToCall;
			return id;
		};
	}
	if (!window.cancelAnimationFrame) {
		window.cancelAnimationFrame = function(id) {
			clearTimeout(id);
		};
	}

	function formatNumber(num) {
		var neg = (num < 0),
        	x, x1, x2, x3, i, len;
		num = Math.abs(num).toFixed(self.decimals);
		num += '';
		x = num.split('.');
		x1 = x[0];
		x2 = x.length > 1 ? self.options.decimal + x[1] : '';
		if (self.options.useGrouping) {
			x3 = '';
			for (i = 0, len = x1.length; i < len; ++i) {
				if (i !== 0 && ((i % 3) === 0)) {
					x3 = self.options.separator + x3;
				}
				x3 = x1[len - i - 1] + x3;
			}
			x1 = x3;
		}
		// optional numeral substitution
		if (self.options.numerals.length) {
			x1 = x1.replace(/[0-9]/g, function(w) {
				return self.options.numerals[+w];
			})
			x2 = x2.replace(/[0-9]/g, function(w) {
				return self.options.numerals[+w];
			})
		}
		return (neg ? '-' : '') + self.options.prefix + x1 + x2 + self.options.suffix;
	}
	// Robert Penner's easeOutExpo
	function easeOutExpo(t, b, c, d) {
		return c * (-Math.pow(2, -10 * t / d) + 1) * 1024 / 1023 + b;
	}
	function ensureNumber(n) {
		return (typeof n === 'number' && !isNaN(n));
	}

	self.initialize = function() {
		if (self.initialized) return true;

		self.error = '';
		self.d = (typeof target === 'string') ? document.getElementById(target) : target;
		if (!self.d) {
			self.error = '[CountUp] target is null or undefined'
			return false;
		}
		self.startVal = Number(startVal);
		self.endVal = Number(endVal);
		// error checks
		if (ensureNumber(self.startVal) && ensureNumber(self.endVal)) {
			self.decimals = Math.max(0, decimals || 0);
			self.dec = Math.pow(10, self.decimals);
			self.duration = Number(duration) * 1000 || 2000;
			self.countDown = (self.startVal > self.endVal);
			self.frameVal = self.startVal;
			self.initialized = true;
			return true;
		}
		else {
			self.error = '[CountUp] startVal ('+startVal+') or endVal ('+endVal+') is not a number';
			return false;
		}
	};

	// Print value to target
	self.printValue = function(value) {
		var result = self.options.formattingFn(value);

		if (self.d.tagName === 'INPUT') {
			this.d.value = result;
		}
		else if (self.d.tagName === 'text' || self.d.tagName === 'tspan') {
			this.d.textContent = result;
		}
		else {
			this.d.innerHTML = result;
		}
	};

	self.count = function(timestamp) {

		if (!self.startTime) { self.startTime = timestamp; }

		self.timestamp = timestamp;
		var progress = timestamp - self.startTime;
		self.remaining = self.duration - progress;

		// to ease or not to ease
		if (self.options.useEasing) {
			if (self.countDown) {
				self.frameVal = self.startVal - self.options.easingFn(progress, 0, self.startVal - self.endVal, self.duration);
			} else {
				self.frameVal = self.options.easingFn(progress, self.startVal, self.endVal - self.startVal, self.duration);
			}
		} else {
			if (self.countDown) {
				self.frameVal = self.startVal - ((self.startVal - self.endVal) * (progress / self.duration));
			} else {
				self.frameVal = self.startVal + (self.endVal - self.startVal) * (progress / self.duration);
			}
		}

		// don't go past endVal since progress can exceed duration in the last frame
		if (self.countDown) {
			self.frameVal = (self.frameVal < self.endVal) ? self.endVal : self.frameVal;
		} else {
			self.frameVal = (self.frameVal > self.endVal) ? self.endVal : self.frameVal;
		}

		// decimal
		self.frameVal = Math.round(self.frameVal*self.dec)/self.dec;

		// format and print value
		self.printValue(self.frameVal);

		// whether to continue
		if (progress < self.duration) {
			self.rAF = requestAnimationFrame(self.count);
		} else {
			if (self.callback) self.callback();
		}
	};
	// start your animation
	self.start = function(callback) {
		if (!self.initialize()) return;
		self.callback = callback;
		self.rAF = requestAnimationFrame(self.count);
	};
	// toggles pause/resume animation
	self.pauseResume = function() {
		if (!self.paused) {
			self.paused = true;
			cancelAnimationFrame(self.rAF);
		} else {
			self.paused = false;
			delete self.startTime;
			self.duration = self.remaining;
			self.startVal = self.frameVal;
			requestAnimationFrame(self.count);
		}
	};
	// reset to startVal so animation can be run again
	self.reset = function() {
		self.paused = false;
		delete self.startTime;
		self.initialized = false;
		if (self.initialize()) {
			cancelAnimationFrame(self.rAF);
			self.printValue(self.startVal);
		}
	};
	// pass a new endVal and start animation
	self.update = function (newEndVal) {
		if (!self.initialize()) return;
		newEndVal = Number(newEndVal);
		if (!ensureNumber(newEndVal)) {
			self.error = '[CountUp] update() - new endVal is not a number: '+newEndVal;
			return;
		}
		self.error = '';
		if (newEndVal === self.frameVal) return;
		cancelAnimationFrame(self.rAF);
		self.paused = false;
		delete self.startTime;
		self.startVal = self.frameVal;
		self.endVal = newEndVal;
		self.countDown = (self.startVal > self.endVal);
		self.rAF = requestAnimationFrame(self.count);
	};

	// format startVal on initialization
	if (self.initialize()) self.printValue(self.startVal);
};

var gallerycontent = {
  image: [
    "nike",
    "training",
    "bathtub",
    "dressing",
    "touchdown",
    "snow",
    "scream",
    "couch",
    "smiling",
    "draft",
    "overcoat",
    "back"
  ],
  alt: [
    "Nike shirt",
    "Training",
    "In the bathtub",
    "Dressing a jacket",
    "Scoring a touchdown",
    "Working out on snow",
    "Screaming on the field",
    "Thinking about future",
    "Smiling shirtless",
    "Draft day",
    "Wearing an overcoat",
    "Odell Beckham Jr #13"
  ]
};

var marketcontent = {
  men: {
    image: [
      "men_hoodie_dark.jpg",
      "men_hoodie_light.jpg",
      "men_hoodie_red.jpg",
      "men_tshirt.jpg",
      "men_cap.jpg",
      "men_winter_hat.jpg",
    ],
    name: [
      "Men's Hoodie \"Super 13\"",
      "Men's Basic Hoodie",
      "Men's Running Hoodie",
      "Men's T-Shirt",
      "Men's Cap",
      "Men's Winter Hat"
    ],
    price: [
      "$85.00",
      "$75.00",
      "$99.00",
      "$20.00",
      "$25.00",
      "$20.00"
    ],
    rate: [
      5,
      4,
      5,
      4,
      3,
      4
    ]
  },
  women: {
    image: [
      "women_hoodie.jpg",
      "women_legging.jpg",
      "women_shorts.jpg",
      "women_jacket.jpg",
      "women_cap.jpg"
    ],
    name: [
      "Women's Running Hoodie",
      "Women's Legging",
      "Women's Sport Shorts",
      "Women's Sport Jacket",
      "Women's Sport Cap"
    ],
    price: [
      "$80.00",
      "$59.00",
      "$45.00",
      "$90.00",
      "$30.00"
    ],
    rate: [
      5,
      5,
      4,
      3,
      4
    ]
  },
  kids: {
    image: [
      "kids_dress.jpg",
      "kids_tshirt.jpg",
      "kids_shoes_set.jpg",
      "kids_gloves_set.jpg",
      "kids_jacket.jpg"
    ],
    name: [
      "Dress \"I Love OBJ\"",
      "T-shirt \"The Catch\"",
      "Toddler Shoes + Bib Set",
      "Hat + Gloves Winter Set",
      "Jacket \"Catchin' Blue\""
    ],
    price: [
      "$30.00",
      "$25.00",
      "$40.00",
      "$59.00",
    ],
    rate: [
      4,
      5,
      4,
      5,
      5
    ]
  },
  accessories: {
    image: [
      "accessories_cover.jpg",
      "accessories_mug.jpg",
      "accessories_bag.jpg",
      "accessories_watch.jpg",
      "accessories_watch_wallet.jpg"
    ],
    name: [
      "Cell Phone Cover",
      "Travel Mug",
      "Gym Bag",
      "Watch \"Super White\"",
      "Watch + Wallet Set"
    ],
    price: [
      "$15.00",
      "$30.00",
      "$49.00",
      "$119.00",
      "179.00"
    ],
    rate: [
      3,
      4,
      5,
      5,
      4
    ]
  }
};

var timelinecontent = {
  image: [
    {file: '1992', alt: 'Baby Odell'},
    {file: '2000', alt: 'Odell soccer'},
    {file: '2009', alt: 'Odell Newman High School'},
    {file: '2011', alt: 'Odell LSU'},
    {file: '2012', alt: 'Odell playing for LSU'},
    {file: '2013', alt: 'Odell NFL Draft day'},
    {file: '2014', alt: 'Odell catch'},
    {file: '2015', alt: 'Odell prize'},
    {file: '2016', alt: 'Odell playing for NY Giants'},
    {file: '2017', alt: 'Odell screaming on field'}
  ],
  year: [
    "1992",
    "2000",
    "2009",
    "2011",
    "2012",
    "2013",
    "2014",
    "2015",
    "2016",
    "2017"
  ],
  title: [
    "Born to be Savage",
    "Athletic childhood",
    "High school years",
    "College Debut",
    "A Tiger among Tigers",
    "From Junior to NFL",
    "The legend is born",
    "Offensive Rookie of the Year",
    "Kings do King Things",
    "The story continues…"
  ],
  desc: [
    "Beckham was born on November 5th, in Baton Rouge, Louisiana. He’s the oldest son from Odell Beckham Sr., that was a standout running back and played at LSU from 1989 to 1992 and Mrs. Heather Van Norman, that also attended LSU as a track runner.",
    "Odell was raised among sports, always encouraged by their parents. When he was just 4 he promised his mother he would play in the NFL. Since very young he already knew that this was his goal.",
    "He attended Isidore Newman School in New Orleans, where he was a letterman in football, basketball, and track. He chose Louisiana State University(LSU) over other scholarship offers to start his career.",
    "As a true freshman at LSU in 2011, Beckham started nine of 14 games. The Tigers made the BCS National Championship game in Beckham's freshman season. Overall, he recorded 41 receptions for 475 yards and two touchdowns. He was named a freshman All-SEC selection.",
    "In 2012, Beckham started 12 of 13 games for the Tigers. In the season, he had his first collegiate career punt return touchdown. He finished the season as the first on the team in receiving yards with 713 and second in receptions with 43.",
    "As a junior in 2013, Beckham was named the winner of the 2013 Paul Hornung Award, presented annually to the most versatile player in major college football. After the season, he decided to forego his senior season and entered the 2014 NFL Draft, being selected by the New York Giants in the first round.",
    "Beckham’s first season in NFL couldn’t begin better. On November, Beckham had 10 catches for 146 yards and two touchdowns in a game, including a one-handed touchdown reception hailed as the \"catch of the year\", being considered by many as one of the best catches ever.",
    "Beckham was named the Associated Press’ Offensive Rookie of the Year, the first Giants player to be so honored in the 58-year history of the award. Beckham also won the award for Play of the Year at NFL Honors as he is the first wide receiver in NFL history to reach 1,000 yards.",
    "In 2016, Beckham was a Pro Bowl selection for a third year in a row. The Giants returned to the playoffs for the first time since 2011. He was ranked 8th by his fellow players on the NFL Top 100 Players of 2017.",
    "On April 24, 2017, the Giants exercised Beckham's fifth year option. In four games, Beckham finished with 25 receptions for 302 yards and three touchdowns. Looking forward to the next season!"
  ]
};

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
