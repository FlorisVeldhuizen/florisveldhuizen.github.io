/* Script necessary to load data into page*/
String.prototype.capitalize = function() {
    return this.replace(/(?:^|\s)\S/g, function(a) { return a.toUpperCase(); });
};

function loadImageslider(imageObj,mealname,chefname){
    const objlength = obj => {
      return Object.keys(obj).length;
    }
    if(objlength(imageObj)>0){
      $('.listing-slider').slick({
         centerMode: true,
         centerPadding: '20%',
         slidesToShow: 2,
         responsive: [
           {
             breakpoint: 1367,
             settings: {
               centerPadding: '15%'
             }
           },
           {
             breakpoint: 1025,
             settings: {
               centerPadding: '0'
             }
           },
           {
             breakpoint: 767,
             settings: {
               centerPadding: '0',
               slidesToShow: 1
             }
           }
         ]
       });
       //fixing some weird mobile bugs when uploading only 1 image
       if(objlength(imageObj)==1){
         Object.entries(imageObj).forEach(
            ([key, value]) => {
              for(let i = 0; i<3; i++){
                $('.listing-slider').slick('slickAdd','<a href="' + value + '" data-background-image="' + value + '" style="background-image:url(' + value + ')" class="item mfp-gallery" title="' + mealname + " by " + chefname + " - " + (parseInt(key)+1) +  '"></a>' );
              }
            }
         );
       }
       else if(objlength(imageObj)==2){
           for(let i = 0; i<2; i++){
             Object.entries(imageObj).forEach(
                ([key, value]) => {
                    $('.listing-slider').slick('slickAdd','<a href="' + value + '" data-background-image="' + value + '" style="background-image:url(' + value + ')" class="item mfp-gallery" title="' + mealname + " by " + chefname + " - " + (parseInt(key)+1) +  '"></a>' );
                }
             );
           }
       } else {
         Object.entries(imageObj).forEach(
            ([key, value]) => {
              $('.listing-slider').slick('slickAdd','<a href="' + value + '" data-background-image="' + value + '" style="background-image:url(' + value + ')" class="item mfp-gallery" title="' + mealname + " by " + chefname + " - " + (parseInt(key)+1) +  '"></a>' );
            }
         );
       }
     } else {
       document.getElementById('image-slider').style.display = 'none';
     }
}

function loadPage(data){
  const getType = p => {
    if (Array.isArray(p)) return 'array';
    else if (typeof p === 'string') return 'string';
    else if (p !== null && typeof p === 'object') return 'object';
    else return 'other';
  }

  const gtfo = () => {
    alert('There was an error with loading your link. You will be redirected to our homepage!');
    window.location.href='https://picobelly.com';
    return;
  }

  let json = data;
  if(getType(data) !== 'object'){
    console.log('parsed data has type: ' + typeof(data) + ', not an object. Converting...');
    try {
        json = JSON.parse(String(data));
    } catch(e) {
      console.error(e);
      gtfo();
    }
  }

  const fillClass = (c,jsondata,pos) => {
    let _c = document.getElementsByClassName(c);
    for (let i = 0; i < _c.length; i++) {
      if(pos=="after")
        _c[i].innerHTML += jsondata;
      else if (pos=="before")
        _c[i].innerHTML = jsondata + _c[i].innerHTML;
      else
        console.error("use before or after");
    }
  }

  const fillId = (id,jsondata,pos) => {
    let _id = document.getElementById(id);
    if(pos=="after")
      _id.innerHTML += jsondata;
    else if (pos=="before")
      _id.innerHTML = jsondata + _id.innerHTML;
    else
      console.error("use before or after");
  }

  //check if there is content to load
  if(typeof json == 'undefined' || !json){
    gtfo();
  }

  //Fill up the loaded meal document with Json data
  if(typeof json['meal'] != 'undefined' && json['text']) {
    fillId('meal-name',json['meal'],'before');
    fillClass('meal-name',json['meal'], 'after');
    document.title = json['meal'] + " - Picobelly";
  }
  if(typeof json['name'] != 'undefined' && json['name']) {
    fillClass('cook-name',json['name'], 'after');
    $('.hosted-by-avatar').attr('avatar',json['name']);
    $('.header-avatar').attr('avatar',json['name']);
  }
  if(typeof json['text'] != 'undefined' && json['text']) fillClass('meal-text',json['text'].replace(/(?:\r\n|\r|\n)/g, '<br>'), 'after');
  if(typeof json['tel'] != 'undefined' && json['tel']) fillClass('phone-number',json['tel'], 'after');
  if(typeof json['spots'] != 'undefined' && json['spots']) fillClass('meal-spots',json['spots'], 'after');
  if(typeof json['date'] != 'undefined' && json['spots']) {
    const mealday = moment(json['date']).format('MMMM Do, YYYY').toString();
    fillClass('meal-date',mealday, 'after');
  }
  if(typeof json['email'] != 'undefined' && json['email']) fillClass('email-name',json['email'], 'after');
  if(typeof json['price'] != 'undefined' && json['price']) fillClass('meal-price',(+json['price']).toFixed(2), 'after');
  if(typeof json['diet'] != 'undefined' && json['diet']) fillClass('diet-name','<li>'+json['diet'].capitalize()+'</li>', 'after');
  if(typeof json['street'] != 'undefined' && json['street']) fillClass('street-name',json['street'].capitalize(),'after');

  //gets city out of url, & replace "_" in city by a space
  const cur_url = new URL(window.location.href);
  const loc = cur_url.searchParams.get("loc").replace(/_+/g,' ');
  fillClass('street-name',", " + loc.capitalize(), 'after');

  //initializes map with coordinates
  const mapdiv = document.getElementById('singleListingMap');
  if(typeof json['lat'] != 'undefined' && json['lat'] && typeof json['lng'] != 'undefined' && json['lng']){
    mapdiv.setAttribute("data-latitude", json['lat']);
    mapdiv.setAttribute("data-longitude", json['lng']);
  } else { //defaults to Enschede for meals without lat and lng
    mapdiv.setAttribute("data-latitude", 52.2215372);
    mapdiv.setAttribute("data-longitude", 6.8936619);
  }

  //Attributes are still added via JQuery
  $('#page-url').attr('value', window.location.href);
  $('.email-name').attr("href", "mailto:"+json['email']);
  setAvatar(window,document);

  //Load imageslider if images are present & DOM is loaded
  const imageLoad = () => {
    if(typeof json['images'] != 'undefined' && json['images']){
      loadImageslider(json['images'],json['meal'],json['name']);
    } else {
      document.getElementById('image-slider').style.display = 'none';
    }
  }
  if(document.readyState==="loading"){
    document.onreadystatechange = function (){
      if(document.readyState==="interactive"){
        imageLoad();
      }
    }
  } else {
    imageLoad();
  }
}

