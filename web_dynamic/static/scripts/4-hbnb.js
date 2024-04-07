// function to get the new section
function getNewSection (response) {
  for (const place of response) {
    const article = $('<article></article>');
    article.append('<div class="title_box"><h2>' + place.name + '</h2><div class="price_by_night">$' + place.price_by_night + '</div></div>');
    article.append('<div class="information"><div class="max_guest">' + place.max_guest +
      ' Guest' + (place.max_guest !== 1 ? 's' : '') +
      '</div><div class="number_rooms">' + place.number_rooms +
      ' Bedroom' + (place.number_rooms !== 1 ? 's' : '') +
      '</div><div class="number_bathrooms">' + place.number_bathrooms +
      ' Bathroom' + (place.number_bathrooms !== 1 ? 's' : '') +
      '</div></div>');
    const ownerRequest = $.get('http://0.0.0.0:5001/api/v1/users/' + place.user_id);
    $.when(ownerRequest).done(function (ownerResponse) {
      article.append('<div class="user"><b>Owner:</b> ' + ownerResponse.first_name + ' ' + ownerResponse.last_name + '</div>');
      article.append('<div class="description">' + place.description + '</div>');
      $('section.places').append(article);
    });
  }
}

$(document).ready(function () {
  const amenities = {};
  const amDict = {};

  $('input').change(function () {
    const id = $(this).attr('data-id');
    const name = $(this).attr('data-name');
    if (this.checked) {
      amenities[id] = name;
    } else {
      delete amenities[id];
    }
    $('.amenities > h4').text(Object.values(amenities).join(', '));
  });

  $.get('http://0.0.0.0:5001/api/v1/status/', (data, status) => {
    if (data.status === 'OK') {
      $('div#api_status').addClass('available');
    } else {
      $('div#api_status').removeClass('available');
    }
  });

  $.ajax('http://0.0.0.0:5001/api/v1/places_search', {
    data: JSON.stringify({}),
    contentType: 'application/json',
    type: 'POST',
    success: function (response) {
      response.sort((a, b) => {
        // Sort by place name in ascending order
        if (a.name < b.name) return -1;
        if (a.name > b.name) return 1;
        return 0;
      });
      $('section.places').empty();
      getNewSection(response);
    },

    error: function (xhr, status) {
      console.log('error');
    }
  });

  $('button').click(function () {
    amDict.amenities = Object.keys(amenities);
    $.ajax('http://0.0.0.0:5001/api/v1/places_search', {
      data: JSON.stringify(amDict),
      contentType: 'application/json',
      type: 'POST',
      success: function (response) {
        response.sort((a, b) => {
          // Sort by place name in ascending order
          if (a.name < b.name) return -1;
          if (a.name > b.name) return 1;
          return 0;
        });
        $('section.places').empty();
        getNewSection(response);
      },

      error: function (xhr, status) {
        console.log('error');
      }
    });
  });
});
