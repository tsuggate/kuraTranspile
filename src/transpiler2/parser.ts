import * as esprima from 'esprima';
import * as fs from 'fs';
import * as escodegen from 'escodegen';
import {Program, Node} from 'estree';

import {isDefine} from './mods/imports';
import {walk} from 'estree-walker';


export function parseAndLog(filePath: string): void {
   try {
      const code = fs.readFileSync(filePath).toString();

      if (code) {
         const res: Program = esprima.parse(code);

         traverse(res, (node) => {
            if (node.type === 'ExpressionStatement' && isDefine(node)) {

            }

            if (node.type === 'VariableDeclaration') {
               node.kind = 'const';
            }
         });

         const outCode = escodegen.generate(res);

         console.log(outCode);
      }
   }
   catch (e) {
      console.log(e);
   }
}

// Mutate program :(
function applyMods(program: Program): void {

}

type NodeCallback = (node: Node, state: any) => void;

export function traverse(program: Program, enter: NodeCallback, leave?: NodeCallback) {
   walk(program, {
      enter: enter,
      leave: leave
   });
}
