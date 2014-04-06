# Eurocard.se Exporter

Simple but customizable* web app that converts copied data from Eurocard.se transactions:

![Eurocard screenshot](images/eurocard-copy-example.png)

or when copied to text:

	04-04	04-05	
	AMAZON WEB SERVICES
	AWS.AMAZON.CO	USD	13,50	90,70
	04-03	04-04	
	PANINI
	STOCKHOLM			41,00
	04-03	04-04	
	SPRING
	STOCKHOLM	SEK	108,00	580,00
	04-02	04-03	
	PAYPAL *TTKSERVICES
	35314369001			156,85

to the more usable format:

	Nr	Date	Description	Company	Receipt	Project	Category	Amount	Currency	Rate	Amount SEK	VAT	Excl. VAT	Owner
	1	2014-04-04	Server hosting	Amazon Web Services	PDF		5250. Hyra av datorer	13.50	USD		90.70		90.70	Tomorroworld
	2	2014-04-03	Panini					41.00	SEK*		41.00		41.00	
	3	2014-04-03	Spring					580.00	SEK		580.00	108.00	472.00	
	4	2014-04-02	Virtual assistant	GetFriday	PDF		4600. Underentreprenad	156.85	SEK*		156.85		156.85	Tomorroworld

## *Configuration

The file `config/config.json` contains settings for customization.