document.addEventListener('DOMContentLoaded', function() {

  // Use buttons to toggle between views
  document.querySelector('#inbox').addEventListener('click', () => load_mailbox('inbox'));
  document.querySelector('#sent').addEventListener('click', () => load_mailbox('sent'));
  document.querySelector('#archived').addEventListener('click', () => load_mailbox('archive'));
  document.querySelector('#compose').addEventListener('click', compose_email);
  document.querySelector('#submit-btn').addEventListener('click', function(event) {
    event.preventDefault();
    send_email();
  });


  // By default, load the inbox
  load_mailbox('inbox');
});

function compose_email() {

  // Show compose view and hide other views
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'block';

  // Clear out composition fields
  document.querySelector('#compose-recipients').value = '';
  document.querySelector('#compose-subject').value = '';
  document.querySelector('#compose-body').value = '';
}

function load_mailbox(mailbox) {
  
  // Show the mailbox and hide other views
  document.querySelector('#emails-view').style.display = 'block';
  document.querySelector('#compose-view').style.display = 'none';
  document.querySelector('#email-view').style.display = 'none';

  // Show the mailbox name
  document.querySelector('#emails-view').innerHTML = `<h3>${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h3>`;

  const mailboxName = `${mailbox.charAt(0).toLowerCase() + mailbox.slice(1)}`;
  
  // Set mailbox name to local storage for use globally

  localStorage.setItem("mailbox", mailboxName);

  // Fetch all emails using the mailboxName

  fetch(`/emails/${mailboxName}`)
  .then(response => response.json())
  .then(emails => {                                                         
    // Print emails
    console.log(emails)
    // Each email rendered in its own box (eg div with a border) that displays who the email is from, 
    // what the subject line is and the timestamp of the email

    const emailContainer = document.querySelector('#emails-view');
    emailContainer.setAttribute('class', 'email-container')

    // For each element in the array, do...
    emails.forEach(function(email) {
      // Create a div for the email
      const emailElement = document.createElement('div');
      emailElement.setAttribute('class', 'email')

      // Elements for the subject,timestamp and sender

      const subjectElement = document.createElement('p');
      const timestampElement = document.createElement('p');
      const senderElement = document.createElement('p')

      // Set text content for subject and timestamp elements
      subjectElement.textContent = email.subject;
      timestampElement.textContent = email.timestamp;
      senderElement.textContent = email.sender;

      // Add in the subject, timestamp and who it's from

      emailElement.appendChild(subjectElement);
      emailElement.appendChild(senderElement);
      emailElement.appendChild(timestampElement);

      if (email.read === true) {
        console.log(email)
        emailElement.setAttribute('class' , 'read' )
      } else {
        emailElement.setAttribute('class' , 'unread' )
      }

      emailContainer.appendChild(emailElement);
      emailElement.style.border = '2px solid gray';
      const readEmails = document.querySelectorAll('.read');

      readEmails.forEach(email => {
        email.style.backgroundColor = '#e6e6e6';
      });
      
      emailElement.addEventListener('click', function() {
        view_email(email.id, mailbox)
      })

    }
    )
} ) }



