import {
  JupyterFrontEnd,
  JupyterFrontEndPlugin,
} from '@jupyterlab/application';
import { INotebookModel, INotebookTracker} from '@jupyterlab/notebook';
import { reactIcon, addIcon, closeIcon, notebookIcon } from '@jupyterlab/ui-components';
import { ReactWidget } from '@jupyterlab/apputils';
import CommentBoxWidget from './components/CommentBox';
import QuestionnaireWidget from './components/QuestionaireWidget';
import ChatBotWidget from './components/ChatBoxWidget';
import { EventTracker } from './utils/EventTracker';
import { checkAndSendUser } from './utils/initUser';

const WIDGET_IDS = {
  COMMENT_BOX: 'comment-box-widget',
  QUESTIONNAIRE: 'questionnaire-widget',
  CHATBOT: 'chatbot-widget',
  MY_REACT: 'my-react-widget',
};

const eventTracker = new EventTracker('http://localhost:3000/events');

function createOrActivateWidget(app: JupyterFrontEnd, widgetId: string, createWidget: () => ReactWidget, widgetIcon: any) {
  const existingWidget = Array.from(app.shell.widgets("right")).find(widget => (widget as any)?.id === widgetId);

  if (existingWidget) {
    app.shell.activateById(widgetId);
  } else {
    const widget = createWidget();
    widget.id = widgetId;
    widget.title.icon = widgetIcon;
    widget.title.closable = true;
    app.shell.add(widget, 'right');
    app.shell.activateById(widget.id);
  }
}


function handleTooltipClicks(event: MouseEvent, app: JupyterFrontEnd,params:any) {
  const target = event.target as HTMLElement;
  if (target.matches('#add-icon')) {
    createOrActivateWidget(app, WIDGET_IDS.COMMENT_BOX, ()=>new CommentBoxWidget(params),addIcon);
  } else if (target.matches('#react-icon')) {
    createOrActivateWidget(app, WIDGET_IDS.MY_REACT,()=>new MyReactWidget(),reactIcon);
  } else if (target.matches('#notebook-icon')) {
    createOrActivateWidget(app, WIDGET_IDS.QUESTIONNAIRE,()=>new QuestionnaireWidget(params),notebookIcon);
  } else if (target.matches('#close-icon')) {
    createOrActivateWidget(app, WIDGET_IDS.CHATBOT,()=>new ChatBotWidget(params),closeIcon);
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

function createTooltipIcon(icon: any, id: string): HTMLElement {
  const parser = new DOMParser();
  const doc = parser.parseFromString(icon.svgstr, 'image/svg+xml');
  const svgElement = doc.firstChild as HTMLElement;
  svgElement.id = id;
  return svgElement;
}


// 3. Create a tooltip and append it to the DOM
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
  tooltip.addEventListener('click', (e) => handleTooltipClicks(e, app,codeMirrorEditor));

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


const extension: JupyterFrontEndPlugin<void> = {
  id: 'my-extension',
  autoStart: true,
  requires: [INotebookTracker],
  activate: (app: JupyterFrontEnd, notebookTracker: INotebookTracker) => {
    checkAndSendUser();
    eventTracker.registerJupyterLabEventListeners(notebookTracker);
    document.addEventListener('mouseup', (event) => {
      const activeCell = notebookTracker.activeCell;
      // const codeMirrorEditor: any = activeCell?.editor;
      // const selectedText = codeMirrorEditor?.getSelection();
      if (!activeCell?.model){return}
      if (activeCell.model?.type && activeCell.model?.type === 'code') {
        const codeMirrorEditor: any = activeCell?.editor;
        const selectedText = codeMirrorEditor?.getSelection();
        if (selectedText && (selectedText.start.line !== selectedText.end.line || selectedText.start.column !== selectedText.end.column)) {
          eventTracker.sendEvent('code-selection', {
            cellId: activeCell.model.id,
            selectedText: selectedText,
            currentListOrder:activeCell?.dataset?.windowedListIndex,
            // @ts-ignore
            currentPromptNumber: activeCell.prompt,
          });
          showTooltip(event, {...selectedText,selected_text:window.getSelection()?.toString()}, "code",app);
        }
      } else if (activeCell.model?.type === "markdown") {
        const selectedText = window.getSelection()?.toString();
        if (selectedText && selectedText.trim() !== "") {
          eventTracker.sendEvent('code-selection', {
            cellId: activeCell.model.id,
            selectedText: selectedText,
            currentListOrder:activeCell?.dataset?.windowedListIndex,
            // @ts-ignore
            currentPromptNumber: activeCell.prompt,
          });
          showTooltip(event, selectedText, "markdown",app);
        }
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



export default extension;