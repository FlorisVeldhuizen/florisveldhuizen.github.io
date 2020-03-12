
/* INIT the Facebook JavaScript SDK */
window.fbAsyncInit = function() {
    FB.init({
      appId            : '338645543590460',
      autoLogAppEvents : true,
      xfbml            : true,
      version          : 'v3.2'
    });
  };

(function(d, s, id){
     var js, fjs = d.getElementsByTagName(s)[0];
     if (d.getElementById(id)) {return;}
     js = d.createElement(s); js.id = id;
     js.src = "https://connect.facebook.net/en_US/sdk.js";
     fjs.parentNode.insertBefore(js, fjs);
   }(document, 'script', 'facebook-jssdk'));

// Use this function for sharing Default OG data with Facebook
function shareOGData()
  {
   FB.ui({
    method: 'share_open_graph',
    action_type: 'og.likes',
    action_properties: JSON.stringify({
     object: {
      'og:url': "https://picobelly.com/meal",
      'og:title': "A nice meal",
      'og:description': "Some nice stuff about it",
      'og:image': "https://firebasestorage.googleapis.com/v0/b/picobellyapp.appspot.com/o/images%2Fjhgqj%2Ffsafjsajfdsa1?alt=media&token=1b1adfde-49c0-41e9-b83f-2e61f51633f5"
     }
    })
   },
   function (response) {
   // Action after response
   });
  }

// Use this function for overriding OG data and sharing it with Facebook

function shareOverrideOGMeta(overrideLink, overrideTitle, overrideDescription, overrideImage)
{
 FB.ui({
  method: 'share_open_graph',
  action_type: 'og.likes',
  action_properties: JSON.stringify({
   object: {
    'og:url': overrideLink,
    'og:title': overrideTitle,
    'og:description': overrideDescription,
    'og:image': overrideImage
   }
  })
 },
 function (response) {
 // Action after response
 });
}
