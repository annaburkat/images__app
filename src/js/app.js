$(function() {
  //variables for main div with photos
  var imagesBox = $('.imagesBox');

  //variables for url (API)
  var imagesUrl = 'https://api.flickr.com/services/rest/?method=flickr.photos.getRecent&api_key=4bbc0cae549b96546d876d95fa9eee25&extras=url_t,url_c&format=json&nojsoncallback=1';

  //trigger function to get some pictures from API
  loadPictures(imagesUrl);
  //focus cursor on input
  $('#tags').val("").focus();


  //Insert Images to DOM
  function insertContent(pictures, imagesUrl) {
    $.each(pictures.photo, function(indexPicture, pic) {
      var div = $('<div class="image"> </div>')
      var img = $('<img>', {
        src: pic.url_t,
        to: pic.url_c,
        id: pic.id
      });
      div.append(img);
      imagesBox.append(div);
    });

//update page number
    $(".nav__recent").html(pictures.page);
    $(".nav__total").html(pictures.pages);

    //display "buttons" to change pages
    if (pictures.page > 1) {
      $(".nav__prev").html('<');
    }
    if (pictures.page != pictures.pages) {
      $(".nav__next").html('>');
    }

//click event for prev button - to change pages
    $(".nav__prev").unbind('click').click(function() {
      //if number pf page is bigger than 0
      if (imagesUrl.search('page') > 0) {
        //split url "&" - it allows to find and then chage "page="
        var linkArray = imagesUrl.split('&');
        var indexPage;
        //in linkArray find "page="
        for (indexPage = linkArray.length; indexPage--;) {
          if (linkArray[indexPage].indexOf("page") >= 0) break;
        }
        //change number of page in url
        linkArray[indexPage] = "page=" + (parseInt(pictures.page) - 1);
        //join all parts of url
        imagesUrl = linkArray.join('&');
      } else {
        imagesUrl += "&page=" + (parseInt(pictures.page) - 1);
      }
        //trigger newSearch function (which upload wanted pictures)
      newSearch(imagesUrl);
    });

//like in previous event - this one is for next "button"
    $(".nav__next").unbind('click').click(function() {
      if (imagesUrl.search('page') > 0) {
        var linkArray = imagesUrl.split('&');
        var indexPage;
        for (indexPage = linkArray.length; indexPage--;) {
          if (linkArray[indexPage].indexOf("page") >= 0) break;
        }
        linkArray[indexPage] = "page=" + (parseInt(pictures.page) + 1);
        imagesUrl = linkArray.join('&');

      } else {
        imagesUrl += "&page=" + (parseInt(pictures.page) + 1);
      }
      newSearch(imagesUrl);
    });

  }


//function which allows to get data and asign to var
  function insertInfo(info) {
    var date = info.photo.dates.taken;
    var owner = info.photo.owner.realname;
    var title = info.photo.title._content;

//create var withh data in new html elements
    var bigImageBox = $("#overlayContent");
    var dataText = $('<p class="image__details">when? ' + date +  '</p>');
    var ownerText = $('<p class="image__details">by who? ' + owner +  '</p>');
    var titleText = $('<p class="image__details">title: ' + title +  '</p>');
    var infoBox = $('<div class="image__info">Picture taken: </div>')

//append new html elements
    infoBox.append(dataText);
    infoBox.append(ownerText);
    infoBox.append(titleText);
    bigImageBox.append(infoBox);
  }

//click function for big picture
  $(".imagesBox").on("click", ".image", function() {
  //event for every images to get id and src (url_c - bigger version of picture)
    var bigImage = $(this).children().attr("to");
    var idImage = $(this).children().attr("id");
    loadInfo(idImage);
    //add new ulr (for big pic url_c) as a attr src
    $("#imgBig").attr("src", bigImage);
      //show bigger version of image
    $("#overlay").show();
    $("#overlayContent").show();
  });

  //hide bigger version of image
  $("#imgBig").click(function() {
    //remove div with information about photo
    $(".image__info").remove();
    //reset attr src of photo
    $("#imgBig").attr("src", "");
    //hide divs with big photo
    $("#overlay").hide();
    $("#overlayContent").hide();
  });

  //hide bigger version of image - the same event as above - allows to close bigger imamge via click on span 
  $(".close__img--bold").click(function(){
    //remove div with information about photo
    $(".image__info").remove();
    //reset attr src of photo
    $("#imgBig").attr("src", "");
    //hide divs with big photo
    $("#overlay").hide();
    $("#overlayContent").hide();
  })
  // get the value of input and dislay images according to the search tag
  $("#submit").click(function(e) {
    //remove " Or enjoy the most recent images" - new pictures uploaded
    $('.recent__images').remove();

    var tags = $('#tags').val();
    //display search tag  under input
    var results_div = $('#picture_box');
    var tags_results = $('<p class="recent__images">Oh! Look at those #' + tags + 's!</p>');
    results_div.append(tags_results);

    //add wanted tag to url
    var imagesUrl = 'https://api.flickr.com/services/rest/?method=flickr.photos.search&api_key=4bbc0cae549b96546d876d95fa9eee25&extras=url_t%2Curl_c&format=json&nojsoncallback=1&text=' + tags;
    //trigger newSearch function (which upload wanted pictures)
    newSearch(imagesUrl);
  });

  //upload wanted pictures
  function newSearch(imagesUrl) {
    //remove pictures from the website
    $(".image").remove();
    //trigger function loadPictures == get wanted pictures
    loadPictures(imagesUrl);
    //remove value of input
    $('#tags').val("").focus();
  }

  //event for Enter Key
  $('#tags').keypress(function(e) {
    if (e.which == 13) {
      jQuery(this).blur();
      jQuery('#submit').focus().click();
      e.preventDefault();
    }
  });


  //Load pictures and insert them into the DOM
  function loadPictures(imagesUrl) {
    $.ajax({
      url: imagesUrl,
      dataType: 'json',
      type: 'GET'
    }).done(function(response) {
      insertContent(response.photos, imagesUrl);
      console.log(response);
    }).fail(function(error) {
      console.log(error);
    }).always(function() {
      console.log(imagesUrl);
    });
  }

  // Load information  and insert them into the DOM
  function loadInfo(id) {
    $.ajax({
      url: "https://api.flickr.com/services/rest/?method=flickr.photos.getInfo&api_key=4bbc0cae549b96546d876d95fa9eee25&format=json&nojsoncallback=1&photo_id=" + id,
      dataType: 'json',
      type: 'GET'
    }).done(function(response) {
      insertInfo(response);
    }).fail(function(error) {
      console.log(error);
    }).always(function() {
      console.log(imagesUrl);
    });
  }
});
