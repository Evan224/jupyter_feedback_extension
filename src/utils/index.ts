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

const WIDGET_IDS = {
  COMMENT_BOX: "comment-box-widget",
  QUESTIONNAIRE: "questionnaire-widget",
  CHATBOT: "chatbot-widget",
  MY_REACT: "my-react-widget",
};

export function createOrActivateWidget(
  app: JupyterFrontEnd,
  widgetId: string,
  createWidget: () => ReactWidget,
  widgetIcon: any,
  newParams?: any,
) {
  const existingWidget = Array.from(app.shell.widgets("right")).find((widget) =>
    (widget as any)?.id === widgetId
  ) as any;

  if (existingWidget) {
    // remove the widget
    existingWidget.dispose();

    // app.shell.activateById(widgetId);
  }
  const widget = createWidget();
  widget.id = widgetId;
  widget.title.icon = widgetIcon;
  widget.title.closable = true;
  app.shell.add(widget, "right");
  app.shell.activateById(widget.id);
}

export function handleTooltipClicks(
  event: MouseEvent,
  app: JupyterFrontEnd,
  params: any,
) {
  const target = event.target as HTMLElement;
  if (target.matches("#add-icon")) {
    createOrActivateWidget(
      app,
      WIDGET_IDS.COMMENT_BOX,
      () => new CommentBoxWidget(params),
      addIcon,
    );
  } else if (target.matches("#react-icon")) {
    createOrActivateWidget(
      app,
      WIDGET_IDS.MY_REACT,
      () => new CommentBoxDisplay(params),
      reactIcon,
      params,
    );
  } else if (target.matches("#notebook-icon")) {
    createOrActivateWidget(
      app,
      WIDGET_IDS.QUESTIONNAIRE,
      () => new QuestionnaireDisplayWidget(params),
      notebookIcon,
    );
  } else if (target.matches("#close-icon")) {
    createOrActivateWidget(
      app,
      WIDGET_IDS.CHATBOT,
      () => new ChatBotWidget(params),
      closeIcon,
    );
  }
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
  codeMirrorEditor: any,
  cellType: string,
  app: JupyterFrontEnd,
) {
  if (document.getElementById("my-tooltip")) {
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
    (e) =>
      handleTooltipClicks(e, app, { ...codeMirrorEditor, cell_type: cellType }),
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
