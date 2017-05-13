import * as React from 'React';
import Button from '../../components/button';
import './toolbar.less';
import {clickOpenJsFile, saveTypeScriptCode} from '../../global-actions';
import {getState, setViewMode} from '../state';


export default class Toolbar extends React.Component<{}, {}> {
   render() {
      return <div className="Toolbar">

         <div className="left">
            <Button onClick={clickOpenJsFile}>Open JavaScript File...</Button>
         </div>

         <div className="middle">
            <Button onClick={this.onClickCompareCode}
                    on={getState().viewMode === 'code'}
                    disabled={this.shouldDisableViewCode()} >View Code</Button>

            <Button onClick={this.onClickShowLog} on={getState().viewMode === 'log'} >View Log</Button>
         </div>

         <div className="right">
            <Button onClick={this.onClickSave}
                    disabled={this.shouldDisableApplyChanges()}
                    moreClasses="applyButton">Apply Changes</Button>

            <Button onClick={() => {}} moreClasses="infoButton">🛈</Button>
         </div>

      </div>;
   }

   shouldDisableViewCode = () => {
      return !getState().javascriptFile;
   };

   shouldDisableApplyChanges = () => {
      return !getState().codeGenSucceeded || !getState().javascriptFile;
   };

   onClickShowLog = () => {
      setViewMode('log');
   };

   onClickCompareCode = () => {
      setViewMode('code');
   };

   onClickSave = () => {
      console.log('save');

      saveTypeScriptCode();
   };
}
