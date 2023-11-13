import { ReactWidget } from '@jupyterlab/ui-components';
import Questionnaire from './Questionnaire';
import { JupyterFrontEnd } from '@jupyterlab/application';
import {LabIcon,reactIcon} from "@jupyterlab/ui-components";
import QuestionnaireDisplay from './QuestionnaireDisplay';

class QuestionnaireWidget extends ReactWidget {
  params:any;
  
  constructor(params:any) {
    super();
    this.params = params;
    this.id = 'questionnaire-widget';  // 确保每个 widget 实例都有一个唯一的 ID
    this.title.label = 'Questionnaire';  // 设置标题
    this.title.closable = true;  // 允许用户关闭此 widget
  }

  updateParams(params:any){
    this.params = params;
    this.update();
  }

  render() {
    return <Questionnaire userId={"test"} params={this.params}/>;
  }
}

export default QuestionnaireWidget;

export function showQuestionnaire(app: JupyterFrontEnd, target: 'file' | 'cell') {

  // when the type is cell, we need to get the cell id and pass it to the widget
  const user_type=localStorage.getItem('user_type');
  let widget;
  if(user_type==='teacher'){
    //@ts-ignore
    widget = new QuestionnaireDisplay({ target });
  }else{
    //@ts-ignore
    widget = new QuestionnaireWidget({ target });
  }
  

  if(target==='cell'){
    const existingWidget = Array.from(app.shell.widgets("right")).find((widget) =>
    (widget as any)?.id === 'questionnaire-widget-right'
    ) as any;
    if (existingWidget) {
      app.shell.activateById(existingWidget.id);
      return;
    }
  }else if(target==='file'){
    const existingWidget = Array.from(app.shell.widgets("main")).find((widget) =>
    (widget as any)?.id === 'questionnaire-widget-main'
    ) as any;
    if (existingWidget) {
      app.shell.activateById(existingWidget.id);
      return;
    }
  }



  widget.title.icon = reactIcon;
  if (target === 'file') {
    widget.id = 'questionnaire-widget-main';
    app.shell.add(widget, 'main');
  } else {
    widget.id = 'questionnaire-widget-right';
    app.shell.add(widget, 'right');
  }
  app.shell.activateById(widget.id);
}

