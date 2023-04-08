$(document).ready(() => {
  $("select#seznamRacunov").change(function (e) {
    let izbranRacunId = $(this).val();
    console.log(izbranRacunId);
    // pridobimo destinacije racuna, dobimo tabelo destinacij
    fetch(`/destinacije-racuna/${izbranRacunId}`)
        .then(odgovor => odgovor.json())
        .then(destinacije => {
          let skupnaCena = 0;
          let maxCena = 0;
          let najdrazjaDestinacija;
          // sprehodimo se po destinacijah, hranimo najdražjo destinacijo in skupno ceno
          for (let i = 0; i < destinacije.length; i++) {
            let cena = destinacije[i].cena;
            skupnaCena += cena;
            if (cena > maxCena) {
                maxCena = cena;
                najdrazjaDestinacija = destinacije[i].ime;
            }
          }
          // v že obstoječ element #skupnaCenaIzleta zapišemo dodatne podatke
          document.getElementById("skupnaCenaIzleta").innerHTML = `Skupna cena izleta znaša <b>${skupnaCena} €</b>, pri čemer je najdražja destinacija <b>${najdrazjaDestinacija}</b>.`;
        });
  });
});
