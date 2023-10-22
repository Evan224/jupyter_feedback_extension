export class EventTracker {
  private apiUrl: string; // 后端API地址

  constructor(apiUrl: string) {
    this.apiUrl = apiUrl;
  }

  /**
   * Retrieve the user ID from localStorage
   * @returns User's ID or null if not found
   */
  private getUserId(): string | null {
    return localStorage.getItem("user_id");
  }

  /**
   * 发送事件到后端
   * @param eventType 事件类型
   * @param eventData 事件相关数据
   */
  sendEvent(eventType: string, eventData: any) {
    const userId = this.getUserId();
    if (!userId) {
      console.warn("User ID not found in localStorage. Unable to send event.");
      return;
    }
    fetch(this.apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        user_id: userId, // Include user_id in the payload
        type: eventType,
        data: eventData,
        timestamp: new Date().toISOString(),
      }),
    }).catch((error) => {
      console.error(`Failed to send event ${eventType}:`, error);
    });
  }

  /**
   * 为常见的JupyterLab事件注册监听器
   * @param notebookTracker Notebook追踪器
   */
  registerJupyterLabEventListeners(notebookTracker: any) {
    // 监听cell激活事件
    notebookTracker.activeCellChanged.connect(() => {
      const activeCell = notebookTracker.activeCell;
      if (activeCell) {
        // this.sendEvent("cell_activated", { cellId: activeCell.model.id });
      }
    });
  }
}
