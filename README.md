# KaiOs meteo

This application displays the meteo in different cities that can be edited in the `/sdcard1/apps/meteo/config.json` file :

```
{
  "cities":[
  	{	"choiceList_label":"à Paris",
  		"location":"48.8589101,2.3119547",
  		"choiceList_type":"BOOLEAN"
  	},
  	{	"choiceList_label":"à Ljubljana",
  		"location":"46.06569339288593,14.503865423626841",
  		"choiceList_type":"BOOLEAN"
  	}
  ]
}
```

The application gets data from `https://www.infoclimat.fr/api-previsions-meteo.html?id=2988507&cntry=FR`.

The main screen gives the meteo feeling, temperature, rain quantity and mean/max wind speed :

![main screen](screen_copies/main_screen.png)  

The second screen (accessible with the `ArrowDown` key) gives the humidity, pressure, global cloudiness, wind direction and snow risks :

![second screen](screen_copies/second_screen.png)  

The `ArrowUp` key gives access back to the main screen

The forecast date can be choosen with the `SoftRight` or `SoftLeft` keys :

![waiting screen](screen_copies/nextDate_screen.png)  

The city can be choosen with the `ArrowLeft` or `ArrowRight` keys :

![waiting screen](screen_copies/nextCity_screen.png)  


# Next versions

- If snow, make snow icon blinking in alternate with cloud icon
- Add an interface :
	- to add a city here
	- to add a city giving its coordinates
	- to add a city with the CARTO app

