'use strict';

var EUROCARD = EUROCARD || {};

(function(EUROCARD) {

	var configFile = "./config/config.json";
	var config;


	var toTitleCase = function (str) {
		return str.replace(/\w\S*/g, function(txt){return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();});
	};

	var formatAmount = function (num) {
		if (num && !isNaN(num))
			return parseFloat(num).toFixed(2);
		else
			return '';
	};

	var parseAmount = function (val) {
		if (val && val.indexOf(',') > -1)
			return parseFloat(val.replace(' ', '').replace(',', '.'));
		else
			return null;
	};

	var sortCompare = function(a, b) {
		return a.date > b.date;
	}

	EUROCARD.importTextToFields = function (str) {

		// Convert every 3 lines to 1:
		var newStr = "";
		var rows = str.split('\n');
		for (var i = 0; i < rows.length / 3; i++) {
			if (rows[i * 3 + 2]) {
				//(rows[i * 3 + 2].indexOf('\t') === -1 ? '\t' : '')
				//console.log(i, rows[i * 3 + 2], rows[i * 3 + 2][0]);
				// Optional \t character is different in Chrome/FF
				newStr += (rows[i * 3] + rows[i * 3 + 1] + (rows[i * 3 + 2][0] !== -1 ? '\t' : '') + rows[i * 3 + 2] + '\n');
			}
		}

		// Sort into fields
		var resultArray = [];
		rows = newStr.split('\n');
		var today = new Date();
		for (i in rows) {
			if (rows[i] !== "") {
				var fields = rows[i].split('\t');
				resultArray.push({
					date: ( today.getFullYear() + '-' + fields[0] ),
					dateBooked: ( today.getFullYear() + '-' + fields[1] ),
					specification: fields[2],
					location: fields[3],
					currency: fields[4],
					vat: parseAmount(fields[5]),
					amount: parseAmount(fields[6])
				});
				//console.log(i + ": ", resultArray[i]);
			}
		}

		return resultArray;
	};

	EUROCARD.processFields = function (data) {
		/*
		BAS konto:
		4050. Inköp från utlandet
		4600. Underentreprenad
		5011. Kontorslokal
		5250. Hyra av datorer
		5410. Förbrukningsinventarie
		5420. Dataprogram
		5710. Frakter, transporter och försäkringar vid varudistribution
		5800. Resekostnader
		5810. Biljetter
		5831. Kost och logi i Sverige
		5832. Kost och logi i utlandet
		5910. Annonsering
		5930. Reklamtrycksaker och direktreklam
		5940. Utställningar och mässor
		5980. PR, institutionell reklam och sponsring
		5990. Reklam, övrigt
		5991. Hemsida
		6071. Representation
		6072. Representation, ej avdragsgill
		6090. Övriga försäljningskostnader
		6110. Kontorsmateriel
		6211. Fast telefoni
		6212. Mobiltelefon
		6230. Datakommunikation
		6250. Postbefordran
		7690. Personalkostnader (kaffebröd)

		Dropbox
		Paypal *Facebookire
		Paypal *Designcrowd
		Tictail.com


		*/

		// Find a supplier and apply attributes from config.json
		var findSupplier = function (dataRow) {
			for (var supplierPattern in config.suppliers) {
				var supplier = config.suppliers[supplierPattern];
				//console.log(supplierPattern, dataRow.specification, dataRow.specification.toLowerCase().search(supplierPattern) );
				// If this row's specification matches the supplier(Pattern)
				if (dataRow.specification.toLowerCase().search(supplierPattern) > -1) {
					if (supplier['name-regexp']) {
						var regexp = new RegExp(supplier['name-regexp'], 'gi');
						var regResult = regexp.exec(dataRow.specification);
						//console.log('RegExp:', dataRow.specification, '=', regResult, regResult[1] );
						dataRow.specification = regResult[1];
					}
					dataRow.supplier = supplier.name || dataRow.specification;
					dataRow.category = supplier.category || "";
					dataRow.owner = supplier.owner || "";
					dataRow.receipt = supplier.receipt || config.defaults.receipt;
					dataRow.specification = supplier.specification || dataRow.specification;
				}
			}
		};

		for (var i in data) {
			// Init default values
			data[i].supplier = "";
			data[i].category = "";
			data[i].owner = "";
			data[i].receipt = "";
			data[i].amountSEK = data[i].amount;
			data[i].amountExcludingVAT = data[i].amount - data[i].vat;
			// Titleize
			data[i].specification = toTitleCase(data[i].specification);
			data[i].location = toTitleCase(data[i].location);
			findSupplier(data[i]);
			// Calculate VAT/external currency
			if (data[i].currency === 'SEK') {
				// VAT
			}
			else if (data[i].currency == "") {
				// VAT
				data[i].currency = 'SEK*';
				data[i].vat = 0.00;
			}
			else {
				// Other currency
				data[i].amount = data[i].vat;
				data[i].vat = null;
				data[i].amountExcludingVAT = data[i].amountSEK;
			}
		}
		return data;
	};

	EUROCARD.formatOutput = function (data) {

		var headers = "";
		var rows = "";
		for (var i in data) {
			// Nr
			if (i === '0') headers += "Nr" + '\t';
			rows += (parseInt(i) + 1) + '\t';
			// Date paid
			if (i === '0') headers += "Date" + '\t';
			rows += data[i].date + '\t';
			// Description
			if (i === '0') headers += "Description" + '\t';
			rows += data[i].specification + '\t';
			// Company
			if (i === '0') headers += "Company" + '\t';
			rows += data[i].supplier + '\t';
			// Receipt
			if (i === '0') headers += "Receipt" + '\t';
			rows += data[i].receipt + '\t';
			// Project
			if (i === '0') headers += "Project" + '\t';
			rows += '\t';
			// Category
			if (i === '0') headers += "Category" + '\t';
			rows += data[i].category + '\t';
			// Amount
			if (i === '0') headers += "Amount" + '\t';
			rows += formatAmount(data[i].amount) + '\t';
			// Currency
			if (i === '0') headers += "Currency" + '\t';
			rows += data[i].currency + '\t';
			// Rate
			if (i === '0') headers += "Rate" + '\t';
			rows += '\t';
			// Amount SEK
			if (i === '0') headers += "Amount SEK" + '\t';
			rows += formatAmount(data[i].amountSEK) + '\t';
			// VAT
			if (i === '0') headers += "VAT" + '\t';
			rows += formatAmount(data[i].vat) + '\t';
			// Excl. VAT
			if (i === '0') headers += "Excl. VAT" + '\t';
			rows += formatAmount(data[i].amountExcludingVAT) + '\t';
			// Owner
			if (i === '0') headers += "Owner";
			rows += data[i].owner;

			// New line
			rows += '\n';
		}
		return headers + '\n' + rows;
	};

	EUROCARD.processData = function (str) {
		try {
			var result = EUROCARD.importTextToFields(str);
			result = EUROCARD.processFields(result);
			//result.sort(sortCompare);
			return EUROCARD.formatOutput(result);
		}
		catch (e) {
			alert(e, 'Error');
		}
	};


	// When document has finished loading
	$(document).ready(function() {

		// Load config JSON
		$.get(configFile, function(data) {
			config = data;
			//console.log("Loaded config:", config);
		});
		
		$("#input").change(function(event) {
			$("#output").val(EUROCARD.processData($("#input").val()));
		});

		$("#submitbutton").click(function(event) {
			$("#output").val(EUROCARD.processData($("#input").val()));
			//event.preventDefault();
		});
		
	});

}(EUROCARD));