function getMeal(loc,id) {
  let dummyData = {"name":"Henk Jan","date":"2019-01-19","email":"hj.devries@gaan.nl","meal":"Smachtende Dampsoep","price":"6.5","spots":"5","street":"goremannenweg","housenumber":"130","zip":"1337XD","city":"goremannenstad","diet":"None","text":"Ik hou echt zo erg van smachtende dampsoep, ik wil echt trouwen met smachtende dampsoep. \nmijn oma maakte vroeger altijd dampende smachtsoep, echt fucking ranzig lol.\ndaarom maak ik dus schampende dachtsoep.\nlekker van henk jan, de man uit de goremannenstad!","images":{0:"https://firebasestorage.googleapis.com/v0/b/picobellyapp.appspot.com/o/images%2Fvlwgmx%2Fsmachtende_dampsoep1?alt=media&token=21dce987-f3bc-4f6f-841f-eb1fd23a8bee",1:"https://firebasestorage.googleapis.com/v0/b/picobellyapp.appspot.com/o/images%2Fvlwgmx%2Fsmachtende_dampsoep2?alt=media&token=76793ce6-8871-4d43-b66b-7c21802b8eb2",2:"https://firebasestorage.googleapis.com/v0/b/picobellyapp.appspot.com/o/images%2Fvlwgmx%2Fsmachtende_dampsoep3?alt=media&token=f7561581-0b6f-44bb-bd66-c75855327277",3:"https://firebasestorage.googleapis.com/v0/b/picobellyapp.appspot.com/o/images%2Fvlwgmx%2Fsmachtende_dampsoep4?alt=media&token=a0140ed8-6dea-4ac1-ae83-e90bb26023c0"},"lat":52.2256412,"lng":6.892414300000041};
  let xhttp = new XMLHttpRequest();
  xhttp.onreadystatechange = function() {
      if (this.readyState == 4 && this.status == 200) {
        // Typical action to be performed when the document is ready:
        loadPage(xhttp.responseText);
      }
      else if (this.readyState == 4 && this.status == 0){
        console.log("Data could not be fetched, loading dummy data...");
        console.log(dummyData);
        loadPage(dummyData);
      }
  };
  xhttp.open("GET", 'https://us-central1-picobellyapp.cloudfunctions.net/getListing?loc='+loc+'&id='+id, true);
  console.log('https://us-central1-picobellyapp.cloudfunctions.net/getListing?loc='+loc+'&id='+id);
  xhttp.send();
  return xhttp.responseText;
}
