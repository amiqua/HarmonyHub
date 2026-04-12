/**
 * Offline Queue with automatic retry
 * Queues failed requests and retries when connection is restored
 */

class OfflineQueue {
  constructor() {
    this.queue = [];
    this.isOnline = navigator.onLine;
    this.maxRetries = 3;
    this.retryDelay = 2000; // 2 seconds

    // Listen for online/offline events
    window.addEventListener("online", () => this.onOnline());
    window.addEventListener("offline", () => this.onOffline());
  }

  onOnline() {
    this.isOnline = true;
    this.processQueue();
  }

  onOffline() {
    this.isOnline = false;
  }

  /**
   * Queue a request for retry
   */
  add(request) {
    const queueItem = {
      id: Math.random().toString(36).substr(2, 9),
      ...request,
      retries: 0,
      timestamp: Date.now(),
    };

    this.queue.push(queueItem);

    // Auto-retry if online
    if (this.isOnline) {
      this.processQueue();
    }

    return queueItem.id;
  }

  /**
   * Process queued requests
   */
  async processQueue() {
    if (this.queue.length === 0) return;

    const itemsToProcess = [...this.queue];

    for (const item of itemsToProcess) {
      try {
        const response = await this.executeRequest(item);

        // Remove from queue on success
        this.queue = this.queue.filter((i) => i.id !== item.id);

        // Call success callback
        item.onSuccess?.(response);
      } catch (error) {
        item.retries++;

        if (item.retries >= this.maxRetries) {
          // Remove after max retries
          this.queue = this.queue.filter((i) => i.id !== item.id);
          item.onError?.(error);
        } else {
          // Retry with exponential backoff
          const delay = this.retryDelay * Math.pow(2, item.retries - 1);
          setTimeout(() => {
            if (this.isOnline) {
              this.processQueue();
            }
          }, delay);
        }
      }
    }
  }

  /**
   * Execute a queued request
   */
  async executeRequest(item) {
    const { method = "GET", url, data, headers = {} } = item;

    const response = await fetch(url, {
      method,
      headers: {
        "Content-Type": "application/json",
        ...headers,
      },
      body: data ? JSON.stringify(data) : undefined,
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    return response.json();
  }

  /**
   * Get queue status
   */
  getStatus() {
    return {
      isOnline: this.isOnline,
      queueLength: this.queue.length,
      items: this.queue.map((item) => ({
        id: item.id,
        method: item.method,
        url: item.url,
        retries: item.retries,
        timestamp: new Date(item.timestamp),
      })),
    };
  }

  /**
   * Clear queue (useful for logout)
   */
  clear() {
    this.queue = [];
  }
}

export const offlineQueue = new OfflineQueue();

/**
 * Wrapper to intercept failed requests and queue them
 */
export function withOfflineQueueing(axiosInstance) {
  axiosInstance.interceptors.response.use(
    (response) => response,
    (error) => {
      // Only queue if offline or no internet
      if (!navigator.onLine || error.code === "ECONNABORTED") {
        const config = error.config;

        offlineQueue.add({
          method: config.method.toUpperCase(),
          url: config.url,
          data: config.data ? JSON.parse(config.data) : undefined,
          headers: config.headers,
          onSuccess: (response) => {
            // Re-resolve the promise with the queued response
            return Promise.resolve(response);
          },
          onError: (err) => {
            return Promise.reject(err);
          },
        });

        // Return a pending promise so the request doesn't fail immediately
        return new Promise(() => {});
      }

      return Promise.reject(error);
    }
  );
}
