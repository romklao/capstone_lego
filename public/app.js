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
    var settingsSignup = {
        url: 'http://localhost:8080/users/',
        headers: { "Authorization": "Basic " + btoa(username + ":" + email + ":" + password) },
        dataType: 'JSON',
        type: 'POST',
        success: callback,
    }
    $.ajax(settingsSignup);
}

function login(email, password, callback) {
    var settingsLogin = {
        url: 'http://localhost:8080/users/me',
        headers: { "Authorization": "Basic " + btoa(EMAIL + ":" + PASSWORD) },
        dataType: 'JSON',
        type: 'GET',
        success: callback,
        error: error
    }
    $.ajax(settingsLogin);
}

// function getDataSetPartsFromApiBySetId(callback) {
//     var settingsSetParts = {
//         url: 'http://localhost:8080/sets-parts/' + query_set_id,
//         dataType: 'JSON',
//         type: 'GET',
//         success: callback,
//         error: error
//     }
//     $.ajax(settingsSetParts);
// }

// function getDataFromApiByPartId(query_part_id, callback, error) {
//     var settingsPart = {
//         url: 'http://localhost:8080/parts/' + query_part_id,
//         dataType: 'JSON',
//         type: 'GET',
//         success: callback,
//         error: error
//     }
//     $.ajax(settingsPart);
// }

// function getDataFromApiPrice(query_part_id, callback, error) {
//     var settingsPartPrice = {
//         url: 'http://localhost:8080/price/' + query_part_id,
//         dataType: 'JSON',
//         type: 'GET',
//         success: callback,
//         error: error
//     }
//     $.ajax(settingsPartPrice);
// }

// function displaySearchPart(data) {
//   console.log('displaySearchPart', data);
//   var resultElementPart = '';
//   if(data) {
//       if(data.part_img_url) {
//         resultElementPart =  '<div>'
//         resultElementPart +=   '<img src="' + data.part_img_url + '">';
//         resultElementPart += '</div>';
//       }
//       if(data.part_num) {
//         resultElementPart += '<div>';
//         resultElementPart +=  '<p>Item No: ' + data.part_num + '</p>';
//       }
//       if(data.name) {
//         resultElementPart +=  '<p>Item Name: ' + data.name + '</p>';
//       }
//       resultElementPart += '</div>';
//   } else {
//     resultElementPart += '<p>No results</p>';
//   }
//   $('#js-show-info').html(resultElementPart);
// }

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

// function displaySearchSetParts(data) {
//   var resultElementTableHead = '';
//   var resultElementSetParts = '';
//   if(data.results) {
//     console.log('data', data);

//     getDataFromApiPrice();

//     if(!data.results) {
//       alert('no result');
//         return
//     }
//     data.results.forEach(function(item) {
//       console.log('items')
//       if(item.part) {
//         resultElementSetParts += '<tr>';
//       }
//       if(item.part.part_img_url) {
//         resultElementSetParts += '<td><img src="' + item.part.part_img_url + '"></td>';
//       }
//       if(item.part.part_num) {
//         resultElementSetParts += '<td>' + item.part.part_num + '</td>';
//       }
//       if(item.quantity) {
//         resultElementSetParts += '<td>' + item.quantity + '</td>';
//       }
//       if(item.color.name) {
//         resultElementSetParts += '<td>' + item.color.name + '</td>';
//       }
//       if(item.part.name) {
//         resultElementSetParts += '<td>' + item.part.name + '</td>';
//       }
//     });
//   }
//   else {
//     resultElementSetParts += '<p>No results</p>';
//   }
//   $('#js-show-info-set-parts').html(resultElementSetParts);

// }

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
        //function (err, textStatus, errorThrown) {
        //   $('#js-show-error').html('<p>No results</p>');
        });
      }
    });
    // getDataFromApiByPartId(search_text, displaySearchPart);  
  });
}

// function linkToListParts() {
//   $('#js_link_set_parts').click(function() {
//     console.log('link')
//     $('.tableHead').show();
//     getDataSetPartsFromApiBySetId(displaySearchSetParts);

//     });
// }

function signUpSubmit() {
  $('#signup_form').submit(function(event) {
    event.preventDefault();
    var username_input = $(this).find('#signup_username').val();
    var email_input = $(this).find('#signup_email').val();
    var password_input = $(this).find('#signup_password').val();

    signup(username_input, email_input, password_input, function() {
      console.log('sign up success');
    });

  });
}

function LogInSubmit() {
  $('#login_form').submit(function(event) {
    event.preventDefault();
    var email_input_login = $(this).find('#login_email').val();
    var password_input_login = $(this).find('#login_password').val();

    login(email_input_login, password_input_login, function() {
      console.log('log in success');
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
  // linkToListParts();
  loginPopover();
  signupModal();
  LogInSubmit();
  signUpSubmit();
  console.log('hi');
});









