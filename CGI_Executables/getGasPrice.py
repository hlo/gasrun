#!/usr/bin/python

# sample - http://www.ontariogasprices.com/Timmins/index.aspx
# <value>gasprices.com/<key>/index.aspx

from bs4 import BeautifulSoup
import urllib2
import cgitb
import json
import sys
import re

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
	'Sault Ste Marie': 'ontario',
	'St.Catharines': 'ontario',
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
	'Nanaimo': 'bc'
};

print "Content-type: text/html\n\n";

response = json.load(sys.stdin);
print "--------------";
#print("Content-Type: application.json", end="\n\n")
response = response.replace(" ", "");
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

if " " in cityUrl:
	cityUrl = cityUrl.replace(" ", "%20");

if "." in response:
	cityUrl = cityUrl.replace(".", "%20");

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