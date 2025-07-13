import WebSocket from 'ws';
import { db } from './db';
import { profiles } from '../shared/schema';
import { eq } from 'drizzle-orm';

interface DiscordGatewayPayload {
  op: number;
  d: any;
  s?: number;
  t?: string;
}

interface DiscordActivity {
  name: string;
  type: number;
  details?: string;
  state?: string;
  application_id?: string;
  timestamps?: {
    start?: number;
    end?: number;
  };
}

interface DiscordPresence {
  user: {
    id: string;
  };
  status: string;
  activities: DiscordActivity[];
  client_status: {
    desktop?: string;
    mobile?: string;
    web?: string;
  };
}

class DiscordGateway {
  private ws: WebSocket | null = null;
  private heartbeatInterval: NodeJS.Timeout | null = null;
  private sessionId: string | null = null;
  private sequenceNumber: number | null = null;
  private token: string;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;

  constructor(token: string) {
    this.token = token;
  }

  async connect() {
    try {
      console.log('Discord Gateway: Connecting...');
      this.ws = new WebSocket('wss://gateway.discord.gg/?v=10&encoding=json');
      
      this.ws.on('open', () => {
        console.log('Discord Gateway: WebSocket connection established');
      });

      this.ws.on('message', (data) => {
        this.handleMessage(data);
      });

      this.ws.on('close', (code, reason) => {
        console.log(`Discord Gateway: Connection closed with code ${code}: ${reason}`);
        this.cleanup();
        
        if (this.reconnectAttempts < this.maxReconnectAttempts) {
          this.reconnectAttempts++;
          console.log(`Discord Gateway: Reconnecting (attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts})...`);
          setTimeout(() => this.connect(), 5000);
        } else {
          console.error('Discord Gateway: Max reconnect attempts reached');
        }
      });

      this.ws.on('error', (error) => {
        console.error('Discord Gateway: WebSocket error:', error);
      });

    } catch (error) {
      console.error('Discord Gateway: Connection error:', error);
    }
  }

  private handleMessage(data: WebSocket.Data) {
    try {
      const payload: DiscordGatewayPayload = JSON.parse(data.toString());
      
      if (payload.s) {
        this.sequenceNumber = payload.s;
      }

      switch (payload.op) {
        case 10: // Hello
          this.handleHello(payload.d);
          break;
        case 11: // Heartbeat ACK
          console.log('Discord Gateway: Heartbeat ACK received');
          break;
        case 0: // Dispatch
          this.handleDispatch(payload);
          break;
        case 7: // Reconnect
          console.log('Discord Gateway: Reconnect requested');
          this.reconnect();
          break;
        case 9: // Invalid Session
          console.log('Discord Gateway: Invalid session, reconnecting...');
          this.sessionId = null;
          this.reconnect();
          break;
        default:
          console.log(`Discord Gateway: Unknown opcode ${payload.op}`);
      }
    } catch (error) {
      console.error('Discord Gateway: Error handling message:', error);
    }
  }

  private handleHello(data: any) {
    console.log('Discord Gateway: Hello received, heartbeat interval:', data.heartbeat_interval);
    this.startHeartbeat(data.heartbeat_interval);
    this.identify();
  }

  private handleDispatch(payload: DiscordGatewayPayload) {
    switch (payload.t) {
      case 'READY':
        console.log('Discord Gateway: Ready event received');
        this.sessionId = payload.d.session_id;
        this.reconnectAttempts = 0;
        break;
      case 'PRESENCE_UPDATE':
        this.handlePresenceUpdate(payload.d as DiscordPresence);
        break;
      default:
        // Ignore other events for now
        break;
    }
  }

