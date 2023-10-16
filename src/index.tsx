import {
  JupyterFrontEnd,
  JupyterFrontEndPlugin,
} from '@jupyterlab/application';
import { INotebookTracker } from '@jupyterlab/notebook';
import { reactIcon, addIcon, closeIcon, notebookIcon } from '@jupyterlab/ui-components';
import { ReactWidget } from '@jupyterlab/apputils';

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
    const existingWidget = Array.from(app.shell.widgets()).find(widget => (widget as any)?.id === widgetId);

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
  },
};

function showTooltip(event: MouseEvent, codeMirrorEditor: any, cellType: string,app: JupyterFrontEnd) {
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
  // const contentDomRect = contentDom.getBoundingClientRect();

  if (cellType === 'code' || (cellType === 'markdown' && codeMirrorEditor?.editor)) {
    // const contentDom = codeMirrorEditor?.editor.dom;
    // const contentDomRect =codeMirrorEditor?.editor.contentDOM.getBoundingClientRect();
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
      tooltip.removeEventListener('blur', onBlur);
    }
  };

  const onBlur = () => {
    tooltip.remove();
    document.removeEventListener('mousedown', onClickOutside);
    tooltip.removeEventListener('blur', onBlur);
  };

  document.addEventListener('mousedown', onClickOutside);
  tooltip.addEventListener('blur', onBlur);
  reactDiv.addEventListener('click', () => {
    createIconClickHandler(app, reactIcon, MyReactWidget)();
  });
  
}

export default extension;