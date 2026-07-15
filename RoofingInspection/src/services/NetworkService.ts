import NetInfo, { NetInfoState, NetInfoSubscription } from "@react-native-community/netinfo";

// Define the type for the listener callback
type NetworkChangeListener = (isConnected: boolean) => void;

class NetworkService {
  private subscription: NetInfoSubscription | null = null;
  private listeners: Set<NetworkChangeListener> = new Set();
  private _isConnected: boolean = true;

  constructor() {
    // Initialize the service
    this.init();
  }

  private init() {
    // 1. Get initial state
    NetInfo.fetch().then((state) => {
      this._updateState(state);
    });

    // 2. Subscribe to changes
    this.subscription = NetInfo.addEventListener((state) => {
      this._updateState(state);
    });
  }

  private _updateState(state: NetInfoState) {
    // Consider internet reachable only if connected and internet is actually reachable
    const status = !!(state.isConnected && state.isInternetReachable !== false);
    
    if (this._isConnected !== status) {
      this._isConnected = status;
      // Notify all subscribers
      this.listeners.forEach((listener) => listener(this._isConnected));
    }
  }

  /**
   * Synchronously check the last known connection status
   */
  public get isConnected(): boolean {
    return this._isConnected;
  }

  /**
   * Add a listener to network changes
   * @returns a function to unsubscribe
   */
  public subscribe(callback: NetworkChangeListener): () => void {
    this.listeners.add(callback);
    // Immediately call with current status
    callback(this._isConnected);

    return () => {
      this.listeners.delete(callback);
    };
  }

  /**
   * Force a manual refresh of the network state
   */
  public async refreshStatus(): Promise<boolean> {
    const state = await NetInfo.refresh();
    this._updateState(state);
    return this._isConnected;
  }

  /**
   * Clean up (useful if you ever need to destroy the service)
   */
  public destroy() {
    if (this.subscription) {
      this.subscription();
    }
    this.listeners.clear();
  }
}

// Export as a Singleton
export const networkService = new NetworkService();