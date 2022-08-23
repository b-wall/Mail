document.addEventListener('DOMContentLoaded', function () {
  
  // Use buttons to toggle between views
  document.querySelector('#inbox').addEventListener('click', () => load_mailbox('inbox'));
  document.querySelector('#sent').addEventListener('click', () => load_mailbox('sent'));
  document.querySelector('#archived').addEventListener('click', () => load_mailbox('archive'));
  document.querySelector('#compose').addEventListener('click', compose_email);

  // Send email on submit
  document.querySelector('#compose-form').addEventListener('submit', function (event) {
    event.preventDefault(),
    send_email();
  });

  // By default, load the inbox
  load_mailbox('inbox');

});

function compose_email() {

  // Show compose view and hide other views
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'block';
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#email-view').style.display = 'none';


  // Clear out composition fields
  document.querySelector('#compose-recipients').value = '';
  document.querySelector('#compose-subject').value = '';
  document.querySelector('#compose-body').value = '';

}

function send_email() {
  // Get information from client and post data
  fetch('/emails', {
    method: 'POST',
    body: JSON.stringify({
      recipients: document.querySelector('#compose-recipients').value,
      subject: document.querySelector('#compose-subject').value,
      body: document.querySelector('#compose-body').value
    })
  })
    .then(response => response.json())
    .then(result => {
    // Print result
      console.log(result);
    // Redirect to sent mailbox
    load_mailbox('sent');
    })
    .catch((error) => console.log(error));
  return false;
}

function load_mailbox(mailbox) {
  
  // Show the mailbox and hide other views
  document.querySelector('#emails-view').style.display = 'block';
  document.querySelector('#compose-view').style.display = 'none';
  document.querySelector('#email-view').style.display = 'none';
  document.querySelector('#archive-button').style.display = 'none';
  document.querySelector('#unarchive-button').style.display = 'none';

  // Clear any previous email history
  if (document.contains(document.querySelector('.mail-contents'))) {
    contents = document.querySelector('.mail-contents');
    contents.remove();
  }

  // Show the mailbox name
  document.querySelector('#emails-view').innerHTML = `<h3>${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h3>`;

  //get mail for a given mailbox
  get_mail(mailbox);
}

function get_mail(mailbox) {
  // Get the mail for a user
  fetch(`/emails/${mailbox}`)
    .then(response => response.json())
    .then(emails => {
      console.log(emails);

      // Show the mailbox contents
      emails.forEach(email => console.log(email));
      emails.forEach(email => {
        let view = document.querySelector('#emails-view');
        const element = document.createElement('div');
        element.classList.add('mail-message');
        element.innerHTML = 
          `<span class="subject">${email.subject}</span>` +
          `<span class="sender">From: ${email.sender}</span>` +
          `<span class="timestamp">${email.timestamp}</span>`;
        
        // Change background color if mail has been read or not

        (email.read) ? element.style.backgroundColor = '#bdc1c7' : element.style.backgroundColor = 'white';
        
        // Show individual mail contents on click
        element.addEventListener('click', function () {
          fetch(`emails/${email.id}/`, {
            method: 'PUT',
            body: JSON.stringify({
              read: true
            })
          });
          document.querySelector('#email-view').style.display = 'block';
          let view2 = document.querySelector('#email-view');
          const element2 = document.createElement('div');
          element2.classList.add('mail-contents');
          element2.innerHTML = `<span class="row contents-subject">${email.subject}</span>` +
            `<span class="row contents-sender">From: ${email.sender}</span>` +
            `<span class="row contents-recipients">To: ${email.recipients}</span>` +
            `<span class="row justify-content-end text-muted contents-timestamp">${email.timestamp}</span>` + '<hr>' +
            `<span class="contents-body">${email.body}</span>`; 
          document.querySelector('#emails-view').style.display = 'none';
          // Archive email
          if (email.archived === false) {
            archive = document.querySelector('#archive-button');
            archive.style.display = 'block';
            archive.addEventListener('click', function () {
              fetch(`emails/${email.id}`, {
                method: 'PUT',
                body: JSON.stringify({
                  archived: true
                })
              })
                // Redirect to inbox  
                .then(() => {
                  load_mailbox('inbox');
                })
            });
          }
          // Unarchive email
          else {
            unarchive = document.querySelector('#unarchive-button')
            unarchive.style.display = 'block';
            unarchive.addEventListener('click', function () {
              fetch(`emails/${email.id}`, {
                method: 'PUT',
                body: JSON.stringify({
                  archived: false
                })
              })
                .then(() => {
                  load_mailbox('inbox');
                })
            })
          };
          // Reply to email
          reply = document.querySelector('#reply-button')
          reply.addEventListener('click', function () {
            // Redirect to compose view

            compose_email();

            // Prepopulate forms

            document.querySelector('#compose-recipients').value = `${email.sender}`;
            document.querySelector('#compose-subject').value = `Re: ${email.subject}`;
            document.querySelector('#compose-body').value = `On ${email.timestamp} ${email.sender} wrote: ${email.body}`;
          })
          view2.append(element2)
        });
        view.append(element)
      });
    })
    .catch((error) => console.log(error));

}