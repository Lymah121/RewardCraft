/**
 * WebSocket hook for real-time training updates
 * Connects to backend WebSocket endpoint for live AI training visualization
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import type { WSMessage, WSCommand, RewardConfig } from '../types';

interface UseWebSocketProps {
  url: string;
  onMessage?: (message: WSMessage) => void;
  onConnect?: () => void;
  onDisconnect?: () => void;
  onError?: (error: Event) => void;
  autoReconnect?: boolean;
  reconnectInterval?: number;
}

export const useWebSocket = ({
  url,
  onMessage,
  onConnect,
  onDisconnect,
  onError,
  autoReconnect = true,
  reconnectInterval = 3000,
}: UseWebSocketProps) => {
  const [isConnected, setIsConnected] = useState(false);
  const [lastMessage, setLastMessage] = useState<WSMessage | null>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout>();
  const isConnectingRef = useRef(false);

  // Store callbacks in refs to avoid dependency issues
  const onMessageRef = useRef(onMessage);
  const onConnectRef = useRef(onConnect);
  const onDisconnectRef = useRef(onDisconnect);
  const onErrorRef = useRef(onError);

  // Update refs when callbacks change
  useEffect(() => {
    onMessageRef.current = onMessage;
    onConnectRef.current = onConnect;
    onDisconnectRef.current = onDisconnect;
    onErrorRef.current = onError;
  }, [onMessage, onConnect, onDisconnect, onError]);

  const connect = useCallback(() => {
    // Prevent multiple simultaneous connection attempts
    if (wsRef.current?.readyState === WebSocket.OPEN ||
        wsRef.current?.readyState === WebSocket.CONNECTING ||
        isConnectingRef.current) {
      return; // Already connected or connecting
    }

    isConnectingRef.current = true;

    try {
      const ws = new WebSocket(url);

      ws.onopen = () => {
        console.log('WebSocket connected');
        isConnectingRef.current = false;
        setIsConnected(true);
        if (onConnectRef.current) onConnectRef.current();
      };

      ws.onmessage = (event) => {
        try {
          const message: WSMessage = JSON.parse(event.data);
          setLastMessage(message);
          if (onMessageRef.current) onMessageRef.current(message);
        } catch (error) {
          console.error('Failed to parse WebSocket message:', error);
        }
      };

      ws.onerror = (error) => {
        console.error('WebSocket error:', error);
        isConnectingRef.current = false;
        if (onErrorRef.current) onErrorRef.current(error);
      };

      ws.onclose = () => {
        console.log('WebSocket disconnected');
        isConnectingRef.current = false;
        setIsConnected(false);
        wsRef.current = null;
        if (onDisconnectRef.current) onDisconnectRef.current();

        // Auto-reconnect (but not if we're unmounting)
        if (autoReconnect && reconnectTimeoutRef.current !== undefined) {
          reconnectTimeoutRef.current = setTimeout(() => {
            console.log('Attempting to reconnect...');
            connect();
          }, reconnectInterval);
        }
      };

      wsRef.current = ws;
    } catch (error) {
      console.error('Failed to create WebSocket:', error);
      isConnectingRef.current = false;
    }
  }, [url, autoReconnect, reconnectInterval]);

  const disconnect = useCallback(() => {
    // Set to undefined to signal we're intentionally disconnecting
    reconnectTimeoutRef.current = undefined;
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
  }, []);

  const sendCommand = useCallback((command: WSCommand) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(command));
    } else {
      console.warn('WebSocket is not connected');
    }
  }, []);

  // Convenient command helpers
  const startTraining = useCallback(
    (options: {
      num_episodes?: number;
      reward_config?: RewardConfig;
      speed_multiplier?: number;
    }) => {
      sendCommand({
        command: 'start_training',
        num_episodes: options.num_episodes || 100,
        reward_config: options.reward_config,
        speed_multiplier: options.speed_multiplier || 1.0,
      });
    },
    [sendCommand]
  );

  const stopTraining = useCallback(() => {
    sendCommand({ command: 'stop_training' });
  }, [sendCommand]);

  const getStatus = useCallback(() => {
    sendCommand({ command: 'get_status' });
  }, [sendCommand]);

  const ping = useCallback(() => {
    sendCommand({ command: 'ping' });
  }, [sendCommand]);

  // Connect on mount, disconnect on unmount
  useEffect(() => {
    // Initialize reconnect timeout ref to enable auto-reconnect
    reconnectTimeoutRef.current = null as unknown as NodeJS.Timeout;
    connect();

    return () => {
      disconnect();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [url]); // Only reconnect if URL changes

  // Heartbeat ping every 30 seconds
  useEffect(() => {
    if (!isConnected) return;

    const interval = setInterval(() => {
      ping();
    }, 30000);

    return () => clearInterval(interval);
  }, [isConnected, ping]);

  return {
    isConnected,
    lastMessage,
    connect,
    disconnect,
    sendCommand,
    startTraining,
    stopTraining,
    getStatus,
    ping,
  };
};
