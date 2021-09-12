(this["webpackJsonpflorisveldhuizen.github.io"]=this["webpackJsonpflorisveldhuizen.github.io"]||[]).push([[0],{50:function(e,t,n){},51:function(e,t,n){},86:function(e,t){},93:function(e,t,n){"use strict";n.r(t);var s=n(1),i=n.n(s),o=n(40),c=n.n(o),r=n(11),a=(n(50),n(51),n(0)),h=function(){return Object(a.jsxs)(a.Fragment,{children:[Object(a.jsxs)("div",{className:"container",children:[Object(a.jsx)("h1",{children:" Random projects"}),Object(a.jsxs)("ol",{children:[Object(a.jsxs)("li",{children:[Object(a.jsx)("a",{href:"fractals/index.html",children:" Mandelbrot Fractal "})," ",Object(a.jsx)("span",{className:"right",children:" (Drag mouse and scroll to interact)"})]}),Object(a.jsxs)("li",{children:[Object(a.jsx)("a",{href:"portfolio/index.html",children:" Lines "})," ",Object(a.jsx)("span",{className:"right",children:"(Use arrow keys) "})]}),Object(a.jsxs)("li",{children:[Object(a.jsx)(r.b,{to:"/walking_p5",children:" Footsteps "})," ",Object(a.jsx)("span",{className:"right",children:"(Use arrow keys or mouseclicks) "})]}),Object(a.jsxs)("li",{children:[Object(a.jsx)("a",{href:"chesspath/index.html",children:" Prince Chazz "})," ",Object(a.jsx)("span",{className:"right",children:"(Chess with a twist) "})]}),Object(a.jsx)("li",{children:Object(a.jsx)("a",{href:"card_js/index.html",children:" Card JS "})}),Object(a.jsxs)("li",{children:[Object(a.jsx)(r.b,{to:"/rain_p5",children:" Rain "})," ",Object(a.jsx)("span",{className:"right",children:"(Move around your mouse) "})," "]}),Object(a.jsxs)("li",{children:[Object(a.jsx)("a",{href:"qr_scan/index.html",children:" QR code test "})," ",Object(a.jsx)("span",{className:"right",children:"(Try holding a QR code in front of your webcam) "})]}),Object(a.jsxs)("li",{children:[Object(a.jsx)("a",{href:"p5_frames/index.html",children:" Funky frames "})," ",Object(a.jsx)("span",{className:"right",children:"Move the mouse, and press r, c, p and m "})]}),Object(a.jsxs)("li",{children:[Object(a.jsx)(r.b,{to:"/funky_snake",children:"Funky Snake "})," ",Object(a.jsx)("span",{className:"right",children:"(Use arrow keys) "})]})]})]}),Object(a.jsx)("h2",{id:"secretsloth",children:" \ud83e\udda5"})]})},l=n(14),d=function(e){function t(e,t,n){var s=e.copy();return s.lerp(t,n),s}var n,s,i,o,c,r,a,h,l=0,d=0,u=!1,f=!1,x=!1,j=0,p=.9,m=0,w=0,R=0,y=0;function O(){u=!1,h.mult(0),h.y+=-1*m,h.y+=1*w,h.x+=-1*R,h.x+=1*y,h.normalize()}function b(){var t=arguments.length>0&&void 0!==arguments[0]?arguments[0]:e.mouseX,s=arguments.length>1&&void 0!==arguments[1]?arguments[1]:e.mouseY,i=e.createVector(0,0);i.x=t-n.x,i.y=s-n.y,i.magSq()>15?h=i.normalize():(a.mult(Math.pow(p,2)),h.mult(0),u=!1)}function g(t,n,s){var i=e.sin(s),o=e.cos(s);t.sub(n);var c=t.x*o-t.y*i,r=t.x*i+t.y*o;return t.x=c+n.x,t.y=r+n.y,t}e.setup=function(){e.createCanvas(e.windowWidth,e.windowHeight),h=e.createVector(0,0),a=e.createVector(0,0),s=e.createVector(0,0),n=e.createVector(e.windowWidth/2,e.windowHeight/2),i=e.createVector(n.x-20,n.y),o=e.createVector(n.x+20,n.y),c=e.createVector(n.x-20,n.y),r=e.createVector(n.x+20,n.y)},e.draw=function(){e.background(255,255,255,255),f?(e.ellipse(e.mouseX,e.mouseY,40,40),b()):u&&(e.ellipse(s.x,s.y,40,40),b(s.x,s.y)),function(){a.add(h.mult(1)),a.limit(4);var t=a.magSq();t>0&&(t.toFixed(2)>0?(0===h.x&&(a.x*=p),0===h.y&&(a.y*=p),d=a.heading()+e.HALF_PI):(a.mult(0),d=l));n.add(a)}(),function(){var s=d-l;o.add(a),i.add(a),i=g(i,n,s),o=g(o,n,s),x?x&&(r=t(r,o,.1)):c=t(c,i,.1);e.ellipse(c.x,c.y,10,10),e.ellipse(r.x,r.y,10,10)}(),l=d,j>25&&(j=0,x=!x),j++},e.keyPressed=function(){e.keyCode===e.LEFT_ARROW&&(R=1),e.keyCode===e.RIGHT_ARROW&&(y=1),e.keyCode===e.UP_ARROW&&(m=1),e.keyCode===e.DOWN_ARROW&&(w=1),O()},e.keyReleased=function(){e.keyCode===e.LEFT_ARROW&&(R=0),e.keyCode===e.RIGHT_ARROW&&(y=0),e.keyCode===e.UP_ARROW&&(m=0),e.keyCode===e.DOWN_ARROW&&(w=0),O()},e.mousePressed=function(){f=!0,u=!1},e.mouseReleased=function(){f=!1,u=!0,s.x=e.mouseX,s.y=e.mouseY,h.x=0,h.y=0},e.windowResized=function(){e.resizeCanvas(e.windowWidth,e.windowHeight)}},u=function(){return Object(a.jsx)(l.a,{sketch:d})},f=function(e){var t=[],n=100;function s(){this.x=e.random(e.width),this.y=e.random(-10,-e.height),this.speed=e.random(0,2),this.falling=!0,this.splash=!1,this.splashlocx=0,this.splashlocy=e.height,this.splashprocess=0,this.windpower=10,this.show=function(){this.splash&&(e.stroke(255),e.line(this.splashlocx,this.splashlocy,this.splashlocx-e.random(4,11),this.splashlocy-e.random(5,10)),e.line(this.splashlocx,this.splashlocy,this.splashlocx,this.splashlocy-e.random(10,16)),e.line(this.splashlocx,this.splashlocy,this.splashlocx+e.random(4,11),this.splashlocy-e.random(5,10)),e.fill(e.color(0)),e.noStroke(),e.circle(this.splashlocx,this.splashlocy,this.splashprocess),this.splashprocess++,this.splashprocess>16&&(this.splash=!1,this.falling=!0,this.splashprocess=0)),this.falling&&(e.stroke(255),e.line(this.x,this.y,this.x+this.windpower,this.y+this.speed))},this.fall=function(){var t,s;this.falling&&(this.x=this.x+this.windpower,this.y=this.y+this.speed,this.speed=this.speed+.1,this.y>e.height?i(this,e.height):(t=this.x,s=this.y,t>e.mouseX-50&&t<e.mouseX+50&&s>e.mouseY&&s<e.mouseY+n&&i(this,this.y)),this.x>e.width&&(this.x=0),this.x<0&&(this.x=e.width))},this.wind=function(){this.windpower=-(e.width/2-e.mouseX)/100}}function i(t,n){t.splash=!0,t.falling=!1,t.splashlocy=n,t.splashlocx=t.x,t.x=e.random(e.width),t.y=-10,t.speed>20&&(t.speed=20)}e.setup=function(){e.createCanvas(e.windowWidth,e.windowHeight);for(var n=0;n<180;n++)t.push(new s)},e.draw=function(){e.background(0,0,0,100);for(var n=0;n<t.length;n++)t[n].wind(),t[n].fall(),t[n].show()},e.windowResized=function(){e.resizeCanvas(e.windowWidth,e.windowHeight),t=[];for(var n=0;n<180;n++)t.push(new s)}},x=function(){return Object(a.jsx)(l.a,{sketch:f})},j=n(45),p=n(26),m=function(e){var t,n,s,i,o,c,r,a,h=400,l=14,d=!1,u=-1,f=120,x=!0,m=-1,w=0,R=[0,0],y=[],O=4,b=!1,g=0,_=[0,0],k=Math.floor(60/13),P=0;e.setup=function(){e.createCanvas(e.windowWidth,e.windowHeight),e.background(0,0,0,100),t=e.windowWidth/2-200,n=e.windowHeight/2-200,s=28.571428571428573,i=Math.floor(400/s),o=l*i,T()},e.draw=function(){d&&F(),g>k&&(e.background(0,0,0,100),E(),A(),C(),W(),g=0),d&&H(),b&&v(),g++,I()};var v=function(){e.fill(255),e.rect(0,0,e.windowWidth,e.windowHeight),e.background(0,0,0,100),O=4,y=[],b=!1},A=function(){e.stroke(255),e.fill(0);for(var o=0;o<l;o++)for(var c=0;c<i;c++)e.rect(o*s+t,c*s+n,s,s)},I=function(){var s=O-4;s>P&&(P=s),e.textSize(30),e.fill(255),e.textAlign(e.RIGHT),e.text("".concat(String.fromCodePoint(127942),": ").concat(P),t+h,n-30),e.textAlign(e.LEFT),e.text("".concat(String.fromCodePoint(127852),": ").concat(s),t,n-30)},T=function(){return _=O<o/2?function e(){var t=Math.floor(Math.random()*l),n=Math.floor(Math.random()*i);return y.some((function(e){return e[0]===t&&e[1]===n}))?e():[t,n]}():function(){var e={};Object(p.a)(Array(l)).forEach((function(t,n){return e[n]=Object(p.a)(Array(i).keys())}));for(var t=function(){var t=Object(j.a)(s[n],2),i=t[0],o=t[1],c=parseInt(i);e[i]=o.filter((function(e){return!y.some((function(t){return t[0]===c&&t[1]===e}))})),e[i].length<1&&delete e[i]},n=0,s=Object.entries(e);n<s.length;n++)t();var o=Object.keys(e),c=parseInt(o[Math.floor(Math.random()*o.length)]);return[c,e[c][Math.floor(Math.random()*e[c].length)]]}()},W=function(){e.textSize(32),e.text("".concat(String.fromCodePoint(127852)),_[0]*s+t,(_[1]+.9)*s+n)},E=function(){c=w,-1!==m&&(w=m,m=-1),x=!0,3===c?R[1]--:1===c?R[1]++:2===c?R[0]--:0===c&&R[0]++,R[1]<0?R[1]=i-1:R[1]>i-1?R[1]=0:R[0]<0?R[0]=13:R[0]>13&&(R[0]=0),y.length>O&&y.shift(),y.forEach((function(e){R[0]===e[0]&&R[1]===e[1]&&(b=!0,console.error("U DEAD ".concat(String.fromCodePoint(128128))))})),y.push([].concat(R)),R[0]===_[0]&&R[1]===_[1]&&(O++,T())},C=function(){var i=Math.floor(155/O);y.forEach((function(o,c){e.fill(c*i+100,0,0),e.rect(o[0]*s+t,o[1]*s+n,s,s)}))},U=function(e){w!==c&&(m=e),2!==Math.abs(e-c)&&x&&(w=e,x=!1),u=e},F=function(){var t=Math.atan2(e.mouseY-a,e.mouseX-r);t<0&&(t+=e.TWO_PI),function(e,t,n,s){var i=n-e,o=s-t;return i*i+o*o}(r,a,e.mouseX,e.mouseY)>100?t>e.TWO_PI-e.QUARTER_PI||t<e.QUARTER_PI?U(0):t>e.QUARTER_PI&&t<e.HALF_PI+e.QUARTER_PI?U(1):t>e.HALF_PI+e.QUARTER_PI&&t<e.PI+e.QUARTER_PI?U(2):t>e.PI+e.QUARTER_PI&&t<e.TWO_PI-e.QUARTER_PI&&U(3):u=-1},H=function(){e.fill(100),e.ellipse(r,a,f,f),e.fill(200),3===u&&e.arc(r,a,f,f,e.PI+e.QUARTER_PI,e.TWO_PI-e.QUARTER_PI),1===u&&e.arc(r,a,f,f,e.QUARTER_PI,e.HALF_PI+e.QUARTER_PI),2===u&&e.arc(r,a,f,f,e.HALF_PI+e.QUARTER_PI,e.PI+e.QUARTER_PI),0===u&&e.arc(r,a,f,f,e.TWO_PI-e.QUARTER_PI,e.QUARTER_PI),e.fill(50),e.ellipse(e.mouseX,e.mouseY,60,60)},M=function(){return d=!1,!1},Q=function(){return r=e.mouseX,a=e.mouseY,d=!0,!1},z=function(e,t,n,s,i){e===i&&U(0),e===n&&U(1),e===s&&U(2),e===t&&U(3)};e.mousePressed=function(){return Q()},e.touchStarted=function(){return Q()},e.mouseReleased=function(){return M()},e.touchEnded=function(){return M()},e.keyTyped=function(){z(e.key,"w","s","a","d")},e.keyPressed=function(){z(e.keyCode,e.UP_ARROW,e.DOWN_ARROW,e.LEFT_ARROW,e.RIGHT_ARROW)},e.windowResized=function(){e.resizeCanvas(e.windowWidth,e.windowHeight),e.background(0,0,0,100),t=e.windowWidth/2-200,n=e.windowHeight/2-200,s=28.571428571428573}},w=function(){return Object(a.jsx)(l.a,{sketch:m})},R=n(2);var y=function(){return Object(a.jsx)(a.Fragment,{children:Object(a.jsxs)(R.c,{children:[Object(a.jsx)(R.a,{exact:!0,path:"/",component:h}),Object(a.jsx)(R.a,{path:"/walking_p5",component:u}),Object(a.jsx)(R.a,{path:"/rain_p5",component:x}),Object(a.jsx)(R.a,{path:"/funky_snake",component:w})]})})},O=function(e){e&&e instanceof Function&&n.e(3).then(n.bind(null,94)).then((function(t){var n=t.getCLS,s=t.getFID,i=t.getFCP,o=t.getLCP,c=t.getTTFB;n(e),s(e),i(e),o(e),c(e)}))};c.a.render(Object(a.jsx)(i.a.StrictMode,{children:Object(a.jsx)(r.a,{children:Object(a.jsx)(y,{})})}),document.getElementById("root")),O()}},[[93,1,2]]]);
//# sourceMappingURL=main.980e1894.chunk.js.map