let translateX = 0, translateY = 0;

function setOpts (standard, user) {
  if (typeof user === 'object') {
    for (var key in user) {
      standard[key] = user[key];
    }
  }
}

function randomNumber(min, max) {
    return Math.floor(Math.random() * (max - min) + min);
}

function drawRotatedShape(shape,x,y,width,height,degrees,color,direction){
      // first save the untranslated/unrotated context
      context.save();
      // move the rotation point to the center of the rect
      context.translate( x+width/2, y+height/2 );
      // rotate the rect
      if(direction == 'clockwise' ) {
         context.rotate(degrees*Math.PI/180);
      } else {
        context.rotate(-(degrees*Math.PI/180));
      }

  		context.fillStyle = color;
      context.lineWidth = 5;
      context.scale(width/80, height/80);
      context.beginPath();

      // draw the rect on the transformed context
      // Note: after transforming [0,0] is visually [x,y]
      //       so the rect needs to be offset accordingly when drawn
  		switch(shape) {
        case 'fork':
          context.translate(-65, -100);
          var p = new Path2D("M59,34.3L59,34.3l2.5-15.8l-0.6-0.1l-0.6-0.1l-3.7,15.5l-1.9-0.4l2.5-15.8l-0.6-0.1l-0.6-0.1L52.4,33l-1-0.2l-1-0.2L53,16.9l-0.6-0.1l-0.6-0.1l-3.7,15.5l-1.9-0.4L48.7,16l-0.6-0.1l-0.6-0.1l-3.7,15.5l0,0c-0.1,0.3-1.3,6.1,2.8,11.2l0,0l-8,34.9c0,0-1.5,5.9,2.6,6.7c4.2,0.8,5-5.2,5-5.2l5.8-35.3l0,0C58,40.5,59,34.6,59,34.3z");
          context.fill(p);
          break;
        case 'plate':
          context.arc(-width/2,-height/2, width*0.3, 0, Math.PI*2, true);
          context.stroke();
          context.moveTo(0,0);
          context.beginPath();
          context.arc(-width/2,-height/2, width*0.5, 0, Math.PI*2, true);
          context.stroke();
          break;
        case 'burger':
          context.translate(-100, -100);
          var p = new Path2D("M51,45.7C51,45.7,51,45.7,51,45.7l1.7-1.6c0.5-0.4,0.5-1.2,0-1.6c-0.2-0.2-0.5-0.4-0.8-0.3c-0.3,0-0.6,0.1-0.8,0.3l-1.6,1.6c-0.5,0.4-0.5,1.2,0,1.6C49.9,46.1,50.6,46.1,51,45.7z");
          context.fill(p);
          p = new Path2D("M60.2,45.7C60.3,45.7,60.3,45.7,60.2,45.7l1.7-1.7c0.5-0.4,0.5-1.2,0-1.6c-0.2-0.2-0.5-0.4-0.8-0.4c-0.3,0-0.6,0.1-0.8,0.3L58.7,44c-0.5,0.4-0.5,1.2,0,1.6C59.1,46.1,59.8,46.1,60.2,45.7z");
          context.fill(p);
          p = new Path2D("M69.5,45.7C69.5,45.7,69.5,45.7,69.5,45.7l1.7-1.7c0.5-0.4,0.5-1.2,0-1.6c-0.2-0.2-0.5-0.4-0.8-0.4c-0.3,0-0.6,0.1-0.8,0.3L67.9,44c-0.5,0.4-0.5,1.2,0,1.6C68.3,46.1,69,46.1,69.5,45.7z");
          context.fill(p);
          p = new Path2D("M41.8,45.7C41.8,45.7,41.8,45.7,41.8,45.7l1.7-1.6c0.5-0.4,0.5-1.2,0-1.6c-0.2-0.2-0.5-0.4-0.8-0.3c-0.3,0-0.6,0.1-0.8,0.3l-1.6,1.6c-0.5,0.4-0.5,1.2,0,1.6C40.6,46.1,41.4,46.1,41.8,45.7z");
          context.fill(p);
          p = new Path2D("M64.9,40.1c0.4,0.4,1.2,0.5,1.6,0c0.4-0.4,0.5-1.2,0-1.6c0,0,0,0,0,0l-1.6-1.6c-0.2-0.2-0.5-0.3-0.8-0.3c-0.6,0-1.1,0.5-1.1,1.1c0,0.3,0.1,0.6,0.3,0.8L64.9,40.1z");
          context.fill(p);
          p = new Path2D("M55.7,40.1c0.4,0.4,1.2,0.5,1.6,0c0.4-0.4,0.5-1.2,0-1.6c0,0,0,0,0,0l-1.6-1.6c-0.2-0.2-0.5-0.3-0.8-0.3c-0.6,0-1.1,0.5-1.1,1.1c0,0.3,0.1,0.6,0.3,0.8L55.7,40.1z");
          context.fill(p);
          p = new Path2D("M46.5,40.1c0.4,0.4,1.2,0.5,1.6,0c0.4-0.4,0.5-1.2,0-1.6c0,0,0,0,0,0l-1.6-1.6c-0.2-0.2-0.5-0.3-0.8-0.3c-0.6,0-1.1,0.5-1.1,1.1c0,0.3,0.1,0.6,0.4,0.8L46.5,40.1z");
          context.fill(p);
          p = new Path2D("M78.9,69.7v-3.2c1.1-0.7,1.8-1.9,1.8-3.3c0-1.4-0.7-2.6-1.8-3.3v-6h0.3c0.5,0,1-0.4,1.1-0.9c2.3-11.7-7.1-22.7-19.5-22.7H50.6h0c-12.4,0-21.8,11-19.5,22.7c0.1,0.5,0.6,0.9,1.1,0.9h0.3v6c-1.1,0.7-1.8,1.9-1.8,3.3c0,1.4,0.7,2.6,1.8,3.3v3.2c0,0-0.1,0.1-0.1,0.1c-1.1,1.1-1.7,2.7-1.7,4.3c0,3.5,2.9,6.4,6.5,6.4h37.1c3.5,0,6.5-2.9,6.5-6.4C80.7,72.4,80,70.9,78.9,69.7C79,69.7,78.9,69.7,78.9,69.7z M50.6,32.7h10.2c10.7,0,18.8,9.1,17.4,19.1H33.2C31.8,41.8,39.9,32.7,50.6,32.7z M76.6,58v1.3h-28c-0.4,0-0.7,0.2-0.9,0.5l-1.2,1.7l-1.2-1.7c-0.2-0.3-0.6-0.5-0.9-0.5h-9.6V58H76.6z M34.8,55.7V54h22.4v1.8H34.8z M59.4,55.7V54h8.2v1.8H59.4z M69.9,55.7V54h6.7v1.8H69.9z M74.2,78.2H37.1c-2.3,0-4.2-1.9-4.2-4.1c0-0.9,0.3-1.7,0.8-2.4h0h27.8l2.9,4.4c0.3,0.5,1,0.7,1.6,0.3c0.1-0.1,0.2-0.2,0.3-0.3l3.3-4.5h8.1c0.5,0.7,0.8,1.5,0.8,2.4C78.4,76.4,76.6,78.2,74.2,78.2z M34.8,69.4v-2.3h41.8v2.3H69c-0.4,0-0.7,0.2-0.9,0.5l-2.6,3.6l-2.3-3.5c-0.2-0.3-0.6-0.5-1-0.5H34.8z M76.7,64.9H34.6c-0.9,0-1.7-0.7-1.7-1.6c0-0.9,0.7-1.6,1.7-1.6h9.1l1.8,2.6c0.4,0.5,1.1,0.7,1.6,0.3c0.1-0.1,0.2-0.2,0.3-0.3l1.8-2.6h27.5c0.9,0,1.7,0.7,1.7,1.6C78.4,64.1,77.7,64.9,76.7,64.9z");
          context.fill(p);
          break;
        case 'pb-logo':
          context.translate(-340, -410);
          var p = new Path2D("M326.7,405.1c-1.7,1.2-3.2,2-3.3,2c0.7,1.2,1.2,2.4,1.2,3.7c0,1.7-0.7,3.1-2.1,4.5c-7.2,7-28.9,8-36.6,7.8c-2.1,0-3.8,1.6-3.8,3.6c-0.1,2,1.6,3.8,3.6,3.8c0.4,0,1.2,0,2.3,0c7.6,0,30.4-0.8,39.8-9.9c2.9-2.8,4.3-6.1,4.3-9.8c0-3.1-0.7-5.4-2.6-7.9C329.4,402.9,328.3,404.1,326.7,405.1z");
          context.fill(p);
          p = new Path2D("M320.6,395.1c-7.3-4.3-16.7-6.7-24.3-6.7c-4.2,0-7.6,0.7-10.2,2.1c-3.5,1.9-5.4,4.9-5.4,8.6c0,3.8,2.1,6.9,5.9,8.8c2.8,1.4,6.6,2.2,11.1,2.2c7.4,0,16.2-2,23-6c0,0,0,0,0,0s0.9-0.5,3.5-2.3c5.2-3.6,7.8-8.1,7.8-14.2c0-8.7-8.2-14.6-24.3-17.6c-1.9-3.1-6.7-5.5-12.2-6.1c-8.7-0.9-14.3-0.9-14.4,1.1c-0.1,2.4,5.3,2.3,14.1,3.1c0.5,0.1,0.9,0.5,0.9,1c-0.1,0.5-0.5,0.9-1.1,0.8c-7.6-0.5-14.4-1.2-14.6,1c-0.2,2.1,6.5,2.5,14.2,3.2c0.3,0,0.5,0.1,0.7,0.3c0.2,0.2,0.2,0.4,0.2,0.7c-0.1,0.5-0.5,0.9-1.1,0.8c-7.7-0.8-14.1-1.1-14.3,1c-0.2,1.9,4.9,2.3,13.7,3.2c0.8,0.1,1.6,0.1,2.3,0.1c4.5,0,8.3-0.9,10.5-3c11.3,2.2,17.9,5.9,17.9,10.3C324.6,390.4,323.1,392.9,320.6,395.1z M297.6,402.7c-3.2,0-6-0.5-7.7-1.4c-1.8-0.9-1.8-1.8-1.8-2.2c0-0.6,0.1-1.4,1.5-2.1c1.5-0.8,3.9-1.2,6.7-1.2c5.5,0,11.6,1.4,16.8,3.7C308.2,401.6,302.4,402.7,297.6,402.7z");
          context.fill(p);
          break;
        case 'knife':
          context.translate(-90, -70);
          var p = new Path2D("M 86.7 9.1 C 85.1 7.5 82.6 7.5 81 9.1 L 43 47.1 L 43.1 47 L 10.1 77.8 C 7.8 80.1 7.8 83.9 10.1 86.3 C 12.4 88.6 16.2 88.6 18.6 86.3 L 48.7 53.3 C 50.2 54 54.2 56 55.4 54.7 L 78.5 28.8 C 91.5 14.2 86.7 9.1 86.7 9.1 Z");
          context.fill(p);
          break;
        case 'chef-hat':
          context.translate(-90, -1000);
          var p = new Path2D("m 49.992648,961.35093 c -7.5782,0.009 -15.1537,3.69298 -18.0825,11.03094 -1.4388,-0.30181 -2.9308,-0.45969 -4.4562,-0.45969 -11.8202,0 -21.4541,9.61218 -21.4541,21.42969 0,11.12963 8.5454,20.30153 19.4141,21.33183 l 0,21.6572 c 0,0.067 0.0028,0.1338 0.0072,0.1997 0.0603,0.8993 0.5193,1.6671 1.0297,2.1994 0.5478,0.5712 1.1846,0.9766 1.9059,1.3434 1.4426,0.7336 3.2649,1.2929 5.4425,1.7703 4.3553,0.9547 10.1026,1.5197 16.2009,1.5197 6.0936,0 11.8382,-0.565 16.192204,-1.5197 2.1771,-0.4774 3.9992,-1.0367 5.4416,-1.7703 0.7212,-0.3668 1.3575,-0.7722 1.9053,-1.3434 0.518,-0.5402 0.9828,-1.3231 1.0319,-2.2397 a 2.0002,2.0002 0 0 0 0.005,-0.1594 l 0,-21.6569 c 10.877,-1.0296 19.424,-10.202 19.424,-21.33213 0,-11.8175 -9.6348,-21.42969 -21.464,-21.42969 -1.5187,0 -3.0078,0.15774 -4.4453,0.45938 -2.9352,-7.36943 -10.517504,-11.03915 -18.098204,-11.03063 z m -0.0015,4.04437 c 6.4401,-0.0109 12.883104,3.18203 14.777804,9.6097 a 2.0002,2.0002 0 0 0 0.9956,1.51968 2.0002,2.0002 0 0 0 0.085,0.0472 2.0002,2.0002 0 0 0 0.0403,0.0206 2.0002,2.0002 0 0 0 1.7772,0.0138 c 1.5416,-0.44533 3.1795,-0.68407 4.8691,-0.68407 9.6727,0 17.464,7.77656 17.464,17.42969 0,9.6531 -7.7913,17.4297 -17.464,17.4297 -3.3047,0 -6.375,-0.9073 -9.0035,-2.4941 2.7936,-2.8496 4.9863,-6.5447 6.3385,-10.71747 a 2.0002,2.0002 0 1 0 -3.805,-1.23282 c -1.4054,4.33679 -3.7641,7.92029 -6.689704,10.37129 a 2.0002,2.0002 0 0 0 -0.5725,0.459 c -2.6089,2.0051 -5.6282,3.1338 -8.8038,3.1338 -3.1861,0 -6.2153,-1.1359 -8.8312,-3.1538 a 2.0002,2.0002 0 0 0 -0.5272,-0.4234 c -2.936,-2.4516 -5.3046,-6.0419 -6.7181,-10.38907 a 2.0002,2.0002 0 1 0 -3.8041,1.23687 c 1.3562,4.171 3.5504,7.865 6.3441,10.7141 -2.6254,1.5866 -5.7036,2.4956 -9.0097,2.4956 -9.6616,-10e-5 -17.4541,-7.7766 -17.4541,-17.42973 0,-9.65312 7.7925,-17.42969 17.4541,-17.42969 1.6977,0 3.3334,0.23803 4.8731,0.68219 a 2.0002,2.0002 0 0 0 1.8209,-0.0312 2.0002,2.0002 0 0 0 0.0857,-0.0469 2.0002,2.0002 0 0 0 0.0369,-0.0222 2.0002,2.0002 0 0 0 0.9581,-1.49 c 1.8805,-6.39101 8.3199,-9.6079 14.7625,-9.61876 z m -10.3378,45.5868 c 3.0475,2.1048 6.5653,3.3191 10.3468,3.3191 3.7801,0 7.2964,-1.2135 10.3425,-3.3169 2.960704,2.0466 6.460604,3.3662 10.233504,3.7082 l 0,17.424 c -1.2435,-0.5073 -2.7073,-0.9248 -4.3825,-1.2931 -4.354304,-0.9574 -10.099404,-1.525 -16.193504,-1.525 -6.0989,0 -11.8467,0.5676 -16.2022,1.525 -1.6758,0.3684 -3.1402,0.7857 -4.384,1.2931 l 0,-17.424 c 3.7753,-0.3417 7.2809,-1.6612 10.2394,-3.7104 z m 10.3468,22.3163 c 5.8415,0 11.3845,0.563 15.334404,1.4316 1.975,0.4342 3.5592,0.9602 4.485,1.4318 0.1195,0.061 0.2266,0.1211 0.3222,0.1785 -0.0953,0.057 -0.2022,0.1172 -0.3212,0.1778 -0.9257,0.4708 -2.51,0.9953 -4.485,1.4284 -3.950204,0.8662 -9.493304,1.4269 -15.335404,1.4269 -5.8471,0 -11.393,-0.5607 -15.3443,-1.4269 -1.9757,-0.4331 -3.5602,-0.958 -4.486,-1.4287 -0.119,-0.061 -0.2262,-0.1204 -0.3215,-0.1775 0.0956,-0.057 0.203,-0.1176 0.3225,-0.1785 0.9259,-0.4716 2.5103,-0.9976 4.4859,-1.4318 3.9512,-0.8686 9.4969,-1.4316 15.3434,-1.4316 z");
          context.fill(p);
          break;
      }
      // restore the context to its untranslated/unrotated state
      context.restore();
}

