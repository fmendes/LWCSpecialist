import { LightningElement, wire, api } from 'lwc';
import { updateRecord } from 'lightning/uiRecordApi';
import { refreshApex } from '@salesforce/apex';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';

import { MessageContext, publish } from 'lightning/messageService';
import BOATMC from '@salesforce/messageChannel/BoatMessageChannel__c';

import getBoats from '@salesforce/apex/BoatDataService.getBoats';

const columns = [
    { label: 'Name', fieldName: 'Name', editable: true },
    { label: 'Length', fieldName: 'Length__c', type: 'number', editable: true },
    { label: 'Price', fieldName: 'Price__c', type: 'currency', editable: true },
    { label: 'Description', fieldName: 'Description__c', editable: true },
];

// ...
export default class BoatSearchResults extends LightningElement {
    selectedBoatId;
    columns = columns;
    boatTypeId = '';
    boats;
    isLoading = false;
    
    // wired message context
    @wire( MessageContext )
        messageContext;

    @wire( getBoats, { boatTypeId: '$boatTypeId' } ) 
        wiredBoats( result ) { 
            //console.log( 'error', error );
            console.log( 'result', result );
            this.boats = {};

            if( result ) {
                this.notifyLoading( true );
                this.boats = result;

                // if we have data, we're done loading, otherwise we aren't
                let isLoading = this.boats.data ? false : true;
                this.notifyLoading( isLoading );

            } else {
                this.notifyLoading( false );
                this.boats.data = [];
            }
        }
    
    // public function that updates the existing boatTypeId property
    // uses notifyLoading
    @api searchBoats( boatTypeId ) {
        this.notifyLoading( true );

        this.boatTypeId = boatTypeId;

        this.notifyLoading( false );
    }
    
    // this public function must refresh the boats asynchronously
    // uses notifyLoading
    @api async refresh() { 
        this.notifyLoading( true );

        await refreshApex( this.boats );

        this.notifyLoading( false );
    }
    
    // this function must update selectedBoatId and call sendMessageService
    updateSelectedTile( event ) { 
        this.selectedBoatId = event.detail.boatId;
        this.sendMessageService( this.selectedBoatId );
    }
    
    // Publishes the selected boat Id on the BoatMC.
    sendMessageService( boatId ) { 
        const message = { recordId: boatId };
        publish( this.messageContext, BOATMC, message );
    }
    
    // This method must save the changes in the Boat Editor
    // Show a toast message with the title
    // clear lightning-datatable draft values
    handleSave( event ) {
      const recordInputs = event.detail.draftValues.slice().map(draft => {
          const fields = Object.assign({}, draft);
          return { fields };
      });
      const promises = recordInputs.map( recordInput => {
              //update boat record
              updateRecord( recordInput );
            }
          );
      Promise.all(promises)
            .then(() => {
                this.dispatchEvent(
                    new ShowToastEvent({
                        title: 'Success',
                        message: 'Ship It!',
                        variant: 'success',
                    }),
                );
            })
            .catch(error => {
                this.dispatchEvent(
                    new ShowToastEvent({
                        title: 'Error',
                        message: error.body.message,
                        variant: 'error',
                    }),
                );
            })
            .finally(() => {
                this.refresh();
            });
    }
    // Check the current value of isLoading before dispatching the doneloading or loading custom event
    notifyLoading( isLoading ) {
        this.isLoading = isLoading;
        let eventName = ( isLoading === true ) ? 'loading' : 'doneloading';

        const theEvent = new CustomEvent( eventName );
        this.dispatchEvent( theEvent );
    }
}
  