function send_email() {
  const recipients = document.querySelector('#compose-recipients').value
  const subject = document.querySelector('#compose-subject').value
  const body = document.querySelector('#compose-body').value
  fetch('/emails' , {
    method: 'POST',
    body: JSON.stringify({
      recipients: recipients,
      subject: subject,
      body: body
    })
  })
  .then(response => response.json())
  .then(result => {
    console.log(result);
    load_mailbox('sent')
  })}
 

  // When a user clicks on an email, the user should be taken to a view where they see the content of that email.

  function view_email(email_id, mailbox) {

    // Display the singular email view, hide the others

    document.querySelector('#emails-view').style.display = 'none';
    document.querySelector('#compose-view').style.display = 'none';
    document.querySelector('#email-view').style.display = 'block';

    // Use querySelector on the div created in index.html

    const emailContainer = document.querySelector('#email-view');
    emailContainer.innerHTML = ''

    document.querySelector('#emails-view').innerHTML = `<h3>${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h3>`;

    const mailboxName = `${mailbox.charAt(0).toLowerCase() + mailbox.slice(1)}`;

    // Fetch the email requested:

    fetch(`/emails/${email_id}`)
    .then(response => response.json())
    .then(email => {
      console.log(email);

         // Your application should show the email’s sender, recipients, subject, timestamp, and body.

    // Create a div for the email
    const emailElement = document.createElement('div');
    emailElement.setAttribute('class', 'email');


      const subject = email.subject;
      const body = email.body;
      const recipients = email.recipients;
      const timestamp = email.timestamp;
      const sender = email.sender;

      // Need to use createElement and appendChild instead
      // Changing the innerHTML is removing the EventListener

      emailContainer.innerHTML = `
        <h5>From:</h5> <p>${sender}</p>
        <h5>To:</h5> <p>${recipients}</p>
        <h5>Subject:</h5> <p>${subject}</p>
        <h5>Timestamp:</h5> <p>${timestamp}</p>
        <br>
        <p>${body}</p>
        `


        if (!email.read) {
          console.log('change email to read')
          fetch(`/emails/${email_id}`, {
            method: 'PUT',
            body: JSON.stringify({
              read: true
            })
          })
        }

        const archiveBtn = document.createElement('button');
        if (email.archived == true) {
          archiveBtn.innerHTML = 'Unarchive'
          archiveBtn.className = 'btn btn-danger'
        }
        else {
          archiveBtn.innerHTML = 'Archive'
          archiveBtn.className = 'btn btn-success'
        }
        const replyBtn = document.createElement('reply');
        replyBtn.innerHTML = 'Reply'
        replyBtn.className = 'btn btn-primary'

        archiveBtn.addEventListener('click', function() {
          archive_email(email.id)
        })

        replyBtn.addEventListener('click', function() {
          reply_email(email.id)
        })

        // Append the email element to the container
          emailContainer.appendChild(emailElement);

          if (mailbox !== 'sent') {
            emailContainer.appendChild(archiveBtn);
          }
            emailContainer.appendChild(replyBtn);


          }
    )}



    function archive_email(email_id) {

      // Get the email object first...

      fetch(`/emails/${email_id}`)
      .then(response => response.json())
      .then(email => {
        if(email.archived){
          fetch(`/emails/${email_id}`, {
            method: 'PUT',
            body: JSON.stringify({
              archived: false
            })
          })
          .then(load_mailbox('inbox'))
        }
        else{
          fetch(`/emails/${email_id}`, {
            method: 'PUT',
            body: JSON.stringify({
              archived: true
            })
          })
          .then(load_mailbox('archive'))
        }
      })
    }  


      // Working on reply

      function reply_email(email_id) {
        // When the user clicks the “Reply” button, they should be taken to the email composition form.

        // Need to add in a clear out of the email container here

        document.querySelector('#email-view').style.display = 'none';
        document.querySelector('#emails-view').style.display = 'none';

        // Change h3 to reply

        document.querySelector('#title').textContent = 'Reply';

        // Fetch email, pre-fill fields

          compose_email()
          fetch(`/emails/${email_id}`)
          .then(response => response.json())
          .then(email => {
            document.querySelector('#compose-recipients').value = email.recipients;


            let subject = email.subject
            const regex = /^Re:/i;
            timestamp = email.timestamp
            sender = email.sender
            body = email.body

            if (!regex.test(subject)) {
              subject = `RE: ${email.subject}`;
            }

            document.querySelector('#compose-subject').value = subject

            // "On Jan 1 2020, 12:00 AM foo@example.com wrote:" followed by the original text of the email.

            replyBody = `----------------------------------------------------------------------
            On ${timestamp} ${sender} wrote: "

            ${body}`;

            document.querySelector('#compose-body').value = replyBody
          })



      }



      