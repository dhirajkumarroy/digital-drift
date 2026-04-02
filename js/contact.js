// This script handles the contact form submission on contact.html
// using the Formspree service to send the email.

document.addEventListener('DOMContentLoaded', () => {
    // Select the contact form element by its ID
    const contactForm = document.getElementById('contact-form');
    
    if (contactForm) {
        // Add an event listener for the form's submit event
        contactForm.addEventListener('submit', async (e) => {
            // Prevent the default form submission (which causes a page reload)
            e.preventDefault();
            
            // Get the form action URL from the form's action attribute
            // Note: You must replace 'YOUR_FORMSPREE_ID' in contact.html with your actual ID.
            const formAction = contactForm.action;
            
            // Create a FormData object from the form elements
            const formData = new FormData(contactForm);

            // Add the recipient email address to the form data
            // This is how Formspree knows where to send the email.
            formData.append('_subject', 'New message from your Digital Drift blog!');
            formData.append('_to', 'roykumardhiraj9347@gmail.com');
            
            try {
                // Send the form data to Formspree using a fetch request
                const response = await fetch(formAction, {
                    method: 'POST',
                    body: formData,
                    headers: {
                        'Accept': 'application/json'
                    }
                });
                
                // Check if the request was successful
                if (response.ok) {
                    alert('Thank you for your message! We will get back to you shortly.');
                    contactForm.reset(); // Clear the form fields on success
                } else {
                    alert('Oops! There was an error sending your message. Please try again.');
                }
            } catch (error) {
                // Catch and handle any network or other errors
                console.error('Error:', error);
                alert('Oops! Something went wrong. Please check your internet connection and try again.');
            }
        });
    }
});
