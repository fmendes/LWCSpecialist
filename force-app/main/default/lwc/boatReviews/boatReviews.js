import { LightningElement, api } from 'lwc';
import { NavigationMixin } from 'lightning/navigation';

import getAllReviews from '@salesforce/apex/BoatDataService.getAllReviews';

// imports
export default class BoatReviews extends NavigationMixin(LightningElement) {
    // Private
    boatId;
    error;
    boatReviews;
    isLoading;
    
    // Getter and Setter to allow for logic to run on recordId change
    @api get recordId() {
        return this.boatId;
    }
    set recordId(value) {
      //sets boatId attribute
      this.setAttribute( 'boatId', value );
      //sets boatId assignment
      this.boatId = value;
      //get reviews associated with boatId
      this.getReviews();
    }
    
    // Getter to determine if there are reviews to display
    get reviewsToShow() { 
        return this.boatReviews && this.boatReviews.length > 0;
    }
    
    // Public method to force a refresh of the reviews invoking getReviews
    @api refresh() { 
        this.getReviews();
    }
    
    // Imperative Apex call to get reviews for given boat
    // returns immediately if boatId is empty or null
    // sets isLoading to true during the process and false when it’s completed
    // Gets all the boatReviews from the result, checking for errors.
    getReviews() { 
        console.log( 'getting reviews' );
        if( ! this.boatId ) {
            return;
        }
        this.isLoading = true;
        console.log( 'retrieving reviews' );
        getAllReviews( { boatId: this.boatId } )
            .then(result => {
                console.log( 'reviews retrieved', result );
                this.boatReviews = result;
                this.error = null;
                this.isLoading = false;
            })
            .catch(error => {
                console.log( 'error when retrieving reviews', error );
                this.boatReviews = null;
                this.error = error;
                this.isLoading = false;
            });
    }
    
    // Helper method to use NavigationMixin to navigate to a given record on click
    navigateToRecord(event) { 
        event.preventDefault();       // stop the form from submitting
        const userId = event.target.getAttribute('data-record-id');
        console.log( 'attempting navigation to ' + userId );
        this[NavigationMixin.Navigate]({
            type: 'standard__recordPage',
            attributes: {
                recordId: userId,
                objectApiName: 'User',
                actionName: 'view'
            },
        });
    }
  }
  