import {Node, Program} from 'estree';
import {identifierToJs, literalToJs, programToJs, propertyToJs} from './generators';
import {
   arrayExpression,
   assignmentExpression,
   binaryExpression,
   callExpression,
   conditionalExpression,
   expressionStatement,
   functionExpression,
   functionExpressionTs,
   logicalExpression,
   memberExpression,
   newExpression,
   objectExpression,
   thisExpression,
   unaryExpression,
   updateExpression
} from './generators/expression';
import {blockStatement, forStatement, ifStatement, returnStatement} from './generators/statement';
import {
   functionDeclaration,
   functionDeclarationTs,
   variableDeclarationToJs,
   variableDeclarationToTs,
   variableDeclaratorToJs
} from './generators/declaration';
import {generateImports, isDefine} from '../mods/imports';
import {insertComments} from './generators/comments';
import {GeneratorOptions, GenOptions} from './generator-options';


let _options: GenOptions = new GenOptions();

export function setTranspilerOptions(options: GeneratorOptions): void {
   _options.setOptions(options);
}

export function getTranspilerOptions(): GenOptions {
   return _options;
}

export function generate(node: Node): string {
   let result;

   if (_options.getLanguage() === 'javascript') {
      result = getGenerateFunctionJs(node)(node);
   }
   else {
      const func = getGenerateFunctionTs(node);

      if (func) {
         result = func(node);
      }
      else {
         result = getGenerateFunctionJs(node)(node);
      }
   }

   return insertComments(result, node);
}

function getGenerateFunctionTs(node: Node): null | ((node: Node) => string) {
   switch (node.type) {
      case 'ExpressionStatement':
         if (isDefine(node)) {
            return generateImports;
         }
         return expressionStatement;

      case 'FunctionDeclaration':
         return functionDeclarationTs;
      case 'VariableDeclaration':
         return variableDeclarationToTs;

      case 'FunctionExpression':
         return functionExpressionTs;
      default:
         return null;
   }
}

function getGenerateFunctionJs(node: Node): (node: Node) => string {
   switch (node.type) {
      case 'Program':
         return programToJs;
      case 'Property':
         return propertyToJs;
      case 'Identifier':
         return identifierToJs;
      case 'Literal':
         return literalToJs;

      case 'VariableDeclaration':
         return variableDeclarationToJs;
      case 'VariableDeclarator':
         return variableDeclaratorToJs;
      case 'FunctionDeclaration':
         return functionDeclaration;

      case 'BinaryExpression':
         return binaryExpression;
      case 'CallExpression':
         return callExpression;
      case 'NewExpression':
         return newExpression;
      case 'ArrayExpression':
         return arrayExpression;
      case 'FunctionExpression':
         return functionExpression;
      case 'MemberExpression':
         return memberExpression;
      case 'ObjectExpression':
         return objectExpression;
      case 'ThisExpression':
         return thisExpression;
      case 'AssignmentExpression':
         return assignmentExpression;
      case 'LogicalExpression':
         return logicalExpression;
      case 'ConditionalExpression':
         return conditionalExpression;
      case 'UnaryExpression':
         return unaryExpression;
      case 'UpdateExpression':
         return updateExpression;

      case 'BlockStatement':
         return blockStatement;
      case 'ReturnStatement':
         return returnStatement;
      case 'ExpressionStatement':
         return expressionStatement;
      case 'IfStatement':
         return ifStatement;
      case 'ForStatement':
         return forStatement;

      default:
         throw new Error(node.type + ' not implemented!');
   }
}
