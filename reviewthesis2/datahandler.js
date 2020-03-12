const datafolder = "data/";
let usercount = "usercount.txt"; //the file that stores the amount of users
let curuser = 0;
let userData = [];

// READ LOCAL TEXT FILES WITH XMLHTTP REQUEST AND PERFORM A GIVEN FILEACTION WITH IT
function readLocalTextFile(fileName, fileAction, asynchronous){
  let rawFile = new XMLHttpRequest();
  fileName = datafolder + fileName;
  rawFile.open("GET", fileName, asynchronous);      // needs to be given with the function as true or false
  rawFile.onreadystatechange = function (){
    if(this.readyState === 4){
      if(this.status === 200 || this.status == 0){
        fileAction(this);
      }
      else if(this.status === 404) {
        console.log('file does not exist');
      }
    }
  }
  rawFile.send(null);
}

function updateLocalTextFile(fileName, updateData, asynchronous){
  let data = new FormData();
  data.append("data" , JSON.stringify(updateData));
  let xhr = (window.XMLHttpRequest) ? new XMLHttpRequest() : new activeXObject("Microsoft.XMLHTTP");
  xhr.open( 'post', 'filehandler.php?name=' + datafolder + fileName + ".txt", asynchronous);
  xhr.send(data);
}

function addUser(){
  readLocalTextFile(usercount, setCount, false); // synchronous (false) because we need the rest of the script to wait for this inf
  curuser = userData.length;
  userData.push(curuser);
  updateLocalTextFile("usercount",userData,true);
  return curuser;
}

function setCount(file){
    userData = JSON.parse(file.responseText);
}

function checkUser(){
  readLocalTextFile(usercount, setCount, false); // synchronous (false) because we need the rest of the script to wait for this inf
  return userData.length;
}
