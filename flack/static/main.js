var current_workspace = '';
var current_channel = '';
var baseURL = `http://${document.domain}:${location.port}`;
var socket = io.connect(baseURL);

document.addEventListener("DOMContentLoaded", function() {
    //Query Selectors
    const sendButton = document.querySelector('#message-send');
    const messageInput = document.querySelector('#message-input');
    const mainArea = document.querySelector('.main-area');
    var x = document.querySelectorAll(".team-name");
    const heading = document.querySelector(".navbar-brand");
    var channel_links = document.querySelectorAll('.channel-list');
    const addChannelButton = document.querySelector('#add-channel-button');

    //Socket functions
    socket.on('connect', function(){
        console.log("socket connected");
        socket.send('User connected');
    });

    socket.on('message', function(msg){
        createMessage(msg.message, "Username");
    });

    socket.on('from General', function(message){
        console.log(message);
    });

    sendButton.addEventListener("click", function(e){
        let msgText = messageInput.value;
        let message = {
            'workspace': current_workspace,
            'channel': current_channel,
            'message': msgText
        }
        socket.send(message);
    });
    //end socket functions


    addChannelButton.addEventListener('click', function(e) {
        let newChannelField = document.querySelector('#new-channel-name')
        let name = newChannelField.value;
        name = name.replace(" ", "_");
        getChannelUrl(name);
    });


    document.addEventListener('click', function(e){
        let element = e.target;
        console.log(element);

        //load messages and change UI when user clicks on a channel
        if (element.className == "channel-list") {
            removeChannelActive();
            heading.innerText = element.firstElementChild.innerText;
            let channelName = element.firstElementChild.innerText.replace("# ", "");
            current_channel = channelName;
            getChannelUrl(channelName);
            element.className = "channel-list active";
        } else if (element.className == "channel-item") {
            removeChannelActive();
            heading.innerText = element.innerText;
            let channelName = element.innerText.replace("# ", "");
            current_channel = channelName;
            getChannelUrl(channelName);
            element.parentElement.className = "channel-list active";
        }
        //close the flashed message
        if (element.className == "far fa-times-circle flash-close") {
            const flashMessage = document.querySelector('.flash-message');
            const currClasses = flashMessage.className;
            flashMessage.className = `${currClasses} hiding`;
        }
    });

    //Function for changing workspace
    x.forEach(element => {
        element.addEventListener("click", function(e){
            removeActive();
            clearChannels();
            text = this.id;
            current_workspace = text;
            this.parentElement.className = "team active";
            heading.innerText = `# ${text.replace('_',' ')}`;
            load_page(text);
        });
    });

    //get the list of channels
    function load_page(text) {
        console.log('searching');
        if (text != "Home" && text != "add-team") {
            var channel_container = document.querySelector('.channel-container');
        const request = new XMLHttpRequest();
        request.onreadystatechange = function () {
            if (this.readyState == 4 && this.status == 200) {
                data = this.responseText;
                data = JSON.parse(data);
                if (data) {
                    data.forEach(item => {
                        let newDiv = document.createElement('div');
                        let ptag = document.createElement("p");
                        newDiv.className = 'channel-list';
                        ptag.innerHTML = `# ${item}`;
                        ptag.className = 'channel-item';
                        newDiv.appendChild(ptag);
                        channel_container.appendChild(newDiv);
                    });
                }
            }
        }
        request.open('GET', `/${text}`, true);
        request.send();
        }
    };

    function removeActive() {
        let icons = document.querySelectorAll('.team');
        icons.forEach(element => {
            element.className = 'team';
        });
    }

    function clearChannels() {
        var channel_container = document.querySelector('.channel-container');
        channel_container.innerHTML='';
    }

    function clearMessages() {
        mainArea.innerHTML = '';
    }

    function removeChannelActive() {
        let channel_links = document.querySelectorAll('.channel-list');
            channel_links.forEach(element => {
                element.className = "channel-list";
            });
    }

    //get messages when user clicks on channel
    function getChannelUrl(name) {
        const request = new XMLHttpRequest();
        request.onreadystatechange = function () {
            if (this.readyState == 4 && this.status == 200) {
                data = this.responseText;
                data = JSON.parse(data);
                clearMessages()
                data.forEach(element => {
                    createMessage(element.content, element.username);
                });
            }
        }
        let url = `/${current_workspace}/${name}`;
        console.log(url);
        request.open('GET', url, true);
        request.send();
    }

    function createMessage(content, username) {
        let messageDiv = document.createElement('div');
        messageDiv.className = "message shadow-sm";
        let rowDiv = document.createElement('div');
        rowDiv.className = 'row';
        let picDiv = document.createElement('div');
        picDiv.className = 'col-md-1';
        picDiv.innerHTML = '<img src="../static/img/icon.png" alt="profilepic" class="profile-picture">'
        let contentDiv = document.createElement('div');
        contentDiv.className = 'col-md-11';
        contentDiv.innerHTML = `<p>${username}</p><hr><p>${content}</p>`;
        rowDiv.appendChild(picDiv);
        rowDiv.appendChild(contentDiv);
        messageDiv.appendChild(rowDiv);
        mainArea.appendChild(messageDiv);
    }
});
    
