import { ReactWidget } from '@jupyterlab/ui-components';
import Questionnaire from './Questionnaire';
import { JupyterFrontEnd } from '@jupyterlab/application';

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
  const widget = new QuestionnaireWidget({ target });
  if (target === 'file') {
    widget.id = 'questionnaire-widget-main';
    app.shell.add(widget, 'main');
  } else {
    app.shell.add(widget, 'right');
  }
  app.shell.activateById(widget.id);
}

