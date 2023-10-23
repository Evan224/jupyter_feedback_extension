import { NotebookActions, NotebookModel } from "@jupyterlab/notebook";
export class EventTracker {
  private apiUrl: string; // 后端API地址
  private lastActiveCell: any | null = null; // Property to store the last active cell

  private isExecutionTriggered = false;
  NotebookModel: any;

  constructor(apiUrl: string) {
    this.apiUrl = apiUrl;

    document.addEventListener("visibilitychange", () => {
      if (document.hidden) {
        this.sendEvent("page_hidden", {});
      } else {
        this.sendEvent("page_visible", {});
      }
    });

    this.NotebookModel = new NotebookModel();
  }

  /**
   * Retrieve the user ID from localStorage
   * @returns User's ID or null if not found
   */
  private getUserId(): string | null {
    return localStorage.getItem("user_id");
  }

  private throttle(func: any, delay: number) {
    let lastCall = 0;
    return function (...args: any[]) {
      const now = new Date().getTime();
      if (now - lastCall < delay) {
        return;
      }
      lastCall = now;
      return func(...args);
    };
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
    console.log(`Sending event ${eventType} to ${this.apiUrl}`);
    /* The code block is sending an HTTP POST request to the specified API endpoint (`this.apiUrl`) with
  the event data as the request payload. The request includes the user ID, event type, event data,
  and timestamp. The request is sent with the "Content-Type" header set to "application/json" to
  indicate that the payload is in JSON format. */
    // fetch(this.apiUrl, {
    //   method: "POST",
    //   headers: {
    //     "Content-Type": "application/json",
    //   },
    //   body: JSON.stringify({
    //     user_id: userId, // Include user_id in the payload
    //     type: eventType,
    //     data: eventData,
    //     timestamp: new Date().toISOString(),
    //   }),
    // }).catch((error) => {
    //   console.error(`Failed to send event ${eventType}:`, error);
    // });
  }

  /**
   * 为常见的JupyterLab事件注册监听器
   * @param notebookTracker Notebook追踪器
   */
  registerJupyterLabEventListeners(notebookTracker: any) {
    // 监听cell激活事件
    notebookTracker.activeCellChanged.connect(() => {
      const activeCell = notebookTracker.activeCell;
      //   console.log("activeCell", activeCell?.model?.id);
      if (activeCell?.model) {
        // console.log("activeCell", activeCell?.model, "---------", activeCell);
        // 1. lastActiveCell's type: code or markdown
        // if code, then the event data should include:
        // - currentCellId: current cell's id: activeCell.model.id
        // - current prompt number: activeCell.prompt (string)
        // - the current list order: activeCell.dataset.windowedListIndex (number)
        // - the current cell's content: activeCell.editor.doc.text (an string array)
        // and all the above for the last active cell

        // however, if the current type is markdown, then the event data should include:
        // - currentCellId: current cell's id: activeCell.id
        //

        const eventData = {
          currentCellType: activeCell.model?.type, // Current cell's type
          currentCellId: activeCell.model?.id, // Current cell's id
          currentPromptNumber: activeCell?.prompt, // Current cell's prompt number
          currentListOrder: activeCell?.dataset?.windowedListIndex, // Current cell's list order
          currentCellContent: activeCell?.editor?.doc?.text, // Current cell's content
          lastCellType: this.lastActiveCell
            ? this.lastActiveCell.model?.type
            : null, // Last cell's type, if it exists
          lastCellId: this.lastActiveCell
            ? this.lastActiveCell?.model?.id
            : null, // Last cell's id, if it exists
          lastPromptNumber: this.lastActiveCell
            ? this.lastActiveCell?.prompt
            : null, // Last cell's prompt number, if it exists
          lastListOrder: this.lastActiveCell
            ? this.lastActiveCell?.dataset?.windowedListIndex
            : null, // Last cell's list order, if it exists
          lastCellContent: this.lastActiveCell
            ? this.lastActiveCell?.editor?.doc?.text
            : null, // Last cell's content, if it exists
        };

        /* The line `// this.sendEvent("cell_activated", eventData);` is commented out, which means it
        is not currently being executed. */
        this.sendEvent("cell_activated", eventData);

        // Update the last active cell
        this.lastActiveCell = activeCell;
      }
    });

    notebookTracker.activeCellChanged.connect(() => {
      const activeCell = notebookTracker.activeCell;
      // To consider: sometimes user just run the cell so the content changed event will be triggered
      if (activeCell?.model) {
        activeCell.model.contentChanged.connect(this.throttle(() => {
          if (this.isExecutionTriggered) {
            // 这是由于单元格执行引起的内容变化，所以可能不需要进行任何操作
            this.isExecutionTriggered = false; // 重置标志
            return;
          }
          const eventData = {
            currentCellType: activeCell.model?.type, // Current cell's type
            currentCellId: activeCell.model?.id, // Current cell's id
            currentPromptNumber: activeCell?.prompt, // Current cell's prompt number
            currentListOrder: activeCell?.dataset?.windowedListIndex, // Current cell's list order
            currentCellContent: activeCell?.editor?.doc?.text, // Current cell's content
          };
          this.sendEvent("cell_content_changed", eventData);
        }, 1000));

        // activeCell.model.metadata.changed.connect(this.throttle(() => {
        //   console.log("metadata changed", activeCell.model.metadata);
        // }, 1000));
      }
    });
    NotebookActions.executed.connect(
      this.throttle((sender: any, args: any) => {
        this.isExecutionTriggered = true;
        const activeCell = args.cell;
        const eventData = {
          currentCellType: activeCell.model?.type, // Current cell's type
          currentCellId: activeCell.model?.id, // Current cell's id
          currentPromptNumber: activeCell?.prompt, // Current cell's prompt number
          currentListOrder: activeCell?.dataset?.windowedListIndex, // Current cell's list order
          currentCellContent: activeCell?.editor?.doc?.text, // Current cell's content
          success: args.success,
          // TODO: output
          //   output: args.cell.model.outputs?.list,
        };
        this.sendEvent("cell_executed", eventData);
      }, 1000),
    );

    console.log(
      notebookTracker?.currentWidget,
      "--------",
      notebookTracker?.widgetUpdated,
    );
  }
}
