#!/usr/bin/python

# sample - http://www.ontariogasprices.com/Timmins/index.aspx
# <value>gasprices.com/<key>/index.aspx

import urllib2
import cgitb
import json
import sys
import re

sys.path.append('/home/hoilo/lib/python')
from bs4 import BeautifulSoup

numOfGasStations = 0;
total = 0.0;
onePrice = "";
listOfPrices = [];

dictionary = {
    'Ajax': 'toronto',
	'Barrie': 'barrie',
	'Belleville': 'ontario',
	'Brampton': 'toronto',
	'Brantford': 'ontario',
	'Brockville': 'ontario',
	'Burlington': 'hamilton',
	'Cambridge': 'kw',
	'Cornwall': 'ontario',
	'Dryden': 'ontario',
	'Sudbury': 'ontario',
	'Guelph': 'kw',
	'Hamilton': 'hamilton',
	'Kenora': 'ontario',
	'Kingston': 'ontario',
	'Kitchener': 'kw',
	'London': 'london',
	'Markham': 'toronto',
	'Milton': 'toronto',
	'Mississauga': 'toronto',
	'Niagara Falls': 'ontario',
	'North Bay': 'ontario',
	'Orillia': 'ontario',
	'Oshawa': 'ontario',
	'Ottawa': 'ottawa',
	'Owen Sound': 'ontario',
	'Pembroke': 'ontario',
	'Peterborough': 'ontario',
	'Pickering': 'ontario',
	'Richmond Hill': 'toronto',
	'Sarnia': 'ontario',
	'Sault Ste. Marie': 'ontario',
	'St. Catharines': 'ontario',
	'Thunder Bay': 'ontario',
	'Timmins': 'ontario',
	'Toronto': 'toronto',
	'Windsor': 'ontario',
	'Welland': 'ontario',
	'Whitby': 'ontario',
	'Vaughan': 'toronto',
        'Montreal': 'montreal',
	'Calgary': 'calgary',
	'Edmonton': 'edmonton',
	'Winnipeg': 'winnipeg',
	'Vancouver': 'vancouver',
	'Quebec City': 'quebec',
	'Surrey': 'vancouver',
	'Burnaby': 'vancouver',
	'Laval': 'montreal',
	'Halifax': 'halifax',
	'Gatineau': 'quebec',
	'Longueuil': 'montreal',
	'Saskatoon': 'saskatoon',
	'Regina': 'regina',
	'Richmond': 'vancouver',
	'Coquitlam': 'vancouver',
	'Abbotsford': 'abbotsford',
	'Kelowna': 'bc',
        'North Vancouver': 'vancouver',
	'Sherbrooke': 'quebec',
	'Sannichton': 'victoria',
	'Victoria': 'victoria',
	'Langley': 'vancouver',
	'Delta': 'vancouver',
	'Kamloops': 'bc',
	'Nanaimo': 'bc',
	'Prince George': 'bc',
	'Medicine Hat': 'alberta',
	'Belleville': 'ontario',
	'Oakville': 'toronto',
        'Stratford': 'kw',
        'Red Deer': 'alberta',
        'Lethbridge': 'alberta',
        'Airdrie': 'alberta',
        'Okotoks': 'alberta',
        'Smiths Falls': 'ontario',
        'Sherwood Park': 'alberta',
        'Prince Albert': 'sask',
        'Moose Jaw': 'sask',
        'Yorkton': 'sask',
        'Swift Current': 'sask',
        'Estevan': 'sask',
        'Weyburn': 'sask',
        'Dauphin': 'manitoba',
        'Brandon': 'manitoba',
        'Steinbach': 'manitoba',
        'Portage la Prairie': 'manitoba',
        'Thompson': 'manitoba',
        'Winkler': 'manitoba',
        'Parksville': 'bc',
        'Spruce Grove': 'edmonton',
        'Leduc': 'alberta',
        'Gimli': 'manitoba',
        'Fort Saskatchewan': 'edmonton',
        'Niverville': 'manitoba',
        'Truro': 'novascotia',
        'Amherst': 'novascotia',
        'New Glasgow': 'novascotia',
        'Bridgewater': 'novascotia',
        'Yarmouth': 'novascotia',
        'Kentville': 'novascotia',
        'Antigonish': 'novascotia',
        'Stellarton': 'novascotia',
        'Wolfville': 'novascotia',
        'Springhill': 'novascotia',
        'Westville': 'novascotia',
        'Windsor': 'novascotia',
        'Pictou': 'novascotia',
        'Port Hawkesbury': 'novascotia',
        'Trenton': 'novascotia',
        'Berwick': 'novascotia',
        'Lunenburg': 'novascotia',
        'Digby': 'novascotia',
        'Middleton': 'novascotia',
        'Shelburne': 'novascotia',
        'Stewiacke': 'novascotia',
        'Parrsboro': 'novascotia',
        'Sydney': 'novascotia',
        'Dartmouth': 'halifax',
        'Glace Bay': 'novascotia',
        'Bedford': 'halifax',
        'Fredericton': 'newbrunswick',
        'Saint John': 'newbrunswick',
        'Moncton': 'newbrunswick',
        'Dieppe': 'newbrunswick',
        'Miramichi': 'newbrunswick',
        'Edmundston': 'newbrunswick',
        'Bathurst': 'newbrunswick',
        'Campbellton': 'newbrunswick',
        'Oromocto': 'newbrunswick',
        "St. John's": 'newfoundland',
        'Mount Pearl': 'newfoundland',
        'Portugal Cove': 'newfoundland',
        'Conception Bay South': 'newfoundland',
        'Labrador City': 'newfoundland',
        'Flowers Cove': 'newfoundland',
        'Twillingate': 'newfoundland',
        'Gander': 'newfoundland',
        'Templeman': 'newfoundland',
        'Lumsden': 'newfoundland',
        'St Anthony': 'newfoundland',
        'Corner Brook': 'newfoundland',
        'Quispamsis': 'newbrunswick',
        'Fort McMurray': 'alberta'
};