// Initialise an empty canvas and place it on the page
var canvas = document.getElementById("geometric");
var context = canvas.getContext("2d");
var backdrop = document.getElementById("backdrop");

$(canvas).attr('width', $(window).width()).attr('height', $(backdrop).height());
$('.accent').height($(backdrop).height());

$(window).resize(function() {
  $(canvas).attr('width', $(window).width()).attr('height', $(backdrop).height());
	$('.accent').height($(backdrop).height());
});

//$(canvas).width($(window).width());

 var particles = {},
     particleIndex = 0,
    settings;

 // Set up a function to create multiple particles
function Particle(x,y) {
  // Establish starting positions and velocities
  this.x = x;
  this.y = y;

  // Determine original X-axis speed based on setting limitation
  this.vx = Math.floor(randomNumber(0, 10));
  this.vy = Math.floor(randomNumber(0, 10));

  this.size = Math.floor(randomNumber(settings.minSize, settings.maxSize));

  this.rotation = Math.floor(randomNumber(0, 180));

  if(randomNumber(0,100) > 50) {
    this.rotationDirection = 'clockwise';
  } else {
    this.rotationDirection = 'counter-clockwise';
  }

  this.shape = settings.shapes[randomNumber(0, settings.shapes.length)];

  // Add new particle to the index
  // Object used as it's simpler to manage that an array
  particleIndex ++;
  particles[particleIndex] = this;
  this.id = particleIndex;

  this.life = 0;
  this.maxLife = 10000;
}

