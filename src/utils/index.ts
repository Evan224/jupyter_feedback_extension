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
import { ToolbarButton } from "@jupyterlab/apputils";
import { showQuestionnaire } from "../components/QuestionaireWidget";
import RateBox from "../components/RateBox";
import RateResultViewWidget from "../components/RateResultView";

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
  selected_text?: string,
) => {
  const user_type = localStorage.getItem("user_type");
  const existingWidget = Array.from(app.shell.widgets("right")).find((widget) =>
    (widget as any)?.id === widgetId
  ) as any;

  if (existingWidget) {
    app.shell.activateById(existingWidget.id);
    existingWidget.updateParams({
      app: app,
      notebookTracker: notebookTracker,
      selected_text: selected_text,
    });
    return;
  }
  let widget;
  if (widgetId === WIDGET_IDS.COMMENT_BOX) {
    if (user_type === "student") {
      widget = new CommentBoxWidget({
        app: app,
        notebookTracker: notebookTracker,
        selected_text: selected_text,
      });
    } else {
      widget = new CommentBoxDisplay({
        app: app,
        notebookTracker: notebookTracker,
      });
    }
  } else if (widgetId === WIDGET_IDS.QUESTIONNAIRE) {
    if (user_type === "student") {
      widget = new RateBox({
        app: app,
        notebookTracker: notebookTracker,
      });
    } else {
      widget = new RateResultViewWidget({
        app: app,
        notebookTracker: notebookTracker,
      });
    }
  } else if (widgetId === WIDGET_IDS.CHATBOT) {
    widget = new ChatBotWidget({});
  } else if (widgetId === WIDGET_IDS.MY_REACT) {
    widget = new CommentBoxDisplay({
      app: app,
      notebookTracker: notebookTracker,
    });
  }

  if (!widget) {
    return;
  }
  widget.id = widgetId;
  widget.title.icon = widgetIcon;
  widget.title.closable = true;
  app.shell.add(widget, "right");
  app.shell.activateById(widget.id);
};

export function handleTooltipClicks(
  event: MouseEvent,
  app: JupyterFrontEnd,
  notebookTracker: INotebookTracker,
  selected_text?: string,
) {
  const target = event.target as HTMLElement;
  const iconWrapper = target.closest(".icon-wrapper"); // 使用closest查找最近的匹配元素
  if (!iconWrapper) {
    return;
  } // 如果没有找到匹配的元素则返回
  let widgetId = "";
  let widgetIcon: any;
  if (iconWrapper.matches("#add-icon")) {
    widgetIcon = addIcon;
    widgetId = WIDGET_IDS.COMMENT_BOX;
  } else if (iconWrapper.matches("#close-icon")) {
    widgetIcon = closeIcon;
    widgetId = WIDGET_IDS.CHATBOT;
  } else if (iconWrapper.matches("#notebook-icon")) {
    widgetIcon = notebookIcon;
    widgetId = WIDGET_IDS.QUESTIONNAIRE;
  } else if (iconWrapper.matches("#react-icon")) {
    widgetIcon = reactIcon;
    widgetId = WIDGET_IDS.MY_REACT;
  }
  if (widgetId && widgetIcon) {
    createOrActivateWidget(
      widgetIcon,
      widgetId,
      app,
      notebookTracker,
      selected_text,
    );
  }
}

export function createTooltipIcon(icon: any, id: string): HTMLElement {
  const parser = new DOMParser();
  const doc = parser.parseFromString(icon.svgstr, "image/svg+xml");
  const svgElement = doc.firstChild as HTMLElement;

  const iconWrapper = document.createElement("div");
  iconWrapper.id = id;
  iconWrapper.className = "icon-wrapper"; // 给包裹的div添加一个类名，以便于之后的匹配
  iconWrapper.appendChild(svgElement);

  return iconWrapper;
}

function getSelectionCoordinates() {
  const selection = window.getSelection();
  if (selection?.rangeCount || 0 > 0) {
    const range = selection?.getRangeAt(0); // 获取第一个选中区域
    const rect = range?.getBoundingClientRect(); // 获取选中区域的边界矩形
    if (!rect) {
      return null;
    }
    const coordinates = {
      x: rect.left + window.scrollX,
      y: rect.top + window.scrollY,
      width: rect.width,
      height: rect.height,
    };
    return coordinates;
  }
  return null;
}

// 3. Create a tooltip and append it to the DOM
export function showTooltip(
  event: MouseEvent,
  app: JupyterFrontEnd,
  notebookTracker: INotebookTracker,
  selected_text?: string,
) {
  const coordinates = getSelectionCoordinates();
  const existingTooltip = document.getElementById("my-tooltip");
  if (existingTooltip) {
    existingTooltip.style.display = "inline-block";
    if (coordinates) {
      existingTooltip.style.left = `${coordinates.x}px`;
      existingTooltip.style.top = `${coordinates.y + coordinates.height}px`;
    } else {
      existingTooltip.style.left = `${event.clientX}px`;
      existingTooltip.style.top = `${event.clientY}px`;
    }
    return;
  }

  const tooltip = document.createElement("div");
  tooltip.id = "my-tooltip";
  tooltip.style.position = "absolute";
  tooltip.style.background = "lightgray";
  tooltip.style.border = "1px solid black";
  tooltip.style.padding = "2px";
  tooltip.style.zIndex = "1000";
  tooltip.style.display = "flex";
  tooltip.style.flexDirection = "row";
  tooltip.style.flexWrap = "nowrap";
  tooltip.style.justifyContent = "space-around";
  tooltip.style.alignItems = "center";

  // Append tooltip icons
  tooltip.appendChild(createTooltipIcon(addIcon, "add-icon"));
  // tooltip.appendChild(createTooltipIcon(closeIcon, "close-icon"));
  tooltip.appendChild(createTooltipIcon(notebookIcon, "notebook-icon"));
  // tooltip.appendChild(createTooltipIcon(reactIcon, "react-icon"));

  // Add event listener for tooltip clicks
  tooltip.addEventListener(
    "click",
    (e) => handleTooltipClicks(e, app, notebookTracker, selected_text),
  );

  document.body.appendChild(tooltip);
  if (coordinates) {
    tooltip.style.left = `${coordinates.x}px`;
    tooltip.style.top = `${coordinates.y + coordinates.height}px`;
  } else {
    tooltip.style.left = `${event.clientX}px`;
    tooltip.style.top = `${event.clientY}px`;
  }

  // Handle tooltip dismissal
  const onClickOutside = (e: MouseEvent) => {
    if (!tooltip.contains(e.target as Node)) {
      tooltip.remove();
      document.removeEventListener("mousedown", onClickOutside);
    }
  };

  document.addEventListener("mousedown", onClickOutside);
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
      notebookTracker: notebookTracker,
    };
    // 更新widget的参数
    const widgetId = WIDGET_IDS.COMMENT_BOX; // 或其他需要更新的 widget ID
    const existingWidget = Array.from(app.shell.widgets("right")).find(
      (widget) => (widget as any)?.id === widgetId,
    ) as any;
    if (existingWidget) {
      existingWidget?.updateParams(params);
    }
  }
}

export function addToolbarButton(
  app: JupyterFrontEnd,
  notebookTracker: INotebookTracker,
) {
  notebookTracker.currentChanged.connect(() => {
    const toolbar = notebookTracker?.currentWidget?.toolbar;
    const button = new ToolbarButton({
      icon: notebookIcon,
      onClick: () => {
        showQuestionnaire(app, "file");
      },
      tooltip: "完成问卷",
    });
    toolbar?.addItem("questionnaireButton", button);
  });
}
