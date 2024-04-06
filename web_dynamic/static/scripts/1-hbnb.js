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
});