print "Content-type: text/html\n\n";

response = json.load(sys.stdin);
print "--------------";
#print("Content-Type: application.json", end="\n\n")
#response = response.replace(" ", "");
json.dump(response, sys.stdout, indent=2);

print response

#response = 'Belleville';

# TODO: if city not in list, use average Ontario gas prices
webAddress = 'http://www.' + dictionary.get(response, 'Does Not Exist') + 'gasprices.com/';
if 'Does Not Exist' in webAddress:
    print '\nERROR: city not supported'
    print dictionary.get(response, 'Does Not Exist')
    print webAddress
    sys.exit()

cityUrl = response;

if "." in response:
	cityUrl = cityUrl.replace(". ", "%20");

if " " in cityUrl:
	cityUrl = cityUrl.replace(" ", "%20");

if "'" in cityUrl:
	cityUrl = cityUrl.replace("'", "");

webAddress = webAddress + cityUrl + '/index.aspx';
print '\n' + webAddress;

gasBuddy_page = urllib2.urlopen(webAddress);
soupedGasBuddyPage = BeautifulSoup(gasBuddy_page);

for gasPriceDivs in soupedGasBuddyPage.findAll("div", {"class" : "sp_p sp_p_big"}):
    i = str(gasPriceDivs).split('<div class="sp_p sp_p_big">')[1].split('</div>');
    for j in i:
    	indy = re.findall(r'\"(.+?)\"',j);
        for k in indy:
            l = k.replace("p", "");
            if l == "d":
                l = l.replace("d", ".");
            onePrice+=l;
    listOfPrices.append(onePrice);
    onePrice="";

for price in listOfPrices:
	total += float(price);
	numOfGasStations += 1;

print 'city=' + response.upper() + ';';
avgGasPrice = total / numOfGasStations;
print 'avgGasPrice=' + str(avgGasPrice) + ';';

# gas price forecast
gasForecast = 'http://tomorrowsgaspricetoday.com/forecast/';
gasForecast_page = urllib2.urlopen(gasForecast);
soupedGasForecastPage = BeautifulSoup(gasForecast_page);

for gasForecastDivs in soupedGasForecastPage.findAll("div", {"class" : "center_content_area"}):
    for i in gasForecastDivs.findAll("img"):
        if '/wp-content/themes/tgpt/images/' in str(i):
            forecast = str(i);
            break;

print forecast;
if 'up' in forecast:
    print '2dayForecast=up;';
elif 'no-change' in forecast:
    print '2dayForecast=no change;';
elif 'down' in forecast:
    print '2dayForecast=down;';

sys.exit()
