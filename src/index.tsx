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

function MyReactComponent() {
  return <div>This is my React component!</div>;
}

// 2. Wrap the React component in a Lumino widget
class MyReactWidget extends ReactWidget {
  render() {
    return <MyReactComponent />;
  }
}

function createIconClickHandler(app: JupyterFrontEnd, icon: any, ReactComponent: any) {
  return () => {
    const widgetId = `widget-${icon.name}`;
    const existingWidget = Array.from(app.shell.widgets("right")).find(widget => (widget as any)?.id === widgetId);

    if (existingWidget) {
      // If the widget already exists, activate it
      app.shell.activateById(widgetId);
    } else {
      // If the widget doesn't exist, create a new one and add it to the shell
      const widget = new ReactComponent();
      widget.id = widgetId;
      widget.title.icon = icon;
      widget.title.closable = true;
      app.shell.add(widget, 'right');
      app.shell.activateById(widget.id);  // Activate (or select) the widget
    }
  };
}

function showCommentBox(app: JupyterFrontEnd) {
  return () => {
    const widgetId = 'comment-box-widget';
    const existingWidget = Array.from(app.shell.widgets("right")).find(widget => (widget as any)?.id === widgetId);

    if (existingWidget) {
      // If the widget already exists, activate it
      app.shell.activateById(widgetId);
    } else {
      // If the widget doesn't exist, create a new one and add it to the shell
      const widget = new CommentBoxWidget((comment: string) => {
        console.log("Comment submitted:", comment);
        // Here you can handle the submitted comment, e.g., send it to a backend
      });
      widget.id = widgetId;
      widget.title.label = "Add Comment";
      widget.title.closable = true;
      app.shell.add(widget, 'right');
      app.shell.activateById(widget.id);
    }
  };
}

function showQuestionnaire(app: JupyterFrontEnd) {
  return () => {
    const widgetId = 'questionnaire-widget';
    const existingWidget = Array.from(app.shell.widgets("right")).find(widget => (widget as any)?.id === widgetId);

    if (existingWidget) {
      app.shell.activateById(widgetId);
    } else {
      const widget = new QuestionnaireWidget((answers: string[]) => {
        console.log("Questionnaire answers:", answers);
        // Handle the answers as needed
      });
      widget.id = widgetId;
      widget.title.label = "Questionnaire";
      widget.title.closable = true;
      app.shell.add(widget, 'right');
      app.shell.activateById(widget.id);
    }
  };
}

function showChatBot(app: JupyterFrontEnd) {
  return () => {
    const widgetId = 'chatbot-widget';
    const existingWidget = Array.from(app.shell.widgets("right")).find(widget => (widget as any)?.id === widgetId);

    if (existingWidget) {
      app.shell.activateById(widgetId);
    } else {
      const widget = new ChatBotWidget((message: string) => {
        console.log("User message:", message);
        // Here you can handle the user's message, e.g., send it to a backend or generate a response
      });
      widget.id = widgetId;
      widget.title.label = "ChatBot";
      widget.title.closable = true;
      app.shell.add(widget, 'right');
      app.shell.activateById(widget.id);
    }
  };
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
    });
    notebookTracker.activeCellChanged.connect(() => {
      const tooltip = document.getElementById('my-tooltip');
      if (tooltip) {
        tooltip.remove();
      }
    });
  },
};

function showTooltip(event: MouseEvent, codeMirrorEditor: any, cellType: string, app: JupyterFrontEnd) {
  // Create a tooltip element
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

  // Append tooltip to the editor's content DOM
  const add = document.createElement('div');
  add.innerHTML = addIcon.svgstr;
  tooltip.appendChild(add);
  const close = document.createElement('div');
  close.innerHTML = closeIcon.svgstr;
  tooltip.appendChild(close);
  const notebook = document.createElement('div');
  notebook.innerHTML = notebookIcon.svgstr;
  tooltip.appendChild(notebook);
  const reactDiv = document.createElement('div');
  reactDiv.innerHTML = reactIcon.svgstr;
  tooltip.appendChild(reactDiv);

  document.body.appendChild(tooltip);

  if (cellType === 'code' || (cellType === 'markdown' && codeMirrorEditor?.editor)) {
      tooltip.style.left = event.clientX + 'px';
      tooltip.style.top = event.clientY + 'px';
  } else {
      // For rendered Markdown cells
      tooltip.style.left = event.clientX + 'px';
      tooltip.style.top = event.clientY + 'px';
  }

  // Handle tooltip dismissal
  const onClickOutside = (e: MouseEvent) => {
      if (!tooltip.contains(e.target as Node)) {
          tooltip.remove();
          document.removeEventListener('mousedown', onClickOutside);
      }
  };

  add.addEventListener('click', () => {
    console.log("Add clicked")
    const tooltip = document.getElementById('my-tooltip');
    if (tooltip) {
      tooltip.remove();
    }
    showCommentBox(app)();
  });

  document.addEventListener('mousedown', onClickOutside);
  reactDiv.addEventListener('click', () => {
      createIconClickHandler(app, reactIcon, MyReactWidget)();
  });
  notebook.addEventListener('click', () => {
    const tooltip = document.getElementById('my-tooltip');
    if (tooltip) {
      tooltip.remove();
    }
    showQuestionnaire(app)();
  });
  close.addEventListener('click', () => {
    const tooltip = document.getElementById('my-tooltip');
    if (tooltip) {
      tooltip.remove();
    }
    showChatBot(app)();
  });
}


export default extension;