import {
  JupyterFrontEnd,
  JupyterFrontEndPlugin,
} from "@jupyterlab/application";
import {
  addIcon,
  closeIcon,
  notebookIcon,
  reactIcon,
} from "@jupyterlab/ui-components";
import { ReactWidget } from "@jupyterlab/apputils";
import CommentBoxWidget from "../components/CommentBox";
import QuestionnaireWidget from "../components/QuestionaireWidget";
import ChatBotWidget from "../components/ChatBoxWidget";
import QuestionnaireDisplayWidget from "../components/QuestionnaireDisplay";
import CommentBoxDisplay from "../components/CommentBoxDisplay";
import { INotebookTracker } from "@jupyterlab/notebook";

const WIDGET_IDS = {
  COMMENT_BOX: "comment-box-widget",
  QUESTIONNAIRE: "questionnaire-widget",
  CHATBOT: "chatbot-widget",
  MY_REACT: "my-react-widget",
};

export const createOrActivateWidget = (
  widgetIcon: any,
  widgetId: string,
  app: JupyterFrontEnd,
  notebookTracker: INotebookTracker,
) => {
  const existingWidget = Array.from(app.shell.widgets("right")).find((widget) =>
    (widget as any)?.id === widgetId
  ) as any;

  if (existingWidget) {
    // remove the widget
    existingWidget.dispose();

    // app.shell.activateById(widgetId);
  }
  const widget = new CommentBoxWidget({
    app: app,
    notebookTracker: notebookTracker,
  });
  widget.id = widgetId;
  widget.title.icon = widgetIcon;
  widget.title.closable = true;
  app.shell.add(widget, "right");
  app.shell.activateById(widget.id);
};

// export function createOrActivateWidget(
//   app: JupyterFrontEnd,
//   widgetId: string,
//   createWidget: () => ReactWidget,
//   widgetIcon: any,
//   newParams?: any,
// ) {
//   const existingWidget = Array.from(app.shell.widgets("right")).find((widget) =>
//     (widget as any)?.id === widgetId
//   ) as any;

//   if (existingWidget) {
//     // remove the widget
//     existingWidget.dispose();

//     // app.shell.activateById(widgetId);
//   }
//   const widget = createWidget();
//   widget.id = widgetId;
//   widget.title.icon = widgetIcon;
//   widget.title.closable = true;
//   app.shell.add(widget, "right");
//   app.shell.activateById(widget.id);
// }

//handleToolTipClick should only change the state of the widget
export function handleTooltipClicks(
  event: MouseEvent,
  app: JupyterFrontEnd,
  notebookTracker: INotebookTracker,
) {
  const target = event.target as HTMLElement;
  let widgetId = "";
  let widgetIcon: any;
  if (target.matches("#add-icon")) {
    widgetIcon = addIcon;
    widgetId = WIDGET_IDS.COMMENT_BOX;
  } else if (target.matches("#close-icon")) {
    widgetIcon = closeIcon;
    widgetId = WIDGET_IDS.CHATBOT;
  } else if (target.matches("#notebook-icon")) {
    widgetIcon = notebookIcon;
    widgetId = WIDGET_IDS.QUESTIONNAIRE;
  } else if (target.matches("#react-icon")) {
    widgetIcon = reactIcon;
    widgetId = WIDGET_IDS.MY_REACT;
  }
  if (widgetId && widgetIcon) {
    createOrActivateWidget(
      widgetIcon,
      widgetId,
      app,
      notebookTracker,
    );
  }
  // const target = event.target as HTMLElement;
  // const params = getParams(notebookTracker);
  // if (!params) return; // 如果无法获取参数，则返回
  // if (target.matches("#add-icon")) {
  //   createOrActivateWidget(
  //     app,
  //     WIDGET_IDS.COMMENT_BOX,
  //     () => new CommentBoxWidget(params),
  //     addIcon,
  //   );
  // } else if (target.matches("#react-icon")) {
  //   createOrActivateWidget(
  //     app,
  //     WIDGET_IDS.MY_REACT,
  //     () => new CommentBoxDisplay(params),
  //     reactIcon,
  //     params,
  //   );
  // } else if (target.matches("#notebook-icon")) {
  //   createOrActivateWidget(
  //     app,
  //     WIDGET_IDS.QUESTIONNAIRE,
  //     () => new QuestionnaireDisplayWidget(params),
  //     notebookIcon,
  //   );
  // } else if (target.matches("#close-icon")) {
  //   createOrActivateWidget(
  //     app,
  //     WIDGET_IDS.CHATBOT,
  //     () => new ChatBotWidget(params),
  //     closeIcon,
  //   );
}

