$(document).ready(() => {
  $("select#seznamRacunov").change(function (e) {
    let izbranRacunId = $(this).val();
    console.log(izbranRacunId);
  });
});
