import {
  JupyterFrontEnd,
  JupyterFrontEndPlugin,
} from '@jupyterlab/application';
import { INotebookTracker } from '@jupyterlab/notebook';
import { reactIcon, addIcon, closeIcon, notebookIcon } from '@jupyterlab/ui-components';
import { ReactWidget } from '@jupyterlab/apputils';
import CommentBoxWidget from './components/CommentBox';
import QuestionnaireWidget from './components/QuestionaireWidget';
import ChatBotWidget from './components/ChatBoxWidget';

const WIDGET_IDS = {
  COMMENT_BOX: 'comment-box-widget',
  QUESTIONNAIRE: 'questionnaire-widget',
  CHATBOT: 'chatbot-widget',
  MY_REACT: 'my-react-widget',
};

function createOrActivateWidget(app: JupyterFrontEnd, widgetId: string, ReactComponent: any,widgetIcon:any) {
  const existingWidget = Array.from(app.shell.widgets("right")).find(widget => (widget as any)?.id === widgetId);

  if (existingWidget) {
    app.shell.activateById(widgetId);
  } else {
    const widget = new ReactComponent();
    widget.id = widgetId;
    widget.title.icon = widgetIcon;
    widget.title.closable = true;
    app.shell.add(widget, 'right');
    app.shell.activateById(widget.id);
  }
}

function handleTooltipClicks(event: MouseEvent, app: JupyterFrontEnd) {
  const target = event.target as HTMLElement;
  if (target.matches('#add-icon')) {
    createOrActivateWidget(app, WIDGET_IDS.COMMENT_BOX, CommentBoxWidget,addIcon);
  } else if (target.matches('#react-icon')) {
    createOrActivateWidget(app, WIDGET_IDS.MY_REACT, MyReactWidget,reactIcon);
  } else if (target.matches('#notebook-icon')) {
    createOrActivateWidget(app, WIDGET_IDS.QUESTIONNAIRE, QuestionnaireWidget,notebookIcon);
  } else if (target.matches('#close-icon')) {
    createOrActivateWidget(app, WIDGET_IDS.CHATBOT, ChatBotWidget,closeIcon);
  }
}

function MyReactComponent() {
  return <div>This is my React component!</div>;
}

// 2. Wrap the React component in a Lumino widget
class MyReactWidget extends ReactWidget {
  render() {
    return <MyReactComponent />;
  }
}

const extension: JupyterFrontEndPlugin<void> = {
  id: 'my-extension',
  autoStart: true,
  requires: [INotebookTracker],
  activate: (app: JupyterFrontEnd, notebookTracker: INotebookTracker) => {
    document.addEventListener('mouseup', (event) => {
      const activeCell = notebookTracker.activeCell;
      if (!activeCell){return}
      if (activeCell.model.type === 'code') {
        const codeMirrorEditor: any = activeCell.editor;
        const selectedText = codeMirrorEditor?.getSelection();
        if (selectedText && (selectedText.start.line !== selectedText.end.line || selectedText.start.column !== selectedText.end.column)) {
          showTooltip(event, codeMirrorEditor, "code",app);
        }
      } else if (activeCell.model.type === "markdown") {
        const selectedText = window.getSelection()?.toString();
        const codeMirrorEditor: any = activeCell.editor;
        if (selectedText && selectedText.trim() !== "") {
          showTooltip(event, codeMirrorEditor, "markdown",app);
        }
      }
      const tooltip = document.getElementById('my-tooltip');
      if (tooltip) {
        tooltip.addEventListener('click', (e) => handleTooltipClicks(e, app));
      }
    });
    notebookTracker.activeCellChanged.connect(() => {
      const tooltip = document.getElementById('my-tooltip');
      if (tooltip) {
        tooltip.remove();
      }
    });
  },
};

function createTooltipIcon(icon: any, id: string): HTMLElement {
  const parser = new DOMParser();
  const doc = parser.parseFromString(icon.svgstr, 'image/svg+xml');
  const svgElement = doc.firstChild as HTMLElement;
  svgElement.id = id;
  return svgElement;
}


function showTooltip(event: MouseEvent, codeMirrorEditor: any, cellType: string, app: JupyterFrontEnd) {
  if (document.getElementById('my-tooltip')) {
    return;
  }

  const tooltip = document.createElement('div');
  tooltip.id = 'my-tooltip';
  tooltip.style.position = 'absolute';
  tooltip.style.background = 'lightgray';
  tooltip.style.border = '1px solid black';
  tooltip.style.padding = '5px';
  tooltip.style.zIndex = '1000';

  // Append tooltip icons
  tooltip.appendChild(createTooltipIcon(addIcon, 'add-icon'));
  tooltip.appendChild(createTooltipIcon(closeIcon, 'close-icon'));
  tooltip.appendChild(createTooltipIcon(notebookIcon, 'notebook-icon'));
  tooltip.appendChild(createTooltipIcon(reactIcon, 'react-icon'));

  // Add event listener for tooltip clicks
  tooltip.addEventListener('click', (e) => handleTooltipClicks(e, app));

  document.body.appendChild(tooltip);
  tooltip.style.left = `${event.clientX}px`;
  tooltip.style.top = `${event.clientY}px`;

  // Handle tooltip dismissal
  const onClickOutside = (e: MouseEvent) => {
    if (!tooltip.contains(e.target as Node)) {
      tooltip.remove();
      document.removeEventListener('mousedown', onClickOutside);
    }
  };

  document.addEventListener('mousedown', onClickOutside);
}

export default extension;