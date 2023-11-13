import {
  JupyterFrontEnd,
  JupyterFrontEndPlugin,
} from '@jupyterlab/application';
import { INotebookModel, INotebookTracker} from '@jupyterlab/notebook';
import { EventTracker } from './utils/EventTracker';
import { checkAndSendUser } from './utils/initUser';
import { showTooltip, createOrActivateWidget} from './utils';
import { updateSidebarWidget } from './utils';
import { ToolbarButton } from '@jupyterlab/apputils';
import { showQuestionnaire } from './components/QuestionaireWidget';
import {addToolbarButton} from './utils';
import 'semantic-ui-css/semantic.min.css';
import {
  addIcon,
  closeIcon,
  notebookIcon,
  reactIcon,
} from "@jupyterlab/ui-components";

const WIDGET_IDS = {
  COMMENT_BOX: "comment-box-widget",
  QUESTIONNAIRE: "questionnaire-widget",
  CHATBOT: "chatbot-widget",
  MY_REACT: "my-react-widget",
};

const eventTracker = new EventTracker('http://localhost:3000/events');

const extension: JupyterFrontEndPlugin<void> = {
  id: 'my-extension',
  autoStart: true,
  requires: [INotebookTracker],
  activate: (app: JupyterFrontEnd, notebookTracker: INotebookTracker) => {
    //TODO: currently mannually set the userType
    localStorage.setItem('user_type', 'student');
    checkAndSendUser();
    addToolbarButton(app, notebookTracker);
    eventTracker.registerJupyterLabEventListeners(notebookTracker);
    
    document.addEventListener('mouseup', (event) => {
      const user_type = localStorage.getItem('user_type');
      if(user_type!=='student'){
        return;
      }
      const activeCell = notebookTracker.activeCell;
      if (!activeCell?.model){return}

      if(activeCell.model?.type==='code'&&!activeCell.node.contains(document.activeElement)){
        //当cell失去焦点，但是本身又存在的时候，tooltip消失
        const tooltip = document.getElementById('my-tooltip');
        if (tooltip) {
          tooltip.style.display = 'none';  // 隐藏tooltip而不是移除它
        }
        return;
      }
      if (activeCell.model?.type && activeCell.model?.type === 'code') {
        const codeMirrorEditor: any = activeCell?.editor;
        const selectedText = codeMirrorEditor?.getSelection();
        if (selectedText && (selectedText.start.line !== selectedText.end.line || selectedText.start.column !== selectedText.end.column)) {
          eventTracker.sendEvent('code-selection', {
            cellId: activeCell.model.id,
            selectedText: selectedText,
            currentListOrder:activeCell?.dataset?.windowedListIndex,
            currentPromptNumber: (activeCell as any).prompt,
          });
          showTooltip(event,app,notebookTracker);
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
          showTooltip(event,app,notebookTracker);
        }
      }
    });

    notebookTracker.activeCellChanged.connect(() => {
      const tooltip = document.getElementById('my-tooltip');
      if (tooltip) {
        tooltip.style.display = 'none';  // 隐藏tooltip而不是移除它
      }
    });

    notebookTracker.activeCellChanged.connect(() => {
      updateSidebarWidget(app, notebookTracker);
    });

    notebookTracker.activeCellChanged.connect(() => {
      const activeCell: any = notebookTracker.activeCell;
      if (!activeCell) {
        const button = document.getElementById('questionnaire-button-cell');
        if (button) {
          button.remove();
        }
        return;
      }
      // if already has a button, delete first
      let button:any;
      button = document.getElementById('questionnaire-button-cell');
      if (button) {
        button.remove();
      }
      button = document.createElement('button');
      button.className = 'my-button';
      button.innerText = 'questionnaire';
      button.id='questionnaire-button-cell';
      button.onclick = () => {
        // 显示问卷
        showQuestionnaire(app, 'cell');
      };

      activeCell.node.appendChild(button);
    });

    notebookTracker.activeCellChanged.connect(() => {
      const user_type = localStorage.getItem('user_type');
      if (user_type !== 'teacher') {
        return;
      }
    
      const activeCell = notebookTracker.activeCell;
      const existingButton = document.getElementById('custom-cell-button');
      const existingButton2 = document.getElementById('custom-cell-button-2'); // 第二个按钮的 ID
    
      // 如果已存在按钮，先移除
      if (existingButton) {
        existingButton.remove();
      }
      if (existingButton2) {
        existingButton2.remove();
      }
    
      if (activeCell) {
        // 创建第一个按钮
        const button1 = document.createElement('button');
        button1.id = 'custom-cell-button';
        button1.innerText = 'comment result';
        button1.className = 'jp-ToolbarButtonComponent minimal';
        button1.onclick = () => {
          createOrActivateWidget(notebookIcon, "comment-box-widget", app, notebookTracker);
        };
        activeCell.node.insertBefore(button1, activeCell.node.firstChild);
    
        // 创建第二个按钮
        const button2 = document.createElement('button');
        button2.id = 'custom-cell-button-2';
        button2.innerText = 'rating result';
        button2.className = 'jp-ToolbarButtonComponent minimal';
        button2.onclick = () => {
          createOrActivateWidget(notebookIcon,WIDGET_IDS.QUESTIONNAIRE, app, notebookTracker);
        };
        activeCell.node.insertBefore(button2, button1.nextSibling); // 将第二个按钮添加在第一个按钮之后
      }
    });
    
    

    // notebookTracker.activeCellChanged.connect(() => {
    //   const user_type = localStorage.getItem('user_type');
    //   if(user_type!=='teacher'){
    //     return;
    //   }
    //   console.log('active cell changed and user is teacher');
    //   const toolbar = notebookTracker?.currentWidget?.toolbar;
    //   if(!toolbar){
    //     console.log('no toolbar');
    //     return;
    //   }
    //   console.log('has toolbar',toolbar);
    //   const button = new ToolbarButton({
    //     icon: notebookIcon,
    //     onClick: () => {
    //       const activeCell = notebookTracker.activeCell;
    //       if (activeCell) {
    //         createOrActivateWidget(notebookIcon,"comment-box-widget",app,notebookTracker);
    //       }
    //     },
    //     tooltip: "查看信息",
    //   });
    //   toolbar?.addItem('comment-box-widget', button);
    // });

  
  },
};



export default extension;