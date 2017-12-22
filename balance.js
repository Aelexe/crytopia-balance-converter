const currencyCodeRegex = /\((.*)\)/;
const tradePairRegex = /(.*)\//;

var balancesTable;
var rows;

var currencyMap;

$.when(checkPageLoad(), getMarketData()).then(modifyPage);

/**
 * Retrieves the current NZD values for the cryptocurrencies and stores it in the currency map.
 * @returns A promise that resolves once the market data is retrieved.
 */
function getMarketData() {
    var deferred = $.Deferred();

    $.getJSON("https://www.cryptopia.co.nz/api/GetMarkets/NZDT", function(data) {
        var tradePairs = data.Data;

        // Store NZD being equal to itself.
        currencyMap = {
            "NZDT": 1
        };

        // Iterate the trade pairs and store the buy price against the currency code.
        for (var i = 0; i < tradePairs.length; i++) {
            var tradePair = tradePairs[i];
            currencyMap[tradePair.Label.match(tradePairRegex)[1]] = tradePair.AskPrice;
        }

        deferred.resolve();
    });

    return deferred.promise();
}

/**
 * Checks if the page is loaded.
 * @returns a promise that will resolve once the balance table has been loaded.
 */
function checkPageLoad() {
    var deferred = $.Deferred();

    var interval = setInterval(function() {
        balancesTable = $("#table-balances");
        rows = balancesTable.find("tbody tr");
        if (rows.length != 0) {
            clearInterval(interval);
            deferred.resolve();
        }
    }, 250);

    return deferred.promise();
}

/**
 * Modifies the balance page, adding NZD values where possible.
 */
function modifyPage() {
    // Insert the total header.
    var totalNzdHeader = $("<th>");
    totalNzdHeader.text("Total (NZDT)");
    totalNzdHeader.css("width", "225px");
    balancesTable.find("thead tr th:eq(3)").after(totalNzdHeader);

    // Total NZD value of all currencies.
    var total = 0;

    // Iterate over each row, calculating the NZD value, displaying it, and adding it to the total.
    rows.each(function() {
        var columns = $(this).find("td");
        var currencyTotal = columns.eq(3).text();
        var rowSearchVal = columns.eq(1).attr("data-search");
        var currencyCode = rowSearchVal.match(currencyCodeRegex)[1];

        var currencyTotalNzdTd = $("<td>");
        var currencyTotal = currencyTotal * currencyMap[currencyCode];
        total += currencyTotal;
        currencyTotalNzdTd.text("$" + currencyTotal.toFixed(2));

        columns.eq(3).after(currencyTotalNzdTd);
    });

    // Display the total NZD value alongside the estimated BTC values.
    var estimatedTotalsDiv = $(".col-md-4.nopad");
    estimatedTotalsDiv.append($.parseHTML("<div><span>Estimated NZDT: <span class=\"text-success\">$" + total.toFixed(2) + "</span></span></div>"));
}
