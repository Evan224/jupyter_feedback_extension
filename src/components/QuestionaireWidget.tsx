import { ReactWidget } from '@jupyterlab/ui-components';
import Questionnaire from './Questionnaire';

class QuestionnaireWidget extends ReactWidget {
  params:any;
  
  constructor(params:any) {
    super();
    this.params = params;
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
