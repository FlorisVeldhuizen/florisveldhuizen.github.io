function openTab(evt, tabName, textName) {
    var i, tabcontent, tablinks;
    tabcontent = document.getElementsByClassName("tabcontent");
    for (i = 0; i < tabcontent.length; i++) {
        tabcontent[i].style.display = "none";
    }

    tablinks = document.getElementsByClassName("tablinks");
    for (i = 0; i < tablinks.length; i++) {
        tablinks[i].className = tablinks[i].className.replace(" active", "");
    }
    document.getElementById(tabName).style.display = "block";
    evt.currentTarget.className += " active";

    textcontent = document.getElementsByClassName("textlinks")
    for (i = 0; i < textcontent.length; i++) {
        textcontent[i].className  = textcontent[i].className.replace("on", "off");

        if(textcontent[i].id == textName){
          textcontent[i].className  = textcontent[i].className.replace("off","on");
        }
    }
}

// Get the element with id="defaultOpen" and click on it
document.getElementById("defaultOpen").click();
// document.getElementById("defaultShow").click();