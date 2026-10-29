/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface NetworkInputPayload {
  p2Keys: {
    isLeft: boolean;
    isRight: boolean;
    isUp: boolean;
    isDown: boolean;
    lpJust: boolean;
    hpJust: boolean;
    lkJust: boolean;
    hkJust: boolean;
    rollJust: boolean;
    superJust: boolean;
  };
}

export interface NetworkRoomState {
  roomId: string;
  isHost: boolean;
  connected: boolean;
  opponentFighterId?: string;
}

class MultiplayerSync {
  private channel: BroadcastChannel | null = null;
  public roomId: string = '';
  public isHost: boolean = false;
  public isConnected: boolean = false;

  public onOpponentInput?: (input: NetworkInputPayload) => void;
  public onOpponentJoined?: (fighterId: string) => void;
  public onOpponentReady?: () => void;
  public onStateSync?: (state: any) => void;

  public createRoom(): string {
    const code = Math.random().toString(36).substring(2, 6).toUpperCase();
    this.joinRoom(code, true);
    return code;
  }

  public joinRoom(roomId: string, isHost: boolean = false) {
    this.leaveRoom();
    this.roomId = roomId.toUpperCase();
    this.isHost = isHost;

    try {
      this.channel = new BroadcastChannel(`lok_sabha_ko_${this.roomId}`);
      this.channel.onmessage = this.handleMessage;
      this.isConnected = true;

      // Broadcast presence
      this.send({
        type: isHost ? 'HOST_ANNOUNCE' : 'GUEST_JOINED',
        roomId: this.roomId,
      });
    } catch {
      // Fallback
      this.isConnected = true;
    }
  }

  public leaveRoom() {
    if (this.channel) {
      try {
        this.channel.close();
      } catch {
        // ignore
      }
      this.channel = null;
    }
    this.isConnected = false;
    this.roomId = '';
  }

  public sendInput(input: NetworkInputPayload) {
    this.send({
      type: 'INPUT',
      payload: input,
      fromHost: this.isHost,
    });
  }

  public sendFighterSelect(fighterId: string) {
    this.send({
      type: 'FIGHTER_SELECT',
      fighterId,
      fromHost: this.isHost,
    });
  }

  public sendReady() {
    this.send({
      type: 'READY',
      fromHost: this.isHost,
    });
  }

  private send(data: any) {
    if (this.channel) {
      try {
        this.channel.postMessage(data);
      } catch {
        // ignore
      }
    }
  }

  private handleMessage = (e: MessageEvent) => {
    const data = e.data;
    if (!data) return;

    if (data.type === 'GUEST_JOINED' && this.isHost) {
      this.send({ type: 'HOST_ACK', roomId: this.roomId });
      if (this.onOpponentJoined) this.onOpponentJoined(data.fighterId || 'netaji_vikas');
    } else if (data.type === 'HOST_ACK' && !this.isHost) {
      if (this.onOpponentJoined) this.onOpponentJoined(data.fighterId || 'yuva_rahul');
    } else if (data.type === 'FIGHTER_SELECT') {
      if (this.onOpponentJoined) this.onOpponentJoined(data.fighterId);
    } else if (data.type === 'READY') {
      if (this.onOpponentReady) this.onOpponentReady();
    } else if (data.type === 'INPUT') {
      // If we are host, we accept guest inputs as P2
      // If we are guest, we accept host inputs as P1
      if (data.fromHost !== this.isHost && this.onOpponentInput) {
        this.onOpponentInput(data.payload);
      }
    }
  };
}

export const multiplayer = new MultiplayerSync();
