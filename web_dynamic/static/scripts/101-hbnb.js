// Function to handle changes in amenities checkboxes
function handleAmenitiesChange (amenities) {
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
}

// Function to handle changes in location checkboxes
function handleLocationChange (states, cities) {
  $('.locations > .popover ul:first-child > li > input').change(function () {
    const idSt = $(this).attr('data-id');
    const nameSt = $(this).attr('data-name');
    if (this.checked) {
      states[idSt] = nameSt;
    } else {
      delete states[idSt];
    }
    $('.locations > h4').text(Object.values(states).join(', '));
  });

  $('.locations > .popover li li > input').change(function () {
    const idCi = $(this).attr('data-id');
    const nameCi = $(this).attr('data-name');
    if (this.checked) {
      cities[idCi] = nameCi;
    } else {
      delete cities[idCi];
    }
  });
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
async function addingReviews (article, id, allUsers) {
  const reviewResponse = await $.get('http://0.0.0.0:5001/api/v1/places/' + id + '/reviews');
  const classReviews = $('<div class="reviews"></div>');
  const reviewsList = $('<ul></ul>');
  const reviewsSpan = $('<span>show</span>');
  classReviews.append('<h2>' + reviewResponse.length + ' Review' + (reviewResponse.length !== 1 ? 's' : '') + '</h2>', reviewsSpan, reviewsList);
  $(reviewsSpan).click(function () {
    if ($(reviewsSpan).text() === 'show') {
      $(this).text('hide');
      for (const review of reviewResponse) {
        const user = allUsers.find(user => user.id === review.user_id);
        reviewsList.append($('<h3></h3>').text('From ' + user.first_name + ' at ' + formatDateFromISO(review.updated_at)), $('<li></li>').text(review.text));
      }
    } else {
      $(this).text('show');
      $(reviewsList).empty();
    }
  });
  article.append(classReviews);
}

// Function to get the new section
async function getNewSection (response) {
  const users = await $.get('http://0.0.0.0:5001/api/v1/users/');
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

    // Fetch owner details
    try {
      const user = users.find(user => user.id === place.user_id);
      article.append('<div class="user"><b>Owner:</b> ' + user.first_name + ' ' + user.last_name + '</div>');
      article.append('<div class="description">' + place.description + '</div>');
      addingReviews(article, place.id, users);
      $('section.places').append(article);
    } catch (error) {
      console.error('Error fetching owner:', error);
    }
  }
}

// Function to fetch status and places data
async function fetchDataAndPopulate () {
  try {
    const statusResponse = await $.get('http://0.0.0.0:5001/api/v1/status/');
    if (statusResponse.status === 'OK') {
      $('div#api_status').addClass('available');
    } else {
      $('div#api_status').removeClass('available');
    }

    const placesResponse = await $.ajax({
      url: 'http://0.0.0.0:5001/api/v1/places_search',
      method: 'POST',
      contentType: 'application/json',
      data: JSON.stringify({})
    });

    const sortedResponse = placesResponse.sort((a, b) => a.name.localeCompare(b.name));
    $('section.places').empty();
    getNewSection(sortedResponse);
  } catch (error) {
    console.error('Error:', error);
  }
}

$(document).ready(function () {
  const amenities = {};
  const states = {};
  const cities = {};

  // Call functions to handle changes in amenities and location checkboxes
  handleAmenitiesChange(amenities);
  handleLocationChange(states, cities);

  // Call function to fetch data and populate the page
  fetchDataAndPopulate(amenities, states, cities);

  // Handle button click event
  $('button').click(async function () {
    const amDict = {
      amenities: Object.keys(amenities),
      cities: Object.keys(cities),
      states: Object.keys(states)
    };

    // Fetch places data based on selected amenities and locations
    try {
      const response = await $.ajax({
        url: 'http://0.0.0.0:5001/api/v1/places_search',
        method: 'POST',
        contentType: 'application/json',
        data: JSON.stringify(amDict)
      });
      const sortedResponse = response.sort((a, b) => a.name.localeCompare(b.name));
      $('section.places').empty();
      await getNewSection(sortedResponse);
    } catch (error) {
      console.error('Error searching places:', error);
    }
  });
});
