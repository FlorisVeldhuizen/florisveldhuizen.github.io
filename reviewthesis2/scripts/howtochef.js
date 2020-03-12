let steps, divOffset, howtochef, header, percentage, processpercentage, generalProgress;

function offset(el) {
    var rect = el.getBoundingClientRect(),
    scrollLeft = window.pageXOffset || document.documentElement.scrollLeft,
    scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    return { top: rect.top + scrollTop, left: rect.left + scrollLeft }
}

function fixedScrollProgressBar(){
  howtochef.style.position = "fixed";
  howtochef.style.top = header.clientHeight + "px";
  howtochef.style.height = 100 - percentage + "%";
}

function absoluteScrollProgressBar(){
  howtochef.style.position = "absolute";
  howtochef.style.top = divOffset + "px";
  howtochef.style.height = steps.clientHeight + "px";
}

function showScrollProgress() {
  let wi = window.innerWidth;
  if(wi > 1024) {
    let winScroll = document.body.scrollTop || document.documentElement.scrollTop;
    winScroll = winScroll - divOffset + header.clientHeight;
    if (winScroll < 0) {
      winScroll = 0;
      absoluteScrollProgressBar();
      drawSteps();
    } else if (0 <= winScroll && winScroll <= (steps.clientHeight-window.innerHeight)){
      fixedScrollProgressBar();
      drawSteps();
    } else {
      absoluteScrollProgressBar();
      drawStepsBottom();
    }
    let height = steps.clientHeight - document.documentElement.clientHeight;
    var scrolled = (winScroll / height) * 100;
    document.getElementById("howtochefBar").style.height = scrolled + "%";
  }
}

function drawSteps(){
  removeSteps();
  const stepN = 4;
  let nodes = document.getElementsByClassName("nodeStyle");
  for(let i = 0; i < stepN; i++){
    let newDiv = document.createElement("div");
    // and give it some content
    let newContent = document.createTextNode(i + 1);
    let curPos = ((window.innerHeight- 50 )/ stepN) * i;
    newDiv.appendChild(newContent);
    newDiv.classList.add("nodeStyle");
    newDiv.style.top = curPos + 50 +  "px";
    howtochef.appendChild(newDiv);
  }
}

function drawStepsBottom(){
  removeSteps();
  const stepN = 4;
  let nodes = document.getElementsByClassName("nodeStyle");
  for(let i = 0; i < stepN; i++){
    let newDiv = document.createElement("div");
    // and give it some content
    let newContent = document.createTextNode(stepN - i);
    let curPos = ((window.innerHeight- 50 )/ stepN) * i;
    newDiv.appendChild(newContent);
    newDiv.classList.add("nodeStyle");
    newDiv.style.bottom = curPos + 50 +  "px";
    howtochef.appendChild(newDiv);
  }
}

function removeSteps(){
  let nodes = document.getElementsByClassName("nodeStyle");
  for(let i = nodes.length - 1; i >= 0; i--){ //DIT MOET BACKWARDS OMDAT JS KANKER IS
    nodes[i].parentNode.removeChild(nodes[i]);
  }
}

function initApplication(){
  return new Promise (resolve => {
    steps = document.getElementById("allthesteps");
    header = document.getElementById("header");
    howtochef = document.getElementById("howtochefabsolution");
    percentage = (header.clientHeight / window.innerHeight) * 100;
    divOffset = offset(steps).top;
    resolve(divOffset);
  })
}

document.onreadystatechange = function () {
  if (document.readyState === 'complete') {
    const promise = initApplication();
    promise.then(function(){
      showScrollProgress();
    });
    // When the user scrolls the page, execute showScrollProgress
    window.onscroll = function() {showScrollProgress()};
    window.addEventListener('resize', function(event){
      const promise = initApplication();
      promise.then(function(){
        showScrollProgress();
      });
    });
  }
}
