var tresholdValue = 200;
function handleStack(stack_elem, maxStacksize) {
    maxStacksize = maxStacksize || 5;
    var bottomPos = 0;
    var stack = document.getElementById(stack_elem);
    //convert nodelist of cards into an array
    var cards = Array.prototype.slice.call(stack.querySelectorAll("#" + stack_elem + ">div"));
    // adjust max size of visible stack according to size of array
    if (cards.length < maxStacksize) maxStacksize = cards.length;
    var i1 = 0;
    cards.forEach(function(element) {
        element.classList.add("card"); //every element in the cardstack is a card
        var label = document.createElement("div"); //create new div that becomes the cardlabel
        var textnode = document.createTextNode(i1 + 1); //add number of the card
        label.appendChild(textnode);
        label.classList.add("label");
        element.appendChild(label); //add the label to the card
        element.style.zIndex = element.style.zIndex + (cards.length - i1);
        if (i1 < maxStacksize - 1) {
            element.style.top = element.style.top + i1 * 4 + "px";
            bottomPos = element.offsetTop;
        } else {
            element.style.top = element.style.top + (maxStacksize - 1) * 4 + "px";
            bottomPos = element.offsetTop;
            if (i1 > maxStacksize - 1) element.style.display = "none";
        }
        i1++;
    });
    function nextCard() {
        if (cards.length > maxStacksize) cards[cards.length - 1].style.display = "none";
        var curElem = cards.shift();
        cards.push(curElem);
        var i = 0;
        cards.forEach(function(element) {
            element.style.zIndex = cards.length - i;
            if (i < maxStacksize - 1) {
                element.style.display = "block";
                element.style.top = element.offsetTop - 4 + "px";
            }
            i++;
        });
        dragElement(cards[0]);
    }
    function dragElement(elmnt) {
        //lock element in starting position
        var offsetX = 0, offsetY = 0, curLeft = 0, curTop = 0, hoverValue = 10;
        (function setup() {
            elmnt.addEventListener("mouseenter", hoverCard);
            elmnt.addEventListener("touchstart", dragFingerDown);
        })();
        function translateEZ(x, y) {
            elmnt.style.left = x + 'px';
            elmnt.style.top = y + 'px';
        }
        function cardlift() {
            elmnt.classList.add("lifted");
        }
        function carddrop() {
            elmnt.classList.remove("lifted");
            elmnt.style.transform = "";
        }
        function hoverCard(e) {
            e = e || window.event;
            e.preventDefault();
            cardlift();
            hoverValue = 10;
            elmnt.addEventListener("mousedown", dragMouseDown);
            elmnt.addEventListener("mouseleave", stopHoverCard);
        }
        function stopHoverCard(e) {
            e = e || window.event; //kijk hier ff naar bitch
            e.preventDefault();
            carddrop();
            elmnt.removeEventListener("mousedown", dragMouseDown);
            elmnt.removeEventListener("mouseleave", stopHoverCard);
        }
        function dragMouseDown(e) {
            e = e || window.event;
            e.preventDefault();
            cardlift();
            //get mousepos relative to active div
            offsetX = e.clientX - elmnt.offsetLeft;
            offsetY = e.clientY - elmnt.offsetTop;
            document.addEventListener("mouseup", closeDragMouse);
            document.addEventListener("mousemove", elementDrag);
        }
        function dragFingerDown(e) {
            e = e || window.event; //kijk hier ff naar bitch
            e.preventDefault();
            cardlift();
            offsetX = e.touches[0].clientX - elmnt.offsetLeft;
            offsetY = e.touches[0].clientY - elmnt.offsetTop;
            document.addEventListener("touchend", closeDragTouch);
            document.addEventListener("touchmove", elementDrag_touch);
        }
        function elementDrag(e) {
            e = e || window.event;
            e.preventDefault();
            elmnt.removeEventListener("mouseleave", stopHoverCard);
            // calculate the new div position (based on cursor pos, starting pos, and cursor offset on active div):
            curLeft = e.clientX - offsetX;
            curTop = e.clientY - offsetY + hoverValue;
            // set the element's new position:
            elmnt.style.transform = "translate(" + curLeft + "px," + curTop + "px) rotate(" + curLeft / 30 + "deg)";
        }
        function elementDrag_touch(e) {
            e = e || window.event;
            e.preventDefault();
            // calculate the new div position (based on cursor pos, starting pos, and cursor offset on active div):
            curLeft = e.touches[0].clientX - offsetX;
            curTop = e.touches[0].clientY - offsetY;
            // set the element's new position:
            elmnt.style.transform = "translate(" + curLeft + "px," + curTop + "px) rotate(" + curLeft / 30 + "deg)";
        }
        function closeDragMouse(e) {
            e = e || window.event;
            e.preventDefault();
            // stop moving when mouse button is released:
            document.removeEventListener("mouseup", closeDragMouse);
            document.removeEventListener("mousemove", elementDrag);
            //return element to the stack
            carddrop();
            hoverValue = 0;
            //add timeout for card animation
            if (Math.abs(curLeft) > tresholdValue) {
                elmnt.removeEventListener("mouseenter", hoverCard);
                elmnt.removeEventListener("mousedown", dragMouseDown);
                elmnt.removeEventListener("touchstart", dragFingerDown);
                translateEZ(0, bottomPos);
                nextCard();
            }
        }
        function closeDragTouch(e) {
            e = e || window.event;
            e.preventDefault();
            // stop moving when touch is released:
            document.removeEventListener("touchend", closeDragTouch);
            document.removeEventListener("touchmove", elementDrag_touch);
            //return element to the stack
            carddrop();
            //add timeout for card animation
            if (Math.abs(curLeft) > tresholdValue) {
                elmnt.removeEventListener("mouseenter", hoverCard);
                elmnt.removeEventListener("touchstart", dragFingerDown);
                translateEZ(0, bottomPos);
                nextCard();
            }
        }
    }
    //Make the top DIV element draggable:
    dragElement(cards[0]);
}
handleStack("stack");
handleStack("stack2", 3);

//# sourceMappingURL=index.bd9430ea.js.map
