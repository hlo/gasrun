#!/usr/bin/python

import urllib2
import json
import sys

sys.path.append('/home/hoilo/lib/python')
from bs4 import BeautifulSoup

def returnCarMake():
    listOfMakes = [];
    carMakePage = 'carXml/makeList/carMake.xml';
    soupedCarMakePage = BeautifulSoup(open(carMakePage).read());

    for item in soupedCarMakePage.findAll('value'):
        listOfMakes.append(str(''.join(item.findAll(text=True))));

    print listOfMakes;

def returnCarModel(response):
    listOfModels = [];
    carMake = response.split(':')[1];
    carModelFileName = 'carXml/modelList/carModelList_' + carMake + '.txt';

    with open(carModelFileName) as myfile:
        for line in myfile:
            line = line.replace('%20', ' ');
            line = line.replace('\n', '');
            listOfModels.append(line);

    print listOfModels;

def returnCarYear(response):
    listOfYears = [];
    carMake = response.split(':')[1];
    carModel = response.split(':')[3];

    fileName = 'carXml/mpgList/carMpg#' + carMake.replace(' ', '%20') + '#' + carModel.replace(' ', '%20');
    soupedCarYearPage = BeautifulSoup(open(fileName).read());

    for item in soupedCarYearPage.findAll('year'):
        listOfYears.append(''.join(item.findAll(text=True)))

    print listOfYears;

def returnAvgMpg(response):
    listOfYears = [];
    listOfAvgMpg = [];
    carMake = response.split(':')[1];
    carModel = response.split(':')[3];
    carYear = response.split(':')[5];

    fileName = 'carXml/mpgList/carMpg#' + carMake.replace(' ', '%20') + '#' + carModel.replace(' ', '%20');
    soupedCarAvgMpgPage = BeautifulSoup(open(fileName).read());

    carYear = [year for year in soupedCarAvgMpgPage.find_all('year')
                if year.string == carYear]

    avgmpg = [find_avg_mpg(find_nearest_vehicle(elem)).string
              for elem in carYear]

    print avgmpg;

def find_nearest_vehicle(elem):
    for sibling in elem.next_siblings:
        if sibling.name == 'yourmpgvehicle':
            return sibling

def find_avg_mpg(elem):
    for child in elem.children:
        if child.name == 'avgmpg':
            return child

print "Content-type: text/html\n\n";

response = json.load(sys.stdin);
print "--------------";
#print("Content-Type: application.json", end="\n\n")
json.dump(response, sys.stdout, indent=2);

if 'getMake' in response:
    returnCarMake();
elif 'makeM:' in response:
    returnCarModel(response);
elif 'makeY:' in response:
    returnCarYear(response);
elif 'makeMpg:' in response:
    returnAvgMpg(response);

sys.exit()
