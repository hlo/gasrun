#!/usr/bin/python

from bs4 import BeautifulSoup
import urllib2
import json
import sys
from pprint import pprint

listOfMakes = [];
listOfModels = [];
carMakeToModelDictionary = {};

def getCarMake():
    carMakeFileName = 'carXml/makeList/carMake.xml';
    carMakeAddress = 'http://www.fueleconomy.gov/ws/rest/ympg/shared/menu/make';

    carMakePage = urllib2.urlopen(carMakeAddress);
    localFile = open(carMakeFileName, 'w');
    localFile.write(carMakePage.read());
    localFile.close();

    soupedCarMakePage = BeautifulSoup(open(carMakeFileName).read());

    for item in soupedCarMakePage.findAll('value'):
        listOfMakes.append(str(''.join(item.findAll(text=True))));

    print listOfMakes;

def getCarModel():
    for carMake in listOfMakes:
        carModelList = 'carXml/modelList/carModelList' + '_' + carMake + '.txt';
        carMake = carMake.replace(' ', '%20');
        carModelFileName = 'carXml/modelList/carModel_' + carMake + '.xml';

        open(carModelList, 'w').close()

        carModelAddress = 'http://www.fueleconomy.gov/ws/rest/ympg/shared/menu/model?make=' + carMake;
        carModelPage = urllib2.urlopen(carModelAddress);
        localFile = open(carModelFileName, 'w');
        localFile.write(carModelPage.read());
        localFile.close();

        soupedCarModelPage = BeautifulSoup(open(carModelFileName).read());

        #print soupedCarModelPage;
        for item in soupedCarModelPage.findAll('value'):
            item = str(''.join(item.findAll(text=True))).replace(' ', '%20');
            listOfModels.append(item);
            print carMake;
            print item;

            with open(carModelList, "a") as myfile:
                myfile.write(item + '\n');

            if carMake in carMakeToModelDictionary:
                carMakeToModelDictionary[str(carMake)].append(item);
            else:
                carMakeToModelDictionary.setdefault(str(carMake), []).append(item);

    pprint(carMakeToModelDictionary);

def getCarMpg():
    for carMake in carMakeToModelDictionary:
        for carModel in carMakeToModelDictionary[carMake]:
            carModel = carModel.replace('/', '');
            print 'http://www.fueleconomy.gov/ws/rest/ympg/shared/vehicles?make=' + carMake + '&model=' + carModel;
            carMpgAddress = 'http://www.fueleconomy.gov/ws/rest/ympg/shared/vehicles?make=' + carMake + '&model=' + carModel;
            carMpgFileName = 'carXml/mpgList/carMpg#' + carMake + '#' + carModel;

            carMpgPage = urllib2.urlopen(carMpgAddress);
            localFile = open(carMpgFileName, 'w');
            localFile.write(carMpgPage.read());
            localFile.close();

getCarMake();
getCarModel();
getCarMpg();
