var baza = "jakepel03";
var baseUrl = "https://teaching.lavbic.net/api/OIS/baza/" + baza + "/podatki/";


narediSeznamDestinacij();
// naredi poizvedbo o vremenu na izbran API
function narediPoizvedbo() {
    var imeDestinacije = $("#iskanaDestinacija").val().toLowerCase();
    if (!imeDestinacije || imeDestinacije.trim().length == 0) {
        $("#kreirajSporocilo").html(
            "<div class='alert alert-warning alert-dismissible fade show mt-3 mb-0'>" +
            "Prosim vnesite zahtevane podatke!" +
            "<button type='button' class='btn-close' data-bs-dismiss='alert'></button>" +
            "</div>"
        );
    } else {
        $.ajax({
            url: "https://weather.visualcrossing.com/VisualCrossingWebServices/rest/services/timeline/" + imeDestinacije + "/next7days?unitGroup=metric&elements=datetime%2CdatetimeEpoch%2Cname%2Clatitude%2Clongitude%2Ctempmax%2Ctempmin%2Ctemp%2Cwindspeed%2Cwindspeedmax%2Cpressure%2Cuvindex%2Csunrise%2Csunset%2Cconditions%2Cdescription&include=days&key=FQJKS22Y4MZ97GQXL5C7ZBFV6&contentType=json",
            type: "GET",
            success: function (podatki) {
                dodajVBazo(imeDestinacije, podatki);
            },
            error: function (err) {
                $("#kreirajSporocilo").html(
                    "<div class='alert alert-danger alert-dismissible fade show mt-3 mb-0'>" +
                    "Invalid location found. Please check your location parameter" +
                    "<button type='button' class='btn-close' data-bs-dismiss='alert'></button>" +
                    "!</div>"
                );
            },
        });
    }
}
// izbrano destinacijo dodamo v bazo
function dodajVBazo(imeDestinacije, vreme) {
    var podatki = {
        ime: imeDestinacije,
        podatkiVreme: vreme
    };
    $.ajax({
        url: baseUrl + "azuriraj?kljuc=" + imeDestinacije,
        type: "PUT",
        contentType: "application/json",
        data: JSON.stringify(podatki),
        success: function (data) {
            $("#kreirajSporocilo").html(
                "<div class='alert alert-success alert-dismissible fade show mt-3 mb-0'>" +
                "Destinacija je bila uspešno dodana v bazo <b>" +
                "<button type='button' class='btn-close' data-bs-dismiss='alert'></button>" +
                "</div>"
            );
            $("#iskanaDestinacija").val("");
            narediSeznamDestinacij();
        },
        error: function (napaka) {
            $("#kreirajSporocilo").html(
                "<div class='alert alert-danger alert-dismissible fade show mt-3 mb-0'>" +
                "Napaka '" +
                JSON.parse(napaka.responseText).opis +
                "<button type='button' class='btn-close' data-bs-dismiss='alert'></button>" +
                "!</div>"
            );
        },
    });
}

// ustvari seznam destinacij, za katere so že zbrani podatki v bazi
function narediSeznamDestinacij() {
    $.ajax({
        url: baseUrl + "vrni/vsi",
        type: "GET",
        contentType: "application/json",
        success: function (data) {
            $("#izborDestinacije").empty(); // izpraznemo prejsni (ne vec veljaven seznam)
            var destinacije = Object.keys(data);
            for (let i = 0; i < destinacije.length; i++) {
                var imeDestinacije = destinacije[i];
                var novOption = $("<option></option>").text(imeDestinacije).val(imeDestinacije);

                $("#izborDestinacije").append(novOption);
            }
        },
        error: function (napaka) {
            $("#kreirajSporocilo").html(
                "<div class='alert alert-danger alert-dismissible fade show mt-3 mb-0'>" +
                "Napaka '" +
                JSON.parse(napaka.responseText).opis +
                "<button type='button' class='btn-close' data-bs-dismiss='alert'></button>" +
                "!</div>"
            );
        },
    });
}

// izpisemo podatke o vremenu
function izpisPodatkov() {
    var destinacija = $("#izborDestinacije").val();
    $.ajax({
        url: baseUrl + "vrni/" + destinacija,
        type: "GET",
        success: function (podatki) {
            var imeDestinacije = destinacija.charAt(0).toUpperCase() + destinacija.slice(1);

            $("#izpisiPodatke").html(
                "<div class='alert alert-success alert-dismissible fade show mt-3 mb-0'>" +
                "Kraj: <b>" +
                imeDestinacije +
                " " +
                "</b>" +
                "<button type='button' class='btn-close' data-bs-dismiss='alert'></button>" +
                "<ul id='podatkiPoDnevih' style='list-style: none'></ul>" +
                "</div>"
            );
            // array podatkiGraf bo hranil ključne podatke, ki jih rabimo za izris grafa
            var podatkiGraf = [];

            // za vsak dan izpisemo podatke
            for(let i = 0; i < 7; i++) {
                var dan = podatki.podatkiVreme.days[i];
                var date = dan.datetime;
                var povprecnaTemp = dan.temp;
                var veterMax = dan.windspeedmax;
                var opis = dan.conditions;

                podatkiGraf.push([date, povprecnaTemp]);

                var text =
                    "<b>Datum: " + date + "</b></br>" +
                    "Povprečna temperatura: " + povprecnaTemp + " °C</br>" +
                    "Maksimalna hitrost vetra: " + veterMax + " km/h</br>" +
                    "Opis: " + opis + "</br></br>";

                var zapisDan = $("<li></li>").html(text);

                $("#podatkiPoDnevih").append(zapisDan);

            }
            izrisiGraf(podatkiGraf);
        }

    });
}

function izrisiGraf(podatkiGraf) {
    var destinacija = $("#izborDestinacije").val();
    var chart = new CanvasJS.Chart("vsebnikGrafa", {
        title:{
            text: "Povprečna temperatura (°C) v naslednjih 7 dneh na lokaciji " + (destinacija.charAt(0).toUpperCase() + destinacija.slice(1))
        },
        data: [
            {
                // Change type to "doughnut", "line", "splineArea", etc.
                type: "column",
                dataPoints: [
                    { label: podatkiGraf[0][0],  y: podatkiGraf[0][1]  },
                    { label: podatkiGraf[1][0], y: podatkiGraf[1][1]  },
                    { label: podatkiGraf[2][0], y: podatkiGraf[2][1]  },
                    { label: podatkiGraf[3][0],  y: podatkiGraf[3][1]  },
                    { label: podatkiGraf[4][0],  y: podatkiGraf[4][1]  },
                    { label: podatkiGraf[5][0],  y: podatkiGraf[5][1]  },
                    { label: podatkiGraf[6][0],  y: podatkiGraf[6][1]  },
                ]
            }
        ]
    });
    chart.render();
}



