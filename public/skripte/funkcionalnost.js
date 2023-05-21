var baza = "jakepel03";
var baseUrl = "https://teaching.lavbic.net/api/OIS/baza/" + baza + "/podatki/";
var SENSEI_RACUN = "0xECF8dEe9C76031e7A79616053B63590A15Be630B";

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
            url: "https://weather.visualcrossing.com/VisualCrossingWebServices/rest/services/timeline/" + imeDestinacije + "/next7days?unitGroup=metric&elements=datetime%2Ctemp%2Cwindspeedmax%2Cconditions&include=days&key=FQJKS22Y4MZ97GQXL5C7ZBFV6&contentType=json",
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
                "Destinacija je bila uspešno dodana v bazo" +
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

/**
 * Funkcija za všečkanje z 0,1 - 1 Ethereum kriptovalute
 */
const vseckaj = async (modalnoOknoVseckaj) => {
    try {
        var prejemnikDenarnica = $("#eth-racun").attr("denarnica");
        var posiljateljDenarnica = $("#denarnica-posiljatelja").text();
        var kolicinaETH = $("#kolicinaETH").val();

        let rezultat = await web3.eth.sendTransaction({
            from: posiljateljDenarnica,
            to: prejemnikDenarnica,
            value: kolicinaETH * Math.pow(10, 18),
        });

        // ob uspešni transakciji
        if (rezultat) {
            modalnoOknoVseckaj.hide();
        } else {
            // neuspešna transakcija
            $("#napakaVseckanje").html(
                "<div class='alert alert-danger' role='alert'>" +
                "<i class='fas fa-exclamation-triangle me-2'></i>" +
                "Prišlo je do napake pri transakciji!" +
                "</div>"
            );
        }
    } catch (e) {
        // napaka pri transakciji
        $("#napakaVseckanje").html(
            "<div class='alert alert-danger' role='alert'>" +
            "<i class='fas fa-exclamation-triangle me-2'></i>" +
            "Prišlo je do napake pri transakciji: " + e +
            "</div>"
        );
    }
};


function okrajsajNaslov(vrednost) {
    return vrednost.substring(0, 4) + "..." + vrednost.substring(vrednost.length - 3, vrednost.length);
}

/**
 * Funkcija za prijavo Ethereum denarnice v testno omrežje
 */
const prijavaEthereumDenarnice = async (modalnoOknoPrijava) => {
    try {
        let rezultat = await web3.eth.personal.unlockAccount(
            $("#denarnica").val(),
            $("#geslo").val(),
            300);

        // ob uspešni prijavi računa
        if (rezultat) {
            prijavljenRacun = $("#denarnica").val();
            $("#eth-racun").html(okrajsajNaslov($("#denarnica").val()) + " (5 min)");
            $("#eth-racun").attr("denarnica", $("#denarnica").val());
            $("#gumb-vseckaj-start").removeAttr("disabled");
            modalnoOknoPrijava.hide();
        } else {
            // neuspešna prijava računa
            $("#napakaPrijava").html(
                "<div class='alert alert-danger' role='alert'>" +
                "<i class='fas fa-exclamation-triangle me-2'></i>" +
                "Prišlo je do napake pri odklepanju!" +
                "</div>"
            );
        }
    } catch (napaka) {
        // napaka pri prijavi računa
        $("#napakaPrijava").html(
            "<div class='alert alert-danger' role='alert'>" +
            "<i class='fas fa-exclamation-triangle me-2'></i>" +
            "Prišlo je do napake pri odklepanju: " + napaka +
            "</div>"
        );

    }
};
/**
 * Funkcija za prikaz všečkov v tabeli
 */
const dopolniTabeloVseckov = async () => {
    try {
        let steviloBlokov = (await web3.eth.getBlock("latest")).number;
        let st = 1;
        $("#seznam-vseckov").html("");
        for (let i = 0; i <= steviloBlokov; i++) {
            let blok = await web3.eth.getBlock(i);

            for (let txHash of blok.transactions) {
                let tx = await web3.eth.getTransaction(txHash);
                if (SENSEI_RACUN == tx.to) {
                    $("#seznam-vseckov").append("\
                    <tr>\
                        <th scope='row'>" + st++ + "</th>\
                        <td>" + okrajsajNaslov(tx.hash) + "</td>\
                        <td>" + okrajsajNaslov(tx.from) + "</td>\
                        <td>" + parseFloat(web3.utils.fromWei(tx.value)) + " <i class='fa-brands fa-ethereum'></i></td>\
                    </tr>");
                }
            }
        }
    } catch (e) {
        alert(e);
    }
};


/**
 * Funkcija za dodajanje poslušalcev modalnih oken
 */
function poslusalciModalnaOkna() {
    const modalnoOknoPrijava = new bootstrap.Modal(document.getElementById('modalno-okno-prijava'), {
        backdrop: 'static'
    });

    const modalnoOknoVseckaj = new bootstrap.Modal(document.getElementById('modalno-okno-vseckanje'), {
        backdrop: 'static'
    });

    $("#denarnica,#geslo").keyup(function (e) {
        if ($("#denarnica").val().length > 0 && $("#geslo").val().length > 0)
            $("#gumb-potrdi-prijavo").removeAttr("disabled");
        else
            $("#gumb-potrdi-prijavo").attr("disabled", "disabled");
    });

    $("#gumb-potrdi-prijavo").click(function (e) {
        prijavaEthereumDenarnice(modalnoOknoPrijava);
    });

    $("#potrdi-vsecek").click(function (e) {
        vseckaj(modalnoOknoVseckaj);
    });

    var modalnoOknoVsecki = document.getElementById('modalno-okno-vseckanje');
    modalnoOknoVsecki.addEventListener('show.bs.modal', function (event) {
        var prijavljenaDenarnica = $("#eth-racun").attr("denarnica");
        $("#prejemnik").text(SENSEI_RACUN);
        $("#denarnica-posiljatelja").text(prijavljenaDenarnica);
    });

    var modalnoOknoSeznamVseckov = document.getElementById('modalno-okno-seznam-vseckov');
    modalnoOknoSeznamVseckov.addEventListener('show.bs.modal', function (event) {
        dopolniTabeloVseckov();
    });
}

$(document).ready(function () {

    /* Povežemo se na testno Ethereum verigo blokov */
    web3 = new Web3("https://sensei.lavbic.net:8546");

    /* Dodamo poslušalce */
    poslusalciModalnaOkna();

});



