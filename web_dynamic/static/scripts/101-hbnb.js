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
    });
    addingReviews(article, place.id);
    $('section.places').append(article);
  }
}

function getOrdinalIndicator (day) {
  if (day >= 11 && day <= 13) {
    return 'th';
  }
  switch (day % 10) {
    case 1: return 'st';
    case 2: return 'nd';
    case 3: return 'rd';
    default: return 'th';
  }
}

function formatDateFromISO (isoDate) {
  const date = new Date(isoDate);
  const day = date.getDate();
  const month = date.toLocaleString('en-GB', { month: 'long' });
  const year = date.getFullYear();
  const ordinal = getOrdinalIndicator(day);
  return `${day}${ordinal} ${month} ${year}`;
}

// Function to add the reviews to the article
async function addingReviews (article, id) {
  const reviewResponse = await $.get('http://0.0.0.0:5001/api/v1/places/' + id + '/reviews');
  const allUsers = await $.get('http://0.0.0.0:5001/api/v1/users');
  const classReviews = $('<div class="reviews"></div>');
  const reviewsList = $('<ul></ul>');
  const reviewsSpan = $('<span>show</span>');
  classReviews.append('<h2>' + reviewResponse.length + ' Review' + (reviewResponse.length !== 1 ? 's' : '') + '</h2>', reviewsSpan, reviewsList);
  $(reviewsSpan).click(function () {
    if ($(reviewsSpan).text() === 'show') {
      $(this).text('hide');
      for (const review of reviewResponse) {
        user = allUsers.find(user => user.id === review.user_id);
        reviewsList.append($('<h3></h3>').text('From ' + user.first_name + ' at ' + formatDateFromISO(review.updated_at)), $('<li></li>').text(review.text));
      }
    } else {
      $(this).text('show');
      $(reviewsList).empty();
    }
  });
  article.append(classReviews);
}

$(document).ready(function () {
  const amenities = {};
  const states = {};
  const cities = {};
  const amDict = {};

  $('.amenities input').change(function () {
    const id = $(this).attr('data-id');
    const name = $(this).attr('data-name');
    if (this.checked) {
      amenities[id] = name;
    } else {
      delete amenities[id];
    }
    $('.amenities > h4').text(Object.values(amenities).join(', '));
  });

  $('.locations > .popover ul:first-child > li > input').change(function () {
    const id_st = $(this).attr('data-id');
    const name_st = $(this).attr('data-name');
    if (this.checked) {
      states[id_st] = name_st;
    } else {
      delete states[id_st];
    }
    $('.locations > h4').text(Object.values(states).join(', '));
  });

  $('.locations > .popover li li > input').change(function () {
    const id_ci = $(this).attr('data-id');
    const name_ci = $(this).attr('data-name');
    if (this.checked) {
      cities[id_ci] = name_ci;
    } else {
      delete cities[id_ci];
    }
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
    amDict.cities = Object.keys(cities);
    amDict.states = Object.keys(states);
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
