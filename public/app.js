'use strict'

//<------------ Click to go to whatWeDo element that shows how the app work ---------->//

function learnMore() {
  $("#scroll").click(function() {
    $('html, body').animate({
        scrollTop: parseInt($("#explain").offset().top)
    }, 1600);
  });
}

//<---------- Sign up, log in and log out communicate with server ---------->//

function onSignUp(username, email, password, callback) {
    var newUser = {'username': username, 'email': email, 'password': password};
    console.log('signup');
    var settingsSignup = {
        url: '/signup',
        data: JSON.stringify(newUser),
        contentType: 'application/json',
        dataType: 'JSON',
        type: 'POST'
    }
    $.ajax(settingsSignup).then(function(res) {
        console.log('RES: ', res)
        onLogIn(email, password, callback);
    })
    .fail(function(err) {
        console.log('SIGNUP FAIL')
        alert(err.responseJSON.message)
        console.log(err)
    })
}

function onLogIn(email, password, callback) {
    console.log('email'); 
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
        console.log('localStorage.authHeaders', localStorage.authHeaders)
         window.location = '/';
    })
}

function onLogOut(callback) {
    var settingsLogOut = {
        url: '/logout',
        type: 'GET',
    }
    $.ajax(settingsLogOut).then(function(res) {
        console.log('User Logged Out')
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
        console.log('RES',res);
      }
      else {
        window.location = '/';
      }
    });
    $('.signup_input').val('');
  });
}

function setupLogInSubmit() {
  $('#my_login_form').submit(function(event) {
    console.log('login');
    event.preventDefault();
    var email_login = $(this).find('#login_email').val();
    var password_login = $(this).find('#login_password').val();

    onLogIn(email_login, password_login, function(user) {
      console.log('user',user)
    });
    $('.login_input').val('');
  });
}

function setupLogOutSubmit() {
  $('#my_logout').click(function(event) {
    event.preventDefault();
    localStorage.removeItem('authHeaders');

    onLogOut(function() {
      console.log('log out is done')
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
    $.ajax(settingsSetInfo);
}

//<---------- Add, get and remove favorite sets by communicating to server ---------->//

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
  if (confirm("Are you sure you want to remove the item?")) { 
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


//<------------------- Display item -------------------->//

function renderItem(item, favorites) {
  var resultElement = '';

  if(item.set_img_url) {
    resultElement +=  '<div class="col-lg-6 col-sm-12 imageDiv">';
    resultElement +=   `<img class="itemImage" src="${item.set_img_url}">`;
    resultElement += '</div>';
  }
  if(item.set_num) {
    resultElement += '<div class="col-lg-6 col-sm-12 setDetail">';
    var isFavorite = false;
    if (localStorage.authHeaders) {
      for (var favorite of favorites) {
        if (item.set_num == favorite.set_num) {
          isFavorite = true;
          break;
        }
      }
      if (isFavorite) {
        resultElement +=  '<span class="btn-group btn-group-sm pull-right addButton">' +
                          `<button class="btn btn removeFavorite" onclick="removeFavorite('${item.set_num}')" type="submit">Remove Favorite</button></span>`;
      } else {
      resultElement +=  '<span class="btn-group btn-group-sm pull-right addButton">' + 
                          `<button class="btn buttonFavorite" onclick="addFavorite('${item.set_num}')" type="submit">Add Favorite</button>` +
                        '</span>';
      }
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
      resultElement += '<tr class="lastTd"><td><a data-toggle="modal" data-target="#exampleModal" class="signupLink" href="#">Sign up for more details</a></td></tr>';          
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
  console.log('displaySearchItems', items);
  var result = '';
  if(items.length) {
    items.forEach(function (item) {
      result += renderItem(item, favorites);
    });
      result += '<div class="row js-footer">' +
                  '<div class="col-lg-12 col-sm-12">' +
                    '<p class="js-footerLogo">BrickPro <span class="js-footerBuilder">Built by Romklao Chainuwong</span>' +
                      '<a href="https://github.com/romklao/capstone_lego" target="_blank"><img src="images/github-logo.png" class="js-githubLogo"></a>' +
                    '</p>' +
                  '</div>' +
                '</div>'
  } else {
    result += '<p>No results</p>';
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
    $('#js-show-info').html('');
    
    var search_text = $(this).find('#js-input').val();
    getFavorites(function(favorites) {

      getDataFromApiBySetName(search_text, function (data) {
        if (data && data.results.length) {
          displaySearchItems(data.results, favorites);
          console.log('DATA', data.results)
        } 
        else {
          getDataFromApiBySetId(search_text, function (item) {
            displaySearchItems([item], favorites);
            console.log('ITEM', item)
          });
        }
      });
    });
  });
}

//<------------- Event listener click to show favorite list ------------->// 

function setupShowFavorites() {
  $('#showFavorites').click(function(event) {
    event.preventDefault();
    $('#explain').hide();
    $('#landingPage').hide();
    $('.footer').hide();
    $('#js-show-info').html('');

    getFavorites(function(favorites) {
        favorites.forEach(function(favorite) {
          getDataFromApiBySetId(favorite.set_num, function(item) {
            console.log('ITEM', item);
            displaySearchItems([item], favorites);
          });
        }); 
    });  
  });  
}

//<---------------- Show and hide elements when log in or log out -------------->//

function switchLogInLogOut() {
  if (localStorage.authHeaders) {
    $('.showWhenLoggedIn').show();
    $('.showWhenLoggedOut').hide();
    console.log('username', localStorage.username);
    $('#helloUser').html(localStorage.username);
  } else {
    $('.showWhenLoggedIn').hide();
    $('.showWhenLoggedOut').show();
  }
}

//<------------ Popup modal window to log in and sign up ------------>//

function loginModal() {
  $('#myLoginModal').on('show.bs.modal', function (event) {
    var button = $(event.relatedTarget) // Button that triggered the modal
    var recipient = button.data('whatever') // Extract info from data-* attributes
    // If necessary, you could initiate an AJAX request here (and then do the updating in a callback).
    // Update the modal's content. We'll use jQuery here, but you could use a data binding library or other methods instead.
    var modal = $(this)
    modal.find('.modal-title').text()
    modal.find('.modal-body input').val()
  });
}

function signupModal() {
  $('#exampleModal').on('show.bs.modal', function (event) {
    var button = $(event.relatedTarget) // Button that triggered the modal
    var recipient = button.data('whatever') // Extract info from data-* attributes
    // If necessary, you could initiate an AJAX request here (and then do the updating in a callback).
    // Update the modal's content. We'll use jQuery here, but you could use a data binding library or other methods instead.
    var modal = $(this)
    modal.find('.modal-title').text()
    modal.find('.modal-body input').val()
  });
}

//<------------ document.ready ------------>//

$(function() {
  learnMore();
  searchSubmit();
  loginModal();  
  signupModal();
  setupSignUpSubmit();
  setupLogInSubmit();
  setupLogOutSubmit();
  switchLogInLogOut();
  setupShowFavorites();
  console.log('hi');
});









