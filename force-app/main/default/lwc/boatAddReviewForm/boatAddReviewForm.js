import { LightningElement, api } from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
// imports

const TOAST_TITLE = "Review Created!";
const TOAST_SUCCESS_VARIANT = 'success';

export default class BoatAddReviewForm extends LightningElement {
  // Private
  @api boatId;
  rating;
  
  // Public Getter and Setter to allow for logic to run on recordId change
  @api get recordId() { 
      return this.boatId;
  }
  set recordId(value) {
    //sets boatId attribute
    //sets boatId assignment
    this.boatId = value;
  }
  
  // Gets user rating input from stars component
  handleRatingChanged( event ) { 
    this.rating = event.detail.rating;
  }
  
  // Custom submission handler to properly set Rating
  // This function must prevent the anchor element from navigating to a URL.
  // form to be submitted: lightning-record-edit-form
  handleSubmit( event ) { 
    event.preventDefault();       // stop the form from submitting
    const fields = event.detail.fields;
    fields.Boat__c = this.boatId;
    fields.Rating__c = this.rating;
    let formToSubmit = this.template.querySelector( 'lightning-record-edit-form' );
    formToSubmit.submit( fields );
  }
  
  // Shows a toast message once form is submitted successfully
  // Dispatches event when a review is created
  handleSuccess() {
    // TODO: dispatch the custom event and show the success message

    console.log( 'dispatching createreview' );
    const createReviewEvent = new CustomEvent( 'createreview' );
    this.dispatchEvent( createReviewEvent ); 
    
    this.dispatchEvent(
        new ShowToastEvent({
            title: TOAST_TITLE,
            message: 'Ship It!',
            variant: TOAST_SUCCESS_VARIANT,
        }),
    );

      // this.accountId = event.detail.id;
    this.handleReset();
  }
  
  // Clears form data upon submission
  // TODO: it must reset each lightning-input-field
  handleReset() { 
    let fieldList = this.template.querySelectorAll( 'lightning-input-field' );
    if( fieldList ) {
        console.log( 'handling Reset' );
        fieldList.forEach( aField => { aField.reset(); } );
    }
  }
}
