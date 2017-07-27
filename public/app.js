'use strict'

$('.toggle').click(function() {
    $('nav ul').slideToggle();
});

$(window).resize(function() {
    if ($(window).width() > 780) {
        $('nav ul').removeAttr('style');
    }
});

function submitAndHideUlMobile() {
  $('.submitAndHideUl').on('click', function(event) {
    event.preventDefault();
    $('nav ul').hide();

    if ($(window).width() > 780) {
        $('nav ul').removeAttr('style');
    }
  })
}


//<------------ Click to go to whatWeDo element that shows how the app works ---------->//

function learnMore() {
  $("#scroll").click(function() {
    $('html, body').animate({
        scrollTop: parseInt($("#explain").offset().top)
    }, 1200);
  });
}

//<---------- Sign up, log in and log out that communicate with server ---------->//

function onSignUp(username, email, password, callback) {
    var newUser = {'username': username, 'email': email, 'password': password};
    var settingsSignup = {
        url: '/signup',
        data: JSON.stringify(newUser),
        contentType: 'application/json',
        dataType: 'JSON',
        type: 'POST'
    }
    $.ajax(settingsSignup).then(function(res) {
        onLogIn(email, password, callback);
    })
    .fail(function(err) {
        swal(err.responseJSON.message)
    })
}

function onLogIn(email, password, callback) {
    var settingsLogin = {
        url: '/login',
        headers: { "Authorization": "Basic " + btoa(email + ":" + password) },
        contentType: 'application/json',
        dataType: 'JSON',
        type: 'POST',
    }
    $.ajax(settingsLogin).then(function(res) {
        localStorage.username = res.user.username;
        localStorage.authHeaders = settingsLogin.headers.Authorization;
        window.location = '/';
    })
}

function onLogOut(callback) {
    var settingsLogOut = {
        url: '/logout',
        type: 'GET',
    }
    $.ajax(settingsLogOut).then(function(res) {
        window.location = '/';
    });
}

//<------------ Event listeners sign up, log in and log out ------------>//

function setupSignUpSubmit() {
  $('#signup_form').submit(function(event) {
    event.preventDefault();
    var username_signup = $(this).find('#signup_username').val();
    var email_signup = $(this).find('#signup_email').val();
    var password_signup = $(this).find('#signup_password').val();

    onSignUp(username_signup, email_signup, password_signup, function(res) {
      if (res.message) {
      } else {
        window.location = '/';
      }
    });
    $('.signup_input').val('');
  });
}

function setupLogInSubmit() {
  $('#my_login_form').submit(function(event) {
    event.preventDefault();
    var email_login = $(this).find('#login_email').val();
    var password_login = $(this).find('#login_password').val();

    onLogIn(email_login, password_login, function(user) {
    });
    $('.login_input').val('');
  });
}

function setupLogOutSubmit() {
  $('#my_logout').click(function(event) {
    event.preventDefault();
    localStorage.removeItem('authHeaders');

      onLogOut(function() {
    });
  });
}

//<---------- Get data from Rebrickable API by sending Get request to the server ---------->//

function getDataFromApiBySetName(query_set_name, callback) {
    var settingsSetName = {
        url: '/sets-search/' + query_set_name,
        dataType: 'JSON',
        type: 'GET',
        success: callback,
    }
    $.ajax(settingsSetName);
}

function getDataFromApiBySetId(query_set_id, callback) {
    var settingsSetInfo = {
        url: '/sets/' + query_set_id,
        dataType: 'JSON',
        type: 'GET',
        success: callback,
    }
    $.ajax(settingsSetInfo).fail(function(err) {
        callback(null);
    });
}

//<---------- Add, get and remove favorite sets by communicating to the server ---------->//

function addFavorite(query_set_id, callback) {
    var settingsSetFavorite = {
        url: '/favorites',
        data: JSON.stringify({
          set_num: query_set_id
        }),
        contentType: 'application/json',
        headers: { "Authorization": localStorage.authHeaders},
        dataType: 'JSON',
        type: 'POST',
    }
    $.ajax(settingsSetFavorite);
}

function getFavorites(callback) {
  if (!('authHeaders' in localStorage) || !localStorage['authHeaders']) {
    callback([]);
    return
  }
  var settingsGetFavorites = {
      url: '/favorites',
      headers: { "Authorization": localStorage.authHeaders},
      dataType: 'JSON',
      type: 'GET',
      success: callback
  };
  $.ajax(settingsGetFavorites);
}