export function createTooltipIcon(icon: any, id: string): HTMLElement {
  const parser = new DOMParser();
  const doc = parser.parseFromString(icon.svgstr, "image/svg+xml");
  const svgElement = doc.firstChild as HTMLElement;
  svgElement.id = id;
  return svgElement;
}

// 3. Create a tooltip and append it to the DOM
export function showTooltip(
  event: MouseEvent,
  app: JupyterFrontEnd,
  notebookTracker: INotebookTracker,
) {
  const existingTooltip = document.getElementById("my-tooltip");
  if (existingTooltip) {
    existingTooltip.style.display = "block";
    existingTooltip.style.left = `${event.clientX}px`;
    existingTooltip.style.top = `${event.clientY}px`;
    return;
  }

  const tooltip = document.createElement("div");
  tooltip.id = "my-tooltip";
  tooltip.style.position = "absolute";
  tooltip.style.background = "lightgray";
  tooltip.style.border = "1px solid black";
  tooltip.style.padding = "5px";
  tooltip.style.zIndex = "1000";

  // Append tooltip icons
  tooltip.appendChild(createTooltipIcon(addIcon, "add-icon"));
  tooltip.appendChild(createTooltipIcon(closeIcon, "close-icon"));
  tooltip.appendChild(createTooltipIcon(notebookIcon, "notebook-icon"));
  tooltip.appendChild(createTooltipIcon(reactIcon, "react-icon"));

  // Add event listener for tooltip clicks
  tooltip.addEventListener(
    "click",
    (e) => handleTooltipClicks(e, app, notebookTracker),
  );

  document.body.appendChild(tooltip);
  tooltip.style.left = `${event.clientX}px`;
  tooltip.style.top = `${event.clientY}px`;

  // Handle tooltip dismissal
  const onClickOutside = (e: MouseEvent) => {
    if (!tooltip.contains(e.target as Node)) {
      tooltip.remove();
      document.removeEventListener("mousedown", onClickOutside);
    }
  };

  document.addEventListener("mousedown", onClickOutside);
}

function getParams(notebookTracker: INotebookTracker) {
  const activeCell = notebookTracker.activeCell;
  if (!activeCell) return null;

  const codeMirrorEditor = activeCell.editor;
  const selectedText = codeMirrorEditor?.getSelection();

  return {
    selectedText: selectedText,
    // ... 其他需要的参数
  };
}

export function updateSidebarWidget(
  app: JupyterFrontEnd,
  notebookTracker: INotebookTracker,
) {
  const activeCell = notebookTracker.activeCell;
  if (activeCell) {
    const codeMirrorEditor = activeCell.editor;
    const selectedText = codeMirrorEditor?.getSelection();
    // 你可以根据需要添加更多的信息
    const params = {
      app: app,
    };
    // 更新widget的参数
    const widgetId = WIDGET_IDS.COMMENT_BOX; // 或其他需要更新的 widget ID
    console.log(Array.from(app.shell.widgets("right")), "---------------");
    const existingWidget = Array.from(app.shell.widgets("right")).find(
      (widget) => (widget as any)?.id === widgetId,
    ) as any;
    if (existingWidget) {
      console.log("update widget,难道没有吗");
      existingWidget.updateParams(params); // 假设你的 widget 有一个 updateParams 方法来更新其参数
    }
  }
}
