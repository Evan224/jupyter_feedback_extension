import { ReactWidget } from '@jupyterlab/ui-components';
import Questionnaire from './Questionnaire';

class QuestionnaireWidget extends ReactWidget {
  onSubmit: (answers: string[]) => void;

  constructor(onSubmit: (answers: string[]) => void) {
    super();
    this.onSubmit = onSubmit;
  }

  render() {
    return <Questionnaire userId={"test"} />;
  }
}

export default QuestionnaireWidget;