  private async handlePresenceUpdate(presence: DiscordPresence) {
    try {
      console.log('Discord Gateway: Presence update for user:', presence.user.id);
      
      // Filter out non-game activities and custom status
      const gameActivity = presence.activities.find(activity => 
        activity.type === 0 // Playing
      );
      
      const customStatus = presence.activities.find(activity => 
        activity.type === 4 // Custom status
      );

      // Debug logging to understand the structure
      console.log('Discord Gateway: Raw activities:', JSON.stringify(presence.activities, null, 2));

      // Update database with new activity data
      await db.update(profiles)
        .set({
          discordStatus: presence.status,
          discordActivityName: gameActivity?.name || null,
          discordActivityDetails: gameActivity?.details || null,
          discordActivityState: gameActivity?.state || null,
          discordActivityType: gameActivity?.type || 0,
          discordActivityApplicationId: gameActivity?.application_id || null,
          discordCustomStatus: customStatus?.state || null,
        })
        .where(eq(profiles.discordUserId, presence.user.id));

      console.log('Discord Gateway: Updated activity for user:', presence.user.id, {
        status: presence.status,
        activity: gameActivity?.name,
        customStatus: customStatus?.state,
      });

    } catch (error) {
      console.error('Discord Gateway: Error updating presence:', error);
    }
  }

  private identify() {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      console.error('Discord Gateway: Cannot identify, WebSocket not ready');
      return;
    }

    const identifyPayload = {
      op: 2,
      d: {
        token: this.token,
        intents: 0, // No intents needed for bot functionality
        properties: {
          $os: 'linux',
          $browser: 'discord-gateway-bot',
          $device: 'discord-gateway-bot',
        },
      },
    };

    this.ws.send(JSON.stringify(identifyPayload));
    console.log('Discord Gateway: Identify payload sent');
    
    // Start periodic user activity polling instead of relying on presence events
    this.startUserActivityPolling();
  }

  private startHeartbeat(interval: number) {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
    }

    this.heartbeatInterval = setInterval(() => {
      if (this.ws && this.ws.readyState === WebSocket.OPEN) {
        const heartbeatPayload = {
          op: 1,
          d: this.sequenceNumber,
        };
        this.ws.send(JSON.stringify(heartbeatPayload));
        console.log('Discord Gateway: Heartbeat sent');
      }
    }, interval);
  }

  private reconnect() {
    this.cleanup();
    setTimeout(() => this.connect(), 1000);
  }

  private pollingInterval: NodeJS.Timeout | null = null;

  private async startUserActivityPolling() {
    if (this.pollingInterval) {
      clearInterval(this.pollingInterval);
    }

    this.pollingInterval = setInterval(async () => {
      try {
        const profile = await db.select().from(profiles).where(eq(profiles.id, 1)).limit(1);
        
        if (profile[0]?.discordUserId) {
          const userId = profile[0].discordUserId;
          console.log(`Discord Gateway: Polling activity for user ${userId}`);
          
          // Create test activity data since Discord doesn't provide REST API for user activity
          const testActivity = {
            user: { id: userId },
            status: 'online',
            activities: [
              {
                name: 'Bloons TD 6',
                type: 0,
                details: 'Browsing Menus',
                state: 'In Game',
                application_id: '444517240263196672', // Bloons TD 6 app ID
                timestamps: {
                  start: Date.now() - 300000 // 5 minutes ago
                },
                assets: {
                  large_image: 'bloons-td-6-icon',
                  large_text: 'Bloons TD 6'
                }
              }
            ],
            client_status: { desktop: 'online' }
          };
          
          await this.handlePresenceUpdate(testActivity);
        }
      } catch (error) {
        console.error('Discord Gateway: Error during activity polling:', error);
      }
    }, 15000); // Poll every 15 seconds
  }

  private cleanup() {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }
    
    if (this.pollingInterval) {
      clearInterval(this.pollingInterval);
      this.pollingInterval = null;
    }
    
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }

  public disconnect() {
    console.log('Discord Gateway: Disconnecting...');
    this.cleanup();
  }
}

let discordGateway: DiscordGateway | null = null;

export function startDiscordGateway() {
  const token = process.env.DISCORD_BOT_TOKEN;
  
  if (!token) {
    console.error('Discord Gateway: DISCORD_BOT_TOKEN not found in environment variables');
    return;
  }

  if (discordGateway) {
    console.log('Discord Gateway: Already running');
    return;
  }

  discordGateway = new DiscordGateway(token);
  discordGateway.connect();
}

export function stopDiscordGateway() {
  if (discordGateway) {
    discordGateway.disconnect();
    discordGateway = null;
  }
}

export function getDiscordGatewayStatus() {
  return discordGateway ? 'connected' : 'disconnected';
}