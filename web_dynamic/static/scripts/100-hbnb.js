$(document).ready(function () {
  const amenities = {};
  const states = {};
  const cities = {};
  $('.amenities input').change(function () {
    const id_am = $(this).attr('data-id');
    const name_am = $(this).attr('data-name');
    if (this.checked) {
      amenities[id_am] = name_am;
    } else {
      delete amenities[id_am];
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
});
