$(document).ready(function () {
  const amenities = {};
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
});
