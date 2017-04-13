'use strict'

function getDataFromApiBySetName(query_set_name, callback, error) {
    var settingsSetName = {
        url: 'http://localhost:8080/sets-search/' + query_set_name,
        dataType: 'JSON',
        type: 'GET',
        success: callback,
        error: error
    }
    $.ajax(settingsSetName);
}

function getDataFromApiBySetId(query_set_id, callback, error) {
    var settingsSetInfo = {
        url: 'http://localhost:8080/sets/' + query_set_id,
        dataType: 'JSON',
        type: 'GET',
        success: callback,
        error: error
    }
    $.ajax(settingsSetInfo);
}

function signup(username, email, password, callback) {
    var newUser = {'username': username, 'email': email, 'password': password};
    var settingsSignup = {
        url: '/signup',
        headers: { "Authorization": "Basic " + btoa(username+ ":" + email + ":" + password) },
        data: JSON.stringify(newUser),
        contentType: 'application/json',
        dataType: 'JSON',
        type: 'POST',
        success: callback,
    }
    $.ajax(settingsSignup).done(function(res) {
        $('#signup_success').text('Your account was successfully created, please sign in');
    });
}

function login(username, password, callback) {
    var existingUser = {'username': email, 'password':password}; 
    var settingsLogin = {
        url: '/login',
        headers: { "Authorization": "Basic " + btoa(email + ":" + password) },
        data: JSON.stringify(existingUser),
        contentType: 'application/json',
        dataType: 'JSON',
        type: 'GET',
        success: callback
    }
    $.ajax(settingsLogin);
}

function displaySearchItems(items) {
  console.log('displaySearchItems', items);
  var resultElement = '';
  if(items.length) {

    items.forEach(function(item) {
      if(item.set_img_url) {
        resultElement +=  '<div class="col-lg-6 col-sm-12 imageDiv">';
        resultElement +=   `<img class="itemImage" src="${item.set_img_url}">`;
        resultElement += '</div>';
      }
      if(item.set_num) {
        resultElement += '<div class="col-lg-6 col-sm-12 setDetail">';
        resultElement +=  '<span class="btn-group btn-group-sm addButton"><button class="btn btn-default" type="submit">Add to Favorite</button></span>' + 
                          `<p class="setNum"><img class="logo_lego" src="/images/lego_bricks.jpg"> ${item.set_num}</p>`;
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
        resultElement += '<tr>';
        resultElement +=  '<td class="tdTable tdLeft">More Information</td>' +
                          `<td class="tdTable tdRight"><a class="rebrickLink" href="${item.set_url}" target="_blank"><img class="rebrickIcon" src="/images/rebrick_image.jpg"> Rebrickable</a></td>` +
                         '</tr>';
        resultElement += '</table>';
        resultElement += '</div>';
      }
    });
  } else {
    resultElement += '<p>No results</p>';
  }
  $('#js-show-info').html(resultElement);
}

function searchSubmit() {
  $('#js-search-form').submit(function(event) {
    event.preventDefault();
    $('#js-show-info').show();
    var search_text = $(this).find('#js-input').val();

    getDataFromApiBySetName(search_text, function (data) {
      if (data && data.results.length) {
        displaySearchItems(data.results);
      } 
      else {
        getDataFromApiBySetId(search_text, function (item) {
          displaySearchItems([item]);
        });
      }
    });
  });
}

function setupSignUpSubmit() {
  $('#signup_form').submit(function(event) {
    event.preventDefault();
    var username = $(this).find('#signup_username').val();
    var email = $(this).find('#signup_email').val();
    var password = $(this).find('#signup_password').val();

    signup(username, email, password, function() {
      console.log('signup success');
    });
    $('#signup_username').val('');  
    $('#signup_email').val('');  
    $('#signup_password').val('');  

  });
}

function setupLogInSubmit() {
  $('#login_form').submit(function(event) {
          console.log('login');
    event.preventDefault();
    var username_login = $(this).find('#login_email').val();
    var password_login = $(this).find('#login_password').val();

    login(username_login, password_login, function() {
      console.log('log in done')
    });

  });
}

function loginPopover() {
$("[data-toggle=popover]").popover({
        html : true,
        content: function() {
          var content = $(this).attr("data-popover-content");
          return $(content).children(".popover-body").html();
        },
        title: function() {
          var title = $(this).attr("data-popover-content");
          return $(title).children(".popover-heading").html();
        }
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

$(function() {
  searchSubmit();
  loginPopover();
  signupModal();
  setupLogInSubmit();
  setupSignUpSubmit();
  console.log('hi');
});









