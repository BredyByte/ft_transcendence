import { Play } from "../../pages/Play/Play.js";
import {navigateTo} from "../Router.js";


class PongTournamentSocket {
    constructor() {
        this.t_socket = null;
        this.reconnectDelay = 5000;
        this.maxReconnectAttempts = 10;
        this.reconnectAttempts = 0;
        this.playInstance = null;
    }

    initWebSocket() {
        try {
            this.t_socket = new WebSocket(`/ws/pongtournament/`);
            console.log("New tournament WebSocket created");
        } catch (error) {
            this.handleError(null, 'Failed to create WebSocket', true);
            return;
        }

        this.t_socket.onmessage = (e) => this.handleMessage(e);
        this.t_socket.onerror = (e) => {this.handleError(null, e, true);}
        this.t_socket.onclose = (e) => this.handleClose(e);

    }

    handleMessage(event) {
        try {
            const data = JSON.parse(event.data);

            if (!this.playInstance) {
                this.playInstance = Play.getInstance();
            }

            if (data.type === 'error') {
                this.handleError(data.errorCode, data.message);
            }

            if (data.type === 'main_room_update') {
                console.log("Main room update:", data.public_tournaments, data.private_tournaments);
                this.playInstance.updateTournaments(data.public_tournaments, data.private_tournaments);
            }

            if (data.type === 'tournament_room_update') {
                console.log("Tournament room update:", data.participants, data.state);
            }

            if (data.type === 'match_start') {
                console.log("Match starting:", data.match_id, data.message);

                this.notifyPlayerMatchStart(data.match_id, data.message);
            }

            if (data.type === 'tournament_ended') {
                console.log("Tournament ended:", data.tournament_id, data.results);

            }

        } catch (error) {
            this.handleError(null, error, false);
        }
    }

    notifyPlayerMatchStart(match_id, message) {


        alert(`${message}`);

        navigateTo(`/pong/`);
    }

    handleClose(event) {
        if (!event.wasClean) {
            console.error('Tournament socket closed unexpectedly:', event.reason || 'Unknown reason');

            if (this.reconnectAttempts < this.maxReconnectAttempts) {
                this.reconnectAttempts++;
                console.log(`Reconnecting in ${this.reconnectDelay / 1000} seconds... (Attempt ${this.reconnectAttempts})`);

                setTimeout(() => {
                    //this.initWebSocket();
                }, this.reconnectDelay);
            } else {
                console.error('Maximum reconnect attempts reached. Connection closed.');
            }
        } else {
            console.log('WebSocket connection closed cleanly.');
        }
    }

    handleError(param, failedToCreateWebSocket, b) {
        console.log(param, failedToCreateWebSocket, b);
    }
}

export const pongTournamentSocket = new PongTournamentSocket();