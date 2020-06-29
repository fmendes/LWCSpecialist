import { LightningElement, wire, api } from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
// imports
const LABEL_YOU_ARE_HERE = 'You are here!';
const ICON_STANDARD_USER = 'standard:user';
const ERROR_TITLE = 'Error loading Boats Near Me';
const ERROR_VARIANT = 'error';

import getBoatsByLocation from '@salesforce/apex/BoatDataService.getBoatsByLocation';

export default class BoatsNearMe extends LightningElement {
  @api boatTypeId;
  mapMarkers = [];
  isLoading = true;
  isRendered;
  latitude;
  longitude;
  
  // Add the wired method from the Apex Class
  // Name it getBoatsByLocation, and use latitude, longitude and boatTypeId
  // Handle the result and calls createMapMarkers
  @wire( getBoatsByLocation, { latitude: '$latitude'
                            , longitude: '$longitude'
                            , boatTypeId:'$boatTypeId' } ) 
    wiredBoatsJSON( { error, data } ) {
        if( data ) {
            createMapMarkers( data );
        } else if ( error ) {
            this.isLoading = false;
            //this.isRendered = false;
            const toastEvent = new ShowToastEvent({
                title: ERROR_TITLE,
                message: error.body.message,
                variant: ERROR_VARIANT
            });
            this.dispatchEvent( toastEvent );
        }
    }
  
  // Controls the isRendered property
  // Calls getLocationFromBrowser()
    renderedCallback() { 
        if( this.isRendered == false ) {
            this.getLocationFromBrowser();
        }
        this.isRendered = true;
    }

  // Gets the location from the Browser
  // position => {latitude and longitude}
  getLocationFromBrowser() { 
    if( navigator.geolocation ) {
        navigator.geolocation.getCurrentPosition( position => {
            console.log(position.coords);
            this.latitude = position.coords.latitude;
            this.longitude = position.coords.longitude;
        });
    }
  }
  
  // Creates the map markers
  createMapMarkers(boatData) { 

    this.mapMarkers = data.map( boat => {
        return { location: {
            Latitude: boat.Geolocation__Latitude__s
            , Longitude: boat.Geolocation__Longitude__s
         }, 
         title: boat.Name,
        };
    });
    this.mapMarkers.unshift( { location: {
                                    Latitude: this.latitude
                                    , Longitude: this.longitude
                                }
                                , title: LABEL_YOU_ARE_HERE
                                , icon: ICON_STANDARD_USER } );

    this.isLoading = false;
    //this.isRendered = true;
  }
}
