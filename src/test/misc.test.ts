import {checkTSOutput, matchOutput} from './shared';


describe('any insertion', () => {

   describe('empty array', () => {
      matchOutput('var a = [];');
      checkTSOutput('var a = [];', 'const a: any[] = [];');
   });

   describe('empty object', () => {
      checkTSOutput('var o = {};', 'const o: Record<string, any> = {};');
   });

   describe('empty array', () => {
      matchOutput('var a = null;');
      checkTSOutput('var a = null;', 'const a: any = null;');
   });

   describe('not inserted in for-in loop', () => {
      checkTSOutput('for (var a in array) {}', 'for (const a in array) {}');
   });

});
