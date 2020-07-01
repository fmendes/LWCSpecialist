import { LightningElement, wire } from 'lwc';
import { getRecord, getFieldValue } from 'lightning/uiRecordApi';
import { NavigationMixin } from 'lightning/navigation';

import { subscribe
    , APPLICATION_SCOPE, MessageContext } from 'lightning/messageService';
import BOATMC from '@salesforce/messageChannel/BoatMessageChannel__c';

// Custom Labels Imports
// import labelDetails for Details
// import labelReviews for Reviews
// import labelAddReview for Add_Review
// import labelFullDetails for Full_Details
// import labelPleaseSelectABoat for Please_select_a_boat
import labelDetails from '@salesforce/label/c.Details';
import labelReviews from '@salesforce/label/c.Reviews';
import labelAddReview from '@salesforce/label/c.Add_Review';
import labelFullDetails from '@salesforce/label/c.Full_Details';
import labelPleaseSelectABoat from '@salesforce/label/c.Please_select_a_boat';

// Boat__c Schema Imports
// import BOAT_ID_FIELD for the Boat Id
// import BOAT_NAME_FIELD for the boat Name
import BOAT_ID_FIELD from '@salesforce/schema/Boat__c.Id';
import BOAT_NAME_FIELD from '@salesforce/schema/Boat__c.Name';
const BOAT_FIELDS = [ BOAT_ID_FIELD, BOAT_NAME_FIELD ];

export default class BoatDetailTabs extends LightningElement {
  boatId;
  wiredRecord;
  label = {
    labelDetails,
    labelReviews,
    labelAddReview,
    labelFullDetails,
    labelPleaseSelectABoat,
  };

  @wire( getRecord, { recordId: '$boatId', fields: BOAT_FIELDS } )
    getRecord( { error, data } ) {
        // Error handling
        if (data) {
            this.wiredRecord = { data };
            
        } else if (error) {
            this.boatId = undefined;
        }
  }
  
  // Decide when to show or hide the icon
  // returns 'utility:anchor' or null
  get detailsTabIconName() { 
    return this.wiredRecord.data ? "utility:anchor" : null;
  }
  
  // Utilize getFieldValue to extract the boat name from the record wire
  get boatName() { 
    return getFieldValue( this.wiredRecord.data, BOAT_NAME_FIELD );
  }
    
  // wired message context
  @wire( MessageContext )
      messageContext;
  
  // Private
  subscription = null;
  
  // Subscribe to the message channel
  subscribeMC() {
    if (!this.subscription) {
        this.subscription = subscribe(
            this.messageContext,
            BOATMC,
            (message) => { this.boatId = message.recordId; },
            { scope: APPLICATION_SCOPE }
        );
    }
  }
  
  // Calls subscribeMC()
    connectedCallback() { 
        if( this.subscription ) {
            return;
        }
        this.subscribeMC();
    }
  
  // Navigates to record page
    navigateToRecordViewPage( event ) { 
        this[NavigationMixin.Navigate]({
            type: 'standard__recordPage',
            attributes: {
                recordId: this.boatId,
                objectApiName: 'Boat__c',
                actionName: 'view'
            }
        });
    }
  
  // Navigates back to the review list, and refreshes reviews component
  handleReviewCreated() { 
      //set the <lightning-tabset> Reviews tab to active using querySelector() 
      // and activeTabValue
      let theTabSet = this.template.querySelector( 'lightning-tabset' );
      if( theTabSet ) {
        theTabSet.activeTabValue = 'Reviews';
      } 

      //and refresh the boatReviews component dynamically
      let boatReviews = this.template.querySelector('c-boat-reviews');
      if( boatReviews ) {
        boatReviews.refresh();
      }
  }
}