// Some prototype methods for the particle's "draw" function
Particle.prototype.draw = function() {
 // this.x +=  1;
  this.y +=  settings.gravity * Math.floor(randomNumber(1, 2));

  // Adjust for gravity
  this.vy += settings.gravity * Math.floor(randomNumber(0.5, 8));

  // Age the particle
  this.life++;

  if(this.rotation == 'clockwise') {
    this.rotation += settings.rotationVelocity;
  } else {
     this.rotation -= settings.rotationVelocity;
  }

  // If Particle is old, it goes in the chamber for renewal
  if (this.life >= this.maxLife) {
    delete particles[this.id];
  }

   // Create the shapes
    var size = this.size;
    context.clearRect(canvas.width, canvas.height, canvas.width, canvas.height);
    //context.beginPath();
    context.fillStyle = settings.color;
    //context.rect(this.x,this.y, size, size);
    drawRotatedShape(this.shape, this.x, this.y, size, size, this.rotation, settings.color, this.rotationDirection);
    //context.closePath();

    //context.fill();

/*    if(settings.rotation == true) {
      context.rotate(this.rotation);
    }*/

};

function shapify(preset) {

  switch(preset) {
    case 'math':
       settings = {
        density: 50,
        velocity: 1,
        //startingX: canvas.width / 2,
        //startingY: canvas.height / 4,
        gravity: -0.6,
        color: 'rgba(0,0,0,0.5)',
        maxSize: 100,
        minSize: 20,
        rotation: true,
        rotationVelocity: 0.1,
        shapes: ['fork', 'burger', 'knife', 'pb-logo', 'chef-hat']
      };
      break;
    case 'science':
      settings = {
        density: 5,
        velocity: 1,
        //startingX: canvas.width / 2,
        //startingY: canvas.height / 4,
        gravity: -0.6,
        color: 'rgba(0,0,0,0.3)',
        maxSize: 100,
        minSize: 15,
        rotation: true,
        rotationVelocity: 0.05,
        shapes: ['cell', 'dna']
      };
      break;
  }
  for(var i=0; i < settings.density; i++) {
    new Particle(Math.floor(randomNumber(0, canvas.width)), Math.floor(randomNumber(0, canvas.height)));
  }

  for (let p in particles) {
    particles[p].draw();
  }

  setInterval(function() {
    context.strokeStyle = 'rgba(0,0,0,0.4)';
    context.fillStyle = "#adabab";
    context.fillRect(0, 0, canvas.width, canvas.height);

    // Draw the particles
    for (var i = 0; i < settings.density; i++) {
      if (Math.random() > 0.999) {
        // Introducing a random chance of creating a particle
        // corresponding to an chance of 1 per second,
        // per "density" value
        new Particle(Math.floor(randomNumber(0, canvas.width)), (canvas.height + 70));
      }
    }

    for (var p in particles) {
      particles[p].draw();
    }
  }, 30);
}

shapify('math');
