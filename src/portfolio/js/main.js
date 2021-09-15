import paper from "paper";

window.onload = () => {
  let charspeed = 1;
  const maxspeed = 6;
  const drag = 0.9;
  const canvas = document.getElementById("canvas");
  paper.setup(canvas);

    let charpos = new paper.Point(0,0);
    let movevector = new paper.Point(0,0);
    let speedvector = new paper.Point(0, 0);

    const pathArray = [];
    const maxArraylength = 20;

    // controller vars
    let upPressed = 0;
    let downPressed = 0;
    let leftPressed = 0;
    let rightPressed = 0;

    const keyup = (e) => {
      e = e || window.event;
      checkKey(e,0);
    }

    const keydown = (e) => {
      e = e || window.event;
      checkKey(e,1);
    }

    const setMovevector = () => {
      movevector.length = 0;
      movevector.y += -1 * upPressed;
      movevector.y += 1 * downPressed;
      movevector.x += -1 * leftPressed;
      movevector.x += 1 * rightPressed;
    }

    const checkKey = (e,keydown) => {
        if (e.keyCode == '38') {
            upPressed = keydown;
            // up arrow
        }
        if (e.keyCode == '40') {
            downPressed = keydown;
            // down arrow
        }
        if (e.keyCode == '37') {
            leftPressed = keydown;
          // left arrow
        }
        if (e.keyCode == '39') {
            rightPressed = keydown;
          // right arrow
        }
        setMovevector();
    }

    const speedqualizervector = () => {
      _movevector = new paper.Point(movevector.x, movevector.y);
      _movevector.normalize();
      _movevector.x = _movevector.x * charspeed;
      _movevector.y = _movevector.y * charspeed;
      speedvector.x += _movevector.x;
      speedvector.y += _movevector.y;

      //checks if the player moves faster than the maximum speed
      if( speedvector.length > maxspeed){
        speedvector.length = maxspeed;
      }
      // if the player is not moving, the character should stop
      if(!speedvector.isZero()){
        if(movevector.x==0) speedvector.x *= drag;
        if(movevector.y==0) speedvector.y *= drag;
      }
      speedvector.x *= drag;
      speedvector.y *= drag;
    }

    const pathHandler = (curPath) => {
      _curPath = curPath.clone();
      _curPath.scale(1.1);
      _curPath.strokeColor = 'blue';
      pathArray.push(_curPath);
      pathArray.forEach(function(item){
          item.scale(1.1);
      });
      if (pathArray.length > maxArraylength){
          pathArray.shift().remove();
      }
    }

    const drawPlayer = () => {
      path.add(charpos);
      path.strokeColor = 'black';
    }

    const init = () => {
      document.onkeydown = keydown;
      document.onkeyup = keyup;
      path = new paper.Path();
      path.add(charpos);
      path.strokeColor = 'black';
    }

    const optimization = () => {
      if(path.segments.length%maxArraylength==0){
        path.simplify(0.1);
      }
    }

    paper.view.onFrame = (event) => {
      speedqualizervector();
      charpos.x += speedvector.x;
      charpos.y += speedvector.y;
      drawPlayer();
      pathHandler(path);
      optimization();
    }

    init();
}