function removeFavorite(query_set_id, callback) {
  if (!callback) {
    callback = function() {
      $('#js-show-info').html('');

      getFavorites(function(favorites) {
        favorites.forEach(function(favorite) {
          getDataFromApiBySetId(favorite.set_num, function(item) {
            displaySearchItems([item], favorites);
          });
        }); 
      });  
    }
  }
  swal({
    title: "Are you sure you want to delete the item?",
    showCancelButton: true,
    confirmButtonColor: "#DD6B55",
    confirmButtonText: "Yes, delete it!",
    cancelButtonText: "No, cancel!",
    closeOnConfirm: true,
    closeOnCancel: true
    },
    function(isConfirm) {
      if (isConfirm) {
        var settingsRemoveSet = {
            url: '/favorites',
            headers: { "Authorization": localStorage.authHeaders},
            data: JSON.stringify({
                set_num: query_set_id
            }),
            contentType: 'application/json',
            dataType: 'JSON',
            type: 'DELETE',
            success: callback,
        };
        $.ajax(settingsRemoveSet);
      }
    }
  );
}

//<------------------- Display item -------------------->//

function renderItem(item, favorites) {
  var resultElement = '';
  if(item.set_num) {

    var isFavorite = false;
    if (localStorage.authHeaders) {
      for (var favorite of favorites) {
        if (item.set_num == favorite.set_num) {
          isFavorite = true;
          break;
        }
      }
    }

    if(item.set_img_url) {
      resultElement +=  '<div class="imageDiv">' +
                          `<span class="setNumImg"><img class="logo_lego" src="/images/lego_bricks.jpg"> ${item.set_num} ${item.name}</span>` +
                          `<p><img class="itemImage" src="${item.set_img_url}"></p>`;

      if (isFavorite) {
        resultElement += '<span class="glyphicon glyphicon-heart heartFav"></span>';
      }
      resultElement += '</div>';
    }

    resultElement += '<div class="setDetail">';

    if (localStorage.authHeaders) {
      if (isFavorite) {
        resultElement +=  '<span>' +
                          `<button class="removeFavorite" onclick="removeFavorite('${item.set_num}')" type="submit">Remove Favorite</button>`+ 
                          '</span>';
      } else {
        resultElement +=  '<span class="addButton">' + 
                            `<button class="buttonFavorite showWhenLoggedIn" onclick="addFavorite('${item.set_num}')" type="submit">Add Favorite</button>` +
                          '</span>';
      }
    } else if (!localStorage.authHeaders) {
      resultElement +=  '<span class="addButton">' + 
                          `<button class="buttonFavorite showWhenLoggedOut" onclick="swal('Please sign up or log in!')" type="submit">Add Favorite</button>` +
                        '</span>';
    }
    resultElement += `<p class="setNum"><img class="logo_lego" src="/images/lego_bricks.jpg"> ${item.set_num}</p>`;
  }

  if(item.name) {
    resultElement += '<table class="tableInfo">';
    resultElement += '<tr>';
    resultElement +=  '<td class="tdTable tdLeft">Name</td>' +
                      `<td class="tdTable tdRight">${item.name}</td>` +
                     '</tr>'
  }
  if(item.year) {
    resultElement += '<tr>';
    resultElement +=  '<td class="tdTable tdLeft">Year Released</td>' +
                      `<td class="tdTable tdRight">${item.year}</td>` +
                     '</tr>'
  }
  if(item.num_parts) {
    resultElement += '<tr>';
    resultElement +=  '<td class="tdTable tdLeft">Set Consisits Of</td>' +
                      `<td class="tdTable tdRight"><img class="legoIcon" src="/images/lego-icon.jpg"> ${item.num_parts} Parts</td>` +
                     '</tr>'        
  }
  if(item.set_url) {
    if(!localStorage.authHeaders) {
      resultElement += '<tr class="lastTd"><td><a href="#" id="signupLink" onclick="signupMoreInfo()">Sign up for more details</a></td></tr>';          
    }
    if(localStorage.authHeaders) {
      resultElement +=  '<td class="tdTable tdLeft">More Details</td>' +
                      `<td class="tdTable tdRight"><a class="rebrickLink" href="${item.set_url}" target="_blank"><img class="rebrickIcon" src="/images/rebrick_image.jpg"> Rebrickable</a></td>`
    }
  }
    resultElement += '</table>';
    resultElement += '</div>';
    resultElement += '</hr>';
    return resultElement;
}

