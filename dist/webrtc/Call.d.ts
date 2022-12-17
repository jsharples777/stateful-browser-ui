export declare class Call {
    private id;
    private peer;
    private webrtcDiv;
    private myVideoStream;
    private myVideo;
    private currentUserList;
    private displayName;
    constructor(id: string, displayName: string);
    preForCall(divId: string): void;
    startCall(): void;
    endCall(): void;
    callUser(userId: string): void;
    removeUser(userId: string): void;
    prepareToAnswerCallFrom(userId: string): void;
    private startPeerConnection;
    private constructCallElement;
    private addVideoStream;
}
