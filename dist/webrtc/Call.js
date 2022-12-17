import debug from "debug";
import { browserUtil } from "browser-state-management";
const callLogger = debug('call');
export class Call {
    constructor(id, displayName) {
        this.peer = null;
        this.webrtcDiv = null;
        this.myVideoStream = null;
        this.myVideo = null;
        this.id = id;
        this.displayName = displayName;
        this.callUser = this.callUser.bind(this);
        this.currentUserList = [];
    }
    preForCall(divId, port) {
        this.webrtcDiv = document.getElementById(divId);
        this.startPeerConnection(port);
    }
    startCall() {
        try {
            if (navigator.mediaDevices.getUserMedia) {
                callLogger('Starting call video stream');
                navigator.mediaDevices.getUserMedia({
                    audio: true,
                    video: true,
                }).then((stream) => {
                    callLogger('stream started - adding video element');
                    this.myVideoStream = stream;
                    this.addVideoStream(this.id, this.myVideoStream, this.displayName, true);
                });
            }
        }
        catch (err) {
            callLogger(err);
            callLogger(`Non-secure context or no camera capability`);
        }
    }
    endCall() {
        callLogger('Reset');
        if (this.currentUserList && this.currentUserList.length > 0) {
            callLogger('Removing previous users');
            this.currentUserList.forEach((user) => {
                callLogger('Removing previous user ${user}');
                this.removeUser(user);
            });
        }
        if (this.webrtcDiv)
            browserUtil.removeAllChildren(this.webrtcDiv);
        this.currentUserList = [];
        if (this.peer) {
            callLogger('Stopping video stream');
            //this.peer.disconnect();
            if (this.myVideoStream) {
                this.myVideoStream.getTracks().forEach((track) => track.stop());
            }
            if (this.myVideo)
                this.myVideo.srcObject = null;
            this.myVideoStream = null;
        }
    }
    callUser(userId, displayName) {
        callLogger(`Asked to call user ${userId}`);
        if (userId === this.id)
            return; // don't call ourself
        let numberOfAttempts = 0;
        let index = this.currentUserList.findIndex((user) => user === userId); // don't call the same users
        if (index >= 0)
            return;
        // wait a small time for the sockets and peer to sync
        const interval = setInterval(() => {
            callLogger(`Calling user ${userId}`);
            if (this.myVideoStream) {
                const call = this.peer.call(userId, this.myVideoStream);
                if (call) {
                    call.on('stream', (userVideoStream) => {
                        callLogger(`User ${userId} answered, showing stream`);
                        this.addVideoStream(userId, userVideoStream, displayName, false);
                    });
                    clearInterval(interval);
                }
                else {
                    // try again shortly
                    numberOfAttempts++;
                    if (numberOfAttempts > 3)
                        clearInterval(interval);
                }
            }
        }, 5000);
    }
    ;
    removeUser(userId) {
        callLogger(`Asked to remove user ${userId}`);
        let index = this.currentUserList.findIndex((user) => user === userId);
        if (index >= 0) {
            this.currentUserList.splice(index, 1);
        }
        const userVideoCard = document.getElementById(userId);
        if (userVideoCard) {
            callLogger(`Asked to remove user ${userId} - removing video element`);
            const videoEl = userVideoCard.querySelector(".video");
            if (videoEl) {
                videoEl.srcObject = null;
            }
            browserUtil.removeAllChildren(userVideoCard);
            const parentNode = userVideoCard.parentNode;
            if (parentNode)
                parentNode.removeChild(userVideoCard);
        }
    }
    prepareToAnswerCallFrom(userId) {
        try {
            callLogger(`Preparing to answer call from ${userId}`);
            if (navigator.mediaDevices.getUserMedia) {
                navigator.mediaDevices.getUserMedia({
                    audio: true,
                    video: true,
                }).then((stream) => {
                    this.myVideoStream = stream;
                    this.addVideoStream(this.id, this.myVideoStream, this.displayName, true);
                    callLogger(`Awaiting call from ${userId}`);
                    this.peer.on('call', (call) => {
                        callLogger(`Answering call from ${userId}`);
                        call.answer(this.myVideoStream);
                        call.on('stream', (userVideoStream) => {
                            alert("Answered");
                            callLogger(`Have answered, showing stream`);
                            this.addVideoStream(userId, userVideoStream, userId, false);
                        });
                    });
                });
            }
        }
        catch (err) {
            callLogger(err);
            callLogger(`Insecure context or no video capability`);
        }
    }
    startPeerConnection(port) {
        // @ts-ignore  - is for the WebRTC peer via Nodejs
        this.peer = new Peer(this.id, { path: '/peerjs', host: '/', debug: 3, secure: true, port: port });
        this.peer.on('open', (id) => {
            callLogger('My peer ID is: ' + id);
        });
    }
    constructCallElement(username, stream, displayName, isCurrentUser = false) {
        const videoCardHolder = document.createElement('div');
        videoCardHolder.setAttribute("id", username);
        const videoCard = document.createElement('div');
        browserUtil.addRemoveClasses(videoCard, 'card');
        const videoCardTitle = document.createElement('div');
        browserUtil.addRemoveClasses(videoCardTitle, 'card-header');
        videoCardTitle.innerHTML = `<h5 class="card-title">${displayName}</h5>`;
        const videoCardBody = document.createElement('div');
        browserUtil.addRemoveClasses(videoCardBody, 'card-body p-0 text-center');
        const video = document.createElement('video');
        videoCard.appendChild(videoCardTitle);
        videoCard.appendChild(videoCardBody);
        videoCardBody.appendChild(video);
        if (isCurrentUser) {
            browserUtil.addClasses(video, 'my-telehealth-video');
            const videoCardFooter = document.createElement('div');
            browserUtil.addRemoveClasses(videoCardFooter, 'card-footer');
            const footerContent = document.createElement('div');
            browserUtil.addRemoveClasses(footerContent, 'd-flex w-100 justify-content-between mt-2');
            const stopVideoButton = document.createElement('button');
            stopVideoButton.setAttribute('type', 'button');
            browserUtil.addRemoveClasses(stopVideoButton, 'btn btn-circle btn-success');
            stopVideoButton.innerHTML = '<i class="fas fa-video"></i>';
            const muteMicButton = document.createElement('button');
            muteMicButton.setAttribute('type', 'button');
            browserUtil.addRemoveClasses(muteMicButton, 'btn btn-circle btn-success');
            muteMicButton.innerHTML = '<i class="fa fa-microphone"></i>';
            const endCallButton = document.createElement('button');
            endCallButton.setAttribute('type', 'button');
            browserUtil.addRemoveClasses(endCallButton, 'btn btn-circle btn-danger');
            endCallButton.innerHTML = '<i class="fas fa-phone-slash"></i>';
            footerContent.appendChild(stopVideoButton);
            footerContent.appendChild(muteMicButton);
            footerContent.appendChild(endCallButton);
            videoCardFooter.appendChild(footerContent);
            videoCard.appendChild(videoCardFooter);
            stopVideoButton.addEventListener('click', () => {
                const isPaused = video.paused;
                if (isPaused) {
                    video.play();
                    stopVideoButton.innerHTML = '<i class="fas fa-video"></i>';
                    browserUtil.addClasses(stopVideoButton, 'btn-success');
                    browserUtil.removeClasses(stopVideoButton, 'btn-warning');
                }
                else {
                    video.pause();
                    stopVideoButton.innerHTML = '<i class="fas fa-video-slash"></i>';
                    browserUtil.addClasses(stopVideoButton, 'btn-warning');
                    browserUtil.removeClasses(stopVideoButton, 'btn-success');
                }
            });
            muteMicButton.addEventListener('click', () => {
                const isMuted = video.muted;
                if (isMuted) {
                    video.muted = false;
                    muteMicButton.innerHTML = '<i class="fa fa-microphone"></i>';
                    browserUtil.addClasses(muteMicButton, 'btn-success');
                    browserUtil.removeClasses(muteMicButton, 'btn-warning');
                }
                else {
                    video.muted = true;
                    muteMicButton.innerHTML = '<i class="fa fa-microphone-slash"></i>';
                    browserUtil.addClasses(muteMicButton, 'btn-warning');
                    browserUtil.removeClasses(muteMicButton, 'btn-success');
                }
            });
            endCallButton.addEventListener('click', () => {
                this.endCall();
            });
            this.myVideo = video;
        }
        else {
            browserUtil.addClasses(video, 'telehealth-video');
        }
        videoCardHolder.appendChild(videoCard);
        video.srcObject = stream;
        video.addEventListener("loadedmetadata", () => {
            video.play();
        });
        return videoCardHolder;
    }
    addVideoStream(username, stream, displayName, isCurrentUser = false) {
        // check to see if they are already there
        let index = this.currentUserList.findIndex((user) => user === username);
        if (index >= 0)
            return;
        this.currentUserList.push(username);
        const videoElement = this.constructCallElement(username, stream, displayName, isCurrentUser);
        if (this.webrtcDiv)
            this.webrtcDiv.append(videoElement);
    }
    ;
}
//# sourceMappingURL=Call.js.map