function displaySearchItems(items, favorites) {
  var result = '';
  if(items.length) {
    items.forEach(function (item) {
      result += renderItem(item, favorites);
    });
  }
  $('#js-show-info').append(result);
}

//<---------- Event listener for searching a lego set to display data ---------->//

function searchSubmit() {
  $('#js-search-form').submit(function(event) {
    event.preventDefault();

    $('#explain').hide();
    $('.footer').hide();
    $('#landingPage').hide();
    $('#js-show-info').html('')

    var resultError = '';
    var jsInput = $('#js-input');
    var search_text = jsInput.val();

    var header =  `<h1>The results of ${search_text}</h1>`
                 
    $('#headerResults').html('');
    
    if (!jsInput.val()) {
      $('#headerResults').html('');

      resultError +=  '<div class="error">' +
                        '<p class="errMsg">Please enter a Lego set number or name!</p>' +
                      '</div>';
      $('#headerResults').html(resultError);

    } else if (jsInput.val()) {
      getFavorites(function(favorites) {

        getDataFromApiBySetName(search_text, function (data) {
          if (data && data.results.length) {
            $('#headerResults').html(header);

            displaySearchItems(data.results, favorites);
          } 
          else {
            getDataFromApiBySetId(search_text, function (item) {
              if(item) {
                $('#headerResult').html(header);

                displaySearchItems([item], favorites);
              } else {
                $('#headerResults').html('');

                resultError +=  '<div class="error">' +
                                  '<p class="errMsg">No results!</p>' +
                                '</div>';
                $('#headerResults').html(resultError);
              }
            });
          }
        });
        jsInput.val('');
      });
    }
  });
}

//<------------- Event listener click to show favorite list ------------->// 

function setupShowFavorites() {

  $('#showFavorites').click(function(event) {
    event.preventDefault();

    $('#headerResults').html('');
    $('#explain').hide();
    $('#landingPage').hide();
    $('.footer').hide();
    $('#js-show-info').html('');

    var favoriteHeader = '<h1>Your favorite items</h1>'

    getFavorites(function(favorites) {
        favorites.forEach(function(favorite) {
          getDataFromApiBySetId(favorite.set_num, function(item) {

            $('#headerResults').html(favoriteHeader);
            displaySearchItems([item], favorites);
          });
        });
    });
  });
}

function returnHome() {
  $('.logoTitle').on('click', function(event) {
    event.preventDefault();
    $('#explain').show();
    $('#landingPage').show();
    $('.footer').show();
    $('#headerResults').html('');
    $('#js-show-info').html('');
  });
}
//<---------------- Show and hide elements when log in or log out -------------->//

function switchLogInLogOut() {
  if (localStorage.authHeaders) {
    $('.showWhenLoggedIn').show();
    $('.showWhenLoggedOut').hide();
    $('#helloUser').html(localStorage.username);
  } else {
    $('.showWhenLoggedIn').hide();
    $('.showWhenLoggedOut').show();
  }
}

//<------------ Popup modal window to log in and sign up ------------>//

function showLoginModal() {
  $('#loginBtn').on('click', function(event) {
    event.preventDefault();
    $('.loginModal').toggle();
  });
}

function hideLoginModal() {
  $('.closeLoginModal').on('click', function(event) {
    event.preventDefault();
    $('.loginModal').hide();
  })
}

function showSignupModal() {
  $('#signupBtn').on('click', function(event) {
    event.preventDefault();
    $('.signupModal').toggle();
  });
}

function signupJoinBtn() {
  $('.joinButton').on('click', function(event) {
    event.preventDefault();
    $('.signupModal').toggle();
  });
}

function signupMoreInfo() {
    $('.signupModal').toggle();
}


function hideSignupModal() {
  $('.closeModal').on('click', function(event) {
    event.preventDefault();
    $('.signupModal').hide();
  })
}

//<------------ document.ready ------------>//

$(function() {
  switchLogInLogOut();
  learnMore();
  searchSubmit();
  showLoginModal();  
  showSignupModal();
  signupJoinBtn();
  hideLoginModal();
  hideSignupModal();
  setupSignUpSubmit();
  returnHome();
  setupLogInSubmit();
  setupLogOutSubmit();
  setupShowFavorites();
  submitAndHideUlMobile();
});









