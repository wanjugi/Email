document.addEventListener('DOMContentLoaded', function() {

    // Use buttons to toggle between views
    document.querySelector('#inbox').addEventListener('click', () => load_mailbox('inbox'));
    document.querySelector('#sent').addEventListener('click', () => load_mailbox('sent'));
    document.querySelector('#archived').addEventListener('click', () => load_mailbox('archive'));
    document.querySelector('#compose').addEventListener('click', compose_email);
    //submit form
    document.querySelector('#compose-form').addEventListener('submit', send_email);
    // By default, load the inbox
    load_mailbox('inbox');
});
  
function compose_email() {
  
    // Show compose view and hide other views
    document.querySelector('#emails-view').style.display = 'none';
    document.querySelector('#compose-view').style.display = 'block';
    document.querySelector('#open-email-view').style.display = 'none';
  
    // Clear out composition fields
    document.querySelector('#compose-recipients').value = '';
    document.querySelector('#compose-subject').value = '';
    document.querySelector('#compose-body').value = '';
}
function handleReply() {
    // Open compose view
    compose_email();
  
    // Pre-fill recipient
    document.querySelector('#compose-recipients').value = email.sender;
  
    // Pre-fill subject
    let subject = email.subject;
    if (subject.split(' ', 1)[0] !== "Re:") {
      subject = "Re: " + email.subject;
    }
    document.querySelector('#compose-subject').value = subject;
  
    // Pre-fill body
    document.querySelector('#compose-body').value = `On ${email.timestamp} ${email.sender} wrote:\n${email.body}\n\n`;
}
function view_email(id){
    fetch(`/emails/${id}`)
    .then(response => response.json())
    .then(email => {
        // Print email
        console.log(email);
        document.querySelector('#emails-view').style.display = 'none';
        document.querySelector('#compose-view').style.display = 'none';
        document.querySelector('#open-email-view').style.display = 'block';
        
        document.querySelector('#open-email-view').innerHTML =`
        <ul class="list-group">
            <li class="list-group-item"><strong>From:</strong> ${email.sender}</li>
            <li class="list-group-item"><strong>To:</strong> ${email.recipients}</li>
            <li class="list-group-item"><strong>Subject:</strong> ${email.subject}</li>
            <li class="list-group-item"><strong>Timestamp:</strong> ${email.timestamp}</li>
            <li class="list-group-item">${email.body}</li>
        </ul>
        `
        //change to read
        if(!email.read){
          fetch(`/emails/${email.id}`, {
            method: 'PUT',
            body: JSON.stringify({
                read: true
            })
          })
        }
        //Archive logic
        const arc_button = document.createElement('button');
        arc_button.innerHTML = email.archived ? "Unarchive":"Archive";
        arc_button.className = email.archived ? "btn btn-danger": "btn btn-primary";
        arc_button.addEventListener('click', function() {
            fetch(`/emails/${email.id}`, {
              method: 'PUT',
              body: JSON.stringify({
                  archived: !email.archived
              })
            })
            .then(() => { load_mailbox('archive')})
        });
        document.querySelector('#open-email-view').append(arc_button);
  
        //Reply logic
        const reply_button = document.createElement('button');
        reply_button.innerHTML= "Reply"
        reply_button.className = "btn btn-success";
        reply_button.addEventListener('click', function() {
            handleReply();
            
        });
        document.querySelector('#open-email-view').append(reply_button);
        
  
    });
}
  
function load_mailbox(mailbox) {
    
    // Show the mailbox and hide other views
    document.querySelector('#emails-view').style.display = 'block';
    document.querySelector('#compose-view').style.display = 'none';
    document.querySelector('#open-email-view').style.display = 'none';
  
    // Show the mailbox name
    document.querySelector('#emails-view').innerHTML = `<h3>${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h3>`;
  
    //get the emails from mailbox and user
    fetch(`/emails/${mailbox}`)
    .then(response => response.json())
    .then(emails => {
        // Loop through emails and create a div for each
        emails.forEach(oneMail => {
  
          console.log(oneMail);
  
          //create div for each email
          
          const newMail = document.createElement('div');
          newMail.innerHTML = `
          <style>
  
          .email-container {
             border: 1px solid lightgray;
             background-color: lightgray;
             padding: 10px;
             margin-bottom: 10px;
           }
          .email-container2 {
               border: 1px solid lightgray;
               background-color: white;
               padding: 10px;
               margin-bottom: 10px;
          }
         
          .email-header {
             display: flex;
             align-items: center;
          }
         
          .sender-name,
          .subject,
          .timestamp {
             color: black;
             margin-right: 10px;
          }
         
          .email-body {
             font-size: 14px;
             line-height: 1.5;
             color: black;
          }
          
          </style>
         
          <div class="email-container1">
            <div class="email-header">
               <div class="sender-name">${oneMail.sender}</div>
               <div class="subject">Subject: ${oneMail.subject}</div>
               <div class="timestamp">${oneMail.timestamp}</div>
            </div>
            <div class="email-body">
               <p>${oneMail.body}</p>
            </div>
          </div>
          `;
          newMail.className = oneMail.read ? 'email-container' : 'email-container2';
          newMail.addEventListener('click', function(){
          view_email(oneMail.id)
          }); 
          document.querySelector('#emails-view').append(newMail); 
        });
          
    });
}
  
function send_email (event) {
    event.preventDefault();
    
    // Store composition fields
    const Recipients = document.querySelector('#compose-recipients').value;
    const Subject = document.querySelector('#compose-subject').value;
    const Body = document.querySelector('#compose-body').value;
  
    //send data to backend
    fetch('/emails', {
        method: 'POST',
        body: JSON.stringify({
            recipients: Recipients,
            subject: Subject,
            body: Body,
        })
      })
    .then(response => response.json())
    .then(result => {
          // Print result
          console.log(result);
          load_mailbox('sent');
    });
    
};